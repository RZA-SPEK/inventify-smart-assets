
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
      console.log("fetchUserRole called");
      console.log("User:", user);
      console.log("Session:", session);
      
      if (!user || !session) {
        console.log("No user or session, setting role to Gebruiker");
        setCurrentRole("Gebruiker");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching role for user:", user.id);
        
        // Try a simple query first to see if we can access the profiles table at all
        console.log("Attempting simple profiles query...");
        
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        console.log("Test query result:", { testData, testError });
        
        // Now try to get the specific user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log("Profiles query result:", { profile, error });

        if (error) {
          console.error("Error fetching user role:", error);
          // Check if this user exists in profiles table
          console.log("Checking if user exists in profiles table...");
          
          // Try to create a profile for this user if it doesn't exist
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'ICT Admin' // Default to ICT Admin for now
            })
            .select()
            .single();
          
          console.log("Profile creation result:", { insertData, insertError });
          
          if (insertError) {
            console.error("Failed to create profile:", insertError);
            setCurrentRole("Gebruiker");
          } else {
            console.log("Profile created successfully, setting role to ICT Admin");
            setCurrentRole("ICT Admin");
          }
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

  console.log("useUserRole returning:", {
    currentRole,
    loading,
    isAdmin: currentRole === "ICT Admin" || currentRole === "Facilitair Admin",
    canManageAssets: currentRole === "ICT Admin" || currentRole === "Facilitair Medewerker",
    canManageUsers: currentRole === "ICT Admin",
    canViewSettings: currentRole === "ICT Admin" || currentRole === "Facilitair Admin"
  });

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
