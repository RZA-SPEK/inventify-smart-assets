
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { mockAssets } from "@/data/mockAssets";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto mobile-spacing py-4 sm:py-6 max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Overzicht van alle asset management activiteiten</p>
        </div>

        <div className="mb-4 sm:mb-6">
          <DashboardStats assets={mockAssets} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="w-full">
            <RecentActivity />
          </div>
          <div className="w-full">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
