const Lightbox = {
    element: null,
    bodyElement: null,
    currentSlug: null,
    cameFromAbout: false,
    previousSlug: null,
    currentIncidentData: null,

    init() {
        this.element = document.getElementById('lightbox');
        this.bodyElement = document.getElementById('lightbox-body');

        this.element.querySelector('.lightbox-backdrop').addEventListener('click', () => this.close());
        this.element.querySelector('.lightbox-close').addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        window.addEventListener('popstate', (e) => {
            if (this.isOpen()) {
                if (e.state && e.state.lightbox && e.state.slug === 'about') {
                    this.openAbout(true);
                } else if (e.state && e.state.lightbox && e.state.slug) {
                    this.openIncidentBySlugWithoutHistory(e.state.slug);
                } else if (!e.state || !e.state.lightbox) {
                    this.closeWithoutHistory();
                }
            }
        });

        document.getElementById('about-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openAbout();
        });
    },

    getSlugFromFilePath(filePath) {
        const filename = filePath.split('/').pop();
        return filename.replace('.md', '');
    },

    isOpen() {
        return this.element.getAttribute('aria-hidden') === 'false';
    },

    async open(incident, fromSlug = null) {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (fromSlug) {
            this.previousSlug = fromSlug;
        }

        // Store incident data for media rendering
        this.currentIncidentData = incident;

        this.currentSlug = this.getSlugFromFilePath(incident.filePath);
        history.pushState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);

        const response = await fetch(incident.filePath);
        const content = await response.text();
        const fullIncident = IncidentParser.parseIncident(content, incident.filePath);

        const html = this.renderIncident(fullIncident, incident);
        this.bodyElement.innerHTML = html;

        // Set up video controls if present
        this.setupMediaControls();

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());

        this.bodyElement.querySelectorAll('a[href^="#"]').forEach(link => {
            const slug = link.getAttribute('href').slice(1);
            if (slug && slug !== 'about' && slug !== this.currentSlug) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openIncidentBySlug(slug, this.currentSlug);
                });
            }
        });
    },

    async openAbout(skipHistory = false) {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = 'about';
        this.cameFromAbout = false;
        if (!skipHistory) {
            history.pushState({ lightbox: true, slug: 'about' }, '', '#about');
        }

        const response = await fetch('about.md');
        const content = await response.text();

        const shareButton = `
            <div class="lightbox-header">
                <button class="share-btn" aria-label="Copy link to share">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Copy Link
                </button>
            </div>
        `;

        const bodyHtml = marked.parse(content);
        this.bodyElement.innerHTML = shareButton + '<div class="about-content">' + bodyHtml + '</div>';

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());

        this.bodyElement.querySelectorAll('a[href^="#"]').forEach(link => {
            const slug = link.getAttribute('href').slice(1);
            if (slug && slug !== 'about') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openIncidentBySlug(slug, 'about');
                });
            }
        });
    },

    async openIncidentBySlug(slug, fromSlug = null) {
        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            if (fromSlug === 'about') {
                this.cameFromAbout = true;
            }
            await this.open(incident, fromSlug);
        }
    },

    async openIncidentBySlugWithoutHistory(slug) {
        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';

            this.currentSlug = slug;
            this.previousSlug = null;
            this.cameFromAbout = false;

            const response = await fetch(incident.filePath);
            const content = await response.text();
            const fullIncident = IncidentParser.parseIncident(content, incident.filePath);

            const html = this.renderIncident(fullIncident);
            this.bodyElement.innerHTML = html;

            this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());

            this.bodyElement.querySelectorAll('a[href^="#"]').forEach(link => {
                const linkSlug = link.getAttribute('href').slice(1);
                if (linkSlug && linkSlug !== 'about' && linkSlug !== this.currentSlug) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openIncidentBySlug(linkSlug, this.currentSlug);
                    });
                }
            });
        }
    },

    close() {
        if (this.isOpen()) {
            history.back();
        }
    },

    closeWithoutHistory() {
        if (this.cameFromAbout) {
            this.cameFromAbout = false;
            this.previousSlug = null;
            this.openAbout();
            return;
        }

        if (this.previousSlug) {
            const prevSlug = this.previousSlug;
            this.previousSlug = null;
            this.openIncidentBySlug(prevSlug);
            return;
        }

        this.element.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.currentSlug = null;
        this.previousSlug = null;
        history.replaceState({ lightbox: false }, '', window.location.pathname);
    },

    copyShareLink() {
        const url = window.location.origin + window.location.pathname + '#' + this.currentSlug;
        navigator.clipboard.writeText(url).then(() => {
            const btn = this.bodyElement.querySelector('.share-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    },

    setupMediaControls() {
        const video = this.bodyElement.querySelector('.local-media-video');
        if (!video) return;

        const overlayBtn = this.bodyElement.querySelector('.media-overlay-btn');
        const iconPlay = this.bodyElement.querySelector('.media-icon-play');
        const iconPause = this.bodyElement.querySelector('.media-icon-pause');

        const showPlayIcon = () => {
            if (iconPlay) iconPlay.style.display = '';
            if (iconPause) iconPause.style.display = 'none';
        };

        const showPauseIcon = () => {
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = '';
        };

        // Click overlay or video to toggle
        const toggle = () => {
            if (video.paused) {
                video.play();
                showPauseIcon();
            } else {
                video.pause();
                showPlayIcon();
            }
        };

        if (overlayBtn) overlayBtn.addEventListener('click', toggle);
        video.addEventListener('click', toggle);

        // When video ends, show play icon
        video.addEventListener('ended', () => {
            showPlayIcon();
        });

        // Sync icon with video state
        video.addEventListener('play', showPauseIcon);
        video.addEventListener('pause', showPlayIcon);
    },

    renderLocalMedia(summaryData) {
        if (!summaryData || !summaryData.hasLocalMedia) return '';

        if (summaryData.localMediaType === 'video') {
            return `
                <div class="local-media-container">
                    <video class="local-media-video" autoplay muted playsinline>
                        <source src="${summaryData.localMediaPath}" type="video/mp4">
                    </video>
                    <button class="media-overlay-btn" aria-label="Play/Pause">
                        <svg class="media-icon-pause" viewBox="0 0 24 24" width="28" height="28" fill="white">
                            <rect x="6" y="4" width="4" height="16" rx="1"/>
                            <rect x="14" y="4" width="4" height="16" rx="1"/>
                        </svg>
                        <svg class="media-icon-play" viewBox="0 0 24 24" width="28" height="28" fill="white" style="display:none">
                            <polygon points="6,4 20,12 6,20"/>
                        </svg>
                    </button>
                </div>
            `;
        } else if (summaryData.localMediaType === 'image') {
            return `
                <div class="local-media-container">
                    <img class="local-media-image" src="${summaryData.localMediaPath}" alt="Incident media">
                </div>
            `;
        }
        return '';
    },

    renderIncident(incident, summaryData = null) {
        const shareButton = `
            <button class="share-btn" aria-label="Copy link to share">
                <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Copy Link
            </button>
        `;

        const localMedia = this.renderLocalMedia(summaryData);

        const header = `
            <div class="lightbox-header">
                ${shareButton}
            </div>
            <div class="lightbox-meta">
                <span class="tag tag-type" data-type="${incident.type}">${IncidentParser.formatTypeLabel(incident.type)}</span>
                <span class="tag tag-trust" data-trust="${incident.trustworthiness}">${IncidentParser.formatTrustLabel(incident.trustworthiness)}</span>
                ${incident.victimCitizenship !== 'unknown' ? `<span class="tag tag-citizenship">${IncidentParser.formatCitizenshipLabel(incident.victimCitizenship)}</span>` : ''}
                <span class="tag">${incident.location}</span>
                <span class="tag">${IncidentParser.formatDate(incident.date)}</span>
            </div>
        `;

        let bodyHtml = marked.parse(incident.body);
        bodyHtml = this.embedVideos(bodyHtml);
        bodyHtml = this.reorderSections(bodyHtml);

        // Insert media after the title (h1) but before summary
        bodyHtml = bodyHtml.replace(/(<\/h1>)/, `$1${localMedia}`);

        return header + bodyHtml;
    },

    reorderSections(html) {
        // No reordering - preserve markdown order (Summary -> Sources -> Victim(s) -> ...)
        return html;
    },

    embedVideos(html) {
        html = html.replace(
            /\[YouTube\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        html = html.replace(
            /\[YouTube\]\((https:\/\/youtu\.be\/([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        return html;
    }
};
