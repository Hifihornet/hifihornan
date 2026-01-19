import { useState } from "react";
import { Key, User, Info, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DiscogsAPI, validateDiscogsCredentials, importUserCollection } from "@/lib/discogs";

interface VinylImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportComplete?: (importedCount: number) => void;
}

const VinylImportDialog = ({ 
  open, 
  onOpenChange, 
  companyId, 
  onImportComplete 
}: VinylImportDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [discogsUsername, setDiscogsUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCredentialsValid, setIsCredentialsValid] = useState<boolean | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importResults, setImportResults] = useState<any[]>([]);

  const handleValidateCredentials = async () => {
    if (!apiKey || !apiSecret) {
      toast.error("Fyll i både API-nyckel och API-secret");
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateDiscogsCredentials(apiKey, apiSecret);
      setIsCredentialsValid(isValid);
      
      if (isValid) {
        toast.success("Discogs-uppgifterna är korrekta!");
      } else {
        toast.error("Ogiltiga Discogs-uppgifter. Kontrollera dina nycklar.");
      }
    } catch (error) {
      console.error("Error validating Discogs credentials:", error);
      toast.error("Kunde inte validera Discogs-uppgifter");
      setIsCredentialsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!apiKey || !apiSecret || !discogsUsername) {
      toast.error("Fyll i alla fält");
      return;
    }

    if (!isCredentialsValid) {
      toast.error("Validera dina Discogs-uppgifter först");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults([]);

    try {
      const results = await importUserCollection(
        discogsUsername,
        apiKey,
        apiSecret,
        companyId
      );

      // TODO: Save to database
      // const { data } = await supabase.from("vinyl_catalog").insert(results.vinylRecords);

      setImportResults(results.vinylRecords);
      setImportTotal(results.totalItems);
      setImportProgress(100);
      
      toast.success(`Import slutförd! ${results.vinylRecords.length} vinylskivor importerade.`);
      onImportComplete?.(results.vinylRecords.length);
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error("Error importing from Discogs:", error);
      toast.error("Kunde inte importera från Discogs. Kontrollera användarnamnet och försök igen.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setApiKey("");
    setApiSecret("");
    setDiscogsUsername("");
    setIsCredentialsValid(null);
    setImportProgress(0);
    setImportTotal(0);
    setImportResults([]);
  };

  const handleClose = () => {
    if (isImporting) return; // Don't close during import
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Importera från Discogs
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Discogs API</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="results">Resultat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discogs API-nycklar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API-nyckel (Consumer Key)</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Din Discogs API-nyckel"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="api-secret">API-secret (Consumer Secret)</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="Din Discogs API-secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleValidateCredentials}
                    disabled={isValidating || !apiKey || !apiSecret}
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Validerar...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Validera uppgifter
                      </>
                    )}
                  </Button>
                  
                  {isCredentialsValid !== null && (
                    <div className={`p-3 rounded-md flex items-center gap-2 ${
                      isCredentialsValid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {isCredentialsValid ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>API-uppgifterna är korrekta!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>API-uppgifterna är ogiltiga. Kontrollera dina nycklar.</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Hur får jag Discogs API-nycklar?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Gå till <a href="https://www.discogs.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Discogs Developer Settings</a></li>
                    <li>Klicka på "Create new app"</li>
                    <li>Fyll i app-information (app name, description, callback URL)</li>
                    <li>Spara appen - du får då din Consumer Key och Consumer Secret</li>
                    <li>Kopiera och klistra in nycklarna ovan</li>
                  </ol>
                  
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Obs:</strong> Callback URL kan vara valfri, t.ex. <code>https://localhost:3000/callback</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Discogs Användare
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="discogs-username">Discogs användarnamn</Label>
                    <Input
                      id="discogs-username"
                      placeholder="Ditt Discogs användarnamn"
                      value={discogsUsername}
                      onChange={(e) => setDiscogsUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      Importerar hela din Discogs collection till VinylHyllan. 
                      Detta inkluderar alla vinylskivor i din samling.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting || !isCredentialsValid || !discogsUsername}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Importerar... {importProgress}%
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Starta import
                      </>
                    )}
                  </Button>
                  
                  {isImporting && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {importProgress > 0 ? `Importerar... ${importProgress}%` : "Förbereder import..."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Importresultat</CardTitle>
                </CardHeader>
                <CardContent>
                  {importResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{importResults.length}</p>
                          <p className="text-sm text-muted-foreground">Importerade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {importResults.filter((v: any) => v.in_stock).length}
                          </p>
                          <p className="text-sm text-muted-foreground">I lager</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {new Set(importResults.map((v: any) => v.genre).flat()).size}
                          </p>
                          <p className="text-sm text-muted-foreground">Genrer</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {importResults.reduce((sum: number, v: any) => sum + (v.year || 0), 0) / importResults.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Genomsnittligt år</p>
                        </div>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {importResults.slice(0, 10).map((vinyl: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium">{vinyl.artist} - {vinyl.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {vinyl.year} • {vinyl.label} • {vinyl.genre?.join(", ")}
                              </p>
                            </div>
                            <Badge variant={vinyl.in_stock ? "default" : "secondary"}>
                              {vinyl.in_stock ? "I lager" : "Slutsåld"}
                            </Badge>
                          </div>
                        ))}
                        {importResults.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center">
                            ... och {importResults.length - 10} till
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {isImporting ? "Import pågår..." : "Inga importerade vinylskivor än"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VinylImportDialog;
