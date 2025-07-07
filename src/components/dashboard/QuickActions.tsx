
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddAsset = () => {
    navigate('/assets/new');
  };

  const handleManageReservations = () => {
    navigate('/reservations');
  };

  const handleGenerateReport = () => {
    toast({
      title: "Rapport Genereren",
      description: "Deze functie wordt binnenkort beschikbaar gesteld.",
    });
  };

  const handlePlanMaintenance = () => {
    toast({
      title: "Onderhoud Plannen",
      description: "Deze functie wordt binnenkort beschikbaar gesteld.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snelle Acties</CardTitle>
        <CardDescription>Veelgebruikte functies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleAddAsset}
            className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="font-medium">Asset Toevoegen</div>
            <div className="text-sm text-gray-600">Nieuw asset registreren</div>
          </button>
          <button 
            onClick={handleManageReservations}
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="font-medium">Reservering Beheren</div>
            <div className="text-sm text-gray-600">Aanvragen verwerken</div>
          </button>
          <button 
            onClick={handleGenerateReport}
            className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="font-medium">Rapport Genereren</div>
            <div className="text-sm text-gray-600">Asset overzichten</div>
          </button>
          <button 
            onClick={handlePlanMaintenance}
            className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div className="font-medium">Onderhoud Plannen</div>
            <div className="text-sm text-gray-600">Maintenance schema</div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
