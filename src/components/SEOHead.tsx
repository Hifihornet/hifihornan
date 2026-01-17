import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
}

const SITE_URL = 'https://hifihornan.se';
const DEFAULT_TITLE = 'HiFiHornan - Köp och sälj HiFi-utrustning';
const DEFAULT_DESCRIPTION = 'Sveriges största marknadsplats för HiFi-utrustning. Köp och sälj förstärkare, högtalare, skivspelare och annan ljudutrustning från toppmärken.';
const DEFAULT_IMAGE = '/og-image.jpg';

export function SEOHead({ 
  title, 
  description, 
  keywords, 
  image = DEFAULT_IMAGE,
  article = false 
}: SEOHeadProps) {
  const location = useLocation();
  const url = `${SITE_URL}${location.pathname}`;
  
  const pageTitle = title ? `${title} | HiFiHornan` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageKeywords = keywords || 'HiFi, ljud, förstärkare, högtalare, skivspelare, receivers, kassettdäck, CD-spelare, stereo, audio, sälja, köpa, begagnat';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="HiFiHornan" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={`${SITE_URL}${image}`} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="HiFiHornan" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language */}
      <html lang="sv" />
      <meta name="language" content="Swedish" />
      <meta name="geo.region" content="SE" />
      <meta name="geo.placename" content="Sweden" />

      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "HiFiHornan",
          "url": SITE_URL,
          "logo": `${SITE_URL}/logo.png`,
          "description": "Sveriges största marknadsplats för HiFi-utrustning",
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service"
          }
        })}
      </script>
    </Helmet>
  );
}
