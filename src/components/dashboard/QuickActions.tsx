
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, BarChart3, Wrench } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddAsset = () => {
    navigate('/assets/create');
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

  const actions = [
    {
      title: "Asset Toevoegen",
      description: "Nieuw asset registreren",
      icon: Plus,
      onClick: handleAddAsset,
      variant: "blue"
    },
    {
      title: "Reservering Beheren",
      description: "Aanvragen verwerken",
      icon: Calendar,
      onClick: handleManageReservations,
      variant: "green"
    },
    {
      title: "Rapport Genereren",
      description: "Asset overzichten",
      icon: BarChart3,
      onClick: handleGenerateReport,
      variant: "purple"
    },
    {
      title: "Onderhoud Plannen",
      description: "Maintenance schema",
      icon: Wrench,
      onClick: handlePlanMaintenance,
      variant: "orange"
    }
  ];

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "blue":
        return "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900";
      case "green":
        return "bg-green-50 hover:bg-green-100 border-green-200 text-green-900";
      case "purple":
        return "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900";
      case "orange":
        return "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900";
      default:
        return "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snelle Acties</CardTitle>
        <CardDescription>Veelgebruikte functies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              onClick={action.onClick}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start space-y-2 transition-all duration-200 ${getVariantClasses(action.variant)}`}
            >
              <div className="flex items-center space-x-2">
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-sm opacity-70">{action.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
