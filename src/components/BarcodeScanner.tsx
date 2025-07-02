
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
      qrbox: { width: 300, height: 200 },
      aspectRatio: 1.77, // 16:9 aspect ratio for better camera view
      disableFlip: false,
      videoConstraints: {
        facingMode: "environment" // Use back camera on mobile devices
      },
      formatsToSupport: [
        // Support multiple barcode formats
        0, // QR_CODE
        1, // AZTEC
        2, // CODABAR
        3, // CODE_128
        4, // CODE_39
        5, // CODE_93
        6, // DATA_MATRIX
        7, // EAN_13
        8, // EAN_8
        9, // ITF
        10, // MAXICODE
        11, // PDF_417
        12, // RSS_14
        13, // RSS_EXPANDED
        14, // UPC_A
        15, // UPC_E
        16, // UPC_EAN_EXTENSION
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
      if (!errorMessage.includes("No MultiFormat Readers were able to detect the code")) {
        console.log("Scan error:", errorMessage);
      }
    };

    try {
      scanner.render(onScanSuccess, onScanError);
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Failed to start camera. Please check camera permissions.");
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
            Richt de camera op de barcode van het asset. Ondersteunt QR codes en verschillende barcode formaten.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Zorg ervoor dat je camera toegang hebt gegeven aan deze website.
              </p>
            </div>
          )}
          
          <div id="barcode-reader" className="w-full min-h-[300px]"></div>
          
          {isScanning && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Scanner actief... Houd de barcode binnen het kader.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
};
