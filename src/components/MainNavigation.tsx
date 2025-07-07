
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/components/UserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  Activity, 
  Calendar,
  Menu,
  LogOut
} from "lucide-react";

const MainNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { currentRole, canManageUsers, canViewSettings, loading } = useUserRole();

  // Don't render navigation on auth page or when user is not logged in
  if (location.pathname === '/auth' || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true
    },
    {
      title: "Assets",
      href: "/assets",
      icon: Package,
      show: true
    },
    {
      title: "Reserveringen",
      href: "/reservations",
      icon: Calendar,
      show: true
    },
    {
      title: "Gebruikers",
      href: "/users",
      icon: Users,
      show: canManageUsers,
      badge: canManageUsers ? "Admin" : undefined
    },
    {
      title: "Instellingen",
      href: "/settings",
      icon: Settings,
      show: canViewSettings,
      badge: canViewSettings ? "Admin" : undefined
    },
    {
      title: "Activiteit",
      href: "/activity",
      icon: Activity,
      show: true
    }
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <item.icon className="h-4 w-4" />
        <span className="font-medium text-sm">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-gray-900">Asset Management</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {visibleNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            {/* User Actions & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Desktop User Role & Logout */}
              <div className="hidden md:flex items-center space-x-3">
                <UserRole />
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Uitloggen</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Navigatie</h2>
                      </div>
                      
                      <nav className="flex-1 px-4 py-4 space-y-2">
                        {visibleNavItems.map((item) => (
                          <NavLink 
                            key={item.href} 
                            item={item} 
                            onClick={() => setIsOpen(false)}
                          />
                        ))}
                      </nav>
                      
                      <div className="px-4 py-4 border-t border-gray-200">
                        <UserRole />
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          className="w-full mt-4 flex items-center justify-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Uitloggen</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainNavigation;
