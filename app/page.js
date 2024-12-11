'use client';
import { useState, useRef } from 'react';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/Calendar';
import Notes from '@/components/Notes';
import AuthGuard from '@/components/AuthGuard';
import QuickActions from '@/components/QuickActions';
import Confetti from '@/components/Confetti';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'tasks', x: 0, y: 0, w: 8, h: 6 },
    { i: 'notes', x: 0, y: 6, w: 8, h: 6 },
    { i: 'calendar', x: 8, y: 0, w: 4, h: 12 },
  ],
  md: [
    { i: 'tasks', x: 0, y: 0, w: 8, h: 6 },
    { i: 'notes', x: 0, y: 6, w: 8, h: 6 },
    { i: 'calendar', x: 8, y: 0, w: 4, h: 12 },
  ],
  sm: [
    { i: 'tasks', x: 0, y: 0, w: 12, h: 6 },
    { i: 'notes', x: 0, y: 6, w: 12, h: 6 },
    { i: 'calendar', x: 0, y: 12, w: 12, h: 8 },
  ],
  xs: [
    { i: 'tasks', x: 0, y: 0, w: 1, h: 8 },
    { i: 'notes', x: 0, y: 8, w: 1, h: 8 },
    { i: 'calendar', x: 0, y: 16, w: 1, h: 10 },
  ],
};

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            Productivity Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Welcome back, {user?.email?.split('@')[0]}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-dark-card rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-dark-card rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [showConfetti, setShowConfetti] = useState(false);
  const taskListRef = useRef(null);
  const notesRef = useRef(null);
  const calendarRef = useRef(null);

  const handleTaskComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleQuickAction = (type) => {
    switch (type) {
      case 'task':
        taskListRef.current?.focusInput?.();
        break;
      case 'note':
        notesRef.current?.createNew?.();
        break;
      case 'event':
        calendarRef.current?.openEventModal?.();
        break;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fafafa] dark:bg-dark-bg transition-colors duration-200 pb-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <Header />
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Tasks Section */}
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Today's Tasks</h2>
                </div>
                <div className="p-4">
                  <TaskList ref={taskListRef} onTaskComplete={handleTaskComplete} />
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Quick Notes</h2>
                </div>
                <Notes ref={notesRef} />
              </div>
            </div>

            {/* Calendar Section */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border sticky top-6">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Calendar</h2>
                </div>
                <div className="p-4">
                  <CalendarView ref={calendarRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuickActions
          onNewTask={() => handleQuickAction('task')}
          onNewNote={() => handleQuickAction('note')}
          onNewEvent={() => handleQuickAction('event')}
        />
        <Confetti active={showConfetti} />
      </div>
    </AuthGuard>
  );
}
