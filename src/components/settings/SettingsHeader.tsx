
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface SettingsHeaderProps {
  currentRole: string;
}

export const SettingsHeader = ({ currentRole }: SettingsHeaderProps) => {
  return (
    <>
      {currentRole === "ICT Admin" && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Als ICT Admin heeft u volledige toegang tot alle systeeminstellingen en configuraties.
          </AlertDescription>
        </Alert>
      )}

      {currentRole === "Facilitair Admin" && (
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Shield className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            Als Facilitair Admin kunt u instellingen beheren die gerelateerd zijn aan facilitaire assets.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
