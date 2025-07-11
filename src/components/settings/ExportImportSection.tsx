
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileSpreadsheet, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export const ExportImportSection = () => {
  const { toast } = useToast();
  const { canManageAssets } = useUserRole();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportAssets = async () => {
    if (!canManageAssets) return;
    
    setIsExporting(true);
    try {
      const { data: assets, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Convert to CSV
      if (assets && assets.length > 0) {
        const headers = Object.keys(assets[0]).join(',');
        const rows = assets.map(asset => 
          Object.values(asset).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value || ''
          ).join(',')
        );
        
        const csv = [headers, ...rows].join('\n');
        
        // Download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Assets geëxporteerd",
          description: `${assets.length} assets succesvol geëxporteerd naar CSV`
        });
      } else {
        toast({
          title: "Geen assets gevonden",
          description: "Er zijn geen assets om te exporteren"
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export mislukt",
        description: "Er is een fout opgetreden bij het exporteren van assets",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportReservations = async () => {
    if (!canManageAssets) return;
    
    setIsExporting(true);
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (reservations && reservations.length > 0) {
        const headers = Object.keys(reservations[0]).join(',');
        const rows = reservations.map(reservation => 
          Object.values(reservation).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value || ''
          ).join(',')
        );
        
        const csv = [headers, ...rows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservations_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Reserveringen geëxporteerd",
          description: `${reservations.length} reserveringen succesvol geëxporteerd naar CSV`
        });
      } else {
        toast({
          title: "Geen reserveringen gevonden",
          description: "Er zijn geen reserveringen om te exporteren"
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export mislukt",
        description: "Er is een fout opgetreden bij het exporteren van reserveringen",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canManageAssets) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen CSV-bestanden worden ondersteund",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Leeg bestand",
          description: "Het CSV-bestand bevat geen data",
          variant: "destructive"
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredFields = ['type'];
      
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        toast({
          title: "Ontbrekende velden",
          description: `De volgende verplichte velden ontbreken: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      const assets = [];
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const asset: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || null;
            if (value && value !== 'NULL' && value !== '') {
              asset[header] = value;
            }
          });

          if (asset.type) {
            assets.push(asset);
          }
        } catch (error) {
          errors++;
          console.error(`Error parsing line ${i + 1}:`, error);
        }
      }

      if (assets.length === 0) {
        toast({
          title: "Geen geldige assets",
          description: "Er zijn geen geldige assets gevonden in het bestand",
          variant: "destructive"
        });
        return;
      }

      // Insert assets into database
      const { data, error } = await supabase
        .from('assets')
        .insert(assets)
        .select();

      if (error) {
        console.error('Insert error:', error);
        toast({
          title: "Import mislukt",
          description: "Er is een fout opgetreden bij het importeren van assets",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Assets geïmporteerd",
          description: `${data?.length || 0} assets succesvol geïmporteerd${errors > 0 ? ` (${errors} fouten genegeerd)` : ''}`
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import mislukt",
        description: "Er is een fout opgetreden bij het lezen van het bestand",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (!canManageAssets) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Exporteer assets en reserveringen naar CSV-bestanden voor backup of analyse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={exportAssets}
              disabled={isExporting}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting ? 'Exporteren...' : 'Exporteer Assets'}
            </Button>
            
            <Button
              onClick={exportReservations}
              disabled={isExporting}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              {isExporting ? 'Exporteren...' : 'Exporteer Reserveringen'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Asset Import
          </CardTitle>
          <CardDescription>
            Importeer assets vanuit een CSV-bestand. Het bestand moet minimaal een 'type' kolom bevatten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-import">CSV-bestand selecteren</Label>
            <Input
              id="asset-import"
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              disabled={isImporting}
              className="cursor-pointer"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Import instructies:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Bestand moet in CSV-formaat zijn</li>
              <li>Eerste rij moet kolomnamen bevatten</li>
              <li>Verplichte kolom: 'type'</li>
              <li>Optionele kolommen: brand, model, serial_number, asset_tag, status, location, category, etc.</li>
              <li>Lege waarden worden genegeerd</li>
            </ul>
          </div>
          
          {isImporting && (
            <div className="text-sm text-blue-600">
              Assets worden geïmporteerd...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
