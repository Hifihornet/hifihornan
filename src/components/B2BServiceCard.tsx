import { useState } from "react";
import { Check, Star, Users, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface B2BServiceCardProps {
  plan: "starter" | "professional" | "enterprise";
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
}

const B2BServiceCard = ({ plan, currentPlan, onUpgrade }: B2BServiceCardProps) => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = {
    starter: {
      name: "Starter",
      price: isYearly ? 2900 : 290,
      description: "Perfekt för små HiFi-butiker",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      features: [
        "20 annonser per månad",
        "Basic analytics",
        "Email support",
        "HiFi-namn",
        "Community access"
      ],
      cta: currentPlan === "starter" ? "Nuvarande plan" : "Uppgradera"
    },
    professional: {
      name: "Professional",
      price: isYearly ? 5900 : 590,
      description: "För växande HiFi-företag",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      features: [
        "Obegränsat med annonser",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "API access",
        "Inventory management",
        "Bulk operations"
      ],
      cta: currentPlan === "professional" ? "Nuvarande plan" : "Uppgradera"
    },
    enterprise: {
      name: "Enterprise",
      price: "Anpassat",
      description: "För stora HiFi-kedjor",
      icon: Shield,
      color: "from-amber-500 to-amber-600",
      features: [
        "All Professional features",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solution",
        "Advanced reporting",
        "SLA guarantee",
        "Training & onboarding",
        "Custom contracts"
      ],
      cta: "Kontakta sälj"
    }
  };

  const planData = plans[plan];
  const Icon = planData.icon;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
      currentPlan === plan ? 'ring-2 ring-primary scale-105' : 'hover:scale-102'
    }`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${planData.color} opacity-5`} />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${planData.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{planData.name}</CardTitle>
              <CardDescription>{planData.description}</CardDescription>
            </div>
          </div>
          {currentPlan === plan && (
            <Badge variant="default">Aktiv</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              {planData.price === "Anpassat" ? "Anpassat" : `${planData.price} kr`}
            </span>
            {planData.price !== "Anpassat" && (
              <>
                <span className="text-muted-foreground ml-1">/mån</span>
                {isYearly && (
                  <Badge variant="secondary" className="ml-2">Spara 2 månader</Badge>
                )}
              </>
            )}
          </div>
          {planData.price !== "Anpassat" && (
            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm text-muted-foreground">Fakturering:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className="text-xs"
              >
                {isYearly ? "Årligen" : "Månadsvis"}
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {planData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button 
          className={`w-full bg-gradient-to-r ${planData.color} hover:opacity-90 transition-opacity`}
          onClick={() => onUpgrade?.(plan)}
          disabled={currentPlan === plan}
        >
          {planData.cta}
        </Button>

        {/* Popular badge */}
        {plan === "professional" && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              Populärast
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default B2BServiceCard;
