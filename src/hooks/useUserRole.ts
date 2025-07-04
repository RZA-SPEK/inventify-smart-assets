
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("Gebruiker");
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !session) {
        setCurrentRole("Gebruiker");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching role for user:", user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setCurrentRole("Gebruiker");
        } else if (profile) {
          console.log("User role fetched:", profile.role);
          setCurrentRole(profile.role as UserRole);
        } else {
          console.log("No profile found, defaulting to Gebruiker");
          setCurrentRole("Gebruiker");
        }
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
        setCurrentRole("Gebruiker");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, session]);

  const changeRole = (newRole: UserRole) => {
    // This function should be removed in production as roles should be managed by admins
    console.warn("Role changing is disabled in production");
    // For development/testing only - this won't work with real auth
    setCurrentRole(newRole);
  };

  return {
    currentRole,
    changeRole,
    loading,
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker",
    canManageUsers: currentRole === "ICT Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  };
};
