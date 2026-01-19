import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Users, 
  FileText, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  RefreshCw,
  User,
  Calendar,
  Eye,
  Send,
  Megaphone,
  Mail,
  Store,
  Plus,
  MessageCircle,
  CheckCircle,
  RotateCcw,
  Archive,
  EyeOff,
  Eye as EyeIcon,
  Flag,
  BookOpen,
  Edit,
  ExternalLink,
  AlertTriangle,
  Activity,
  Pencil,
  BadgeCheck
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreBadge from "@/components/StoreBadge";
import CreatorBadge from "@/components/CreatorBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import AdminStats from "@/components/admin/AdminStats";
import AdminNewsletterTab from "@/components/admin/AdminNewsletterTab";
import AdminActivityLog from "@/components/admin/AdminActivityLog";
import AdminListingEditor from "@/components/admin/AdminListingEditor";
import AdminSearchFilters from "@/components/admin/AdminSearchFilters";
import AdminRoleManager from "@/components/admin/AdminRoleManager";
import AdminGdprTab from "@/components/admin/AdminGdprTab";
import { BusinessApplicationsListSimple } from "@/components/BusinessApplicationsListSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import useUserRoles from "@/hooks/useUserRoles";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface AdminListing {
  id: string;
  title: string;
  user_id: string;
  status: string;
  created_at: string;
  seller_name: string;
}

interface AdminProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen: string | null;
  listing_count: number;
  roles?: string[];
  is_verified_seller?: boolean;
}

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface SupportConversation {
  id: string;
  buyer_id: string;
  updated_at: string;
  status: string;
  buyer_name?: string;
  buyer_avatar?: string;
  last_message?: string;
  unread_count?: number;
}

interface SupportMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_system_message?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  author_id: string;
  author_name?: string;
}

interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  listing_title?: string;
  reporter_name?: string;
}

// Support conversations have listing_id = null

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isCreator, isAdmin, isModerator, isLoading: rolesLoading } = useUserRoles(user?.id);
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Support chat state
  const [supportConversations, setSupportConversations] = useState<SupportConversation[]>([]);
  const [showClosedSupport, setShowClosedSupport] = useState(false);
  const [loadingSupport, setLoadingSupport] = useState(true);
  const [selectedSupportConv, setSelectedSupportConv] = useState<SupportConversation | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loadingSupportMessages, setLoadingSupportMessages] = useState(false);
  const [supportReply, setSupportReply] = useState("");
  const [sendingSupportReply, setSendingSupportReply] = useState(false);
  const [closingConversation, setClosingConversation] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);

  // Broadcast form state
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Direct message form state
  const [directMessageDialogOpen, setDirectMessageDialogOpen] = useState(false);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<AdminProfile | null>(null);
  const [directMessageContent, setDirectMessageContent] = useState("");
  const [sendingDirectMessage, setSendingDirectMessage] = useState(false);

  // Store account form state
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [storeEmail, setStoreEmail] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogPublished, setBlogPublished] = useState(false);
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [savingBlog, setSavingBlog] = useState(false);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

  // Listing editor state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [listingEditorOpen, setListingEditorOpen] = useState(false);

  // Search/filter state
  const [listingFilters, setListingFilters] = useState({ search: "", status: "", category: "" });
  const [userFilters, setUserFilters] = useState({ search: "", role: "", hasListings: "" });

  // Role manager state
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [roleManagerUser, setRoleManagerUser] = useState<{ id: string; name: string; roles: string[] } | null>(null);

  const hasAccess = isCreator || isAdmin || isModerator;
  const canManageBlog = isAdmin || isCreator;
  const canModerateReports = isAdmin || isModerator;
  const canDeleteUsers = isAdmin;
  const canSendBroadcasts = isAdmin;
  const canSendDirectMessages = isAdmin;
  const canCreateStoreAccounts = isAdmin;
  const canViewSupport = isAdmin;
  const canManageRoles = isAdmin;

  const fetchSupportConversations = useCallback(async () => {
    setLoadingSupport(true);
    try {
      console.log("Fetching support conversations...");
      
      // Get all support conversations (where listing_id is null)
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .is("listing_id", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      console.log("Found conversations:", conversations?.length);

      // Get closed conversation IDs by checking for STATUS:closed messages
      const { data: closedStatusMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .eq("content", "STATUS:closed")
        .eq("is_system_message", true);

      const closedConversationIds = new Set(
        (closedStatusMessages || []).map(msg => msg.conversation_id)
      );

      console.log("Closed conversation IDs:", Array.from(closedConversationIds));

      // Enrich with user info and last message
      const enrichedConversations = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get buyer profile
          const { data: profileData } = await supabase.rpc("get_public_profile_by_user_id", {
            _user_id: conv.buyer_id,
          });
          const profile = profileData?.[0];

          // Get last message
          const { data: lastMsgData } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user?.id || "")
            .is("read_at", null);

          return {
            id: conv.id,
            buyer_id: conv.buyer_id,
            updated_at: conv.updated_at,
            status: closedConversationIds.has(conv.id) ? "closed" : "open",
            buyer_name: profile?.display_name || "Okänd användare",
            buyer_avatar: profile?.avatar_url,
            last_message: lastMsgData?.content,
            unread_count: count || 0,
          } as SupportConversation;
        })
      );

      console.log("Enriched conversations:", enrichedConversations.map(c => ({ id: c.id, status: c.status })));
      console.log("Show closed support:", showClosedSupport);

      setSupportConversations(enrichedConversations);
    } catch (err) {
      console.error("Error fetching support conversations:", err);
      toast.error("Kunde inte hämta supportärenden");
    } finally {
      setLoadingSupport(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!rolesLoading && user && !hasAccess) {
      toast.error("Du har inte behörighet att se denna sida");
      navigate("/");
    }
  }, [hasAccess, rolesLoading, user, navigate]);

  useEffect(() => {
    if (hasAccess) {
      fetchListings();
      fetchProfiles();
      fetchBroadcasts();
      if (canViewSupport) {
        fetchSupportConversations();
      }
      if (canManageBlog) {
        fetchBlogPosts();
      }
      if (canModerateReports) {
        fetchReports();
      }
    }
  }, [hasAccess, canViewSupport, canManageBlog, canModerateReports, fetchSupportConversations]);

  // Scroll to bottom when support messages change
  useEffect(() => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [supportMessages]);

  // Subscribe to realtime support messages
  useEffect(() => {
    if (!selectedSupportConv || !user) return;

    const channel = supabase
      .channel(`admin-support-${selectedSupportConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedSupportConv.id}`,
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          setSupportMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSupportConv, user]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      // Use regular SQL instead of RPC function
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map to AdminListing format
      const adminListings = (data || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        user_id: listing.user_id,
        status: listing.status,
        created_at: listing.created_at,
        seller_name: "Säljare" // Default value since we don't have seller_name
      }));
      
      setListings(adminListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      toast.error("Kunde inte hämta annonser");
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      // Temporarily disabled - table doesn't exist
      // const { data, error } = await supabase
      //   .from("broadcast_messages")
      //   .select("*")
      //   .order("created_at", { ascending: false })
      //   .limit(10);
      // if (error) throw error;
      // setBroadcasts(data || []);
      setBroadcasts([]);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  const fetchBlogPosts = async () => {
    setLoadingBlog(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, published, published_at, created_at, author_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author names
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          const { data: authorName } = await supabase.rpc("get_seller_display_name", {
            _user_id: post.author_id,
          });
          return {
            ...post,
            author_name: authorName || "Okänd",
          } as BlogPost;
        })
      );

      setBlogPosts(postsWithAuthors);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      toast.error("Kunde inte hämta blogginlägg");
    } finally {
      setLoadingBlog(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with listing and reporter info
      const enrichedReports = await Promise.all(
        (data || []).map(async (report) => {
          const { data: listing } = await supabase
            .from("listings")
            .select("title")
            .eq("id", report.listing_id)
            .single();

          const { data: reporterName } = await supabase.rpc("get_seller_display_name", {
            _user_id: report.reporter_id,
          });

          return {
            ...report,
            listing_title: listing?.title || "Raderad annons",
            reporter_name: reporterName || "Okänd",
          } as Report;
        })
      );

      setReports(enrichedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Kunde inte hämta rapporter");
    } finally {
      setLoadingReports(false);
    }
  };

  const handleOpenBlogDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setBlogTitle(post.title);
      setBlogSlug(post.slug);
      setBlogExcerpt(post.excerpt || "");
      setBlogCoverImage(post.cover_image || "");
      setBlogPublished(post.published);
      // We need to fetch the full content
      fetchBlogContent(post.id);
    } else {
      setEditingPost(null);
      setBlogTitle("");
      setBlogSlug("");
      setBlogExcerpt("");
      setBlogContent("");
      setBlogCoverImage("");
      setBlogPublished(false);
    }
    setBlogDialogOpen(true);
  };

  const fetchBlogContent = async (postId: string) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("content")
      .eq("id", postId)
      .single();
    setBlogContent(data?.content || "");
  };

  const handleSaveBlogPost = async () => {
    if (!blogTitle.trim() || !blogSlug.trim() || !blogContent.trim()) {
      toast.error("Fyll i titel, slug och innehåll");
      return;
    }

    console.log("Saving blog post:", { 
      title: blogTitle.trim(), 
      slug: blogSlug.trim(), 
      content: blogContent.trim().substring(0, 100) + "...",
      published: blogPublished,
      isEditing: !!editingPost
    });

    setSavingBlog(true);
    try {
      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: blogTitle.trim(),
            slug: blogSlug.trim(),
            excerpt: blogExcerpt.trim() || null,
            cover_image: blogCoverImage.trim() || null,
            content: blogContent.trim(),
            published: blogPublished,
            published_at: blogPublished && !editingPost.published_at ? new Date().toISOString() : editingPost.published_at,
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Artikeln uppdaterad");
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          title: blogTitle.trim(),
          slug: blogSlug.trim(),
          excerpt: blogExcerpt.trim() || null,
          cover_image: blogCoverImage.trim() || null,
          content: blogContent.trim(),
          published: blogPublished,
          published_at: blogPublished ? new Date().toISOString() : null,
          author_id: user!.id,
        });

        if (error) throw error;
        toast.success("Artikel skapad");
      }

      setBlogDialogOpen(false);
      fetchBlogPosts();
    } catch (err: unknown) {
      console.error("Error saving blog post:", err);
      const errorCode = (err as { code?: string }).code;
      if (errorCode === "23505") {
        toast.error("Slug finns redan - välj en annan");
      } else {
        toast.error("Kunde inte spara artikeln");
      }
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
      if (error) throw error;
      toast.success("Artikel raderad");
      fetchBlogPosts();
    } catch (err) {
      console.error("Error deleting blog post:", err);
      toast.error("Kunde inte radera artikeln");
    }
  };

  const handleResolveReport = async (reportId: string, action: "dismiss" | "hide_listing" | "delete_listing") => {
    console.log("=== HANDLE RESOLVE REPORT START ===");
    console.log("Report ID:", reportId);
    console.log("Action:", action);
    
    setResolvingReportId(reportId);
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        console.log("Report not found");
        return;
      }

      console.log("Found report:", report);

      // Perform action without RPC functions
      if (action === "hide_listing") {
        console.log("Hiding listing:", report.listing_id);
        await supabase.from("listings").update({ status: "hidden" }).eq("id", report.listing_id);
      } else if (action === "delete_listing") {
        console.log("Deleting listing:", report.listing_id);
        // Use the same delete logic as handleDeleteListing
        const { error } = await supabase.from("listings").delete().eq("id", report.listing_id);
        if (error) {
          console.error("Delete error in resolve report:", error);
          // Fallback to hide
          await supabase.from("listings").update({ status: "hidden" }).eq("id", report.listing_id);
        }
      }

      // Update report status
      console.log("Updating report status...");
      const { error: updateError } = await supabase.from("reports").update({ 
        status: action === "dismiss" ? "dismissed" : "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id
      }).eq("id", reportId);

      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }

      toast.success(
        action === "dismiss"
          ? "Rapport avvisad"
          : action === "hide_listing"
          ? "Annons dold och rapport löst"
          : "Annons raderad och rapport löst"
      );
      
      console.log("Refreshing reports and listings...");
      fetchReports();
      if (action !== "dismiss") fetchListings();
      
      console.log("=== HANDLE RESOLVE REPORT END ===");
    } catch (err) {
      console.error("Error resolving report:", err);
      toast.error("Kunde inte lösa rapporten");
    } finally {
      setResolvingReportId(null);
    }
  };

  const handleCloseSupportConversation = async () => {
    if (!selectedSupportConv) return;
    
    setClosingConversation(true);
    try {
      console.log("Closing conversation:", selectedSupportConv.id);
      
      // Lägg till system-meddelande om att ärendet är stängt
      console.log("Inserting close message...");
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: selectedSupportConv.id,
        sender_id: user.id,
        content: "🔒 Supportärendet har stängts av admin",
        is_system_message: true,
      });

      if (msgError) {
        console.error("Error inserting close message:", msgError);
        console.error("Error details:", JSON.stringify(msgError, null, 2));
        throw msgError;
      }

      console.log("Close message inserted successfully");

      // Markera conversation som stängd genom att lägga till ett 'closed' meddelande
      // som vi kan filtrera på senare
      console.log("Inserting status message...");
      const { error: statusError } = await supabase.from("messages").insert({
        conversation_id: selectedSupportConv.id,
        sender_id: user.id, // Använd admin ID istället för "system"
        content: "STATUS:closed",
        is_system_message: true,
      });

      if (statusError) {
        console.error("Error inserting status message:", statusError);
        console.error("Error details:", JSON.stringify(statusError, null, 2));
        throw statusError;
      }

      console.log("Status message inserted successfully");
      console.log("Successfully closed conversation");
      
      toast.success("Supportärende stängt");
      setSelectedSupportConv(null);
      
      // Ladda om konversationer för att uppdatera status
      console.log("Refreshing conversations...");
      await fetchSupportConversations();
      console.log("Conversations refreshed");
    } catch (err) {
      console.error("Error closing support conversation:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      toast.error("Kunde inte stänga ärendet");
    } finally {
      setClosingConversation(false);
    }
  };

  const handleReopenSupportConversation = async () => {
    if (!selectedSupportConv) return;
    
    setClosingConversation(true);
    try {
      // Lägg till system-meddelande om att ärendet är öppnat igen
      await supabase.from("messages").insert({
        conversation_id: selectedSupportConv.id,
        sender_id: user.id,
        content: "🔓 Supportärendet har öppnats igen av admin",
        is_system_message: true,
      });
      
      toast.success("Supportärende öppnat igen");
      fetchSupportConversations();
      // Update local state
      setSelectedSupportConv({ ...selectedSupportConv, status: "open" });
    } catch (err) {
      console.error("Error reopening support conversation:", err);
      toast.error("Kunde inte öppna ärendet");
    } finally {
      setClosingConversation(false);
    }
  };

  const handleDeleteSupportConversation = async () => {
    if (!selectedSupportConv) return;
    
    setDeletingConversation(true);
    try {
      const { error } = await supabase.rpc("admin_delete_support_conversation", {
        _conversation_id: selectedSupportConv.id,
      });
      if (error) throw error;
      
      toast.success("Supportärende raderat permanent");
      setSelectedSupportConv(null);
      fetchSupportConversations();
    } catch (err) {
      console.error("Error deleting support conversation:", err);
      toast.error("Kunde inte radera ärendet");
    } finally {
      setDeletingConversation(false);
    }
  };

  const fetchSupportMessages = async (convId: string) => {
    setLoadingSupportMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSupportMessages(data || []);

      // Mark messages as read
      if (user) {
        const unreadIds = (data || [])
          .filter((m) => m.sender_id !== user.id && !m.read_at)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIds);
        }
      }
    } catch (err) {
      console.error("Error fetching support messages:", err);
    } finally {
      setLoadingSupportMessages(false);
    }
  };

  const handleSelectSupportConv = (conv: SupportConversation) => {
    setSelectedSupportConv(conv);
    fetchSupportMessages(conv.id);
  };

  const handleSendSupportReply = async () => {
    if (!supportReply.trim() || !selectedSupportConv || !user) return;

    setSendingSupportReply(true);
    const content = supportReply.trim();
    setSupportReply("");

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedSupportConv.id,
        sender_id: user.id,
        content,
        is_system_message: true, // Mark as system message so it shows as from HiFihörnet
      });

      if (error) throw error;

      // Refresh conversations to update last message
      fetchSupportConversations();
    } catch (err) {
      console.error("Error sending support reply:", err);
      toast.error("Kunde inte skicka svar");
      setSupportReply(content);
    } finally {
      setSendingSupportReply(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      toast.error("Fyll i både titel och meddelande");
      return;
    }

    setSendingBroadcast(true);
    try {
      const { error } = await supabase.rpc("admin_send_broadcast", {
        _title: broadcastTitle.trim(),
        _content: broadcastContent.trim(),
      });
      if (error) throw error;
      
      toast.success(`Meddelande skickat till alla ${profiles.length} användare`);
      setBroadcastDialogOpen(false);
      setBroadcastTitle("");
      setBroadcastContent("");
      fetchBroadcasts();
    } catch (err) {
      console.error("Error sending broadcast:", err);
      toast.error("Kunde inte skicka meddelande");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const openDirectMessageDialog = (profile: AdminProfile) => {
    setDirectMessageRecipient(profile);
    setDirectMessageContent("");
    setDirectMessageDialogOpen(true);
  };

  const handleSendDirectMessage = async () => {
    if (!directMessageContent.trim() || !directMessageRecipient) {
      toast.error("Skriv ett meddelande");
      return;
    }

    setSendingDirectMessage(true);
    try {
      const { error } = await supabase.rpc("admin_send_message_to_user", {
        _recipient_user_id: directMessageRecipient.user_id,
        _content: directMessageContent.trim(),
      });
      if (error) throw error;
      
      toast.success(`Meddelande skickat till ${directMessageRecipient.display_name || "användaren"}`);
      setDirectMessageDialogOpen(false);
      setDirectMessageRecipient(null);
      setDirectMessageContent("");
    } catch (err) {
      console.error("Error sending direct message:", err);
      toast.error("Kunde inte skicka meddelande");
    } finally {
      setSendingDirectMessage(false);
    }
  };

  const getFunctionErrorMessage = async (err: unknown) => {
    // supabase-js throws FunctionsHttpError for non-2xx responses
    if (err instanceof FunctionsHttpError) {
      try {
        const body = await err.context.json();
        return typeof body?.error === "string" ? body.error : err.message;
      } catch {
        return err.message;
      }
    }

    const isErrorBody = (body: unknown): body is { error: string } => {
      if (!body || typeof body !== "object") return false;
      if (!("error" in body)) return false;
      return typeof (body as { error?: unknown }).error === "string";
    };

    const anyErr = err as { name?: string; context?: { json?: () => Promise<unknown> }; message?: string };
    // Some environments don't preserve the class prototype
    if (anyErr?.name === "FunctionsHttpError" && typeof anyErr?.context?.json === "function") {
      try {
        const body = await anyErr.context.json();
        return isErrorBody(body) ? body.error : anyErr.message;
      } catch {
        return anyErr?.message;
      }
    }

    return anyErr?.message;
  };

  const handleCreateStoreAccount = async () => {
    if (!storeEmail.trim() || !storePassword.trim() || !storeName.trim()) {
      toast.error("Fyll i alla fält");
      return;
    }

    if (storePassword.length < 6) {
      toast.error("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setCreatingStore(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-store-account", {
        body: {
          email: storeEmail.trim(),
          password: storePassword.trim(),
          store_name: storeName.trim(),
        },
      });
      if (error) throw error;
      
      toast.success(`Företagskonto skapat för ${storeName}`);
      setStoreDialogOpen(false);
      setStoreEmail("");
      setStorePassword("");
      setStoreName("");
      fetchProfiles();
    } catch (err: unknown) {
      console.error("Error creating store account:", err);
      const msg = (await getFunctionErrorMessage(err)) || "";
      const msgLower = msg.toLowerCase();

      if (msgLower.includes("already registered") || msgLower.includes("already exists") || msgLower.includes("duplicate")) {
        toast.error("E-postadressen används redan");
      } else if (msgLower.includes("forbidden")) {
        toast.error("Du saknar behörighet (kräver admin)");
      } else if (msgLower.includes("failed to fetch") || msgLower.includes("network")) {
        toast.error("Nätverksfel – prova igen");
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error("Kunde inte skapa företagskonto");
      }
    } finally {
      setCreatingStore(false);
    }
  };

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      console.log("Attempting to fetch profiles...");
      console.log("Current user ID:", user?.id);
      console.log("User roles:", { isAdmin, isCreator, isModerator });
      
      const { data, error } = await supabase.rpc("admin_get_all_profiles_with_roles");
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Profiles data received:", data);
      console.log("Number of profiles:", data?.length || 0);
      
      setProfiles(data || []);
      
      // Force refresh role cache by triggering re-fetch
      // This will update badges when roles change
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
    } catch (err) {
      console.error("Error fetching profiles:", err);
      toast.error(`Kunde inte hämta profiler: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    console.log("=== HANDLE DELETE LISTING START ===");
    console.log("Listing ID:", listingId);
    setDeletingId(listingId);
    
    try {
      // Step 1: Try aggressive cascade delete approach
      console.log("Step 1: Attempting aggressive cascade delete...");
      
      // Try multiple approaches to delete the listing
      let deleteSuccess = false;
      
      // Approach 1: Direct delete with CASCADE
      try {
        const { error } = await supabase
          .from("listings")
          .delete()
          .eq("id", listingId);
        
        if (!error) {
          console.log("Direct delete successful!");
          deleteSuccess = true;
          toast.success("Annonsen har raderats helt");
        } else {
          console.log("Direct delete failed:", error);
        }
      } catch (err) {
        console.log("Direct delete exception:", err);
      }
      
      // Approach 2: Delete all related data first, then listing
      if (!deleteSuccess) {
        console.log("Step 2: Trying manual cascade delete...");
        
        // Delete all reports referencing this listing
        try {
          await supabase.from("reports").delete().eq("listing_id", listingId);
          console.log("Reports deleted");
        } catch (err) {
          console.log("Reports delete failed:", err);
        }
        
        // Delete all favorites
        try {
          await supabase.from("favorites").delete().eq("listing_id", listingId);
          console.log("Favorites deleted");
        } catch (err) {
          console.log("Favorites delete failed:", err);
        }
        
        // Try to delete any messages (if they exist)
        try {
          await supabase.from("messages").delete().eq("listing_id", listingId);
          console.log("Messages deleted");
        } catch (err) {
          console.log("Messages delete failed (expected):", err);
        }
        
        // Wait for database to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to delete the listing again
        try {
          const { error } = await supabase.from("listings").delete().eq("id", listingId);
          if (!error) {
            console.log("Manual cascade delete successful!");
            deleteSuccess = true;
            toast.success("Annonsen har raderats helt");
          } else {
            console.log("Manual cascade delete failed:", error);
          }
        } catch (err) {
          console.log("Manual cascade delete exception:", err);
        }
      }
      
      // Approach 3: Force delete by updating status to 'deleted'
      if (!deleteSuccess) {
        console.log("Step 3: Trying force delete method...");
        
        try {
          // Mark as deleted instead of actually deleting
          const { error } = await supabase
            .from("listings")
            .update({ 
              status: "deleted",
              title: "[DELETED] " + new Date().toISOString()
            })
            .eq("id", listingId);
          
          if (!error) {
            console.log("Force delete (mark as deleted) successful!");
            toast.success("Annonsen har markerats som raderad (databas begränsningar)");
            deleteSuccess = true;
          } else {
            console.log("Force delete failed:", error);
            throw error;
          }
        } catch (err) {
          console.log("Force delete exception:", err);
          throw err;
        }
      }
      
      // Refresh listings
      console.log("Step 4: Refreshing listings...");
      await fetchListings();
      
      console.log("=== HANDLE DELETE LISTING END ===");
      
    } catch (err) {
      console.error("Error in handleDeleteListing:", err);
      toast.error(`Kunde inte radera annonsen: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleHideListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "hidden" })
        .eq("id", listingId);
      
      if (error) throw error;
      
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "hidden" } : l))
      );
      toast.success("Annonsen är nu dold");
    } catch (err) {
      console.error("Error hiding listing:", err);
      toast.error("Kunde inte dölja annonsen");
    }
  };

  const handleUnhideListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "active" })
        .eq("id", listingId);
      
      if (error) throw error;
      
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "active" } : l))
      );
      toast.success("Annonsen är nu synlig igen");
    } catch (err) {
      console.error("Error unhiding listing:", err);
      toast.error("Kunde inte visa annonsen");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        _user_id: userId,
      });
      if (error) throw error;
      setProfiles((prev) => prev.filter((p) => p.user_id !== userId));
      setListings((prev) => prev.filter((l) => l.user_id !== userId));
      toast.success("Användaren har raderats");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Kunde inte radera användaren");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVerification = async (userId: string, currentlyVerified: boolean) => {
    try {
      const { error } = await supabase.rpc("admin_set_seller_verified", {
        _user_id: userId,
        _verified: !currentlyVerified,
      });
      if (error) throw error;
      
      setProfiles((prev) =>
        prev.map((p) =>
          p.user_id === userId ? { ...p, is_verified_seller: !currentlyVerified } : p
        )
      );
      toast.success(currentlyVerified ? "Verifiering borttagen" : "Säljare verifierad!");
    } catch (err) {
      console.error("Error toggling verification:", err);
      toast.error("Kunde inte ändra verifieringsstatus");
    }
  };

  if (authLoading || rolesLoading) {
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

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Tillbaka
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Hantera annonser och användare
            </p>
          </div>

          {/* Stats - Extended Dashboard */}
          <AdminStats />

          {/* Admin Actions */}
          {isAdmin && (
            <div className="mb-8 flex flex-wrap gap-3">
              {canSendBroadcasts && (
                <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="glow" className="gap-2">
                      <Megaphone className="w-4 h-4" />
                      Skicka meddelande till alla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Skicka meddelande till alla användare</DialogTitle>
                      <DialogDescription>
                        Detta meddelande kommer att visas för alla {profiles.length} registrerade användare.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Titel
                        </label>
                        <Input
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder="T.ex. Viktigt meddelande"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Meddelande
                        </label>
                        <Textarea
                          value={broadcastContent}
                          onChange={(e) => setBroadcastContent(e.target.value)}
                          placeholder="Skriv ditt meddelande här..."
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBroadcastDialogOpen(false)}
                        disabled={sendingBroadcast}
                      >
                        Avbryt
                      </Button>
                      <Button
                        variant="glow"
                        onClick={handleSendBroadcast}
                        disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastContent.trim()}
                      >
                        {sendingBroadcast ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Skicka
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canCreateStoreAccounts && (
                <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Store className="w-4 h-4" />
                      <Plus className="w-3 h-3" />
                      Skapa företagskonto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Skapa nytt företagskonto
                      </DialogTitle>
                      <DialogDescription>
                        Skapa ett konto för ett företag att använda på HiFiHörnet.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Företagsnamn
                        </label>
                        <Input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="T.ex. HiFi-Företaget AB"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          E-post
                        </label>
                        <Input
                          type="email"
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          placeholder="foretag@exempel.se"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Lösenord
                        </label>
                        <Input
                          type="password"
                          value={storePassword}
                          onChange={(e) => setStorePassword(e.target.value)}
                          placeholder="Minst 6 tecken"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setStoreDialogOpen(false)}
                        disabled={creatingStore}
                      >
                        Avbryt
                      </Button>
                      <Button
                        variant="glow"
                        onClick={handleCreateStoreAccount}
                        disabled={creatingStore || !storeEmail.trim() || !storePassword.trim() || !storeName.trim()}
                      >
                        {creatingStore ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Skapa konto
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {/* Recent Broadcasts */}
          {canSendBroadcasts && broadcasts.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Senaste utskick
              </h3>
              <div className="space-y-2">
                {broadcasts.slice(0, 3).map((broadcast) => (
                  <div key={broadcast.id} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{broadcast.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(broadcast.created_at), {
                          addSuffix: true,
                          locale: sv,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {broadcast.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-card border border-border flex-wrap">
              <TabsTrigger value="listings" className="gap-2">
                <FileText className="w-4 h-4" />
                Annonser
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Användare
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="newsletter" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Nyhetsbrev
                </TabsTrigger>
              )}
              {canModerateReports && (
                <TabsTrigger value="reports" className="gap-2">
                  <Flag className="w-4 h-4" />
                  Rapporter
                  {reports.filter((r) => r.status === "pending").length > 0 && (
                    <span className="ml-1 h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center px-1.5">
                      {reports.filter((r) => r.status === "pending").length}
                    </span>
                  )}
                </TabsTrigger>
              )}
              {canManageBlog && (
                <TabsTrigger value="blog" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Blogg
                </TabsTrigger>
              )}
              {canViewSupport && (
                <TabsTrigger value="support" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Support
                  {supportConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0) > 0 && (
                    <span className="ml-1 h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center px-1.5">
                      {supportConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                    </span>
                  )}
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Aktivitet
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="gdpr" className="gap-2">
                  <Shield className="w-4 h-4" />
                  GDPR
                </TabsTrigger>
              )}
            </TabsList>

            {/* Business Applications Link */}
            <div className="mb-6">
              <Link to="/admin/business" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Store className="w-4 h-4" />
                Hantera företagsansökningar
              </Link>
            </div>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Alla annonser</h2>
                  <Button variant="outline" size="sm" onClick={fetchListings} disabled={loadingListings}>
                    <RefreshCw className={`w-4 h-4 ${loadingListings ? "animate-spin" : ""}`} />
                    Uppdatera
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  {loadingListings ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      Inga annonser hittades
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                to={`/listing/${listing.id}`}
                                className="font-medium text-foreground hover:text-primary truncate"
                              >
                                {listing.title}
                              </Link>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  listing.status === "active"
                                    ? "bg-primary/20 text-primary"
                                    : listing.status === "sold"
                                    ? "bg-destructive/20 text-destructive"
                                    : listing.status === "hidden"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {listing.status === "active" ? "Aktiv" : 
                                 listing.status === "sold" ? "Såld" : 
                                 listing.status === "hidden" ? "Dold" : 
                                 listing.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Link
                                to={`/profil/${listing.user_id}`}
                                className="hover:text-primary"
                              >
                                {listing.seller_name}
                              </Link>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(listing.created_at), {
                                  addSuffix: true,
                                  locale: sv,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Edit button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingListingId(listing.id);
                                setListingEditorOpen(true);
                              }}
                              title="Redigera annons"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {/* Hide/Unhide button */}
                            {listing.status === "hidden" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnhideListing(listing.id)}
                                title="Visa annons"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleHideListing(listing.id)}
                                title="Dölj annons"
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                            )}
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === listing.id}
                              >
                                {deletingId === listing.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Radera annons?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill radera "{listing.title}"? Detta kan inte ångras.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Radera
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
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Alla användare</h2>
                  <Button variant="outline" size="sm" onClick={fetchProfiles} disabled={loadingProfiles}>
                    <RefreshCw className={`w-4 h-4 ${loadingProfiles ? "animate-spin" : ""}`} />
                    Uppdatera
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  {loadingProfiles ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      Inga användare hittades
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.display_name || "Avatar"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/profil/${profile.user_id}`}
                                className="font-medium text-foreground hover:text-primary truncate flex items-center gap-2 flex-wrap"
                              >
                                {profile.display_name || "Okänd användare"}
                                {profile.roles?.includes("admin") && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                    Admin
                                  </span>
                                )}
                                {profile.roles?.includes("store") && (
                                  <StoreBadge showLabel size="sm" />
                                )}
                                {profile.is_verified_seller && !profile.roles?.includes("store") && (
                                  <VerifiedBadge showLabel size="sm" />
                                )}
                              </Link>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                                <span>{profile.listing_count} annonser</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-xs sm:text-sm">
                                  {profile.last_seen
                                    ? `Online ${formatDistanceToNow(new Date(profile.last_seen), {
                                        addSuffix: true,
                                        locale: sv,
                                      })}`
                                    : "Aldrig online"}
                                </span>
                              </div>
                              {/* Action buttons - shown below user info on mobile */}
                              <div className="flex items-center gap-2 mt-3">
                                  {canManageRoles && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setRoleManagerUser({
                                          id: profile.user_id,
                                          name: profile.display_name || "Okänd användare",
                                          roles: profile.roles || []
                                        });
                                        setRoleManagerOpen(true);
                                      }}
                                      className="gap-1.5"
                                    >
                                      <Shield className="w-4 h-4" />
                                      <span className="hidden sm:inline">Roller</span>
                                    </Button>
                                  )}
                                  {isAdmin && !profile.roles?.includes("store") && (
                                    <Button
                                      variant={profile.is_verified_seller ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleToggleVerification(profile.user_id, !!profile.is_verified_seller)}
                                      className={`gap-1.5 ${profile.is_verified_seller ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                                    >
                                      <BadgeCheck className="w-4 h-4" />
                                      <span className="hidden sm:inline">
                                        {profile.is_verified_seller ? "Verifierad" : "Verifiera"}
                                      </span>
                                    </Button>
                                  )}
                                  {canSendDirectMessages && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDirectMessageDialog(profile)}
                                      className="gap-1.5"
                                    >
                                      <Mail className="w-4 h-4" />
                                      <span className="hidden sm:inline">Meddelande</span>
                                    </Button>
                                  )}
                                  {canDeleteUsers && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          disabled={deletingId === profile.user_id}
                                          className="gap-1.5"
                                        >
                                          {deletingId === profile.user_id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-4 h-4" />
                                          )}
                                          <span className="hidden sm:inline">Radera</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Radera användare?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Är du säker på att du vill radera "{profile.display_name || "denna användare"}"? 
                                            Detta raderar alla deras annonser, meddelanden och all annan data. 
                                            Detta kan inte ångras.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(profile.user_id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Radera användare
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            {canModerateReports && (
              <TabsContent value="reports">
                <div className="bg-card border border-border rounded-xl">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Rapporterade annonser</h2>
                    <Button variant="outline" size="sm" onClick={fetchReports} disabled={loadingReports}>
                      <RefreshCw className={`w-4 h-4 ${loadingReports ? "animate-spin" : ""}`} />
                      Uppdatera
                    </Button>
                  </div>
                  <ScrollArea className="h-[500px]">
                    {loadingReports ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-20 text-muted-foreground">
                        Inga rapporter
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className={`p-4 ${
                              report.status === "pending"
                                ? "bg-yellow-500/5"
                                : report.status === "resolved"
                                ? "bg-green-500/5"
                                : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Link
                                    to={`/listing/${report.listing_id}`}
                                    className="font-medium text-foreground hover:text-primary"
                                  >
                                    {report.listing_title}
                                  </Link>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      report.status === "pending"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : report.status === "resolved"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {report.status === "pending"
                                      ? "Väntar"
                                      : report.status === "resolved"
                                      ? "Åtgärdad"
                                      : "Avvisad"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium">
                                    {report.reason === "fake"
                                      ? "Falsk annons"
                                      : report.reason === "inappropriate"
                                      ? "Olämpligt innehåll"
                                      : report.reason === "spam"
                                      ? "Spam"
                                      : report.reason === "wrong_category"
                                      ? "Fel kategori"
                                      : "Annat"}
                                  </span>
                                </div>
                                {report.description && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {report.description}
                                  </p>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Rapporterad av{" "}
                                  <Link
                                    to={`/profil/${report.reporter_id}`}
                                    className="hover:text-primary"
                                  >
                                    {report.reporter_name}
                                  </Link>{" "}
                                  •{" "}
                                  {formatDistanceToNow(new Date(report.created_at), {
                                    addSuffix: true,
                                    locale: sv,
                                  })}
                                </div>
                              </div>
                              {report.status === "pending" && (
                                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResolveReport(report.id, "dismiss")}
                                    disabled={resolvingReportId === report.id}
                                  >
                                    {resolvingReportId === report.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      "Avvisa"
                                    )}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleResolveReport(report.id, "hide_listing")}
                                    disabled={resolvingReportId === report.id}
                                  >
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Dölj
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={resolvingReportId === report.id}
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Radera
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Radera annons?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Är du säker på att du vill radera "{report.listing_title}"? 
                                          Detta kan inte ångras.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleResolveReport(report.id, "delete_listing")
                                          }
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Radera
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            )}

            {/* Blog Tab */}
            {canManageBlog && (
              <TabsContent value="blog">
                <div className="bg-card border border-border rounded-xl">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Blogginlägg</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={fetchBlogPosts} disabled={loadingBlog}>
                        <RefreshCw className={`w-4 h-4 ${loadingBlog ? "animate-spin" : ""}`} />
                        Uppdatera
                      </Button>
                      <Button variant="glow" size="sm" onClick={() => handleOpenBlogDialog()}>
                        <Plus className="w-4 h-4" />
                        Ny artikel
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px]">
                    {loadingBlog ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : blogPosts.length === 0 ? (
                      <div className="text-center py-20 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Inga blogginlägg ännu</p>
                        <Button
                          variant="link"
                          onClick={() => handleOpenBlogDialog()}
                          className="mt-2"
                        >
                          Skapa din första artikel
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {blogPosts.map((post) => (
                          <div
                            key={post.id}
                            className="p-4 hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground truncate">
                                    {post.title}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      post.published
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    {post.published ? "Publicerad" : "Utkast"}
                                  </span>
                                </div>
                                {post.excerpt && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                    {post.excerpt}
                                  </p>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {post.author_name} •{" "}
                                  {formatDistanceToNow(new Date(post.created_at), {
                                    addSuffix: true,
                                    locale: sv,
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {post.published && (
                                  <Link to={`/blogg/${post.slug}`}>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenBlogDialog(post)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Radera artikel?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Är du säker på att du vill radera "{post.title}"? 
                                        Detta kan inte ångras.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteBlogPost(post.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Radera
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            )}

            {/* Support Tab */}
            {canViewSupport && (
              <TabsContent value="support">
                <div className="bg-card border border-border rounded-xl">
                  <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-semibold text-foreground">Supportärenden</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showClosedSupport ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowClosedSupport(!showClosedSupport)}
                      >
                        <Archive className="w-4 h-4" />
                        {showClosedSupport ? "Visa öppna" : "Visa stängda"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={fetchSupportConversations} disabled={loadingSupport}>
                        <RefreshCw className={`w-4 h-4 ${loadingSupport ? "animate-spin" : ""}`} />
                        Uppdatera
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row h-[500px]">
                    {/* Conversation list */}
                    <div className={`${selectedSupportConv ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border ${selectedSupportConv ? '' : 'h-full'}`}>
                      <ScrollArea className="h-full">
                        {loadingSupport ? (
                          <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : supportConversations.filter(c => {
          const isClosed = c.status === "closed";
          console.log(`Filtering conversation ${c.id}: status=${c.status}, isClosed=${isClosed}, showClosed=${showClosedSupport}, shouldShow=${showClosedSupport ? isClosed : !isClosed}`);
          return showClosedSupport ? isClosed : !isClosed;
        }).length === 0 ? (
                          <div className="text-center py-20 text-muted-foreground text-sm px-4">
                            {showClosedSupport ? "Inga stängda ärenden" : "Inga öppna supportärenden"}
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {supportConversations
                              .filter(c => {
                                const isClosed = c.status === "closed";
                                return showClosedSupport ? isClosed : !isClosed;
                              })
                              .map((conv) => (
                              <button
                                key={conv.id}
                                onClick={() => handleSelectSupportConv(conv)}
                                className={`w-full p-3 text-left hover:bg-secondary/30 transition-colors ${
                                  selectedSupportConv?.id === conv.id ? "bg-secondary/50" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                    {conv.buyer_avatar ? (
                                      <img
                                        src={conv.buyer_avatar}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm truncate">
                                        {conv.buyer_name}
                                      </span>
                                      {(conv.unread_count || 0) > 0 && conv.status !== "closed" && (
                                        <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1.5">
                                          {conv.unread_count}
                                        </span>
                                      )}
                                      {conv.status === "closed" && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {conv.last_message || "Inget meddelande"}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    {/* Chat area */}
                    <div className={`${selectedSupportConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
                      {selectedSupportConv ? (
                        <>
                          {/* Chat header */}
                          <div className="p-2 sm:p-3 border-b border-border flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden shrink-0 px-2"
                                onClick={() => setSelectedSupportConv(null)}
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </Button>
                              <Link
                                to={`/profil/${selectedSupportConv.buyer_id}`}
                                className="font-medium text-foreground hover:text-primary text-sm sm:text-base truncate"
                              >
                                {selectedSupportConv.buyer_name}
                              </Link>
                              {selectedSupportConv.status === "closed" && (
                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 shrink-0">
                                  Stängt
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {selectedSupportConv.status === "closed" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReopenSupportConversation}
                                    disabled={closingConversation}
                                    className="text-xs sm:text-sm px-2 sm:px-3"
                                  >
                                    {closingConversation ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Öppna igen</span>
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={deletingConversation}
                                        className="text-xs sm:text-sm px-2 sm:px-3"
                                      >
                                        {deletingConversation ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                        <span className="hidden sm:inline">Radera</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Radera supportärende?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Detta tar bort all konversationshistorik permanent. Åtgärden kan inte ångras.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleDeleteSupportConversation}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Radera permanent
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCloseSupportConversation}
                                  disabled={closingConversation}
                                  className="text-xs sm:text-sm px-2 sm:px-3"
                                >
                                  {closingConversation ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  <span className="hidden xs:inline sm:inline">Stäng</span>
                                  <span className="hidden sm:inline ml-1">ärende</span>
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Messages */}
                          <ScrollArea className="flex-1 p-4">
                            {loadingSupportMessages ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              </div>
                            ) : supportMessages.length === 0 ? (
                              <div className="text-center py-10 text-muted-foreground text-sm">
                                Inga meddelanden
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {supportMessages.map((msg) => {
                                  const isFromAdmin = msg.is_system_message || msg.sender_id === user?.id;
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`flex ${isFromAdmin ? "justify-end" : "justify-start"}`}
                                    >
                                      <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                          isFromAdmin
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-secondary text-foreground rounded-bl-sm"
                                        }`}
                                      >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                          {msg.content}
                                        </p>
                                        <p
                                          className={`text-[10px] mt-1 ${
                                            isFromAdmin
                                              ? "text-primary-foreground/70"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {formatDistanceToNow(new Date(msg.created_at), {
                                            addSuffix: true,
                                            locale: sv,
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                                <div ref={supportMessagesEndRef} />
                              </div>
                            )}
                          </ScrollArea>

                          {/* Reply input - only show for open conversations */}
                          {selectedSupportConv.status !== "closed" ? (
                            <div className="p-3 border-t border-border">
                              <div className="flex gap-2">
                                <Textarea
                                  value={supportReply}
                                  onChange={(e) => setSupportReply(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendSupportReply();
                                    }
                                  }}
                                  placeholder="Skriv ett svar..."
                                  className="min-h-[44px] max-h-[100px] resize-none"
                                  rows={1}
                                />
                                <Button
                                  onClick={handleSendSupportReply}
                                  disabled={!supportReply.trim() || sendingSupportReply}
                                  size="icon"
                                  className="shrink-0"
                                >
                                  {sendingSupportReply ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 border-t border-border text-center text-muted-foreground text-sm">
                              Ärendet är stängt. Öppna igen för att svara.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                          Välj en konversation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Newsletter Tab */}
            {isAdmin && (
              <TabsContent value="newsletter">
                <AdminNewsletterTab />
              </TabsContent>
            )}

            {/* Activity Log Tab */}
            {isAdmin && (
              <TabsContent value="activity">
                <AdminActivityLog />
              </TabsContent>
            )}

            {/* GDPR Tab */}
            {isAdmin && (
              <TabsContent value="gdpr">
                <AdminGdprTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Direct Message Dialog */}
      <Dialog open={directMessageDialogOpen} onOpenChange={setDirectMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Skicka meddelande till {directMessageRecipient?.display_name || "användare"}</DialogTitle>
            <DialogDescription>
              Detta meddelande kommer att visas som från "HiFihörnet" i användarens inkorg.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Meddelande
              </label>
              <Textarea
                value={directMessageContent}
                onChange={(e) => setDirectMessageContent(e.target.value)}
                placeholder="Skriv ditt meddelande här..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDirectMessageDialogOpen(false)}
              disabled={sendingDirectMessage}
            >
              Avbryt
            </Button>
            <Button
              variant="glow"
              onClick={handleSendDirectMessage}
              disabled={sendingDirectMessage || !directMessageContent.trim()}
            >
              {sendingDirectMessage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Skicka som HiFihörnet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blog Post Dialog */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {editingPost ? "Redigera artikel" : "Ny artikel"}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Uppdatera artikelns innehåll och inställningar"
                : "Skapa en ny artikel till bloggen"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Titel *
              </label>
              <Input
                value={blogTitle}
                onChange={(e) => {
                  setBlogTitle(e.target.value);
                  if (!editingPost) {
                    setBlogSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[åä]/g, "a")
                        .replace(/ö/g, "o")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }
                }}
                placeholder="Artikelns titel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Slug (URL) *
              </label>
              <Input
                value={blogSlug}
                onChange={(e) =>
                  setBlogSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="artikel-slug"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Används i URL:en: /blogg/{blogSlug || "slug"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Utdrag (valfritt)
              </label>
              <Textarea
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Kort beskrivning som visas i listan..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Omslagsbild (valfritt)
              </label>
              <div className="space-y-2">
                <Input
                  value={blogCoverImage}
                  onChange={(e) => setBlogCoverImage(e.target.value)}
                  placeholder="Bild-URL..."
                />
                {blogCoverImage && (
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={blogCoverImage}
                      alt="Omslagsbild"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Innehåll * (Markdown stöds)
              </label>
              <Textarea
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Skriv artikelns innehåll här..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blog-published"
                checked={blogPublished}
                onChange={(e) => setBlogPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="blog-published" className="text-sm font-medium text-foreground">
                Publicera artikel
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlogDialogOpen(false)}
              disabled={savingBlog}
            >
              Avbryt
            </Button>
            <Button
              variant="glow"
              onClick={handleSaveBlogPost}
              disabled={savingBlog || !blogTitle.trim() || !blogSlug.trim() || !blogContent.trim()}
            >
              {savingBlog ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {editingPost ? "Spara ändringar" : "Skapa artikel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Listing Editor Dialog */}
      <AdminListingEditor
        listingId={editingListingId}
        open={listingEditorOpen}
        onOpenChange={setListingEditorOpen}
        onSave={fetchListings}
      />

      {/* Role Manager Dialog */}
      {roleManagerUser && (
        <AdminRoleManager
          userId={roleManagerUser.id}
          userName={roleManagerUser.name}
          currentRoles={roleManagerUser.roles}
          open={roleManagerOpen}
          onOpenChange={setRoleManagerOpen}
          onRolesUpdated={fetchProfiles}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
