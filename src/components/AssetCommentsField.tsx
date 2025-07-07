
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AssetCommentsFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const AssetCommentsField = ({ value, onChange }: AssetCommentsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="comments">Opmerkingen</Label>
      <Textarea
        id="comments"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Voeg opmerkingen toe over dit asset..."
        className="min-h-[100px]"
      />
    </div>
  );
};
