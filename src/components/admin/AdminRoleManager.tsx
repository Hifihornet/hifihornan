import { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldCheck, 
  Store, 
  Star,
  Loader2,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "creator" | "store";

interface AdminRoleManagerProps {
  userId: string;
  userName: string;
  currentRoles: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRolesUpdated: () => void;
}

const AVAILABLE_ROLES: { value: AppRole; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: "admin", 
    label: "Admin", 
    icon: ShieldCheck,
    description: "Full tillgång till alla funktioner"
  },
  { 
    value: "moderator", 
    label: "Moderator", 
    icon: Shield,
    description: "Kan hantera annonser och rapporter"
  },
  { 
    value: "creator", 
    label: "Creator", 
    icon: Star,
    description: "Kan hantera blogginlägg"
  },
  { 
    value: "store", 
    label: "Företag", 
    icon: Store,
    description: "Företagskonto med badge"
  }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin": return ShieldCheck;
    case "moderator": return Shield;
    case "creator": return Star;
    case "store": return Store;
    default: return Shield;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin": return "Admin";
    case "moderator": return "Moderator";
    case "creator": return "Creator";
    case "store": return "Företag";
    default: return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "moderator": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "creator": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "store": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const AdminRoleManager = ({ 
  userId, 
  userName, 
  currentRoles, 
  open, 
  onOpenChange,
  onRolesUpdated 
}: AdminRoleManagerProps) => {
  const [roles, setRoles] = useState<string[]>(currentRoles);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Sync local state with props when they change
  useEffect(() => {
    setRoles(currentRoles);
  }, [currentRoles]);

  const availableToAdd = AVAILABLE_ROLES.filter(r => !roles.includes(r.value));

  const handleAddRole = async () => {
    if (!selectedRole) return;

    setAdding(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: selectedRole as AppRole
        });

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_activity_log").insert({
          admin_id: user.id,
          action_type: "add_role",
          target_type: "user",
          target_id: userId,
          details: { role: selectedRole, user_name: userName }
        });
      }

      setRoles([...roles, selectedRole]);
      setSelectedRole("");
      toast.success(`Roll "${getRoleLabel(selectedRole)}" tillagd`);
      onRolesUpdated();
    } catch (err: unknown) {
      console.error("Error adding role:", err);
      const errorCode = (err as { code?: string }).code;
      if (errorCode === "23505") {
        toast.error("Användaren har redan denna roll");
      } else {
        toast.error("Kunde inte lägga till roll");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRole = async (roleToRemove: string) => {
    setRemoving(roleToRemove);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", roleToRemove as "admin" | "moderator" | "creator" | "store");

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_activity_log").insert({
          admin_id: user.id,
          action_type: "remove_role",
          target_type: "user",
          target_id: userId,
          details: { role: roleToRemove, user_name: userName }
        });
      }

      setRoles(roles.filter(r => r !== roleToRemove));
      toast.success(`Roll "${getRoleLabel(roleToRemove)}" borttagen`);
      onRolesUpdated();
    } catch (err) {
      console.error("Error removing role:", err);
      toast.error("Kunde inte ta bort roll");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Hantera roller
          </DialogTitle>
          <DialogDescription>
            Hantera roller för <span className="font-medium text-foreground">{userName || "användaren"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current roles */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Nuvarande roller</h4>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Inga roller tilldelade</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => {
                  const Icon = getRoleIcon(role);
                  return (
                    <Badge 
                      key={role} 
                      variant="outline"
                      className={`${getRoleColor(role)} flex items-center gap-1.5 pr-1`}
                    >
                      <Icon className="w-3 h-3" />
                      {getRoleLabel(role)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={() => handleRemoveRole(role)}
                        disabled={removing === role}
                      >
                        {removing === role ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add role */}
          {availableToAdd.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Lägg till roll</h4>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Välj roll att lägga till" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((role) => {
                      const Icon = role.icon;
                      return (
                      <SelectItem key={role.value} value={role.value as string}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              - {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddRole}
                  disabled={!selectedRole || adding}
                  size="icon"
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Role descriptions */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Rollbeskrivningar</h4>
            <div className="space-y-2 text-sm">
              {AVAILABLE_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.value} className="flex items-start gap-2">
                    <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{role.label}:</span>{" "}
                      <span className="text-muted-foreground">{role.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Stäng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRoleManager;
