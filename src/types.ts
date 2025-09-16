export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'todo' | 'inprogress' | 'done';
}
