// client/app/components/ClientLayout.tsx
'use client';

import React from 'react';
import { SocketProvider } from '../context/SocketContext';
import Navbar from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <main role="main" className="min-h-screen bg-gray-50">
        <Navbar />
        {children}
      </main>
    </SocketProvider>
  );
}
