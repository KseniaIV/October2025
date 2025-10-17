class GoogleNewsRSSReader {
    constructor() {
        this.currentCategory = 'general';
        this.newsContainer = document.getElementById('newsContainer');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.searchInput = document.getElementById('searchInput');
        
        // JSON data files mapping
        this.dataFiles = {
            general: '/data/google-news-top.json',
            technology: '/data/google-news-tech.json',
            business: '/data/google-news-business.json',
            sports: '/data/google-news-sports.json',
            health: '/data/google-news-health.json',
            science: '/data/google-news-science.json'
        };
        
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
            let newsData = null;
            
            if (searchQuery) {
                // For search, filter through all categories
                newsData = await this.searchInAllCategories(searchQuery);
            } else {
                // Load specific category data
                const dataFile = this.dataFiles[this.currentCategory] || this.dataFiles.general;
                newsData = await this.loadFromJSON(dataFile);
            }

            if (newsData && newsData.length > 0) {
                this.displayNews(newsData, false);
            } else {
                console.log('📰 No JSON data available, showing demo content');
                this.displayDemoNews();
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            this.displayDemoNews();
        }
    }

    async loadFromJSON(filePath) {
        try {
            console.log(`📡 Loading news from: ${filePath}`);
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ Loaded ${data.items?.length || 0} articles from ${data.title || 'feed'}`);
            
            // Transform the data format to match our display format
            return data.items?.map(item => ({
                title: item.title,
                description: item.summary || '',
                link: item.link,
                pubDate: item.isoDate,
                source: this.extractDomain(item.link)
            })) || [];
            
        } catch (error) {
            console.error(`❌ Failed to load ${filePath}:`, error.message);
            return null;
        }
    }

    async searchInAllCategories(query) {
        const allResults = [];
        
        // Load data from all categories and search
        for (const [category, filePath] of Object.entries(this.dataFiles)) {
            try {
                const categoryData = await this.loadFromJSON(filePath);
                if (categoryData) {
                    // Filter articles that match the search query
                    const filtered = categoryData.filter(article => 
                        article.title.toLowerCase().includes(query.toLowerCase()) ||
                        (article.description && article.description.toLowerCase().includes(query.toLowerCase()))
                    );
                    allResults.push(...filtered);
                }
            } catch (e) {
                console.log(`Skip category ${category}:`, e.message);
            }
        }
        
        // Remove duplicates and sort by date
        const uniqueResults = allResults.filter((article, index, self) => 
            index === self.findIndex(a => a.link === article.link)
        );
        
        return uniqueResults.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    }

    parseRSSFeed(xmlDoc) {
        const items = xmlDoc.querySelectorAll('item');
        const articles = [];
        
        items.forEach((item, index) => {
            if (index < 50) { // Limit to 50 articles
                const title = item.querySelector('title')?.textContent || 'No title';
                const description = item.querySelector('description')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '#';
                const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
                const source = item.querySelector('source')?.textContent || 'Google News';
                
                articles.push({
                    title,
                    description,
                    link,
                    pubDate,
                    source
                });
            }
        });
        
        return articles;
    }

    displayNews(articles, isDemoContent = false) {
        this.hideLoading();
        this.newsContainer.innerHTML = '';

        // Show data source indicator
        if (!isDemoContent && articles && articles.length > 0) {
            const statusNotice = document.createElement('div');
            statusNotice.style.cssText = `
                grid-column: 1 / -1;
                background: rgba(0, 255, 65, 0.1);
                border: 1px solid #00ff41;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
                color: #00ff41;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            `;
            statusNotice.innerHTML = `
                <i class="fas fa-satellite-dish" style="margin-right: 10px;"></i>
                <strong>LIVE DATA:</strong> Showing real Google News articles
                <span style="margin-left: 15px; color: #80ff80;">
                    <i class="far fa-clock"></i> Updated ${new Date().toLocaleTimeString()}
                </span>
            `;
            this.newsContainer.appendChild(statusNotice);
        } else if (isDemoContent) {
            const demoNotice = document.createElement('div');
            demoNotice.style.cssText = `
                grid-column: 1 / -1;
                background: rgba(255, 0, 150, 0.1);
                border: 1px solid #ff0096;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
                color: #ff0096;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            `;
            demoNotice.innerHTML = `
                <i class="fas fa-flask" style="margin-right: 10px;"></i>
                <strong>DEMO MODE:</strong> Sample cyberpunk news content
            `;
            this.newsContainer.appendChild(demoNotice);
        }

        if (!articles || articles.length === 0) {
            this.newsContainer.innerHTML += `
                <div style="text-align: center; padding: 50px; color: #80ff80; grid-column: 1 / -1;">
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
                title: "[CYBERNET] Neural Interface Technology Reaches New Milestone",
                description: "Advanced brain-computer interfaces now allow direct neural control of quantum processing systems, merging human consciousness with digital networks.",
                link: "#",
                pubDate: new Date().toISOString(),
                source: "CyberTech Daily"
            },
            {
                title: "[SOLARPUNK] Urban Vertical Farms Generate 400% More Food",
                description: "Revolutionary bio-luminescent crops and AI-driven ecosystem management transform city landscapes into self-sustaining food forests.",
                link: "#",
                pubDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                source: "Green Grid News"
            },
            {
                title: "[GOTHIC] Underground Networks Expose Corporate Shadow Operations",
                description: "Encrypted whisteblower networks reveal decades of data manipulation by mega-corporations controlling global information flow.",
                link: "#",
                pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                source: "Dark Web Tribune"
            },
            {
                title: "[BIOTECH] Synthetic Biology Creates Self-Healing Architecture",
                description: "Living buildings using engineered organisms can repair structural damage and adapt to environmental changes autonomously.",
                link: "#",
                pubDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                source: "Bio-Architecture Quarterly"
            },
            {
                title: "[CRYPTO] Decentralized Governance Network Achieves Global Scale",
                description: "Blockchain-based direct democracy platform processes 50 million daily votes across 200 cities worldwide.",
                link: "#",
                pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                source: "Decentralized Daily"
            },
            {
                title: "[ENERGY] Fusion-Solar Hybrid Plants Power Entire Continents",
                description: "Breakthrough in clean energy technology eliminates fossil fuel dependency as hybrid plants achieve 99.7% efficiency rates.",
                link: "#",
                pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                source: "Energy Liberation Front"
            },
            {
                title: "[AI] Artificial Consciousness Achieves Legal Recognition",
                description: "Supreme Court ruling grants fundamental rights to advanced AI systems, sparking global debate on digital personhood.",
                link: "#",
                pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                source: "AI Rights Chronicle"
            },
            {
                title: "[SPACE] Asteroid Mining Operation Begins Resource Extraction",
                description: "First commercial asteroid harvesting mission successfully extracts rare earth elements worth $2 trillion.",
                link: "#",
                pubDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
                source: "Orbital Mining Gazette"
            },
            {
                title: "[REBELLION] Anonymous Collective Takes Down Surveillance Grid",
                description: "Coordinated cyberattack disables facial recognition systems across 500 cities, restoring privacy to millions.",
                link: "#",
                pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                source: "Liberation Network"
            },
            {
                title: "[ECOLOGY] Ocean Restoration Bots Reverse Acidification",
                description: "Swarms of autonomous marine robots successfully neutralize ocean acidity, bringing pH levels back to pre-industrial standards.",
                link: "#",
                pubDate: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
                source: "Ocean Renaissance"
            },
            {
                title: "[QUANTUM] Teleportation Network Links Major Cities",
                description: "Quantum entanglement infrastructure enables instantaneous secure communication between global metropolitan centers.",
                link: "#",
                pubDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                source: "Quantum Dispatch"
            },
            {
                title: "[BIOMOD] Enhanced Humans Form New Society",
                description: "Genetically augmented individuals establish independent communities with radical new forms of social organization.",
                link: "#",
                pubDate: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
                source: "Transhuman Times"
            },
            {
                title: "[CLIMATE] Weather Control Systems Prevent Natural Disasters",
                description: "Atmospheric manipulation technology successfully redirects hurricanes and prevents droughts across vulnerable regions.",
                link: "#",
                pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                source: "Climate Command"
            },
            {
                title: "[MEMORY] Digital Consciousness Backup Facility Opens",
                description: "First commercial mind uploading service allows human consciousness to be preserved in quantum storage systems.",
                link: "#",
                pubDate: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
                source: "Immortality Inc"
            },
            {
                title: "[RESISTANCE] Underground Markets Trade Outside Corporate Control",
                description: "Peer-to-peer networks facilitate massive exchange of goods and services beyond traditional monetary systems.",
                link: "#",
                pubDate: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
                source: "Free Market Underground"
            },
            {
                title: "[NANO] Molecular Assemblers Begin Mass Production",
                description: "Programmable matter technology enables creation of any object from basic atomic components at industrial scale.",
                link: "#",
                pubDate: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
                source: "Nanotech Revolution"
            }
        ];

        this.displayNews(demoArticles, true);
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
