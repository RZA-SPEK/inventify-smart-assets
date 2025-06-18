
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const scanner = new Html5QrcodeScanner("barcode-reader", config, false);
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      console.log("Barcode scanned:", decodedText);
      onScan(decodedText);
      scanner.clear();
      setIsScanning(false);
    };

    const onScanError = (errorMessage: string) => {
      console.log("Scan error:", errorMessage);
    };

    scanner.render(onScanSuccess, onScanError);
    setIsScanning(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Asset Barcode</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Richt de camera op de barcode van het asset
          </p>
          <div id="barcode-reader" className="w-full"></div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
};
