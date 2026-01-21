/**
 * app.js - Main Application Controller
 *
 * Coordinates all modules and handles:
 * - Initialization and data loading
 * - Search/filter logic
 * - List view rendering
 * - Route handling
 *
 * Global: App
 * Depends on: Router, ViewState, Splash, MediaGallery, Lightbox, Search, IncidentParser
 */

const App = {
    incidents: [],

    // Category labels for display
    categoryLabels: {
        'citizens': 'CITIZENS',
        'observers': 'OBSERVERS',
        'immigrants': 'IMMIGRANTS',
        'schools-hospitals': 'SCHOOLS',
        'response': 'RESPONSE',
        'fatal': 'FATAL'
    },

    // Section configuration
    sections: [
        { type: 'citizens', title: 'U.S. Citizens Detained', desc: 'American citizens stopped, questioned, or detained by federal agents during immigration enforcement.' },
        { type: 'observers', title: 'Bystanders & Observers', desc: 'People filming, observing, or nearby who were confronted or detained.' },
        { type: 'immigrants', title: 'Community Members Targeted', desc: 'Documented encounters affecting community members, some involving apparent legal violations.' },
        { type: 'schools-hospitals', title: 'Schools & Hospitals', desc: 'Enforcement activity in or near sensitive locations.' },
        { type: 'response', title: 'Official Responses', desc: 'Statements and responses from federal, state, and local officials.' }
    ],

    // Delegate to Router
    get sectionHashes() { return Router.sectionHashes; },
    get aboutSections() { return Router.aboutSections; },

    /**
     * Initialize the application
     */
    async init() {
        await this.loadIncidents();

        // Initialize modules
        ViewState.init();
        Lightbox.init();
        Splash.init();

        // Setup section navigation
        this.initSectionNav();

        // Handle initial route
        this.handleInitialRoute();

        // Render based on route
        const route = Router.parseUrl();
        if (route.type === 'list' || route.category) {
            ViewState.switchView('list', true);
        } else {
            ViewState.switchView(ViewState.getPreferredView(), true);
        }
    },

    /**
     * Load incidents from JSON
     */
    async loadIncidents() {
        const response = await fetch('/data/incidents-summary.json');
        const data = await response.json();
        this.incidents = data.incidents || [];
        this.updateStats();
    },

    /**
     * Update stats ribbon
     */
    updateStats() {
        const totalEl = document.getElementById('total-incidents');
        const fatalEl = document.getElementById('fatal-count');

        if (totalEl) totalEl.textContent = this.incidents.length;
        if (fatalEl) {
            const fatal = this.incidents.filter(i =>
                (Array.isArray(i.type) && i.type.includes('fatal')) || i.type === 'fatal'
            ).length;
            fatalEl.textContent = fatal;
        }
    },

    // ==================== ROUTING ====================

    /**
     * Delegate URL building to Router
     */
    buildUrl(type, slug) {
        return Router.buildUrl(type, slug);
    },

    /**
     * Delegate URL parsing to Router
     */
    parseUrl(url) {
        return Router.parseUrl(url);
    },

    /**
     * Handle initial route on page load
     */
    handleInitialRoute() {
        const route = Router.parseUrl();
        Router.upgradeLegacyUrl(route);
        this.openFromRoute(route);
    },

    /**
     * Open content based on route
     */
    openFromRoute(route) {
        switch (route.type) {
            case 'incident':
                const incident = this.incidents.find(i => {
                    const slug = i.filePath.split('/').pop().replace('.md', '');
                    return slug === route.slug;
                });
                if (incident) {
                    Lightbox.open(incident);
                } else {
                    Lightbox.open404(route.slug);
                }
                break;

            case 'about':
                Lightbox.openAbout(route.section);
                break;

            case 'new-updated':
                Lightbox.openNewUpdated(route.dateStr);
                break;

            case 'list':
                ViewState.switchView('list', true);
                if (route.category) {
                    ViewState.disableSortByUpdated();
                    this.scrollToSection(route.category);
                }
                break;

            case 'home':
            default:
                break;
        }
    },

    /**
     * Scroll to a section in list view
     * Maps URL category names to section type IDs (e.g., 'schools' -> 'schools-hospitals')
     */
    scrollToSection(category) {
        const sectionId = this.categoryToSectionId(category);
        setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },

    /**
     * Map URL category to section type ID
     */
    categoryToSectionId(category) {
        if (category === 'schools') return 'schools-hospitals';
        return category;
    },

    // ==================== SEARCH & FILTER ====================

    /**
     * Simple stemmer for search
     */
    stem(word) {
        return word.toLowerCase()
            .replace(/ing$/, '')
            .replace(/ed$/, '')
            .replace(/s$/, '')
            .replace(/ies$/, 'y');
    },

    /**
     * Get filtered incidents based on search query
     */
    getFilteredIncidents() {
        if (!Search.query) return this.incidents;

        const terms = Search.query.toLowerCase().split(/\s+/).map(t => this.stem(t));

        return this.incidents.filter(incident => {
            const searchable = [
                incident.title,
                incident.summary,
                incident.location,
                incident.city,
                Array.isArray(incident.type) ? incident.type.join(' ') : incident.type
            ].join(' ').toLowerCase();

            return terms.every(term => {
                if (searchable.includes(term)) return true;
                const words = searchable.split(/\s+/);
                return words.some(word => this.stem(word).includes(term));
            });
        });
    },

    // ==================== INCIDENT HELPERS ====================

    /**
     * Get incident ID from incident object
     */
    getIncidentId(incident) {
        return incident.filePath.split('/').pop().replace('.md', '');
    },

    /**
     * Get media URL with optional version for cache busting
     */
    getMediaUrl(path, version) {
        if (!path) return path;
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return version ? `${cleanPath}?v=${version}` : cleanPath;
    },

    /**
     * Mute all gallery videos (when opening lightbox)
     */
    muteAllGalleryVideos() {
        MediaGallery.muteAll();
    },

    // ==================== RENDERING ====================

    /**
     * Render media gallery (delegates to MediaGallery)
     */
    renderMediaGallery() {
        MediaGallery.render();
    },

    /**
     * Initialize section navigation
     */
    initSectionNav() {
        const nav = document.getElementById('section-nav');
        if (!nav) return;

        nav.querySelectorAll('.nav-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const section = pill.getAttribute('href').slice(1);

                // Ensure list view
                if (ViewState.currentView !== 'list') {
                    ViewState.switchView('list', true);
                }

                // Disable sort by updated for category navigation
                ViewState.disableSortByUpdated();

                // Update URL
                history.replaceState({}, '', Router.buildUrl('list', section));

                // Scroll to section
                this.scrollToSection(section);
            });
        });
    },

    /**
     * Render the incident list
     */
    render() {
        const container = document.getElementById('list-view');
        if (!container) return;

        const filtered = this.getFilteredIncidents();

        // Update search result count
        const countEl = document.querySelector('.search-results-count');
        if (countEl && Search.query) {
            countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
        }

        // Clear existing sections
        container.querySelectorAll('.incident-section').forEach(el => el.remove());

        // Sort by updated if enabled
        if (ViewState.sortByUpdated) {
            const sorted = [...filtered].sort((a, b) => {
                const dateA = a.lastUpdated || a.date;
                const dateB = b.lastUpdated || b.date;
                return dateB.localeCompare(dateA);
            });
            this.renderFlatList(container, sorted);
            return;
        }

        // Group by type and render sections
        this.sections.forEach(section => {
            const sectionIncidents = filtered.filter(i => {
                const types = Array.isArray(i.type) ? i.type : [i.type];
                return types.includes(section.type);
            });

            if (sectionIncidents.length === 0) return;

            const sectionEl = document.createElement('section');
            sectionEl.id = section.type;
            sectionEl.className = 'incident-section';
            sectionEl.innerHTML = `
                <header class="section-header">
                    <div class="section-marker marker-${section.type}"></div>
                    <div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-desc">${section.desc}</p>
                    </div>
                </header>
                <div class="incident-table">
                    ${sectionIncidents.map(i => this.renderRow(i)).join('')}
                </div>
            `;

            container.appendChild(sectionEl);
        });

        this.setupRowHandlers(container);
    },

    /**
     * Render flat list (sorted by updated)
     */
    renderFlatList(container, incidents) {
        const section = document.createElement('section');
        section.className = 'incident-section flat-list';
        section.innerHTML = `
            <div class="incident-table">
                ${incidents.map(i => this.renderRow(i, true)).join('')}
            </div>
        `;
        container.appendChild(section);
        this.setupRowHandlers(container);
    },

    /**
     * Render a single incident row
     */
    renderRow(incident, showCategory = false) {
        const date = new Date(incident.date + 'T12:00:00');
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();

        const id = this.getIncidentId(incident);
        const viewed = ViewState.isViewed(incident);

        const types = Array.isArray(incident.type) ? incident.type : [incident.type];
        const primaryType = types[0];
        const label = this.categoryLabels[primaryType] || primaryType.toUpperCase();

        const categoryPrefix = showCategory ? `<span class="category-label">${label}:</span> ` : '';

        const viewedIcon = viewed ? `
            <svg class="viewed-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-eye"/></svg>
        ` : '';

        return `
            <article class="incident-row${viewed ? ' viewed' : ''}" data-incident-id="${id}" role="button" tabindex="0">
                <div class="row-date">
                    <span class="row-date-day">${day}</span>
                    ${month}
                </div>
                <div class="row-content">
                    <h3 class="row-title">${categoryPrefix}${incident.title}</h3>
                    <span class="row-location">${incident.location}</span>
                </div>
                <div class="row-meta">
                    ${viewedIcon}
                </div>
            </article>
        `;
    },

    /**
     * Setup click handlers for rows
     */
    setupRowHandlers(container) {
        container.querySelectorAll('.incident-row').forEach(row => {
            const id = row.dataset.incidentId;
            const incident = this.incidents.find(i => this.getIncidentId(i) === id);

            if (incident) {
                row.addEventListener('click', () => Lightbox.open(incident));
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        Lightbox.open(incident);
                    }
                });
            }
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
