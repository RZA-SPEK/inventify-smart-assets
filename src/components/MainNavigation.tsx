
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Home,
  Calendar,
  Box,
  Users,
  Settings,
  Power,
  ListChecks,
  Plus,
  LayoutDashboard,
  Menu,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const MainNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canManageAssets } = useUserRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Assets",
      href: "/assets",
      icon: Box,
      current: location.pathname === "/assets" || location.pathname === "/",
    },
    {
      name: "Reserveringen",
      href: "/reservations",
      icon: Calendar,
      current: location.pathname === "/reservations",
    },
    {
      name: "Mijn Reserveringen",
      href: "/my-reservations",
      icon: ListChecks,
      current: location.pathname === "/my-reservations",
    },
    ...(canManageAssets
      ? [
          {
            name: "Nieuw Asset",
            href: "/assets/create",
            icon: Plus,
            current: location.pathname === "/assets/create",
          },
        ]
      : []),
    ...(canManageAssets ? [
      { 
        name: "Reserveringen Agenda", 
        href: "/reservations-calendar", 
        icon: Calendar,
        current: location.pathname === "/reservations-calendar"
      }
    ] : []),
    ...(canManageAssets
      ? [
          {
            name: "Gebruikers",
            href: "/users",
            icon: Users,
            current: location.pathname === "/users",
          },
        ]
      : []),
    ...(canManageAssets
      ? [
          {
            name: "Activity Log",
            href: "/activity-log",
            icon: FileText,
            current: location.pathname === "/activity-log",
          },
        ]
      : []),
    ...(canManageAssets
      ? [
          {
            name: "Instellingen",
            href: "/settings",
            icon: Settings,
            current: location.pathname === "/settings",
          },
        ]
      : []),
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      navigate("/auth");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto min-w-0">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Asset Management</h1>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-2 px-2 py-1 whitespace-nowrap text-sm ${
                    item.current
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <Power className="h-4 w-4 mr-1" />
              <span className="hidden xl:inline">Uitloggen</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation */}
      <nav className="hidden md:flex lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-gray-900">Asset Management</h1>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <ScrollArea className="h-full">
                <div className="flex flex-col space-y-4 p-4">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold">{user?.user_metadata?.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col space-y-1 mt-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className={`justify-start ${
                          location.pathname === item.href
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    ))}
                  </div>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="justify-start text-red-500"
                    onClick={handleLogout}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    <span>Uitloggen</span>
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Asset Management</h1>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64 p-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col space-y-4 p-4">
                  <SheetHeader className="pb-4 pl-6">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <div className="flex items-center space-x-2 pl-6">
                    <Avatar>
                      <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold">{user?.user_metadata?.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col space-y-1 mt-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className={`justify-start pl-8 ${
                          location.pathname === item.href
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    ))}
                  </div>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="justify-start pl-8 text-red-500"
                    onClick={handleLogout}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    <span>Uitloggen</span>
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};

export default MainNavigation;
