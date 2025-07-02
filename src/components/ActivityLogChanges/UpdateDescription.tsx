
import { getAssetSpecificChange } from "./utils";
import { formatValue, getFieldDisplayName } from "./utils";

interface UpdateDescriptionProps {
  tableName: string;
  oldValues: any;
  newValues: any;
}

export const UpdateDescription = ({ tableName, oldValues, newValues }: UpdateDescriptionProps) => {
  if (!oldValues || !newValues) return 'Record bijgewerkt';
  
  const changes: string[] = [];
  
  // Compare old and new values to find what changed
  Object.keys(newValues).forEach(key => {
    if (oldValues[key] !== newValues[key] && key !== 'updated_at' && key !== 'created_at') {
      const oldValue = formatValue(oldValues[key]);
      const newValue = formatValue(newValues[key]);
      
      // Special handling for asset-specific fields
      if (tableName === 'assets') {
        changes.push(getAssetSpecificChange(key, oldValue, newValue));
      } else {
        const fieldName = getFieldDisplayName(key);
        changes.push(`${fieldName}: ${oldValue} → ${newValue}`);
      }
    }
  });

  if (changes.length === 0) return 'Record bijgewerkt (geen zichtbare wijzigingen)';
  
  return changes.join(', ');
};
