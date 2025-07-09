
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AssignmentSelectorProps {
  assignedTo: string;
  onAssignedToChange: (value: string) => void;
}

export const AssignmentSelector = ({ assignedTo, onAssignedToChange }: AssignmentSelectorProps) => {
  const [users, setUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserDisplayName = (user: { full_name: string | null; email: string }) => {
    return user.full_name || user.email.split('@')[0];
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">Toegewezen aan</Label>
      <Select 
        value={assignedTo || "unassigned"} 
        onValueChange={(value) => onAssignedToChange(value === "unassigned" ? "" : value)}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Laden..." : "Geen toewijzing"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Geen toewijzing</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={getUserDisplayName(user)}>
              {getUserDisplayName(user)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
