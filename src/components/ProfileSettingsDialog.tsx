import { useState, useEffect } from "react";
import { Settings, User, Trash2, Upload, Loader2, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_searchable?: boolean;
  allow_direct_messages?: boolean;
}

interface ProfileSettingsDialogProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

const ProfileSettingsDialog = ({ profile, onProfileUpdate }: ProfileSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [location, setLocation] = useState(profile.location || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isSearchable, setIsSearchable] = useState(profile.is_searchable ?? false);
  const [allowDirectMessages, setAllowDirectMessages] = useState(profile.allow_direct_messages ?? true);

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setIsSearchable(profile.is_searchable ?? false);
      setAllowDirectMessages(profile.allow_direct_messages ?? true);
    }
  }, [open, profile]);

  const handleSaveProfile = async () => {
    if (!user) {
      console.error("No user found");
      toast.error("Du måste vara inloggad");
      return;
    }
    
    setSavingProfile(true);
    
    try {
      console.log("Saving profile with data:", {
        displayName,
        location,
        bio,
        isSearchable,
        allowDirectMessages,
        userId: user.id
      });

      // Validera data innan skicka
      if (!displayName || displayName.trim().length === 0) {
        console.error("Display name is empty");
        toast.error("Namn får inte vara tomt");
        return;
      }

      const updateData: any = {
        display_name: displayName.trim(),
        bio: bio?.trim() || null,
        updated_at: new Date().toISOString()
      };

      console.log("Update data:", updateData);

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id)
        .select("*");

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error("No data returned from update");
        throw new Error("Ingen data returnerades från uppdateringen");
      }

      const updatedProfile = data[0];
      console.log("Updated profile:", updatedProfile);

      onProfileUpdate({
        ...profile,
        ...updatedProfile,
      });

      toast.success("Profilen har uppdaterats");
      setOpen(false);
    } catch (err) {
      console.error("Full error object:", err);
      
      let errorMessage = "Okänt fel";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      } else if (typeof err === 'string') {
        errorMessage = err;
        console.error("String error:", err);
      } else {
        console.error("Unknown error type:", typeof err, err);
      }
      
      toast.error(`Kunde inte spara profilen: ${errorMessage}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Endast bilder är tillåtna");
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split("/avatars/")[1]?.split("?")[0];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      onProfileUpdate({ ...profile, avatar_url: avatarUrl });
      toast.success("Profilbilden har uppdaterats");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Kunde inte ladda upp profilbilden");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !profile.avatar_url) return;

    try {
      const oldPath = profile.avatar_url.split("/avatars/")[1]?.split("?")[0];
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      onProfileUpdate({ ...profile, avatar_url: null });
      toast.success("Profilbilden har tagits bort");
    } catch (err) {
      console.error("Error deleting avatar:", err);
      toast.error("Kunde inte ta bort profilbilden");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);

    try {
      // Delete avatar from storage
      if (profile.avatar_url) {
        const avatarPath = profile.avatar_url.split("/avatars/")[1]?.split("?")[0];
        if (avatarPath) {
          await supabase.storage.from("avatars").remove([avatarPath]);
        }
      }

      // Get user's listings and their images
      const { data: userListings } = await supabase
        .from("listings")
        .select("images")
        .eq("user_id", user.id);

      if (userListings) {
        const listingImagePaths = userListings
          .flatMap((l) => l.images || [])
          .map((url) => url.split("/listing-images/")[1])
          .filter(Boolean);
        if (listingImagePaths.length > 0) {
          await supabase.storage.from("listing-images").remove(listingImagePaths);
        }
      }

      // Call the database function to delete account
      const { error } = await supabase.rpc("delete_user_account", {
        _user_id: user.id,
      });

      if (error) throw error;

      // Sign out and redirect
      await signOut();
      toast.success("Ditt konto har raderats");
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Kunde inte radera kontot. Försök igen senare.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Profilinställningar</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Profilbild</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-primary-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Ladda upp
                    </Button>
                  </label>
                  {profile.avatar_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Ta bort
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Info Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Profilinformation</Label>

              <div className="space-y-2">
                <Label htmlFor="displayName">Namn</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ditt namn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ort</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Din ort"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Om mig</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Berätta lite om dig själv..."
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            {/* Privacy Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Sekretessinställningar</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="searchable">Visa i profilsökning</Label>
                  <p className="text-sm text-muted-foreground">
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
                  <Label htmlFor="direct-messages">Ta emot direktmeddelanden</Label>
                  <p className="text-sm text-muted-foreground">
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

            <Separator />

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full"
              variant="glow"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Spara ändringar
            </Button>

            <Separator />

            {/* Delete Account Section */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">
                    Radera konto
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanent radering av all din data.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingAccount}>
                        {deletingAccount ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Raderar...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Radera mitt konto
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="w-5 h-5" />
                          Är du säker?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Du är på väg att permanent radera ditt konto. Detta inkluderar:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Din profil och all profilinformation</li>
                            <li>Alla dina annonser</li>
                            <li>Alla dina meddelanden</li>
                            <li>Alla uppladdade bilder</li>
                          </ul>
                          <p className="font-medium text-destructive">
                            Denna åtgärd kan inte ångras!
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ja, radera mitt konto
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;
