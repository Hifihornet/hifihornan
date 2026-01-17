import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User, Heart, Settings, LogOut, Plus, MessageCircle, Bell, Shield, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CreatorBadge from "@/components/CreatorBadge";
import ProfileSearchDialog from "@/components/ProfileSearchDialog";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Temporarily disable user roles until we have the hook
  const isCreator = false;
  const isAdmin = false;
  const isModerator = false;
  
  const unreadCount = 0; // Temporarily disabled

  const hasAdminAccess = isCreator || isAdmin || isModerator;

  const navLinks = [
    { href: "/", label: "Hem" },
    { href: "/browse", label: "Annonser" },
    { href: "/forum", label: "Forum" },
    { href: "/blogg", label: "Nyheter" },
    { href: "/showcase", label: "Showcase" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="HiFiHörnet" 
              className="h-14 w-auto transition-transform duration-300 ease-in-out group-hover:scale-110" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cnUtil(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/create">
                  <Button variant="glow" size="default">
                    <Plus className="w-4 h-4" />
                    Lägg upp annons gratis
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <User className="w-4 h-4" />
                      {isCreator && <CreatorBadge />}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-muted-foreground text-sm">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/profil/${user.id}`} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Min profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/meddelanden" className="cursor-pointer flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Meddelanden
                        {unreadCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favoriter" className="cursor-pointer">
                        <Heart className="w-4 h-4 mr-2" />
                        Favoriter
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bevakningar" className="cursor-pointer">
                        <Bell className="w-4 h-4 mr-2" />
                        Bevakningar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ProfileSearchDialog
                        trigger={
                          <button className="w-full flex items-center cursor-pointer px-2 py-1.5 text-sm">
                            <Search className="w-4 h-4 mr-2" />
                            Sök profiler
                          </button>
                        }
                      />
                    </DropdownMenuItem>
                    {hasAdminAccess && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logga ut
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">Logga in</Button>
                </Link>
                <Link to="/create">
                  <Button variant="glow" size="default">
                    <Plus className="w-4 h-4" />
                    Lägg upp annons gratis
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cnUtil(
                    "px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b border-border/50",
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to="/create" 
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 border-b border-border/50"
                  >
                    <Button variant="glow" className="w-full">
                      <Plus className="w-4 h-4" />
                      Lägg upp annons gratis
                    </Button>
                  </Link>
                  
                  <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-primary transition-colors border-b border-border/50">
                        <span className="flex items-center gap-2">
                          <span className="relative">
                            <User className="w-4 h-4" />
                            {isCreator && <CreatorBadge className="-top-1.5 -right-1.5" />}
                          </span>
                          Min profil
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={cnUtil(
                          "w-4 h-4 transition-transform duration-200",
                          isProfileOpen && "rotate-180"
                        )} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-muted/30">
                      <Link 
                        to={`/profil/${user.id}`} 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                      >
                        Visa profil
                      </Link>
                      <Link 
                        to="/meddelanden" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                      >
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Meddelanden
                        </span>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link 
                        to="/favoriter" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                      >
                        <Heart className="w-4 h-4" />
                        Favoriter
                      </Link>
                      <Link 
                        to="/bevakningar" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                      >
                        <Bell className="w-4 h-4" />
                        Bevakningar
                      </Link>
                      <ProfileSearchDialog
                        trigger={
                          <button className="w-full flex items-center gap-2 px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30">
                            <Search className="w-4 h-4" />
                            Sök profiler
                          </button>
                        }
                      />
                      {hasAdminAccess && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-8 py-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logga ut
                      </button>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <div className="px-4 py-3 space-y-2">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Logga in
                    </Button>
                  </Link>
                  <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="glow" className="w-full">
                      <Plus className="w-4 h-4" />
                      Lägg upp annons gratis
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

function cnUtil(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Header;
