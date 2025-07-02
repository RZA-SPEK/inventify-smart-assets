
interface DeleteDescriptionProps {
  tableName: string;
  oldValues: any;
}

export const DeleteDescription = ({ tableName, oldValues }: DeleteDescriptionProps) => {
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
