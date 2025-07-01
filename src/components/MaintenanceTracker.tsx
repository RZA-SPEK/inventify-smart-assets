
import { useState } from 'react';
import { Calendar, Plus, Wrench, Euro, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useMaintenanceHistory } from '@/hooks/useMaintenanceHistory';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface MaintenanceTrackerProps {
  assetId: string;
  assetName: string;
}

export const MaintenanceTracker = ({ assetId, assetName }: MaintenanceTrackerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { maintenanceRecords, loading, fetchMaintenanceHistory, addMaintenanceRecord } = useMaintenanceHistory();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    maintenance_type: '',
    description: '',
    cost: '',
    performed_by: '',
    performed_date: '',
    next_due_date: '',
  });

  const assetRecords = maintenanceRecords.filter(record => record.asset_id === assetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordData = {
      asset_id: assetId,
      maintenance_type: formData.maintenance_type,
      description: formData.description || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      performed_by: formData.performed_by || null,
      performed_date: formData.performed_date,
      next_due_date: formData.next_due_date || null,
    };

    const { error } = await addMaintenanceRecord(recordData);
    
    if (error) {
      toast({
        title: "Fout bij toevoegen",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Onderhoud toegevoegd",
        description: "Het onderhoudsrecord is succesvol toegevoegd.",
      });
      setFormData({
        maintenance_type: '',
        description: '',
        cost: '',
        performed_by: '',
        performed_date: '',
        next_due_date: '',
      });
      setIsDialogOpen(false);
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'preventief':
        return 'bg-blue-100 text-blue-800';
      case 'correctief':
        return 'bg-red-100 text-red-800';
      case 'inspectie':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Onderhoudshistorie
            </CardTitle>
            <CardDescription>
              Onderhoudsrecords voor {assetName}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Onderhoud toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Nieuw onderhoudsrecord</DialogTitle>
                  <DialogDescription>
                    Voeg een nieuw onderhoudsrecord toe voor {assetName}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_type">Type onderhoud</Label>
                    <Select 
                      value={formData.maintenance_type} 
                      onValueChange={(value) => setFormData({...formData, maintenance_type: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventief">Preventief</SelectItem>
                        <SelectItem value="Correctief">Correctief</SelectItem>
                        <SelectItem value="Inspectie">Inspectie</SelectItem>
                        <SelectItem value="Reiniging">Reiniging</SelectItem>
                        <SelectItem value="Update">Update/Upgrade</SelectItem>
                        <SelectItem value="Reparatie">Reparatie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      placeholder="Beschrijf het uitgevoerde onderhoud..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="performed_date">Uitvoeringsdatum</Label>
                      <Input
                        id="performed_date"
                        type="date"
                        value={formData.performed_date}
                        onChange={(e) => setFormData({...formData, performed_date: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next_due_date">Volgende datum (optioneel)</Label>
                      <Input
                        id="next_due_date"
                        type="date"
                        value={formData.next_due_date}
                        onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Kosten (€)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performed_by">Uitgevoerd door</Label>
                      <Input
                        id="performed_by"
                        placeholder="Naam of bedrijf"
                        value={formData.performed_by}
                        onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button type="submit">
                    Toevoegen
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Onderhoudsrecords laden...
          </div>
        ) : assetRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nog geen onderhoudsrecords gevonden</p>
            <p className="text-sm">Voeg het eerste onderhoudsrecord toe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assetRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getMaintenanceTypeColor(record.maintenance_type)}>
                    {record.maintenance_type}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(record.performed_date), 'dd MMM yyyy')}
                  </div>
                </div>
                
                {record.description && (
                  <p className="text-sm mb-3">{record.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {record.cost && (
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      €{record.cost.toFixed(2)}
                    </div>
                  )}
                  {record.performed_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {record.performed_by}
                    </div>
                  )}
                  {record.next_due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Volgende: {format(new Date(record.next_due_date), 'dd MMM yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
