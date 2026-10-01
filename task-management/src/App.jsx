import { useState } from 'react';
import { useTasks } from './context/TaskContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Board from './components/Board.jsx';
import TaskModal from './components/TaskModal.jsx';
import ActivityLog from './components/ActivityLog.jsx';
import ReminderBar from './components/ReminderBar.jsx';

export default function App() {
  const { state, dispatch } = useTasks();
  const project = state.projects.find((p) => p.id === state.activeProjectId);
  const [modal, setModal] = useState(null); // { task } when open
  const [member, setMember] = useState('');

  const addMember = (e) => {
    e.preventDefault();
    if (!member.trim()) return;
    dispatch({ type: 'ADD_MEMBER', projectId: project.id, name: member.trim() });
    setMember('');
  };

  const removeProject = () => {
    if (window.confirm(`Delete "${project.name}" and all its tasks?`))
      dispatch({ type: 'DELETE_PROJECT', id: project.id });
  };

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        {!project ? (
          <p className="text-steel">Create your first project from the sidebar to get started.</p>
        ) : (
          <>
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">{project.name}</h2>
                <p className="text-sm text-steel">
                  Team: {project.members.length ? project.members.join(', ') : 'no members yet'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={addMember} className="flex gap-2">
                  <input className="field !w-40" placeholder="Add member" value={member} onChange={(e) => setMember(e.target.value)} />
                  <button className="btn-ghost" type="submit">Add</button>
                </form>
                <button className="btn-primary" onClick={() => setModal({ task: null })}>New task</button>
                <button className="btn-ghost" onClick={removeProject}>Delete project</button>
              </div>
            </header>

            <ReminderBar projectId={project.id} />

            <div className="grid gap-4 xl:grid-cols-[1fr_18rem]">
              <Board project={project} onEdit={(task) => setModal({ task })} />
              <ActivityLog projectId={project.id} />
            </div>

            {modal && (
              <TaskModal project={project} task={modal.task} onClose={() => setModal(null)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
