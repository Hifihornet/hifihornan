// Discogs API Integration for VinylHyllan

export interface DiscogsRelease {
  id: number;
  title: string;
  artist: string;
  year: number;
  label: string;
  catalog_number: string;
  genres: string[];
  styles: string[];
  tracklist: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
  images: Array<{
    type: string;
    uri: string;
    uri150: string;
    width: number;
    height: number;
  }>;
  community: {
    want: number;
    have: number;
  };
}

export interface DiscogsCollection {
  releases: Array<{
    id: number;
    basic_information: {
      title: string;
      artists: Array<{
        name: string;
        join: string;
      }>;
      year: number;
      labels: Array<{
        name: string;
        catno: string;
      }>;
      formats: Array<{
        name: string;
        qty: string;
        descriptions: string[];
      }>;
      genres: string[];
      styles: string[];
      thumb: string;
      cover_image: string;
    };
    date_added: string;
    rating: number;
  }>;
}

export class DiscogsAPI {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.discogs.com";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "User-Agent": "HiFiHörnet/1.0",
      "Authorization": `Discogs key=${this.apiKey}, secret=${this.apiSecret}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Discogs API request failed:", error);
      throw error;
    }
  }

  // Get user's Discogs collection
  async getUserCollection(username: string, page: number = 1, perPage: number = 100): Promise<DiscogsCollection> {
    const endpoint = `/users/${username}/collection/folders/0/releases?page=${page}&per_page=${perPage}`;
    return this.makeRequest(endpoint);
  }

  // Get detailed release information
  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    const endpoint = `/releases/${releaseId}`;
    return this.makeRequest(endpoint);
  }

  // Search for releases
  async search(query: string, type: string = "release", page: number = 1, perPage: number = 20) {
    const endpoint = `/database/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&per_page=${perPage}`;
    return this.makeRequest(endpoint);
  }

  // Get artist information
  async getArtist(artistId: number) {
    const endpoint = `/artists/${artistId}`;
    return this.makeRequest(endpoint);
  }

  // Get label information
  async getLabel(labelId: number) {
    const endpoint = `/labels/${labelId}`;
    return this.makeRequest(endpoint);
  }

  // Convert Discogs collection to our VinylRecord format
  static convertCollectionToVinylRecords(collection: DiscogsCollection, companyId: string) {
    return collection.releases.map((release) => ({
      id: `discogs-${release.id}`,
      discogs_id: release.id,
      company_id: companyId,
      artist: release.basic_information.artists.map(a => a.name).join(", "),
      title: release.basic_information.title,
      year: release.basic_information.year,
      label: release.basic_information.labels[0]?.name,
      catalog_number: release.basic_information.labels[0]?.catno,
      condition: "Not Specified", // Default condition
      price: null, // Price to be set by user
      in_stock: true, // Default to in stock
      image_url: release.basic_information.cover_image || release.basic_information.thumb,
      genre: release.basic_information.genres,
      style: release.basic_information.styles,
      format: release.basic_information.formats[0]?.name,
      quantity: parseInt(release.basic_information.formats[0]?.qty || "1"),
      tracklist: [], // Will be populated when fetching detailed release
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discogs_rating: release.rating,
      discogs_date_added: release.date_added,
    }));
  }

  // Batch import releases with detailed information
  async batchImportReleases(releases: Array<{ id: number; rating?: number }>) {
    const detailedReleases = [];
    
    for (const release of releases) {
      try {
        const detailedRelease = await this.getRelease(release.id);
        detailedReleases.push({
          ...detailedRelease,
          user_rating: release.rating,
        });
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch release ${release.id}:`, error);
      }
    }
    
    return detailedReleases;
  }

  // Validate Discogs credentials
  async validateCredentials(): Promise<boolean> {
    try {
      await this.makeRequest("/database/search?q=test");
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get marketplace statistics for a release
  async getMarketplaceStats(releaseId: number) {
    const endpoint = `/marketplace/stats/${releaseId}`;
    return this.makeRequest(endpoint);
  }

  // Get user's wantlist
  async getUserWantlist(username: string, page: number = 1, perPage: number = 100) {
    const endpoint = `/users/${username}/wants?page=${page}&per_page=${perPage}`;
    return this.makeRequest(endpoint);
  }
}

// Utility functions for Discogs integration

export const createDiscogsAPI = (apiKey: string, apiSecret: string) => {
  return new DiscogsAPI(apiKey, apiSecret);
};

export const validateDiscogsCredentials = async (apiKey: string, apiSecret: string) => {
  const api = createDiscogsAPI(apiKey, apiSecret);
  return await api.validateCredentials();
};

export const importUserCollection = async (
  username: string,
  apiKey: string,
  apiSecret: string,
  companyId: string
) => {
  const api = createDiscogsAPI(apiKey, apiSecret);
  
  try {
    // Get first page of collection
    const collection = await api.getUserCollection(username);
    
    // Convert to our format
    const vinylRecords = DiscogsAPI.convertCollectionToVinylRecords(collection, companyId);
    
    // Get detailed information for each release (optional, for better data)
    const detailedReleases = await api.batchImportReleases(
      collection.releases.map(r => ({ id: r.id, rating: r.rating }))
    );
    
    return {
      vinylRecords,
      detailedReleases,
      totalPages: collection.pagination?.pages || 1,
      totalItems: collection.pagination?.items || collection.releases.length,
    };
  } catch (error) {
    console.error("Failed to import Discogs collection:", error);
    throw error;
  }
};

// Discogs rate limiting: 60 requests per minute
export const DISOGS_RATE_LIMIT = 60;
export const DISOGS_RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

// Rate limiting helper
export const createRateLimiter = () => {
  let requests = 0;
  let windowStart = Date.now();
  
  return async () => {
    const now = Date.now();
    
    if (now - windowStart > DISOGS_RATE_LIMIT_WINDOW) {
      requests = 0;
      windowStart = now;
    }
    
    if (requests >= DISOGS_RATE_LIMIT) {
      const waitTime = DISOGS_RATE_LIMIT_WINDOW - (now - windowStart);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      requests = 0;
      windowStart = Date.now();
    }
    
    requests++;
  };
};
