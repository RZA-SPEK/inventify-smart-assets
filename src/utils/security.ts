
// Security utility functions for input validation and sanitization

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS vectors
  const sanitized = input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
    
  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSerialNumber = (serialNumber: string): boolean => {
  // Serial numbers should be alphanumeric with hyphens/underscores
  const serialRegex = /^[A-Za-z0-9\-_]+$/;
  return serialRegex.test(serialNumber) && serialNumber.length >= 3 && serialNumber.length <= 50;
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj >= new Date('1990-01-01');
};

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Alleen JPEG, PNG en WebP bestanden zijn toegestaan' };
  }
  
  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Bestand is te groot (maximaal 5MB)' };
  }
  
  return { valid: true };
};

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
