// Configuration for the Google News RSS Reader
const CONFIG = {
    // RSS2JSON API settings
    rss2json: {
        apiUrl: 'https://api.rss2json.com/v1/api.json',
        // You can get a free API key from https://rss2json.com/
        apiKey: '', // Leave empty for free tier
        maxArticles: 20
    },
    
    // Google News RSS URLs by category
    newsCategories: {
        general: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
        technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
        business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
        sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
        health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en&gl=US&ceid=US:en',
        science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en'
    },
    
    // UI Settings
    ui: {
        defaultCategory: 'general',
        articlesPerPage: 20,
        animationDelay: 100, // milliseconds between article animations
        refreshInterval: 300000, // 5 minutes in milliseconds
        maxDescriptionLength: 150
    },
    
    // App metadata
    app: {
        name: 'Google News RSS Reader',
        version: '1.0.0',
        author: 'Your Name',
        description: 'A modern RSS feed reader for Google News'
    }
};
