import { useState, useEffect } from "react";
import { 
  Loader2, 
  RefreshCw, 
  Activity,
  FileText,
  Users,
  Trash2,
  EyeOff,
  Eye,
  Send,
  Shield,
  Flag,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface ActivityLogEntry {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_name?: string;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "delete_listing":
      return <Trash2 className="w-4 h-4 text-red-500" />;
    case "hide_listing":
      return <EyeOff className="w-4 h-4 text-amber-500" />;
    case "unhide_listing":
      return <Eye className="w-4 h-4 text-green-500" />;
    case "delete_user":
      return <Users className="w-4 h-4 text-red-500" />;
    case "send_broadcast":
      return <Send className="w-4 h-4 text-blue-500" />;
    case "send_dm":
      return <Send className="w-4 h-4 text-primary" />;
    case "resolve_report":
      return <Flag className="w-4 h-4 text-green-500" />;
    case "create_store":
      return <Shield className="w-4 h-4 text-primary" />;
    case "create_blog":
    case "update_blog":
    case "delete_blog":
      return <BookOpen className="w-4 h-4 text-purple-500" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case "delete_listing": return "Raderade annons";
    case "hide_listing": return "Dolde annons";
    case "unhide_listing": return "Visade annons";
    case "delete_user": return "Raderade användare";
    case "send_broadcast": return "Skickade utskick";
    case "send_dm": return "Skickade direktmeddelande";
    case "resolve_report": return "Hanterade rapport";
    case "dismiss_report": return "Avvisade rapport";
    case "create_store": return "Skapade företagskonto";
    case "create_blog": return "Skapade artikel";
    case "update_blog": return "Uppdaterade artikel";
    case "delete_blog": return "Raderade artikel";
    case "close_support": return "Stängde supportärende";
    case "reopen_support": return "Öppnade supportärende";
    case "delete_support": return "Raderade supportärende";
    default: return actionType;
  }
};

const AdminActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Enrich with admin names
      const enrichedActivities = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: adminName } = await supabase.rpc("get_seller_display_name", {
            _user_id: activity.admin_id,
          });
          return {
            ...activity,
            admin_name: adminName || "Okänd admin"
          } as ActivityLogEntry;
        })
      );

      setActivities(enrichedActivities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Aktivitetslogg
          </h2>
          <p className="text-sm text-muted-foreground">
            Senaste admin-aktiviteter
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchActivities} 
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Uppdatera
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ingen aktivitet ännu</p>
            <p className="text-xs mt-1">Admin-åtgärder loggas här</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getActionIcon(activity.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground text-sm">
                        {activity.admin_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getActionLabel(activity.action_type)}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {activity.details.title as string || activity.details.email as string || activity.target_id}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: sv,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AdminActivityLog;
