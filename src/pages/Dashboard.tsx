import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/DashboardStats";
import { UserRole } from "@/components/UserRole";
import { mockAssets } from "@/data/mockAssets";
import { useState } from "react";

const Dashboard = () => {
  const [currentRole, setCurrentRole] = useState<"ICT Admin" | "Facilitair Admin" | "Facilitair Medewerker" | "Gebruiker">("ICT Admin");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <UserRole currentRole={currentRole} onRoleChange={setCurrentRole} />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overzicht van alle asset management activiteiten</p>
        </div>

        <DashboardStats assets={mockAssets} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recente Activiteit</CardTitle>
              <CardDescription>Laatste wijzigingen in het systeem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Asset toegevoegd</p>
                    <p className="text-sm text-gray-600">Dell Latitude 7420 - Laptop</p>
                  </div>
                  <span className="text-xs text-gray-500">2 uur geleden</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Reservering goedgekeurd</p>
                    <p className="text-sm text-gray-600">iPhone 14 voor Marie Peeters</p>
                  </div>
                  <span className="text-xs text-gray-500">4 uur geleden</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Onderhoud gepland</p>
                    <p className="text-sm text-gray-600">HP LaserJet Pro - Printer</p>
                  </div>
                  <span className="text-xs text-gray-500">1 dag geleden</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
              <CardDescription>Veelgebruikte functies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium">Asset Toevoegen</div>
                  <div className="text-sm text-gray-600">Nieuw asset registreren</div>
                </button>
                <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium">Reservering Beheren</div>
                  <div className="text-sm text-gray-600">Aanvragen verwerken</div>
                </button>
                <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium">Rapport Genereren</div>
                  <div className="text-sm text-gray-600">Asset overzichten</div>
                </button>
                <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <div className="font-medium">Onderhoud Plannen</div>
                  <div className="text-sm text-gray-600">Maintenance schema</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
