// client/app/components/SocketContext.tsx
'use client'; // Required by Next.js App Router to enable client-side features

import React, {
  createContext,   // To create a React context
  useContext,      // To consume the context
  useEffect,       // To run code when the component mounts/unmounts
  useState,        // To manage internal state
  ReactNode        // Type for children passed to the context provider
} from 'react';

import io, { Socket } from 'socket.io-client'; // Import Socket.IO client

// Define what our context will share with other components
interface SocketContextType {
  socket: Socket | null;       // The socket instance (or null if not connected)
  isConnected: boolean;        // Whether the socket is connected
  error: string | null;        // Any connection error message
}

// Create the Socket context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

// Custom hook to easily use the context in any component
export const useSocket = () => useContext(SocketContext);

// Context provider that wraps around your app and provides the socket connection
export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to hold the socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  // State to track if we're connected to the server
  const [isConnected, setIsConnected] = useState(false);

  // State to store connection errors (if any)
  const [error, setError] = useState<string | null>(null);

  // useEffect runs once when the component is mounted
  useEffect(() => {
    // Create the socket instance and connect to the server
    // Uses env var for flexibility; defaults to localhost
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket'], // Force WebSocket transport
      }
    );

    // Store the socket instance in state
    setSocket(socketInstance);

    // Set initial connection status
    setIsConnected(socketInstance.connected);

    // When connected successfully
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null); // Clear previous errors
      console.log('🔌 Socket connected');
    });

    // When disconnected from the server
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('⚡ Socket disconnected');
    });

    // When there’s an error trying to connect
    socketInstance.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setError('Failed to connect to server.');
    });

    // Cleanup: disconnect the socket when the component is unmounted
    return () => {
      socketInstance.disconnect();
    };
  }, []); // empty dependency array means this only runs once on mount

  // Provide the socket, connection status, and error to the rest of the app
  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};


