import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Hifihörnan
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Marknadsplatsen för vintage HiFi-entusiaster. Köp och sälj klassisk 
              ljudutrustning direkt mellan privatpersoner.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hem
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Annonser
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sälj
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Kategorier</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse?category=amplifiers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Förstärkare
                </Link>
              </li>
              <li>
                <Link to="/browse?category=speakers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Högtalare
                </Link>
              </li>
              <li>
                <Link to="/browse?category=turntables" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Skivspelare
                </Link>
              </li>
              <li>
                <Link to="/browse?category=receivers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Receivers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hifihörnan. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
