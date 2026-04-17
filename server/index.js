import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { callMcpTool } from "./mcpClient.js";
import { cachedFetch, getCacheStats } from "./cache.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// --- CORS ---
// In production, restrict to your actual frontend URL via ALLOWED_ORIGIN env var
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({
  origin: NODE_ENV === "production" && ALLOWED_ORIGIN !== "*"
    ? ALLOWED_ORIGIN
    : "*",
  methods: ["GET"],
}));

app.use(express.json());

// --- Rate Limiting ---
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// --- Helper: parse safe integer from query string ---
function safeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

// --- API Routes ---

// GET /api/tech-news
app.get("/api/tech-news", async (req, res) => {
  try {
    const category = req.query.category || "all";
    const maxResults = safeInt(req.query.max, 20);
    const cacheKey = `tech-news:${category}:${maxResults}`;

    const data = await cachedFetch(cacheKey, () =>
      callMcpTool("fetch_tech_news", { category, maxResults })
    );

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("Tech news error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch tech news" });
  }
});

// GET /api/cloud-updates
app.get("/api/cloud-updates", async (req, res) => {
  try {
    const provider = req.query.provider || "all";
    const maxResults = safeInt(req.query.max, 15);
    const cacheKey = `cloud-updates:${provider}:${maxResults}`;

    const data = await cachedFetch(cacheKey, () =>
      callMcpTool("fetch_cloud_updates", { provider, maxResults })
    );

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("Cloud updates error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch cloud updates" });
  }
});

// GET /api/search
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Query parameter 'q' must be at least 2 characters" });
    }

    const language = req.query.lang || "en";
    const maxResults = safeInt(req.query.max, 10);
    const cacheKey = `search:${query.trim().toLowerCase()}:${language}:${maxResults}`;

    const data = await cachedFetch(
      cacheKey,
      () => callMcpTool("search_news", { query: query.trim(), language, maxResults }),
      600 // 10-minute cache for search results
    );

    res.json({ success: true, data, count: data.length, query });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ success: false, error: "Failed to search news" });
  }
});

// GET /api/trending
app.get("/api/trending", async (req, res) => {
  try {
    const limit = safeInt(req.query.limit, 10);
    const cacheKey = `trending:${limit}`;

    const data = await cachedFetch(
      cacheKey,
      () => callMcpTool("get_trending", { limit }),
      1800 // 30-minute cache
    );

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("Trending error:", error.message);
    res.status(500).json({ success: false, error: "Failed to get trending topics" });
  }
});

// GET /api/recommendations
app.get("/api/recommendations", async (req, res) => {
  try {
    const limit = safeInt(req.query.limit, 6);
    const cacheKey = `recommendations:${limit}`;

    const data = await cachedFetch(
      cacheKey,
      () => callMcpTool("get_recommendations", { limit }),
      1800 // 30-minute cache
    );

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("Recommendations error:", error.message);
    res.status(500).json({ success: false, error: "Failed to get recommendations" });
  }
});

// GET /api/health
app.get("/api/health", (req, res) => {
  const stats = getCacheStats();
  res.json({
    status: "ok",
    version: "1.0.0",
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
    cache: stats,
  });
});

// 404 catch-all for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `Unknown API route: ${req.path}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Tech Pulse API running on http://localhost:${PORT}`);
  console.log(`   📡 Tech News:       GET /api/tech-news?category=all&max=20`);
  console.log(`   ☁️  Cloud Updates:   GET /api/cloud-updates?provider=all&max=15`);
  console.log(`   🔍 Search:          GET /api/search?q=kubernetes&max=10`);
  console.log(`   📈 Trending:        GET /api/trending?limit=10`);
  console.log(`   🎓 Recommendations: GET /api/recommendations?limit=6`);
  console.log(`   💚 Health:          GET /api/health\n`);
});
