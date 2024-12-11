'use client';
import { useState } from 'react';

const QuickActions = ({ onNewTask, onNewNote, onNewEvent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'New Task',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: onNewTask,
      bgColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'New Note',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onNewNote,
      bgColor: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'New Event',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: onNewEvent,
      bgColor: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Quick action buttons */}
        <div className={`absolute bottom-full right-0 mb-4 space-y-3 transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg transition-all duration-200 ${action.bgColor}
                transform hover:scale-105 hover:-translate-y-1
                ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Main action button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full bg-primary-500 text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl
            transform hover:scale-105 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
