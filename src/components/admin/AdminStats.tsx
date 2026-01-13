import { useState, useEffect } from "react";
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  Mail, 
  MessageCircle,
  Flag,
  Clock,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  totalListings: number;
  activeListings: number;
  hiddenListings: number;
  soldListings: number;
  newListingsWeek: number;
  totalUsers: number;
  newUsersWeek: number;
  totalViews: number;
  viewsWeek: number;
  newsletterSubscribers: number;
  pendingReports: number;
  openSupportTickets: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        { count: totalListings },
        { count: activeListings },
        { count: hiddenListings },
        { count: soldListings },
        { count: newListingsWeek },
        { count: totalUsers },
        { count: newUsersWeek },
        { count: totalViews },
        { count: viewsWeek },
        { count: newsletterSubscribers },
        { count: pendingReports },
        { count: openSupportTickets }
      ] = await Promise.all([
        supabase.from("listings").select("*", { count: "exact", head: true }),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "hidden"),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("listings").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("listing_views").select("*", { count: "exact", head: true }),
        supabase.from("listing_views").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("conversations").select("*", { count: "exact", head: true }).is("listing_id", null).eq("status", "open")
      ]);

      setStats({
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        hiddenListings: hiddenListings || 0,
        soldListings: soldListings || 0,
        newListingsWeek: newListingsWeek || 0,
        totalUsers: totalUsers || 0,
        newUsersWeek: newUsersWeek || 0,
        totalViews: totalViews || 0,
        viewsWeek: viewsWeek || 0,
        newsletterSubscribers: newsletterSubscribers || 0,
        pendingReports: pendingReports || 0,
        openSupportTickets: openSupportTickets || 0
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
            <div className="h-8 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: FileText,
      value: stats.totalListings,
      label: "Totalt annonser",
      sublabel: `${stats.newListingsWeek} nya denna vecka`,
      color: "text-primary"
    },
    {
      icon: Eye,
      value: stats.activeListings,
      label: "Aktiva annonser",
      sublabel: `${stats.hiddenListings} dolda, ${stats.soldListings} sålda`,
      color: "text-green-500"
    },
    {
      icon: Users,
      value: stats.totalUsers,
      label: "Användare",
      sublabel: `${stats.newUsersWeek} nya denna vecka`,
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      value: stats.totalViews,
      label: "Annonsvisningar",
      sublabel: `${stats.viewsWeek} denna vecka`,
      color: "text-purple-500"
    },
    {
      icon: Mail,
      value: stats.newsletterSubscribers,
      label: "Nyhetsbrev",
      sublabel: "Aktiva prenumeranter",
      color: "text-amber-500"
    },
    {
      icon: Flag,
      value: stats.pendingReports,
      label: "Rapporter",
      sublabel: `${stats.openSupportTickets} supportärenden`,
      color: stats.pendingReports > 0 ? "text-red-500" : "text-muted-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
