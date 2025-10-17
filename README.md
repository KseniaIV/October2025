# Google News RSS Reader

A modern, responsive web application that fetches and displays news from Google News RSS feeds. Built with vanilla HTML, CSS, and JavaScript for easy deployment to GitHub Pages.

## Features

- 📰 **Real-time News**: Fetches latest news from Google News RSS feeds
- 🔍 **Search Functionality**: Search for specific news topics
- 📱 **Category Filters**: Browse news by categories (Technology, Business, Sports, Health, Science, General)
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Fast Loading**: Optimized for quick loading and smooth performance
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📴 **PWA Support**: Works offline with service worker caching
- 🔄 **Auto-refresh**: Keep up with the latest news updates

## Live Demo

Visit the live application: [Your GitHub Pages URL will be here]

## How to Use

1. **Browse Categories**: Click on category tabs (General, Technology, Business, etc.) to filter news
2. **Search News**: Use the search bar to find news about specific topics
3. **Read Articles**: Click on any news title or "Read More" to open the full article
4. **Refresh**: Use the refresh button to get the latest news updates

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **RSS to JSON**: RSS2JSON API for converting RSS feeds to JSON
- **Icons**: Font Awesome
- **PWA**: Service Worker for offline functionality
- **Deployment**: GitHub Pages with GitHub Actions

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/google-news-rss-reader.git
   cd google-news-rss-reader
   ```

2. **Open locally**:
   Simply open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. **Deploy to GitHub Pages**:
   - Push your code to a GitHub repository
   - Go to Settings → Pages
   - Select "Deploy from a branch" and choose "main"
   - Your site will be available at `https://yourusername.github.io/repository-name`

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions:

1. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages section
   - Source: "Deploy from a branch"
   - Branch: "main"

2. **Automatic Deployment**:
   - The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys changes
   - Every push to the main branch triggers a new deployment

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment workflow
└── README.md          # This file
```

## Customization

### Adding New Categories
Edit the `categoryUrls` object in `script.js` to add new Google News RSS category URLs:

```javascript
const categoryUrls = {
    general: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
    // Add more categories here
};
```

### Styling
Modify `styles.css` to customize the appearance:
- Colors: Update the CSS custom properties
- Layout: Modify the grid system in `.news-container`
- Animations: Adjust the `@keyframes` rules

### RSS Sources
The app uses Google News RSS feeds, but you can modify `script.js` to use any RSS source by updating the URLs in the `fetchNews()` method.

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Google News for providing RSS feeds
- RSS2JSON API for RSS to JSON conversion
- Font Awesome for icons
- GitHub Pages for free hosting

---

**Note**: Due to CORS restrictions, the app includes fallback demo content when RSS feeds cannot be accessed directly. For production use, consider setting up a backend proxy or using a CORS-enabled RSS service.