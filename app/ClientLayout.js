'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AuthProvider>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </AuthProvider>
    </div>
  );
}
