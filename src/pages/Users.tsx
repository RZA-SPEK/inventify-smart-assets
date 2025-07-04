
import { useState, useEffect } from "react";
import { UserTable } from "@/components/users/UserTable";
import { UserFilters } from "@/components/users/UserFilters";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { canManageUsers, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (!roleLoading && !canManageUsers) {
      navigate("/dashboard");
      return;
    }

    // Only fetch if role is loaded and user has permission
    if (!roleLoading && canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers, roleLoading, navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

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

  const handleUserAdded = () => {
    fetchUsers();
    setIsAddDialogOpen(false);
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
  };

  const handleToggleStatus = (userId: string) => {
    console.log('Toggle user status:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Convert users to match UserTable interface
  const tableUsers = filteredUsers.map(user => ({
    id: user.id,
    name: user.full_name || user.email.split('@')[0],
    email: user.email,
    role: user.role as "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker",
    status: "active" as const,
    lastLogin: user.created_at,
    createdAt: user.created_at
  }));

  // Don't render if user doesn't have permission
  if (!roleLoading && !canManageUsers) {
    return null;
  }

  // Show loading state
  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gebruikers</h1>
            <p className="text-gray-600 mt-1">Beheer gebruikersaccounts en rollen</p>
          </div>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nieuwe Gebruiker</span>
          </Button>
        </div>

        <UserFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onRoleFilterChange={setRoleFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <UserTable 
          users={tableUsers}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
        />

        <AddUserDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onUserAdded={handleUserAdded}
        />
      </div>
    </div>
  );
};

export default Users;
