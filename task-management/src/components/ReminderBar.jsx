import { useTasks } from '../context/TaskContext.jsx';
import { daysUntil } from '../utils/helpers.js';

export default function ReminderBar({ projectId }) {
  const { state } = useTasks();

  const due = state.tasks
    .filter((t) => t.projectId === projectId && t.reminder && t.status !== 'done' && t.deadline)
    .map((t) => ({ ...t, days: daysUntil(t.deadline) }))
    .filter((t) => t.days <= 2)
    .sort((a, b) => a.days - b.days);

  if (!due.length) return null;

  return (
    <div role="status" className="mb-4 rounded-md border border-signal/40 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-medium">Reminders</p>
      <ul className="mt-1 space-y-0.5">
        {due.map((t) => (
          <li key={t.id}>
            <span className="font-medium">{t.title}</span>{' '}
            {t.days < 0 ? (
              <span className="text-alert">is overdue by {Math.abs(t.days)} day(s)</span>
            ) : t.days === 0 ? (
              <span className="text-alert">is due today</span>
            ) : (
              <span>is due in {t.days} day(s)</span>
            )}
            {t.assignee && <span className="text-steel"> ({t.assignee})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
