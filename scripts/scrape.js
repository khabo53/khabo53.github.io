// scripts/scrape.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper: Add delay to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Firebase Admin SDK
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Running in GitHub Actions
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Running locally - read the JSON file
  try {
    const keyPath = join(__dirname, '../service-account-key.json');
    console.log('📁 Looking for key at:', keyPath);
    
    const keyContent = readFileSync(keyPath, 'utf8');
    serviceAccount = JSON.parse(keyContent);
    console.log('✅ Service account key loaded successfully');
  } catch (e) {
    console.error('❌ Could not find service-account-key.json');
    console.error('   Please make sure the file is in the root folder:');
    console.error('   ./service-account-key.json');
    console.error('   Error:', e.message);
    process.exit(1);
  }
}

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
}

const db = admin.firestore();

// Test Firestore connection
async function testConnection() {
  try {
    await db.collection('opportunities').limit(1).get();
    console.log('✅ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    return false;
  }
}

// Scrape a single source URL
async function scrapeSource(url) {
  const opportunities = [];
  
  try {
    // Add delay to avoid rate limiting
    await delay(2000 + Math.random() * 2000);
    
    console.log(`   🌐 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    // Try multiple selectors for finding post/article elements
    const selectors = [
      'article', 
      '.blog-item', 
      '.post-item', 
      '.type-post', 
      '.entry', 
      'main article', 
      '.content article',
      '.post',
      '.listing-item'
    ];
    
    let articles = $();
    let usedSelector = '';
    
    for (const selector of selectors) {
      const found = $(selector);
      if (found.length > 0) {
        articles = found;
        usedSelector = selector;
        console.log(`   🎯 Using selector: ${selector} (${found.length} items)`);
        break;
      }
    }
    
    // If no articles found, try a fallback approach
    if (articles.length === 0) {
      console.log('   🔍 No articles found with standard selectors, using fallback...');
      
      // Look for any links that appear to be post titles
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        // Check if this looks like a legitimate opportunity link
        const isValidLink = href && 
          !href.includes('#') &&
          !href.includes('javascript') &&
          !href.includes('mailto') &&
          !href.includes('/category/') &&
          !href.includes('/tag/') &&
          !href.includes('/page/');
        
        const hasGoodTitle = text.length > 20 && text.length < 200;
        const hasDateInUrl = href && (href.includes('/20') || href.match(/\/[0-9]{4}\//));
        
        if (isValidLink && hasGoodTitle && hasDateInUrl) {
          let category = 'other';
          if (url.includes('fellowship')) category = 'fellowship';
          else if (url.includes('scholarship')) category = 'scholarship';
          else if (url.includes('job')) category = 'job';
          
          opportunities.push({
            title: text.slice(0, 200),
            link: href,
            originalLink: href,
            image: '',
            date: '',
            description: '',
            category: category,
            source: url,
            scrapedAt: new Date().toISOString()
          });
        }
      });
      
      // Remove duplicates from fallback
      const seenLinks = new Set();
      const uniqueFallback = [];
      for (const opp of opportunities) {
        if (!seenLinks.has(opp.link)) {
          seenLinks.add(opp.link);
          uniqueFallback.push(opp);
        }
      }
      
      console.log(`   📊 Found ${uniqueFallback.length} opportunities via fallback`);
      return uniqueFallback.slice(0, 50);
    }
    
    // Parse each article found with the selector
    articles.each((index, element) => {
      // Try to find title and link
      let title = $(element).find('h2 a, h3 a, .entry-title a, .post-title a, .title a').first().text().trim();
      let link = $(element).find('h2 a, h3 a, .entry-title a, .post-title a, .title a').first().attr('href');
      
      // If not found in headings, try the first link
      if (!link) {
        link = $(element).find('a').first().attr('href');
      }
      if (!title && link) {
        title = $(element).find('a').first().text().trim();
      }
      
      // Skip if missing essential data
      if (!title || !link) return;
      if (title.length < 10) return;
      if (link === url || link.includes('#comments')) return;
      
      // Get date if available
      let date = $(element).find('.date, .post-date, .entry-date, time, .published, .meta-date').first().text().trim();
      if (date) {
        date = date.replace(/[^\w\s\-/]/g, '').trim();
      }
      
      // Get description if available
      let description = $(element).find('.description, .excerpt, .summary, .entry-content p').first().text().trim();
      if (description) {
        description = description.slice(0, 500);
      }
      
      // Get image if available
      let image = $(element).find('img').first().attr('src');
      if (image && !image.startsWith('http')) {
        try {
          const urlObj = new URL(url);
          image = `${urlObj.protocol}//${urlObj.host}${image}`;
        } catch (e) {
          image = '';
        }
      }
      
      // Determine category based on URL or content
      let category = 'other';
      const urlLower = url.toLowerCase();
      const titleLower = title.toLowerCase();
      
      if (urlLower.includes('fellowship') || titleLower.includes('fellowship')) category = 'fellowship';
      else if (urlLower.includes('scholarship') || titleLower.includes('scholarship')) category = 'scholarship';
      else if (urlLower.includes('job') || titleLower.includes('job') || titleLower.includes('vacancy')) category = 'job';
      else if (titleLower.includes('internship')) category = 'internship';
      
      // Resolve relative links
      if (link && link.startsWith('/')) {
        try {
          const urlObj = new URL(url);
          link = `${urlObj.protocol}//${urlObj.host}${link}`;
        } catch (e) {}
      }
      
      opportunities.push({
        title: title.slice(0, 200),
        link: link,
        originalLink: link,
        image: image || '',
        date: date || '',
        description: description || '',
        category: category,
        source: url,
        scrapedAt: new Date().toISOString()
      });
    });
    
    // Remove duplicates by link
    const seenLinks = new Set();
    const unique = [];
    for (const opp of opportunities) {
      if (!seenLinks.has(opp.link)) {
        seenLinks.add(opp.link);
        unique.push(opp);
      }
    }
    
    console.log(`   📊 Found ${unique.length} unique opportunities`);
    return unique.slice(0, 50);
    
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`   ⚠️ Rate limited (429) - Try again later or increase delays`);
    } else if (error.response?.status === 404) {
      console.error(`   ❌ Page not found (404) - URL may be invalid`);
    } else {
      console.error(`   ❌ Error:`, error.message);
    }
    return [];
  }
}

// Save opportunity to Firestore
async function saveToFirestore(opportunity, sourceName) {
  try {
    // Check if opportunity with same link already exists
    const existing = await db.collection('opportunities')
      .where('link', '==', opportunity.link)
      .limit(1)
      .get();
    
    if (!existing.empty) {
      return false; // Already exists
    }
    
    // Add new opportunity
    await db.collection('opportunities').add({
      title: opportunity.title,
      link: opportunity.link,
      originalLink: opportunity.originalLink,
      image: opportunity.image,
      date: opportunity.date,
      description: opportunity.description,
      category: opportunity.category,
      source: opportunity.source,
      scrapedAt: opportunity.scrapedAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`   ✅ Added: ${opportunity.title.slice(0, 60)}...`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error saving:`, error.message);
    return false;
  }
}

// Main scraping function
async function scrapeOpportunities() {
  console.log('\n🕷️ Starting scraper at:', new Date().toISOString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Test Firestore connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot proceed without Firestore connection');
    process.exit(1);
  }
  
  let totalScraped = 0;
  let totalAdded = 0;
  
  // Sources to scrape - using category pages instead of search URLs
  const sources = [
    { name: 'fellowships', url: 'https://opportunitiesforyouth.org/category/fellowship/' },
    // Try these additional URLs - uncomment if they work
     { name: 'scholarships', url: 'https://opportunitiesforyouth.org/scholarships/' },
     { name: 'jobs', url: 'https://opportunitiesforyouth.org/jobs/' },
  ];
  
  for (const source of sources) {
    console.log(`\n📡 Scraping from: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    try {
      const opportunities = await scrapeSource(source.url);
      totalScraped += opportunities.length;
      
      console.log(`   📥 Processing ${opportunities.length} opportunities...`);
      
      for (const opp of opportunities) {
        const added = await saveToFirestore(opp, source.name);
        if (added) totalAdded++;
        
        // Small delay between saves to avoid overwhelming Firestore
        await delay(100);
      }
    } catch (error) {
      console.error(`   ❌ Error scraping ${source.name}:`, error.message);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Scraping complete!`);
  console.log(`   📊 Total opportunities found: ${totalScraped}`);
  console.log(`   🆕 New opportunities added: ${totalAdded}`);
  console.log(`   📝 Already existed: ${totalScraped - totalAdded}`);
}

// Run the scraper
scrapeOpportunities()
  .then(() => {
    console.log('\n🏁 Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });