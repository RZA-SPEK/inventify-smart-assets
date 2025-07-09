
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { X, Camera, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const elementRef = useRef<HTMLDivElement>(null);

  const addDebugInfo = (info: string) => {
    console.log('BarcodeScanner:', info);
    setDebugInfo(prev => [...prev.slice(-4), info]);
  };

  const isMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobileUA || (isTouchDevice && isSmallScreen);
  };

  useEffect(() => {
    addDebugInfo("Component mounted, initializing scanner...");
    
    if (!elementRef.current) {
      addDebugInfo("ERROR: Scanner element not found");
      return;
    }

    const deviceType = isMobileDevice() ? "Mobile" : "Desktop";
    addDebugInfo(`Device type: ${deviceType}`);

    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API niet beschikbaar in deze browser");
      addDebugInfo("ERROR: Camera API not available");
      return;
    }

    addDebugInfo("Camera API available");

    // Wait a bit to ensure DOM is ready
    const initTimer = setTimeout(() => {
      initializeScanner();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, []);

  const initializeScanner = () => {
    try {
      const isMobile = isMobileDevice();
      
      // Enhanced configuration for better barcode support
      const config = {
        fps: isMobile ? 8 : 15,
        qrbox: { width: isMobile ? 250 : 300, height: isMobile ? 150 : 200 },
        aspectRatio: isMobile ? 1.67 : 1.5,
        disableFlip: false,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.RSS_14,
          Html5QrcodeSupportedFormats.RSS_EXPANDED
        ],
        // Enhanced camera settings
        videoConstraints: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        // Additional settings for better recognition
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      addDebugInfo(`Scanner config: FPS=${config.fps}, QRBox=${JSON.stringify(config.qrbox)}`);

      scannerRef.current = new Html5QrcodeScanner(
        "barcode-reader",
        config,
        false
      );

      addDebugInfo("Starting scanner render...");

      scannerRef.current.render(
        (decodedText: string) => {
          addDebugInfo(`Successfully scanned: ${decodedText}`);
          setSuccessMessage("Barcode succesvol gescand!");
          
          // Clean up any extra whitespace or formatting
          const cleanedText = decodedText.trim();
          
          setTimeout(() => {
            onScan(cleanedText);
            cleanup();
            onClose();
          }, 1000);
        },
        (error: string) => {
          // Only log significant errors, not scanning attempts
          if (!error.includes("NotFoundException") && 
              !error.includes("No MultiFormat Readers") &&
              !error.includes("No barcode or QR code detected")) {
            addDebugInfo(`Scan error: ${error}`);
          }
        }
      );

      addDebugInfo("Scanner rendered successfully");
      setIsScanning(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Onbekende fout";
      addDebugInfo(`Scanner initialization error: ${errorMessage}`);
      setError(`Scanner kon niet worden gestart: ${errorMessage}`);
    }
  };

  const cleanup = () => {
    addDebugInfo("Cleaning up scanner...");
    
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
        addDebugInfo("Scanner cleaned up successfully");
      } catch (err) {
        addDebugInfo("Error during cleanup: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    }
    
    setIsScanning(false);
  };

  const requestCameraPermission = async () => {
    try {
      addDebugInfo("Requesting camera permission...");
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobileDevice() ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setError("");
      initializeScanner();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Onbekende fout";
      setError(`Camera toegang geweigerd: ${errorMessage}`);
      addDebugInfo(`Camera permission error: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <Button 
                className="mt-2" 
                size="sm" 
                onClick={requestCameraPermission}
              >
                Camera Toegang Opnieuw Proberen
              </Button>
            </div>
          )}

          <div 
            ref={elementRef}
            id="barcode-reader" 
            className="w-full"
            style={{ minHeight: '300px' }}
          />
          
          {!isScanning && !error && (
            <div className="text-center text-gray-500">
              Scanner wordt geladen...
            </div>
          )}

          {/* Debug information */}
          {debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug informatie:</strong>
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600">{info}</div>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            <div className="mb-2">
              <strong>Tips voor betere scanning:</strong>
            </div>
            <ul className="text-xs space-y-1">
              <li>• Zorg voor goede belichting</li>
              <li>• Houd de barcode stabiel in beeld</li>
              <li>• Probeer verschillende afstanden</li>
              <li>• Zorg dat de barcode volledig zichtbaar is</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
