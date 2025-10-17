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

## Setup

1. Clone and run locally:
   ```bash
   git clone https://github.com/yourusername/repo-name.git
   python -m http.server 8000
   ```

2. Deploy to GitHub Pages:
   - Push to GitHub
   - Enable Pages in repo settings
   - Auto-deploys on push to main branch

## Files

- `index.html` - Main page
- `styles.css` - Styling  
- `script.js` - News fetching logic
- `config.js` - Settings
- `manifest.json` - PWA config
- `sw.js` - Service worker

## Notes

Uses RSS2JSON API to convert feeds. Falls back to demo content if RSS feeds are blocked by CORS.