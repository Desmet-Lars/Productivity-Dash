'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
