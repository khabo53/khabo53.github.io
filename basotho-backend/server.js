
// server.js
/*import express from "express";
import cors from "cors";
import { db, auth } from "./firebaseAdmin.js"; // Make sure this file exists and exports db & auth
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import cron from "node-cron";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Cache variables
//let cachedScholarships = null;
const CACHE_FILE = "./cache.json";
// 🔹 Load cache file if exists
let cache = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))
  : { scholarships: [], fellowships: [], jobs: [] };

let lastFetchTime = cache.lastUpdated || null;

function getTodayFormatted() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("en-US", { month: "short" }); // 'Oct'
  const year = today.getFullYear();

  return `${month} ${day}, ${year}`;
}

// ✅ Helper: Save cache to disk
function saveCache() {
  cache.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ✅ Helper: Keep only posts from the last 30 days
function cleanupOldEntries() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  for (const key of ["scholarships", "fellowships", "jobs"]) {
    cache[key] = cache[key].filter((item) => {
      if (!item.date) return true;
      const dateObj = new Date(item.date);
      return dateObj >= cutoff;
    });
  }
}
// 📌 Helper function for safe scraping
async function safeFetch(url, retries = 3, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} failed for ${url}:`, err.message);
      if (attempt < retries) await new Promise(res => setTimeout(res, delay));
      else throw err;
    }
  }
}
// Helper: Convert relative → absolute URL
function makeAbsoluteUrl(base, href) {
  if (!href) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

// Helper: Extract the real external link inside the post
async function getOriginalLink(articleUrl) {
  try {
    const html = await safeFetch(articleUrl);
    const $ = cheerio.load(html);

    // Find first outbound external link
    let link =
      $(".entry-content a[href^='http']").not("[href*='opportunitiesforyouth']").first().attr("href") ||
      $("a.apply, a.button, a.btn").first().attr("href") ||
      $("a[href^='http']").not("[href*='opportunitiesforyouth']").first().attr("href");

    return link || articleUrl;
  } catch (err) {
    console.error("❌ Failed to extract original link:", err.message);
    return articleUrl;
  }
}

// ✅ Scraper function
/*async function scrapeOpportunities() {
  console.log("🔍 Running scraper at", new Date().toLocaleString());
  const todayFormatted = getTodayFormatted();

  const urls = [
    { type: "fellowships", url: "https://opportunitiesforyouth.org/category/jobs/fellowships/" },
    { type: "jobs", url: "https://opportunitiesforyouth.org/category/jobs/" },
    { type: "scholarships", url: "https://opportunitiesforyouth.org/category/scholarships/" },
  ];

  const results = {};

  for (const { type, url } of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const html = await response.text();
      const $ = cheerio.load(html);

      const newItems = [];

  $("article").each((_, el) => {
  const title = $(el).find("h3.entry-title a").text().trim();
  const link = $(el).find("h3.entry-title a").attr("href");
  const date = $(el).find("time.entry-date").text().trim();
  const image = $(el).find("img").attr("src");

  if (!title && !image) return;

const alreadyExists = cache[type]?.some((item) => item.link === link || item.image === image);

if (!alreadyExists) {
  newItems.push({
    title: title || "Image-based Opportunity",
    link: link || image,
    date: date || todayFormatted,
    image: image || null,
    type,
    scrapedAt: new Date().toISOString(),
  });
 }
});


      if (!cache[type]) cache[type] = [];
      cache[type].push(...newItems);

      results[type] = cache[type];
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
      results[type] = cache[type] || [];
    }
  }

  cleanupOldEntries();
  saveCache();

  lastFetchTime = new Date().toISOString();
  console.log("✅ Scraper finished successfully.");

  return { success: true, lastUpdated: lastFetchTime, data: cache };
}
*/
// Scraper function
/*async function scrapeOpportunities() {
  console.log("🔍 Running scraper at", new Date().toLocaleString());
  const todayFormatted = getTodayFormatted();

  const urls = [
    { type: "fellowships", url: "https://opportunitiesforyouth.org/category/jobs/fellowships/" },
    { type: "jobs", url: "https://opportunitiesforyouth.org/category/jobs/" },
    { type: "scholarships", url: "https://opportunitiesforyouth.org/category/scholarships/" },
  ];

  const results = {};

  for (const { type, url } of urls) {
    try {
      const html = await safeFetch(url);
      const $ = cheerio.load(html);

      const articles = $("article").toArray();

      const newItems = await Promise.all(
        articles.map(async (el) => {
          const title = $(el).find("h3.entry-title a").text().trim();

          const rawLink = $(el).find("h3.entry-title a").attr("href");
          const postUrl = makeAbsoluteUrl(url, rawLink);

          const date = $(el).find("time.entry-date").text().trim();
          const image = makeAbsoluteUrl(url, $(el).find("img").attr("src"));

          if (!title && !image) return null;

          // Fetch REAL external link
          const originalLink = await getOriginalLink(postUrl);

          const alreadyExists = cache[type]?.some((item) => item.link === postUrl);

          if (alreadyExists) return null;

          return {
            title: title || "Image-based Opportunity",
            link: postUrl,            // WordPress post URL
            originalLink,             // TRUE source URL!
            date: date || todayFormatted,
            image: image || null,
            type,
            scrapedAt: new Date().toISOString(),
          };
        })
      );

      if (!cache[type]) cache[type] = [];
      cache[type].push(...newItems.filter(Boolean));

      results[type] = cache[type];
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
      results[type] = cache[type] || [];
    }
  }

  cleanupOldEntries();
  saveCache();
  lastFetchTime = new Date().toISOString();

  console.log("✅ Scraper finished successfully.");

  return { success: true, lastUpdated: lastFetchTime, data: cache };
}

// Health check route (helps you test if backend is running)
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// Registration route
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;

  console.log("📥 Incoming Registration Request:", req.body);

  // Basic validation
  if (!email || !password || !name) {
    console.error("❌ Missing required fields");
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    // Create Firebase user
    const user = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    console.log("✅ Firebase user created:", user.uid);

    // Store additional user info in Firestore
    await db.collection("users").doc(user.uid).set({
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ User saved to Firestore");

    res.status(201).json({ message: "User created successfully", uid: user.uid });
  } catch (err) {
    console.error("🔥 Registration error:", err.message);
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/login", async (req, res) => {
    const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    // Verify token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.json({
      message: "Login successful",
      uid,
      user: userDoc.data(),
    });
  } catch (err) {
    console.error("🔥 Login error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});
// 📌 Scholarship / Opportunity Scraper
// 🔁 API Endpoint: Get cached opportunities
app.get("/api/scholarships", async (req, res) => {
  try {
    if (
      !cache.scholarships.length &&
      !cache.fellowships.length &&
      !cache.jobs.length
    ) {
      await scrapeOpportunities();
    }

    // ✅ Sort by date descending (newest first)
    const sortByDate = (arr) =>
      arr.sort((a, b) => new Date(b.date) - new Date(a.date));

    const sortedData = {
      scholarships: sortByDate([...cache.scholarships]),
      fellowships: sortByDate([...cache.fellowships]),
      jobs: sortByDate([...cache.jobs]),
    };

    res.json({
      success: true,
      lastUpdated: lastFetchTime,
      data: sortedData,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


// 📌 Refresh cache manually
app.post("/api/scholarships/refresh", async (req, res) => {
  try {
    const result = await scrapeOpportunities();
    res.json({ message: "🔄 Cache refreshed", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh cache" });
  }
});
// 🕛 Auto-refresh daily at midnight (Lesotho time)
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Auto-refreshing cached opportunities...");
  await scrapeOpportunities();
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
*/
// server.js
import express from "express";
import cors from "cors";
import { db, auth } from "./firebaseAdmin.js"; // Make sure this file exists and exports db & auth
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import cron from "node-cron";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Cache variables
const CACHE_FILE = "./cache.json";
let cache = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))
  : { scholarships: [], fellowships: [], jobs: [], lastUpdated: null };

let lastFetchTime = cache.lastUpdated || null;

function getTodayFormatted() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("en-US", { month: "short" }); // 'Oct'
  const year = today.getFullYear();

  return `${month} ${day}, ${year}`;
}

// ✅ Helper: Save cache to disk
function saveCache() {
  cache.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ✅ Helper: Keep only posts from the last 30 days
function cleanupOldEntries() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  for (const key of ["scholarships", "fellowships", "jobs"]) {
    cache[key] = (cache[key] || []).filter((item) => {
      if (!item.date) return true;
      const dateObj = new Date(item.date);
      return dateObj >= cutoff;
    });
  }
}

// Helper: Convert relative → absolute URL
function makeAbsoluteUrl(base, href) {
  if (!href) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

/**
 * safeFetch(url, retries = 3, delay = 3000)
 * - validates url
 * - attaches basic browser-like headers
 * - retries failed requests (including timeouts)
 */
async function safeFetch(url, retries = 3, delay = 3000) {
  if (!url) throw new Error("safeFetch called with empty URL");
  // ensure string
  if (typeof url !== "string") url = String(url);

  const headers = {
    // Lightweight browser-like headers to reduce bot-blocking
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      return text;
    } catch (err) {
      // Distinguish abort from other errors
      const msg = err?.name === "AbortError" ? "The user aborted a request." : err.message;
      console.error(`⚠️ Attempt ${attempt} failed for ${url}:`, msg);

      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      // after final attempt, rethrow so caller can handle
      throw err;
    }
  }
}

// Helper: Extract the real external link inside the post page
async function getOriginalLink(articleUrl) {
  if (!articleUrl) return null;

  try {
    const html = await safeFetch(articleUrl, 2, 1500);
    const $ = cheerio.load(html);

    const siteDomain = "opportunitiesforyouth.org";

    // 1️⃣ External links in main content
    const externalInEntry = $(".entry-content a[href^='http']")
      .toArray()
      .map((el) => $(el).attr("href"))
      .filter(Boolean)
      .find((href) => !href.includes(siteDomain));

    if (externalInEntry) {
      console.log("🔗 External link found in entry:", externalInEntry);
      return externalInEntry;
    }

    // 2️⃣ Buttons (apply, btn, button)
    const buttonHref = $("a.apply, a.button, a.btn")
      .toArray()
      .map((el) => $(el).attr("href"))
      .filter(Boolean)
      .find((href) => href.startsWith("http") && !href.includes(siteDomain));

    if (buttonHref) {
      console.log("🔗 Button link found:", buttonHref);
      return buttonHref;
    }

    // 3️⃣ PDF or doc links
    const docLink = $(".entry-content a[href$='.pdf'], .entry-content a[href$='.doc'], .entry-content a[href$='.docx']")
      .toArray()
      .map((el) => $(el).attr("href"))
      .find(Boolean);

    if (docLink) {
      console.log("🔗 Document link found:", docLink);
      return makeAbsoluteUrl(articleUrl, docLink);
    }

    // 4️⃣ Any other external link
    const anyExternal = $("a[href^='http']")
      .toArray()
      .map((el) => $(el).attr("href"))
      .filter(Boolean)
      .find((href) => !href.includes(siteDomain));

    if (anyExternal) {
      console.log("🔗 Fallback external link:", anyExternal);
      return anyExternal;
    }

    // 5️⃣ No external link found
    console.log("⚠️ No external link found for", articleUrl);
    return null;

  } catch (err) {
    console.error("❌ Failed to extract original link:", err?.message || err);
    return null;
  }
}

/**
 * Simple utility to process an array sequentially with a delay between items.
 * This avoids large concurrent requests that can trigger Cloudflare.
 */
async function processSequentialWithDelay(items, handler, delayMs = 300) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const r = await handler(items[i], i);
      results.push(r);
    } catch (err) {
      results.push(null);
    }
    // Delay between items to be polite
    if (delayMs) await new Promise((res) => setTimeout(res, delayMs));
  }
  return results;
}

// ✅ Scraper function
async function scrapeOpportunities() {
  console.log("🔍 Running scraper at", new Date().toLocaleString());
  const todayFormatted = getTodayFormatted();

  const urls = [
    { type: "fellowships", url: "https://opportunitiesforyouth.org/category/jobs/fellowships/" },
    { type: "jobs", url: "https://opportunitiesforyouth.org/category/jobs/" },
    { type: "scholarships", url: "https://opportunitiesforyouth.org/category/scholarships/" },
  ];

  for (const { type, url } of urls) {
    try {
      const html = await safeFetch(url);
      const $ = cheerio.load(html);

      const articles = $("article").toArray();

      const newItems = [];

      for (const el of articles) {
        try {
          const title = $(el).find("h3.entry-title a").text().trim();
          const rawLink = $(el).find("h3.entry-title a").attr("href");
          const postUrl = makeAbsoluteUrl(url, rawLink);
          const date = $(el).find("time.entry-date").text().trim() || todayFormatted;
          const image = makeAbsoluteUrl(url, $(el).find("img").attr("src"));

          if (!title && !image) continue;

          // Check for duplicates
          const alreadyExists = cache[type]?.some(
            (item) => item.originalLink === postUrl || item.link === postUrl
          );
          if (alreadyExists) continue;

          // Fetch the original external link
          const originalRaw = await getOriginalLink(postUrl);
          const originalLink = originalRaw ? makeAbsoluteUrl(postUrl, originalRaw) : null;

          const finalLink = originalLink || postUrl;

          newItems.push({
            title: title || "Image-based Opportunity",
            link: postUrl,
            originalLink,
            date,
            image: image || null,
            type,
            scrapedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Error parsing article:", err?.message || err);
        }
      }

      if (!cache[type]) cache[type] = [];

      // Avoid duplicates when merging
      const merged = [...cache[type], ...newItems].filter(
        (v, i, a) =>
          a.findIndex((item) => (item.originalLink || item.link) === (v.originalLink || v.link)) === i
      );

      cache[type] = merged;

    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err?.message || err);
    }
  }

  cleanupOldEntries();
  saveCache();

  lastFetchTime = new Date().toISOString();
  console.log("✅ Scraper finished successfully.");

  return { success: true, lastUpdated: lastFetchTime, data: cache };
}

// Health check route (helps you test if backend is running)
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// Registration route
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;

  console.log("📥 Incoming Registration Request:", req.body);

  // Basic validation
  if (!email || !password || !name) {
    console.error("❌ Missing required fields");
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    // Create Firebase user
    const user = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    console.log("✅ Firebase user created:", user.uid);

    // Store additional user info in Firestore
    await db.collection("users").doc(user.uid).set({
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ User saved to Firestore");

    res.status(201).json({ message: "User created successfully", uid: user.uid });
  } catch (err) {
    console.error("🔥 Registration error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    // Verify token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.json({
      message: "Login successful",
      uid,
      user: userDoc.data(),
    });
  } catch (err) {
    console.error("🔥 Login error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// 📌 Scholarship / Opportunity Scraper
// 🔁 API Endpoint: Get cached opportunities
app.get("/api/scholarships", async (req, res) => {
  try {
    if (
      (!cache.scholarships || cache.scholarships.length === 0) &&
      (!cache.fellowships || cache.fellowships.length === 0) &&
      (!cache.jobs || cache.jobs.length === 0)
    ) {
      await scrapeOpportunities();
    }

    // ✅ Sort by date descending (newest first)
    const sortByDate = (arr) =>
      arr.sort((a, b) => new Date(b.date) - new Date(a.date));

    const sortedData = {
      scholarships: sortByDate([... (cache.scholarships || []) ]),
      fellowships: sortByDate([... (cache.fellowships || []) ]),
      jobs: sortByDate([... (cache.jobs || []) ]),
    };

    res.json({
      success: true,
      lastUpdated: lastFetchTime,
      data: sortedData,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// 📌 Refresh cache manually
app.post("/api/scholarships/refresh", async (req, res) => {
  try {
    const result = await scrapeOpportunities();
    res.json({ message: "🔄 Cache refreshed", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh cache", details: error?.message || error });
  }
});

// 🕛 Auto-refresh daily at midnight (Lesotho time)
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Auto-refreshing cached opportunities...");
  try {
    await scrapeOpportunities();
  } catch (err) {
    console.error("Auto-refresh failed:", err?.message || err);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
