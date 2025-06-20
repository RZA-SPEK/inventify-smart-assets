
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./ImageUpload";
import { useToast } from "@/hooks/use-toast";

interface BrandingData {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  description: string;
}

export const BrandingSettings = () => {
  const { toast } = useToast();
  const [brandingData, setBrandingData] = useState<BrandingData>({
    companyName: "Asset Management Tool",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    logo: "",
    description: "Professioneel asset management voor uw organisatie"
  });

  useEffect(() => {
    // Load saved branding from localStorage
    const saved = localStorage.getItem("brandingSettings");
    if (saved) {
      setBrandingData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("brandingSettings", JSON.stringify(brandingData));
    toast({
      title: "Instellingen opgeslagen",
      description: "De branding instellingen zijn succesvol bijgewerkt.",
    });
  };

  const handleReset = () => {
    const defaultSettings = {
      companyName: "Asset Management Tool",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      logo: "",
      description: "Professioneel asset management voor uw organisatie"
    };
    setBrandingData(defaultSettings);
    localStorage.setItem("brandingSettings", JSON.stringify(defaultSettings));
    toast({
      title: "Instellingen gereset",
      description: "De branding instellingen zijn teruggezet naar de standaardwaarden.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bedrijfsbranding</CardTitle>
          <CardDescription>
            Pas de uitstraling van het asset management systeem aan uw bedrijf aan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Bedrijfsnaam</Label>
            <Input
              id="companyName"
              value={brandingData.companyName}
              onChange={(e) => setBrandingData({ ...brandingData, companyName: e.target.value })}
              placeholder="Uw bedrijfsnaam"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={brandingData.description}
              onChange={(e) => setBrandingData({ ...brandingData, description: e.target.value })}
              placeholder="Korte beschrijving van uw organisatie"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primaire kleur</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={brandingData.primaryColor}
                  onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={brandingData.primaryColor}
                  onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secundaire kleur</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={brandingData.secondaryColor}
                  onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={brandingData.secondaryColor}
                  onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                  placeholder="#64748b"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bedrijfslogo</Label>
            <ImageUpload
              currentImage={brandingData.logo}
              onImageChange={(imageUrl) => setBrandingData({ ...brandingData, logo: imageUrl || "" })}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Standaardwaarden
            </Button>
            <Button onClick={handleSave}>
              Instellingen Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voorbeeld</CardTitle>
          <CardDescription>Zo ziet uw branding eruit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            {brandingData.logo && (
              <img
                src={brandingData.logo}
                alt="Logo"
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold" style={{ color: brandingData.primaryColor }}>
                {brandingData.companyName}
              </h3>
              <p className="text-sm" style={{ color: brandingData.secondaryColor }}>
                {brandingData.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
