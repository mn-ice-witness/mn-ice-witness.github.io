const App = {
    incidents: [],
    mediaVersion: '',
    currentView: 'list',
    viewedIncidents: new Set(),

    async init() {
        this.loadViewedState();
        this.loadViewFromUrl();
        this.initSplash();
        this.initViewToggle();
        this.initClearViewed();
        Lightbox.init();
        await this.loadIncidents();
        this.render();
        this.applyInitialView();
        this.openFromHash();
    },

    loadViewFromUrl() {
        const hash = window.location.hash.slice(1);
        if (hash === 'media') {
            this.currentView = 'media';
        }
    },

    updateUrlView(view) {
        if (view === 'media') {
            window.history.replaceState({}, '', '#media');
        } else {
            window.history.replaceState({}, '', window.location.pathname);
        }
    },

    applyInitialView() {
        if (this.currentView === 'media') {
            this.switchView('media');
        }
    },

    loadViewedState() {
        const stored = localStorage.getItem('viewedIncidents');
        if (stored) {
            this.viewedIncidents = new Set(JSON.parse(stored));
        }
    },

    saveViewedState() {
        localStorage.setItem('viewedIncidents', JSON.stringify([...this.viewedIncidents]));
    },

    getIncidentId(incident) {
        return incident.filePath.split('/').pop().replace('.md', '');
    },

    markAsViewed(incident) {
        const id = this.getIncidentId(incident);
        if (!this.viewedIncidents.has(id)) {
            this.viewedIncidents.add(id);
            this.saveViewedState();
            this.updateViewedUI(id);
        }
    },

    updateViewedUI(id) {
        const row = document.querySelector(`.incident-row[data-incident-id="${id}"]`);
        if (row) {
            row.classList.add('viewed');
            const meta = row.querySelector('.row-meta');
            if (meta && !meta.querySelector('.viewed-icon')) {
                const eyeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                eyeIcon.setAttribute('class', 'viewed-icon');
                eyeIcon.setAttribute('viewBox', '0 0 24 24');
                eyeIcon.setAttribute('width', '14');
                eyeIcon.setAttribute('height', '14');
                eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>';
                meta.appendChild(eyeIcon);
            }
        }
    },

    clearViewed() {
        this.viewedIncidents.clear();
        this.saveViewedState();
        document.querySelectorAll('.incident-row.viewed').forEach(row => {
            row.classList.remove('viewed');
        });
        document.querySelectorAll('.viewed-icon').forEach(icon => {
            icon.remove();
        });
    },

    initClearViewed() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#clear-viewed"]')) {
                e.preventDefault();
                this.clearViewed();
                alert('Viewed history cleared');
            }
        });
    },

    initViewToggle() {
        const toggle = document.getElementById('view-toggle');
        if (!toggle) return;

        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });
    },

    switchView(view) {
        this.currentView = view;
        this.updateUrlView(view);

        const listView = document.getElementById('list-view');
        const mediaGallery = document.getElementById('media-gallery');
        const toggle = document.getElementById('view-toggle');
        const sectionNav = document.getElementById('section-nav');

        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        if (sectionNav) {
            sectionNav.style.display = view === 'media' ? 'none' : '';
        }

        if (view === 'list') {
            listView.style.display = '';
            mediaGallery.style.display = 'none';
        } else {
            listView.style.display = 'none';
            mediaGallery.style.display = '';
            this.renderMediaGallery();
        }
    },

    async renderMediaGallery() {
        const gallery = document.getElementById('media-gallery');
        let mediaIncidents = this.incidents.filter(i => i.hasLocalMedia);

        if (mediaIncidents.length === 0) {
            gallery.innerHTML = '<div class="gallery-empty">No media available yet. Check back soon.</div>';
            return;
        }

        // Try to load custom order from media-order.md
        mediaIncidents = await this.sortMediaByOrder(mediaIncidents);

        gallery.innerHTML = mediaIncidents.map(incident => this.renderMediaCard(incident)).join('');

        // Add click handlers
        gallery.querySelectorAll('.media-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                Lightbox.open(mediaIncidents[index]);
            });
        });

        // Set up video behavior
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isMobile) {
            // Mobile: play on scroll into view
            this.setupScrollToPlay(gallery);
        } else {
            // Desktop: play on hover
            gallery.querySelectorAll('.media-card-video').forEach(video => {
                const card = video.closest('.media-card');
                card.addEventListener('mouseenter', () => video.play());
                card.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            });
        }
    },

    setupScrollToPlay(gallery) {
        const videos = gallery.querySelectorAll('.media-card-video');

        videos.forEach(video => {
            video.addEventListener('play', () => video.closest('.media-card').classList.add('playing'));
            video.addEventListener('pause', () => video.closest('.media-card').classList.remove('playing'));
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });

        videos.forEach(video => observer.observe(video));
    },

    async sortMediaByOrder(mediaIncidents) {
        try {
            const response = await fetch('data/media-order.md');
            if (!response.ok) return mediaIncidents;

            const text = await response.text();
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            // Sort by order in file
            return mediaIncidents.sort((a, b) => {
                const slugA = a.filePath.split('/').pop().replace('.md', '');
                const slugB = b.filePath.split('/').pop().replace('.md', '');
                const indexA = lines.findIndex(line => slugA.includes(line) || line.includes(slugA));
                const indexB = lines.findIndex(line => slugB.includes(line) || line.includes(slugB));

                // Items in the order file come first, in order
                if (indexA >= 0 && indexB >= 0) return indexA - indexB;
                if (indexA >= 0) return -1;
                if (indexB >= 0) return 1;
                return 0; // Keep original order for items not in file
            });
        } catch {
            return mediaIncidents;
        }
    },

    renderMediaCard(incident) {
        const shortTitle = incident.title.length > 60
            ? incident.title.substring(0, 57) + '...'
            : incident.title;

        const mediaUrl = this.getMediaUrl(incident.localMediaPath);

        let mediaElement;
        if (incident.localMediaType === 'video') {
            mediaElement = `
                <video class="media-card-video" muted loop playsinline preload="metadata">
                    <source src="${mediaUrl}" type="video/mp4">
                </video>
                <div class="media-card-play-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                </div>
            `;
        } else {
            mediaElement = `<img class="media-card-image" src="${mediaUrl}" alt="${shortTitle}">`;
        }

        return `
            <article class="media-card" role="button" tabindex="0">
                <div class="media-card-media">
                    ${mediaElement}
                </div>
                <div class="media-card-info">
                    <h3 class="media-card-title">${shortTitle}</h3>
                    <span class="media-card-location">${incident.city}</span>
                </div>
            </article>
        `;
    },

    openFromHash() {
        const hash = window.location.hash.slice(1);
        if (!hash || hash === 'media') return;

        if (hash === 'about') {
            document.getElementById('splash')?.classList.add('hidden');
            Lightbox.openAbout();
            return;
        }

        const incident = this.incidents.find(i => {
            const slug = i.filePath.split('/').pop().replace('.md', '');
            return slug === hash;
        });

        if (incident) {
            document.getElementById('splash')?.classList.add('hidden');
            Lightbox.open(incident);
        }
    },

    initSplash() {
        const splash = document.getElementById('splash');
        if (!splash) return;

        const closeSplash = () => {
            splash.classList.add('hidden');
        };

        const showSplash = () => {
            document.documentElement.classList.remove('skip-splash');
            const animated = splash.querySelectorAll('.splash-image, .splash-overlay, .splash-progress');
            animated.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight;
                el.style.animation = '';
            });
            splash.classList.remove('hidden');
            setTimeout(closeSplash, 3500);
        };

        const titleLink = document.getElementById('title-link');
        if (titleLink) {
            titleLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSplash();
            });
        }

        const lastSplash = localStorage.getItem('splashLastShown');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (lastSplash && (now - parseInt(lastSplash, 10)) < oneDay) {
            splash.classList.add('hidden');
            return;
        }

        localStorage.setItem('splashLastShown', now.toString());

        setTimeout(closeSplash, 3500);

        splash.addEventListener('click', closeSplash);

        let touchStartY = 0;
        splash.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        splash.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const swipeDistance = touchStartY - touchEndY;
            if (Math.abs(swipeDistance) > 50) {
                closeSplash();
            }
        }, { passive: true });
    },

    async loadIncidents() {
        const response = await fetch('data/incidents-summary.json');
        const data = await response.json();
        this.incidents = data.incidents;
        this.mediaVersion = data.mediaVersion || '';
    },

    getMediaUrl(path) {
        return this.mediaVersion ? `${path}?v=${this.mediaVersion}` : path;
    },

    render() {
        const tables = document.querySelectorAll('.incident-table');

        tables.forEach(table => {
            const type = table.dataset.type;
            const typeIncidents = this.incidents.filter(i =>
                Array.isArray(i.type) ? i.type.includes(type) : i.type === type
            );

            if (typeIncidents.length === 0) {
                table.innerHTML = '<div class="table-empty">No incidents documented yet</div>';
                return;
            }

            table.innerHTML = typeIncidents
                .map(incident => this.renderRow(incident))
                .join('');

            table.querySelectorAll('.incident-row').forEach((row, index) => {
                row.addEventListener('click', () => {
                    this.markAsViewed(typeIncidents[index]);
                    Lightbox.open(typeIncidents[index]);
                });
            });
        });
    },

    renderRow(incident) {
        // Parse date parts directly to avoid timezone issues
        const [year, month, day] = incident.date.split('-');
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthStr = monthNames[parseInt(month, 10) - 1];
        const dayNum = parseInt(day, 10);

        const notableStar = incident.notable ? '<span class="notable-star">★</span>' : '';
        const incidentId = this.getIncidentId(incident);
        const isViewed = this.viewedIncidents.has(incidentId);
        const viewedClass = isViewed ? 'viewed' : '';
        const viewedIconClass = isViewed ? 'is-viewed' : '';

        return `
            <article class="incident-row ${viewedClass}" role="button" tabindex="0" data-incident-id="${incidentId}">
                <div class="row-date">
                    <span class="row-date-day">${dayNum}</span>
                    ${monthStr}
                </div>
                <div class="row-content">
                    <h3 class="row-title">${incident.title}</h3>
                    <p class="row-location">${incident.location}, ${incident.city}</p>
                </div>
                <div class="row-meta">
                    <span class="trust-badge trust-${incident.trustworthiness}" data-tooltip="${this.getTrustTooltip(incident.trustworthiness)}">${incident.trustworthiness.toUpperCase()}</span>
                    ${notableStar}
                    ${isViewed ? '<svg class="viewed-icon" viewBox="0 0 24 24" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>' : ''}
                </div>
            </article>
        `;
    },

    getTrustTooltip(level) {
        const tooltips = {
            high: '3+ independent sources with video/photo evidence',
            medium: '2 sources or official statements',
            low: 'Single source or social media only',
            unverified: 'Reported but not yet confirmed'
        };
        return tooltips[level] || '';
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
