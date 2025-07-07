
import { useState } from "react";
import { Lightbox } from "./Lightbox";

interface AssetImageProps {
  image?: string;
  brand?: string;
  model?: string;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const AssetImage = ({ image, brand, model, icon, size = "md" }: AssetImageProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const imageAlt = `${brand} ${model}`;

  return (
    <div className="flex-shrink-0">
      {image ? (
        <>
          <img
            src={image}
            alt={imageAlt}
            className={`${sizeClasses[size]} object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => setIsLightboxOpen(true)}
          />
          <Lightbox
            isOpen={isLightboxOpen}
            onClose={() => setIsLightboxOpen(false)}
            imageSrc={image}
            imageAlt={imageAlt}
          />
        </>
      ) : (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      )}
    </div>
  );
};
