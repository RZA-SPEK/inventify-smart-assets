
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const RecentActivity = () => {
  return (
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
  );
};
