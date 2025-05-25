//client/app/create/page.tsx
'use client';

import { SocketProvider } from '../context/SocketContext';
import CreatePollForm from './CreatePollForm';

export default function CreatePage() {
  return (
    <SocketProvider>
      <CreatePollForm />
    </SocketProvider>
  );
}
