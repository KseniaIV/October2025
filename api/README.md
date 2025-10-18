# APISIX RSS Service

A TypeScript-based microservice compatible with Apache APISIX for fetching, parsing, and caching RSS feeds from Google News.

## Features

- 🚀 **APISIX Compatible**: Designed to work seamlessly with Apache APISIX gateway
- 📰 **RSS Feed Parsing**: Fetch and parse Google News RSS feeds
- 💾 **In-Memory Caching**: Smart caching with configurable TTL
- 🛡️ **Rate Limiting**: Built-in rate limiting per client IP
- 🌐 **CORS Support**: Cross-origin resource sharing enabled
- 📊 **Health Monitoring**: Health check endpoint for monitoring
- 🐳 **Docker Ready**: Complete Docker setup with multi-stage builds
- 📈 **Monitoring**: Prometheus metrics and Grafana dashboards

## API Endpoints

### Get RSS Feeds
```
GET /api/feeds/{feedType}
```

Available feed types:
- `top` - Top stories
- `technology` - Technology news
- `business` - Business news
- `health` - Health news
- `science` - Science news
- `sports` - Sports news

Example:
```bash
curl http://localhost:3000/api/feeds/technology
```

Response:
```json
{
  "success": true,
  "feedType": "technology",
  "count": 20,
  "data": [
    {
      "title": "Example News Title",
      "description": "News description...",
      "link": "https://example.com/news",
      "pubDate": "2024-01-15T10:30:00Z",
      "guid": "unique-id",
      "source": "Google News",
      "category": "technology"
    }
  ],
  "timestamp": "2024-01-15T10:35:00Z",
  "cached": false
}
```

### Refresh Cache
```
POST /api/feeds/refresh
Content-Type: application/json

{
  "feedType": "technology"
}
```

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": "1.0.0",
  "cacheSize": 5,
  "rateLimitEntries": 3
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development

1. **Install dependencies:**
```bash
cd api
npm install
```

2. **Build TypeScript:**
```bash
npm run build
```

3. **Start the service:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

4. **Test the service:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/feeds/top
```

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- RSS Service on port 3000
- APISIX Gateway on port 9080
- Prometheus on port 9090 (optional)
- Grafana on port 3001 (optional)

2. **Access via APISIX:**
```bash
curl http://localhost:9080/api/feeds/technology
```

### APISIX Integration

The service is designed to work with Apache APISIX. The `apisix.yml` configuration file includes:

- **Rate limiting**: 10 requests per minute per IP
- **CORS handling**: Cross-origin requests allowed
- **Health checks**: Automatic health monitoring
- **Load balancing**: Round-robin upstream selection

To deploy to APISIX:

1. Copy the service configuration:
```bash
curl -X PUT "http://127.0.0.1:9180/apisix/admin/config" \
  -H "X-API-KEY: your-admin-key" \
  -d @apisix.yml
```

2. Or use APISIX Dashboard to import the configuration.

## Configuration

### Environment Variables

- `PORT` - Service port (default: 3000)
- `HOST` - Service host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)

### Service Configuration

Edit the `CONFIG` object in `apisix-service.ts`:

```typescript
const CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // Cache TTL in milliseconds
  MAX_ITEMS_PER_FEED: 20,    // Max items per feed
  RATE_LIMIT_WINDOW: 60 * 1000, // Rate limit window
  RATE_LIMIT_MAX_REQUESTS: 10,   // Max requests per window
  CORS_ORIGINS: ['*'],       // Allowed CORS origins
};
```

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   APISIX        │    │   RSS        │    │   Google News   │
│   Gateway       │───▶│   Service    │───▶│   RSS Feeds     │
│   (Port 9080)   │    │   (Port 3000)│    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   In-Memory     │
         │              │   Cache         │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Monitoring    │
│   (Prometheus/  │
│    Grafana)     │
└─────────────────┘
```

## Monitoring

### Prometheus Metrics

The service exposes metrics compatible with Prometheus:
- Request count and duration
- Cache hit/miss ratios  
- Rate limiting statistics
- Error rates

### Health Checks

Health check endpoint provides:
- Service status
- Cache statistics
- Memory usage
- Uptime information

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Production Deployment

### Security Considerations

1. **Rate Limiting**: Adjust rate limits based on expected traffic
2. **CORS Origins**: Restrict CORS origins to specific domains
3. **SSL/TLS**: Enable HTTPS in production
4. **Authentication**: Add API key authentication if needed

### Performance Tuning

1. **Cache TTL**: Adjust based on content freshness requirements
2. **Memory Limits**: Monitor memory usage and adjust container limits
3. **Connection Pooling**: Configure HTTP agent for upstream connections

### Scaling

- **Horizontal Scaling**: Deploy multiple instances behind APISIX
- **Caching**: Consider Redis for distributed caching
- **CDN**: Use CDN for static content delivery

## Troubleshooting

### Common Issues

1. **RSS Feed Errors**: Some Google News feeds may return 404/400 errors
   - Check feed URLs in the `RSS_FEEDS` configuration
   - Monitor service logs for parsing errors

2. **Rate Limiting**: Clients receiving 429 errors
   - Adjust rate limiting configuration
   - Implement exponential backoff in clients

3. **Memory Issues**: Service consuming too much memory
   - Reduce cache TTL
   - Limit number of cached feeds
   - Monitor for memory leaks

### Logs

Service logs include:
- Request/response information
- RSS parsing errors
- Cache operations
- Rate limiting events

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review APISIX documentation
