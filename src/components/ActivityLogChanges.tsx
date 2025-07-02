
import { Badge } from "@/components/ui/badge";

interface ActivityLogChangesProps {
  action: string;
  tableName: string;
  oldValues: any;
  newValues: any;
}

export const ActivityLogChanges = ({ action, tableName, oldValues, newValues }: ActivityLogChangesProps) => {
  const getChangeDescription = () => {
    if (action === 'INSERT') {
      return getInsertDescription();
    } else if (action === 'UPDATE') {
      return getUpdateDescription();
    } else if (action === 'DELETE') {
      return getDeleteDescription();
    }
    return 'Onbekende actie';
  };

  const getInsertDescription = () => {
    if (!newValues) return 'Nieuw record aangemaakt';
    
    switch (tableName) {
      case 'assets':
        return `Nieuw asset aangemaakt: ${newValues.type || 'Onbekend type'} - ${newValues.brand || ''} ${newValues.model || ''}`.trim();
      case 'reservations':
        return `Nieuwe reservering aangemaakt voor ${newValues.requester_name || 'onbekende gebruiker'}`;
      case 'maintenance_history':
        return `Nieuw onderhoud geregistreerd: ${newValues.maintenance_type || 'Onbekend type'}`;
      case 'profiles':
        return `Nieuw profiel aangemaakt voor ${newValues.email || 'onbekende gebruiker'}`;
      default:
        return 'Nieuw record aangemaakt';
    }
  };

  const getUpdateDescription = () => {
    if (!oldValues || !newValues) return 'Record bijgewerkt';
    
    const changes = [];
    
    // Compare old and new values to find what changed
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key] && key !== 'updated_at') {
        const fieldName = getFieldDisplayName(key);
        const oldValue = formatValue(oldValues[key]);
        const newValue = formatValue(newValues[key]);
        changes.push(`${fieldName}: ${oldValue} → ${newValue}`);
      }
    });

    if (changes.length === 0) return 'Record bijgewerkt (geen zichtbare wijzigingen)';
    
    return changes.join(', ');
  };

  const getDeleteDescription = () => {
    if (!oldValues) return 'Record verwijderd';
    
    switch (tableName) {
      case 'assets':
        return `Asset verwijderd: ${oldValues.type || 'Onbekend type'} - ${oldValues.brand || ''} ${oldValues.model || ''}`.trim();
      case 'reservations':
        return `Reservering verwijderd van ${oldValues.requester_name || 'onbekende gebruiker'}`;
      case 'maintenance_history':
        return `Onderhoudsrecord verwijderd: ${oldValues.maintenance_type || 'Onbekend type'}`;
      default:
        return 'Record verwijderd';
    }
  };

  const getFieldDisplayName = (fieldName: string) => {
    const fieldMap: { [key: string]: string } = {
      'status': 'Status',
      'location': 'Locatie',
      'assigned_to': 'Toegewezen aan',
      'assigned_to_location': 'Toegewezen locatie',
      'category': 'Categorie',
      'type': 'Type',
      'brand': 'Merk',
      'model': 'Model',
      'serial_number': 'Serienummer',
      'asset_tag': 'Asset tag',
      'purchase_price': 'Aankoopprijs',
      'penalty_amount': 'Boetebedrag',
      'condition_notes': 'Conditie notities',
      'role': 'Rol',
      'full_name': 'Volledige naam',
      'email': 'E-mail'
    };
    
    return fieldMap[fieldName] || fieldName;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'Leeg';
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
    if (typeof value === 'string' && value === '') return 'Leeg';
    return String(value);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-900">
        {getChangeDescription()}
      </div>
      
      {action === 'UPDATE' && oldValues && newValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-2">
            <div>
              <strong>Voor:</strong>
              <pre className="whitespace-pre-wrap break-all mt-1">
                {JSON.stringify(oldValues, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Na:</strong>
              <pre className="whitespace-pre-wrap break-all mt-1">
                {JSON.stringify(newValues, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
      
      {action === 'INSERT' && newValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Gegevens:</strong>
            <pre className="whitespace-pre-wrap break-all mt-1">
              {JSON.stringify(newValues, null, 2)}
            </pre>
          </div>
        </details>
      )}
      
      {action === 'DELETE' && oldValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Verwijderde gegevens:</strong>
            <pre className="whitespace-pre-wrap break-all mt-1">
              {JSON.stringify(oldValues, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};
