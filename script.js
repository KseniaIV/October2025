class GoogleNewsRSSReader {
    constructor() {
        this.currentCategory = 'general';
        this.newsContainer = document.getElementById('newsContainer');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.searchInput = document.getElementById('searchInput');
        
        this.initializeEventListeners();
        this.loadNews();
    }

    initializeEventListeners() {
        // Category tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchNews();
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchNews();
            }
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadNews();
        });
    }

    switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentCategory = category;
        this.loadNews();
    }

    async searchNews() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.loadNews();
            return;
        }

        this.showLoading();
        try {
            await this.fetchNews(query);
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        }
    }

    async loadNews() {
        this.showLoading();
        try {
            await this.fetchNews();
        } catch (error) {
            console.error('Load error:', error);
            this.showError();
        }
    }

    async fetchNews(searchQuery = null) {
        try {
            let rssUrl;
            
            if (searchQuery) {
                // Search for specific topics
                rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en&gl=US&ceid=US:en`;
            } else {
                // Category-based news
                const categoryUrls = {
                    general: 'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
                    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
                    business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
                    sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en',
                    health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en&gl=US&ceid=US:en',
                    science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en'
                };
                
                rssUrl = categoryUrls[this.currentCategory] || categoryUrls.general;
            }

            // Use RSS2JSON service to convert RSS to JSON
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=your_api_key_here&count=20`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                this.displayNews(data.items);
            } else {
                // Fallback: use demo data if RSS service fails
                this.displayDemoNews();
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            // Show demo data as fallback
            this.displayDemoNews();
        }
    }

    displayNews(articles) {
        this.hideLoading();
        this.newsContainer.innerHTML = '';

        if (!articles || articles.length === 0) {
            this.newsContainer.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #7f8c8d; grid-column: 1 / -1;">
                    <i class="fas fa-newspaper" style="font-size: 3em; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>No news articles found</h3>
                    <p>Try a different search term or category.</p>
                </div>
            `;
            return;
        }

        articles.forEach((article, index) => {
            const newsItem = this.createNewsItem(article, index);
            this.newsContainer.appendChild(newsItem);
        });
    }

    createNewsItem(article, index) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.style.animationDelay = `${index * 0.1}s`;

        const pubDate = new Date(article.pubDate);
        const formattedDate = this.formatDate(pubDate);
        
        // Clean up description by removing HTML tags
        const description = this.stripHtml(article.description || article.content || '');
        const truncatedDescription = this.truncateText(description, 150);

        newsItem.innerHTML = `
            <h3>
                <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                    ${article.title}
                </a>
            </h3>
            <p>${truncatedDescription}</p>
            <div class="news-meta">
                <span class="news-source">
                    <i class="fas fa-globe"></i>
                    ${this.extractDomain(article.link)}
                </span>
                <span class="news-date">
                    <i class="far fa-clock"></i>
                    ${formattedDate}
                </span>
            </div>
            <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="read-more">
                Read More <i class="fas fa-external-link-alt"></i>
            </a>
        `;

        return newsItem;
    }

    displayDemoNews() {
        const demoArticles = [
            {
                title: "Breaking: Major Technology Breakthrough Announced",
                description: "Scientists have made a significant breakthrough in quantum computing that could revolutionize the technology industry.",
                link: "#",
                pubDate: new Date().toISOString(),
                source: "Tech News"
            },
            {
                title: "Global Climate Summit Reaches Historic Agreement",
                description: "World leaders unite on ambitious climate action plan to reduce carbon emissions by 50% in the next decade.",
                link: "#",
                pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                source: "World News"
            },
            {
                title: "Sports: Championship Finals Draw Record Viewership",
                description: "The championship game attracted millions of viewers worldwide, breaking previous television records.",
                link: "#",
                pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                source: "Sports Daily"
            },
            {
                title: "Health: New Study Reveals Benefits of Mediterranean Diet",
                description: "Researchers find that Mediterranean diet can significantly reduce risk of heart disease and improve longevity.",
                link: "#",
                pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                source: "Health Journal"
            },
            {
                title: "Business: Tech Giant Announces Quarterly Earnings",
                description: "Company reports strong growth in cloud services and artificial intelligence divisions.",
                link: "#",
                pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                source: "Business Wire"
            },
            {
                title: "Science: Mars Rover Discovers Water Evidence",
                description: "Latest findings from Mars exploration mission provide compelling evidence of ancient water activity.",
                link: "#",
                pubDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                source: "Space News"
            }
        ];

        this.displayNews(demoArticles);
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return 'News Source';
        }
    }

    formatDate(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    showLoading() {
        this.loadingElement.style.display = 'block';
        this.errorElement.style.display = 'none';
        this.newsContainer.style.display = 'none';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.newsContainer.style.display = 'grid';
    }

    showError() {
        this.loadingElement.style.display = 'none';
        this.errorElement.style.display = 'block';
        this.newsContainer.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoogleNewsRSSReader();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
