import React from 'react';
import type { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProject: string;
  onSelect: (id: string) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProject,
  onSelect,
  onAddProject,
  onEditProject,
  onDeleteProject,
}) => {
  return (
    <div className="w-64 bg-white border-r p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          onClick={onAddProject}
          className="text-indigo-600 font-bold hover:text-indigo-800"
        >
          +
        </button>
      </div>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              selectedProject === project.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
            }`}
          >
            <span
              className="flex-1"
              onClick={() => onSelect(project.id)}
            >
              {project.name}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => onEditProject(project)}
                className="text-sm text-gray-500 hover:text-indigo-600"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="text-sm text-gray-500 hover:text-red-600"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
