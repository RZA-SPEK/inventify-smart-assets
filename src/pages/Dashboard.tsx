
import { DashboardStats } from "@/components/DashboardStats";
import { UserRole } from "@/components/UserRole";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { mockAssets } from "@/data/mockAssets";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <UserRole />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overzicht van alle asset management activiteiten</p>
        </div>

        <DashboardStats assets={mockAssets} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
