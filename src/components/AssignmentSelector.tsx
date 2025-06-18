
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssignmentSelectorProps {
  assignedTo: string;
  onAssignedToChange: (value: string) => void;
}

export const AssignmentSelector = ({ assignedTo, onAssignedToChange }: AssignmentSelectorProps) => {
  const mockUsers = [
    "Jan Janssen", "Marie Peeters", "Tom de Vries", "Lisa de Jong",
    "Peter van Dam", "Sara Smit", "Mike Jansen"
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">Toegewezen aan</Label>
      <Select 
        value={assignedTo || "unassigned"} 
        onValueChange={(value) => onAssignedToChange(value === "unassigned" ? "" : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Geen toewijzing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Geen toewijzing</SelectItem>
          {mockUsers.map((user) => (
            <SelectItem key={user} value={user}>
              {user}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
