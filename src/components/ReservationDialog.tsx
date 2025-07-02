
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";

interface ReservationDialogProps {
  asset: Asset;
  onClose: () => void;
}

export const ReservationDialog = ({ asset, onClose }: ReservationDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    requesterName: "",
    requestedDate: "",
    returnDate: "",
    purpose: ""
  });

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("reservations")
        .insert({
          asset_id: asset.id,
          requester_id: user.id,
          requester_name: reservationData.requesterName,
          requested_date: reservationData.requestedDate,
          return_date: reservationData.returnDate,
          purpose: reservationData.purpose,
          status: "pending"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Reservering Aangevraagd",
        description: `Uw reservering voor ${asset.brand} ${asset.model} is aangevraagd en wordt beoordeeld.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanvragen van de reservering.",
        variant: "destructive",
      });
      console.error("Error creating reservation:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservationMutation.mutate(formData);
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
          <div className="space-y-2">
            <Label htmlFor="requesterName">Uw Naam</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              required
            />
          </div>

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
            <Label htmlFor="purpose">Doel van gebruik</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Beschrijf waarvoor u dit asset nodig heeft..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={createReservationMutation.isPending}>
              {createReservationMutation.isPending ? "Bezig..." : "Reservering Aanvragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
