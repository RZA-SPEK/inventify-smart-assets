
interface InsertDescriptionProps {
  tableName: string;
  newValues: any;
}

export const InsertDescription = ({ tableName, newValues }: InsertDescriptionProps) => {
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
