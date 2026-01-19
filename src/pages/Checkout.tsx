import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CreditCard, Truck, Package, User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  discogs_id: number;
  company_id: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  artist: string;
  title: string;
  year?: number;
  label?: string;
  catalog_number?: string;
  condition?: string;
  price?: number;
  image_url?: string;
  genre?: string[];
  format?: string;
  quantity: number;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingOption, setShippingOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  
  // Form data
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    postalCode: user?.user_metadata?.postal_code || "",
    city: user?.user_metadata?.city || "",
    country: user?.user_metadata?.country || "Sverige"
  });
  
  const [orderNotes, setOrderNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("vinyl-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate("/vinylhyllan");
    }
  };

  const shippingOptions: ShippingOption[] = [
    {
      id: "standard",
      name: "Standardfrakt",
      price: 49,
      estimatedDays: "3-5 arbetsdagar",
      description: "Spårbart paket med PostNord"
    },
    {
      id: "express",
      name: "Expressfrakt",
      price: 99,
      estimatedDays: "1-2 arbetsdagar",
      description: "Snabb leverans med spårning"
    },
    {
      id: "pickup",
      name: "Hämta i butik",
      price: 0,
      estimatedDays: "Omedelbart",
      description: "Hämta din vinyl direkt i butiken"
    }
  ];

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const getShippingCost = () => {
    const option = shippingOptions.find(opt => opt.id === shippingOption);
    return option ? option.price : 49;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  const getGroupedCart = () => {
    const grouped = cart.reduce((acc, item) => {
      if (!acc[item.company_id]) {
        acc[item.company_id] = {
          company: {
            id: item.company_id,
            name: item.company_name,
            email: item.company_email,
            phone: item.company_phone,
            address: item.company_address
          },
          items: [],
          subtotal: 0
        };
      }
      acc[item.company_id].items.push(item);
      acc[item.company_id].subtotal += (item.price || 0) * item.quantity;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return customerInfo.firstName && customerInfo.lastName && 
               customerInfo.email && customerInfo.phone && 
               customerInfo.address && customerInfo.postalCode && customerInfo.city;
      case 2:
        return shippingOption;
      case 3:
        return paymentMethod;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error("Fyll i alla obligatoriska fält");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePayment = async () => {
    if (!validateStep(3)) {
      toast.error("Välj betalningsmetod");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order for each company
      const orders = getGroupedCart().map(group => ({
        customer_id: user?.id,
        company_id: group.company.id,
        items: group.items.map(item => ({
          vinyl_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customer_info: customerInfo,
        shipping_option: shippingOption,
        shipping_cost: getShippingCost(),
        subtotal: group.subtotal,
        total: group.subtotal + getShippingCost(),
        order_notes: orderNotes,
        status: "pending_payment",
        created_at: new Date().toISOString()
      }));

      // TODO: Save orders to database
      // const { data } = await supabase.from("orders").insert(orders);

      if (paymentMethod === "stripe") {
        // TODO: Create Stripe payment intent
        // const stripe = await loadStripe("pk_test_..."); // Your Stripe public key
        // if (stripe) {
        //   const { error } = await stripe.redirectToCheckout({
        //     lineItems: orders.flatMap(order => 
        //       order.items.map(item => ({
        //         price_data: {
        //           currency: 'sek',
        //           product_data: {
        //             name: `${item.artist} - ${item.title}`,
        //             description: `Från ${group.company.name}`,
        //           },
        //           unit_amount: item.price * 100, // Convert to ören
        //         },
        //         quantity: item.quantity,
        //       }))
        //     ),
        //     mode: 'payment',
        //     successUrl: `${window.location.origin}/order-success`,
        //     cancelUrl: `${window.location.origin}/checkout`,
        //   });
        //   
        //   if (error) {
        //     throw error;
        //   }
        // }
      } else {
        // Handle other payment methods (Swish, etc.)
        toast.info("Betalningsmetod kommer snart!");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Kunde inte genomföra betalningen");
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedCart = getGroupedCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Din varukorg är tom</h2>
          <p className="text-muted-foreground mb-4">
            Lägg till några vinylskivor i varukorgen för att fortsätta
          </p>
          <Button onClick={() => navigate("/vinylhyllan")}>
            Till VinylHyllan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate("/vinylhyllan")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Slutför ditt köp från {groupedCart.length} {groupedCart.length === 1 ? 'butik' : 'butiker'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step < 4 ? step : <CheckCircle className="w-5 h-5" />}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-1 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Customer Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Leveransinformation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Förnamn *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Ditt förnamn"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Efternamn *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Ditt efternamn"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="din.epost@exempel.se"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="070-123 45 67"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Adress *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Gatuadress 123"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postnummer *</Label>
                    <Input
                      id="postalCode"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="123 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ort *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Stad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      value={customerInfo.country}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Sverige"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="orderNotes">Meddelande till säljare (frivilligt)</Label>
                  <Textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Eventuella önskemän eller frågor..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Fraktalternativ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingOption} onValueChange={setShippingOption}>
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {option.price === 0 ? "Gratis" : `${option.price} kr`}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Betalningsmetod
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <div className="flex-1">
                      <Label htmlFor="stripe" className="font-medium cursor-pointer">
                        Kortbetalning (Stripe)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Betala säkert med Visa, Mastercard eller American Express
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        V
                      </div>
                      <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                        A
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                    <RadioGroupItem value="swish" id="swish" disabled />
                    <div className="flex-1">
                      <Label htmlFor="swish" className="font-medium cursor-pointer">
                        Swish
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Kommer snart - betala direkt med Swish
                      </p>
                    </div>
                    <div className="text-green-600 font-semibold">
                      Snart tillgängligt
                    </div>
                  </div>
                </RadioGroup>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Säker betalning</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Alla betalningar hanteras säkert via Stripe. Dina kortuppgifter sparas aldrig hos oss.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Orderöversikt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupedCart.map((group, index) => (
                    <div key={group.company.id} className={index > 0 ? "mt-6 pt-6 border-t" : ""}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{group.company.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.company.address}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {group.items.length} {group.items.length === 1 ? 'produkt' : 'produkter'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {group.items.map((item: CartItem) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={`${item.artist} - ${item.title}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.artist} - {item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.condition} • {item.year}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.price} kr</p>
                              <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Delsumma:</span>
                          <span>{group.subtotal} kr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Frakt:</span>
                          <span>{getShippingCost()} kr</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Totalt:</span>
                          <span>{group.subtotal + getShippingCost()} kr</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Leveransinformation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>{customerInfo.firstName} {customerInfo.lastName}</strong></p>
                    <p>{customerInfo.address}</p>
                    <p>{customerInfo.postalCode} {customerInfo.city}</p>
                    <p>{customerInfo.country}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{customerInfo.email}</span>
                      <span>{customerInfo.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Föregående
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={handleNextStep}>
                Nästa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Bearbetar...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Betala {getTotal()} kr
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ordersammanfattning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1">
                        {item.artist} - {item.title} × {item.quantity}
                      </span>
                      <span>{(item.price || 0) * item.quantity} kr</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delsumma:</span>
                    <span>{getSubtotal()} kr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frakt:</span>
                    <span>{getShippingCost()} kr</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Moms:</span>
                    <span>Inkluderad</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totalt:</span>
                    <span>{getTotal()} kr</span>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {shippingOptions.find(opt => opt.id === shippingOption)?.name}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {shippingOptions.find(opt => opt.id === shippingOption)?.estimatedDays}
                  </p>
                </div>
                
                {/* Trust Badges */}
                <div className="flex justify-center gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Säker betalning</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Snabb leverans</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Noga packat</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
