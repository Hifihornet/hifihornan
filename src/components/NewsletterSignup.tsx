import { useState, useRef } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
}

const NewsletterSignup = ({ variant = "card", className }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting: prevent submissions within 3 seconds
    const now = Date.now();
    if (now - lastSubmitTime.current < 3000) {
      toast.error("Vänta några sekunder innan du försöker igen");
      return;
    }
    lastSubmitTime.current = now;

    if (!email || !email.includes("@")) {
      toast.error("Ange en giltig e-postadress");
      return;
    }

    setSubmitting(true);
    try {
      // Use secure function that prevents email enumeration
      const { data, error } = await supabase.rpc("subscribe_to_newsletter", {
        _email: email
      });

      if (error) {
        throw error;
      }

      if (data === false) {
        toast.error("Ange en giltig e-postadress");
        return;
      }

      // Always show success to prevent enumeration
      setSubscribed(true);
      toast.success("Tack för din prenumeration!");
    } catch (err) {
      console.error("Error subscribing:", err);
      toast.error("Kunde inte prenumerera");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`flex items-center gap-2 text-green-500 ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span>Tack! Du är nu prenumerant.</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Din e-post..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Prenumerera"}
        </Button>
      </form>
    );
  }

  return (
    <div className={`p-6 rounded-xl bg-card border border-border ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Nyhetsbrev</h3>
          <p className="text-sm text-muted-foreground">Få de senaste annonserna direkt i din inbox</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Din e-postadress..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Prenumerera"}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
