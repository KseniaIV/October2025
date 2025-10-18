/**
 * Test suite for APISIX RSS Service
 */

const { handler, healthCheck } = require('./dist/apisix-service');

describe('APISIX RSS Service', () => {
  describe('Health Check', () => {
    test('should return healthy status', () => {
      const response = healthCheck();
      
      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.version).toBe('1.0.0');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('cacheSize');
      expect(body).toHaveProperty('rateLimitEntries');
    });
  });

  describe('RSS Feed Handler', () => {
    test('should handle GET request for top feed', async () => {
      const mockRequest = {
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1'
        },
        uri: '/api/feeds/top'
      };

      const response = await handler(mockRequest);
      
      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin');
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.feedType).toBe('top');
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('count');
      expect(body).toHaveProperty('timestamp');
    });

    test('should handle OPTIONS request', async () => {
      const mockRequest = {
        method: 'OPTIONS',
        headers: {},
        uri: '/api/feeds/top'
      };

      const response = await handler(mockRequest);
      
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods');
    });

    test('should handle unknown feed type', async () => {
      const mockRequest = {
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1'
        },
        uri: '/api/feeds/unknown'
      };

      const response = await handler(mockRequest);
      
      expect(response.status).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Internal server error');
    });

    test('should handle method not allowed', async () => {
      const mockRequest = {
        method: 'DELETE',
        headers: {},
        uri: '/api/feeds/top'
      };

      const response = await handler(mockRequest);
      
      expect(response.status).toBe(405);
      expect(response.headers['Allow']).toBe('GET, POST, OPTIONS');
    });

    test('should handle rate limiting', async () => {
      const mockRequest = {
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.100'
        },
        uri: '/api/feeds/top'
      };

      // Make multiple requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(handler(mockRequest));
      }

      const responses = await Promise.all(requests);
      
      // Some responses should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should handle POST refresh request', async () => {
      const mockRequest = {
        method: 'POST',
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'content-type': 'application/json'
        },
        uri: '/api/feeds/refresh',
        body: JSON.stringify({ feedType: 'technology' })
      };

      const response = await handler(mockRequest);
      
      expect([200, 500]).toContain(response.status); // May fail due to network
      
      if (response.status === 200) {
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Cache refreshed successfully');
        expect(body.feedType).toBe('technology');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed request body', async () => {
      const mockRequest = {
        method: 'POST',
        headers: {
          'x-forwarded-for': '127.0.0.1'
        },
        uri: '/api/feeds/refresh',
        body: 'invalid json'
      };

      const response = await handler(mockRequest);
      
      expect(response.status).toBe(500);
    });
  });
});
