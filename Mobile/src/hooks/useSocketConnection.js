import socketService from '../services/socketService';
import { useEffect } from 'react';

const useSocketConnection = () => {
  useEffect(() => {
    const initSocket = async () => {
      try {
        console.log('🔌 Initializing socket connection...');
        await socketService.connect();
        console.log('✅ Socket connection initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize socket connection:', error);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection...');
      socketService.disconnect();
    };
  }, []);

  return socketService;
};

export default useSocketConnection;
