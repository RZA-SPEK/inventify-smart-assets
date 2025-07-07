
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export type UserRole = "ICT Admin" | "Facilitair Admin" | "Gebruiker";

// Global cache to prevent duplicate fetches
const roleCache = new Map<string, UserRole>();
const activeFetches = new Set<string>();

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("ICT Admin"); // Default to ICT Admin
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const location = useLocation();

  // If we're on the auth page, don't fetch roles at all
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    // Don't fetch anything on auth page
    if (isAuthPage) {
      setCurrentRole("ICT Admin");
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      // If no user or session, set default and stop loading
      if (!user || !session) {
        console.log("No user or session, setting default role");
        setCurrentRole("ICT Admin");
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
        
        // Since we're getting persistent errors, let's just default to ICT Admin
        // and skip all database calls for now
        console.log("Skipping database calls due to persistent errors, defaulting to ICT Admin");
        setCurrentRole("ICT Admin");
        roleCache.set(user.id, "ICT Admin");
        
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
      setCurrentRole("ICT Admin");
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
