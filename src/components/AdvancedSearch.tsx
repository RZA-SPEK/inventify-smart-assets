
import { useState } from 'react';
import { Search, Save, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  category: string;
  status: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  assignedTo: string;
  brand: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const { savedSearches, saveSearch, deleteSearch } = useSavedSearches();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    status: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    assignedTo: '',
    brand: '',
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClear = () => {
    const emptyFilters: SearchFilters = {
      query: '',
      category: '',
      status: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      assignedTo: '',
      brand: '',
    };
    setFilters(emptyFilters);
    onClear();
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Naam vereist",
        description: "Voer een naam in voor de opgeslagen zoekopdracht.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await saveSearch(searchName, filters);
    if (error) {
      toast({
        title: "Fout bij opslaan",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Zoekopdracht opgeslagen",
        description: `"${searchName}" is succesvol opgeslagen.`,
      });
      setSearchName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadSearch = (search: any) => {
    const searchFilters = search.search_criteria as SearchFilters;
    setFilters(searchFilters);
    onSearch(searchFilters);
  };

  const handleDeleteSearch = async (id: string, name: string) => {
    const { error } = await deleteSearch(id);
    if (error) {
      toast({
        title: "Fout bij verwijderen",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Zoekopdracht verwijderd",
        description: `"${name}" is verwijderd.`,
      });
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Geavanceerd zoeken</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} filter(s)</Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Klik om uitgebreide zoekopties te tonen
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Zoekterm</Label>
                <Input
                  id="search-query"
                  placeholder="Zoek in alle velden..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categorie</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle categorieën</SelectItem>
                    <SelectItem value="ICT">ICT</SelectItem>
                    <SelectItem value="Facilitair">Facilitair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle statussen</SelectItem>
                    <SelectItem value="In voorraad">In voorraad</SelectItem>
                    <SelectItem value="In gebruik">In gebruik</SelectItem>
                    <SelectItem value="Defect">Defect</SelectItem>
                    <SelectItem value="Onderhoud">Onderhoud</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Locatie</Label>
                <Input
                  id="location"
                  placeholder="Locatie..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Merk</Label>
                <Input
                  id="brand"
                  placeholder="Merk..."
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned-to">Toegewezen aan</Label>
                <Input
                  id="assigned-to"
                  placeholder="E-mailadres..."
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Aankoopdatum vanaf</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Aankoopdatum tot</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={handleClear} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Wis filters
              </Button>
              <Button onClick={() => setShowSaveDialog(true)} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Zoekopdracht opslaan
              </Button>
            </div>

            {savedSearches.length > 0 && (
              <div className="space-y-2">
                <Label>Opgeslagen zoekopdrachten</Label>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLoadSearch(search)}
                      >
                        {search.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(search.id, search.name)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSaveDialog && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="search-name">Naam voor zoekopdracht</Label>
                  <Input
                    id="search-name"
                    placeholder="Bijv. ICT assets in Amsterdam"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleSaveSearch} size="sm">
                    Opslaan
                  </Button>
                  <Button onClick={() => setShowSaveDialog(false)} variant="outline" size="sm">
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
