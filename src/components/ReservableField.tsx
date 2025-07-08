
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ReservableFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const ReservableField = ({ checked, onCheckedChange }: ReservableFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="reservable"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor="reservable"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Reserveerbaar
      </Label>
      <p className="text-xs text-gray-600 ml-2">
        Wanneer aangevinkt kunnen gebruikers dit asset reserveren
      </p>
    </div>
  );
};
