import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Eye, Building2, Mail, Phone, MapPin, Globe, FileText, User } from 'lucide-react';
import { sendBusinessInvitation } from '@/services/emailService';

export const BusinessApplicationsListSimple = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
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
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Kunde inte hämta ansökningar');
    } finally {
      setLoading(false);
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

  const handleApprove = async (application: any) => {
    console.log('=== HANDLE APPROVE START ===');
    console.log('Application:', application);
    
    setIsProcessing(true);
    try {
      console.log('Trying to send business invitation...');
      
      // Skicka inbjudan via email
      const invitationResult = await sendBusinessInvitation({
        companyName: application.company_name,
        contactName: application.contact_name,
        contactEmail: application.contact_email,
        adminNotes: adminNotes
      });

      console.log('Invitation result:', invitationResult);

      let token = '';
      if (!invitationResult.success) {
        console.log('Email failed, generating token manually...');
        // Fallback: generera token manuellt
        token = generateInvitationToken();
        console.log('Generated token manually:', token);
        
        console.log('Saving invitation to database...');
        // Spara inbjudan manuellt
        const { error: insertError } = await supabase
          .from('business_invitations' as any)
          .insert({
            email: application.contact_email,
            company_name: application.company_name,
            contact_name: application.contact_name,
            token: token,
            status: 'pending',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (insertError) {
          console.error('Error saving invitation:', insertError);
          
          // Om det är duplicate key, hämta befintlig token
          if (insertError.code === '23505') {
            console.log('Duplicate email, checking existing invitation...');
            const { data: existingInvitation } = await supabase
              .from('business_invitations' as any)
              .select('token')
              .eq('email', application.contact_email)
              .eq('status', 'pending')
              .single();
            
            if (existingInvitation) {
              console.log('Found existing invitation with token:', existingInvitation.token);
              token = (existingInvitation as any).token;
              console.log('Using existing token instead of creating new one');
            } else {
              throw insertError;
            }
          } else {
            throw insertError;
          }
        } else {
          console.log('Invitation saved to database');
        }
      } else {
        token = invitationResult.token;
        console.log('Email succeeded, token:', token);
      }

      console.log('Updating application status...');
      // Uppdatera status till approved
      const { error: updateError } = await supabase
        .from('business_applications' as any)
        .update({ 
          status: 'approved',
          admin_notes: adminNotes ? adminNotes + '\n\nToken: ' + token : 'Token: ' + token,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) {
        console.error('Error updating application:', updateError);
        throw updateError;
      }

      console.log('Token saved to admin notes:', token);
      toast.success('Ansökan godkänd! Inbjudan skapad (se admin notes för token).');
      fetchApplications();
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Kunde inte godkänna ansökan. Försök igen.');
    } finally {
      setIsProcessing(false);
      console.log('=== HANDLE APPROVE END ===');
    }
  };

  const generateInvitationToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleReject = async (application: any) => {
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

  if (loading) {
    return <div>Laddar ansökningar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Företagsansökningar</span>
          <Badge variant="outline">
            {applications.filter(a => a.status === 'pending').length} väntar
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Inga företagsansökningar än</p>
        </div>
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
      </CardContent>
    </Card>
  );
};
