import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Mail, Lock, User, AlertCircle } from 'lucide-react';

const BusinessRegister = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Ogiltig inbjudningslänk');
      setLoading(false);
      return;
    }

    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('business_invitations' as any)
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      // Kolla om länken har löpt ut
      if (new Date(data.expires_at) < new Date()) {
        setError('Inbjudan har löpt ut');
        return;
      }

      setInvitation(data);
      setFormData(prev => ({ ...prev, email: data.email }));
    } catch (error) {
      console.error('Error verifying invitation:', error);
      setError('Ogiltig eller utgången inbjudan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }

    if (formData.password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      return;
    }

    setSubmitting(true);

    try {
      // Skapa konto
      const { error: signUpError } = await signUp(formData.email, formData.password);

      if (signUpError) throw signUpError;

      // Uppdatera inbjudan
      const { error: updateError } = await supabase
        .from('business_invitations' as any)
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast.success('Konto skapat! Du kan nu logga in.');
      navigate('/login');
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Kunde inte skapa konto. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Verifierar inbjudan...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ogiltig inbjudan</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Till startsidan</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Registrera företagskonto</CardTitle>
          <p className="text-muted-foreground">
            {invitation.company_name}
          </p>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Hej {invitation.contact_name}! Ni har bjudits in att skapa ett företagskonto för {invitation.company_name}.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Välj ett säkert lösenord"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Bekräfta lösenordet"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Skapar konto...' : 'Skapa företagskonto'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Genom att skapa ett konto accepterar ni våra{' '}
              <a href="/terms" className="text-primary hover:underline">villkor</a> och{' '}
              <a href="/privacy" className="text-primary hover:underline">integritetspolicy</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessRegister;
