import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusinessRegistrationData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  description: string;
  org_number: string;
}

export const BusinessRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    description: '',
    org_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting business application:', formData);
      
      // Skapa företagsansökan
      const { data, error } = await supabase
        .from('business_applications' as any)
        .insert({
          user_id: user?.id,
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Application submitted successfully:', data);
      toast.success('Ansökan skickad! Vi granskar och återkommer inom 2-3 arbetsdagar.');
      
      // Redirect till startsidan efter 2 sekunder
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
      // Återställ formulär
      setFormData({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        website: '',
        description: '',
        org_number: ''
      });
    } catch (error) {
      console.error('Error submitting business application:', error);
      toast.error(`Kunde inte skicka ansökan: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BusinessRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ansök om företagskonto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Företagsnamn *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="AB Företag Namn"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="org_number">Orgnummer *</Label>
              <Input
                id="org_number"
                value={formData.org_number}
                onChange={(e) => handleInputChange('org_number', e.target.value)}
                placeholder="556123-4567"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact_name">Kontaktperson *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                placeholder="Förnamn Efternamn"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact_email">Email *</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="kontakt@foretag.se"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact_phone">Telefon *</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="070-123 45 67"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="website">Hemsida (valfritt)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.foretag.se (valfritt)"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Adress *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Gatuadress 123, 12345 Stad"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Beskrivning *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beskriv ert företag och er verksamhet inom hi-fi..."
              rows={4}
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Skickar...' : 'Skicka ansökan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
