
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReservationDialogProps {
  asset: Asset;
  onClose: () => void;
}

export const ReservationDialog = ({ asset, onClose }: ReservationDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: "",
    returnDate: "",
    purpose: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) {
        toast({
          title: "Fout",
          description: "U moet ingelogd zijn om een reservering aan te vragen.",
          variant: "destructive",
        });
        return;
      }

      // Get user's full name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const requesterName = profile?.full_name || user.email || 'Unknown User';

      const { error } = await supabase
        .from('reservations')
        .insert({
          asset_id: asset.id,
          requester_id: user.id,
          requester_name: requesterName,
          requested_date: formData.requestedDate,
          return_date: formData.returnDate,
          purpose: formData.purpose || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating reservation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het aanvragen van de reservering.",
          variant: "destructive",
        });
        return;
      }

      console.log("Reservation created successfully for:", {
        assetId: asset.id,
        assetName: `${asset.brand} ${asset.model}`,
        requesterName,
        ...formData
      });

      toast({
        title: "Reservering Aangevraagd",
        description: `Uw reservering voor ${asset.brand} ${asset.model} is aangevraagd en wordt beoordeeld door een administrator.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asset Reserveren</DialogTitle>
          <DialogDescription>
            Vraag een reservering aan voor {asset.brand} {asset.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedDate">Startdatum</Label>
              <Input
                id="requestedDate"
                type="date"
                value={formData.requestedDate}
                onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnDate">Einddatum</Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Doel van gebruik (optioneel)</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Beschrijf waarvoor u dit asset nodig heeft..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Bezig..." : "Reservering Aanvragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
