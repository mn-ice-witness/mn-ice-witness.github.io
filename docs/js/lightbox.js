const Lightbox = {
    element: null,
    bodyElement: null,
    currentSlug: null,
    currentIncidentData: null,
    savedScrollPositions: {},
    openedViaPushState: false,

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

        window.addEventListener('popstate', (e) => this.handlePopState(e));

        document.getElementById('about-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openAbout();
        });
    },

    handlePopState(e) {
        if (e.state && e.state.lightbox) {
            if (e.state.slug === 'about') {
                this.showAbout();
            } else if (e.state.slug) {
                this.showIncident(e.state.slug);
            }
        } else if (this.isOpen()) {
            this.closeLightbox();
        }
    },

    getSlugFromFilePath(filePath) {
        const filename = filePath.split('/').pop();
        return filename.replace('.md', '');
    },

    isOpen() {
        return this.element.getAttribute('aria-hidden') === 'false';
    },

    async open(incident) {
        App.muteAllGalleryVideos();
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentIncidentData = incident;
        this.currentSlug = this.getSlugFromFilePath(incident.filePath);
        if (window.location.hash !== '#' + this.currentSlug) {
            history.pushState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);
            this.openedViaPushState = true;
        } else {
            // Came directly via URL - no history to go back to
            this.openedViaPushState = false;
        }

        await this.renderIncidentContent(incident);
    },

    async openAbout() {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = 'about';
        if (window.location.hash !== '#about') {
            history.pushState({ lightbox: true, slug: 'about' }, '', '#about');
            this.openedViaPushState = true;
        } else {
            this.openedViaPushState = false;
        }

        await this.renderAboutContent();
    },

    async openIncidentBySlug(slug) {
        if (this.currentSlug) {
            this.savedScrollPositions[this.currentSlug] = this.bodyElement.scrollTop;
        }

        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            await this.open(incident);
        }
    },

    async showIncident(slug) {
        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
            this.element.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            this.currentIncidentData = incident;
            this.currentSlug = slug;

            await this.renderIncidentContent(incident);

            if (this.savedScrollPositions[slug]) {
                this.bodyElement.scrollTop = this.savedScrollPositions[slug];
                delete this.savedScrollPositions[slug];
            }
        } else {
            this.closeLightbox();
        }
    },

    async showAbout() {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = 'about';

        await this.renderAboutContent();

        if (this.savedScrollPositions['about']) {
            this.bodyElement.scrollTop = this.savedScrollPositions['about'];
            delete this.savedScrollPositions['about'];
        }
    },

    async renderIncidentContent(incident) {
        const response = await fetch(incident.filePath);
        const content = await response.text();
        const fullIncident = IncidentParser.parseIncident(content, incident.filePath);

        const html = this.renderIncident(fullIncident, incident);
        this.bodyElement.innerHTML = html;

        this.setupMediaControls();

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());

        this.bodyElement.querySelectorAll('a[href^="#"]').forEach(link => {
            const slug = link.getAttribute('href').slice(1);
            if (slug && slug !== 'about' && slug !== this.currentSlug) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openIncidentBySlug(slug);
                });
            }
        });
    },

    async renderAboutContent() {
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
                    this.openIncidentBySlug(slug);
                });
            }
        });
    },

    close() {
        if (this.isOpen()) {
            if (this.openedViaPushState) {
                // Navigated from within the site - go back in history
                history.back();
            } else {
                // Came directly via URL - go to home page
                this.closeLightbox();
                history.replaceState(null, '', window.location.pathname);
            }
        }
    },

    closeLightbox() {
        const video = this.bodyElement.querySelector('.local-media-video');
        if (video) {
            video.pause();
            video.muted = true;
        }
        this.element.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.currentSlug = null;
        this.currentIncidentData = null;
        this.savedScrollPositions = {};
        this.openedViaPushState = false;

        const hash = window.location.hash.slice(1);
        const isListViewHash = hash === 'list' || App.sectionHashes.includes(hash);
        if (isListViewHash) {
            // Preserve list view section anchors - URL is already correct after back()
        } else if (hash && hash !== 'media') {
            history.replaceState(null, '', window.location.pathname);
        }
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

        const playPauseBtn = this.bodyElement.querySelector('.play-pause-btn');
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

        const togglePlayPause = () => {
            if (video.paused) {
                video.style.filter = '';
                const overlay = video.closest('.local-media-container')?.querySelector('.video-ended-overlay');
                if (overlay) overlay.remove();
                video.play();
                showPauseIcon();
            } else {
                video.pause();
                showPlayIcon();
            }
        };

        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        video.addEventListener('click', togglePlayPause);

        video.addEventListener('ended', () => {
            showPlayIcon();
            const container = video.closest('.local-media-container');
            if (container && !container.querySelector('.video-ended-overlay')) {
                video.style.filter = 'grayscale(80%) brightness(0.7)';
                const overlay = document.createElement('div');
                overlay.className = 'video-ended-overlay';
                overlay.innerHTML = '<span>scroll for sources below</span>';
                container.appendChild(overlay);
            }
        });
        video.addEventListener('play', showPauseIcon);
        video.addEventListener('pause', showPlayIcon);

        const audioToggle = this.bodyElement.querySelector('.audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                video.muted = !video.muted;
                audioToggle.classList.toggle('muted', video.muted);
            });
        }
    },

    renderLocalMedia(summaryData) {
        if (!summaryData || !summaryData.hasLocalMedia) return '';

        const mediaFiles = summaryData.localMediaFiles || [];
        if (mediaFiles.length === 0) {
            const mediaUrl = App.getMediaUrl(summaryData.localMediaPath);
            if (summaryData.localMediaType === 'video') {
                return this.renderVideoElement(mediaUrl);
            } else if (summaryData.localMediaType === 'image') {
                return this.renderImageElement(mediaUrl);
            }
            return '';
        }

        let html = '';
        for (const media of mediaFiles) {
            const mediaUrl = App.getMediaUrl(media.path);
            if (media.type === 'video') {
                html += this.renderVideoElement(mediaUrl);
            } else if (media.type === 'image') {
                html += this.renderImageElement(mediaUrl);
            }
        }
        return html;
    },

    renderVideoElement(mediaUrl) {
        return `
            <div class="local-media-container">
                <video class="local-media-video" autoplay muted playsinline disableRemotePlayback>
                    <source src="${mediaUrl}" type="video/mp4">
                </video>
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
                    <button class="media-control-btn audio-toggle muted" aria-label="Toggle sound">
                        <svg class="speaker-icon" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                            <path class="speaker-waves" d="M18 12c0-2.05-1.18-3.82-2.9-4.68v9.36c1.72-.86 2.9-2.63 2.9-4.68z" fill="currentColor"/>
                        </svg>
                        <svg class="mute-x" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M24 10.5l-2.5-2.5-2.5 2.5-2.5-2.5-2 2 2.5 2.5-2.5 2.5 2 2 2.5-2.5 2.5 2.5 2-2-2.5-2.5 2.5-2.5z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    renderImageElement(mediaUrl) {
        return `
            <div class="local-media-container">
                <img class="local-media-image" src="${mediaUrl}" alt="Incident media">
            </div>
        `;
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

        bodyHtml = bodyHtml.replace(/(<\/h1>)/, `$1${localMedia}`);

        return header + bodyHtml;
    },

    reorderSections(html) {
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
