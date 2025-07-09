
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";

interface Reservation {
  id: string;
  requested_date: string;
  return_date: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_name: string;
}

interface ReservationCalendarProps {
  assetId: string;
  onDateSelect: (date: Date, startTime?: string, endTime?: string) => void;
  selectedDate?: Date;
  startTime?: string;
  endTime?: string;
}

export const ReservationCalendar = ({ 
  assetId, 
  onDateSelect, 
  selectedDate,
  startTime,
  endTime 
}: ReservationCalendarProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempStartTime, setTempStartTime] = useState(startTime || "09:00");
  const [tempEndTime, setTempEndTime] = useState(endTime || "17:00");

  useEffect(() => {
    fetchReservations();
  }, [assetId]);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('asset_id', assetId)
        .in('status', ['pending', 'approved']);

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

  const isTimeSlotAvailable = (date: Date, startTime: string, endTime: string) => {
    const dayReservations = getReservationsForDate(date);
    
    for (const reservation of dayReservations) {
      if (!reservation.start_time || !reservation.end_time) {
        // If no specific time, assume full day is blocked
        return false;
      }
      
      // Check for time overlap
      const reqStart = reservation.start_time;
      const reqEnd = reservation.end_time;
      
      if (
        (startTime >= reqStart && startTime < reqEnd) ||
        (endTime > reqStart && endTime <= reqEnd) ||
        (startTime <= reqStart && endTime >= reqEnd)
      ) {
        return false;
      }
    }
    
    return true;
  };

  const isDateAvailable = (date: Date) => {
    const dayReservations = getReservationsForDate(date);
    return dayReservations.length === 0 || 
           dayReservations.some(r => r.start_time && r.end_time);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (isTimeSlotAvailable(date, tempStartTime, tempEndTime)) {
      onDateSelect(date, tempStartTime, tempEndTime);
    }
  };

  const handleTimeChange = () => {
    if (selectedDate && isTimeSlotAvailable(selectedDate, tempStartTime, tempEndTime)) {
      onDateSelect(selectedDate, tempStartTime, tempEndTime);
    }
  };

  const modifiers = {
    booked: (date: Date) => !isDateAvailable(date),
    available: (date: Date) => isDateAvailable(date),
    selected: (date: Date) => selectedDate ? isSameDay(date, selectedDate) : false
  };

  const modifiersStyles = {
    booked: { 
      backgroundColor: 'hsl(var(--destructive))', 
      color: 'hsl(var(--destructive-foreground))' 
    },
    available: { 
      backgroundColor: 'hsl(var(--primary))', 
      color: 'hsl(var(--primary-foreground))' 
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Laden van beschikbaarheid...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Beschikbaarheid Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
          
          <div className="mt-4 flex gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Beschikbaar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Bezet</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tijd Selectie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start tijd</Label>
              <Input
                id="startTime"
                type="time"
                value={tempStartTime}
                onChange={(e) => {
                  setTempStartTime(e.target.value);
                  setTimeout(handleTimeChange, 100);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Eind tijd</Label>
              <Input
                id="endTime"
                type="time"
                value={tempEndTime}
                onChange={(e) => {
                  setTempEndTime(e.target.value);
                  setTimeout(handleTimeChange, 100);
                }}
              />
            </div>
          </div>
          
          {selectedDate && !isTimeSlotAvailable(selectedDate, tempStartTime, tempEndTime) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Deze tijd is niet beschikbaar op de geselecteerde datum
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Reserveringen op {format(selectedDate, 'dd MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {getReservationsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500">Geen reserveringen op deze datum</p>
            ) : (
              <div className="space-y-2">
                {getReservationsForDate(selectedDate).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{reservation.requester_name}</span>
                      {reservation.start_time && reservation.end_time && (
                        <span className="text-sm text-gray-600 ml-2">
                          {reservation.start_time} - {reservation.end_time}
                        </span>
                      )}
                    </div>
                    <Badge variant={reservation.status === 'approved' ? 'default' : 'secondary'}>
                      {reservation.status === 'approved' ? 'Goedgekeurd' : 'In behandeling'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
