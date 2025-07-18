import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, User, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface AssignmentDocument {
  id: string;
  assigned_to_name: string;
  document_type: string;
  signed_document_url: string | null;
  generated_at: string;
  signed_at: string | null;
  status: 'pending' | 'signed';
}

interface AssetAssignmentDocumentsProps {
  assetId: string;
}

export const AssetAssignmentDocuments = ({ assetId }: AssetAssignmentDocumentsProps) => {
  const [documents, setDocuments] = useState<AssignmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageAssets } = useUserRole();

  useEffect(() => {
    fetchDocuments();
  }, [assetId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_assignment_documents')
        .select('*')
        .eq('asset_id', assetId)
        .neq('status', 'cancelled')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as AssignmentDocument[]);
    } catch (error) {
      console.error('Error fetching assignment documents:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon documenten niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSignedDocument = async (document: AssignmentDocument) => {
    if (!document.signed_document_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('assignment-documents')
        .download(document.signed_document_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `signed_assignment_${document.assigned_to_name}_${document.id}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download gestart",
        description: "Het getekende document wordt gedownload.",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download fout",
        description: "Kon document niet downloaden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!canManageAssets) return;
    
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen uit de toewijzingsgeschiedenis?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('asset_assignment_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document verwijderd",
        description: "Het document is verwijderd uit de toewijzingsgeschiedenis.",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Verwijder fout",
        description: "Kon document niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Toewijzingsdocumenten</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Laden...</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Toewijzingsgeschiedenis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Geen toewijzingsgeschiedenis gevonden.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Toewijzingsgeschiedenis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{doc.assigned_to_name}</span>
                    <Badge variant={doc.status === 'signed' ? 'default' : 'secondary'}>
                      {doc.status === 'signed' ? 'Getekend' : 'Wachtend'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Gegenereerd: {new Date(doc.generated_at).toLocaleDateString('nl-NL')}</span>
                    </div>
                    
                    {doc.signed_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Getekend: {new Date(doc.signed_at).toLocaleDateString('nl-NL')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {doc.signed_document_url && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadSignedDocument(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    {canManageAssets && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {!doc.signed_document_url && (
                <p className="text-sm text-muted-foreground">
                  Het getekende document is nog niet geüpload.
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};