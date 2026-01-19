import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, "Namn måste vara minst 2 tecken").max(50, "Namn får vara max 50 tecken"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // New privacy options
  const [isSearchable, setIsSearchable] = useState(false);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Hämta sparad e-post vid component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: "Ange din e-postadress" });
      return;
    }
    
    try {
      z.string().email().parse(email);
    } catch {
      setErrors({ email: "Ogiltig e-postadress" });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/aterstall-losenord`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Ett mail har skickats med instruktioner för att återställa ditt lösenord.");
        setShowForgotPassword(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, displayName });
      }
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
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Fel e-post eller lösenord");
          } else {
            toast.error(error.message);
          }
        } else {
          // Hantera localStorage för remember me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          toast.success("Inloggad!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("E-postadressen är redan registrerad");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Konto skapat!");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <div className="p-8 rounded-xl bg-card border border-border">
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Glömt lösenord?
                </h1>
                <p className="text-muted-foreground text-sm">
                  Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    E-post
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@email.se"
                      className="pl-12"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
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
                      Skicka återställningslänk
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="text-primary font-medium">← Tillbaka till inloggning</span>
                </button>
              </div>
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
                {isLogin ? "Logga in" : "Skapa konto"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLogin
                  ? "Logga in för att hantera dina annonser"
                  : "Registrera dig för att börja sälja"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Ditt namn <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Förnamn Efternamn"
                      className="pl-12"
                      required
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-destructive text-xs mt-1">{errors.displayName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Detta namn kommer att visas på din profil och i annonser
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  E-post
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.se"
                    className="pl-12"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-muted-foreground">
                    Lösenord
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setErrors({});
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Glömt lösenord?
                    </button>
                  )}
                </div>
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
                {!isLogin && <PasswordStrengthIndicator password={password} />}
              </div>

              {isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                    Spara uppgifterna
                  </label>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-4 pt-2">
                  {/* Privacy Options */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    <p className="text-sm font-medium text-foreground">Sekretessinställningar</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="searchable" className="text-sm">Visa i profilsökning</Label>
                        <p className="text-xs text-muted-foreground">
                          Låt andra hitta dig via sökningen
                        </p>
                      </div>
                      <Switch
                        id="searchable"
                        checked={isSearchable}
                        onCheckedChange={setIsSearchable}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="direct-messages" className="text-sm">Ta emot direktmeddelanden</Label>
                        <p className="text-xs text-muted-foreground">
                          Låt andra skicka meddelanden till dig
                        </p>
                      </div>
                      <Switch
                        id="direct-messages"
                        checked={allowDirectMessages}
                        onCheckedChange={setAllowDirectMessages}
                      />
                    </div>
                  </div>

                  {/* Terms and Policies */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                        Jag har läst och godkänner{" "}
                        <Link to="/anvandarvillkor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          användarvillkoren
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={acceptedPrivacy}
                        onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                      />
                      <label htmlFor="privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                        Jag har läst och godkänner{" "}
                        <Link to="/integritetspolicy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          integritetspolicyn
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="cookies"
                        checked={acceptedCookies}
                        onCheckedChange={(checked) => setAcceptedCookies(checked === true)}
                      />
                      <label htmlFor="cookies" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                        Jag har läst och godkänner{" "}
                        <Link to="/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          cookiepolicyn
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full"
                disabled={loading || (!isLogin && (!acceptedTerms || !acceptedPrivacy || !acceptedCookies))}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Logga in" : "Skapa konto"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setAcceptedTerms(false);
                  setAcceptedPrivacy(false);
                  setAcceptedCookies(false);
                  setIsSearchable(false);
                  setAllowDirectMessages(true);
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? (
                  <>
                    Har du inget konto?{" "}
                    <span className="text-primary font-medium">Registrera dig</span>
                  </>
                ) : (
                  <>
                    Har du redan ett konto?{" "}
                    <span className="text-primary font-medium">Logga in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
