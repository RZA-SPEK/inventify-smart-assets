
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Key, User as UserIcon, Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ICT Admin" | "Facilitair Admin" | "Gebruiker";
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
    role: user?.role || "Gebruiker" as "ICT Admin" | "Facilitair Admin" | "Gebruiker"
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update the user's role in the database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: formData.role,
          full_name: formData.name
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Fout bij bijwerken",
          description: "Er is een fout opgetreden bij het bijwerken van de gebruiker.",
          variant: "destructive",
        });
        return;
      }

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
        description: `${formData.name} is succesvol bijgewerkt met rol: ${formData.role}`
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          title: "Fout bij wachtwoord reset",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Wachtwoord reset email verzonden",
          description: `Een wachtwoord reset email is verzonden naar ${user.email}`
        });
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Gebruiker Bewerken
          </DialogTitle>
          <DialogDescription>
            Beheer de gegevens en rechten van {user.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profiel
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rechten
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Beveiliging
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user.status === "active" ? "Actief" : "Inactief"}
                  </span>
                </div>
              </div>
              <div>
                <Label>Laatste Login</Label>
                <div className="mt-2 text-sm text-gray-600">
                  {new Date(user.lastLogin).toLocaleDateString('nl-NL')}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={formData.role}
                onValueChange={(value: "ICT Admin" | "Facilitair Admin" | "Gebruiker") => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICT Admin">ICT Admin</SelectItem>
                  <SelectItem value="Facilitair Admin">Facilitair Admin</SelectItem>
                  <SelectItem value="Gebruiker">Gebruiker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Toegangsrechten voor deze rol:</Label>
              <div className="space-y-2 text-sm">
                {formData.role === "ICT Admin" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800">ICT Admin</h4>
                    <ul className="text-red-700 mt-1 space-y-1">
                      <li>• Volledige toegang tot alle functies</li>
                      <li>• Gebruikersbeheer</li>
                      <li>• Systeeminstellingen</li>
                      <li>• Alle assets beheren</li>
                    </ul>
                  </div>
                )}
                {formData.role === "Facilitair Admin" && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Facilitair Admin</h4>
                    <ul className="text-purple-700 mt-1 space-y-1">
                      <li>• Volledige toegang tot alle functies</li>
                      <li>• Gebruikersbeheer</li>
                      <li>• Assets beheren</li>
                      <li>• Reserveringen goedkeuren</li>
                    </ul>
                  </div>
                )}
                {formData.role === "Gebruiker" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Gebruiker</h4>
                    <ul className="text-green-700 mt-1 space-y-1">
                      <li>• Assets bekijken</li>
                      <li>• Reserveringen aanvragen</li>
                      <li>• Basis functionaliteit</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Wachtwoord Reset</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Stuur een wachtwoord reset email naar {user.email}
                </p>
              </div>
              
              <Button 
                onClick={handlePasswordReset}
                disabled={loading}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {loading ? "Email Verzenden..." : "Wachtwoord Reset Email Verzenden"}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label>Account Informatie</Label>
              <div className="space-y-2 text-sm text-gray-600 mt-2">
                <div>Account aangemaakt: {new Date(user.createdAt).toLocaleDateString('nl-NL')}</div>
                <div>User ID: {user.id}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Bezig..." : "Wijzigingen Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
