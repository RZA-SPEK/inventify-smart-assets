
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("Gebruiker");

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      const userId = data.session?.user.id;

      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        // Ensure the role from database matches our expected types
        const roleFromDb = profileData?.role;
        if (roleFromDb === "ICT Admin" || roleFromDb === "Facilitair Admin" || roleFromDb === "Facilitair Medewerker" || roleFromDb === "Gebruiker") {
          setCurrentRole(roleFromDb);
        } else {
          setCurrentRole("Gebruiker"); // Default fallback
        }
      }
    };

    fetchUserRole();
  }, []);

  return { currentRole, setCurrentRole };
};
