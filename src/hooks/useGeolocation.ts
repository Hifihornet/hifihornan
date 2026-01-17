import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  formattedAddress?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation stöds inte av din browser');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Försök hämta adress från koordinater (reverse geocoding)
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=sv`
            );
            
            if (response.ok) {
              const data = await response.json();
              const locationData: Location = {
                latitude,
                longitude,
                city: data.city || data.locality,
                country: data.countryName,
                formattedAddress: `${data.city || data.locality}, ${data.countryName}`
              };
              setLocation(locationData);
              setLoading(false);
              resolve(locationData);
            } else {
              // Fallback till bara koordinater
              const locationData: Location = {
                latitude,
                longitude,
                formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              };
              setLocation(locationData);
              setLoading(false);
              resolve(locationData);
            }
          } catch (err) {
            // Fallback om API-anrop misslyckas
            const locationData: Location = {
              latitude,
              longitude,
              formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            };
            setLocation(locationData);
            setLoading(false);
            resolve(locationData);
          }
        },
        (error) => {
          setLoading(false);
          let errorMessage = 'Kunde inte hämta din position';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Du måste tillåta platsåtkomst för att använda denna funktion';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Platsinformation är inte tillgänglig';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout vid hämtning av plats';
              break;
          }
          
          setError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minuter cache
        }
      );
    });
  };

  const getCityFromLocation = (location: Location): string => {
    return location.city || location.formattedAddress || 'Okänd plats';
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getCityFromLocation
  };
}
