import { supabase } from '@/integrations/supabase/client';

interface BusinessInvitationData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  adminNotes?: string;
}

export const sendBusinessInvitation = async (data: BusinessInvitationData) => {
  try {
    // Generera unik token för inbjudan
    const token = generateInvitationToken();
    
    // Spara inbjudan i databasen
    const { error: inviteError } = await supabase
      .from('business_invitations' as any)
      .insert({
        email: data.contactEmail,
        company_name: data.companyName,
        contact_name: data.contactName,
        token: token,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dagar
      });

    if (inviteError) throw inviteError;

    // Skapa inbjudningslänk
    const invitationLink = `${window.location.origin}/business-register?token=${token}`;

    // Skicka email via Supabase Edge Function
    const emailData = {
      to: data.contactEmail,
      subject: `Inbjudan till HiFiHörnet - ${data.companyName}`,
      html: generateBusinessInvitationEmail(data, invitationLink)
    };

    // Anropa vår email function
    const { data: response, error: functionError } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (functionError) {
      console.error('Function error:', functionError);
      // Fallback: logga att vi skulle skicka
      console.log('Business invitation email would be sent:', emailData);
      return { success: true, token, fallback: true };
    }

    console.log('Email sent successfully:', response);
    return { success: true, token };
  } catch (error) {
    console.error('Error sending business invitation:', error);
    return { success: false, error };
  }
};

const generateInvitationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const generateBusinessInvitationEmail = (
  data: BusinessInvitationData, 
  invitationLink: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inbjudan till HiFiHörnet</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #333; text-align: center;">Välkommen till HiFiHörnet!</h1>
        
        <p style="color: #666; line-height: 1.6;">
          Hej ${data.contactName},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Vi är glada att meddela att er ansökan för företagskonto på HiFiHörnet har godkänts!
          ${data.companyName} är nu välkomna att bli en del av Sveriges största marknadsplats för hi-fi och vinyl.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333;">Nästa steg:</h3>
          <ol style="color: #666; line-height: 1.6;">
            <li>Klicka på länken nedan för att registrera ert konto</li>
            <li>Välj ett säkert lösenord</li>
            <li>Komplettera er företagsprofil</li>
            <li>Börja sälja på HiFiHörnet!</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" 
             style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Registrera ert företagskonto
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          Länken är giltig i 7 dagar. Om ni har några frågor, tveka inte att kontakta oss.
        </p>
        
        ${data.adminNotes ? `
        <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #495057; margin: 0; font-size: 14px;">
            <strong>Notis från admin:</strong> ${data.adminNotes}
          </p>
        </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Detta email skickades från HiFiHörnet.<br>
          Om ni inte förväntar er detta email, vänligen ignorera det.
        </p>
      </div>
    </body>
    </html>
  `;
};
