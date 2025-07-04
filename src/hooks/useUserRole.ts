
import { useState, useEffect } from "react";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("ICT Admin");

  // In a real app, this would fetch the user's role from the backend
  useEffect(() => {
    // For now, we'll use localStorage to persist the selected role during simulation
    const savedRole = localStorage.getItem("simulatedUserRole") as UserRole;
    if (savedRole) {
      setCurrentRole(savedRole);
    }
  }, []);

  const changeRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem("simulatedUserRole", newRole);
  };

  return {
    currentRole,
    changeRole,
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker",
    canManageUsers: currentRole === "ICT Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  };
};
