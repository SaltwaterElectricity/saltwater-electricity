import { createContext, useContext } from "react";
import { appError } from "../utils/appError";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new appError("useAuth must be used within an AuthProvider", false, "auth/context-missing");
  return context;
};
