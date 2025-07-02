
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("Gebruiker");
  const [actualRole, setActualRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("Gebruiker");

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log("Fetching user role from database...");
      
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      const userId = data.session?.user.id;
      console.log("Current user ID:", userId);

      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        console.log("Profile data from database:", profileData);
        console.log("Profile error:", profileError);

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Set default role if user doesn't have a profile yet
          setActualRole("Gebruiker");
          setCurrentRole("Gebruiker");
          return;
        }

        // Ensure the role from database matches our expected types
        const roleFromDb = profileData?.role;
        console.log("Role from database:", roleFromDb);
        
        if (roleFromDb === "ICT Admin" || roleFromDb === "Facilitair Admin" || roleFromDb === "Facilitair Medewerker" || roleFromDb === "Gebruiker") {
          setActualRole(roleFromDb);
          setCurrentRole(roleFromDb);
          console.log("Set roles to:", roleFromDb);
        } else {
          console.log("Invalid role from database, setting to Gebruiker");
          setActualRole("Gebruiker");
          setCurrentRole("Gebruiker");
        }
      } else {
        console.log("No user session, setting role to Gebruiker");
        setActualRole("Gebruiker");
        setCurrentRole("Gebruiker");
      }
    };

    fetchUserRole();
  }, []);

  const handleRoleChange = (newRole: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => {
    console.log("Simulating role change from", currentRole, "to", newRole);
    setCurrentRole(newRole);
  };

  return { 
    currentRole, 
    actualRole,
    setCurrentRole: handleRoleChange 
  };
};
