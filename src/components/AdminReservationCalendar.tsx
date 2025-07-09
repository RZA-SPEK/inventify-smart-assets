import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Package } from "lucide-react";

interface Reservation {
  id: string;
  asset_id: string;
  requested_date: string;
  return_date: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_name: string;
  purpose?: string;
  assets?: {
    brand: string;
    model: string;
    type: string;
  };
}

type ViewMode = 'day' | 'week' | 'month';

export const AdminReservationCalendar = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          assets:asset_id (
            brand,
            model,
            type
          )
        `)
        .order('requested_date', { ascending: true });

      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }

      // Cast the status field to the correct type
      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as 'pending' | 'approved' | 'rejected'
      }));

      setReservations(typedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const startDate = parseISO(reservation.requested_date);
      const endDate = parseISO(reservation.return_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getReservationsForPeriod = () => {
    let start: Date, end: Date;
    
    switch (viewMode) {
      case 'week':
        start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
      default:
        return getReservationsForDate(selectedDate);
    }

    return reservations.filter(reservation => {
      const startDate = parseISO(reservation.requested_date);
      const endDate = parseISO(reservation.return_date);
      return (startDate <= end && endDate >= start);
    });
  };

  const renderDayView = () => {
    const dayReservations = getReservationsForDate(selectedDate);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reserveringen op {format(selectedDate, 'dd MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayReservations.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Geen reserveringen op deze datum</p>
          ) : (
            <div className="space-y-4">
              {dayReservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {reservation.assets ? 
                          `${reservation.assets.brand} ${reservation.assets.model}` : 
                          `Asset ID: ${reservation.asset_id}`
                        }
                      </span>
                    </div>
                    <Badge variant={
                      reservation.status === 'approved' ? 'default' : 
                      reservation.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {reservation.status === 'approved' ? 'Goedgekeurd' : 
                       reservation.status === 'pending' ? 'In behandeling' : 'Afgewezen'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {reservation.requester_name}
                    </div>
                    {reservation.start_time && reservation.end_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reservation.start_time} - {reservation.end_time}
                      </div>
                    )}
                  </div>
                  
                  {reservation.purpose && (
                    <p className="text-sm text-gray-700">{reservation.purpose}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Periode: {format(parseISO(reservation.requested_date), 'dd/MM')} - {format(parseISO(reservation.return_date), 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Week van {format(start, 'dd MMM')} - {format(end, 'dd MMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayReservations = getReservationsForDate(day);
              return (
                <div key={day.toISOString()} className="border rounded p-2 min-h-[120px]">
                  <div className="font-medium text-sm mb-2">{format(day, 'dd MMM')}</div>
                  <div className="space-y-1">
                    {dayReservations.slice(0, 3).map((reservation) => (
                      <div key={reservation.id} className="text-xs p-1 bg-blue-100 rounded truncate">
                        {reservation.requester_name}
                      </div>
                    ))}
                    {dayReservations.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayReservations.length - 3} meer</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMonthView = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={selectedDate}
            onMonthChange={setSelectedDate}
            modifiers={{
              hasReservations: (date) => getReservationsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasReservations: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))' 
              }
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laden van reserveringen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reserveringen Agenda</h2>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dag</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Maand</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
            >
              ←
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Vandaag
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
            >
              →
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
};
