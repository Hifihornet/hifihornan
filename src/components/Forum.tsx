import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, Search, Hash, Users, Clock, TrendingUp, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

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
  { id: 'diy', name: 'DIY', icon: '🔧', color: 'bg-red-500' },
  { id: 'buying', name: 'Köpråd', icon: '💰', color: 'bg-yellow-500' },
  { id: 'selling', name: 'Säljtips', icon: '📦', color: 'bg-indigo-500' },
  { id: 'vintage', name: 'Vintage', icon: '📻', color: 'bg-pink-500' }
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

  // Check if user is admin - kolla flera möjliga roller
  const isAdmin = user?.user_metadata?.role === 'admin' || 
                  user?.user_metadata?.role === 'moderator' ||
                  user?.app_metadata?.role === 'admin' ||
                  user?.app_metadata?.role === 'moderator' ||
                  user?.email === 'alex.ljungbergs@icloud.com'; // Fallback för din email

  // Debug: Logga admin-status
  console.log('User:', user);
  console.log('Is Admin:', isAdmin);
  console.log('User metadata:', user?.user_metadata);
  console.log('App metadata:', user?.app_metadata);

  const handleDeletePost = (postId: string) => {
    if (!isAdmin) {
      toast.error('Du måste vara admin för att ta bort inlägg');
      return;
    }

    if (window.confirm('Är du säker på att du vill ta bort detta inlägg?')) {
      // Ta bort från state
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      
      // Uppdatera localStorage
      localStorage.setItem('forum_posts', JSON.stringify(updatedPosts));
      
      toast.success('Inlägget har tagits bort');
    }
  };

  // Mock data för demo - nu med localStorage för att spara inlägg
  useEffect(() => {
    // Hämta sparade inlägg från localStorage
    const savedPosts = localStorage.getItem('forum_posts');
    let mockPosts: ForumPost[] = [];
    
    if (savedPosts) {
      try {
        mockPosts = JSON.parse(savedPosts);
      } catch (error) {
        console.error('Error parsing saved posts:', error);
        mockPosts = [];
      }
    }

    // Simulera laddning
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  // Spara inlägg till localStorage när de ändras
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('forum_posts', JSON.stringify(posts));
    }
  }, [posts]);

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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 pt-20 lg:pt-24 pb-12">
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Forum - HiFiHörnet"
        description="Diskutera HiFi, audio och utrustning med andra entusiaster. Få hjälp, dela erfarenheter och bygg nätverk."
        keywords="HiFi forum, audio forum, diskussion, hjälp, entusiaster, marantz, technics, mcintosh"
        image="/og-forum.jpg"
      />
      <Header />
      
      <main className="flex-1 pt-20 lg:pt-24 pb-12">
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
                    <span className="mr-2">📋</span>
                    Alla kategorier
                  </button>
                  {FORUM_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
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
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Inlägg</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Användare</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Aktiva idag</span>
                    <span className="font-semibold">-</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-6">
                <h1 className="font-display text-3xl font-bold mb-4">HiFi Forum</h1>
                <p className="text-muted-foreground mb-6">
                  Diskutera HiFi, audio och utrustning med andra entusiaster
                </p>

                {/* Search and Sort */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
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
                    <option value="popular">Populärast</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>

              {/* Posts */}
              {sortedPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-display text-xl font-semibold mb-2">Inga inlägg än</h3>
                    <p className="text-muted-foreground mb-6">
                      Bli den första att skapa ett inlägg och starta diskussionen!
                    </p>
                    <Button onClick={() => setShowNewPost(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Skapa första inlägget
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map(post => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              {post.isPinned && (
                                <Badge variant="secondary">📌 Fastnålad</Badge>
                              )}
                              {post.isLocked && (
                                <Badge variant="secondary">🔒 Låst</Badge>
                              )}
                              {isAdmin && (
                                <Badge variant="destructive" className="gap-1">
                                  <Shield className="w-3 h-3" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {post.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{post.author.name}</span>
                              <span>•</span>
                              <span>{new Date(post.createdAt).toLocaleDateString('sv-SE')}</span>
                              <span>•</span>
                              <span>{post.category}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikePost(post.id)}
                                className="gap-1"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Reply className="w-4 h-4" />
                                {post.replies}
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Users className="w-4 h-4" />
                                {post.views}
                              </Button>
                              
                              {isAdmin && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="gap-1 ml-auto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Ta bort
                                </Button>
                              )}
                            </div>
                            
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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

      <Footer />
    </div>
  );
}
