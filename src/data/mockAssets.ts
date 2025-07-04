
import { Asset } from "@/types/asset";

export const mockAssets: Asset[] = [
  {
    id: "1",
    type: "Laptop",
    brand: "Dell",
    model: "Latitude 7420",
    serialNumber: "DL7420001",
    status: "In voorraad",
    location: "Amsterdam HQ",
    purchaseDate: "2023-01-15",
    warrantyExpiry: "2026-01-15",
    purchasePrice: 1299.99,
    penaltyAmount: 500.00,
    category: "ICT",
    image: "/placeholder.svg"
  },
  {
    id: "2",
    type: "Smartphone",
    brand: "Apple",
    model: "iPhone 14",
    serialNumber: "IP14002",
    status: "In gebruik",
    location: "Amsterdam HQ",
    assignedTo: "jan.janssen@company.com",
    purchaseDate: "2023-03-20",
    warrantyExpiry: "2024-03-20",
    purchasePrice: 899.99,
    penaltyAmount: 400.00,
    category: "ICT"
  },
  {
    id: "3",
    type: "Headset",
    brand: "Jabra",
    model: "Evolve2 65",
    serialNumber: "JB65003",
    status: "In voorraad",
    location: "Rotterdam Office",
    purchaseDate: "2023-05-10",
    warrantyExpiry: "2025-05-10",
    purchasePrice: 229.99,
    penaltyAmount: 100.00,
    category: "ICT"
  },
  {
    id: "4",
    type: "Monitor",
    brand: "LG",
    model: "UltraWide 34\"",
    serialNumber: "LG34004",
    status: "In gebruik",
    location: "Amsterdam HQ",
    assignedTo: "marie.peeters@company.com",
    purchaseDate: "2023-02-28",
    warrantyExpiry: "2026-02-28",
    purchasePrice: 449.99,
    penaltyAmount: 200.00,
    category: "ICT"
  },
  {
    id: "5",
    type: "Desk",
    brand: "IKEA",
    model: "Bekant",
    serialNumber: "IK005",
    status: "In voorraad",
    location: "Rotterdam Office",
    purchaseDate: "2023-01-10",
    purchasePrice: 149.99,
    penaltyAmount: 75.00,
    category: "Facilitair"
  }
];
