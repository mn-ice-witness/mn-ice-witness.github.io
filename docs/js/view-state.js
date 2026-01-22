/**
 * view-state.js - View State Management
 *
 * Handles:
 * - Viewed incidents tracking (localStorage)
 * - Sort preference (by date vs by updated)
 * - View toggle (media vs list)
 * - Clear viewed functionality
 *
 * Global: ViewState
 * Depends on: App (for re-rendering), Router (for URL updates)
 */

const ViewState = {
    viewedIncidents: new Set(),
    sortByUpdated: false,
    currentView: 'media',

    /**
     * Initialize view state from localStorage
     */
    init() {
        this.loadViewedState();
        this.loadSortPreference();
        this.initSortToggle();
        this.initViewToggle();
        this.initClearViewed();
    },

    /**
     * Sync URL to match sortByUpdated state (call after route handling)
     * If localStorage has filter on but URL doesn't, update URL
     */
    syncUrlWithFilterState() {
        const route = Router.parseUrl();
        const urlHasFilter = route.filter === 'new';

        // Only sync for home/list routes (not lightbox content)
        if (route.type !== 'home' && route.type !== 'list') return;

        // If state and URL match, nothing to do
        if (this.sortByUpdated === urlHasFilter) return;

        // Update URL to match state
        this.updateUrlWithFilter();
    },

    // ==================== VIEWED INCIDENTS ====================

    /**
     * Load viewed incidents from localStorage
     */
    loadViewedState() {
        const stored = localStorage.getItem('viewedIncidents');
        if (stored) {
            this.viewedIncidents = new Set(JSON.parse(stored));
        }
    },

    /**
     * Save viewed incidents to localStorage
     */
    saveViewedState() {
        localStorage.setItem('viewedIncidents', JSON.stringify([...this.viewedIncidents]));
    },

    /**
     * Get incident ID from incident object
     */
    getIncidentId(incident) {
        return incident.filePath.split('/').pop().replace('.md', '');
    },

    /**
     * Check if incident has been viewed
     */
    isViewed(incident) {
        return this.viewedIncidents.has(this.getIncidentId(incident));
    },

    /**
     * Mark an incident as viewed
     */
    markAsViewed(incident) {
        const id = this.getIncidentId(incident);
        if (!this.viewedIncidents.has(id)) {
            this.viewedIncidents.add(id);
            this.saveViewedState();
            this.updateViewedUI(id);
        }
    },

    /**
     * Update UI to show viewed state for an incident
     */
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
                const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-eye');
                eyeIcon.appendChild(useEl);
                meta.appendChild(eyeIcon);
            }
        }
    },

    /**
     * Clear all viewed incidents
     */
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

    /**
     * Initialize clear viewed link handler
     */
    initClearViewed() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#clear-viewed"]')) {
                e.preventDefault();
                this.clearViewed();
                alert('Viewed history cleared');
            }
        });
    },

    // ==================== SORT PREFERENCE ====================

    /**
     * Load sort preference from localStorage
     */
    loadSortPreference() {
        this.sortByUpdated = localStorage.getItem('sortByUpdated') === 'true';
    },

    /**
     * Save sort preference to localStorage
     */
    saveSortPreference() {
        localStorage.setItem('sortByUpdated', this.sortByUpdated.toString());
    },

    /**
     * Initialize sort toggle checkbox
     */
    initSortToggle() {
        const checkbox = document.getElementById('sort-updated-checkbox');
        if (!checkbox) return;

        checkbox.checked = this.sortByUpdated;

        checkbox.addEventListener('change', () => {
            this.sortByUpdated = checkbox.checked;
            this.saveSortPreference();

            // Update toggle visual state
            const toggle = document.getElementById('view-toggle');
            if (toggle) {
                toggle.classList.toggle('list-active', this.currentView === 'list' && !this.sortByUpdated);
            }

            // Update nav visibility
            const sectionNav = document.getElementById('section-nav');
            if (sectionNav && this.currentView === 'list') {
                sectionNav.style.display = this.sortByUpdated ? 'none' : '';
            }

            // Update URL with filter param
            this.updateUrlWithFilter();

            // Re-render via App
            if (typeof App !== 'undefined') {
                App.render();
                if (this.currentView === 'media') {
                    App.renderMediaGallery();
                }
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    /**
     * Update URL to include or remove ?filter=new based on sortByUpdated state
     */
    updateUrlWithFilter() {
        const basePath = this.currentView === 'list' ? Router.buildUrl('list') : '/';
        const newUrl = Router.buildUrlWithFilter(basePath, this.sortByUpdated);
        window.history.replaceState({}, '', newUrl);
    },

    /**
     * Disable sort by updated (when navigating to a specific category)
     */
    disableSortByUpdated() {
        this.sortByUpdated = false;
        this.saveSortPreference();
        const checkbox = document.getElementById('sort-updated-checkbox');
        if (checkbox) checkbox.checked = false;
    },

    /**
     * Enable sort by updated (when ?filter=new is in URL)
     */
    enableSortByUpdated() {
        this.sortByUpdated = true;
        this.saveSortPreference();
        const checkbox = document.getElementById('sort-updated-checkbox');
        if (checkbox) checkbox.checked = true;

        // Update nav visibility
        const sectionNav = document.getElementById('section-nav');
        if (sectionNav) {
            sectionNav.style.display = 'none';
        }

        // Update toggle visual state
        const toggle = document.getElementById('view-toggle');
        if (toggle) {
            toggle.classList.remove('list-active');
        }
    },

    // ==================== VIEW TOGGLE ====================

    /**
     * Initialize view toggle buttons
     */
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

    /**
     * Switch between media and list views
     * @param {string} view - 'media' or 'list'
     * @param {boolean} skipUrlUpdate - Don't update URL (for initial load)
     */
    switchView(view, skipUrlUpdate = false) {
        this.currentView = view;

        if (!skipUrlUpdate) {
            this.updateUrlView(view);
        }

        const listView = document.getElementById('list-view');
        const mediaGallery = document.getElementById('media-gallery');
        const toggle = document.getElementById('view-toggle');
        const sectionNav = document.getElementById('section-nav');

        // Update button states
        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        toggle.classList.toggle('list-active', view === 'list' && !this.sortByUpdated);

        // Show/hide section nav
        if (sectionNav) {
            sectionNav.style.display = (view === 'media' || this.sortByUpdated) ? 'none' : '';
        }

        // Switch views
        if (view === 'list') {
            listView.style.display = '';
            mediaGallery.style.display = 'none';
            if (typeof App !== 'undefined') App.render();
        } else {
            listView.style.display = 'none';
            mediaGallery.style.display = '';
            if (typeof App !== 'undefined') App.renderMediaGallery();
        }
    },

    /**
     * Update URL to reflect current view (preserves filter param)
     */
    updateUrlView(view) {
        localStorage.setItem('preferredView', view);
        const basePath = view === 'list' ? Router.buildUrl('list') : '/';
        const newUrl = Router.buildUrlWithFilter(basePath, this.sortByUpdated);
        window.history.replaceState({}, '', newUrl);
    },

    /**
     * Get preferred view from localStorage
     */
    getPreferredView() {
        return localStorage.getItem('preferredView') || 'media';
    }
};
