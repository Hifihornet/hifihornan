import { useState, useEffect } from "react";
import { Crown, Zap, Star, TrendingUp, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FreemiumUpgradeProps {
  userLevel: number;
  userPoints: number;
  achievements: number;
  onUpgrade: (plan: string) => void;
}

const FreemiumUpgrade = ({ userLevel, userPoints, achievements, onUpgrade }: FreemiumUpgradeProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // days until next reward

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 86400000); // Update daily
    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: 0,
      color: "from-gray-500 to-gray-600",
      icon: Lock,
      features: [
        "5 annonser",
        "Basic profil",
        "Community access",
        "Standard support"
      ],
      limitations: [
        "Ingen analytics",
        "Inga premium badges",
        "Standard bilder"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 90,
      color: "from-blue-500 to-blue-600",
      icon: Star,
      features: [
        "Obegränsat med annonser",
        "Advanced analytics",
        "Premium badges",
        "10 bilder per annons",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "legend",
      name: "HiFi Legend",
      price: 190,
      color: "from-amber-500 to-amber-600",
      icon: Crown,
      features: [
        "All Premium features",
        "HiFi Legend status",
        "Guldram på avatar",
        "20 bilder per annons",
        "Featured listings",
        "API access",
        "Dedicated support"
      ]
    }
  ];

  const currentPlan = userLevel >= 5 ? "premium" : "free";
  const currentPlanData = plans.find(p => p.id === currentPlan);

  return (
    <div className="space-y-4">
      {/* Upgrade banner */}
      {currentPlan === "free" && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Uppgradera till Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Lås upp obegränsat med annonser och analytics
                  </p>
                </div>
              </div>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity">
                    Uppgradera nu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Välj din plan</DialogTitle>
                    <DialogDescription>
                      Uppgradera för att låsa upp fler funktioner och ta din HiFi-upplevelse till nästa nivå
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => {
                      const Icon = plan.icon;
                      const isCurrent = plan.id === currentPlan;
                      
                      return (
                        <Card key={plan.id} className={`relative ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                              </div>
                              {plan.popular && (
                                <Badge variant="secondary">Populär</Badge>
                              )}
                            </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <span className="text-2xl font-bold">
                                {plan.price === 0 ? "Gratis" : `${plan.price} kr`}
                              </span>
                              {plan.price > 0 && (
                                <span className="text-muted-foreground ml-1">/mån</span>
                              )}
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                            
                            {plan.limitations && (
                              <div className="space-y-2 mb-4">
                                {plan.limitations.map((limitation, index) => (
                                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm">{limitation}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <Button 
                              className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
                              disabled={isCurrent}
                              onClick={() => onUpgrade(plan.id)}
                            >
                              {isCurrent ? "Nuvarande plan" : "Välj plan"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentPlanData.color} flex items-center justify-center`}>
              <currentPlanData.icon className="w-4 h-4 text-white" />
            </div>
            {currentPlanData.name} Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{userLevel}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userPoints}</div>
              <div className="text-sm text-muted-foreground">Poäng</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{achievements}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
          
          {currentPlan === "free" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Du har <span className="font-semibold text-primary">{timeLeft}</span> dagar kvar till nästa reward
              </p>
              <Button onClick={() => setShowDialog(true)} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Uppgradera för fler fördelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FreemiumUpgrade;
