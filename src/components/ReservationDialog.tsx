
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link2 } from "lucide-react";
import { ReservationCalendar } from "./ReservationCalendar";

interface LinkedAsset {
  id: string;
  type: string;
  brand: string;
  model: string;
  assetTag: string;
}

interface ReservationDialogProps {
  asset: Asset;
  onClose: () => void;
}

export const ReservationDialog = ({ asset, onClose }: ReservationDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [linkedAssets, setLinkedAssets] = useState<LinkedAsset[]>([]);
  const [loadingLinkedAssets, setLoadingLinkedAssets] = useState(true);
  const [formData, setFormData] = useState({
    requestedDate: null as Date | null,
    returnDate: null as Date | null,
    startTime: "09:00",
    endTime: "17:00",
    purpose: ""
  });

  useEffect(() => {
    fetchLinkedAssets();
  }, [asset.id]);

  const fetchLinkedAssets = async () => {
    try {
      // Fetch relationships where current asset is parent
      const { data: parentData, error: parentError } = await supabase
        .from('asset_relationships')
        .select(`
          child_asset_id,
          assets!asset_relationships_child_asset_id_fkey(
            id, type, brand, model, asset_tag
          )
        `)
        .eq('parent_asset_id', asset.id);

      // Fetch relationships where current asset is child
      const { data: childData, error: childError } = await supabase
        .from('asset_relationships')
        .select(`
          parent_asset_id,
          assets!asset_relationships_parent_asset_id_fkey(
            id, type, brand, model, asset_tag
          )
        `)
        .eq('child_asset_id', asset.id);

      if (parentError || childError) {
        console.error('Error fetching linked assets:', parentError || childError);
        return;
      }

      const allLinkedAssets: LinkedAsset[] = [];

      // Add child assets
      parentData?.forEach(rel => {
        if (rel.assets) {
          allLinkedAssets.push({
            id: rel.assets.id,
            type: rel.assets.type,
            brand: rel.assets.brand || '',
            model: rel.assets.model || '',
            assetTag: rel.assets.asset_tag || ''
          });
        }
      });

      // Add parent assets
      childData?.forEach(rel => {
        if (rel.assets) {
          allLinkedAssets.push({
            id: rel.assets.id,
            type: rel.assets.type,
            brand: rel.assets.brand || '',
            model: rel.assets.model || '',
            assetTag: rel.assets.asset_tag || ''
          });
        }
      });

      setLinkedAssets(allLinkedAssets);
    } catch (error) {
      console.error('Error fetching linked assets:', error);
    } finally {
      setLoadingLinkedAssets(false);
    }
  };

  const handleDateSelect = (date: Date, startTime?: string, endTime?: string) => {
    setFormData(prev => ({
      ...prev,
      requestedDate: date,
      returnDate: date, // For now, same day reservation
      startTime: startTime || prev.startTime,
      endTime: endTime || prev.endTime
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requestedDate) {
      toast({
        title: "Fout",
        description: "Selecteer een datum voor de reservering.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (!user) {
        toast({
          title: "Fout",
          description: "U moet ingelogd zijn om een reservering aan te vragen.",
          variant: "destructive",
        });
        return;
      }

      // Get user's full name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const requesterName = profile?.full_name || user.email || 'Unknown User';

      const { error } = await supabase
        .from('reservations')
        .insert({
          asset_id: asset.id,
          requester_id: user.id,
          requester_name: requesterName,
          requested_date: formData.requestedDate.toISOString().split('T')[0],
          return_date: (formData.returnDate || formData.requestedDate).toISOString().split('T')[0],
          start_time: formData.startTime,
          end_time: formData.endTime,
          purpose: formData.purpose || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating reservation:', error);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het aanvragen van de reservering.",
          variant: "destructive",
        });
        return;
      }

      console.log("Reservation created successfully for:", {
        assetId: asset.id,
        assetName: `${asset.brand} ${asset.model}`,
        requesterName,
        linkedAssetsCount: linkedAssets.length,
        ...formData
      });

      const assetSetDescription = linkedAssets.length > 0 
        ? `${asset.brand} ${asset.model} en ${linkedAssets.length} gekoppelde asset${linkedAssets.length > 1 ? 's' : ''}`
        : `${asset.brand} ${asset.model}`;

      toast({
        title: "Reservering Aangevraagd",
        description: `Uw reservering voor ${assetSetDescription} is aangevraagd en wordt beoordeeld door een administrator.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asset Reserveren</DialogTitle>
          <DialogDescription>
            Selecteer een datum en tijd voor {asset.brand} {asset.model}
            {linkedAssets.length > 0 && " en gekoppelde assets"}
          </DialogDescription>
        </DialogHeader>

        {linkedAssets.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Let op: Dit asset is gekoppeld aan andere assets
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Door dit asset te reserveren, reserveert u automatisch de volgende gekoppelde assets:
            </p>
            <div className="space-y-2">
              {loadingLinkedAssets ? (
                <div className="text-sm text-blue-600">Laden van gekoppelde assets...</div>
              ) : (
                linkedAssets.map((linkedAsset) => (
                  <div key={linkedAsset.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {linkedAsset.type}
                    </Badge>
                    <span className="text-sm">
                      {linkedAsset.brand} {linkedAsset.model}
                      {linkedAsset.assetTag && ` (${linkedAsset.assetTag})`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ReservationCalendar
                assetId={asset.id}
                onDateSelect={handleDateSelect}
                selectedDate={formData.requestedDate || undefined}
                startTime={formData.startTime}
                endTime={formData.endTime}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Doel van gebruik (optioneel)</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Beschrijf waarvoor u dit asset nodig heeft..."
                  rows={4}
                />
              </div>

              {formData.requestedDate && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Reservering Samenvatting</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>Datum: {formData.requestedDate.toLocaleDateString('nl-NL')}</p>
                    <p>Tijd: {formData.startTime} - {formData.endTime}</p>
                    <p>Asset: {asset.brand} {asset.model}</p>
                    {linkedAssets.length > 0 && (
                      <p>+ {linkedAssets.length} gekoppelde asset{linkedAssets.length > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.requestedDate}
            >
              {loading ? "Bezig..." : "Reservering Aanvragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
