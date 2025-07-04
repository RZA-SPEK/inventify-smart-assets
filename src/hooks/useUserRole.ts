
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";

// Global cache to prevent duplicate fetches
const roleCache = new Map<string, UserRole>();
const activeFetches = new Set<string>();

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("Gebruiker");
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      // If no user or session, set default and stop loading
      if (!user || !session) {
        setCurrentRole("Gebruiker");
        setLoading(false);
        return;
      }

      // Check cache first
      if (roleCache.has(user.id)) {
        const cachedRole = roleCache.get(user.id)!;
        setCurrentRole(cachedRole);
        setLoading(false);
        return;
      }

      // Prevent duplicate fetches
      if (activeFetches.has(user.id)) {
        return;
      }

      activeFetches.add(user.id);
      
      try {
        console.log("Fetching role for user:", user.id);
        
        // Try to fetch user role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.log("Error fetching profile:", error.message);
          // If there's an error, try to create a profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'ICT Admin' // Default to ICT Admin for new profiles
            });

          if (insertError) {
            console.log("Failed to create profile:", insertError.message);
          } else {
            console.log("Profile created successfully");
          }
          
          setCurrentRole("ICT Admin");
          roleCache.set(user.id, "ICT Admin");
        } else if (profile?.role) {
          // Successfully got role from database
          const fetchedRole = profile.role as UserRole;
          setCurrentRole(fetchedRole);
          roleCache.set(user.id, fetchedRole);
        } else {
          // No profile found, create one
          console.log("No profile found, creating...");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'ICT Admin'
            });

          if (insertError) {
            console.log("Failed to create profile:", insertError.message);
          }
          
          setCurrentRole("ICT Admin");
          roleCache.set(user.id, "ICT Admin");
        }
      } catch (error) {
        console.log("Unexpected error in fetchUserRole:", error);
        // On any error, default to ICT Admin
        setCurrentRole("ICT Admin");
        roleCache.set(user.id, "ICT Admin");
      } finally {
        activeFetches.delete(user.id);
        setLoading(false);
      }
    };

    // Only fetch if we have a user and session, and haven't cached the role yet
    if (user && session && !roleCache.has(user.id) && !activeFetches.has(user.id)) {
      fetchUserRole();
    } else if (!user || !session) {
      // Reset for logged out state
      setCurrentRole("Gebruiker");
      setLoading(false);
    } else if (user && roleCache.has(user.id)) {
      // Use cached role
      setCurrentRole(roleCache.get(user.id)!);
      setLoading(false);
    }
  }, [user?.id, session?.access_token]);

  const rolePermissions = {
    currentRole,
    loading,
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker",
    canManageUsers: currentRole === "ICT Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  };

  return rolePermissions;
};
