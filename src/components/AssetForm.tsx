import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { Asset } from "@/hooks/useAssets";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { LocationSelector } from "./LocationSelector";
import { AssignmentSelector } from "./AssignmentSelector";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";
import { sanitizeInput, validateSerialNumber, validateDate, generateCSRFToken } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id" | "created_at" | "updated_at" | "created_by">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [csrfToken] = useState(generateCSRFToken());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    status: "In voorraad" as Asset["status"],
    location: "",
    category: "ICT" as Asset["category"],
    assigned_to: "",
    assigned_to_location: "",
    image_url: "",
    warranty_expiry: "",
    purchase_price: "",
    depreciation_rate: "20.00",
    condition_notes: "",
    last_maintenance: "",
    next_maintenance: ""
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type,
        brand: asset.brand || "",
        model: asset.model || "",
        serial_number: asset.serial_number,
        purchase_date: asset.purchase_date,
        status: asset.status,
        location: asset.location,
        category: asset.category,
        assigned_to: asset.assigned_to || "",
        assigned_to_location: asset.assigned_to_location || "",
        image_url: asset.image_url || "",
        warranty_expiry: asset.warranty_expiry || "",
        purchase_price: asset.purchase_price?.toString() || "",
        depreciation_rate: asset.depreciation_rate?.toString() || "20.00",
        condition_notes: asset.condition_notes || "",
        last_maintenance: asset.last_maintenance || "",
        next_maintenance: asset.next_maintenance || ""
      });
    }
  }, [asset]);

  const validateForm = (): string | null => {
    if (!formData.type.trim()) {
      return "Type is verplicht";
    }
    
    if (!validateSerialNumber(formData.serial_number)) {
      return "Serienummer moet 3-50 alfanumerieke karakters bevatten";
    }
    
    if (!formData.purchase_date || !validateDate(formData.purchase_date)) {
      return "Geldige aankoopdatum is verplicht";
    }
    
    if (!formData.location.trim()) {
      return "Locatie is verplicht";
    }
    
    if (formData.purchase_price && isNaN(parseFloat(formData.purchase_price))) {
      return "Aankoopprijs moet een geldig bedrag zijn";
    }
    
    if (formData.depreciation_rate && (isNaN(parseFloat(formData.depreciation_rate)) || parseFloat(formData.depreciation_rate) < 0 || parseFloat(formData.depreciation_rate) > 100)) {
      return "Afschrijvingspercentage moet tussen 0 en 100 zijn";
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
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
        type: sanitizeInput(formData.type),
        brand: sanitizeInput(formData.brand),
        model: sanitizeInput(formData.model),
        serial_number: sanitizeInput(formData.serial_number),
        purchase_date: formData.purchase_date,
        status: formData.status,
        location: sanitizeInput(formData.location),
        category: formData.category,
        assigned_to: sanitizeInput(formData.assigned_to),
        assigned_to_location: sanitizeInput(formData.assigned_to_location),
        image_url: formData.image_url,
        warranty_expiry: formData.warranty_expiry || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        depreciation_rate: formData.depreciation_rate ? parseFloat(formData.depreciation_rate) : 20.00,
        condition_notes: sanitizeInput(formData.condition_notes),
        last_maintenance: formData.last_maintenance || null,
        next_maintenance: formData.next_maintenance || null
      };
      
      onSave(sanitizedData);
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarcodeScanned = (scannedData: string) => {
    const sanitizedData = sanitizeInput(scannedData);
    if (validateSerialNumber(sanitizedData)) {
      setFormData({ ...formData, serial_number: sanitizedData });
      setShowScanner(false);
    } else {
      toast({
        title: "Ongeldige barcode",
        description: "De gescande barcode is geen geldig serienummer",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {asset ? "Asset Bewerken" : "Nieuw Asset Toevoegen"}
            </DialogTitle>
            <DialogDescription>
              Vul de gegevens van het asset in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl || "" })}
            />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basisinformatie</h3>
              <div className="grid grid-cols-2 gap-4">
                <AssetTypeSelector
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value })}
                />

                <div className="space-y-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Select value={formData.category} onValueChange={(value: "ICT" | "Facilitair") => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICT">ICT</SelectItem>
                      <SelectItem value="Facilitair">Facilitair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Merk (optioneel)</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model (optioneel)</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serienummer</Label>
                <div className="flex gap-2">
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    maxLength={50}
                    pattern="[A-Za-z0-9\-_]+"
                    title="Alleen letters, cijfers, streepjes en underscores toegestaan"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Scan
                  </Button>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financiële informatie</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Aankoopdatum</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Aankoopprijs (€)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depreciation_rate">Afschrijving (%/jaar)</Label>
                  <Input
                    id="depreciation_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.depreciation_rate}
                    onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Garantie verloopt</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                />
              </div>
            </div>

            {/* Status and Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status en locatie</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Asset["status"]) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In voorraad">In voorraad</SelectItem>
                      <SelectItem value="In gebruik">In gebruik</SelectItem>
                      <SelectItem value="Defect">Defect</SelectItem>
                      <SelectItem value="Onderhoud">Onderhoud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <LocationSelector
                mainLocation={formData.location}
                specificLocation={formData.assigned_to_location}
                onMainLocationChange={(value) => setFormData({ ...formData, location: value })}
                onSpecificLocationChange={(value) => setFormData({ ...formData, assigned_to_location: value })}
              />

              <AssignmentSelector
                assignedTo={formData.assigned_to}
                onAssignedToChange={(value) => setFormData({ ...formData, assigned_to: value })}
              />
            </div>

            {/* Maintenance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Onderhoudsinformatie</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_maintenance">Laatste onderhoud</Label>
                  <Input
                    id="last_maintenance"
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_maintenance">Volgend onderhoud</Label>
                  <Input
                    id="next_maintenance"
                    type="date"
                    value={formData.next_maintenance}
                    onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition_notes">Conditie opmerkingen</Label>
                <Textarea
                  id="condition_notes"
                  placeholder="Eventuele opmerkingen over de conditie van het asset..."
                  value={formData.condition_notes}
                  onChange={(e) => setFormData({ ...formData, condition_notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuleren
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Bezig..." : (asset ? "Bijwerken" : "Toevoegen")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};
