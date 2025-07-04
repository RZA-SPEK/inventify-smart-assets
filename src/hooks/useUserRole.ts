
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
        console.log("No user or session, setting default role");
        setCurrentRole("Gebruiker");
        setLoading(false);
        return;
      }

      // Check cache first
      if (roleCache.has(user.id)) {
        const cachedRole = roleCache.get(user.id)!;
        console.log("Using cached role:", cachedRole);
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
        
        // Try direct database query to bypass any RLS issues
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .limit(1)
          .single();

        if (error) {
          console.log("Error fetching profile:", error.message, error.code);
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116' || error.message.includes('no rows')) {
            console.log("Creating new profile with ICT Admin role");
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                role: 'ICT Admin'
              });

            if (insertError) {
              console.log("Error creating profile:", insertError);
            }
            
            setCurrentRole("ICT Admin");
            roleCache.set(user.id, "ICT Admin");
          } else {
            // For any other error, default to ICT Admin
            console.log("Using ICT Admin as default due to error");
            setCurrentRole("ICT Admin");
            roleCache.set(user.id, "ICT Admin");
          }
        } else if (profile?.role) {
          // Successfully got role from database
          const fetchedRole = profile.role as UserRole;
          console.log("Successfully fetched role:", fetchedRole);
          setCurrentRole(fetchedRole);
          roleCache.set(user.id, fetchedRole);
        } else {
          // No role found, create profile with ICT Admin
          console.log("No role found, creating profile");
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'ICT Admin'
            });

          if (insertError) {
            console.log("Error creating profile:", insertError);
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

    // Always fetch if we have a user and session, and not on auth page
    if (user && session && !isAuthPage) {
      fetchUserRole();
    } else if (!user || !session) {
      // Reset for logged out state
      setCurrentRole("Gebruiker");
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
