
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/pages/Index";

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (asset: Omit<Asset, "id">) => void;
  onCancel: () => void;
}

export const AssetForm = ({ asset, onSave, onCancel }: AssetFormProps) => {
  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    status: "In voorraad" as Asset["status"],
    location: "",
    category: "ICT" as Asset["category"],
    assignedTo: "",
    assignedToLocation: ""
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        status: asset.status,
        location: asset.location,
        category: asset.category,
        assignedTo: asset.assignedTo || "",
        assignedToLocation: asset.assignedToLocation || ""
      });
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert "unassigned" back to empty string for consistency with existing data structure
    const submitData = {
      ...formData,
      assignedTo: formData.assignedTo === "unassigned" ? "" : formData.assignedTo,
      assignedToLocation: formData.assignedToLocation === "unassigned" ? "" : formData.assignedToLocation
    };
    onSave(submitData);
  };

  const assetTypes = [
    "Laptop", "Desktop", "Monitor", "Telefoon", "Tablet", "Headset", 
    "Kabel", "Lader", "Muis", "Toetsenbord", "Webcam", "Printer",
    "Bureau", "Stoel", "Lamp", "Kast", "Whiteboard"
  ];

  const locations = [
    "Kantoor Amsterdam", "Kantoor Utrecht", "Kantoor Rotterdam",
    "ICT Magazijn", "Facilitair Magazijn", "Thuiswerken"
  ];

  const specificLocations = [
    "Werkplek A-101", "Werkplek A-102", "Werkplek A-150", "Werkplek A-200",
    "Werkplek U-201", "Werkplek U-205", "Werkplek U-210", "Werkplek U-250",
    "Werkplek R-301", "Werkplek R-305", "Werkplek R-310", "Werkplek R-350",
    "Magazijn Rek A-1", "Magazijn Rek A-2", "Magazijn Rek B-1", "Magazijn Rek B-3",
    "Vergaderruimte Alpha", "Vergaderruimte Beta", "Vergaderruimte Gamma",
    "Reception", "Keuken", "Break Room", "Server Room", "Storage Room"
  ];

  const mockUsers = [
    "Jan Janssen", "Marie Peeters", "Tom de Vries", "Lisa de Jong",
    "Peter van Dam", "Sara Smit", "Mike Jansen"
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Asset Bewerken" : "Nieuw Asset Toevoegen"}
          </DialogTitle>
          <DialogDescription>
            Vul de gegevens van het asset in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Asset Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="brand">Merk</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serienummer</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Aankoopdatum</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>

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

          <div className="space-y-2">
            <Label htmlFor="location">Hoofdlocatie</Label>
            <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer hoofdlocatie" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToLocation">Specifieke Locatie</Label>
            <Select 
              value={formData.assignedToLocation || "unassigned"} 
              onValueChange={(value) => setFormData({ ...formData, assignedToLocation: value === "unassigned" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Geen specifieke locatie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Geen specifieke locatie</SelectItem>
                {specificLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Toegewezen aan</Label>
            <Select 
              value={formData.assignedTo || "unassigned"} 
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value === "unassigned" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Geen toewijzing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Geen toewijzing</SelectItem>
                {mockUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit">
              {asset ? "Bijwerken" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
