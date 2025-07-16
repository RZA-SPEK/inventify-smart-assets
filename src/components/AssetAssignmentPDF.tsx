import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface AssetAssignmentPDFProps {
  assetId: string;
  assetData: {
    brand: string;
    model: string;
    serialNumber: string;
    assetTag: string;
    type: string;
    assignedTo: string;
  };
  onDocumentGenerated?: () => void;
}

export const AssetAssignmentPDF = ({ assetId, assetData, onDocumentGenerated }: AssetAssignmentPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!assetData.assignedTo || assetData.assignedTo === 'unassigned') {
      toast({
        title: "Geen toewijzing",
        description: "Asset moet eerst toegewezen worden aan een persoon.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Load template from database
      const { data: templateData } = await supabase
        .from('system_settings')
        .select('settings_data')
        .eq('id', 'assignment_form_template')
        .maybeSingle();

      const template = templateData?.settings_data as any || {
        title: 'Asset Toewijzingsformulier',
        headerText: 'Dit formulier bevestigt de toewijzing van bedrijfsmiddelen aan de medewerker.',
        conditions: [
          'De gebruiker is verantwoordelijk voor het zorgvuldig gebruik van het toegewezen asset',
          'Verlies, diefstal of schade moet onmiddellijk gemeld worden',
          'Het asset mag niet aan derden worden uitgeleend zonder toestemming',
          'Bij vertrek uit de organisatie moet het asset worden geretourneerd',
          'Regulier onderhoud en updates zijn verplicht'
        ],
        footerText: 'Door ondertekening bevestigt de gebruiker akkoord te gaan met bovenstaande voorwaarden.',
        signatureFields: {
          userLabel: 'Handtekening gebruiker',
          adminLabel: 'Handtekening beheerder'
        }
      };

      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text(template.title, 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 20, 50);
      
      // Header text
      if (template.headerText) {
        pdf.setFontSize(10);
        const headerLines = pdf.splitTextToSize(template.headerText, 170);
        pdf.text(headerLines, 20, 65);
      }
      
      // Asset informatie
      pdf.setFontSize(14);
      pdf.text('Asset Informatie:', 20, 85);
      
      pdf.setFontSize(11);
      pdf.text(`Type: ${assetData.type}`, 25, 100);
      pdf.text(`Merk: ${assetData.brand}`, 25, 110);
      pdf.text(`Model: ${assetData.model}`, 25, 120);
      pdf.text(`Serienummer: ${assetData.serialNumber}`, 25, 130);
      pdf.text(`Asset Tag: ${assetData.assetTag}`, 25, 140);
      
      // Toewijzing informatie
      pdf.setFontSize(14);
      pdf.text('Toewijzing:', 20, 160);
      
      pdf.setFontSize(11);
      pdf.text(`Toegewezen aan: ${assetData.assignedTo}`, 25, 175);
      pdf.text(`Datum toewijzing: ${new Date().toLocaleDateString('nl-NL')}`, 25, 185);
      
      // Voorwaarden
      pdf.setFontSize(14);
      pdf.text('Voorwaarden en Verantwoordelijkheden:', 20, 205);
      
      pdf.setFontSize(10);
      let yPosition = 220;
      template.conditions.forEach((condition: string) => {
        const conditionText = condition.startsWith('•') ? condition : `• ${condition}`;
        const lines = pdf.splitTextToSize(conditionText, 170);
        pdf.text(lines, 25, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      
      // Footer text
      if (template.footerText) {
        yPosition += 10;
        pdf.setFontSize(10);
        const footerLines = pdf.splitTextToSize(template.footerText, 170);
        pdf.text(footerLines, 20, yPosition);
        yPosition += footerLines.length * 5;
      }
      
      // Handtekening velden
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.text('Akkoord en Handtekeningen:', 20, yPosition);
      
      // Gebruiker handtekening
      yPosition += 30;
      pdf.line(25, yPosition, 90, yPosition);
      pdf.setFontSize(9);
      pdf.text(template.signatureFields.userLabel || 'Handtekening gebruiker', 25, yPosition + 5);
      pdf.text(`${assetData.assignedTo}`, 25, yPosition + 15);
      pdf.text(`Datum: _______________`, 25, yPosition + 25);
      
      // Admin handtekening
      pdf.line(110, yPosition, 175, yPosition);
      pdf.text(template.signatureFields.adminLabel || 'Handtekening beheerder', 110, yPosition + 5);
      pdf.text('Naam: _______________', 110, yPosition + 15);
      pdf.text(`Datum: _______________`, 110, yPosition + 25);
      
      // Save PDF and create database record
      const pdfBlob = pdf.output('blob');
      const fileName = `asset_assignment_${assetData.assetTag}_${Date.now()}.pdf`;
      
      // Create database record
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Gebruiker niet ingelogd');
      
      const { data: assignmentDoc, error: dbError } = await supabase
        .from('asset_assignment_documents')
        .insert({
          asset_id: assetId,
          user_id: user.user.id,
          assigned_to_name: assetData.assignedTo,
          document_type: 'assignment_form'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      setDocumentId(assignmentDoc.id);
      
      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF gegenereerd",
        description: "Toewijzingsformulier is gedownload en opgeslagen.",
      });
      
      onDocumentGenerated?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Fout bij genereren",
        description: "Er is een fout opgetreden bij het genereren van de PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !documentId) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Verkeerd bestandstype",
        description: "Alleen PDF bestanden zijn toegestaan.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Gebruiker niet ingelogd');
      
      const fileName = `${user.user.id}/${documentId}_signed.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('assignment-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update database record
      const { error: updateError } = await supabase
        .from('asset_assignment_documents')
        .update({
          signed_document_url: fileName,
          signed_at: new Date().toISOString(),
          status: 'signed'
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      setSignedDocumentUrl(fileName);
      
      toast({
        title: "Document geüpload",
        description: "Getekend formulier is succesvol geüpload.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload fout",
        description: "Er is een fout opgetreden bij het uploaden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Asset Toewijzingsformulier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || !assetData.assignedTo || assetData.assignedTo === 'unassigned'}
            className="w-full"
          >
            {isGenerating ? (
              "Genereren..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Genereer PDF Formulier
              </>
            )}
          </Button>
          
          {!assetData.assignedTo || assetData.assignedTo === 'unassigned' && (
            <p className="text-sm text-muted-foreground">
              Wijs eerst het asset toe aan een persoon om een formulier te kunnen genereren.
            </p>
          )}
        </div>

        {documentId && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Getekend formulier uploaden</h4>
            
            {!signedDocumentUrl ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground">
                  Upload het ondertekende PDF formulier
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                <span>Getekend formulier is geüpload</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};