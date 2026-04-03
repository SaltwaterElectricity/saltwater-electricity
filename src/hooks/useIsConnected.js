import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
// Import the singleton DB instance from your new config file
import { db } from '../services/firebaseConfig';

/**
 * HOOK: useIsConnected
 * Listens to the internal Firebase connection state.
 * Targets the special '.info/connected' path.
 */
export const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // We use the imported 'db' instead of calling getDatabase() locally
    const connectedRef = ref(db, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snap) => {
      const status = snap.val() === true;
      setIsConnected(status);
      
      if (!status) {
        console.warn("📡 System: Firebase connection lost.");
      }
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};