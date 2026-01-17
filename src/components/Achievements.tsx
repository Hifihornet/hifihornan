import { useState } from 'react';
import { Trophy, Target, Star, Award, TrendingUp, Lock, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';

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

export function Achievements() {
  const { stats, achievements, loading } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.type === selectedCategory
  );

  const categories = [
    { id: 'all', name: 'Alla', icon: '🏆' },
    { id: 'listing', name: 'Annonser', icon: '📝' },
    { id: 'sale', name: 'Försäljning', icon: '💰' },
    { id: 'purchase', name: 'Köp', icon: '🛒' },
    { id: 'rating', name: 'Betyg', icon: '⭐' },
    { id: 'special', name: 'Special', icon: '🎯' }
  ];

  const getAchievementIcon = (achievement: Achievement) => {
    const iconMap: Record<string, React.ReactNode> = {
      '🏆': <Trophy className="w-6 h-6" />,
      '💰': <Trophy className="w-6 h-6" />,
      '💵': <Trophy className="w-6 h-6" />,
      '💎': <Trophy className="w-6 h-6" />,
      '🛍️': <Trophy className="w-6 h-6" />,
      '🛒': <Trophy className="w-6 h-6" />,
      '⭐': <Star className="w-6 h-6" />,
      '📝': <Target className="w-6 h-6" />,
      '🎯': <Award className="w-6 h-6" />,
      '📈': <TrendingUp className="w-6 h-6" />
    };
    
    return iconMap[achievement.icon] || <Trophy className="w-6 h-6" />;
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.unlocked) return 100;
    
    // Beräkna progress baserat på user stats
    switch (achievement.type) {
      case 'listing':
        return Math.min(100, (stats?.totalListings || 0) / achievement.requirement * 100);
      case 'sale':
        return Math.min(100, (stats?.totalSales || 0) / achievement.requirement * 100);
      case 'purchase':
        return Math.min(100, (stats?.totalPurchases || 0) / achievement.requirement * 100);
      case 'rating':
        return Math.min(100, (stats?.averageRating || 0) / achievement.requirement * 100);
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Lås upp achievements och samla poäng genom att vara aktiv på HiFiHornan!
        </p>
        
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.points}</div>
                <div className="text-sm text-muted-foreground">Poäng</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.badges.filter(b => b.unlocked).length}</div>
                <div className="text-sm text-muted-foreground">Badges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' 
                : 'bg-muted/30 border-border opacity-75'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${
                  achievement.unlocked 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {getAchievementIcon(achievement)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                    {achievement.points} poäng
                  </Badge>
                  {achievement.unlocked && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{achievement.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {achievement.description}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage(achievement))}%</span>
                </div>
                <Progress 
                  value={getProgressPercentage(achievement)} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  Krav: {achievement.requirement} {achievement.type === 'listing' ? 'annonser' : 
                        achievement.type === 'sale' ? 'försäljningar' :
                        achievement.type === 'purchase' ? 'köp' :
                        achievement.type === 'rating' ? 'stjärnor i betyg' : 'poäng'}
                </div>
              </div>
              
              {/* Locked Overlay */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Låst</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Inga achievements än</h3>
          <p className="text-muted-foreground">
            Börja skapa annonser och interagera med communityt för att låsa upp achievements!
          </p>
        </div>
      )}
    </div>
  );
}
