
export interface Asset {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber?: string;
  assetTag?: string;
  status: "In voorraad" | "In gebruik" | "Defect" | "Onderhoud" | "Deleted";
  location: string;
  assignedTo?: string;
  assignedToLocation?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  purchasePrice?: number;
  penaltyAmount?: number;
  category: "ICT" | "Facilitair" | "Catering" | "Logistics";
  image?: string;
}
