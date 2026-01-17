import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserStats {
  level: number;
  points: number;
  totalListings: number;
  totalSales: number;
  totalPurchases: number;
  averageRating: number;
  badges: Badge[];
  nextLevelPoints: number;
  progressToNextLevel: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  type: 'listing' | 'sale' | 'purchase' | 'rating' | 'streak' | 'special';
  requirement: number;
  unlocked: boolean;
}

export function useGamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Definiera alla möjliga badges och achievements
  const ALL_BADGES: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
    {
      id: 'first_listing',
      name: 'Första Steget',
      description: 'Skapade din första annons',
      icon: '🎯'
    },
    {
      id: 'seller_rookie',
      name: 'Säljar-Nybörjare',
      description: 'Sålt din första vara',
      icon: '💰'
    },
    {
      id: 'buyer_rookie',
      name: 'Köpar-Nybörjare',
      description: 'Köpt din första vara',
      icon: '🛒'
    },
    {
      id: 'power_seller',
      name: 'Power Seller',
      description: 'Sålt 10+ varor',
      icon: '⭐'
    },
    {
      id: 'trusted_buyer',
      name: 'Pålitlig Köpare',
      description: 'Köpt 5+ varor',
      icon: '🤝'
    },
    {
      id: 'five_star_seller',
      name: '5-Stjärnig Säljare',
      description: 'Fått 5 stjärnor i betyg',
      icon: '🌟'
    },
    {
      id: 'veteran',
      name: 'HiFi Veteran',
      description: 'Varit medlem i 1+ år',
      icon: '🏆'
    },
    {
      id: 'social_butterfly',
      name: 'Social Fjäril',
      description: 'Deltagit i forum 10+ gånger',
      icon: '🦋'
    }
  ];

  const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
    {
      id: 'first_sale',
      name: 'Första Försäljningen',
      description: 'Sålt din första vara',
      icon: '💰',
      points: 100,
      type: 'sale',
      requirement: 1
    },
    {
      id: 'five_sales',
      name: 'Fem Försäljningar',
      description: 'Sålt 5 varor',
      icon: '💵',
      points: 250,
      type: 'sale',
      requirement: 5
    },
    {
      id: 'ten_sales',
      name: 'Tio Försäljningar',
      description: 'Sålt 10 varor',
      icon: '💎',
      points: 500,
      type: 'sale',
      requirement: 10
    },
    {
      id: 'first_purchase',
      name: 'Första Köpet',
      description: 'Köpt din första vara',
      icon: '🛍️',
      points: 50,
      type: 'purchase',
      requirement: 1
    },
    {
      id: 'five_purchases',
      name: 'Fem Köp',
      description: 'Köpt 5 varor',
      icon: '🛒',
      points: 150,
      type: 'purchase',
      requirement: 5
    },
    {
      id: 'ten_purchases',
      name: 'Tio Köp',
      description: 'Köpt 10 varor',
      icon: '🛍️',
      points: 300,
      type: 'purchase',
      requirement: 10
    },
    {
      id: 'perfect_rating',
      name: 'Perfekt Rating',
      description: 'Fått 5.0 i betyg',
      icon: '⭐',
      points: 200,
      type: 'rating',
      requirement: 5
    },
    {
      id: 'listing_master',
      name: 'Annons-Mästare',
      description: 'Skapat 20+ annonser',
      icon: '📝',
      points: 300,
      type: 'listing',
      requirement: 20
    }
  ];

  // Beräkna level baserat på poäng
  const calculateLevel = (points: number): { level: number; nextLevelPoints: number; progress: number } => {
    const level = Math.floor(points / 500) + 1;
    const nextLevelPoints = level * 500;
    const currentLevelPoints = (level - 1) * 500;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    
    return { level, nextLevelPoints, progress };
  };

  // Hämta användarens stats
  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Hämta användarens annonser
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, user_id, created_at, status')
        .eq('user_id', user.id);

      if (listingsError) throw listingsError;

      const totalListings = listings?.length || 0;
      
      // Förenkladad data - ge alltid några achievements
      const mockSales = 3;
      const mockPurchases = 2;
      const averageRating = 4.5;

      // Beräkna poäng
      const totalPoints = totalListings * 10 + mockSales * 25 + mockPurchases * 15 + Math.floor(averageRating) * 50;

      // Beräkna level
      const { level, nextLevelPoints, progress } = calculateLevel(totalPoints);

      // Förenklade badges - progressiva
      const unlockedBadges: Badge[] = ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: checkBadgeUnlocked(badge.id, {
          totalListings,
          totalSales: mockSales,
          totalPurchases: mockPurchases,
          averageRating,
          memberSince: user.created_at ? new Date(user.created_at) : new Date()
        })
      }));

      // Progressiva achievements - baserat på faktiska villkor
      const unlockedAchievements: Achievement[] = ALL_ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: checkAchievementUnlocked(achievement, {
          totalListings,
          totalSales: mockSales,
          totalPurchases: mockPurchases,
          averageRating
        })
      }));

      setStats({
        level,
        points: totalPoints,
        totalListings,
        totalSales: mockSales,
        totalPurchases: mockPurchases,
        averageRating,
        badges: unlockedBadges,
        nextLevelPoints,
        progressToNextLevel: progress
      });

      setAchievements(unlockedAchievements);

    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Kunde inte hämta dina statistik');
    } finally {
      setLoading(false);
    }
  };

  // Kontrollera om en badge är upplåst
  const checkBadgeUnlocked = (badgeId: string, stats: any): boolean => {
    switch (badgeId) {
      case 'first_listing':
        return stats.totalListings >= 1;
      case 'seller_rookie':
        return stats.totalSales >= 1;
      case 'buyer_rookie':
        return stats.totalPurchases >= 1;
      case 'power_seller':
        return stats.totalSales >= 10;
      case 'trusted_buyer':
        return stats.totalPurchases >= 5;
      case 'five_star_seller':
        return stats.averageRating >= 4.5;
      case 'veteran':
        return stats.memberSince && (Date.now() - stats.memberSince.getTime()) > (365 * 24 * 60 * 60 * 1000);
      case 'social_butterfly':
        return false; // Implementera när forum finns
      default:
        return false;
    }
  };

  // Kontrollera om ett achievement är upplåst
  const checkAchievementUnlocked = (achievement: Omit<Achievement, 'unlocked'>, stats: any): boolean => {
    switch (achievement.type) {
      case 'listing':
        return stats.totalListings >= achievement.requirement;
      case 'sale':
        return stats.totalSales >= achievement.requirement;
      case 'purchase':
        return stats.totalPurchases >= achievement.requirement;
      case 'rating':
        return stats.averageRating >= achievement.requirement;
      default:
        return false;
    }
  };

  // Lägg till poäng
  const addPoints = async (points: number, reason: string) => {
    if (!user) return;

    try {
      // Här skulle du spara till en points_history tabell
      console.log(`Added ${points} points for: ${reason}`);
      
      // Uppdatera stats
      await fetchUserStats();
    } catch (err) {
      console.error('Error adding points:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  return {
    stats,
    achievements,
    loading,
    error,
    addPoints,
    refreshStats: fetchUserStats
  };
}
