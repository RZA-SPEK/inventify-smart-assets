import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jan Janssen",
    email: "jan.janssen@bedrijf.nl",
    role: "ICT Admin",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-06-01"
  },
  {
    id: "2",
    name: "Marie Peeters",
    email: "marie.peeters@bedrijf.nl",
    role: "Facilitair Admin",
    status: "active",
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-07-15"
  },
  {
    id: "3",
    name: "Tom de Vries",
    email: "tom.devries@bedrijf.nl",
    role: "Gebruiker",
    status: "active",
    lastLogin: "2024-01-13T09:20:00Z",
    createdAt: "2023-08-20"
  },
  {
    id: "4",
    name: "Lisa van Berg",
    email: "lisa.vanberg@bedrijf.nl",
    role: "Facilitair Medewerker",
    status: "inactive",
    lastLogin: "2024-01-05T14:15:00Z",
    createdAt: "2023-09-10"
  }
];

const Users = () => {
  const { toast } = useToast();
  const { canManageUsers } = useUserRole();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              U heeft geen toegang tot gebruikersbeheer. Alleen ICT Admin kan gebruikers beheren.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: `Gebruiker ${user?.status === "active" ? "gedeactiveerd" : "geactiveerd"}`,
      description: `${user?.name} is ${user?.status === "active" ? "gedeactiveerd" : "geactiveerd"}`
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "Gebruiker verwijderd",
      description: `${user?.name} is verwijderd uit het systeem`,
      variant: "destructive"
    });
  };

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gebruikersbeheer</h1>
          <p className="text-gray-600 mt-1">Beheer gebruikers en hun toegangsrechten</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Gebruikers</CardTitle>
                <CardDescription>
                  {filteredUsers.length} van {users.length} gebruikers
                </CardDescription>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Gebruiker Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UserFilters
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onRoleFilterChange={setRoleFilter}
              onStatusFilterChange={setStatusFilter}
            />

            <UserTable
              users={filteredUsers}
              onEditUser={handleEditUser}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={handleDeleteUser}
            />
          </CardContent>
        </Card>

        <AddUserDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onUserAdded={handleUserAdded}
        />

        <EditUserDialog
          user={selectedUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </div>
  );
};

export default Users;
