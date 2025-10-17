# Google News RSS Reader

Cyberpunk-themed web app that displays news from pre-generated JSON files. Uses Node.js to fetch RSS feeds and convert them to static JSON data.

## Features

- Browse news by category (Tech, Business, Sports, etc.)
- Search across all categories
- Cyberpunk/solarpunk gothic design
- Static file approach (no CORS issues!)
- Works offline

## Live Demo

[Github Pages](https://kseniaiv.github.io/October2025/)

## Usage

- Click category tabs to filter news
- Use search bar to find articles across all categories
- Click articles to read more
- Refresh button reloads current category

## Tech Stack

- Frontend: HTML/CSS/JavaScript (cyberpunk theme)
- Backend: Node.js + rss-parser
- Data: Static JSON files
- Deployment: GitHub Pages

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate news data:**
   ```bash
   npm run fetch-news
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

## How It Works

1. **RSS to JSON**: Node.js script fetches Google News RSS feeds and converts them to JSON files
2. **Static Data**: JSON files are served as static assets (no CORS issues!)
3. **Frontend**: JavaScript loads JSON files and renders the news
4. **Search**: Client-side search across all categories

## Files

- `scripts/rss-to-json.js` - Fetches RSS and generates JSON
- `data/*.json` - Generated news data files
- `index.html` - Main page
- `styles.css` - Cyberpunk styling
- `script.js` - Frontend logic
- `package.json` - Node.js dependencies

## Deployment

For GitHub Pages:
1. Run `npm run fetch-news` to generate latest data
2. Commit and push the `/data` folder
3. GitHub Pages serves the static files

For automated updates, you can set up GitHub Actions to run the RSS fetch script on a schedule.