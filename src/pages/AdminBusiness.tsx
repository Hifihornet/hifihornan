import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BusinessApplicationsListSimple } from '@/components/BusinessApplicationsListSimple';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AdminBusiness = () => {
  const { user } = useAuth();
  const { isAdmin, isCreator, isModerator } = useUserRoles(user?.id);
  const navigate = useNavigate();
  
  // Temporärt: låt alla se sidan för att testa
  const hasAccess = true; //isAdmin || isCreator || isModerator;

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Åtkomst nekad</h1>
            <p className="text-muted-foreground mb-4">
              Du behöver administratörsbehörighet för att se denna sida.
            </p>
            <Link to="/">
              <Button>Tillbaka till startsidan</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Tillbaka till Admin Dashboard
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Företagsansökningar
            </h1>
            <p className="text-muted-foreground">
              Granska och hantera företagsansökningar till HiFiHörnet
            </p>
          </div>

          {/* Business Applications */}
          <BusinessApplicationsListSimple />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminBusiness;
