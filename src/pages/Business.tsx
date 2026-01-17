import { useState } from "react";
import { Building2, TrendingUp, Users, Shield, Zap, Star, Check, ArrowRight, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import B2BServiceCard from "@/components/B2BServiceCard";
import { SEOHead } from "@/components/SEOHead";

const Business = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  const handleUpgrade = (plan: string) => {
    setSelectedPlan(plan);
    // Scroll to contact form
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.name || !formData.email) {
        alert("Vänligen fyll i namn och e-post");
        return;
      }

      // Create business inquiry object
      const inquiry = {
        ...formData,
        plan: selectedPlan,
        type: "business_inquiry",
        status: "new",
        created_at: new Date().toISOString()
      };

      console.log("Sending business inquiry:", inquiry);

      // Option 1: Save to database (if you have business_inquiries table)
      // const { error } = await supabase
      //   .from("business_inquiries")
      //   .insert([inquiry]);

      // Option 2: Send email (if you have email service)
      // await sendBusinessInquiryEmail(inquiry);

      // Option 3: Send to admin (current mock implementation)
      await sendToAdmin(inquiry);

      // Show success message
      alert("Tack för din förfrågan! Vi återkommer inom 24 timmar.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: ""
      });
      setSelectedPlan("");
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Något gick fel. Försök igen eller kontakta oss direkt.");
    }
  };

  const sendToAdmin = async (inquiry: any) => {
    // Mock implementation - would send to admin email or save to database
    console.log("Business inquiry sent to admin:", inquiry);
    
    // In production, this would:
    // 1. Send email to admin@hifihornet.se
    // 2. Save to database for tracking
    // 3. Send confirmation email to customer
    // 4. Create task for sales team
    
    // For now, just log it
    return Promise.resolve();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const features = [
    {
      icon: Building2,
      title: "Store Accounts",
      description: "Skapa en professionell butik med ditt eget varumärke"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Få insikter om din försäljning och kundbeteende"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Hantera kunder och bygg relationer"
    },
    {
      icon: Shield,
      title: "Verified Seller",
      description: "Få verifierad status och öka förtroendet"
    },
    {
      icon: Zap,
      title: "Bulk Operations",
      description: "Hantera flera annonser samtidigt"
    },
    {
      icon: Star,
      title: "Featured Listings",
      description: "Synas på startsidan och få mer exponering"
    }
  ];

  const testimonials = [
    {
      name: "AudioPro Sweden",
      role: "HiFi Butik",
      content: "HiFiHörnet har hjälpt oss nå nya kunder och öka vår försäljning med 40%.",
      rating: 5
    },
    {
      name: "Vintage Audio",
      role: "Samlare",
      content: "Fantastisk plattform för att sälja och köpa vintage HiFi-utrustning.",
      rating: 5
    },
    {
      name: "Sound Experience",
      role: "HiFi Expert",
      content: "Bästa marketplace för HiFi-entusiaster i Sverige. Professionell och pålitlig.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Business Solutions - HiFiHörnet"
        description="Professionella lösningar för HiFi-butiker och säljare. Fler annonser, analytics och premium features."
        keywords="HiFi business, HiFi butik, HiFi säljare, marketplace, analytics, premium"
        image="/og-business.jpg"
      />
      <Header />

      <main className="flex-1 pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Business Solutions
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 lg:mb-6">
              Väx din HiFi-verksamhet
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                med HiFiHörnet
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Professionella verktyg för HiFi-butiker, säljare och entusiaster. Nå fler kunder, 
              spåra din försäljning och bygga ditt varumärke.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity">
                <Building2 className="w-5 h-5 mr-2" />
                Börja idag
              </Button>
              <Button size="lg" variant="outline">
                <Phone className="w-5 h-5 mr-2" />
                Boka demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12 lg:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8">
              Varför välja HiFiHörnet Business?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-12 lg:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8">
              Välj din plan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <B2BServiceCard plan="starter" onUpgrade={handleUpgrade} />
              <B2BServiceCard plan="professional" onUpgrade={handleUpgrade} />
              <B2BServiceCard plan="enterprise" onUpgrade={handleUpgrade} />
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12 lg:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8">
              Vad våra kunder säger
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">Kontakta oss</CardTitle>
                <CardDescription>
                  Intresserad av att veta mer? Fyll i formuläret så återkommer vi inom 24 timmar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Namn *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ditt namn"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">E-post *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="din@epost.se"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Företag</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Företagsnamn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefon</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="070-123 45 67"
                      />
                    </div>
                  </div>

                  {selectedPlan && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Intresserad plan</label>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="font-medium">{selectedPlan}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Meddelande</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Berätta om dina behov..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Skicka förfrågan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Business;
