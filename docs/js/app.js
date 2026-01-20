const App = {
    incidents: [],
    mediaVersion: '',
    currentView: 'media',
    sortByUpdated: false,
    viewedIncidents: new Set(),
    sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response'],
    isScrollingToSection: false,
    categoryLabels: {
        'citizens': 'CITIZEN',
        'observers': 'OBSERVER',
        'immigrants': 'IMMIGRANT',
        'schools-hospitals': 'SCHOOL',
        'response': 'RESPONSE'
    },

    stem(word) {
        if (word.length <= 4) return word;
        return word
            .replace(/ies$/i, 'y')
            .replace(/ied$/i, 'y')
            .replace(/es$/i, '')
            .replace(/ed$/i, '')
            .replace(/ing$/i, '')
            .replace(/s$/i, '');
    },

    getFilteredIncidents() {
        const query = (typeof Search !== 'undefined' && Search.query) ? Search.query.toLowerCase().trim() : '';
        let results = this.incidents;

        if (query) {
            const terms = query.split(/\s+/).filter(t => t.length > 0);
            const stemmedTerms = terms.map(t => this.stem(t));

            results = this.incidents.filter(incident => {
                const searchText = [
                    incident.title,
                    incident.summary,
                    incident.location,
                    incident.city
                ].join(' ').toLowerCase();

                const words = searchText.match(/\b\w+\b/g) || [];
                const stemmedWords = new Set(words.map(w => this.stem(w)));

                return stemmedTerms.every(stemmedTerm => stemmedWords.has(stemmedTerm));
            });
        }

        if (this.sortByUpdated) {
            results = [...results].sort((a, b) => {
                const dateA = a.lastUpdated || a.date;
                const dateB = b.lastUpdated || b.date;
                return dateB.localeCompare(dateA);
            });
        }

        return results;
    },

    async init() {
        this.loadViewedState();
        this.loadSortPreference();
        this.initSplash();
        this.initViewToggle();
        this.initSortToggle();
        this.initSectionNav();
        this.initClearViewed();
        Lightbox.init();
        await this.loadIncidents();
        this.render();
        this.handleInitialHash();
        window.addEventListener('hashchange', () => this.openFromHash());
    },

    loadSortPreference() {
        this.sortByUpdated = localStorage.getItem('sortByUpdated') === 'true';
    },

    saveSortPreference() {
        localStorage.setItem('sortByUpdated', this.sortByUpdated.toString());
    },

    initSortToggle() {
        const checkbox = document.getElementById('sort-updated-checkbox');
        if (!checkbox) return;

        checkbox.checked = this.sortByUpdated;

        checkbox.addEventListener('change', () => {
            this.sortByUpdated = checkbox.checked;
            this.saveSortPreference();
            const toggle = document.getElementById('view-toggle');
            if (toggle) {
                toggle.classList.toggle('list-active', this.currentView === 'list' && !this.sortByUpdated);
            }
            this.render();
            if (this.currentView === 'media') {
                this.renderMediaGallery();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    handleInitialHash() {
        const hash = window.location.hash.slice(1);

        if (!hash || hash === 'media') {
            const stored = localStorage.getItem('preferredView');
            if (stored === 'list') {
                this.switchView('list');
            } else {
                this.switchView('media');
            }
            return;
        }

        if (hash === 'list') {
            this.switchView('list');
            return;
        }

        if (this.sectionHashes.includes(hash)) {
            this.disableSortByUpdated();
            this.switchView('list', true);
            this.scrollToSectionWithFlag(hash);
            return;
        }

        if (hash === 'about') {
            this.switchView('media', true);
            Lightbox.openAbout();
            return;
        }

        if (hash.startsWith('new-updated-')) {
            this.switchView('media', true);
            const dateStr = hash.replace('new-updated-', '');
            Lightbox.openNewUpdated(dateStr);
            return;
        }

        const incident = this.incidents.find(i => {
            const slug = i.filePath.split('/').pop().replace('.md', '');
            return slug === hash;
        });

        if (incident) {
            this.switchView('media', true);
            Lightbox.open(incident);
        } else {
            this.switchView('media', true);
            Lightbox.open404(hash);
        }
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
            this.disableSortByUpdated();
            this.switchView('list', true);
            this.scrollToSectionWithFlag(hash);
            return;
        }

        if (hash === 'about') {
            Lightbox.openAbout();
            return;
        }

        if (hash.startsWith('new-updated-')) {
            const dateStr = hash.replace('new-updated-', '');
            Lightbox.openNewUpdated(dateStr);
            return;
        }

        const incident = this.incidents.find(i => {
            const slug = i.filePath.split('/').pop().replace('.md', '');
            return slug === hash;
        });

        if (incident) {
            Lightbox.open(incident);
        } else {
            Lightbox.open404(hash);
        }
    },

    disableSortByUpdated() {
        this.sortByUpdated = false;
        this.saveSortPreference();
        const checkbox = document.getElementById('sort-updated-checkbox');
        if (checkbox) checkbox.checked = false;
    },

    scrollToSectionWithFlag(sectionId) {
        this.isScrollingToSection = true;
        requestAnimationFrame(() => {
            this.scrollToSection(sectionId);
            setTimeout(() => { this.isScrollingToSection = false; }, 1500);
        });
    },

    updateUrlView(view) {
        localStorage.setItem('preferredView', view);
        if (view === 'list') {
            window.history.replaceState({}, '', '#list');
        } else {
            window.history.replaceState({}, '', window.location.pathname);
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
                this.scrollToSectionWithFlag(hash);
            });
        });

        window.addEventListener('scroll', () => {
            if (this.isScrollingToSection || this.currentView !== 'list') return;
            const hash = window.location.hash.slice(1);
            if (this.sectionHashes.includes(hash)) {
                history.replaceState(null, '', '#list');
            }
        }, { passive: true });
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

        toggle.classList.toggle('list-active', view === 'list' && !this.sortByUpdated);

        if (sectionNav) {
            sectionNav.style.display = (view === 'media' || this.sortByUpdated) ? 'none' : '';
        }

        if (view === 'list') {
            listView.style.display = '';
            mediaGallery.style.display = 'none';
            this.render();
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

        if (!this.sortByUpdated) {
            mediaIncidents = await this.sortMediaByOrder(mediaIncidents);
        }

        const columnCount = this.getColumnCount();

        const cards = mediaIncidents.map(incident => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = this.renderMediaCard(incident);
            const cardEl = wrapper.firstElementChild;

            this.setupMediaCardControls(cardEl);

            cardEl.addEventListener('click', () => Lightbox.open(incident));

            const estimatedHeight = incident.aspectRatio ? (1 / incident.aspectRatio) : 1;

            return { element: cardEl, height: estimatedHeight };
        });

        const columns = [];
        for (let i = 0; i < columnCount; i++) {
            columns.push({ element: document.createElement('div'), cards: [], height: 0 });
            columns[i].element.className = 'gallery-column';
        }

        cards.forEach((card, index) => {
            const columnIndex = index % columnCount;
            columns[columnIndex].cards.push(card);
            columns[columnIndex].height += card.height;
        });

        if (columnCount > 1) {
            let iterations = 0;
            const maxIterations = cards.length * 2;

            while (iterations < maxIterations) {
                iterations++;

                let tallest = columns[0], shortest = columns[0];
                for (const col of columns) {
                    if (col.height > tallest.height) tallest = col;
                    if (col.height < shortest.height) shortest = col;
                }

                if (tallest === shortest || tallest.cards.length === 0) break;

                const lastCard = tallest.cards[tallest.cards.length - 1];

                if (tallest.height - shortest.height > lastCard.height) {
                    tallest.cards.pop();
                    tallest.height -= lastCard.height;
                    shortest.cards.push(lastCard);
                    shortest.height += lastCard.height;
                } else {
                    break;
                }
            }
        }

        for (const col of columns) {
            for (const card of col.cards) {
                col.element.appendChild(card.element);
            }
        }

        gallery.innerHTML = '';
        columns.forEach(col => gallery.appendChild(col.element));

        const footer = document.createElement('div');
        footer.className = 'media-gallery-footer';
        footer.innerHTML = '<a href="#list">Click here for a list of all incidents</a>';
        footer.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        gallery.appendChild(footer);

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

            return mediaIncidents.sort((a, b) => {
                const slugA = a.filePath.split('/').pop().replace('.md', '');
                const slugB = b.filePath.split('/').pop().replace('.md', '');
                const indexA = lines.findIndex(line => slugA.includes(line) || line.includes(slugA));
                const indexB = lines.findIndex(line => slugB.includes(line) || line.includes(slugB));

                if (indexA >= 0 && indexB >= 0) return indexA - indexB;
                if (indexA >= 0) return -1;
                if (indexB >= 0) return 1;
                return 0;
            });
        } catch {
            return mediaIncidents;
        }
    },

    renderMediaCard(incident) {
        const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
        const label = this.categoryLabels[type] || type.toUpperCase();
        const categoryPrefix = `<span class="category-label">${label}:</span> `;

        const shortTitle = incident.title.length > 107
            ? incident.title.substring(0, 104) + '...'
            : incident.title;

        const mediaUrl = this.getMediaUrl(incident.localMediaPath);

        let mediaElement;
        let videoControls = '';
        if (incident.localMediaType === 'video') {
            const videoSrc = mediaUrl + '#t=0.001';
            mediaElement = `<video class="media-card-video" src="${videoSrc}" muted loop playsinline preload="auto" disableRemotePlayback></video>`;
            videoControls = `
                <div class="media-controls">
                    <button class="media-control-btn play-pause-btn" aria-label="Play/Pause">
                        <svg class="media-icon-pause" viewBox="0 0 24 24" width="24" height="24">
                            <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                        </svg>
                        <svg class="media-icon-play" viewBox="0 0 24 24" width="24" height="24" style="display:none">
                            <polygon points="6,4 20,12 6,20" fill="currentColor"/>
                        </svg>
                    </button>
                    <div class="time-slider-container">
                        <input type="range" class="time-slider" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
                    </div>
                    <button class="media-control-btn restart-btn" aria-label="Restart">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="media-control-btn audio-toggle muted" aria-label="Toggle sound">
                        <svg class="speaker-icon" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                            <path class="speaker-waves" d="M18 12c0-2.05-1.18-3.82-2.9-4.68v9.36c1.72-.86 2.9-2.63 2.9-4.68z" fill="currentColor"/>
                        </svg>
                        <svg class="mute-x" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M24 10.5l-2.5-2.5-2.5 2.5-2.5-2.5-2 2 2.5 2.5-2.5 2.5 2 2 2.5-2.5 2.5 2.5 2-2-2.5-2.5 2.5-2.5z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="media-control-btn fullscreen-btn" aria-label="Fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
                        </svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none">
                            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            mediaElement = `<img class="media-card-image" src="${mediaUrl}" alt="${shortTitle}">`;
        }

        return `
            <article class="media-card" role="button" tabindex="0">
                <div class="media-card-media">
                    ${mediaElement}
                    ${videoControls}
                </div>
                <div class="media-card-info">
                    <h3 class="media-card-title">${categoryPrefix}${shortTitle}</h3>
                    <span class="media-card-location">${incident.city}</span>
                </div>
            </article>
        `;
    },

    setupMediaCardControls(cardEl) {
        const video = cardEl.querySelector('.media-card-video');
        if (!video) return;

        const container = cardEl.querySelector('.media-card-media');
        const playPauseBtn = cardEl.querySelector('.play-pause-btn');
        const iconPlay = cardEl.querySelector('.media-icon-play');
        const iconPause = cardEl.querySelector('.media-icon-pause');
        const timeSlider = cardEl.querySelector('.time-slider');
        const restartBtn = cardEl.querySelector('.restart-btn');
        const audioToggle = cardEl.querySelector('.audio-toggle');
        const fullscreenBtn = cardEl.querySelector('.fullscreen-btn');
        const enterIcon = fullscreenBtn?.querySelector('.fullscreen-enter');
        const exitIcon = fullscreenBtn?.querySelector('.fullscreen-exit');

        const isFullscreen = () => document.fullscreenElement === container || document.webkitFullscreenElement === container;

        const showPlayIcon = () => {
            if (iconPlay) iconPlay.style.display = '';
            if (iconPause) iconPause.style.display = 'none';
        };

        const showPauseIcon = () => {
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = '';
        };

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }

        video.addEventListener('play', showPauseIcon);
        video.addEventListener('pause', showPlayIcon);

        if (timeSlider) {
            video.addEventListener('loadedmetadata', () => {
                timeSlider.max = video.duration;
            });

            video.addEventListener('timeupdate', () => {
                if (!timeSlider.dataset.dragging) {
                    timeSlider.value = video.currentTime;
                }
            });

            timeSlider.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                timeSlider.dataset.dragging = 'true';
            });
            timeSlider.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                timeSlider.dataset.dragging = 'true';
            });
            timeSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                video.currentTime = parseFloat(timeSlider.value);
            });
            timeSlider.addEventListener('mouseup', () => delete timeSlider.dataset.dragging);
            timeSlider.addEventListener('touchend', () => delete timeSlider.dataset.dragging);
            timeSlider.addEventListener('click', (e) => e.stopPropagation());
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                video.currentTime = 0;
                video.play();
            });
        }

        if (audioToggle) {
            audioToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                audioToggle.classList.toggle('muted', video.muted);
            });
        }

        if (fullscreenBtn) {
            let savedScrollY = 0;

            const updateFullscreenIcons = () => {
                const fs = isFullscreen();
                if (enterIcon) enterIcon.style.display = fs ? 'none' : '';
                if (exitIcon) exitIcon.style.display = fs ? '' : 'none';
            };

            const onFullscreenExit = () => {
                if (!isFullscreen() && savedScrollY > 0) {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, savedScrollY);
                    });
                }
                updateFullscreenIcons();
            };

            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isFullscreen()) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                } else {
                    savedScrollY = window.scrollY;
                    if (container.requestFullscreen) {
                        container.requestFullscreen({ navigationUI: 'hide' });
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    } else if (video.webkitEnterFullscreen) {
                        video.webkitEnterFullscreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', onFullscreenExit);
            document.addEventListener('webkitfullscreenchange', onFullscreenExit);
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
        const filtered = this.getFilteredIncidents();
        const flatList = document.getElementById('flat-list');
        const sections = document.querySelectorAll('.incident-section');
        const sectionNav = document.getElementById('section-nav');

        if (this.sortByUpdated && this.currentView === 'list') {
            sections.forEach(s => s.style.display = 'none');
            if (sectionNav) sectionNav.style.display = 'none';
            if (flatList) flatList.style.display = '';

            const flatTable = document.getElementById('flat-list-table');
            if (flatTable) {
                if (filtered.length === 0) {
                    const hasSearch = typeof Search !== 'undefined' && Search.query;
                    const msg = hasSearch ? 'No matches' : 'No incidents documented yet';
                    flatTable.innerHTML = `<div class="table-empty">${msg}</div>`;
                } else {
                    flatTable.innerHTML = filtered
                        .map(incident => this.renderRow(incident, true))
                        .join('');

                    flatTable.querySelectorAll('.incident-row').forEach((row, index) => {
                        row.addEventListener('click', () => {
                            this.markAsViewed(filtered[index]);
                            Lightbox.open(filtered[index]);
                        });
                    });
                }
            }
        } else {
            sections.forEach(s => s.style.display = '');
            if (flatList) flatList.style.display = 'none';
            if (sectionNav && this.currentView === 'list') sectionNav.style.display = '';

            const tables = document.querySelectorAll('.incident-section .incident-table');
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
        }
    },

    renderRow(incident, showCategory = false) {
        const [year, month, day] = incident.date.split('-');
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthStr = monthNames[parseInt(month, 10) - 1];
        const dayNum = parseInt(day, 10);

        const incidentId = this.getIncidentId(incident);
        const isViewed = this.viewedIncidents.has(incidentId);
        const viewedClass = isViewed ? 'viewed' : '';

        const mediaIcon = incident.hasLocalMedia ? '<svg class="media-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' : '';

        let categoryPrefix = '';
        if (showCategory) {
            const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
            const label = this.categoryLabels[type] || type.toUpperCase();
            categoryPrefix = `<span class="category-label">${label}:</span> `;
        }

        return `
            <article class="incident-row ${viewedClass}" role="button" tabindex="0" data-incident-id="${incidentId}">
                <div class="row-date">
                    <span class="row-date-day">${dayNum}</span>
                    ${monthStr}
                </div>
                <div class="row-content">
                    <h3 class="row-title">${categoryPrefix}${incident.title}</h3>
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
