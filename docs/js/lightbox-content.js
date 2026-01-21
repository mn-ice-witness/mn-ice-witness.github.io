/**
 * lightbox-content.js - Lightbox Content Rendering
 *
 * Handles rendering content for the lightbox:
 * - Incident details with local media
 * - About page
 * - New/updated listings
 * - Video/image HTML generation
 *
 * Global: LightboxContent
 * Depends on: App (for incident data, media URLs), IncidentParser, marked (CDN)
 */

const LightboxContent = {
    /**
     * Trust level explanations
     */
    trustExplanations: {
        high: '3+ independent sources with video/photo evidence',
        medium: '2 sources or official statements',
        low: 'Single source or social media only',
        unverified: 'Reported but not yet confirmed'
    },

    /**
     * Get explanation for trust level
     */
    getTrustExplanation(level) {
        return this.trustExplanations[level] || '';
    },

    /**
     * Render local media (video or image) for an incident
     */
    renderLocalMedia(summaryData) {
        if (!summaryData || !summaryData.hasLocalMedia) return '';

        const mediaFiles = summaryData.localMediaFiles || [];
        if (mediaFiles.length === 0) {
            const mediaUrl = App.getMediaUrl(summaryData.localMediaPath, summaryData.mediaVersion);
            if (summaryData.localMediaType === 'video') {
                return this.renderVideoElement(mediaUrl);
            } else if (summaryData.localMediaType === 'image') {
                return this.renderImageElement(mediaUrl);
            }
            return '';
        }

        let html = '';
        for (const media of mediaFiles) {
            const mediaUrl = App.getMediaUrl(media.path, summaryData.mediaVersion);
            if (media.type === 'video') {
                html += this.renderVideoElement(mediaUrl);
            } else if (media.type === 'image') {
                html += this.renderImageElement(mediaUrl);
            }
        }
        return html;
    },

    /**
     * Render a video element with controls
     */
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

    /**
     * Render an image element with fullscreen control
     */
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

    /**
     * Render full incident content
     */
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

        // Insert local media after the H1 title
        bodyHtml = bodyHtml.replace(/(<\/h1>)/, `$1${localMedia}`);

        return header + bodyHtml + trustFooter;
    },

    /**
     * Embed YouTube videos from markdown links
     */
    embedVideos(html) {
        // [YouTube](https://www.youtube.com/watch?v=...)
        html = html.replace(
            /\[YouTube\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        // [YouTube](https://youtu.be/...)
        html = html.replace(
            /\[YouTube\]\((https:\/\/youtu\.be\/([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        return html;
    },

    /**
     * Render new/updated listing content
     */
    renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents) {
        const [month, day, year] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

        const truncateSummary = (text) => {
            if (!text) return '';
            if (text.length <= 200) return text;
            return text.substring(0, 197) + '...';
        };

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

        if (newIncidents.length > 0) {
            html += '<h2>New</h2><ul class="new-updated-list">';
            for (const incident of newIncidents) {
                const slug = ViewState.getIncidentId(incident);
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
                const slug = ViewState.getIncidentId(incident);
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
        return html;
    },

    /**
     * Render share button HTML
     */
    renderShareButton() {
        return `
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
    }
};
