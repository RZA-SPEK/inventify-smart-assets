
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validatePassword, checkRateLimit, resetRateLimit, sanitizeInput } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp } = useAuth();
  const { toast } = useToast();

  const secureLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const cleanEmail = sanitizeInput(email.toLowerCase().trim());
      const cleanPassword = password; // Don't sanitize password as it might remove valid characters
      
      // Rate limiting
      const rateLimitKey = `login_${cleanEmail}`;
      if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
        toast({
          title: "Te veel inlogpogingen",
          description: "Wacht 15 minuten voordat je opnieuw probeert in te loggen.",
          variant: "destructive",
        });
        return { error: new Error('Rate limit exceeded') };
      }

      const { error } = await login(cleanEmail, cleanPassword);
      
      if (error) {
        toast({
          title: "Inloggen mislukt",
          description: "Controleer je e-mailadres en wachtwoord.",
          variant: "destructive",
        });
        return { error };
      } else {
        // Reset rate limit on successful login
        resetRateLimit(rateLimitKey);
        toast({
          title: "Succesvol ingelogd",
          description: "Welkom terug!",
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Secure login error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const secureSignUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const cleanEmail = sanitizeInput(email.toLowerCase().trim());
      const cleanFullName = fullName ? sanitizeInput(fullName.trim()) : undefined;
      
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        toast({
          title: "Wachtwoord te zwak",
          description: passwordValidation.errors.join(', '),
          variant: "destructive",
        });
        return { error: new Error('Weak password') };
      }

      // Rate limiting
      const rateLimitKey = `signup_${cleanEmail}`;
      if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
        toast({
          title: "Te veel registratiepogingen",
          description: "Wacht 1 uur voordat je opnieuw probeert te registreren.",
          variant: "destructive",
        });
        return { error: new Error('Rate limit exceeded') };
      }

      const { error } = await signUp(cleanEmail, password, cleanFullName);
      
      if (error) {
        if (error.message?.includes('already registered')) {
          toast({
            title: "Account bestaat al",
            description: "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registratie mislukt",
            description: "Er is een fout opgetreden bij het aanmaken van je account.",
            variant: "destructive",
          });
        }
        return { error };
      } else {
        toast({
          title: "Account aangemaakt",
          description: "Controleer je e-mail voor de bevestigingslink.",
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Secure signup error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    secureLogin,
    secureSignUp,
    isLoading,
  };
};
