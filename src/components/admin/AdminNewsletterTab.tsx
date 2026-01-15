import { useState, useEffect } from "react";
import { 
  Mail, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Download,
  UserX,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

const AdminNewsletterTab = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      toast.error("Kunde inte hämta prenumeranter");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (subscriber: Subscriber) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          is_active: !subscriber.is_active,
          unsubscribed_at: !subscriber.is_active ? null : new Date().toISOString()
        })
        .eq("id", subscriber.id);

      if (error) throw error;
      
      setSubscribers(prev => 
        prev.map(s => 
          s.id === subscriber.id 
            ? { ...s, is_active: !s.is_active } 
            : s
        )
      );
      toast.success(subscriber.is_active ? "Prenumerant avaktiverad" : "Prenumerant aktiverad");
    } catch (err) {
      console.error("Error toggling subscriber:", err);
      toast.error("Kunde inte uppdatera prenumerant");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast.success("Prenumerant borttagen");
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      toast.error("Kunde inte ta bort prenumerant");
    }
  };

  const handleExportEmails = () => {
    const activeEmails = subscribers
      .filter(s => s.is_active)
      .map(s => s.email)
      .join("\n");
    
    const blob = new Blob([activeEmails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hifihornet-newsletter-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("E-postlista exporterad");
  };

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showInactive || s.is_active;
    return matchesSearch && matchesActive;
  });

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">Nyhetsbrevsprenumeranter</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} aktiva av {subscribers.length} totalt
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant={showInactive ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Visa endast aktiva" : "Visa alla"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportEmails}
            disabled={activeCount === 0}
          >
            <Download className="w-4 h-4" />
            Exportera
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubscribers} 
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Uppdatera
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Sök efter e-post..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Inga prenumeranter hittades</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className={`p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors ${
                  !subscriber.is_active ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground truncate">
                      {subscriber.email}
                    </span>
                    {!subscriber.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prenumererade {formatDistanceToNow(new Date(subscriber.subscribed_at), {
                      addSuffix: true,
                      locale: sv,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(subscriber)}
                    title={subscriber.is_active ? "Avaktivera" : "Aktivera"}
                  >
                    {subscriber.is_active ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ta bort prenumerant?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Är du säker på att du vill ta bort {subscriber.email}? Detta kan inte ångras.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ta bort
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AdminNewsletterTab;
