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
      // Load templates from database
      const { data: templateData } = await supabase
        .from('system_settings')
        .select('settings_data')
        .eq('setting_type', 'assignment_form_templates')
        .maybeSingle();

      const defaultTemplate = {
        title: '{assetType} • Uitgifte',
        headerText: '{assignedTo}',
        conditions: [
          'Het verstrekte apparaat is persoonlijk, vertrouwelijk en niet overdraagbaar',
          '(Bij oneigenlijk gebruik wordt desbetreffende persoon ter verantwoording geroepen)'
        ],
        footerText: 'Getekend voor ontvangst,',
        signatureFields: {
          userLabel: 'Handtekening',
          adminLabel: 'Beheerder'
        }
      };

      // Get template for this specific asset type, fallback to default
      const templatesData = templateData?.settings_data as any || {};
      const template = templatesData[assetData.type] || defaultTemplate;

      const pdf = new jsPDF();
      
      // Replace placeholders in template
      const processedTitle = template.title
        .replace('{assetType}', assetData.type)
        .replace('{assignedTo}', assetData.assignedTo);
      
      const processedHeaderText = template.headerText
        .replace('{assetType}', assetData.type)
        .replace('{assignedTo}', assetData.assignedTo);
      
      // Header with asset type and assignment
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(processedTitle, 20, 30);
      
      // Assigned person name
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(processedHeaderText, 20, 50);
      
      // Asset details table
      const tableY = 70;
      const leftCol = 20;
      const rightCol = 100;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Table rows
      const rows = [
        ['PC Type', `${assetData.brand} ${assetData.model}`],
        ['Data sim kaart', ''],
        ['Service tag Proxsys', assetData.assetTag || ''],
        ['PIN', '']
      ];
      
      let currentY = tableY;
      rows.forEach(([label, value]) => {
        // Draw table lines
        pdf.line(leftCol, currentY - 5, 190, currentY - 5);
        
        // Labels
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, leftCol + 2, currentY);
        
        // Values
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, rightCol, currentY);
        
        currentY += 15;
      });
      
      // Close table
      pdf.line(leftCol, currentY - 5, 190, currentY - 5);
      
      // Vertical lines for table
      pdf.line(leftCol, tableY - 5, leftCol, currentY - 5);
      pdf.line(rightCol - 2, tableY - 5, rightCol - 2, currentY - 5);
      pdf.line(190, tableY - 5, 190, currentY - 5);
      
      // Important section
      currentY += 20;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Belangrijk', leftCol, currentY);
      
      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      template.conditions.forEach((condition: string) => {
        const lines = pdf.splitTextToSize(condition, 170);
        pdf.text(lines, leftCol, currentY);
        currentY += lines.length * 5 + 3;
      });
      
      // Footer section
      currentY += 20;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.footerText, leftCol, currentY);
      
      // Signature section
      currentY += 40;
      pdf.setFontSize(11);
      
      // Signature line and label
      pdf.line(leftCol, currentY, leftCol + 80, currentY);
      pdf.text(template.signatureFields.userLabel, leftCol, currentY + 10);
      pdf.text('Datum:_______________', leftCol + 100, currentY + 10);
      
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