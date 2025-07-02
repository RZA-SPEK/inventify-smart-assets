
import { Badge } from "@/components/ui/badge";
import { InsertDescription } from "./InsertDescription";
import { UpdateDescription } from "./UpdateDescription";
import { DeleteDescription } from "./DeleteDescription";
import { TechnicalDetails } from "./TechnicalDetails";

interface ActivityLogChangesProps {
  action: string;
  tableName: string;
  oldValues: any;
  newValues: any;
}

export const ActivityLogChanges = ({ action, tableName, oldValues, newValues }: ActivityLogChangesProps) => {
  const getChangeDescription = () => {
    if (action === 'INSERT') {
      return <InsertDescription tableName={tableName} newValues={newValues} />;
    } else if (action === 'UPDATE') {
      return <UpdateDescription tableName={tableName} oldValues={oldValues} newValues={newValues} />;
    } else if (action === 'DELETE') {
      return <DeleteDescription tableName={tableName} oldValues={oldValues} />;
    }
    return 'Onbekende actie';
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-900">
        {getChangeDescription()}
      </div>
      
      <TechnicalDetails action={action} oldValues={oldValues} newValues={newValues} />
    </div>
  );
};
