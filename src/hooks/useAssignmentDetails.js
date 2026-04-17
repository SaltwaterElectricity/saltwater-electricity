import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; 
import { ref, onValue } from 'firebase/database';

/**
 * useAssignmentDetails Hook (Production-Ready)
 * Naka-optimize gamit ang Functional Updates at Mounted Flags.
 */
export const useAssignmentDetails = (deviceId) => {
  const [details, setDetails] = useState({
    fullName: "Loading...",
    address: "Loading...",
    assignedAt: null,
    loading: true
  });

  useEffect(() => {
    let isMounted = true; 

    if (!deviceId) {
      setDetails(prev => ({ 
        ...prev, 
        loading: false, 
        fullName: "N/A",
        address: "N/A"
      }));
      return;
    }

    setDetails(prev => ({ ...prev, loading: true }));

    const assignmentRef = ref(db, `device_assignments/${deviceId}`);
    
    const unsubscribeAssignment = onValue(assignmentRef, (snapshot) => {
      const assignmentData = snapshot.val();
      
      if (assignmentData?.userId) {
        const userRef = ref(db, `users/${assignmentData.userId}`);
        
        onValue(userRef, (userSnapshot) => {
          if (!isMounted) return;

          const userData = userSnapshot.val();
          if (userData) {
            // APPLYING FUNCTIONAL UPDATE PATTERN
            setDetails(prev => ({
              ...prev,
              fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "Unnamed User",
              address: userData.address || "No Address Provided",
              assignedAt: assignmentData.assignedAt,
              loading: false
            }));
          } else {
            setDetails(prev => ({ 
              ...prev, 
              fullName: "User Not Found", 
              loading: false 
            }));
          }
        }, { onlyOnce: true });

      } else {
        if (isMounted) {
          setDetails(prev => ({ 
            ...prev,
            fullName: "Not Assigned", 
            address: "N/A", 
            assignedAt: null, 
            loading: false 
          }));
        }
      }
    }, (error) => {
      console.error("Firebase Fetch Error:", error);
      if (isMounted) {
        setDetails(prev => ({ 
          ...prev, 
          loading: false, 
          fullName: "Error Loading" 
        }));
      }
    });

    return () => {
      isMounted = false; 
      unsubscribeAssignment();
    };
  }, [deviceId]);

  return details;
};