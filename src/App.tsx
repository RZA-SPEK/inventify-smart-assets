
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import AssetList from './pages/Assets';
import AssetDetail from './pages/AssetDetails';
import CreateAsset from './pages/AssetNew';
import EditAsset from './pages/AssetEdit';
import Reservations from './pages/Reservations';
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
