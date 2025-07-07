
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainNavigation from "@/components/MainNavigation";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import AssetEdit from "./pages/AssetEdit";
import AssetNew from "./pages/AssetNew";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Reservations from "./pages/Reservations";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/assets" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Assets />
                </ProtectedRoute>
              } />
              <Route path="/assets/new" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <AssetNew />
                </ProtectedRoute>
              } />
              <Route path="/assets/:id" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <AssetDetails />
                </ProtectedRoute>
              } />
              <Route path="/assets/:id/edit" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <AssetEdit />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/activity" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <ActivityLog />
                </ProtectedRoute>
              } />
              <Route path="/reservations" element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Reservations />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
