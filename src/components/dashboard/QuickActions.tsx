
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  return (
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
  );
};
