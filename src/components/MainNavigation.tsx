
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const MainNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/assets") return "assets";
    if (path === "/users") return "users";
    if (path === "/settings") return "settings";
    return "dashboard";
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "assets":
        navigate("/assets");
        break;
      case "users":
        navigate("/users");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Fout bij uitloggen",
        description: "Er is een fout opgetreden bij het uitloggen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="flex-1">
            <TabsList className="grid w-full grid-cols-4 h-12 max-w-md">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Assets</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Gebruikers</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Instellingen</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="ml-4 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Uitloggen</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
