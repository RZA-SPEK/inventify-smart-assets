
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
}

export const ImageUpload = ({ currentImage, onImageChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Asset Foto</Label>
      <div className="flex flex-col space-y-3">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Asset preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 w-fit"
        >
          <Upload className="h-4 w-4" />
          {preview ? "Foto Wijzigen" : "Foto Toevoegen"}
        </Button>
      </div>
    </div>
  );
};
