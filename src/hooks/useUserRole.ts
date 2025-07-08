
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Gebruiker";

// Enhanced global cache with timestamp for cache invalidation
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const activeFetches = new Set<string>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

      // Check cache first with timestamp validation
      const cachedData = roleCache.get(user.id);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        console.log("Using cached role:", cachedData.role);
        setCurrentRole(cachedData.role);
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
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Default to Gebruiker on error
          const defaultRole = "Gebruiker";
          setCurrentRole(defaultRole);
          roleCache.set(user.id, { role: defaultRole, timestamp: Date.now() });
        } else {
          const role = (data?.role as UserRole) || "Gebruiker";
          console.log("Fetched role from database:", role);
          setCurrentRole(role);
          roleCache.set(user.id, { role, timestamp: Date.now() });
        }
        
      } catch (error) {
        console.log("Unexpected error in fetchUserRole:", error);
        // On any error, default to Gebruiker
        const defaultRole = "Gebruiker";
        setCurrentRole(defaultRole);
        roleCache.set(user.id, { role: defaultRole, timestamp: Date.now() });
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
    // Both ICT Admin and Facilitair Admin have full access
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageUsers: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  };

  return rolePermissions;
};
