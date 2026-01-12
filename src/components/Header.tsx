import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus, User, LogOut, MessageCircle, Shield, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import useUserRoles from "@/hooks/useUserRoles";
import useUnreadMessages from "@/hooks/useUnreadMessages";
import CreatorBadge from "@/components/CreatorBadge";
import ProfileSearchDialog from "@/components/ProfileSearchDialog";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isCreator, isAdmin, isModerator } = useUserRoles(user?.id);
  const unreadCount = useUnreadMessages();

  const hasAdminAccess = isCreator || isAdmin || isModerator;

  const navLinks = [
    { href: "/", label: "Hem" },
    { href: "/browse", label: "Annonser" },
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
            <img src={logo} alt="Hifihörnet" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
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
                    Lägg upp annons
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
                    Lägg upp annons
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
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 pt-2 space-y-2">
                {user ? (
                  <>
                    <Link to={`/profil/${user.id}`} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <span className="relative">
                          <User className="w-4 h-4" />
                          {isCreator && <CreatorBadge className="-top-1.5 -right-1.5" />}
                        </span>
                        Min profil
                      </Button>
                    </Link>
                    <Link to="/meddelanden" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Meddelanden
                        </span>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <ProfileSearchDialog
                      trigger={
                        <Button variant="outline" className="w-full justify-start">
                          <Search className="w-4 h-4" />
                          Sök profiler
                        </Button>
                      }
                    />
                    <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="glow" className="w-full">
                        <Plus className="w-4 h-4" />
                        Lägg upp annons
                      </Button>
                    </Link>
                    {hasAdminAccess && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logga ut
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Logga in
                      </Button>
                    </Link>
                    <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="glow" className="w-full">
                        <Plus className="w-4 h-4" />
                        Lägg upp annons
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Header;
