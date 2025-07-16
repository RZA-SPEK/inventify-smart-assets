import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { FileText, Save, RotateCcw, Copy } from 'lucide-react';

interface AssignmentFormTemplate {
  title: string;
  headerText: string;
  conditions: string[];
  footerText: string;
  signatureFields: {
    userLabel: string;
    adminLabel: string;
  };
}

interface AssignmentFormTemplates {
  [assetType: string]: AssignmentFormTemplate;
}

const DEFAULT_TEMPLATE: AssignmentFormTemplate = {
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

export const AssignmentFormTemplate = () => {
  const { settings } = useSettings();
  const [templates, setTemplates] = useState<AssignmentFormTemplates>({});
  const [selectedAssetType, setSelectedAssetType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    // Set first asset type as default selected
    if (settings.assetTypes.length > 0 && !selectedAssetType) {
      setSelectedAssetType(settings.assetTypes[0]);
    }
  }, [settings.assetTypes, selectedAssetType]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings_data')
        .eq('id', 'assignment_form_templates')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings_data) {
        const templatesData = data.settings_data as unknown as AssignmentFormTemplates;
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon de formuliertemplates niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async () => {
    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Gebruiker niet ingelogd');

      // Check if templates exist
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('id', 'assignment_form_templates')
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing templates
        result = await supabase
          .from('system_settings')
          .update({
            settings_data: templates as unknown as any,
            updated_by: user.user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'assignment_form_templates');
      } else {
        // Create new templates
        result = await supabase
          .from('system_settings')
          .insert({
            id: 'assignment_form_templates',
            settings_data: templates as unknown as any,
            updated_by: user.user.id
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Templates opgeslagen",
        description: "Formuliertemplates zijn succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon de templates niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentTemplate = (): AssignmentFormTemplate => {
    return templates[selectedAssetType] || DEFAULT_TEMPLATE;
  };

  const updateCurrentTemplate = (newTemplate: AssignmentFormTemplate) => {
    setTemplates({
      ...templates,
      [selectedAssetType]: newTemplate
    });
  };

  const resetCurrentTemplate = () => {
    updateCurrentTemplate(DEFAULT_TEMPLATE);
    toast({
      title: "Template gereset",
      description: `Template voor ${selectedAssetType} is teruggezet naar standaard waarden.`,
    });
  };

  const copyFromOtherType = (sourceType: string) => {
    if (templates[sourceType]) {
      updateCurrentTemplate(templates[sourceType]);
      toast({
        title: "Template gekopieerd",
        description: `Template van ${sourceType} is gekopieerd naar ${selectedAssetType}.`,
      });
    }
  };

  const updateCondition = (index: number, value: string) => {
    const currentTemplate = getCurrentTemplate();
    const newConditions = [...currentTemplate.conditions];
    newConditions[index] = value;
    updateCurrentTemplate({ ...currentTemplate, conditions: newConditions });
  };

  const addCondition = () => {
    const currentTemplate = getCurrentTemplate();
    updateCurrentTemplate({
      ...currentTemplate,
      conditions: [...currentTemplate.conditions, 'Nieuwe voorwaarde']
    });
  };

  const removeCondition = (index: number) => {
    const currentTemplate = getCurrentTemplate();
    const newConditions = currentTemplate.conditions.filter((_, i) => i !== index);
    updateCurrentTemplate({ ...currentTemplate, conditions: newConditions });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTemplate = getCurrentTemplate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Toewijzingsformulier Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="assetType">Asset Type</Label>
            <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer asset type" />
              </SelectTrigger>
              <SelectContent>
                {settings.assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {Object.keys(templates).length > 0 && selectedAssetType && (
            <div className="flex-1">
              <Label htmlFor="copyFrom">Kopieer van ander type</Label>
              <Select onValueChange={copyFromOtherType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type om te kopiëren" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templates)
                    .filter(type => type !== selectedAssetType)
                    .map((type) => (
                      <SelectItem key={type} value={type}>
                        <Copy className="h-4 w-4 mr-2 inline" />
                        {type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedAssetType && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Formulier Titel</Label>
              <Input
                id="title"
                value={currentTemplate.title}
                onChange={(e) => updateCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                placeholder="Titel van het formulier"
              />
            </div>

            <div>
              <Label htmlFor="headerText">Header Tekst</Label>
              <Textarea
                id="headerText"
                value={currentTemplate.headerText}
                onChange={(e) => updateCurrentTemplate({ ...currentTemplate, headerText: e.target.value })}
                placeholder="Introductie tekst bovenaan het formulier"
                rows={3}
              />
            </div>

            <div>
              <Label>Voorwaarden en Verantwoordelijkheden</Label>
              <div className="space-y-2 mt-2">
                {currentTemplate.conditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder={`Voorwaarde ${index + 1}`}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    disabled={currentTemplate.conditions.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="w-full"
                >
                  + Voorwaarde Toevoegen
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="footerText">Footer Tekst</Label>
              <Textarea
                id="footerText"
                value={currentTemplate.footerText}
                onChange={(e) => updateCurrentTemplate({ ...currentTemplate, footerText: e.target.value })}
                placeholder="Tekst onderaan het formulier"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userLabel">Gebruiker Handtekening Label</Label>
                <Input
                  id="userLabel"
                  value={currentTemplate.signatureFields.userLabel}
                  onChange={(e) => updateCurrentTemplate({
                    ...currentTemplate,
                    signatureFields: { ...currentTemplate.signatureFields, userLabel: e.target.value }
                  })}
                  placeholder="Label voor gebruiker handtekening"
                />
              </div>
              <div>
                <Label htmlFor="adminLabel">Beheerder Handtekening Label</Label>
                <Input
                  id="adminLabel"
                  value={currentTemplate.signatureFields.adminLabel}
                  onChange={(e) => updateCurrentTemplate({
                    ...currentTemplate,
                    signatureFields: { ...currentTemplate.signatureFields, adminLabel: e.target.value }
                  })}
                  placeholder="Label voor beheerder handtekening"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={saveTemplates} disabled={isSaving || !selectedAssetType} className="flex-1">
            {isSaving ? (
              "Opslaan..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Alle Templates Opslaan
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetCurrentTemplate} disabled={!selectedAssetType}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset {selectedAssetType}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};