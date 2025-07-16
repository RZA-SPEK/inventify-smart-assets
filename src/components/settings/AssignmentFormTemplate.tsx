import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Save, RotateCcw } from 'lucide-react';

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
  const [template, setTemplate] = useState<AssignmentFormTemplate>(DEFAULT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings_data')
        .eq('id', 'assignment_form_template')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings_data) {
        const templateData = data.settings_data as unknown as AssignmentFormTemplate;
        setTemplate({ ...DEFAULT_TEMPLATE, ...templateData });
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon de formuliertemplate niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Gebruiker niet ingelogd');

      // Check if template exists
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('id', 'assignment_form_template')
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing template
        result = await supabase
          .from('system_settings')
          .update({
            settings_data: template as unknown as any,
            updated_by: user.user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'assignment_form_template');
      } else {
        // Create new template
        result = await supabase
          .from('system_settings')
          .insert({
            id: 'assignment_form_template',
            settings_data: template as unknown as any,
            updated_by: user.user.id
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Template opgeslagen",
        description: "Formuliertemplate is succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon de template niet opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    toast({
      title: "Template gereset",
      description: "Formuliertemplate is teruggezet naar standaard waarden.",
    });
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...template.conditions];
    newConditions[index] = value;
    setTemplate({ ...template, conditions: newConditions });
  };

  const addCondition = () => {
    setTemplate({
      ...template,
      conditions: [...template.conditions, 'Nieuwe voorwaarde']
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = template.conditions.filter((_, i) => i !== index);
    setTemplate({ ...template, conditions: newConditions });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Toewijzingsformulier Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Formulier Titel</Label>
            <Input
              id="title"
              value={template.title}
              onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              placeholder="Titel van het formulier"
            />
          </div>

          <div>
            <Label htmlFor="headerText">Header Tekst</Label>
            <Textarea
              id="headerText"
              value={template.headerText}
              onChange={(e) => setTemplate({ ...template, headerText: e.target.value })}
              placeholder="Introductie tekst bovenaan het formulier"
              rows={3}
            />
          </div>

          <div>
            <Label>Voorwaarden en Verantwoordelijkheden</Label>
            <div className="space-y-2 mt-2">
              {template.conditions.map((condition, index) => (
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
                    disabled={template.conditions.length <= 1}
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
              value={template.footerText}
              onChange={(e) => setTemplate({ ...template, footerText: e.target.value })}
              placeholder="Tekst onderaan het formulier"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userLabel">Gebruiker Handtekening Label</Label>
              <Input
                id="userLabel"
                value={template.signatureFields.userLabel}
                onChange={(e) => setTemplate({
                  ...template,
                  signatureFields: { ...template.signatureFields, userLabel: e.target.value }
                })}
                placeholder="Label voor gebruiker handtekening"
              />
            </div>
            <div>
              <Label htmlFor="adminLabel">Beheerder Handtekening Label</Label>
              <Input
                id="adminLabel"
                value={template.signatureFields.adminLabel}
                onChange={(e) => setTemplate({
                  ...template,
                  signatureFields: { ...template.signatureFields, adminLabel: e.target.value }
                })}
                placeholder="Label voor beheerder handtekening"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={saveTemplate} disabled={isSaving} className="flex-1">
            {isSaving ? (
              "Opslaan..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Template Opslaan
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetTemplate}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};