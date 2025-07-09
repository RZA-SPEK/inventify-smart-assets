
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/Assets';
import AssetDetail from './pages/AssetDetails';
import CreateAsset from './pages/AssetNew';
import EditAsset from './pages/AssetEdit';
import Reservations from './pages/Reservations';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import { UserReservations } from './components/UserReservations';
import MainNavigation from './components/MainNavigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import ReservationCalendarPage from "./pages/ReservationCalendar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <AssetList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/:id" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <AssetDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/create" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <CreateAsset />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/edit/:id" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <EditAsset />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reservations" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Reservations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-reservations" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <UserReservations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reservations-calendar" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <ReservationCalendarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/activity-log" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <ActivityLog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <MainNavigation />
                  <Settings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
