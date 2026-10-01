import { createContext, useContext, useEffect, useReducer } from 'react';
import { uid, stageLabel } from '../utils/helpers.js';

const STORAGE_KEY = 'taskflow-state-v1';
const TaskContext = createContext(null);

const seed = () => {
  const projectId = uid();
  const inDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return {
    activeProjectId: projectId,
    projects: [{ id: projectId, name: 'Website Redesign', members: ['Asha', 'Ravi', 'Meera'] }],
    tasks: [
      {
        id: uid(), projectId, title: 'Collect brand assets', description: 'Logos, fonts and colour codes.',
        assignee: 'Asha', deadline: inDays(1), priority: 'Medium', status: 'todo', reminder: true,
        subtasks: [
          { id: uid(), title: 'Request logo files', done: true },
          { id: uid(), title: 'Confirm fonts', done: false },
        ],
      },
      {
        id: uid(), projectId, title: 'Design home page wireframe', description: 'Mobile and desktop layouts.',
        assignee: 'Meera', deadline: inDays(4), priority: 'High', status: 'progress', reminder: true, subtasks: [],
      },
    ],
    activity: [{ id: uid(), projectId, text: 'Project "Website Redesign" created', at: new Date().toISOString() }],
  };
};

const load = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    /* ignore corrupted storage */
  }
  return seed();
};

const log = (state, projectId, text) => ({
  ...state,
  activity: [{ id: uid(), projectId, text, at: new Date().toISOString() }, ...state.activity].slice(0, 200),
});

const patchTask = (state, id, fn) => ({
  ...state,
  tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)),
});

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PROJECT': {
      const project = { id: uid(), name: action.name, members: action.members };
      return log(
        { ...state, projects: [...state.projects, project], activeProjectId: project.id },
        project.id,
        `Project "${project.name}" created`
      );
    }
    case 'SELECT_PROJECT':
      return { ...state, activeProjectId: action.id };
    case 'DELETE_PROJECT': {
      const projects = state.projects.filter((p) => p.id !== action.id);
      return {
        ...state,
        projects,
        tasks: state.tasks.filter((t) => t.projectId !== action.id),
        activity: state.activity.filter((a) => a.projectId !== action.id),
        activeProjectId: projects[0]?.id ?? null,
      };
    }
    case 'ADD_MEMBER':
      return log(
        {
          ...state,
          projects: state.projects.map((p) =>
            p.id === action.projectId && !p.members.includes(action.name)
              ? { ...p, members: [...p.members, action.name] }
              : p
          ),
        },
        action.projectId,
        `${action.name} joined the project`
      );
    case 'ADD_TASK': {
      const task = { id: uid(), status: 'todo', ...action.task };
      return log(
        { ...state, tasks: [...state.tasks, task] },
        task.projectId,
        `Task "${task.title}" created${task.assignee ? ` and assigned to ${task.assignee}` : ''}`
      );
    }
    case 'UPDATE_TASK': {
      const old = state.tasks.find((t) => t.id === action.id);
      const c = action.changes;
      let next = patchTask(state, action.id, (t) => ({ ...t, ...c }));
      if (c.assignee !== undefined && c.assignee !== old.assignee)
        next = log(next, old.projectId, `"${old.title}" assigned to ${c.assignee || 'nobody'}`);
      if (c.deadline !== undefined && c.deadline !== old.deadline)
        next = log(next, old.projectId, `Deadline of "${old.title}" set to ${c.deadline || 'none'}`);
      return log(next, old.projectId, `Task "${c.title ?? old.title}" updated`);
    }
    case 'MOVE_TASK': {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task || task.status === action.status) return state;
      return log(
        patchTask(state, action.id, (t) => ({ ...t, status: action.status })),
        task.projectId,
        `"${task.title}" moved from ${stageLabel(task.status)} to ${stageLabel(action.status)}`
      );
    }
    case 'TOGGLE_SUBTASK': {
      const task = state.tasks.find((t) => t.id === action.taskId);
      const sub = task.subtasks.find((s) => s.id === action.subId);
      return log(
        patchTask(state, action.taskId, (t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === action.subId ? { ...s, done: !s.done } : s)),
        })),
        task.projectId,
        `Subtask "${sub.title}" ${sub.done ? 'reopened' : 'completed'}`
      );
    }
    case 'DELETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.id);
      return log(
        { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) },
        task.projectId,
        `Task "${task.title}" deleted`
      );
    }
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return <TaskContext.Provider value={{ state, dispatch }}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);
