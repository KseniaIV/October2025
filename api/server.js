#!/usr/bin/env node

/**
 * Standalone server runner for the APISIX TypeScript service
 * This allows running the service independently for testing or development
 */

const http = require('http');
const url = require('url');
const { handler, healthCheck } = require('./dist/apisix-service');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Convert Node.js request to APISIX request format
function nodeToAPISIXRequest(req) {
  const parsedUrl = url.parse(req.url, true);
  
  return {
    method: req.method,
    headers: req.headers,
    uri: parsedUrl.pathname,
    args: parsedUrl.query,
    body: undefined // Will be set after reading body
  };
}

// Convert APISIX response to Node.js response
function sendAPISIXResponse(res, apisixResponse) {
  // Set status code
  res.statusCode = apisixResponse.status;
  
  // Set headers
  if (apisixResponse.headers) {
    Object.entries(apisixResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }
  
  // Send body
  res.end(apisixResponse.body || '');
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    // Handle health check endpoint
    if (req.url === '/api/health' && req.method === 'GET') {
      const healthResponse = healthCheck();
      sendAPISIXResponse(res, healthResponse);
      return;
    }
    
    // Convert request
    const apisixReq = nodeToAPISIXRequest(req);
    
    // Read request body if present
    if (req.method === 'POST' || req.method === 'PUT') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        apisixReq.body = Buffer.concat(chunks).toString();
        
        try {
          const apisixRes = await handler(apisixReq);
          sendAPISIXResponse(res, apisixRes);
        } catch (error) {
          console.error('Handler error:', error);
          sendAPISIXResponse(res, {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
          });
        }
      });
    } else {
      // Handle GET and other methods without body
      try {
        const apisixRes = await handler(apisixReq);
        sendAPISIXResponse(res, apisixRes);
      } catch (error) {
        console.error('Handler error:', error);
        sendAPISIXResponse(res, {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal server error' })
        });
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`🚀 APISIX RSS Service running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`📰 RSS feeds: http://${HOST}:${PORT}/api/feeds/{feedType}`);
  console.log(`🔄 Refresh cache: POST http://${HOST}:${PORT}/api/feeds/refresh`);
  console.log('\nAvailable feed types: top, technology, business, health, science, sports');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
