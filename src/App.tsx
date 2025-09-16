import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import Auth from './components/Auth';
import type { Project, Task } from './types';
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  // realtime projects per user
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) } as Project)
      );
      setProjects(loaded);
      if (loaded.length > 0 && !selectedProject) {
        setSelectedProject(loaded[0].id);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // realtime tasks for selected project
  useEffect(() => {
    if (!selectedProject || !user) return;
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', selectedProject),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) } as Task)
      );
      setTasks(loaded);
    });
    return () => unsubscribe();
  }, [selectedProject, user]);

  // save project
  const handleSaveProject = async (data: Omit<Project, 'id'>) => {
    if (!user) return;
    if (editingProject) {
      await updateDoc(doc(db, 'projects', editingProject.id), {
        name: data.name,
      });
      setEditingProject(null);
    } else {
      await addDoc(collection(db, 'projects'), {
        name: data.name,
        userId: user.uid,
      });
    }
  };

  // save task
  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user) return;
    if (editingTask) {
      await updateDoc(doc(db, 'tasks', editingTask.id), {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
      });
      setEditingTask(null);
    } else {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: user.uid,
      });
    }
  };

  // toggle task status
  const toggleStatus = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const newStatus = t.status === 'done' ? 'todo' : 'done';
    await updateDoc(doc(db, 'tasks', id), { status: newStatus });
  };

  // edit task
  const editTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditingTask(t);
    setShowTaskModal(true);
  };

  // delete task
  const deleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  // edit project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  // auto-patch + delete project
  const handleDeleteProject = async (id: string) => {
    if (!user) return;
    if (!confirm('Delete this project and ALL of its tasks?')) return;

    const projectRef = doc(db, 'projects', id);
    const projSnap = await getDoc(projectRef);

    if (projSnap.exists()) {
      const projData = projSnap.data() as any;
      // patch if missing or wrong userId
      if (projData.userId !== user.uid) {
        await updateDoc(projectRef, { userId: user.uid });
      }
    }

    // patch tasks if needed
    const tasksQ = query(collection(db, 'tasks'), where('projectId', '==', id));
    const tasksSnap = await getDocs(tasksQ);
    for (const t of tasksSnap.docs) {
      const tData = t.data() as any;
      if (tData.userId !== user.uid) {
        await updateDoc(doc(db, 'tasks', t.id), { userId: user.uid });
      }
    }

    // now batch delete
    const batch = writeBatch(db);
    tasksSnap.forEach((t) => batch.delete(doc(db, 'tasks', t.id)));
    batch.delete(projectRef);
    await batch.commit();

    if (selectedProject === id) {
      setSelectedProject('');
    }
  };

  // if no user signed in show Auth
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
        onAddProject={() => {
          setEditingProject(null);
          setShowProjectModal(true);
        }}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-3xl font-bold text-indigo-700">TaskForge</h1>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (projects.length === 0) return;
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              className={`px-3 py-2 rounded ${
                projects.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              disabled={projects.length === 0}
            >
              + New Task
            </button>

            <button
              onClick={() => signOut(auth)}
              className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Log out
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Add a project first before adding tasks.
            </p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggleStatus={toggleStatus}
            onEdit={editTask}
            onDelete={deleteTask}
          />
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        initial={editingTask || undefined}
        projectId={selectedProject}
      />

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={handleSaveProject}
        initial={editingProject || undefined}
      />
    </div>
  );
}

export default App;
