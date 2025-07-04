
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";

let globalRoleCache: { [userId: string]: UserRole } = {};
let fetchingUsers = new Set<string>();

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("Gebruiker");
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !session) {
        console.log("No user or session, setting role to Gebruiker");
        setCurrentRole("Gebruiker");
        setLoading(false);
        hasInitialized.current = false;
        return;
      }

      // Check cache first
      if (globalRoleCache[user.id]) {
        console.log("Using cached role:", globalRoleCache[user.id]);
        setCurrentRole(globalRoleCache[user.id]);
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous fetches for the same user
      if (fetchingUsers.has(user.id)) {
        console.log("Already fetching role for user:", user.id);
        return;
      }

      fetchingUsers.add(user.id);

      try {
        console.log("Fetching role for user:", user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          
          // If it's a row not found error, try to create the profile
          if (error.code === 'PGRST116') {
            console.log("Profile not found, creating new profile...");
            
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                role: 'ICT Admin' // Default role
              })
              .select('role')
              .single();
            
            if (insertError) {
              console.error("Failed to create profile:", insertError);
              setCurrentRole("Gebruiker");
              globalRoleCache[user.id] = "Gebruiker";
            } else {
              console.log("Profile created successfully, role:", insertData.role);
              const newRole = insertData.role as UserRole;
              setCurrentRole(newRole);
              globalRoleCache[user.id] = newRole;
            }
          } else {
            // For other errors, default to Gebruiker
            setCurrentRole("Gebruiker");
            globalRoleCache[user.id] = "Gebruiker";
          }
        } else if (profile) {
          console.log("User role fetched:", profile.role);
          const fetchedRole = profile.role as UserRole;
          setCurrentRole(fetchedRole);
          globalRoleCache[user.id] = fetchedRole;
        } else {
          console.log("No profile found, defaulting to Gebruiker");
          setCurrentRole("Gebruiker");
          globalRoleCache[user.id] = "Gebruiker";
        }
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
        setCurrentRole("Gebruiker");
        globalRoleCache[user.id] = "Gebruiker";
      } finally {
        fetchingUsers.delete(user.id);
        setLoading(false);
      }
    };

    // Only fetch if we haven't initialized for this user session
    if (!hasInitialized.current && user?.id) {
      hasInitialized.current = true;
      fetchUserRole();
    } else if (!user) {
      // Reset when user logs out
      hasInitialized.current = false;
      setCurrentRole("Gebruiker");
      setLoading(false);
    }
  }, [user?.id, session?.access_token]); // Stable dependencies

  const rolePermissions = {
    currentRole,
    loading,
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker",
    canManageUsers: currentRole === "ICT Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  };

  console.log("useUserRole returning:", rolePermissions);

  return rolePermissions;
};
