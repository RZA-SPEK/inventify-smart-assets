
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asset } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, this would send the reservation request to a backend
    console.log("Reservation request:", {
      assetId: asset.id,
      assetName: `${asset.brand} ${asset.model}`,
      ...formData
    });

    toast({
      title: "Reservering Aangevraagd",
      description: `Uw reservering voor ${asset.brand} ${asset.model} is aangevraagd en wordt beoordeeld.`,
    });

    onClose();
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
            <Button type="submit">
              Reservering Aanvragen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
