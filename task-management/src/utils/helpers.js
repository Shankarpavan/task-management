export const STAGES = [
  { id: 'todo', label: 'To do' },
  { id: 'progress', label: 'In progress' },
  { id: 'review', label: 'In review' },
  { id: 'done', label: 'Done' },
];

export const PRIORITIES = ['Low', 'Medium', 'High'];

export const uid = () => Math.random().toString(36).slice(2, 10);

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Whole days from today until the deadline (negative = overdue).
export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = startOfDay(dateStr) - startOfDay(new Date());
  return Math.round(diff / 86400000);
};

export const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'No deadline';

export const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
};

export const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label ?? id;
