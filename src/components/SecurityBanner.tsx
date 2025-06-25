
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SecurityBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);

  useEffect(() => {
    // Check for potential security issues
    const issues: string[] = [];
    
    // Check if running on HTTP instead of HTTPS (except localhost)
    if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
      issues.push('Verbinding niet beveiligd (HTTP)');
    }
    
    // Check for browser security features
    if (!window.crypto || !window.crypto.getRandomValues) {
      issues.push('Browser ondersteunt geen veilige cryptografie');
    }
    
    // Check for mixed content (if applicable)
    if (window.location.protocol === 'https:' && document.querySelector('[src^="http:"]')) {
      issues.push('Gemengde content gedetecteerd');
    }
    
    setSecurityIssues(issues);
    setShowBanner(issues.length > 0);
  }, []);

  if (!showBanner || securityIssues.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Shield className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong className="text-orange-800">Beveiligingswaarschuwing:</strong>
          <ul className="mt-1 text-sm text-orange-700">
            {securityIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBanner(false)}
          className="text-orange-600 hover:text-orange-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
