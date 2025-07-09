
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "./ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssetImage {
  id: string;
  asset_id: string;
  image_url: string;
  image_order: number;
  description?: string;
  created_at: string;
}

interface AssetImageGalleryProps {
  assetId: string;
  canEdit?: boolean;
}

export const AssetImageGallery = ({ assetId, canEdit = false }: AssetImageGalleryProps) => {
  const [images, setImages] = useState<AssetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<AssetImage | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [assetId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_images')
        .select('*')
        .eq('asset_id', assetId)
        .order('image_order', { ascending: true });

      if (error) {
        console.error('Error fetching asset images:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de afbeeldingen.",
          variant: "destructive",
        });
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error fetching asset images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Validatiefout",
        description: "Selecteer eerst een afbeelding.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('asset_images')
        .insert({
          asset_id: assetId,
          image_url: newImageUrl,
          description: newImageDescription || null,
          image_order: images.length
        });

      if (error) {
        console.error('Error adding image:', error);
        toast({
          title: "Fout bij toevoegen",
          description: "Er is een fout opgetreden bij het toevoegen van de afbeelding.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Afbeelding toegevoegd",
        description: "De afbeelding is succesvol toegevoegd.",
      });

      setNewImageUrl("");
      setNewImageDescription("");
      setShowAddDialog(false);
      fetchImages();
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('asset_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Fout bij verwijderen",
          description: "Er is een fout opgetreden bij het verwijderen van de afbeelding.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Afbeelding verwijderd",
        description: "De afbeelding is succesvol verwijderd.",
      });

      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Afbeeldingen ({images.length})
        </h3>
        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Afbeelding toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe afbeelding toevoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ImageUpload
                  currentImage={newImageUrl}
                  onImageChange={(url) => setNewImageUrl(url || "")}
                />
                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving (optioneel)</Label>
                  <Input
                    id="description"
                    value={newImageDescription}
                    onChange={(e) => setNewImageDescription(e.target.value)}
                    placeholder="Beschrijf de afbeelding..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleAddImage}>
                    Toevoegen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Geen afbeeldingen toegevoegd</p>
            {canEdit && (
              <p className="text-sm text-gray-400 mt-2">
                Klik op "Afbeelding toevoegen" om te beginnen
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={image.image_url}
                    alt={image.description || `Afbeelding ${index + 1}`}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  {canEdit && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Badge className="absolute bottom-2 left-2 bg-black/60 text-white">
                    {index + 1}
                  </Badge>
                </div>
                {image.description && (
                  <div className="p-3">
                    <p className="text-sm text-gray-600">{image.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox for viewing images */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.description || "Asset afbeelding"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {images.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/60 text-white border-white/20"
                      onClick={() => {
                        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                        setSelectedImage(images[prevIndex]);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/60 text-white border-white/20"
                      onClick={() => {
                        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                        setSelectedImage(images[nextIndex]);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/60 text-white border-white/20"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {selectedImage.description && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded">
                  <p>{selectedImage.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
