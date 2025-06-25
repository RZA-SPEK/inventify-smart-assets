
// Enhanced security utility functions for input validation and sanitization

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Comprehensive XSS protection
  const sanitized = input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url() functions
    .replace(/style\s*=/gi, '') // Remove style attributes
    .replace(/src\s*=/gi, '') // Remove src attributes
    .replace(/href\s*=/gi, '') // Remove href attributes
    .trim();
    
  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Wachtwoord moet minimaal 8 karakters lang zijn');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één speciaal karakter bevatten');
  }
  
  return { valid: errors.length === 0, errors };
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
  
  // Check for malicious file names
  const dangerousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.vbs$/i];
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'Bestandstype niet toegestaan' };
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
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  
  // Simple constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < Math.max(token.length, storedToken.length); i++) {
    result |= (token.charCodeAt(i) || 0) ^ (storedToken.charCodeAt(i) || 0);
  }
  
  return result === 0 && token.length === storedToken.length;
};

// Rate limiting utilities
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

export const resetRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

// Input sanitization for different contexts
export const sanitizeForHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const sanitizeForSQL = (input: string): string => {
  // This should be used in addition to parameterized queries, not instead of them
  return input.replace(/['";\\]/g, '');
};

// Security headers utility
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  };
};
