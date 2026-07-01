import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Download,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Send,
  X,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Heart,
  Sparkles,
  Info,
  Smartphone,
  Gamepad2,
  FileCode,
  Star
} from "lucide-react";
import { GAMES_DATABASE, Game } from "./data/games";
import { TRANSLATIONS } from "./data/translations";

export default function App() {
  // 1. Language Preference State
  const [language, setLanguage] = useState<"en" | "sw" | null>(() => {
    const stored = localStorage.getItem("gamesite_lang");
    return (stored === "en" || stored === "sw") ? stored : null;
  });

  // 2. Database State (Fetched from API with static local fallback)
  const [games, setGames] = useState<Game[]>(GAMES_DATABASE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<boolean>(false);

  // 3. UI and Filter States
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState<number>(32);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Authentication & Favorites States
  const [user, setUser] = useState<{
    uid: string;
    name: string;
    email: string;
    avatarUrl: string;
    provider: "google" | "github";
    isDemo?: boolean;
  } | null>(() => {
    const stored = localStorage.getItem("game_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [likes, setLikes] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [showAuthToast, setShowAuthToast] = useState<boolean>(false);
  const [configStatus, setConfigStatus] = useState<{googleConfigured: boolean; githubConfigured: boolean}>({
    googleConfigured: false,
    githubConfigured: false
  });

  // Fetch OAuth Configuration on Mount
  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfigStatus({
            googleConfigured: !!data.googleConfigured,
            githubConfigured: !!data.githubConfigured
          });
        }
      })
      .catch((err) => console.warn("Could not fetch OAuth config status from backend", err));
  }, []);

  // Sync likes state with user specific store
  useEffect(() => {
    const key = user ? `game_likes_${user.uid}` : "game_likes";
    const stored = localStorage.getItem(key);
    setLikes(stored ? JSON.parse(stored) : []);
  }, [user]);

  // Handle postMessage callback from the popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const userData = event.data.user;
        setUser(userData);
        localStorage.setItem("game_user", JSON.stringify(userData));
        setShowAuthToast(true);
        setTimeout(() => setShowAuthToast(false), 5000);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLogin = async (provider: "google" | "github") => {
    try {
      const redirectUri = window.location.origin + "/auth/callback";
      const response = await fetch(`/api/auth/url?provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to initiate login");
      }

      if (data.url) {
        const authWindow = window.open(data.url, "oauth_popup", "width=600,height=700");
        if (!authWindow) {
          alert("Please allow popups for this site to sign in.");
        }
      } else {
        // Fallback Demo Login
        const demoUser = {
          uid: `demo:${provider}:${Math.floor(Math.random() * 100000)}`,
          name: provider === "google" ? "Demo Google Player" : "Demo GitHub Player",
          email: `${provider}-demo@gamesiteonline.com`,
          avatarUrl: provider === "google"
            ? "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png"
            : "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png",
          provider,
          isDemo: true
        };
        setUser(demoUser);
        localStorage.setItem("game_user", JSON.stringify(demoUser));
        setShowAuthToast(true);
        setTimeout(() => setShowAuthToast(false), 5000);
      }
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("game_user");
    setShowOnlyFavorites(false);
  };

  const toggleLike = (gameId: string) => {
    setLikes((prev) => {
      const isLiked = prev.includes(gameId);
      const updated = isLiked ? prev.filter((id) => id !== gameId) : [...prev, gameId];
      const key = user ? `game_likes_${user.uid}` : "game_likes";
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch games from Express API
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/games")
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with error");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.games)) {
          setGames(data.games);
        } else {
          throw new Error("Invalid API payload");
        }
      })
      .catch((err) => {
        console.warn("Back-end API fetch failed, using local static database fallback.", err);
        setApiError(true);
        // Fallback is already initialized in state
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Update localStorage when language is selected
  const handleSelectLanguage = (lang: "en" | "sw") => {
    localStorage.setItem("gamesite_lang", lang);
    setLanguage(lang);
  };

  // Switch language directly from header
  const toggleLanguage = () => {
    const nextLang = language === "en" ? "sw" : "en";
    handleSelectLanguage(nextLang);
  };

  // Reset pagination when search queries or filters change
  useEffect(() => {
    setVisibleCount(32);
  }, [searchQuery, selectedPlatform, selectedGenre, selectedRating, selectedSize]);

  // Extract dynamic filters based on actual database content
  const uniquePlatforms = useMemo(() => {
    const platforms = games.map((g) => g.Platform);
    return Array.from(new Set(platforms)).sort();
  }, [games]);

  const uniqueGenres = useMemo(() => {
    const genres = games.map((g) => g.Genre);
    return Array.from(new Set(genres)).sort();
  }, [games]);

  // Current translation mapping
  const t = useMemo(() => {
    const activeLang = language || "en";
    return TRANSLATIONS[activeLang];
  }, [language]);

  // Helper to parse size string into MB for filtering
  const parseSizeInMB = (sizeStr: string): number => {
    const cleanStr = sizeStr.toLowerCase().trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return 0;
    if (cleanStr.endsWith("gb")) {
      return num * 1024;
    }
    if (cleanStr.endsWith("kb")) {
      return num / 1024;
    }
    return num; // Default to MB
  };

  // Helper to parse rating into a number
  const parseRatingNumber = (ratingStr: string): number => {
    const cleanStr = ratingStr.split("/")[0].trim();
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  // Perform multi-dimensional, combineable filtering
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // 0. Favorites filter
      if (showOnlyFavorites && !likes.includes(game.GameID)) {
        return false;
      }

      // 1. Text Search query (works on FileName, Description, Platform, Genre, and Extension)
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = game.FileName.toLowerCase().includes(query);
        const matchesPlatform = game.Platform.toLowerCase().includes(query);
        const matchesGenre = game.Genre.toLowerCase().includes(query);
        const matchesDescEn = game.DescriptionEn.toLowerCase().includes(query);
        const matchesDescSw = game.DescriptionSw.toLowerCase().includes(query);
        const matchesExtension = game.Extension.toLowerCase().includes(query);

        if (!matchesName && !matchesPlatform && !matchesGenre && !matchesDescEn && !matchesDescSw && !matchesExtension) {
          return false;
        }
      }

      // 2. Platform filter
      if (selectedPlatform !== "all" && game.Platform !== selectedPlatform) {
        return false;
      }

      // 3. Genre filter
      if (selectedGenre !== "all" && game.Genre !== selectedGenre) {
        return false;
      }

      // 4. Rating filter
      if (selectedRating !== "all") {
        const ratingVal = parseRatingNumber(game.Rating);
        if (selectedRating === "9.0" && ratingVal < 9.0) return false;
        if (selectedRating === "8.0" && ratingVal < 8.0) return false;
        if (selectedRating === "7.0" && ratingVal < 7.0) return false;
      }

      // 5. Size filter
      if (selectedSize !== "all") {
        const sizeMB = parseSizeInMB(game.Size);
        if (selectedSize === "under-50" && sizeMB >= 50) return false;
        if (selectedSize === "50-250" && (sizeMB < 50 || sizeMB > 250)) return false;
        if (selectedSize === "250-1000" && (sizeMB < 250 || sizeMB > 1000)) return false;
        if (selectedSize === "over-1000" && sizeMB <= 1000) return false;
      }

      return true;
    });
  }, [games, searchQuery, selectedPlatform, selectedGenre, selectedRating, selectedSize, showOnlyFavorites, likes]);

  // Find currently active game
  const activeGame = useMemo(() => {
    if (!selectedGameId) return null;
    return games.find((g) => g.GameID === selectedGameId) || null;
  }, [games, selectedGameId]);

  // Dynamic Translation of description and compatibility into Swahili on-demand
  useEffect(() => {
    if (language === "sw" && activeGame && (!activeGame.DescriptionSw || !activeGame.CompatibilitySw)) {
      setIsTranslating(true);
      fetch("/api/translate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: activeGame.GameID }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGames((prevGames) =>
              prevGames.map((g) =>
                g.GameID === activeGame.GameID
                  ? {
                      ...g,
                      DescriptionSw: data.DescriptionSw,
                      CompatibilitySw: data.CompatibilitySw,
                    }
                  : g
              )
            );
          }
        })
        .catch((err) => console.error("Error translating game details:", err))
        .finally(() => setIsTranslating(false));
    }
  }, [language, selectedGameId, activeGame]);

  // Slice the filtered games list for progressive/paginated rendering to support 20,000+ items smoothly
  const visibleGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 32);
  };

  // Handle copying of owner's phone number
  const handleCopyNumber = () => {
    navigator.clipboard.writeText("+255796339436");
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSelectedGenre("all");
    setSelectedRating("all");
    setSelectedSize("all");
    setVisibleCount(32);
  };

  const authT = useMemo(() => {
    const activeLang = language || "en";
    const authTranslations = {
      en: {
        signIn: "Sign In",
        signOut: "Sign Out",
        welcomeUser: "Welcome,",
        googleSignIn: "Sign in with Google",
        githubSignIn: "Sign in with GitHub",
        loginTitle: "USER ACCOUNT & DISCOVER PANEL",
        loginSub: "Sign in with your Google or GitHub account to create personal lists and sync your liked retro games.",
        myFavorites: "Liked Games Only",
        allGames: "All Games",
        likesCount: "Favorites",
        demoAccount: "Demo Mode Active",
        configNotice: "Notice: Live OAuth requires setting credentials in the Settings menu."
      },
      sw: {
        signIn: "Ingia Akunti",
        signOut: "Ondoka",
        welcomeUser: "Karibu,",
        googleSignIn: "Ingia na Google",
        githubSignIn: "Ingia na GitHub",
        loginTitle: "PANELI YA MTUMIAJI & MAARIFA",
        loginSub: "Ingia ukitumia akaunti yako ya Google au GitHub ili kutengeneza orodha yako na kuhifadhi michezo uliyopenda.",
        myFavorites: "Michezo Niliyoipenda",
        allGames: "Michezo Yote",
        likesCount: "Uliyopenda",
        demoAccount: "Njia ya Demo Imewezeshwa",
        configNotice: "Taarifa: Ili kutumia OAuth halisi, weka vitambulisho kwenye orodha ya Mipangilio."
      }
    };
    return authTranslations[activeLang];
  }, [language]);

  return (
    <div className="min-h-screen bg-[#FACC15] text-black font-sans relative selection:bg-black selection:text-[#FACC15]">
      
      {/* HEADER DECORATION LINE (Neo-brutalist stripes) */}
      <div className="h-4 bg-[#FACC15] border-b-4 border-black flex">
        <div className="w-1/3 bg-[#FACC15]"></div>
        <div className="w-1/3 bg-[#84CC16] border-l-4 border-r-4 border-black"></div>
        <div className="w-1/3 bg-[#F97316]"></div>
      </div>

      {/* LANGUAGE SELECTOR INITIAL MODAL */}
      <AnimatePresence>
        {language === null && (
          <motion.div 
            id="language-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#00000095] z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              id="language-modal-content"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-lg bg-[#FFF250] neo-border p-8 neo-shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-[#84CC16] neo-border rounded-full flex items-center justify-center mx-auto mb-4 neo-shadow-sm">
                <Globe className="w-8 h-8 text-black" />
              </div>
              
              <h2 className="text-3xl font-extrabold tracking-tight mb-3 uppercase">
                GAMESITEONLINE
              </h2>
              <p className="text-sm font-medium mb-8 text-neutral-800 uppercase tracking-wider">
                Select your Language / Chagua Lugha yako
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  id="lang-en-btn"
                  onClick={() => handleSelectLanguage("en")}
                  className="bg-white hover:bg-neutral-100 text-black font-black py-4 px-6 text-lg tracking-wide neo-border neo-shadow-sm neo-shadow-hover cursor-pointer uppercase"
                >
                  🇺🇸 English
                </button>
                <button
                  id="lang-sw-btn"
                  onClick={() => handleSelectLanguage("sw")}
                  className="bg-[#84CC16] hover:bg-lime-500 text-black font-black py-4 px-6 text-lg tracking-wide neo-border neo-shadow-sm neo-shadow-hover cursor-pointer uppercase"
                >
                  🇹🇿 Kiswahili
                </button>
              </div>

              <div className="mt-8 pt-4 border-t-2 border-black/10 flex flex-col items-center gap-1 text-xs font-mono text-neutral-800">
                <span>Fahad Mohamed — Tanzania 🇹🇿</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WEB VIEW LAYOUT */}
      {language !== null && (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          
          {/* AUTH SUCCESS TOAST */}
          <AnimatePresence>
            {showAuthToast && user && (
              <motion.div
                id="auth-success-toast"
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="fixed top-6 right-6 z-50 bg-[#10B981] text-white neo-border p-4 neo-shadow flex items-center gap-3 font-bold uppercase tracking-wide text-xs"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden neo-border-sm bg-[#A855F7]">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-extrabold text-sm">{user.name}</p>
                  <p className="text-[10px] opacity-90 font-mono">LOGGED IN WITH {user.provider.toUpperCase()}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>



          {/* AUTHENTICATION BAR */}
          <div id="auth-header-bar" className="w-full bg-white neo-border p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 neo-shadow">
            {user ? (
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full neo-border overflow-hidden bg-[#A855F7] shrink-0">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-lg uppercase tracking-tight">{authT.welcomeUser} {user.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider neo-border-sm ${
                      user.provider === "google" ? "bg-[#3b82f6] text-white" : "bg-black text-white"
                    }`}>
                      {user.provider}
                    </span>
                    {user.isDemo && (
                      <span className="bg-[#EAB308] text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider neo-border-sm">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide break-all">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 w-full md:w-auto text-left">
                <h4 className="font-extrabold text-sm uppercase tracking-tight">{authT.loginTitle}</h4>
                <p className="text-xs font-medium text-neutral-600 max-w-xl">{authT.loginSub}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end shrink-0">
              {user ? (
                <>
                  {/* Toggle Showing Favorites */}
                  <button
                    id="toggle-favorites-btn"
                    onClick={() => setShowOnlyFavorites(prev => !prev)}
                    className={`font-black py-2 px-4 text-xs flex items-center gap-2 uppercase tracking-wider neo-border-sm neo-shadow-sm cursor-pointer transition-all ${
                      showOnlyFavorites 
                        ? "bg-rose-500 text-white hover:bg-rose-600" 
                        : "bg-[#FFFCE0] text-black hover:bg-yellow-100"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
                    {authT.myFavorites} ({likes.length})
                  </button>

                  {/* Sign Out */}
                  <button
                    id="sign-out-btn"
                    onClick={handleLogout}
                    className="bg-white hover:bg-neutral-50 text-black font-black py-2 px-4 text-xs flex items-center gap-2 uppercase tracking-wider neo-border-sm neo-shadow-sm cursor-pointer"
                  >
                    {authT.signOut}
                  </button>
                </>
              ) : (
                <>
                  {/* Sign In Buttons */}
                  <button
                    id="google-signin-btn"
                    onClick={() => handleLogin("google")}
                    className="bg-[#3b82f6] hover:bg-blue-600 text-white font-black py-2.5 px-4 text-xs flex items-center gap-2 uppercase tracking-wider neo-border-sm neo-shadow-sm neo-shadow-hover cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.746-.08-1.32-.176-1.887H12.24z"/>
                    </svg>
                    {authT.googleSignIn}
                  </button>

                  <button
                    id="github-signin-btn"
                    onClick={() => handleLogin("github")}
                    className="bg-black hover:bg-neutral-900 text-white font-black py-2.5 px-4 text-xs flex items-center gap-2 uppercase tracking-wider neo-border-sm neo-shadow-sm neo-shadow-hover cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {authT.githubSignIn}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* HEADER */}
          <header className="mb-12 flex flex-col items-center">
            {/* Transparent Center Logo Banner */}
            <div className="w-full max-w-lg flex flex-col items-center justify-center mb-6 relative">
              <a href="/" className="block focus:outline-none">
                <img
                  src="https://github.com/gamesiteonline/gamesiteonline/raw/main/image/1782871878388.png"
                  alt="GAMESITEONLINE Logo"
                  referrerPolicy="no-referrer"
                  className="h-32 object-contain filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback to stylized text icon in case of network issue
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById("fallback-banner");
                    if (fallbackEl) fallbackEl.classList.remove("hidden");
                  }}
                />
              </a>
              {/* Fallback Banner */}
              <div 
                id="fallback-banner" 
                className="hidden neo-border bg-[#F97316] text-white p-4 font-black text-3xl tracking-tighter neo-shadow text-center uppercase"
              >
                GAMESITEONLINE
              </div>
            </div>

            {/* Platform Branding Text */}
            <div className="text-center max-w-2xl px-2">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-2">
                GAMESITEONLINE
              </h1>
              <div className="inline-block bg-[#84CC16] px-4 py-1.5 neo-border-sm font-mono text-xs font-bold uppercase tracking-wider mb-4">
                {t.ownerText} | {t.tanzaniaFlag}
              </div>
              <p className="text-base sm:text-lg font-medium text-neutral-800 max-w-xl mx-auto leading-relaxed">
                {t.homeSub}
              </p>
            </div>

            {/* Quick Actions (Language switch & Contact buttons) */}
            <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
              <button
                onClick={toggleLanguage}
                className="bg-white hover:bg-neutral-50 font-black py-2.5 px-4 neo-border-sm neo-shadow-sm neo-shadow-hover text-xs flex items-center gap-2 uppercase tracking-wider"
              >
                <Globe className="w-4 h-4" />
                {language === "en" ? "SWITCH TO KISWAHILI 🇹🇿" : "BADILI KWENDA KIINGEREZA 🇺🇸"}
              </button>
              
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-[#A855F7] hover:bg-purple-400 text-white font-black py-2.5 px-5 neo-border-sm neo-shadow-sm neo-shadow-hover text-xs flex items-center gap-2 uppercase tracking-wider"
              >
                <Phone className="w-4 h-4" />
                {t.contactBtn}
              </button>
            </div>
          </header>

          {/* MAIN CONTAINER */}
          <main>
            <AnimatePresence mode="wait">
              
              {/* GAME DETAIL SUBPAGE */}
              {activeGame ? (
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="bg-white neo-border p-6 sm:p-10 neo-shadow-lg mb-12"
                >
                  {/* Detail Page Navigation bar */}
                  <div className="flex justify-between items-center pb-6 border-b-4 border-black mb-8">
                    <button
                      onClick={() => setSelectedGameId(null)}
                      className="bg-white hover:bg-neutral-50 text-black font-black py-2.5 px-5 neo-border-sm neo-shadow-sm neo-shadow-hover text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t.backToBrowse}
                    </button>
                    <div className="font-mono text-xs font-bold uppercase bg-[#F3F4F6] px-3 py-1 neo-border-sm">
                      ID: {activeGame.GameID}
                    </div>
                  </div>

                  {/* Main Grid Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Column: Cover Art & Direct Attributes */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className="bg-[#F3F4F6] neo-border p-4 neo-shadow relative group">
                        <img
                          src={activeGame.CoverArtLink ? `/api/cover-image?url=${encodeURIComponent(activeGame.CoverArtLink)}` : undefined}
                          alt={`${activeGame.FileName} Cover Art`}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[3/4] object-cover neo-border-sm bg-neutral-200"
                          onError={(e) => {
                            // If load fails, replace with a solid Neo-Brutalist title cartridge
                            e.currentTarget.style.display = 'none';
                            const fallbackEl = document.getElementById(`fallback-detail-img`);
                            if (fallbackEl) fallbackEl.classList.remove("hidden");
                          }}
                        />
                        <div 
                          id="fallback-detail-img"
                          className="hidden w-full aspect-[3/4] neo-border-sm bg-[#F97316] flex flex-col items-center justify-center p-6 text-center text-white"
                        >
                          <Gamepad2 className="w-16 h-16 mb-4" />
                          <div className="font-black text-xl uppercase">{activeGame.FileName}</div>
                          <div className="text-xs font-mono mt-2 bg-black/30 px-2 py-0.5">{activeGame.Platform}</div>
                        </div>
                      </div>

                      {/* File Metrics Block */}
                      <div className="bg-[#FFF250] neo-border p-5 neo-shadow text-sm">
                        <h3 className="font-extrabold text-lg uppercase tracking-tight mb-3 pb-2 border-b-2 border-black">
                          {t.gameDetails}
                        </h3>
                        <div className="space-y-2.5 font-medium uppercase">
                          <div className="flex justify-between">
                            <span className="text-neutral-700 font-mono text-xs">{t.platformLabel}:</span>
                            <span className="font-bold text-right text-xs max-w-[180px]">{activeGame.Platform}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-700 font-mono text-xs">{t.genreLabel}:</span>
                            <span className="font-bold">{activeGame.Genre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-700 font-mono text-xs">{t.fileSizeLabel}:</span>
                            <span className="font-bold">{activeGame.Size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-700 font-mono text-xs">{t.formatLabel}:</span>
                            <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 neo-border-sm text-xs">{activeGame.Extension}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-700 font-mono text-xs">{t.ratingLabel}:</span>
                            <span className="font-extrabold text-xs bg-white py-0.5 px-2 neo-border-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-[#FACC15] text-[#FACC15]" />
                              {activeGame.Rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Description & Official AN1 Protocols */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                      {/* Title Header */}
                      <div>
                        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-4">
                          {activeGame.FileName}
                        </h2>
                        <div className="flex flex-wrap gap-2.5">
                          <span className="bg-[#06B6D4] text-white px-3 py-1 neo-border-sm font-bold text-xs uppercase tracking-wide">
                            {activeGame.Platform}
                          </span>
                          <span className="bg-[#84CC16] text-black px-3 py-1 neo-border-sm font-bold text-xs uppercase tracking-wide">
                            {activeGame.Genre}
                          </span>
                        </div>
                      </div>

                      {/* Decription translation box */}
                      <div className="bg-[#F8FAFC] neo-border p-6 neo-shadow relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold uppercase tracking-tight text-sm text-neutral-600 font-mono">
                            {t.descriptionLabel}
                          </h4>
                          {isTranslating && (
                            <span className="bg-[#FACC15] text-black text-[10px] font-black tracking-wider px-2 py-0.5 neo-border-sm animate-pulse">
                              🤖 GEMINI TRANSLATING / INATAFSIRI...
                            </span>
                          )}
                        </div>
                        {isTranslating ? (
                          <div className="space-y-2 py-2">
                            <div className="h-4 bg-neutral-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-neutral-200 rounded animate-pulse w-11/12"></div>
                            <div className="h-4 bg-neutral-200 rounded animate-pulse w-4/5"></div>
                          </div>
                        ) : (
                          <p className="text-base font-semibold leading-relaxed text-neutral-900">
                            {language === "en" ? activeGame.DescriptionEn : (activeGame.DescriptionSw || activeGame.DescriptionEn)}
                          </p>
                        )}
                      </div>

                      {/* Compatibility translation box */}
                      <div className="bg-orange-50 neo-border p-6 neo-shadow relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold uppercase tracking-tight text-sm text-orange-800 font-mono">
                            💡 {t.compatibilityLabel}
                          </h4>
                          {isTranslating && (
                            <span className="bg-[#FACC15] text-black text-[10px] font-black tracking-wider px-2 py-0.5 neo-border-sm animate-pulse">
                              🤖 GEMINI TRANSLATING / INATAFSIRI...
                            </span>
                          )}
                        </div>
                        {isTranslating ? (
                          <div className="space-y-2 py-2">
                            <div className="h-4 bg-orange-200/40 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-orange-200/40 rounded animate-pulse w-5/6"></div>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold leading-relaxed text-orange-950">
                            {language === "en" ? activeGame.CompatibilityEn : (activeGame.CompatibilitySw || activeGame.CompatibilityEn)}
                          </p>
                        )}
                      </div>

                      {/* DOWNLOAD CORE ACTION (AN1 Website protocol) */}
                      <div className="bg-[#ECFDF5] neo-border p-6 sm:p-8 neo-shadow-lg flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] neo-border-sm flex items-center justify-center text-white font-bold text-sm">
                            1
                          </div>
                          <h3 className="font-extrabold text-xl uppercase tracking-tight">
                            {t.downloadProtocolTitle}
                          </h3>
                        </div>

                        {/* AN1 Direct High-Speed Download Link & Favorite Button */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <a
                            href={activeGame.DownloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xl sm:text-2xl text-center py-5 px-6 neo-border neo-shadow neo-shadow-hover block transition-all uppercase tracking-wide"
                          >
                            📥 {t.downloadBtn} ({activeGame.Size})
                          </a>
                          
                          <button
                            onClick={() => toggleLike(activeGame.GameID)}
                            className={`sm:w-24 flex items-center justify-center py-5 px-6 neo-border neo-shadow neo-shadow-hover transition-all cursor-pointer ${
                              likes.includes(activeGame.GameID)
                                ? "bg-rose-500 text-white"
                                : "bg-white text-black hover:bg-rose-100"
                            }`}
                            title={likes.includes(activeGame.GameID) ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <Heart className={`w-8 h-8 ${likes.includes(activeGame.GameID) ? "fill-current animate-pulse" : ""}`} />
                          </button>
                        </div>

                        {/* Telegram Bot Notification */}
                        <div className="bg-[#EEF2F6] neo-border-sm p-4 text-center">
                          <p className="font-mono text-sm font-bold text-neutral-800 mb-2">
                            {t.telegramNote}
                          </p>
                          <a
                            href="https://t.me/faliz_AI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#0088cc] text-white px-4 py-2 neo-border-sm text-xs font-black uppercase neo-shadow-sm neo-shadow-hover"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Launch Telegram Bot
                          </a>
                        </div>

                        {/* Invite to Join WhatsApp Channel */}
                        <div className="border-t-2 border-black/10 pt-6">
                          <p className="text-sm font-bold text-neutral-800 leading-relaxed mb-4">
                            📢 {t.whatsappInvite}
                          </p>
                          <a
                            href="https://whatsapp.com/channel/0029VbChyDUI1rcht5jajL3q"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-emerald-500 text-white font-black py-3 px-6 neo-border neo-shadow neo-shadow-hover w-full sm:w-auto inline-block text-center text-sm uppercase tracking-wider"
                          >
                            💬 {t.joinWhatsappBtn}
                          </a>
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              ) : (
                
                /* BROWSE GRID VIEW WITH DYNAMIC SEARCH/FILTERS */
                <motion.div
                  key="browse-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  
                  {/* BILINGUAL INTRO HERO */}
                  <div className="bg-[#FFF250] neo-border p-6 sm:p-8 neo-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-black" />
                        {t.homeTitle}
                      </h2>
                      <p className="text-sm sm:text-base font-semibold text-neutral-800 max-w-2xl">
                        {language === "en" 
                          ? "Select your emulator and get direct, raw, high-speed Direct ISO/CHD file downloads. No ads, no limits."
                          : "Chagua emulator yako na upakue faili za moja kwa moja za ISO/CHD kwa kasi ya juu. Hakuna matangazo."}
                      </p>
                    </div>
                    
                    {/* Floating counts */}
                    <div className="bg-white neo-border px-5 py-3 neo-shadow-sm shrink-0 text-center uppercase font-mono">
                      <div className="text-xs text-neutral-600 font-bold">{t.totalGames}</div>
                      <div className="text-3xl font-black text-black">{filteredGames.length}</div>
                    </div>
                  </div>

                  {/* ADVANCED NEO-BRUTALIST CONTROLS PANEL */}
                  <div className="bg-white neo-border p-6 neo-shadow-lg">
                    
                    {/* Search bar row */}
                    <div className="relative flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <input
                          id="game-search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t.searchPlaceholder}
                          className="w-full bg-white neo-border-md pl-12 pr-4 py-4 font-semibold text-black placeholder:text-neutral-500 text-sm sm:text-base focus:outline-none focus:bg-[#FFFDEB]"
                        />
                      </div>
                      
                      {/* Reset button inside input area */}
                      {(searchQuery || selectedPlatform !== "all" || selectedGenre !== "all" || selectedRating !== "all" || selectedSize !== "all") && (
                        <button
                          onClick={handleResetFilters}
                          className="bg-[#F97316] hover:bg-orange-500 text-white font-black py-4 px-6 text-sm uppercase tracking-wide neo-border-md neo-shadow-sm neo-shadow-hover shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          {t.resetFilters}
                        </button>
                      )}
                    </div>

                    {/* Combinable Filters Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Platform Dropdown */}
                      <div className="flex flex-col">
                        <label className="text-xs font-black font-mono uppercase text-neutral-600 mb-1.5 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" />
                          {t.filterPlatform}
                        </label>
                        <select
                          id="platform-filter"
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="bg-white neo-border-sm p-3 font-semibold text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.allPlatforms}</option>
                          {uniquePlatforms.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Genre Dropdown */}
                      <div className="flex flex-col">
                        <label className="text-xs font-black font-mono uppercase text-neutral-600 mb-1.5 flex items-center gap-1">
                          <Gamepad2 className="w-3.5 h-3.5" />
                          {t.filterGenre}
                        </label>
                        <select
                          id="genre-filter"
                          value={selectedGenre}
                          onChange={(e) => setSelectedGenre(e.target.value)}
                          className="bg-white neo-border-sm p-3 font-semibold text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.allGenres}</option>
                          {uniqueGenres.map((genre) => (
                            <option key={genre} value={genre}>
                              {genre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Rating Dropdown */}
                      <div className="flex flex-col">
                        <label className="text-xs font-black font-mono uppercase text-neutral-600 mb-1.5 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          {t.filterRating}
                        </label>
                        <select
                          id="rating-filter"
                          value={selectedRating}
                          onChange={(e) => setSelectedRating(e.target.value)}
                          className="bg-white neo-border-sm p-3 font-semibold text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.allRatings}</option>
                          <option value="9.0">9.0+ / 10</option>
                          <option value="8.0">8.0+ / 10</option>
                          <option value="7.0">7.0+ / 10</option>
                        </select>
                      </div>

                      {/* Size Range Dropdown */}
                      <div className="flex flex-col">
                        <label className="text-xs font-black font-mono uppercase text-neutral-600 mb-1.5 flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5" />
                          {t.filterSize}
                        </label>
                        <select
                          id="size-filter"
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="bg-white neo-border-sm p-3 font-semibold text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.allSizes}</option>
                          <option value="under-50">Under 50 MB</option>
                          <option value="50-250">50 MB - 250 MB</option>
                          <option value="250-1000">250 MB - 1 GB</option>
                          <option value="over-1000">Over 1 GB</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* GAMES CATALOG GRID */}
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white neo-border neo-shadow">
                      <div className="w-12 h-12 bg-[#FACC15] neo-border rounded-full animate-bounce mb-4"></div>
                      <div className="font-black uppercase tracking-wider text-sm">LOADING DATABASE... / INAPAKUA MAFAILI...</div>
                    </div>
                  ) : filteredGames.length === 0 ? (
                    <div className="bg-white neo-border p-12 text-center neo-shadow">
                      <div className="w-16 h-16 bg-[#F97316] text-white neo-border rounded-full flex items-center justify-center mx-auto mb-4 neo-shadow-sm">
                        <Info className="w-8 h-8" />
                      </div>
                      <p className="text-xl font-bold uppercase tracking-wide text-neutral-800">
                        {t.noGamesFound}
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-6 bg-[#FACC15] hover:bg-yellow-400 text-black font-black py-2.5 px-6 neo-border neo-shadow-sm neo-shadow-hover text-sm uppercase tracking-wide cursor-pointer"
                      >
                        {t.resetFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleGames.map((game, idx) => (
                          <motion.div
                            id={`game-card-${game.GameID}`}
                            key={game.GameID}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                            className="bg-white neo-border p-4 flex flex-col justify-between neo-shadow neo-shadow-hover group"
                          >
                            <div>
                              {/* Game Cover Art container with custom styling */}
                              <div className="bg-[#F3F4F6] neo-border-sm aspect-[4/5] overflow-hidden mb-4 relative">
                                {/* Corner Heart / Like Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(game.GameID);
                                  }}
                                  className={`absolute top-2 left-2 z-10 p-1.5 rounded-full neo-border-sm transition-all shadow-sm cursor-pointer scale-95 hover:scale-105 active:scale-95 ${
                                    likes.includes(game.GameID)
                                      ? "bg-rose-500 text-white border-black"
                                      : "bg-white text-black border-black hover:bg-rose-100"
                                  }`}
                                  title={likes.includes(game.GameID) ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${likes.includes(game.GameID) ? "fill-current" : ""}`} />
                                </button>

                                <img
                                  src={game.CoverArtLink ? `/api/cover-image?url=${encodeURIComponent(game.CoverArtLink)}` : undefined}
                                  alt={`${game.FileName} Cover Art`}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    // Solid Neo-Brutalist cover replacement
                                    e.currentTarget.style.display = 'none';
                                    const fallbackEl = document.getElementById(`fallback-img-${game.GameID}`);
                                    if (fallbackEl) fallbackEl.classList.remove("hidden");
                                  }}
                                />
                                
                                {/* Custom Solid Replacement */}
                                <div 
                                  id={`fallback-img-${game.GameID}`}
                                  className="hidden w-full h-full bg-[#A855F7] flex flex-col items-center justify-center p-4 text-center text-white"
                                >
                                  <Gamepad2 className="w-12 h-12 mb-2" />
                                  <div className="font-extrabold text-sm uppercase">{game.FileName}</div>
                                  <div className="text-[10px] font-mono mt-1 bg-black/20 px-1.5 py-0.5">{game.Platform}</div>
                                </div>

                                {/* Corner Size Badge */}
                                <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider neo-border-sm">
                                  {game.Size}
                                </div>

                                {/* Corner File Extension */}
                                <div className="absolute bottom-2 left-2 bg-[#F97316] text-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider neo-border-sm">
                                  {game.Extension}
                                </div>
                              </div>

                              {/* Platform Tag */}
                              <div className="text-[10px] font-bold font-mono text-neutral-600 tracking-wider uppercase mb-1">
                                {game.Platform}
                              </div>

                              {/* Game Title */}
                              <h3 className="text-xl font-black uppercase tracking-tight line-clamp-1 mb-2 group-hover:text-[#F97316] transition-colors">
                                {game.FileName}
                              </h3>

                              {/* Game Details Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                <span className="bg-[#EEF2F6] px-2 py-0.5 font-bold text-[10px] uppercase neo-border-sm">
                                  {game.Genre}
                                </span>
                                <span className="bg-[#FFFCE0] px-2 py-0.5 font-bold text-[10px] uppercase neo-border-sm text-yellow-800 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
                                  {game.Rating}
                                </span>
                              </div>

                              {/* Game Sub-description snippet */}
                              <p className="text-xs font-semibold text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                                {language === "en" ? game.DescriptionEn : (game.DescriptionSw || `[Kiswahili - Tafsiri bado kupatikana. Bofya maelezo upate tafsiri ya haraka...]`)}
                              </p>
                            </div>

                            {/* Detail Click Handler */}
                            <button
                              onClick={() => {
                                setSelectedGameId(game.GameID);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full bg-[#FACC15] group-hover:bg-[#84CC16] text-black font-black text-xs py-3 text-center neo-border neo-shadow-sm neo-shadow-hover transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              {language === "en" ? "DETAILS & DOWNLOAD" : "MAELEZO NA PAKUA"}
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Paginated Load More Button */}
                      {filteredGames.length > visibleCount && (
                        <div className="flex justify-center pt-4">
                          <button
                            onClick={handleLoadMore}
                            className="bg-black hover:bg-neutral-800 text-[#FACC15] font-black text-sm sm:text-base py-3.5 px-8 sm:px-12 neo-border-md neo-shadow neo-shadow-hover transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2"
                          >
                            ➕ {language === "en" ? "LOAD MORE GAMES" : "ONYESHA MICHEZO ZAIDI"} ({filteredGames.length - visibleCount} {language === "en" ? "REMAINING" : "YALIYOBAKIA"})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* SUPPORT / CONTACT FLOATING DIALOG */}
          <AnimatePresence>
            {showContactModal && (
              <motion.div
                id="contact-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#00000095] z-50 flex items-center justify-center p-4 backdrop-blur-xs"
              >
                <motion.div
                  id="contact-modal-content"
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 50 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-full max-w-lg bg-white neo-border p-6 sm:p-8 neo-shadow-lg relative"
                >
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="absolute top-4 right-4 bg-white hover:bg-neutral-50 neo-border-sm p-1.5 neo-shadow-sm neo-shadow-hover cursor-pointer"
                  >
                    <X className="w-5 h-5 text-black" />
                  </button>

                  <div className="flex items-center gap-3 mb-6 pb-2 border-b-4 border-black">
                    <Phone className="w-6 h-6 text-[#A855F7]" />
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      {t.contactOptionsTitle}
                    </h2>
                  </div>

                  {/* Dynamic Support Channels */}
                  <div className="space-y-4">
                    
                    {/* WhatsApp Channel */}
                    <div className="bg-[#E8FBF0] neo-border p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                        <h4 className="font-extrabold text-sm uppercase text-emerald-950 font-mono">
                          {t.whatsappChannel}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-emerald-900 leading-normal">
                        Get the absolute latest uploads directly in your WhatsApp feed daily. Request files and contact admin.
                      </p>
                      <a
                        href="https://whatsapp.com/channel/0029VbChyDUI1rcht5jajL3q"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] text-white text-xs font-black py-2.5 px-4 neo-border-sm text-center uppercase tracking-wide neo-shadow-sm neo-shadow-hover"
                      >
                        Open WhatsApp Channel
                      </a>
                    </div>

                    {/* Direct SMS and Phone Copy */}
                    <div className="bg-[#FFFCE5] neo-border p-4 space-y-3">
                      <h4 className="font-extrabold text-sm uppercase text-yellow-950 font-mono">
                        📞 direct contact & SMS
                      </h4>
                      <p className="text-xs font-semibold text-yellow-900">
                        Reach Fahad Mohamed from Tanzania 🇹🇿 directly via SMS or cellular network.
                      </p>
                      
                      <div className="flex gap-2">
                        <a
                          href="sms:+255796339436"
                          className="flex-grow bg-white hover:bg-yellow-50 text-black text-center text-xs font-black py-2.5 px-3 neo-border-sm neo-shadow-sm neo-shadow-hover uppercase"
                        >
                          Send SMS (+255)
                        </a>
                        <button
                          onClick={handleCopyNumber}
                          className="bg-[#FACC15] hover:bg-yellow-400 text-black text-xs font-black py-2.5 px-4 neo-border-sm neo-shadow-sm neo-shadow-hover shrink-0 uppercase flex items-center gap-1.5"
                        >
                          {copiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedState ? t.copiedMsg : t.copyNumber}
                        </button>
                      </div>
                    </div>

                    {/* Email support */}
                    <div className="bg-[#FFF] neo-border p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs uppercase text-neutral-500 font-mono">
                          ✉️ email admin
                        </h4>
                        <p className="font-mono text-xs font-bold break-all">gamesiteonlinetz@gmail.com</p>
                      </div>
                      <a
                        href="mailto:gamesiteonlinetz@gmail.com"
                        className="bg-[#06B6D4] text-white font-black py-2 px-4 neo-border-sm text-xs uppercase tracking-wide neo-shadow-sm neo-shadow-hover shrink-0"
                      >
                        Email Us
                      </a>
                    </div>

                    {/* Telegram support */}
                    <div className="bg-[#F0F6FC] neo-border p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs uppercase text-blue-500 font-mono">
                          ✈️ telegram group & chat
                        </h4>
                        <p className="font-mono text-xs font-bold">@faliz_AI</p>
                      </div>
                      <a
                        href="https://t.me/faliz_AI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0088cc] text-white font-black py-2 px-4 neo-border-sm text-xs uppercase tracking-wide neo-shadow-sm neo-shadow-hover shrink-0"
                      >
                        Telegram Chat
                      </a>
                    </div>

                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          <footer className="mt-16 pt-12 border-t-4 border-black text-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="https://whatsapp.com/channel/0029VbChyDUI1rcht5jajL3q"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-xs hover:underline uppercase tracking-widest"
              >
                WHATSAPP CHANNEL
              </a>
              <span className="text-black/30 font-black">•</span>
              <button
                onClick={() => setShowContactModal(true)}
                className="font-black text-xs hover:underline uppercase tracking-widest"
              >
                SUPPORT / WASILIANA NASI
              </button>
              <span className="text-black/30 font-black">•</span>
              <a
                href="https://t.me/faliz_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-xs hover:underline uppercase tracking-widest"
              >
                TELEGRAM ADMIN
              </a>
            </div>

            <div className="space-y-2">
              <p className="font-black text-sm uppercase tracking-wider">
                © 2026 GAMESITEONLINE. All rights reserved.
              </p>
              <p className="font-mono text-xs text-neutral-600 font-bold uppercase">
                Designed & Distributed by Fahad Mohamed in Tanzania 🇹🇿
              </p>
            </div>

            <div className="h-4 bg-[#FACC15] neo-border-sm max-w-xs mx-auto flex items-center justify-center">
              <span className="font-mono text-[9px] font-bold text-black uppercase tracking-widest">
                NEO BRUTALISM V1.2
              </span>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}
