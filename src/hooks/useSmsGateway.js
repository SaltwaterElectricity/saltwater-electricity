import { useEffect } from "react";
import { smsGateway } from "../services/smsGateway.service";

/**
 * useSmsGateway Hook
 * 
 * Activates the private Android SMS Gateway listener if the user is logged in
 * and the app is running in a mobile (Cordova) environment.
 */
export const useSmsGateway = (userId) => {
  useEffect(() => {
    // Only initialize if we have a valid userId
    if (userId) {
      smsGateway.init(userId);
    }

    return () => {
      smsGateway.stop();
    };
  }, [userId]);
};
