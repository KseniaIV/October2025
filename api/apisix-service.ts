/**
 * APISIX-compatible TypeScript service for RSS feed management
 * This service provides endpoints for fetching, parsing, and managing RSS feeds
 * with caching, rate limiting, and error handling.
 */

// @ts-ignore
const Parser = require('rss-parser');
// @ts-ignore  
const { createHash } = require('crypto');

// Types for APISIX compatibility
interface APISIXRequest {
  method: string;
  headers: Record<string, string>;
  body?: string;
  uri: string;
  args?: Record<string, string>;
}

interface APISIXResponse {
  status: number;
  headers?: Record<string, string>;
  body?: string;
}

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  source: string;
  category?: string;
}

interface CachedFeed {
  data: NewsItem[];
  timestamp: number;
  ttl: number;
}

// Configuration
const CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ITEMS_PER_FEED: 20,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,
  CORS_ORIGINS: ['*'], // Configure as needed
};

// Google News RSS feeds with working URLs
const RSS_FEEDS = {
  top: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZ4ZERBU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
  business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
  health: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNR3QwTlRFU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
  science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
  sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
};

// In-memory cache and rate limiting
const cache = new Map<string, CachedFeed>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// RSS Parser instance
const parser = new Parser({
  customFields: {
    item: ['guid', 'category']
  }
});

/**
 * Generate cache key for feed
 */
function getCacheKey(feedType: string): string {
  return `rss_${feedType}`;
}

/**
 * Check rate limiting
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(clientId);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + CONFIG.RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (limit.count >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * Get client identifier from request
 */
function getClientId(req: APISIXRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const remoteAddr = req.headers['remote-addr'];
  
  return forwarded || realIp || remoteAddr || 'unknown';
}

/**
 * Parse RSS feed and normalize data
 */
async function parseFeed(url: string, category: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.slice(0, CONFIG.MAX_ITEMS_PER_FEED).map(item => ({
      title: item.title || 'No title',
      description: item.contentSnippet || item.content || 'No description',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      guid: item.guid || createHash('md5').update(item.link || '').digest('hex'),
      source: feed.title || 'Google News',
      category: category
    }));
  } catch (error) {
    console.error(`Error parsing feed ${url}:`, error);
    throw new Error(`Failed to parse RSS feed: ${error.message}`);
  }
}

/**
 * Get cached feed or fetch new data
 */
async function getFeed(feedType: string): Promise<NewsItem[]> {
  const cacheKey = getCacheKey(feedType);
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  
  // Fetch new data
  const feedUrl = RSS_FEEDS[feedType as keyof typeof RSS_FEEDS];
  if (!feedUrl) {
    throw new Error(`Unknown feed type: ${feedType}`);
  }
  
  const data = await parseFeed(feedUrl, feedType);
  
  // Cache the data
  cache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: CONFIG.CACHE_TTL
  });
  
  return data;
}

/**
 * Handle GET requests for RSS feeds
 */
async function handleGetFeed(req: APISIXRequest): Promise<APISIXResponse> {
  const clientId = getClientId(req);
  
  // Rate limiting
  if (!checkRateLimit(clientId)) {
    return {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      },
      body: JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      })
    };
  }
  
  try {
    const pathParts = req.uri.split('/');
    const feedType = pathParts[pathParts.length - 1] || 'top';
    
    const data = await getFeed(feedType);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Access-Control-Allow-Origin': CONFIG.CORS_ORIGINS.join(','),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        feedType,
        count: data.length,
        data,
        timestamp: new Date().toISOString(),
        cached: cache.has(getCacheKey(feedType))
      })
    };
  } catch (error) {
    console.error('Error handling GET request:', error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function handleOptions(): APISIXResponse {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': CONFIG.CORS_ORIGINS.join(','),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  };
}

/**
 * Handle POST requests to refresh cache
 */
async function handleRefreshCache(req: APISIXRequest): Promise<APISIXResponse> {
  const clientId = getClientId(req);
  
  // Rate limiting
  if (!checkRateLimit(clientId)) {
    return {
      status: 429,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Rate limit exceeded'
      })
    };
  }
  
  try {
    let body: { feedType?: string } = {};
    if (req.body) {
      body = JSON.parse(req.body);
    }
    
    const feedType = body.feedType || 'top';
    
    // Clear cache for specific feed
    const cacheKey = getCacheKey(feedType);
    cache.delete(cacheKey);
    
    // Fetch fresh data
    const data = await getFeed(feedType);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': CONFIG.CORS_ORIGINS.join(',')
      },
      body: JSON.stringify({
        success: true,
        message: 'Cache refreshed successfully',
        feedType,
        count: data.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}

/**
 * Main APISIX handler function
 */
export async function handler(req: APISIXRequest): Promise<APISIXResponse> {
  console.log(`[APISIX Service] ${req.method} ${req.uri}`);
  
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetFeed(req);
      case 'POST':
        if (req.uri.includes('/refresh')) {
          return await handleRefreshCache(req);
        }
        break;
      case 'OPTIONS':
        return handleOptions();
    }
    
    return {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST', 'OPTIONS']
      })
    };
  } catch (error) {
    console.error('Unhandled error in APISIX handler:', error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      })
    };
  }
}

/**
 * Health check endpoint
 */
export function healthCheck(): APISIXResponse {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      cacheSize: cache.size,
      rateLimitEntries: rateLimitMap.size
    })
  };
}

// Export for APISIX compatibility
export default handler;
