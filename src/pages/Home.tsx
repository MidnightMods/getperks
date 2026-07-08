import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Zap,
  Users,
  Star,
  ShoppingCart,
  X,
  Check,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Lock,
  Clock,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ──────────── Animated particles canvas ──────────── */
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      context!.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        context!.beginPath();
        context!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context!.fillStyle = `rgba(255, 0, 128, ${p.alpha})`;
        context!.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            context!.beginPath();
            context!.moveTo(particles[i].x, particles[i].y);
            context!.lineTo(particles[j].x, particles[j].y);
            context!.strokeStyle = `rgba(120, 0, 200, ${0.05 * (1 - dist / 150)})`;
            context!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ──────────── Product data ──────────── */
const PRODUCTS = [
  {
    id: 1,
    name: "Discord Nitro Basic",
    description: "1 Month Gift Link",
    price: 2.5,
    comparePrice: 4.99,
    category: "discord",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center animate-pulse-glow">
        <MessageCircle className="w-8 h-8 text-white" />
      </div>
    ),
    features: ["Custom emoji anywhere", "Nitro badge", "Personalized profile"],
  },
  {
    id: 2,
    name: "Discord Nitro Classic",
    description: "1 Month Gift Link",
    price: 6.0,
    comparePrice: 9.99,
    category: "discord",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF73FA] to-[#5865F2] flex items-center justify-center animate-pulse-glow">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
    ),
    features: ["Custom emoji", "Nitro badge", "Animated avatar", "Server boosts"],
  },
  {
    id: 3,
    name: "Discord Server Boost",
    description: "14x Boosts",
    price: 7.0,
    comparePrice: 13.99,
    category: "discord",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F47FFF] to-[#B845C5] flex items-center justify-center animate-pulse-glow">
        <Zap className="w-8 h-8 text-white" />
      </div>
    ),
    features: ["Level up server", "Unlock perks", "Custom URL"],
  },
  {
    id: 4,
    name: "Discord + Nitro Basic",
    description: "Account with 1 Month Nitro",
    price: 2.0,
    comparePrice: 4.99,
    category: "discord",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#57F287] to-[#3BA55D] flex items-center justify-center animate-pulse-glow">
        <Users className="w-8 h-8 text-white" />
      </div>
    ),
    features: ["Ready to use", "Nitro included", "Email verified"],
  },
  {
    id: 5,
    name: "Spotify Premium",
    description: "2 Months Account",
    price: 3.0,
    comparePrice: 9.98,
    category: "spotify",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#1AA34A] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>
    ),
    features: ["Ad-free music", "Offline listening", "High quality audio"],
  },
  {
    id: 6,
    name: "Spotify Premium",
    description: "3 Months Account",
    price: 5.0,
    comparePrice: 14.97,
    category: "spotify",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1ED760] to-[#169C46] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>
    ),
    features: ["Ad-free music", "Offline listening", "High quality"],
  },
  {
    id: 7,
    name: "Spotify Premium",
    description: "1 Year Account",
    price: 10.0,
    comparePrice: 59.88,
    category: "spotify",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1DB954] via-[#1ED760] to-[#1AA34A] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>
    ),
    features: ["Ad-free music", "Offline listening", "Best value"],
  },
  {
    id: 8,
    name: "YouTube Premium",
    description: "1 Month - Your Email",
    price: 1.0,
    comparePrice: 11.99,
    category: "youtube",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#CC0000] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
    ),
    features: ["Ad-free videos", "Background play", "Download videos"],
  },
  {
    id: 9,
    name: "YouTube Premium Family",
    description: "1 Month Plan",
    price: 2.0,
    comparePrice: 17.99,
    category: "youtube",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF0000] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
    ),
    features: ["Up to 5 members", "Ad-free", "Background play"],
  },
  {
    id: 10,
    name: "Netflix 4K UHD",
    description: "Lifetime Keys - 1 Year",
    price: 8.0,
    comparePrice: 19.99,
    category: "netflix",
    icon: (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E50914] to-[#B20710] flex items-center justify-center animate-pulse-glow">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
        </svg>
      </div>
    ),
    features: ["4K Ultra HD", "Multiple profiles", "All devices"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "discord", label: "Discord" },
  { id: "spotify", label: "Spotify" },
  { id: "youtube", label: "YouTube" },
  { id: "netflix", label: "Netflix" },
];

/* ──────────── Main Home Page ──────────── */
export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<typeof PRODUCTS>([]);
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = (product: (typeof PRODUCTS)[0]) => {
    setCart((prev) => [...prev, product]);
    setShowCart(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0010] text-white relative overflow-x-hidden">
      <ParticlesCanvas />

      {/* ─── Navigation ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold heading-italic gradient-text">
              Perks
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm text-white/70 hover:text-white transition-colors">
              Products
            </a>
            <a href="#why-us" className="text-sm text-white/70 hover:text-white transition-colors">
              Why Us
            </a>
            <a href="https://discord.gg/ND726FmARQ" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
              Discord
            </a>
            <Link to="/verify" className="text-sm text-white/70 hover:text-white transition-colors">
              Verify
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                Dashboard
              </Button>
            </Link>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-xs flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-hero" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-pink-500/20 mb-8 animate-fade-in-up">
            <Shield className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-pink-200">Premium Digital Products</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="heading-italic text-white">Get </span>
            <span className="heading-italic gradient-text">Perks</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 mb-4 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your exclusive gateway to premium subscriptions at unbeatable prices.
          </p>
          <p className="text-sm text-white/40 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Discord Nitro · Spotify Premium · YouTube Premium · Netflix 4K
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <a href="#products" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Browse Products
            </a>
            <Link
              to="/verify"
              className="btn-glass text-lg px-8 py-4 flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Verify Access
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">10K+</div>
              <div className="text-xs text-white/40 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">50K+</div>
              <div className="text-xs text-white/40 mt-1">Orders Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">99%</div>
              <div className="text-xs text-white/40 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Products Section ─── */}
      <section id="products" className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black heading-italic mb-4">
              <span className="gradient-text">Premium</span>{" "}
              <span className="text-white">Products</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Hand-picked premium subscriptions at prices that make sense. Quality guaranteed.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="product-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  {product.icon}
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                    In Stock
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-white/50 mb-4">{product.description}</p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold gradient-text">
                    ${product.price.toFixed(1)}
                  </span>
                  <span className="text-sm text-white/30 line-through">
                    ${product.comparePrice}
                  </span>
                </div>

                <ul className="space-y-1 mb-6">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <Check className="w-3 h-3 text-pink-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us Section ─── */}
      <section id="why-us" className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black heading-italic mb-4">
              <span className="text-white">Why </span>
              <span className="gradient-text">Choose Us</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              We are not just another digital store. We are a community-driven premium service built on trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-8 h-8 text-pink-400" />,
                title: "Secure & Trusted",
                desc: "End-to-end encryption for all transactions. Your data never leaves our secure servers.",
              },
              {
                icon: <Zap className="w-8 h-8 text-purple-400" />,
                title: "Instant Delivery",
                desc: "Automated delivery system ensures you receive your product within minutes of purchase.",
              },
              {
                icon: <Headphones className="w-8 h-8 text-pink-400" />,
                title: "24/7 Support",
                desc: "Our dedicated support team is always available on Discord to help you with any issues.",
              },
              {
                icon: <Lock className="w-8 h-8 text-purple-400" />,
                title: "Privacy First",
                desc: "We never store sensitive payment info. All transactions are processed securely.",
              },
              {
                icon: <Star className="w-8 h-8 text-pink-400" />,
                title: "Premium Quality",
                desc: "Every product is tested and verified before delivery. Quality is our promise.",
              },
              {
                icon: <Clock className="w-8 h-8 text-purple-400" />,
                title: "Long Validity",
                desc: "Our subscriptions come with guaranteed validity periods. No premature expiry.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-8 rounded-2xl card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Discord CTA Section ─── */}
      <section className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/10 to-pink-500/10" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center mx-auto mb-8 animate-float">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black heading-italic mb-4">
                <span className="text-white">Join Our </span>
                <span className="text-[#5865F2]">Discord</span>
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Become part of our thriving community. Get instant support, exclusive deals, and connect with fellow members.
              </p>
              <a
                href="https://discord.gg/ND726FmARQ"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Join Discord Server
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative py-16 border-t border-white/5" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold heading-italic gradient-text">Perks</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/verify" className="hover:text-white transition-colors">Verify</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <a href="https://discord.gg/ND726FmARQ" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Discord
              </a>
            </div>

            <div className="text-sm text-white/30">
              &copy; 2025 Perks. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Cart Sidebar ─── */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="relative w-full max-w-md bg-[#0d0018] border-l border-pink-500/10 overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-[#0d0018]/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold heading-italic text-white">
                Your Cart ({cart.length})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      {item.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-white/40">{item.description}</p>
                        <p className="text-sm font-bold gradient-text mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-white/60">Total</span>
                      <span className="text-2xl font-bold gradient-text">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <Link
                      to="/checkout"
                      state={{ cart, total: cartTotal }}
                      onClick={() => setShowCart(false)}
                    >
                      <button className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2">
                        Proceed to Checkout
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
