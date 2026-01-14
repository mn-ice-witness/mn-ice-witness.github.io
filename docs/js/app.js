const App = {
    incidents: [],

    async init() {
        this.initSplash();
        Lightbox.init();
        await this.loadIncidents();
        this.render();
        this.openFromHash();
    },

    openFromHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

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
            setTimeout(closeSplash, 2600);
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

        setTimeout(closeSplash, 2600);

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
        this.incidents = await response.json();
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

        const isCitizen = incident.victimCitizenship === 'us-citizen';
        const mediaCount = incident.mediaCount || 0;

        return `
            <article class="incident-row" role="button" tabindex="0">
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
