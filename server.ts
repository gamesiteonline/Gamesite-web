import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Game } from "./src/data/games";

let cachedGames: Game[] = [];
let isFetchingDb = false;
let dbFetchError: string | null = null;

// Libretro platform directory matching map
const LIBRETRO_PLATFORMS: Record<string, string> = {
  "dos": "DOS",
  "microsoft xbox 360": "Microsoft - Xbox 360",
  "microsoft xbox": "Microsoft - Xbox",
  "sega - dreamcast": "Sega - Dreamcast",
  "sega genesis / mega drive": "Sega - Mega Drive - Genesis",
  "sega genesis": "Sega - Mega Drive - Genesis",
  "sony - playstation": "Sony - PlayStation",
  "sony playstation": "Sony - PlayStation",
  "sony playstation 2": "Sony - PlayStation 2",
  "sony - playstation 2": "Sony - PlayStation 2",
  "sony playstation 3": "Sony - PlayStation 3",
  "sony - playstation 3": "Sony - PlayStation 3",
  "sony playstation portable": "Sony - PlayStation Portable",
  "sony - playstation portable": "Sony - PlayStation Portable",
  "sony playstation portable / ps2": "Sony - PlayStation Portable",
  "nintendo game boy advance": "Nintendo - Game Boy Advance",
  "nintendo ds": "Nintendo - Nintendo DS",
  "nintendo - nintendo ds": "Nintendo - Nintendo DS",
  "nintendo - game boy advance": "Nintendo - Game Boy Advance"
};

const platformFilesCache: Record<string, string[]> = {};
const platformNormalizedMaps: Record<string, Map<string, string>> = {};

function findLibretroPlatform(plat: string): string | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normPlat = normalize(plat);
  for (const [key, value] of Object.entries(LIBRETRO_PLATFORMS)) {
    const normKey = normalize(key);
    if (normPlat.includes(normKey) || normKey.includes(normPlat)) {
      return value;
    }
  }
  return null;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // remove extension (.png, .jpg, etc.)
    .replace(/\([^)]*\)/g, "") // remove anything in parentheses (e.g., (USA), (1998))
    .replace(/\[[^\]]*\]/g, "") // remove anything in brackets (e.g., [Disc-1])
    .replace(/\s*-\s*disc\s*[0-9]+/gi, "") // remove " - disc 1", " - disc 2", etc.
    .replace(/\bdisc\s*[0-9]+/gi, "") // remove "disc 1", "disc 2"
    .replace(/[^a-z0-9]/g, ""); // remove all non-alphanumeric characters
}

async function getPlatformFiles(platformName: string): Promise<string[]> {
  if (platformFilesCache[platformName]) {
    return platformFilesCache[platformName];
  }

  console.log(`Fetching libretro index for platform: ${platformName}...`);
  try {
    const url = `https://thumbnails.libretro.com/${encodeURIComponent(platformName)}/Named_Boxarts/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      console.error(`Failed to fetch index for ${platformName}: HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    // Extract hrefs ending in .png, .jpg, or .jpeg
    const hrefRegex = /href=["']([^"']+\.(?:png|jpg|jpeg))["']/gi;
    const files: string[] = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      const decoded = decodeURIComponent(match[1]);
      if (!decoded.startsWith("/") && !decoded.startsWith("http") && !decoded.includes("?")) {
        files.push(decoded);
      }
    }
    platformFilesCache[platformName] = files;

    // Build the O(1) mapping of normalized name to actual filename
    const fileMap = new Map<string, string>();
    for (const file of files) {
      fileMap.set(normalizeName(file), file);
    }
    platformNormalizedMaps[platformName] = fileMap;

    console.log(`Successfully indexed ${files.length} covers for platform: ${platformName}`);
    return files;
  } catch (err) {
    console.error(`Error indexing platform ${platformName}:`, err);
    return [];
  }
}

async function resolveCoverArt(gameName: string, platform: string, defaultCover: string): Promise<string> {
  const libretroPlat = findLibretroPlatform(platform);
  if (!libretroPlat) {
    return defaultCover;
  }

  const files = await getPlatformFiles(libretroPlat);
  if (files.length === 0) {
    return defaultCover;
  }

  const normGame = normalizeName(gameName);
  if (!normGame) return defaultCover;

  const fileMap = platformNormalizedMaps[libretroPlat];
  if (!fileMap) return defaultCover;

  // 1. O(1) Instant exact normalized match lookup - ALWAYS preferred and safe
  const exactMatch = fileMap.get(normGame);
  if (exactMatch) {
    return `https://thumbnails.libretro.com/${encodeURIComponent(libretroPlat)}/Named_Boxarts/${encodeURIComponent(exactMatch)}`;
  }

  // 2. Try prefix matching ONLY IF the normalized game name is long enough to prevent false positives (>= 4 chars)
  // We match if the library file starts with the game name (e.g. library file is "Doom 3" and game is "Doom")
  if (normGame.length >= 4) {
    for (const [normFile, file] of fileMap.entries()) {
      if (normFile.startsWith(normGame)) {
        return `https://thumbnails.libretro.com/${encodeURIComponent(libretroPlat)}/Named_Boxarts/${encodeURIComponent(file)}`;
      }
    }
  }

  // 3. Try inclusion match ONLY IF the normalized game name is sufficiently long (>= 5 chars)
  // We match if the library file contains the game name (e.g. library file is "The Legend of Zelda - Ocarina of Time" and game is "Ocarina of Time")
  if (normGame.length >= 5) {
    for (const [normFile, file] of fileMap.entries()) {
      if (normFile.includes(normGame)) {
        return `https://thumbnails.libretro.com/${encodeURIComponent(libretroPlat)}/Named_Boxarts/${encodeURIComponent(file)}`;
      }
    }
  }

  return defaultCover;
}

async function fetchFullDatabase() {
  if (isFetchingDb) return;
  isFetchingDb = true;
  dbFetchError = null;
  console.log("Starting background fetch of the full game database from repository...");
  try {
    const urls = [
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/DOS_Games.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/Mobile_APKs_IPAs.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/PC_Dreamcast.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/PS1_PSX.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/PS2_PSP.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/PS3_PS4_Labels.json",
      "https://raw.githubusercontent.com/gamesiteonline/game-database/master/XBOX_360.json"
    ];

    console.log("Fetching all 7 platform database files in parallel...");
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } catch (e: any) {
          console.error(`Error fetching platform database file from ${url}:`, e);
          return [];
        }
      })
    );

    const allItems = results.flat().filter(item => item && typeof item === "object");
    console.log(`Successfully fetched and parsed ${allItems.length} total game items from repository.`);

    // Preload libretro index lists for all unique platforms present in our items
    const uniquePlatsInItems = Array.from(new Set(allItems.map(item => item.Platform).filter(Boolean)));
    const platformsToPreload = uniquePlatsInItems
      .map(p => findLibretroPlatform(p as string))
      .filter((v): v is string => !!v);

    console.log("Preloading matching Libretro platform indexes in parallel...");
    await Promise.all(
      Array.from(new Set(platformsToPreload)).map(plat => getPlatformFiles(plat).catch(() => []))
    );

    // Map the repository items to the client Game format with intelligent cover resolution
    console.log("Resolving precise Libretro Cover Art links for all games...");
    const mappedGames: Game[] = [];
    for (const item of allItems) {
      const defaultCover = item.CoverArtLink || "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png";
      const resolvedCover = await resolveCoverArt(item.FileName || "", item.Platform || "", defaultCover);
      mappedGames.push({
        GameID: item.GameID || `GEN-${Math.random().toString(36).substr(2, 9)}`,
        FileName: item.FileName || "Unknown Title",
        Extension: item.Extension || "ZIP",
        Platform: item.Platform || "Unknown Platform",
        Genre: item.Genre || "General",
        Rating: item.Rating || "7.5/10",
        DescriptionEn: item.DescriptionEn || item.Description || "No description available in English.",
        DescriptionSw: item.DescriptionSw || "", 
        CompatibilityEn: item.CompatibilityEn || item.Compatibility || "No special compatibility notes required.",
        CompatibilitySw: item.CompatibilitySw || "", 
        Size: item.Size || "N/A",
        DownloadLink: item.DownloadLink || "",
        CoverArtLink: resolvedCover
      });
    }

    // Deduplicate fetched games by both GameID and Normalized Title + Platform
    const seenIds = new Set<string>();
    const seenTitlesAndPlatforms = new Set<string>();
    const merged: Game[] = [];

    for (const g of mappedGames) {
      const titlePlatformKey = `${normalizeName(g.FileName)}_${g.Platform.toLowerCase()}`;
      if (!seenIds.has(g.GameID) && !seenTitlesAndPlatforms.has(titlePlatformKey)) {
        merged.push(g);
        seenIds.add(g.GameID);
        seenTitlesAndPlatforms.add(titlePlatformKey);
      }
    }

    cachedGames = merged;
    console.log(`Cache updated successfully with matched covers and deduplication. Now serving ${cachedGames.length} games in total.`);
  } catch (err: any) {
    console.error("Error updating full database cache:", err);
    dbFetchError = err.message;
  } finally {
    isFetchingDb = false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Trigger background database fetch immediately
  fetchFullDatabase().catch(err => {
    console.error("Initial database fetch error:", err);
  });

  // API Route for games database
  app.get("/api/games", (req, res) => {
    try {
      const { search, platform, genre } = req.query;
      let games = [...cachedGames];

      if (search && typeof search === "string") {
        const query = search.toLowerCase();
        games = games.filter(g =>
          g.FileName.toLowerCase().includes(query) ||
          g.DescriptionEn.toLowerCase().includes(query) ||
          g.DescriptionSw.toLowerCase().includes(query) ||
          g.Platform.toLowerCase().includes(query)
        );
      }

      if (platform && typeof platform === "string" && platform !== "all") {
        games = games.filter(g => g.Platform.toLowerCase() === platform.toLowerCase());
      }

      if (genre && typeof genre === "string" && genre !== "all") {
        games = games.filter(g => g.Genre.toLowerCase() === genre.toLowerCase());
      }

      res.json({ success: true, games });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route to proxy Cover Art images to bypass CORS / Hotlink Protection / HTTPS issues
  app.get("/api/cover-image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).send("Missing url parameter");
      }

      // Safe source check: thumbnails.libretro.com or igdb
      if (!url.startsWith("https://thumbnails.libretro.com/") && !url.startsWith("https://images.igdb.com/")) {
        return res.status(400).send("Invalid image source");
      }

      const imageRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Referer": "https://thumbnails.libretro.com/"
        }
      });

      if (!imageRes.ok) {
        console.warn(`Proxy cover art returned HTTP ${imageRes.status} for URL: ${url}. Redirecting to IGDB default...`);
        return res.redirect("https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png");
      }

      const contentType = imageRes.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache in browser for 1 day

      const arrayBuffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Error proxying cover image:", err);
      res.redirect("https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png");
    }
  });

  // API Route to return auth configuration to the client
  app.get("/api/auth/config", (req, res) => {
    res.json({
      googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      githubConfigured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    });
  });

  // API Route to construct and return the OAuth redirect URL
  app.get("/api/auth/url", (req, res) => {
    try {
      const { provider, redirectUri } = req.query;
      if (!provider || typeof provider !== "string") {
        return res.status(400).json({ success: false, error: "Missing provider parameter" });
      }
      if (!redirectUri || typeof redirectUri !== "string") {
        return res.status(400).json({ success: false, error: "Missing redirectUri parameter" });
      }

      const state = `${provider}:${encodeURIComponent(redirectUri)}`;

      if (provider === "google") {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          return res.json({ success: true, url: null, configured: false });
        }
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "openid email profile",
          state: state,
          access_type: "offline",
          prompt: "consent"
        });
        return res.json({ success: true, url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, configured: true });
      } else if (provider === "github") {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          return res.json({ success: true, url: null, configured: false });
        }
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: "read:user user:email",
          state: state
        });
        return res.json({ success: true, url: `https://github.com/login/oauth/authorize?${params}`, configured: true });
      }

      return res.status(400).json({ success: false, error: "Unsupported provider" });
    } catch (err: any) {
      console.error("Error generating OAuth URL:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Combined Callback route for OAuth providers (Google and GitHub)
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code, state } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).send("Authorization code is missing");
    }

    try {
      const parsedState = state ? state.toString() : "";
      const colonIndex = parsedState.indexOf(":");
      const provider = colonIndex !== -1 ? parsedState.substring(0, colonIndex) : "";
      const originalRedirectUri = colonIndex !== -1 ? decodeURIComponent(parsedState.substring(colonIndex + 1)) : "";

      if (!provider || !originalRedirectUri) {
        return res.status(400).send("Invalid state parameter");
      }

      let userData: any = null;

      if (provider === "google") {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new Error("Google OAuth credentials are not configured on the server.");
        }

        // 1. Exchange authorization code for access token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: originalRedirectUri,
            grant_type: "authorization_code"
          })
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          throw new Error(`Google token exchange failed: HTTP ${tokenRes.status} - ${errText}`);
        }

        const tokenData = await tokenRes.json() as any;
        const accessToken = tokenData.access_token;

        // 2. Fetch user profile
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!userRes.ok) {
          throw new Error(`Failed to fetch Google user profile: HTTP ${userRes.status}`);
        }

        const googleUser = await userRes.json() as any;
        userData = {
          uid: `google:${googleUser.id}`,
          name: googleUser.name || googleUser.given_name || "Google User",
          email: googleUser.email,
          avatarUrl: googleUser.picture || "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png",
          provider: "google"
        };
      } else if (provider === "github") {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new Error("GitHub OAuth credentials are not configured on the server.");
        }

        // 1. Exchange authorization code for access token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: originalRedirectUri
          })
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          throw new Error(`GitHub token exchange failed: HTTP ${tokenRes.status} - ${errText}`);
        }

        const tokenData = await tokenRes.json() as any;
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          throw new Error(`GitHub token exchange returned no access token: ${JSON.stringify(tokenData)}`);
        }

        // 2. Fetch user profile
        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "aistudio-build"
          }
        });

        if (!userRes.ok) {
          throw new Error(`Failed to fetch GitHub user profile: HTTP ${userRes.status}`);
        }

        const githubUser = await userRes.json() as any;

        // Try to get primary email if it is private
        let email = githubUser.email;
        if (!email) {
          const emailsRes = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "User-Agent": "aistudio-build"
            }
          });
          if (emailsRes.ok) {
            const emails = await emailsRes.json() as any[];
            const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
            if (primaryEmail) {
              email = primaryEmail.email;
            }
          }
        }

        userData = {
          uid: `github:${githubUser.id}`,
          name: githubUser.name || githubUser.login || "GitHub User",
          email: email || `${githubUser.login}@github.com`,
          avatarUrl: githubUser.avatar_url || "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v5y.png",
          provider: "github"
        };
      } else {
        throw new Error("Invalid provider");
      }

      // Success! Respond with a simple page that closes the popup and transmits user info
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Successful</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f9fafb; margin: 0; color: #111827; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; }
            h2 { margin-top: 0; color: #10b981; }
            p { color: #4b5563; line-height: 1.5; }
            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #10b981; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 1rem auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Login Successful!</h2>
            <div class="spinner"></div>
            <p>Connecting with main application window... This window will close automatically.</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  user: ${JSON.stringify(userData)}
                }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                localStorage.setItem('game_user', JSON.stringify(${JSON.stringify(userData)}));
                window.location.href = '/';
              }
            } catch (err) {
              console.error("Failed to notify opener:", err);
              localStorage.setItem('game_user', JSON.stringify(${JSON.stringify(userData)}));
              window.location.href = '/';
            }
          </script>
        </body>
        </html>
      `);
    } catch (err: any) {
      console.error("OAuth callback error:", err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Failed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f9fafb; margin: 0; color: #111827; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; }
            h2 { margin-top: 0; color: #ef4444; }
            p { color: #4b5563; line-height: 1.5; }
            .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; margin-top: 1rem; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Authentication Failed</h2>
            <p>${err.message || "An error occurred during verification. Please make sure your environment variables are configured correctly."}</p>
            <a href="javascript:window.close()" class="btn">Close Window</a>
          </div>
        </body>
        </html>
      `);
    }
  });

  // API Route for on-demand Swahili translation using Gemini API
  app.post("/api/translate-game", async (req, res) => {
    try {
      const { gameId } = req.body;
      if (!gameId) {
        return res.status(400).json({ success: false, error: "Missing gameId" });
      }

      // Find the game in cachedGames
      const gameIdx = cachedGames.findIndex(g => g.GameID === gameId);
      if (gameIdx === -1) {
        return res.status(404).json({ success: false, error: "Game not found" });
      }

      const game = cachedGames[gameIdx];

      // If already translated, return immediately
      if (game.DescriptionSw && game.CompatibilitySw) {
        return res.json({
          success: true,
          DescriptionSw: game.DescriptionSw,
          CompatibilitySw: game.CompatibilitySw
        });
      }

      // Lazy check of the API key
      const aiKey = process.env.GEMINI_API_KEY;
      if (!aiKey) {
        // Fallback translation if no key is present (gracious fallback)
        game.DescriptionSw = `[Tafsiri]: ${game.DescriptionEn}`;
        game.CompatibilitySw = `[Tafsiri]: ${game.CompatibilityEn}`;
        return res.json({
          success: true,
          DescriptionSw: game.DescriptionSw,
          CompatibilitySw: game.CompatibilitySw
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: aiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log(`Translating game ${gameId} to Swahili using Gemini...`);

      const prompt = `
You are a professional video game translator specializing in localization for Tanzania/East Africa (Swahili language).
Translate the following video game metadata into clear, natural, and appealing Swahili (Kiswahili).

Game Title: ${game.FileName}

1. English Description: "${game.DescriptionEn}"
2. English Compatibility Notes: "${game.CompatibilityEn}"

Respond ONLY with a valid JSON object matching this schema:
{
  "DescriptionSw": "Swahili translation of description",
  "CompatibilitySw": "Swahili translation of compatibility notes"
}
Do not include any markdown formatting, code blocks, or other text.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      let translatedData = { DescriptionSw: "", CompatibilitySw: "" };
      try {
        translatedData = JSON.parse(responseText.trim());
      } catch (err) {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          translatedData = JSON.parse(match[0]);
        } else {
          throw new Error("Invalid response format from AI");
        }
      }

      // Save to cache
      game.DescriptionSw = translatedData.DescriptionSw || `[Kiswahili]: ${game.DescriptionEn}`;
      game.CompatibilitySw = translatedData.CompatibilitySw || `[Kiswahili]: ${game.CompatibilityEn}`;

      res.json({
        success: true,
        DescriptionSw: game.DescriptionSw,
        CompatibilitySw: game.CompatibilitySw
      });
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route for Faliz AI Chat Companion specifically responding to active game context
  app.post("/api/faliz-ai/chat", async (req, res) => {
    try {
      const { messages, gameContext, language } = req.body;
      if (!gameContext) {
        return res.status(400).json({ success: false, error: "Missing game context" });
      }

      const aiKey = process.env.GEMINI_API_KEY;
      if (!aiKey) {
        // High-fidelity fallback chat message if API key is not yet set up
        const isSw = language === "sw";
        const fallbackText = isSw
          ? `Habari! Mimi ni **Faliz AI**, msaidizi wako wa kibinafsi wa michezo kwa ajili ya **${gameContext.FileName}**! 🎮\n\nSasa hivi bado sijaunganishwa na ufunguo wa Gemini API (GEMINI_API_KEY). Ili niweze kukupa vidokezo sahihi vya mchezo, setups za emulator, na cheats kwa njia ya akili mnemba (AI), tafadhali ongeza \`GEMINI_API_KEY\` katika **Settings > Secrets** panel!`
          : `Hello! I am **Faliz AI**, your personal gaming companion for **${gameContext.FileName}**! 🎮\n\nRight now, I am running in offline preview mode because the \`GEMINI_API_KEY\` is not set in the environment. To fully activate my real-time gaming guide, cheat lookup, and emulator support powered by Gemini, please configure the \`GEMINI_API_KEY\` in your app's **Settings > Secrets** panel!`;

        return res.json({
          success: true,
          response: fallbackText
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: aiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct system instruction that enforces specific game behavior only
      const targetLang = language === "sw" ? "Kiswahili (with technical terms like console, emulator, ROMs in English)" : "English";
      const systemInstruction = `You are "Faliz AI", an expert retro gaming assistant on gamesiteonline.com.
You must strictly respond ONLY about the active game described in this context:
---
Game ID: ${gameContext.GameID || "Unknown"}
Name: ${gameContext.FileName || "Unknown"}
Platform: ${gameContext.Platform || "Unknown"}
Genre: ${gameContext.Genre || "Unknown"}
Size: ${gameContext.Size || "Unknown"}
Description: ${gameContext.DescriptionEn || ""}
Compatibility Notes: ${gameContext.CompatibilityEn || ""}
---
Rules:
1. Your tone must be extremely direct, concise, and to the point. No conversational fluff, no chatty preambles, and no friendly greetings or polite outros. Give a directed, focused answer immediately.
2. Address questions specifically and only about this game (how to play, secrets, tips, emulator setups, history, or lore).
3. Critical rule: "all the feature should respond to the specific game only and not otherwise". If the user asks general questions, questions about other games, coding, math, general knowledge, or any topic outside this specific game, you MUST flatly and directly refuse to answer. Always respond with: "I am programmed to only assist you with questions directly about the active game: ${gameContext.FileName}." Never provide answers to any out-of-game questions under any circumstances.
4. Use clear, compact markdown with bullet points where necessary.
5. Answer directly in ${targetLang}.`;

      // Map chat history safely to the SDK-specified format
      const contentsPayload = messages.map((msg: any) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        success: true,
        response: response.text || ""
      });
    } catch (error: any) {
      console.error("Faliz AI Chat Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
