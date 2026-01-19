import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck, Mail, Phone, ArrowLeft, Home, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  artist: string;
  title: string;
  year?: number;
  condition?: string;
  price?: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  customer_id: string;
  company_id: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  items: OrderItem[];
  customer_info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  shipping_option: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  order_notes?: string;
  status: string;
  created_at: string;
}

const OrderSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [searchParams]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      // TODO: Load actual order details from database using session_id or order_id
      // const sessionId = searchParams.get('session_id');
      // if (sessionId) {
      //   const { data } = await supabase.from("orders").select("*").eq("session_id", sessionId);
      //   setOrders(data || []);
      // }

      // Mock order data for demonstration
      const mockOrders: Order[] = [
        {
          id: "order-123",
          customer_id: user?.id || "",
          company_id: "company1",
          company_name: "VinylButiken AB",
          company_email: "info@vinylbutiken.se",
          company_phone: "08-123 456 78",
          company_address: "Drottninggatan 45, Stockholm",
          items: [
            {
              id: "1",
              artist: "The Beatles",
              title: "Abbey Road",
              year: 1969,
              condition: "Mint",
              price: 299,
              quantity: 1,
              image_url: "https://i.discogs.com/..."
            },
            {
              id: "2",
              artist: "Pink Floyd",
              title: "The Dark Side of the Moon",
              year: 1973,
              condition: "Near Mint",
              price: 349,
              quantity: 1,
              image_url: "https://i.discogs.com/..."
            }
          ],
          customer_info: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "070-123 45 67",
            address: "Gatuadress 123",
            postalCode: "123 45",
            city: "Stockholm",
            country: "Sverige"
          },
          shipping_option: "standard",
          shipping_cost: 49,
          subtotal: 648,
          total: 697,
          order_notes: "Vänligen packa noga",
          status: "paid",
          created_at: new Date().toISOString()
        },
        {
          id: "order-124",
          customer_id: user?.id || "",
          company_id: "company2",
          company_name: "Skivfabriken",
          company_email: "hej@skivfabriken.se",
          company_phone: "031-987 654 32",
          company_address: "Kungsportsplatsen 2, Göteborg",
          items: [
            {
              id: "3",
              artist: "Miles Davis",
              title: "Kind of Blue",
              year: 1959,
              condition: "Very Good Plus",
              price: 499,
              quantity: 1,
              image_url: "https://i.discogs.com/..."
            }
          ],
          customer_info: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "070-123 45 67",
            address: "Gatuadress 123",
            postalCode: "123 45",
            city: "Stockholm",
            country: "Sverige"
          },
          shipping_option: "standard",
          shipping_cost: 49,
          subtotal: 499,
          total: 548,
          status: "paid",
          created_at: new Date().toISOString()
        }
      ];
      
      setOrders(mockOrders);
      
      // Clear cart
      localStorage.removeItem("vinyl-cart");
      
      toast.success("Betalningen lyckades! Din order är nu mottagen.");
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Kunde inte ladda orderinformation");
    } finally {
      setLoading(false);
    }
  };

  const getTotalOrders = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getTotalItems = () => {
    return orders.reduce((total, order) => total + order.items.length, 0);
  };

  const handleDownloadReceipt = () => {
    // TODO: Generate PDF receipt
    toast.info("Kvitto kommer snart!");
  };

  const handleContactSeller = (order: Order) => {
    // TODO: Open email client or contact form
    window.location.href = `mailto:${order.company_email}?subject=Order ${order.id}&body=Hej, jag har en fråga gällande min order ${order.id}.`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Laddar orderinformation...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Tack för din beställning!</h2>
          <p className="text-muted-foreground mb-4">
            Din betalning har genomförts och din order är nu mottagen.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/vinylhyllan")}>
              <Home className="w-4 h-4 mr-2" />
              Till VinylHyllan
            </Button>
            <Button onClick={() => navigate("/profil/" + user?.id)} variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Mina ordrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Tack för din beställning!</h1>
        <p className="text-muted-foreground">
          Din betalning har genomförts och {orders.length} {orders.length === 1 ? 'order' : 'ordrar'} har skapats
        </p>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ordersammanfattning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <p className="text-2xl font-bold">{getTotalItems()}</p>
              <p className="text-sm text-muted-foreground">Produkter</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Butiker</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{getTotalOrders()} kr</p>
              <p className="text-sm text-muted-foreground">Totalt</p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownloadReceipt} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Ladda ner kvitto
            </Button>
            <Button onClick={() => navigate("/profil/" + user?.id)}>
              <Package className="w-4 h-4 mr-2" />
              Mina ordrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Orders */}
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('sv-SE')} • {order.company_name}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Betald
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
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
              
              <Separator className="my-4" />
              
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Leveransinformation</h4>
                  <div className="space-y-1 text-sm">
                    <p>{order.customer_info.firstName} {order.customer_info.lastName}</p>
                    <p>{order.customer_info.address}</p>
                    <p>{order.customer_info.postalCode} {order.customer_info.city}</p>
                    <p>{order.customer_info.country}</p>
                    <div className="flex gap-4 text-muted-foreground mt-2">
                      <span>{order.customer_info.email}</span>
                      <span>{order.customer_info.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Säljare</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.company_name}</p>
                    <p>{order.company_address}</p>
                    <div className="flex gap-4 text-muted-foreground mt-2">
                      <span>{order.company_email}</span>
                      <span>{order.company_phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactSeller(order)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Kontakta säljare
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Delsumma:</span>
                  <span>{order.subtotal} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Frakt:</span>
                  <span>{order.shipping_cost} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Moms:</span>
                  <span>Inkluderad</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Totalt:</span>
                  <span>{order.total} kr</span>
                </div>
              </div>
              
              {order.order_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-sm mb-1">Meddelande till säljare:</h4>
                  <p className="text-sm text-muted-foreground">{order.order_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vad händer nu?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Orderbekräftelse</h4>
                <p className="text-sm text-muted-foreground">
                  Du har fått en orderbekräftelse via e-post med alla detaljer.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Packning</h4>
                <p className="text-sm text-muted-foreground">
                  Säljaren packar dina vinylskivor noggrant och skickar dem inom 1-2 arbetsdagar.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Leverans</h4>
                <p className="text-sm text-muted-foreground">
                  Du får ett spårnummer när paketet skickas. Leverans tar 3-5 arbetsdagar.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <Button onClick={() => navigate("/vinylhyllan")}>
          <Home className="w-4 h-4 mr-2" />
          Fortsätt handla
        </Button>
        <Button onClick={() => navigate("/profil/" + user?.id)} variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Mina ordrar
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
