import React from 'react';
import { BusinessRegistration } from '@/components/BusinessRegistration';

const BusinessRegistrationPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ansök om företagskonto</h1>
        <p className="text-muted-foreground">
          Få tillgång till HiFiShop och sälj era hi-fi produkter till tusentals kunder.
        </p>
      </div>
      
      <BusinessRegistration />
    </div>
  );
};

export default BusinessRegistrationPage;
