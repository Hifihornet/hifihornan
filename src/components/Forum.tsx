import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, Search, Hash, Users, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    isStore?: boolean;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    isStore?: boolean;
  };
  likes: number;
  createdAt: string;
  isSolution?: boolean;
}

const FORUM_CATEGORIES = [
  { id: 'general', name: 'Allmänt', icon: '💬', color: 'bg-blue-500' },
  { id: 'amplifiers', name: 'Förstärkare', icon: '🔊', color: 'bg-green-500' },
  { id: 'speakers', name: 'Högtalare', icon: '🔈', color: 'bg-purple-500' },
  { id: 'turntables', name: 'Skivspelare', icon: '💿', color: 'bg-orange-500' },
  { id: 'vintage', name: 'Vintage', icon: '📻', color: 'bg-amber-500' },
  { id: 'diy', name: 'DIY & Bygge', icon: '🔧', color: 'bg-red-500' },
  { id: 'reviews', name: 'Recensioner', icon: '⭐', color: 'bg-indigo-500' },
  { id: 'market', name: 'Marknad & Priser', icon: '📊', color: 'bg-cyan-500' }
];

export function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', tags: [] as string[] });

  // Mock data för demo
  useEffect(() => {
    const mockPosts: ForumPost[] = [
      {
        id: '1',
        title: 'Behöver hjälp med Marantz 2270 justering',
        content: 'Hej alla! Jag har precis köpt en Marantz 2270 och undrar om någon kan hjälpa mig med bias-justeringen. Läser 0.1V höger och vänster, men soundstage känns lite skevt. Några tips?',
        author: {
          id: '1',
          name: 'HiFiEntusiast',
          avatar: '/avatars/user1.jpg',
          isVerified: true
        },
        category: 'amplifiers',
        tags: ['marantz', '2270', 'bias', 'justering'],
        likes: 12,
        replies: 8,
        views: 234,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPinned: true
      },
      {
        id: '2',
        title: 'Bästa budget-högtalarna under 5000kr?',
        content: 'Letar efter ett par högtalare till min hemmabiostudio. Budget är max 5000kr och jag lyssnar mest på jazz och klassiskt. Några rekommendationer?',
        author: {
          id: '2',
          name: 'AudioNerd',
          avatar: '/avatars/user2.jpg'
        },
        category: 'speakers',
        tags: ['budget', 'högtalare', 'rekommendation', 'jazz'],
        likes: 23,
        replies: 15,
        views: 567,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'DIY: Byggde min egen förstärkare - bilder!',
        content: 'Efter 6 månaders arbete är äntligen mitt DIY-projekt klart! En 2x30W förstärkare baserad på JLH1969. Scheman och bilder finns i kommentarerna.',
        author: {
          id: '3',
          name: 'DIY-Master',
          avatar: '/avatars/user3.jpg',
          isVerified: true,
          isStore: true
        },
        category: 'diy',
        tags: ['diy', 'förstärkare', 'jlh1969', 'bygge'],
        likes: 45,
        replies: 23,
        views: 892,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Simulera laddning
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return (b.likes + b.replies) - (a.likes + a.replies);
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleCreatePost = () => {
    if (!user) {
      toast.error('Du måste vara inloggad för att skapa inlägg');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Titel och innehåll får inte vara tomma');
      return;
    }

    // Här skulle du spara till databasen
    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: {
        id: user.id,
        name: user.email?.split('@')[0] || 'Anonym',
        isVerified: false
      },
      category: newPost.category,
      tags: newPost.tags,
      likes: 0,
      replies: 0,
      views: 0,
      createdAt: new Date().toISOString()
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'general', tags: [] });
    setShowNewPost(false);
    toast.success('Inlägg skapat!');
  };

  const handleLikePost = (postId: string) => {
    if (!user) {
      toast.error('Du måste vara inloggad för att gilla inlägg');
      return;
    }

    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-6">
          {/* New Post Button */}
          <Button 
            onClick={() => setShowNewPost(true)}
            className="w-full gap-2"
            size="lg"
          >
            <MessageCircle className="w-4 h-4" />
            Nytt inlägg
          </Button>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Kategorier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Alla kategorier
              </button>
              {FORUM_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Totalt inlägg</span>
                <span className="font-medium">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Aktiva användare</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span>Inlägg idag</span>
                <span className="font-medium">8</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Sök inlägg..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="latest">Senaste</option>
              <option value="popular">Populära</option>
              <option value="trending">Trendande</option>
            </select>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {sortedPosts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{post.author.name}</span>
                          {post.author.isVerified && (
                            <Badge variant="secondary" className="text-xs">Verifierad</Badge>
                          )}
                          {post.author.isStore && (
                            <Badge variant="outline" className="text-xs">Butik</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString('sv-SE')}
                        </div>
                      </div>
                    </div>
                    {post.isPinned && (
                      <Badge variant="default" className="text-xs">📌 Fastnålad</Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </h3>

                  {/* Content */}
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Reply className="w-4 h-4" />
                        {post.replies}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {post.views}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {FORUM_CATEGORIES.find(c => c.id === post.category)?.icon} {FORUM_CATEGORIES.find(c => c.id === post.category)?.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Skapa nytt inlägg</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titel</label>
                <Input
                  placeholder="Ge ditt inlägg en tydlig titel..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                >
                  {FORUM_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Innehåll</label>
                <Textarea
                  placeholder="Skriv ditt inlägg här..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Taggar (separera med kommatecken)</label>
                <Input
                  placeholder="t.ex. marantz, förstärkare, retro"
                  value={newPost.tags.join(', ')}
                  onChange={(e) => setNewPost({ 
                    ...newPost, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePost} className="flex-1">
                  Publicera inlägg
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Avbryt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
