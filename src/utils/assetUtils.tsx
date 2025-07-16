
import React from "react";
import { Laptop, Smartphone, Headphones, Monitor, Coffee, Printer, Camera, Tablet, Router, Package } from "lucide-react";

export const getAssetIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'laptop': return <Laptop className="h-4 w-4" />;
    case 'smartphone': return <Smartphone className="h-4 w-4" />;
    case 'headset': return <Headphones className="h-4 w-4" />;
    case 'monitor': return <Monitor className="h-4 w-4" />;
    case 'desk': return <Package className="h-4 w-4" />;
    case 'coffee machine': return <Coffee className="h-4 w-4" />;
    case 'printer': return <Printer className="h-4 w-4" />;
    case 'camera': return <Camera className="h-4 w-4" />;
    case 'tablet': return <Tablet className="h-4 w-4" />;
    case 'router': return <Router className="h-4 w-4" />;
    default: return <Laptop className="h-4 w-4" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'In voorraad': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'In gebruik': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Defect': return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'Onderhoud': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'Deleted': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case 'ICT': return 'ICT';
    case 'Facilitair': return 'Facilitair';
    case 'Catering': return 'Catering';
    case 'Logistiek': return 'Logistiek';
    default: return category;
  }
};
