
import { AdminReservationCalendar } from "@/components/AdminReservationCalendar";
import { useUserRole } from "@/hooks/useUserRole";

const ReservationCalendarPage = () => {
  const { canManageAssets } = useUserRole();

  if (!canManageAssets) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Toegang Geweigerd</h1>
          <p className="text-gray-600">U heeft geen toegang tot de reserverings agenda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <AdminReservationCalendar />
      </div>
    </div>
  );
};

export default ReservationCalendarPage;
