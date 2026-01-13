import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
  confirmPassword: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lösenorden matchar inte",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setCheckingSession(false);
      } else if (event === 'SIGNED_IN' && session) {
        // User came from recovery link and is now signed in
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    // THEN check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a recovery session by looking at the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'recovery' || accessToken || session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    };
    
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const validateForm = () => {
    try {
      passwordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        // Handle specific Supabase error messages
        if (error.message.includes('weak')) {
          toast.error("Lösenordet måste vara minst 6 tecken långt");
        } else if (error.message.includes('same')) {
          toast.error("Det nya lösenordet kan inte vara samma som det gamla");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Lösenordet har uppdaterats!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <div className="p-8 rounded-xl bg-card border border-border text-center">
              <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                Ogiltig länk
              </h1>
              <p className="text-muted-foreground mb-6">
                Länken för lösenordsåterställning är ogiltig eller har gått ut. 
                Vänligen begär en ny länk.
              </p>
              <Button onClick={() => navigate("/auth")} variant="glow">
                Tillbaka till inloggning
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="p-8 rounded-xl bg-card border border-border">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Nytt lösenord
              </h1>
              <p className="text-muted-foreground text-sm">
                Ange ditt nya lösenord nedan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Nytt lösenord
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-12"
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Bekräfta lösenord
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-12"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Uppdatera lösenord
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
