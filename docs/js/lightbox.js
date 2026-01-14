const Lightbox = {
    element: null,
    bodyElement: null,
    currentSlug: null,
    cameFromAbout: false,

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
                    // Going back to about page - re-render it without pushing history
                    this.openAbout(true);
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

    async open(incident) {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = this.getSlugFromFilePath(incident.filePath);
        history.pushState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);

        const response = await fetch(incident.filePath);
        const content = await response.text();
        const fullIncident = IncidentParser.parseIncident(content, incident.filePath);

        const html = this.renderIncident(fullIncident);
        this.bodyElement.innerHTML = html;

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
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

        // Add click handlers for incident links within about content
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

    async openIncidentBySlug(slug) {
        // Find the incident by slug
        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            this.cameFromAbout = true;
            await this.open(incident);
        }
    },

    close() {
        if (this.isOpen()) {
            history.back();
        }
    },

    closeWithoutHistory() {
        // If we came from about, go back to about instead of closing completely
        if (this.cameFromAbout) {
            this.cameFromAbout = false;
            this.openAbout();
            return;
        }

        this.element.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.currentSlug = null;
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

    renderIncident(incident) {
        const shareButton = `
            <button class="share-btn" aria-label="Copy link to share">
                <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Copy Link
            </button>
        `;

        const metaTags = `
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

        return metaTags + bodyHtml;
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
