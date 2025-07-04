
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";

// Global cache to prevent duplicate fetches
const roleCache = new Map<string, UserRole>();
const activeFetches = new Set<string>();

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("Gebruiker");
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const location = useLocation();

  // If we're on the auth page, don't fetch roles at all
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    // Don't fetch anything on auth page
    if (isAuthPage) {
      setCurrentRole("Gebruiker");
      setLoading(false);
      return;
    }

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
          // Default to ICT Admin and try to create profile
          setCurrentRole("ICT Admin");
          roleCache.set(user.id, "ICT Admin");
          
          // Try to create profile in background, but don't wait for it
          setTimeout(async () => {
            try {
              await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email || '',
                  role: 'ICT Admin'
                });
            } catch (insertError) {
              console.log("Background profile creation failed, but continuing...");
            }
          }, 100);
        } else if (profile?.role) {
          // Successfully got role from database
          const fetchedRole = profile.role as UserRole;
          setCurrentRole(fetchedRole);
          roleCache.set(user.id, fetchedRole);
        } else {
          // No profile found, default to ICT Admin
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

    // Only fetch if we have a user and session, and haven't cached the role yet, and not on auth page
    if (user && session && !roleCache.has(user.id) && !activeFetches.has(user.id) && !isAuthPage) {
      fetchUserRole();
    } else if (!user || !session) {
      // Reset for logged out state
      setCurrentRole("Gebruiker");
      setLoading(false);
    } else if (user && roleCache.has(user.id)) {
      // Use cached role
      setCurrentRole(roleCache.get(user.id)!);
      setLoading(false);
    } else {
      // Default state
      setLoading(false);
    }
  }, [user?.id, session?.access_token, isAuthPage]);

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
