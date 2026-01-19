import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hämta vinylannonser för vinylhyllan
    const fetchListings = async () => {
      try {
        // Simulera data för nu
        const mockListings = [
          { id: 1, title: "Pink Floyd - The Dark Side of the Moon", price: 299, condition: "Mint", location: "Stockholm", rating: 4.8 },
          { id: 2, title: "The Beatles - Abbey Road", price: 450, condition: "Very Good", location: "Göteborg", rating: 4.9 },
          { id: 3, title: "Led Zeppelin - IV", price: 380, condition: "Good", location: "Malmö", rating: 4.7 },
          { id: 4, title: "The Rolling Stones - Exile on Main St", price: 320, condition: "Very Good", location: "Uppsala", rating: 4.6 },
          { id: 5, title: "Bob Dylan - Blood on the Tracks", price: 280, condition: "Mint", location: "Västerås", rating: 4.8 },
          { id: 6, title: "David Bowie - Ziggy Stardust", price: 350, condition: "Good", location: "Örebro", rating: 4.9 }
        ];
        setListings(mockListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '80px 0',
      textAlign: 'center' as const,
      borderRadius: '0 0 20px 20px'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    heroSubtitle: {
      fontSize: '1.5rem',
      marginBottom: '40px',
      opacity: 0.9
    },
    button: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '15px 30px',
      fontSize: '1.1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      margin: '0 10px',
      fontWeight: 'bold'
    },
    buttonOutline: {
      background: 'transparent',
      color: 'white',
      border: '2px solid white',
      padding: '15px 30px',
      fontSize: '1.1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      margin: '0 10px',
      fontWeight: 'bold'
    },
    section: {
      padding: '80px 0'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '20px',
      color: '#333'
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      textAlign: 'center' as const,
      marginBottom: '60px',
      color: '#666',
      maxWidth: '800px',
      margin: '0 auto 60px auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '60px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease'
    },
    cardImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      background: '#f0f0f0'
    },
    cardContent: {
      padding: '20px'
    },
    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333'
    },
    cardPrice: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#667eea',
      marginBottom: '10px'
    },
    cardMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '20px'
    },
    businessSection: {
      background: '#f8f9fa',
      padding: '60px 0',
      borderRadius: '20px',
      margin: '60px 0'
    },
    businessCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    },
    businessContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '40px'
    },
    businessText: {
      flex: '1',
      minWidth: '300px'
    },
    businessButtons: {
      flex: '0 0 auto'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '40px',
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#667eea',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '1.1rem',
      color: '#666'
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>HiFiHörnet</h1>
          <p style={styles.heroSubtitle}>Sveriges största marknadsplats för HiFi och vinyl</p>
          <div>
            <button style={styles.button}>Sök annonser</button>
            <button style={styles.buttonOutline}>Utforska kategorier</button>
          </div>
        </div>
      </section>

      {/* Vinylhyllan - Stort och prominent */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>🎵 Vinylhyllan</h2>
          <p style={styles.sectionSubtitle}>
            Upptäck våra senaste vinyl-tillskott från säljare över hela Sverige. Från klassiska rock till obskyra jazz-favoriter.
          </p>

          {loading ? (
            <div style={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{...styles.card, opacity: 0.5}}>
                  <div style={{...styles.cardImage, background: '#e0e0e0'}}></div>
                  <div style={styles.cardContent}>
                    <div style={{height: '20px', background: '#e0e0e0', marginBottom: '10px', borderRadius: '4px'}}></div>
                    <div style={{height: '20px', background: '#e0e0e0', width: '60%', borderRadius: '4px'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.grid}>
              {listings.map((listing) => (
                <div key={listing.id} style={styles.card}>
                  <div style={styles.cardImage}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666'}}>
                      📀 {listing.title}
                    </div>
                  </div>
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{listing.title}</h3>
                    <div style={styles.cardPrice}>{listing.price} kr</div>
                    <div style={styles.cardMeta}>
                      <span>{listing.location}</span>
                      <span>⭐ {listing.rating}</span>
                    </div>
                    <button style={{...styles.button, width: '100%', margin: 0}}>
                      Visa annons
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{textAlign: 'center'}}>
            <button style={styles.button}>
              Se alla vinyl-annonser →
            </button>
          </div>
        </div>
      </section>

      {/* Företagskonto - Mindre men synlig */}
      <section style={styles.businessSection}>
        <div style={styles.container}>
          <div style={styles.businessCard}>
            <div style={styles.businessContent}>
              <div style={styles.businessText}>
                <h2 style={{fontSize: '2rem', marginBottom: '20px', color: '#333'}}>
                  🏢 Företagskonto?
                </h2>
                <p style={{color: '#666', marginBottom: '20px'}}>
                  Erbjud dina HiFi-produkter till en bredare publik. Få tillgång till verktyg för att hantera annonser, kunder och försäljning.
                </p>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap' as const}}>
                  <span style={{background: '#e3f2fd', color: '#1976d2', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem'}}>
                    👥 Nå 10,000+ köpare
                  </span>
                  <span style={{background: '#e3f2fd', color: '#1976d2', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem'}}>
                    📈 Öka din försäljning
                  </span>
                </div>
              </div>
              <div style={styles.businessButtons}>
                <Link to="/business-registration">
                  <button style={{...styles.button, background: '#1976d2', color: 'white', marginBottom: '10px'}}>
                    🏢 Ansök om företagskonto
                  </button>
                </Link>
                <p style={{fontSize: '0.9rem', color: '#666', textAlign: 'center'}}>
                  Gratis att ansöka • Inga bindningstider
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.stats}>
            <div>
              <div style={styles.statNumber}>10,000+</div>
              <div style={styles.statLabel}>Aktiva användare</div>
            </div>
            <div>
              <div style={styles.statNumber}>5,000+</div>
              <div style={styles.statLabel}>Vinyl-annonser</div>
            </div>
            <div>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Företagssäljare</div>
            </div>
            <div>
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Nöjda kunder</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
