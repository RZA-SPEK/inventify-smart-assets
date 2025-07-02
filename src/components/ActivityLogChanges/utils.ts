
export const getAssetSpecificChange = (field: string, oldValue: string, newValue: string) => {
  switch (field) {
    case 'status':
      return `Status gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'location':
      return `Locatie verplaatst van "${oldValue}" naar "${newValue}"`;
    case 'assigned_to':
      return oldValue === 'Leeg' 
        ? `Toegewezen aan ${newValue}`
        : newValue === 'Leeg'
        ? `Niet meer toegewezen (was: ${oldValue})`
        : `Toegewezen gewijzigd van ${oldValue} naar ${newValue}`;
    case 'assigned_to_location':
      return oldValue === 'Leeg'
        ? `Specifieke locatie toegewezen: ${newValue}`
        : newValue === 'Leeg'
        ? `Specifieke locatie verwijderd (was: ${oldValue})`
        : `Specifieke locatie gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'category':
      return `Categorie gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'purchase_price':
      return `Aankoopprijs gewijzigd van €${oldValue} naar €${newValue}`;
    case 'penalty_amount':
      return `Boetebedrag gewijzigd van €${oldValue} naar €${newValue}`;
    case 'condition_notes':
      return oldValue === 'Leeg'
        ? `Conditie notitie toegevoegd: "${newValue}"`
        : newValue === 'Leeg'
        ? `Conditie notitie verwijderd`
        : `Conditie notitie gewijzigd`;
    case 'brand':
      return `Merk gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'model':
      return `Model gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'serial_number':
      return `Serienummer gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'asset_tag':
      return oldValue === 'Leeg'
        ? `Asset tag toegevoegd: ${newValue}`
        : newValue === 'Leeg'
        ? `Asset tag verwijderd`
        : `Asset tag gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'type':
      return `Type gewijzigd van "${oldValue}" naar "${newValue}"`;
    case 'purchase_date':
      return `Aankoopdatum gewijzigd van ${oldValue} naar ${newValue}`;
    case 'warranty_expiry':
      return oldValue === 'Leeg'
        ? `Garantie einddatum toegevoegd: ${newValue}`
        : newValue === 'Leeg'
        ? `Garantie einddatum verwijderd`
        : `Garantie einddatum gewijzigd van ${oldValue} naar ${newValue}`;
    case 'last_maintenance':
      return oldValue === 'Leeg'
        ? `Laatste onderhoud datum toegevoegd: ${newValue}`
        : newValue === 'Leeg'
        ? `Laatste onderhoud datum verwijderd`
        : `Laatste onderhoud datum gewijzigd van ${oldValue} naar ${newValue}`;
    case 'next_maintenance':
      return oldValue === 'Leeg'
        ? `Volgende onderhoud datum toegevoegd: ${newValue}`
        : newValue === 'Leeg'
        ? `Volgende onderhoud datum verwijderd`
        : `Volgende onderhoud datum gewijzigd van ${oldValue} naar ${newValue}`;
    default:
      const fieldName = getFieldDisplayName(field);
      return `${fieldName}: ${oldValue} → ${newValue}`;
  }
};

export const getFieldDisplayName = (fieldName: string) => {
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
    'email': 'E-mail',
    'purchase_date': 'Aankoopdatum',
    'warranty_expiry': 'Garantie einddatum',
    'last_maintenance': 'Laatste onderhoud',
    'next_maintenance': 'Volgende onderhoud'
  };
  
  return fieldMap[fieldName] || fieldName;
};

export const formatValue = (value: any) => {
  if (value === null || value === undefined) return 'Leeg';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
  if (typeof value === 'string' && value === '') return 'Leeg';
  return String(value);
};
