import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Eye, Building2, Mail, Phone, MapPin, Globe, FileText, User } from 'lucide-react';

interface BusinessApplication {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  description: string;
  org_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export const BusinessApplicationsList = () => {
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<BusinessApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('business_applications' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as unknown as BusinessApplication[] || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Kunde inte hämta ansökningar');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: BusinessApplication) => {
    setIsProcessing(true);
    try {
      // Flytta till business_accounts
      const { error: moveError } = await supabase
        .from('business_accounts' as any)
        .insert({
          user_id: application.user_id,
          company_name: application.company_name,
          contact_name: application.contact_name,
          contact_email: application.contact_email,
          contact_phone: application.contact_phone,
          address: application.address,
          website: application.website,
          description: application.description,
          org_number: application.org_number,
          is_verified: true
        });

      if (moveError) throw moveError;

      // Uppdatera status i business_applications
      const { error: updateError } = await supabase
        .from('business_applications' as any)
        .update({ 
          status: 'approved',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      toast.success('Ansökan godkänd! Företaget har fått tillgång.');
      fetchApplications();
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Kunde inte godkänna ansökan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (application: BusinessApplication) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('business_applications' as any)
        .update({ 
          status: 'rejected',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      toast.success('Ansökan avslagen.');
      fetchApplications();
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Kunde inte avslå ansökan');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Väntar</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Godkänd</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Avslagen</Badge>;
      default:
        return <Badge variant="secondary">Okänd</Badge>;
    }
  };

  if (loading) {
    return <div>Laddar ansökningar...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Företagsansökningar</h2>
        <Badge variant="outline">
          {applications.filter(a => a.status === 'pending').length} väntar
        </Badge>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Inga företagsansökningar än</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{application.company_name}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {application.contact_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {application.contact_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {application.contact_phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {application.address}
                      </div>
                      {application.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Hemsida
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Org.nr: {application.org_number}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm">{application.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ansökan skapad: {new Date(application.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setAdminNotes(application.admin_notes || '');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Granska ansökan - {application.company_name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Företagsnamn</Label>
                              <p className="font-medium">{application.company_name}</p>
                            </div>
                            <div>
                              <Label>Orgnummer</Label>
                              <p className="font-medium">{application.org_number}</p>
                            </div>
                            <div>
                              <Label>Kontaktperson</Label>
                              <p className="font-medium">{application.contact_name}</p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p className="font-medium">{application.contact_email}</p>
                            </div>
                            <div>
                              <Label>Telefon</Label>
                              <p className="font-medium">{application.contact_phone}</p>
                            </div>
                            <div>
                              <Label>Adress</Label>
                              <p className="font-medium">{application.address}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Beskrivning</Label>
                            <p className="text-sm">{application.description}</p>
                          </div>
                          
                          <div>
                            <Label>Admin anteckningar</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Lägg till anteckningar om beslutet..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => handleApprove(application)}
                                  disabled={isProcessing}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Godkänn
                                </Button>
                                <Button
                                  onClick={() => handleReject(application)}
                                  disabled={isProcessing}
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Avslå
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
