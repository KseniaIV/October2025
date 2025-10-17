# Google News RSS Reader

Web app that displays news from Google News RSS feeds. Built with HTML, CSS, and JavaScript.

## Features

- Browse news by category (Tech, Business, Sports, etc.)
- Search for specific topics
- Responsive design
- Works offline

## Live Demo

[Github Pages](https://kseniaiv.github.io/October2025/)

## Usage

- Click category tabs to filter news
- Use search bar for specific topics
- Click articles to read more
- Refresh button for latest updates

## Tech Stack

- HTML/CSS/JavaScript
- RSS2JSON API
- Font Awesome icons
- GitHub Pages

## Test

Clone and run locally:
   ```bash
   python -m http.server 8000
   ```



## Getting Real Google News

The app includes a **custom RSS parser** that converts RSS XML to JSON directly in the browser! 

CORS blocks direct access to Google News, but we work around it with:

1. **Custom RSS Parser** - Pure JavaScript RSS-to-JSON converter
2. **CORS Proxies** - Public services that bypass CORS restrictions  
3. **RSS2JSON API** - Optional external service
4. **Demo Content** - Cyberpunk-themed fallback

### To get real Google News:

**Option 1: Use built-in CORS proxies (default)**
- No setup needed! App automatically tries multiple proxy services
- Works out of the box for most users

**Option 2: Add RSS2JSON API key (optional)**
- Get free key from [rss2json.com](https://rss2json.com) for more reliability
- Add your key to `script.js`: `this.rss2jsonApiKey = 'YOUR_KEY';`