
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: (user: User) => void;
}

export const AddUserDialog = ({ open, onOpenChange, onUserAdded }: AddUserDialogProps) => {
  const { toast } = useToast();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Gebruiker" as "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker"
  });
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Velden vereist",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.name,
            role: newUser.role
          }
        }
      });

      if (error) {
        toast({
          title: "Fout bij aanmaken gebruiker",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Gebruiker aangemaakt",
          description: `${newUser.name} is succesvol aangemaakt`
        });
        
        // Add to local state for demo purposes
        const newUserData: User = {
          id: Math.random().toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        onUserAdded(newUserData);
        onOpenChange(false);
        setNewUser({ name: "", email: "", password: "", role: "Gebruiker" });
      }
    } catch (error) {
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe Gebruiker Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe gebruiker toe aan het systeem
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newName">Naam</Label>
            <Input 
              id="newName" 
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Volledige naam"
            />
          </div>
          <div>
            <Label htmlFor="newEmail">Email</Label>
            <Input 
              id="newEmail" 
              type="email" 
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@bedrijf.nl"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Wachtwoord</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="newRole">Rol</Label>
            <Select 
              value={newUser.role} 
              onValueChange={(value: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker") => 
                setNewUser(prev => ({ ...prev, role: value }))
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
          <Button onClick={handleAddUser} disabled={loading}>
            {loading ? "Toevoegen..." : "Gebruiker Toevoegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
