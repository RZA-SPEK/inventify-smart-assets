
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Trash2, UserCheck, UserX } from "lucide-react";

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
        return "bg-purple-100 text-purple-800";
      case "Facilitair Admin":
        return "bg-blue-100 text-blue-800";
      case "Facilitair Medewerker":
        return "bg-green-100 text-green-800";
      case "Gebruiker":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Laatste Login</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleColor(user.role)}>
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleStatus(user.id)}
                    className={user.status === "active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                  >
                    {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
