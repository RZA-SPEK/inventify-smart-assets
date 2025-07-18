import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

const AssetImportForm = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      'type', 'brand', 'model', 'serial_number', 'asset_tag', 
      'status', 'location', 'assigned_to', 'category', 'purchase_price',
      'purchase_date', 'warranty_expiry', 'comments', 'reservable'
    ];
    
    const csvContent = headers.join(',') + '\n' +
      'Laptop,Dell,Latitude 5520,ABC123,TAG001,available,Office A,,IT Equipment,1200,2023-01-15,2026-01-15,In good condition,true\n' +
      'Monitor,LG,24MK430H,DEF456,TAG002,available,Office B,,IT Equipment,300,2023-02-20,2025-02-20,,true';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Fout",
        description: "Alleen CSV bestanden zijn toegestaan.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV bestand moet minimaal een header en een data regel bevatten.');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataLines = lines.slice(1);
      
      const requiredFields = ['type'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Ontbrekende verplichte velden: ${missingFields.join(', ')}`);
      }

      const assets = [];
      const errors: string[] = [];
      
      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const asset: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || null;
            
            switch (header) {
              case 'purchase_price':
              case 'penalty_amount':
                asset[header] = value && !isNaN(Number(value)) ? Number(value) : null;
                break;
              case 'reservable':
                asset[header] = value?.toLowerCase() === 'true';
                break;
              case 'purchase_date':
              case 'warranty_expiry':
                asset[header] = value && value !== '' ? value : null;
                break;
              default:
                asset[header] = value && value !== '' ? value : null;
            }
          });

          if (!asset.type) {
            errors.push(`Regel ${i + 2}: Type is verplicht`);
            continue;
          }

          assets.push(asset);
        } catch (error) {
          errors.push(`Regel ${i + 2}: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
        }
        
        setProgress(((i + 1) / dataLines.length) * 50);
      }

      if (assets.length === 0) {
        throw new Error('Geen geldige assets gevonden om te importeren.');
      }

      // Insert assets in batches
      const batchSize = 50;
      let successCount = 0;
      
      for (let i = 0; i < assets.length; i += batchSize) {
        const batch = assets.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from('assets')
            .insert(batch);
          
          if (error) {
            throw error;
          }
          
          successCount += batch.length;
        } catch (error) {
          const batchStart = i + 1;
          const batchEnd = Math.min(i + batchSize, assets.length);
          errors.push(`Batch ${batchStart}-${batchEnd}: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
        }
        
        setProgress(50 + ((i + batchSize) / assets.length) * 50);
      }

      setResult({
        success: successCount,
        errors,
        total: dataLines.length
      });

      if (successCount > 0) {
        toast({
          title: "Import voltooid",
          description: `${successCount} assets succesvol geïmporteerd.`,
        });
      }

    } catch (error) {
      toast({
        title: "Import fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      setProgress(0);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Asset Import
        </CardTitle>
        <CardDescription>
          Importeer assets vanuit een CSV bestand. Download eerst de template om het juiste formaat te zien.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="space-y-2">
          <Label>Template downloaden</Label>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="import-file">CSV bestand selecteren</Label>
          <Input
            id="import-file"
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            disabled={importing}
          />
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Importeren... {Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <Alert className={result.success > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {result.success > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Import resultaten:</strong><br />
                  • Totaal verwerkt: {result.total}<br />
                  • Succesvol geïmporteerd: {result.success}<br />
                  • Fouten: {result.errors.length}
                </AlertDescription>
              </div>
            </Alert>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fouten tijdens import:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-sm font-medium">
                        ... en {result.errors.length - 10} meer fouten
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Instructies:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Download eerst de CSV template</li>
              <li>Vul de template in met uw asset gegevens</li>
              <li>Het veld 'type' is verplicht</li>
              <li>Datums moeten in het formaat YYYY-MM-DD zijn</li>
              <li>Reservable moet 'true' of 'false' zijn</li>
              <li>Upload het ingevulde CSV bestand</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AssetImportForm;