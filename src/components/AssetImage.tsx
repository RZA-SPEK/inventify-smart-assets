
interface AssetImageProps {
  image?: string;
  brand?: string;
  model?: string;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const AssetImage = ({ image, brand, model, icon, size = "md" }: AssetImageProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  return (
    <div className="flex-shrink-0">
      {image ? (
        <img
          src={image}
          alt={`${brand} ${model}`}
          className={`${sizeClasses[size]} object-cover rounded-lg`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      )}
    </div>
  );
};
