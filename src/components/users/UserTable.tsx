
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Trash2, UserCheck, UserX, Shield } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ users, onEditUser, onToggleStatus, onDeleteUser }: UserTableProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ICT Admin":
        return "bg-red-100 text-red-800";
      case "Facilitair Admin":
        return "bg-purple-100 text-purple-800";
      case "Facilitair Medewerker":
        return "bg-blue-100 text-blue-800";
      case "Gebruiker":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const getRoleIcon = (role: string) => {
    if (role.includes("Admin")) {
      return <Shield className="h-3 w-3 mr-1" />;
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4 p-4">
        {users.map((user) => (
          <div key={user.id} className="mobile-card">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <Badge className={getStatusColor(user.status)}>
                  {user.status === "active" ? "Actief" : "Inactief"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <Badge className={`${getRoleColor(user.role)} flex items-center w-fit`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </Badge>
                <div className="text-xs text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString('nl-NL')}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditUser(user)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Bewerken
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(user.id)}
                  className={`flex-1 ${user.status === "active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}
                >
                  {user.status === "active" ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                  {user.status === "active" ? "Deactiveren" : "Activeren"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Laatste Login</TableHead>
              <TableHead className="text-center">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={`${getRoleColor(user.role)} flex items-center w-fit`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === "active" ? "Actief" : "Inactief"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString('nl-NL')}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditUser(user)}
                      title="Gebruiker bewerken"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleStatus(user.id)}
                      className={user.status === "active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      title={user.status === "active" ? "Gebruiker deactiveren" : "Gebruiker activeren"}
                    >
                      {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Gebruiker verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Geen gebruikers gevonden
        </div>
      )}
    </div>
  );
};
