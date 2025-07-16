import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        toast({
          title: "Succesvol ingelogd",
          description: "Welkom terug!"
        });
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: error.message || "Er is een fout opgetreden"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        
        
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="naam@voorbeeld.nl" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Wachtwoord</Label>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Bezig..." : "Inloggen"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Geen account? Neem contact op met de beheerder voor toegang.
      </div>
    </div>;
};