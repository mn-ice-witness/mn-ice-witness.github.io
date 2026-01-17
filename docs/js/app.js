const App = {
    incidents: [],
    mediaVersion: '',
    currentView: 'media',
    viewedIncidents: new Set(),
    sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response'],

    getFilteredIncidents() {
        const query = (typeof Search !== 'undefined' && Search.query) ? Search.query.toLowerCase().trim() : '';
        if (!query) return this.incidents;

        const terms = query.split(/\s+/).filter(t => t.length > 0);
        return this.incidents.filter(incident => {
            const searchText = [
                incident.title,
                incident.summary,
                incident.location,
                incident.city
            ].join(' ').toLowerCase();

            return terms.every(term => searchText.includes(term));
        });
    },

    async init() {
        this.loadViewedState();
        this.loadViewFromUrl();
        this.initSplash();
        this.initViewToggle();
        this.initSectionNav();
        this.initClearViewed();
        Lightbox.init();
        await this.loadIncidents();
        this.render();
        this.applyInitialView();
        this.openFromHash();
        window.addEventListener('hashchange', () => this.openFromHash());
    },

    loadViewFromUrl() {
        const hash = window.location.hash.slice(1);
        if (hash === 'list' || this.sectionHashes.includes(hash)) {
            this.currentView = 'list';
        } else if (!hash) {
            const stored = localStorage.getItem('preferredView');
            if (stored === 'list') {
                this.currentView = 'list';
            }
        }
    },

    updateUrlView(view) {
        localStorage.setItem('preferredView', view);
        if (view === 'list') {
            window.history.replaceState({}, '', '#list');
        } else {
            window.history.replaceState({}, '', window.location.pathname);
        }
    },

    applyInitialView() {
        const hash = window.location.hash.slice(1);
        const isSectionHash = this.sectionHashes.includes(hash);
        const isDeepLink = hash && hash !== 'list' && hash !== 'media' && !isSectionHash;
        this.switchView(this.currentView, isDeepLink || isSectionHash);
        if (isSectionHash) {
            requestAnimationFrame(() => this.scrollToSection(hash));
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
                eyeIcon.setAttribute('width', '16');
                eyeIcon.setAttribute('height', '16');
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

    initSectionNav() {
        const nav = document.getElementById('section-nav');
        if (!nav) return;

        nav.querySelectorAll('.nav-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const hash = pill.getAttribute('href').slice(1);
                if (this.currentView !== 'list') {
                    this.switchView('list', true);
                }
                if (window.location.hash !== '#' + hash) {
                    history.pushState(null, '', '#' + hash);
                }
                requestAnimationFrame(() => this.scrollToSection(hash));
            });
        });
    },

    switchView(view, skipUrlUpdate) {
        this.currentView = view;
        if (!skipUrlUpdate) {
            this.updateUrlView(view);
        }

        const listView = document.getElementById('list-view');
        const mediaGallery = document.getElementById('media-gallery');
        const toggle = document.getElementById('view-toggle');
        const sectionNav = document.getElementById('section-nav');

        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        toggle.classList.toggle('list-active', view === 'list');

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

    getColumnCount() {
        const width = window.innerWidth;
        if (width <= 600) return 1;
        if (width <= 900) return 2;
        return 3;
    },

    async renderMediaGallery() {
        const gallery = document.getElementById('media-gallery');
        let mediaIncidents = this.getFilteredIncidents().filter(i => i.hasLocalMedia);

        if (mediaIncidents.length === 0) {
            const hasSearch = typeof Search !== 'undefined' && Search.query;
            const msg = hasSearch ? 'No media matches your search.' : 'No media available yet. Check back soon.';
            gallery.innerHTML = `<div class="gallery-empty">${msg}</div>`;
            return;
        }

        // Sort by media-order.md
        mediaIncidents = await this.sortMediaByOrder(mediaIncidents);

        const columnCount = this.getColumnCount();

        // Create column containers
        const columns = [];
        for (let i = 0; i < columnCount; i++) {
            const col = document.createElement('div');
            col.className = 'gallery-column';
            columns.push(col);
        }

        // Distribute cards round-robin into columns
        mediaIncidents.forEach((incident, index) => {
            const columnIndex = index % columnCount;
            const card = document.createElement('div');
            card.innerHTML = this.renderMediaCard(incident);
            const cardEl = card.firstElementChild;

            // Handle audio toggle clicks separately
            const audioToggle = cardEl.querySelector('.audio-toggle');
            if (audioToggle) {
                audioToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const video = cardEl.querySelector('.media-card-video');
                    if (video) {
                        video.muted = !video.muted;
                        audioToggle.classList.toggle('muted', video.muted);
                    }
                });
            }

            cardEl.addEventListener('click', () => Lightbox.open(incident));
            columns[columnIndex].appendChild(cardEl);
        });

        // Clear gallery and add columns
        gallery.innerHTML = '';
        columns.forEach(col => gallery.appendChild(col));

        // Add footer link
        const footer = document.createElement('div');
        footer.className = 'media-gallery-footer';
        footer.innerHTML = '<a href="#list">Click here for a list of all incidents</a>';
        footer.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        gallery.appendChild(footer);

        // Set up video behavior - autoplay on scroll
        this.setupScrollToPlay(gallery);
    },

    setupScrollToPlay(gallery) {
        const videos = gallery.querySelectorAll('.media-card-video');

        const scheduleAction = (video, action) => {
            if (action === 'play') {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
                    scheduleAction(video, 'play');
                } else {
                    scheduleAction(video, 'pause');
                }
            });
        }, { threshold: [0, 0.4, 0.6, 1] });

        videos.forEach(video => observer.observe(video));
    },

    async sortMediaByOrder(mediaIncidents) {
        try {
            const response = await fetch(this.getMediaUrl('data/media-order.md'));
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
        const shortTitle = incident.title.length > 107
            ? incident.title.substring(0, 104) + '...'
            : incident.title;

        const mediaUrl = this.getMediaUrl(incident.localMediaPath);

        let mediaElement;
        let audioControl = '';
        if (incident.localMediaType === 'video') {
            const videoSrc = mediaUrl + '#t=0.001';
            mediaElement = `<video class="media-card-video" src="${videoSrc}" muted loop playsinline preload="auto" disableRemotePlayback></video>`;
            audioControl = `
                <button class="audio-toggle muted" aria-label="Toggle sound">
                    <svg class="speaker-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                        <path class="speaker-waves" d="M18 12c0-2.05-1.18-3.82-2.9-4.68v9.36c1.72-.86 2.9-2.63 2.9-4.68z" fill="currentColor"/>
                    </svg>
                    <svg class="mute-x" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M24 10.5l-2.5-2.5-2.5 2.5-2.5-2.5-2 2 2.5 2.5-2.5 2.5 2 2 2.5-2.5 2.5 2.5 2-2-2.5-2.5 2.5-2.5z" fill="currentColor"/>
                    </svg>
                </button>
            `;
        } else {
            mediaElement = `<img class="media-card-image" src="${mediaUrl}" alt="${shortTitle}">`;
        }

        return `
            <article class="media-card" role="button" tabindex="0">
                <div class="media-card-media">
                    ${mediaElement}
                    ${audioControl}
                </div>
                <div class="media-card-info">
                    <h3 class="media-card-title">${shortTitle}</h3>
                    <span class="media-card-location">${incident.city}</span>
                </div>
            </article>
        `;
    },

    openFromHash() {
        if (Lightbox.isOpen()) {
            return;
        }

        const hash = window.location.hash.slice(1);
        if (!hash || hash === 'media') {
            if (this.currentView !== 'media') this.switchView('media');
            return;
        }

        if (hash === 'list') {
            if (this.currentView !== 'list') this.switchView('list');
            return;
        }

        if (this.sectionHashes.includes(hash)) {
            if (this.currentView !== 'list') {
                this.switchView('list', true);
            }
            this.scrollToSection(hash);
            return;
        }

        if (hash === 'about') {
            document.getElementById('splash')?.classList.add('hidden');
            Lightbox.openAbout();
            return;
        }

        const incident = this.incidents.find(i => {
            const slug = i.filePath.split('/').pop().replace('.md', '');
            return slug === hash;
        });

        document.getElementById('splash')?.classList.add('hidden');
        if (incident) {
            Lightbox.open(incident);
        } else {
            Lightbox.open404(hash);
        }
    },

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navHeight = document.querySelector('.section-nav')?.offsetHeight || 0;
            const toggleHeight = document.querySelector('.view-toggle')?.offsetHeight || 0;
            const offset = navHeight + toggleHeight + 8;
            const sectionTop = section.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
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

    muteAllGalleryVideos() {
        document.querySelectorAll('.media-card-video').forEach(video => {
            video.muted = true;
        });
        document.querySelectorAll('.media-card .audio-toggle').forEach(btn => {
            btn.classList.add('muted');
        });
    },

    render() {
        const tables = document.querySelectorAll('.incident-table');
        const filtered = this.getFilteredIncidents();

        tables.forEach(table => {
            const type = table.dataset.type;
            const typeIncidents = filtered.filter(i =>
                Array.isArray(i.type) ? i.type.includes(type) : i.type === type
            );

            if (typeIncidents.length === 0) {
                const hasSearch = typeof Search !== 'undefined' && Search.query;
                const msg = hasSearch ? 'No matches' : 'No incidents documented yet';
                table.innerHTML = `<div class="table-empty">${msg}</div>`;
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

        const incidentId = this.getIncidentId(incident);
        const isViewed = this.viewedIncidents.has(incidentId);
        const viewedClass = isViewed ? 'viewed' : '';

        const mediaIcon = incident.hasLocalMedia ? '<svg class="media-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' : '';

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
                    ${mediaIcon}
                    ${isViewed ? '<svg class="viewed-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>' : ''}
                </div>
            </article>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
