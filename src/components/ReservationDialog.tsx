
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asset } from "@/hooks/useAssets";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, validateDate, generateCSRFToken } from "@/utils/security";
import { useAuth } from "@/contexts/AuthContext";

interface ReservationDialogProps {
  asset: Asset;
  onClose: () => void;
}

export const ReservationDialog = ({ asset, onClose }: ReservationDialogProps) => {
  const { toast } = useToast();
  const { createReservation } = useReservations();
  const { userProfile } = useAuth();
  const [csrfToken] = useState(generateCSRFToken());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requesterName: userProfile?.full_name || "",
    requestedDate: "",
    returnDate: "",
    purpose: ""
  });

  const validateForm = (): string | null => {
    if (!formData.requesterName.trim()) {
      return "Naam is verplicht";
    }
    
    if (!formData.requestedDate || !validateDate(formData.requestedDate)) {
      return "Geldige startdatum is verplicht";
    }
    
    if (!formData.returnDate || !validateDate(formData.returnDate)) {
      return "Geldige einddatum is verplicht";
    }
    
    if (new Date(formData.returnDate) <= new Date(formData.requestedDate)) {
      return "Einddatum moet na startdatum zijn";
    }
    
    if (!formData.purpose.trim() || formData.purpose.trim().length < 10) {
      return "Doel van gebruik moet minimaal 10 karakters bevatten";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validatiefout",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const sanitizedData = {
        asset_id: asset.id,
        requester_name: sanitizeInput(formData.requesterName),
        requested_date: formData.requestedDate,
        return_date: formData.returnDate,
        purpose: sanitizeInput(formData.purpose)
      };

      const { error } = await createReservation(sanitizedData);
      
      if (error) {
        toast({
          title: "Fout bij reservering",
          description: "Er is een fout opgetreden. Probeer het opnieuw.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reservering Aangevraagd",
          description: `Uw reservering voor ${asset.brand} ${asset.model} is aangevraagd en wordt beoordeeld.`,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Fout bij reservering",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          <input type="hidden" name="csrf_token" value={csrfToken} />
          
          <div className="space-y-2">
            <Label htmlFor="requesterName">Uw Naam</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              maxLength={100}
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
                min={new Date().toISOString().split('T')[0]}
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
                min={formData.requestedDate || new Date().toISOString().split('T')[0]}
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
              maxLength={500}
              minLength={10}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.purpose.length}/500 karakters (minimaal 10)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Bezig..." : "Reservering Aanvragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
