
export interface Asset {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  assetTag?: string;
  purchaseDate: string;
  status: "In voorraad" | "In gebruik" | "Defect" | "Onderhoud" | "Deleted";
  location: string;
  category: "ICT" | "Facilitair" | "Catering" | "Logistics";
  assignedTo?: string;
  assignedToLocation?: string;
  image?: string;
  purchasePrice?: number;
  penaltyAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
