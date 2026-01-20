const Lightbox = {
    element: null,
    bodyElement: null,
    currentSlug: null,
    currentIncidentData: null,
    savedScrollPositions: {},
    openedViaPushState: false,
    returnToNewUpdated: null,

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
            } else if (e.state.slug && e.state.slug.startsWith('new-updated-')) {
                const dateStr = e.state.slug.replace('new-updated-', '');
                this.returnToNewUpdated = dateStr;
                this.showNewUpdated(dateStr);
            } else if (e.state.fromNewUpdated) {
                this.returnToNewUpdated = e.state.fromNewUpdated;
                this.showIncident(e.state.slug);
            } else if (e.state.slug) {
                this.returnToNewUpdated = null;
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

    open404(hash) {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = hash;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>Page Not Found</h1>
                <p>The incident "<strong>${hash}</strong>" doesn't exist or may have been removed.</p>
                <p><a href="#" class="not-found-home">← Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
    },

    openNewUpdated(dateStr) {
        const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) {
            this.open404InvalidDate(dateStr);
            return;
        }

        const [, month, day, year] = match;
        const datePrefix = `${year}-${month}-${day}`;

        const newIncidents = App.incidents.filter(i => i.created && i.created.startsWith(datePrefix));
        const updatedIncidents = App.incidents.filter(i =>
            i.lastUpdated && i.lastUpdated.startsWith(datePrefix) &&
            (!i.created || !i.created.startsWith(datePrefix))
        );

        if (newIncidents.length === 0 && updatedIncidents.length === 0) {
            this.openNoRecordsForDate(dateStr);
            return;
        }

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.returnToNewUpdated = dateStr;
        if (window.location.hash !== '#' + this.currentSlug) {
            history.pushState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);
            this.openedViaPushState = true;
        } else {
            // Came directly via URL - replace state so back button works from child incidents
            history.replaceState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);
            this.openedViaPushState = false;
        }

        this.renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents);
    },

    renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents) {
        const [month, day, year] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

        let html = `
            <div class="lightbox-header">
                <button class="share-btn" aria-label="Copy link to share">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Copy Link
                </button>
            </div>
            <div class="new-updated-content">
                <h1>New & Updated Incidents</h1>
                <p class="new-updated-date">${formattedDate}</p>
        `;

        const truncateSummary = (text) => {
            if (!text) return '';
            if (text.length <= 200) return text;
            return text.substring(0, 197) + '...';
        };

        if (newIncidents.length > 0) {
            html += '<h2>New</h2><ul class="new-updated-list">';
            for (const incident of newIncidents) {
                const slug = App.getIncidentId(incident);
                const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
                const label = App.categoryLabels[type] || type.toUpperCase();
                const summary = truncateSummary(incident.summary);
                html += `<li>
                    <a href="#${slug}" class="new-updated-link" data-slug="${slug}">
                        <span class="category-label">${label}:</span> ${incident.title}
                    </a>
                    <p class="new-updated-summary">${summary}</p>
                </li>`;
            }
            html += '</ul>';
        }

        if (updatedIncidents.length > 0) {
            html += '<h2>Updated</h2><ul class="new-updated-list">';
            for (const incident of updatedIncidents) {
                const slug = App.getIncidentId(incident);
                const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
                const label = App.categoryLabels[type] || type.toUpperCase();
                const displayText = truncateSummary(incident.latestUpdate || incident.summary);
                html += `<li>
                    <a href="#${slug}" class="new-updated-link" data-slug="${slug}">
                        <span class="category-label">${label}:</span> ${incident.title}
                    </a>
                    <p class="new-updated-summary">${displayText}</p>
                </li>`;
            }
            html += '</ul>';
        }

        html += '</div>';
        this.bodyElement.innerHTML = html;

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());

        this.bodyElement.querySelectorAll('.new-updated-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = link.dataset.slug;
                this.openIncidentFromNewUpdated(slug);
            });
        });
    },

    async openIncidentFromNewUpdated(slug) {
        this.savedScrollPositions[this.currentSlug] = this.bodyElement.scrollTop;

        const incident = App.incidents.find(i => App.getIncidentId(i) === slug);
        if (incident) {
            this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
            this.currentIncidentData = incident;
            this.currentSlug = slug;

            history.pushState({ lightbox: true, slug: slug, fromNewUpdated: this.returnToNewUpdated }, '', '#' + slug);
            this.openedViaPushState = true;

            await this.renderIncidentContent(incident);
        }
    },

    showNewUpdated(dateStr) {
        const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) {
            this.closeLightbox();
            return;
        }

        const [, month, day, year] = match;
        const datePrefix = `${year}-${month}-${day}`;

        const newIncidents = App.incidents.filter(i => i.created && i.created.startsWith(datePrefix));
        const updatedIncidents = App.incidents.filter(i =>
            i.lastUpdated && i.lastUpdated.startsWith(datePrefix) &&
            (!i.created || !i.created.startsWith(datePrefix))
        );

        if (newIncidents.length === 0 && updatedIncidents.length === 0) {
            this.closeLightbox();
            return;
        }

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.returnToNewUpdated = dateStr;

        this.renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents);

        if (this.savedScrollPositions[this.currentSlug]) {
            this.bodyElement.scrollTop = this.savedScrollPositions[this.currentSlug];
            delete this.savedScrollPositions[this.currentSlug];
        }
    },

    open404InvalidDate(dateStr) {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>Invalid Date Format</h1>
                <p>The URL "<strong>#new-updated-${dateStr}</strong>" is not valid.</p>
                <p>Expected format: <code>#new-updated-MM-DD-YYYY</code></p>
                <p><a href="#" class="not-found-home">← Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
    },

    openNoRecordsForDate(dateStr) {
        const [month, day, year] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>No Records Found</h1>
                <p>No posts were created or updated on <strong>${formattedDate}</strong>.</p>
                <p><a href="#" class="not-found-home">← Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
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
        this.returnToNewUpdated = null;

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
        this.setupVideoControls();
        this.setupImageControls();
    },

    setupImageControls() {
        const image = this.bodyElement.querySelector('.local-media-image');
        if (!image) return;

        const container = image.closest('.local-media-container');
        const fullscreenBtn = container?.querySelector('.fullscreen-btn');
        if (!fullscreenBtn) return;

        const enterIcon = fullscreenBtn.querySelector('.fullscreen-enter');
        const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit');
        let savedScrollY = 0;

        const isFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;

        const updateFullscreenState = () => {
            const fs = isFullscreen();
            if (enterIcon) enterIcon.style.display = fs ? 'none' : '';
            if (exitIcon) exitIcon.style.display = fs ? '' : 'none';
        };

        const onFullscreenExit = () => {
            if (!isFullscreen() && savedScrollY > 0) {
                requestAnimationFrame(() => {
                    this.bodyElement.scrollTop = savedScrollY;
                });
            }
            updateFullscreenState();
        };

        fullscreenBtn.addEventListener('click', () => {
            if (isFullscreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } else {
                savedScrollY = this.bodyElement.scrollTop;
                if (container.requestFullscreen) {
                    container.requestFullscreen({ navigationUI: 'hide' });
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            }
        });

        document.addEventListener('fullscreenchange', onFullscreenExit);
        document.addEventListener('webkitfullscreenchange', onFullscreenExit);
    },

    setupVideoControls() {
        const video = this.bodyElement.querySelector('.local-media-video');
        if (!video) return;

        const container = video.closest('.local-media-container');
        const playPauseBtn = this.bodyElement.querySelector('.play-pause-btn');
        const iconPlay = this.bodyElement.querySelector('.media-icon-play');
        const iconPause = this.bodyElement.querySelector('.media-icon-pause');
        const timeSlider = this.bodyElement.querySelector('.time-slider');
        const timeDisplay = this.bodyElement.querySelector('.time-display');

        const isFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const showPlayIcon = () => {
            if (iconPlay) iconPlay.style.display = '';
            if (iconPause) iconPause.style.display = 'none';
        };

        const showPauseIcon = () => {
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = '';
        };

        const clearEndedState = () => {
            video.style.filter = '';
            const overlay = container?.querySelector('.video-ended-overlay');
            if (overlay) overlay.remove();
            const restartPrompt = container?.querySelector('.fullscreen-restart-prompt');
            if (restartPrompt) restartPrompt.remove();
        };

        const restartVideo = () => {
            clearEndedState();
            video.currentTime = 0;
            video.play();
            showPauseIcon();
        };

        const togglePlayPause = () => {
            if (video.paused) {
                clearEndedState();
                video.play();
                showPauseIcon();
            } else {
                video.pause();
                showPlayIcon();
            }
        };

        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        video.addEventListener('click', togglePlayPause);

        if (timeSlider) {
            video.addEventListener('loadedmetadata', () => {
                timeSlider.max = video.duration;
                if (timeDisplay) {
                    timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
                }
            });

            video.addEventListener('timeupdate', () => {
                if (!timeSlider.dataset.dragging) {
                    timeSlider.value = video.currentTime;
                }
                if (timeDisplay) {
                    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
                }
            });

            timeSlider.addEventListener('mousedown', () => timeSlider.dataset.dragging = 'true');
            timeSlider.addEventListener('touchstart', () => timeSlider.dataset.dragging = 'true');

            timeSlider.addEventListener('input', () => {
                video.currentTime = parseFloat(timeSlider.value);
            });

            timeSlider.addEventListener('mouseup', () => delete timeSlider.dataset.dragging);
            timeSlider.addEventListener('touchend', () => delete timeSlider.dataset.dragging);
        }

        video.addEventListener('ended', () => {
            showPlayIcon();
            if (container) {
                video.style.filter = 'grayscale(80%) brightness(0.7)';

                if (isFullscreen()) {
                    if (!container.querySelector('.fullscreen-restart-prompt')) {
                        const prompt = document.createElement('div');
                        prompt.className = 'fullscreen-restart-prompt';
                        prompt.innerHTML = '<button class="restart-prompt-btn">Tap to replay</button>';
                        prompt.querySelector('.restart-prompt-btn').addEventListener('click', restartVideo);
                        container.appendChild(prompt);
                    }
                } else {
                    if (!container.querySelector('.video-ended-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'video-ended-overlay';
                        overlay.innerHTML = '<span>scroll for sources below</span>';
                        container.appendChild(overlay);
                    }
                }
            }
        });
        video.addEventListener('play', showPauseIcon);
        video.addEventListener('pause', showPlayIcon);

        const restartBtn = this.bodyElement.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', restartVideo);
        }

        const audioToggle = this.bodyElement.querySelector('.audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                video.muted = !video.muted;
                audioToggle.classList.toggle('muted', video.muted);
            });
        }

        const fullscreenBtn = this.bodyElement.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            const enterIcon = fullscreenBtn.querySelector('.fullscreen-enter');
            const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit');
            let savedScrollY = 0;

            const updateFullscreenState = () => {
                const fs = isFullscreen();
                if (enterIcon) enterIcon.style.display = fs ? 'none' : '';
                if (exitIcon) exitIcon.style.display = fs ? '' : 'none';
            };

            const onFullscreenExit = () => {
                if (!isFullscreen() && savedScrollY > 0) {
                    requestAnimationFrame(() => {
                        this.bodyElement.scrollTop = savedScrollY;
                    });
                }
                updateFullscreenState();
            };

            fullscreenBtn.addEventListener('click', () => {
                if (isFullscreen()) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                } else {
                    savedScrollY = this.bodyElement.scrollTop;
                    const target = container || video;
                    if (target.requestFullscreen) {
                        target.requestFullscreen({ navigationUI: 'hide' });
                    } else if (target.webkitRequestFullscreen) {
                        target.webkitRequestFullscreen();
                    } else if (video.webkitEnterFullscreen) {
                        video.webkitEnterFullscreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', onFullscreenExit);
            document.addEventListener('webkitfullscreenchange', onFullscreenExit);
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
                    <div class="time-slider-container">
                        <input type="range" class="time-slider" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
                        <span class="time-display">0:00 / 0:00</span>
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
                    <button class="media-control-btn fullscreen-btn" aria-label="Toggle fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
                        </svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none">
                            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    renderImageElement(mediaUrl) {
        return `
            <div class="local-media-container local-media-container-image">
                <img class="local-media-image" src="${mediaUrl}" alt="Incident media">
                <div class="media-controls">
                    <button class="media-control-btn fullscreen-btn" aria-label="Toggle fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
                        </svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none">
                            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
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
                ${incident.victimCitizenship !== 'unknown' ? `<span class="tag tag-citizenship">${IncidentParser.formatCitizenshipLabel(incident.victimCitizenship)}</span>` : ''}
                <span class="tag">${incident.location}</span>
                <span class="tag">${IncidentParser.formatDate(incident.date)}</span>
            </div>
        `;

        const trustFooter = `
            <div class="incident-trust-footer">
                <svg class="trust-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>
                </svg>
                <span class="trust-badge trust-${incident.trustworthiness}">${incident.trustworthiness.toUpperCase()}</span>
                <span class="trust-explanation">${this.getTrustExplanation(incident.trustworthiness)}</span>
            </div>
        `;

        let bodyHtml = marked.parse(incident.body);
        bodyHtml = this.embedVideos(bodyHtml);
        bodyHtml = this.reorderSections(bodyHtml);

        bodyHtml = bodyHtml.replace(/(<\/h1>)/, `$1${localMedia}`);

        return header + bodyHtml + trustFooter;
    },

    getTrustExplanation(level) {
        const explanations = {
            high: '3+ independent sources with video/photo evidence',
            medium: '2 sources or official statements',
            low: 'Single source or social media only',
            unverified: 'Reported but not yet confirmed'
        };
        return explanations[level] || '';
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
