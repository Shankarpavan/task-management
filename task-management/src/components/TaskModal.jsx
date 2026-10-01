import { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { PRIORITIES, uid } from '../utils/helpers.js';

export default function TaskModal({ project, task, onClose }) {
  const { dispatch } = useTasks();
  const editing = Boolean(task);

  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    assignee: task?.assignee ?? '',
    deadline: task?.deadline ?? '',
    priority: task?.priority ?? 'Medium',
    reminder: task?.reminder ?? true,
    subtasks: task?.subtasks ?? [],
  });
  const [subTitle, setSubTitle] = useState('');

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const addSub = () => {
    if (!subTitle.trim()) return;
    setForm({ ...form, subtasks: [...form.subtasks, { id: uid(), title: subTitle.trim(), done: false }] });
    setSubTitle('');
  };

  const removeSub = (id) => setForm({ ...form, subtasks: form.subtasks.filter((s) => s.id !== id) });

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, title: form.title.trim() };
    if (editing) dispatch({ type: 'UPDATE_TASK', id: task.id, changes: data });
    else dispatch({ type: 'ADD_TASK', task: { ...data, projectId: project.id } });
    onClose();
  };

  const remove = () => {
    dispatch({ type: 'DELETE_TASK', id: task.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <h2 className="font-display text-lg font-bold">{editing ? 'Edit task' : 'New task'}</h2>

        <label className="block text-sm">Title
          <input className="field mt-1" value={form.title} onChange={set('title')} required autoFocus />
        </label>

        <label className="block text-sm">Description
          <textarea className="field mt-1" rows={2} value={form.description} onChange={set('description')} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Assign to
            <select className="field mt-1" value={form.assignee} onChange={set('assignee')}>
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">Deadline
            <input type="date" className="field mt-1" value={form.deadline} onChange={set('deadline')} />
          </label>
          <label className="block text-sm">Priority
            <select className="field mt-1" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.reminder} onChange={set('reminder')} />
            Remind me before the deadline
          </label>
        </div>

        <fieldset>
          <legend className="text-sm">Subtasks</legend>
          <ul className="mt-1 space-y-1">
            {form.subtasks.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm">
                {s.title}
                <button type="button" className="text-xs text-alert" onClick={() => removeSub(s.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input
              className="field" placeholder="Add a subtask" value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
            />
            <button type="button" className="btn-ghost" onClick={addSub}>Add</button>
          </div>
        </fieldset>

        <div className="flex items-center justify-between pt-2">
          {editing ? (
            <button type="button" className="text-sm text-alert" onClick={remove}>Delete task</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save changes' : 'Create task'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
