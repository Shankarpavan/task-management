import { useTasks } from '../context/TaskContext.jsx';
import { STAGES, daysUntil, formatDate } from '../utils/helpers.js';

const priorityStyle = {
  High: 'bg-orange-100 text-alert',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-teal-soft text-teal-dark',
};

export default function TaskCard({ task, onEdit }) {
  const { dispatch } = useTasks();
  const days = daysUntil(task.deadline);
  const overdue = task.status !== 'done' && days !== null && days < 0;
  const doneCount = task.subtasks.filter((s) => s.done).length;

  return (
    <article
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${priorityStyle[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="mt-1 text-xs text-steel">{task.description}</p>}

      {task.subtasks.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-steel">
            Subtasks {doneCount}/{task.subtasks.length}
          </p>
          <ul className="mt-1 space-y-1">
            {task.subtasks.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', taskId: task.id, subId: s.id })}
                  />
                  <span className={s.done ? 'text-steel line-through' : ''}>{s.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={overdue ? 'font-medium text-alert' : 'text-steel'}>
          {overdue ? 'Overdue: ' : 'Due '}
          {formatDate(task.deadline)}
        </span>
        {task.assignee && (
          <span className="rounded-full bg-teal px-2 py-0.5 text-white" title="Assigned to">
            {task.assignee}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="sr-only" htmlFor={`move-${task.id}`}>Move task to stage</label>
        <select
          id={`move-${task.id}`}
          value={task.status}
          onChange={(e) => dispatch({ type: 'MOVE_TASK', id: task.id, status: e.target.value })}
          className="flex-1 rounded border border-slate-300 bg-white px-1.5 py-1 text-xs"
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => onEdit(task)}>Edit</button>
      </div>
    </article>
  );
}
