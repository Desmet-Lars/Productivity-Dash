'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#fafafa] dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-200">
        <AuthProvider>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}
