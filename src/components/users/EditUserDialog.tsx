
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (user: User) => void;
}

export const EditUserDialog = ({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "Gebruiker" as "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker"
  });

  const handleSave = () => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      role: formData.role
    };
    
    onUserUpdated(updatedUser);
    onOpenChange(false);
    
    toast({
      title: "Gebruiker bijgewerkt",
      description: `${formData.name} is succesvol bijgewerkt`
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gebruiker Bewerken</DialogTitle>
          <DialogDescription>
            Wijzig de gegevens en rechten van {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Naam</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={formData.role}
              onValueChange={(value: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ICT Admin">ICT Admin</SelectItem>
                <SelectItem value="Facilitair Admin">Facilitair Admin</SelectItem>
                <SelectItem value="Facilitair Medewerker">Facilitair Medewerker</SelectItem>
                <SelectItem value="Gebruiker">Gebruiker</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
