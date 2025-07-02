
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Activity, User, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActivityLog = () => {
  const navigate = useNavigate();

  // Mock activity data for demonstration
  const activities = [
    {
      id: 1,
      action: "Asset Created",
      description: "New laptop MVDS-50023 added to inventory",
      user: "Admin User",
      timestamp: "2024-07-02 14:30",
      type: "create"
    },
    {
      id: 2,
      action: "Asset Updated",
      description: "Monitor MVDS-50015 status changed to 'In gebruik'",
      user: "IT Manager",
      timestamp: "2024-07-02 13:15",
      type: "update"
    },
    {
      id: 3,
      action: "Asset Reserved",
      description: "Laptop MVDS-50010 reserved by John Doe",
      user: "John Doe",
      timestamp: "2024-07-02 12:45",
      type: "reserve"
    },
    {
      id: 4,
      action: "Asset Deleted",
      description: "Old printer MVDS-50001 marked as deleted",
      user: "Admin User",
      timestamp: "2024-07-02 11:20",
      type: "delete"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <Activity className="w-4 h-4 text-green-600" />;
      case "update":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "reserve":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "delete":
        return <Activity className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-50 border-green-200";
      case "update":
        return "bg-blue-50 border-blue-200";
      case "reserve":
        return "bg-orange-50 border-orange-200";
      case "delete":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar Dashboard</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recente Activiteiten</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{activity.action}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                        <User className="w-3 h-3" />
                        <span>Door: {activity.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLog;
