import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
}

export const RoleManagement = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [roleCategories, setRoleCategories] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedPermissions: [] as string[]
  });

  useEffect(() => {
    loadData();
    fetchRoleCategories();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      // Load permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name');

      if (permissionsError) throw permissionsError;

      // Load role permissions
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id');

      if (rolePermissionsError) throw rolePermissionsError;

      setRoles(rolesData || []);
      setPermissions(permissionsData || []);
      setRolePermissions(rolePermissionsData || []);
      fetchRoleCategories();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon rollen en rechten niet laden",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('role_categories')
        .select('role_id, category');
      
      if (error) throw error;
      
      const categoriesByRole = data.reduce((acc, item) => {
        if (!acc[item.role_id]) acc[item.role_id] = [];
        acc[item.role_id].push(item.category);
        return acc;
      }, {} as Record<string, string[]>);
      
      setRoleCategories(categoriesByRole);
    } catch (error) {
      console.error('Error fetching role categories:', error);
    }
  };

  const openDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      const rolePerms = rolePermissions
        .filter(rp => rp.role_id === role.id)
        .map(rp => rp.permission_id);
      
      setFormData({
        name: role.name,
        description: role.description,
        selectedPermissions: rolePerms
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        selectedPermissions: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Fout",
        description: "Rol naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let roleId = editingRole?.id;

      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq('id', editingRole.id);

        if (error) throw error;
      } else {
        // Create new role
        const { data, error } = await supabase
          .from('roles')
          .insert({
            name: formData.name,
            description: formData.description,
            created_by: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (error) throw error;
        roleId = data.id;
      }

      // Update role permissions
      if (roleId) {
        // Remove existing permissions
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);

        // Add selected permissions
        if (formData.selectedPermissions.length > 0) {
          const permissionInserts = formData.selectedPermissions.map(permId => ({
            role_id: roleId,
            permission_id: permId
          }));

          const { error: permError } = await supabase
            .from('role_permissions')
            .insert(permissionInserts);

          if (permError) throw permError;
        }
      }

      toast({
        title: "Succes",
        description: editingRole ? "Rol bijgewerkt" : "Nieuwe rol aangemaakt"
      });

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon rol niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoleCategories = async (roleId: string, categories: string[]) => {
    try {
      // Delete existing categories
      await supabase
        .from('role_categories')
        .delete()
        .eq('role_id', roleId);

      // Insert new categories
      if (categories.length > 0) {
        const categoryInserts = categories.map(category => ({
          role_id: roleId,
          category
        }));

        await supabase
          .from('role_categories')
          .insert(categoryInserts);
      }

      // Update local state
      setRoleCategories(prev => ({
        ...prev,
        [roleId]: categories
      }));

      toast({
        title: "Categorieën bijgewerkt",
        description: "De categorieën voor deze rol zijn succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error('Error updating role categories:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de categorieën.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Weet je zeker dat je deze rol wilt verwijderen?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Rol verwijderd"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon rol niet verwijderen",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePermissions = (roleId: string) => {
    const rolePermIds = rolePermissions
      .filter(rp => rp.role_id === roleId)
      .map(rp => rp.permission_id);
    
    return permissions.filter(p => rolePermIds.includes(p.id));
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rollen & Rechten Beheer
            </CardTitle>
            <CardDescription>
              Beheer gebruikersrollen en wijs specifieke rechten toe
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Bewerk Rol' : 'Nieuwe Rol Aanmaken'}
                </DialogTitle>
                <DialogDescription>
                  Definieer een nieuwe rol en wijs de juiste rechten toe
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Rol Naam</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijvoorbeeld: Content Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschrijf wat deze rol kan doen..."
                  />
                </div>

                <div className="space-y-4">
                  <Label>Rechten</Label>
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize">{category}</h4>
                      <div className="grid grid-cols-1 gap-2 ml-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.selectedPermissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedPermissions: [...prev.selectedPermissions, permission.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedPermissions: prev.selectedPermissions.filter(id => id !== permission.id)
                                  }));
                                }
                              }}
                            />
                            <div>
                              <Label htmlFor={permission.id} className="text-sm font-normal cursor-pointer">
                                {permission.description}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Bezig...' : editingRole ? 'Bijwerken' : 'Aanmaken'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Laden...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => {
              const rolePerms = getRolePermissions(role.id);
              return (
                <Card key={role.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{role.name}</h3>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rolePerms.map((permission) => (
                            <Badge key={permission.id} variant="secondary" className="text-xs">
                              {permission.description}
                            </Badge>
                          ))}
                        </div>
                        {roleCategories[role.id] && roleCategories[role.id].length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Toegestane categorieën:</p>
                            <div className="flex flex-wrap gap-1">
                              {roleCategories[role.id].map((category) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Categorieën beheren:</p>
                          <div className="flex flex-wrap gap-1">
                            {['ICT', 'Facilitair', 'Catering', 'Logistics'].map((category) => (
                              <div key={category} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`${role.id}-${category}`}
                                  checked={roleCategories[role.id]?.includes(category) || false}
                                  onCheckedChange={(checked) => {
                                    const currentCategories = roleCategories[role.id] || [];
                                    const updatedCategories = checked
                                      ? [...currentCategories, category]
                                      : currentCategories.filter(cat => cat !== category);
                                    updateRoleCategories(role.id, updatedCategories);
                                  }}
                                />
                                <Label htmlFor={`${role.id}-${category}`} className="text-xs">
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};