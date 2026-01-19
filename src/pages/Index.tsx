import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vinyl, Building2, Music, Search, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';

const Index = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hämta vinylannonser för vinylhyllan
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings?category=vinyl&limit=6');
        const data = await response.json();
        setListings(data.listings || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              HiFiHörnet
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-200">
              Sveriges största marknadsplats för HiFi och vinyl
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Sök annonser
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-900">
                <Music className="mr-2 h-5 w-5" />
                Utforska kategorier
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vinylhyllan - Stort och prominent */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Vinyl className="h-12 w-12 text-purple-600 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Vinylhyllan
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upptäck våra senaste vinyl-tillskott från säljare över hela Sverige. Från klassiska rock till obskyra jazz-favoriter.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={listing.image || '/api/placeholder/300/200'}
                      alt={listing.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      {listing.condition}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      {listing.price} kr
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{listing.location}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{listing.rating || 'Ny'}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      Visa annons
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Vinyl className="mr-2 h-5 w-5" />
              Se alla vinyl-annonser
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Företagskonto - Mindre men synlig */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <div className="flex items-center mb-4">
                    <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Företagskonto?
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Erbjud dina HiFi-produkter till en bredare publik. Få tillgång till verktyg för att hantera annonser, kunder och försäljning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      <Users className="h-3 w-3 mr-1" />
                      Nå 10,000+ köpare
                    </Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Öka din försäljning
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/business-registration">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
                      <Building2 className="mr-2 h-5 w-5" />
                      Ansök om företagskonto
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500 text-center">
                    Gratis att ansöka • Inga bindningstider
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Aktiva användare</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5,000+</div>
              <div className="text-gray-600">Vinyl-annonser</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Företagssäljare</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Nöjda kunder</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Redo att börja sälja eller köpa?
          </h2>
          <p className="text-xl mb-8 text-purple-200">
            Gå med i Sveriges största HiFi-community idag
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
              Börja sälja
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-900">
              Utforska annonser
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
