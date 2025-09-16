import React, { useState, useMemo } from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  // filter: all | todo | done
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  // sort: due date asc/desc
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredSortedTasks = useMemo(() => {
    let result = tasks;

    // Filter by status
    if (filter !== 'all') {
      result = result.filter((t) => t.status === filter);
    }

    // Sort by dueDate (if present)
    result = [...result].sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });

    return result;
  }, [tasks, filter, sortOrder]);

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      {/* Filter & Sort controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={`px-3 py-1 rounded ${
              filter === 'todo'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            To-Do
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-1 rounded ${
              filter === 'done'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Done
          </button>
        </div>

        <select
          className="border rounded px-2 py-1"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value as 'asc' | 'desc')
          }
        >
          <option value="asc">Due date ↑</option>
          <option value="desc">Due date ↓</option>
        </select>
      </div>

      {/* Tasks */}
      <ul className="space-y-3">
        {filteredSortedTasks.map((task) => (
          <li
            key={task.id}
            className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h3
                className={`font-semibold ${
                  task.status === 'done' ? 'line-through text-gray-400' : ''
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
              {task.dueDate && (
                <p className="text-xs text-gray-400">
                  Due: {task.dueDate}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onToggleStatus(task.id)}
                className={`px-2 py-1 rounded text-sm ${
                  task.status === 'done'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}
              >
                {task.status === 'done' ? 'Mark To-Do' : 'Mark Done'}
              </button>
              <button
                onClick={() => onEdit(task.id)}
                className="px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-2 py-1 rounded text-sm bg-red-200 text-red-800 hover:bg-red-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {filteredSortedTasks.length === 0 && (
          <li className="text-gray-500 text-sm">No tasks found.</li>
        )}
      </ul>
    </div>
  );
};

export default TaskList;
