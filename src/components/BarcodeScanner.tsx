
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
        // Make scanning box responsive
        const minEdgePercentage = 0.7;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: Math.min(qrboxSize, 300),
          height: Math.min(qrboxSize * 0.7, 200)
        };
      },
      aspectRatio: 1.777778, // 16:9 aspect ratio
      disableFlip: false,
      videoConstraints: {
        facingMode: "environment", // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      rememberLastUsedCamera: true,
      supportedScanTypes: [
        // Support multiple barcode formats
        0, // QR_CODE
        3, // CODE_128
        4, // CODE_39
        7, // EAN_13
        8, // EAN_8
        14, // UPC_A
        15, // UPC_E
      ]
    };

    const scanner = new Html5QrcodeScanner("barcode-reader", config, false);
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      console.log("Barcode scanned successfully:", decodedText);
      console.log("Scan result:", decodedResult);
      onScan(decodedText);
      scanner.clear().catch(console.error);
      setIsScanning(false);
    };

    const onScanError = (errorMessage: string) => {
      // Only log actual errors, not scanning attempts
      if (!errorMessage.includes("No MultiFormat Readers were able to detect the code") && 
          !errorMessage.includes("QR code parse error")) {
        console.log("Scan error:", errorMessage);
      }
    };

    try {
      scanner.render(onScanSuccess, onScanError);
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Camera kon niet worden gestart. Controleer camera permissies.");
    }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Scan Asset Barcode</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Richt de camera op de barcode. Werkt met QR codes en barcodes.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Zorg dat je camera toegang hebt gegeven.
              </p>
            </div>
          )}
          
          <div id="barcode-reader" className="w-full min-h-[250px] max-h-[400px]"></div>
          
          {isScanning && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Camera className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-gray-500">
                  Camera actief - Houd barcode in beeld
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button variant="outline" onClick={handleClose} className="w-full">
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
};
