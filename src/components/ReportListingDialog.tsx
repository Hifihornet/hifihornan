import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportListingDialogProps {
  listingId: string;
  listingTitle: string;
}

const reportReasons = [
  { id: "fake", label: "Falsk eller bedräglig annons" },
  { id: "inappropriate", label: "Olämpligt innehåll" },
  { id: "spam", label: "Spam eller reklam" },
  { id: "wrong_category", label: "Fel kategori" },
  { id: "other", label: "Annat" },
];

const ReportListingDialog = ({ listingId, listingTitle }: ReportListingDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du måste logga in för att rapportera");
      return;
    }

    if (!reason) {
      toast.error("Välj en anledning");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        listing_id: listingId,
        reason,
        description: description || null,
      });

      if (error) throw error;

      toast.success("Tack för din rapport! Vi granskar annonsen.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error("Kunde inte skicka rapporten");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4 mr-1" />
          Rapportera
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rapportera annons</DialogTitle>
          <DialogDescription>
            Rapportera "{listingTitle}" om du misstänker att något är fel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reportReasons.map((r) => (
              <div key={r.id} className="flex items-center space-x-2">
                <RadioGroupItem value={r.id} id={r.id} />
                <Label htmlFor={r.id}>{r.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning (valfritt)</Label>
            <Textarea
              id="description"
              placeholder="Beskriv problemet mer i detalj..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Skicka rapport
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingDialog;
