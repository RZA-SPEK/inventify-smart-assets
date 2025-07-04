
import { User, MapPin } from "lucide-react";

interface AssetAssignmentInfoProps {
  assignedTo?: string;
  location: string;
  assignedToLocation?: string;
}

export const AssetAssignmentInfo = ({ assignedTo, location, assignedToLocation }: AssetAssignmentInfoProps) => {
  return (
    <>
      {assignedTo && (
        <div className="flex items-center space-x-1 mb-2">
          <User className="h-3 w-3" />
          <span className="text-sm">{assignedTo}</span>
        </div>
      )}
      
      <div className="flex flex-col space-y-1 text-sm text-gray-600 mb-3">
        <span>{location}</span>
        {assignedToLocation && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-blue-500" />
            <span className="text-xs">{assignedToLocation}</span>
          </div>
        )}
      </div>
    </>
  );
};
