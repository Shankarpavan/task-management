import { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { STAGES } from '../utils/helpers.js';
import TaskCard from './TaskCard.jsx';

export default function Board({ project, onEdit }) {
  const { state, dispatch } = useTasks();
  const [overStage, setOverStage] = useState(null);
  const [assignee, setAssignee] = useState('');

  const tasks = state.tasks.filter(
    (t) => t.projectId === project.id && (!assignee || t.assignee === assignee)
  );

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) dispatch({ type: 'MOVE_TASK', id, status: stage });
    setOverStage(null);
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="filter" className="text-sm text-steel">Show tasks of</label>
        <select id="filter" value={assignee} onChange={(e) => setAssignee(e.target.value)}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">
          <option value="">Everyone</option>
          {project.members.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const items = tasks.filter((t) => t.status === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
              onDragLeave={() => setOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`min-h-[12rem] rounded-lg p-3 transition-colors ${
                overStage === stage.id ? 'bg-teal-soft' : 'bg-slate-200/60'
              }`}
            >
              <h2 className="mb-3 flex items-center justify-between font-display text-sm font-bold">
                {stage.label}
                <span className="rounded-full bg-white px-2 text-xs font-medium text-steel">{items.length}</span>
              </h2>
              <div className="space-y-3">
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={onEdit} />
                ))}
                {items.length === 0 && <p className="text-xs text-steel">Drop a task here.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
