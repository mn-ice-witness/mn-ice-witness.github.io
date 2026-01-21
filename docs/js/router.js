/**
 * router.js - URL Routing Module
 *
 * Handles path-based URL routing with legacy hash URL support.
 * Builds clean URLs like /entry/slug, /about/section, /list/category.
 *
 * Global: Router
 * Depends on: Nothing (standalone, but uses App.aboutSections at runtime)
 */

const Router = {
    // Section hashes for list view categories
    sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response'],

    // About page section anchors
    aboutSections: ['federal-position', 'the-data', 'what-this-site-documents', 'purpose', 'sources-used', 'investigations', 'operation-parris', 'trustworthiness', 'legal-observation'],

    /**
     * Build a clean path-based URL
     * @param {string} type - 'incident', 'about', 'list', or 'home'
     * @param {string|null} slug - Optional slug/section/category
     * @returns {string} URL path
     */
    buildUrl(type, slug = null) {
        switch (type) {
            case 'incident':
                return `/entry/${slug}`;
            case 'about':
                return slug ? `/about/${slug}` : '/about';
            case 'list':
                return slug ? `/list/${slug}` : '/list';
            case 'new-updated':
                return `/new-updated/${slug}`;
            case 'home':
            default:
                return '/';
        }
    },

    /**
     * Parse current URL into a route object
     * Supports both path-based URLs and legacy hash URLs
     * @param {URL|Location} url - URL to parse (defaults to window.location)
     * @returns {Object} Route object with type, slug/section/category, and legacy flag
     */
    parseUrl(url = window.location) {
        const path = url.pathname;
        const hash = url.hash.slice(1);

        // Check path-based routes first
        if (path.startsWith('/entry/')) {
            return { type: 'incident', slug: path.replace('/entry/', '') };
        }
        if (path.startsWith('/about')) {
            const section = path.replace('/about', '').replace(/^\//, '') || null;
            return { type: 'about', section };
        }
        if (path.startsWith('/list')) {
            const category = path.replace('/list', '').replace(/^\//, '') || null;
            return { type: 'list', category };
        }
        if (path.startsWith('/new-updated/')) {
            return { type: 'new-updated', dateStr: path.replace('/new-updated/', '') };
        }

        // Fall back to hash-based routes for backwards compatibility
        if (hash) {
            if (hash === 'about' || this.aboutSections.includes(hash)) {
                return { type: 'about', section: hash === 'about' ? null : hash, legacy: true };
            }
            if (hash === 'list') {
                return { type: 'list', category: null, legacy: true };
            }
            if (this.sectionHashes.includes(hash)) {
                return { type: 'list', category: hash, legacy: true };
            }
            if (hash === 'media') {
                return { type: 'home', legacy: true };
            }
            if (hash.startsWith('new-updated-')) {
                return { type: 'new-updated', dateStr: hash.replace('new-updated-', ''), legacy: true };
            }
            // Assume it's an incident slug
            return { type: 'incident', slug: hash, legacy: true };
        }

        // Default to home
        return { type: 'home' };
    },

    /**
     * Redirect legacy hash URLs to clean path URLs
     * @param {Object} route - Route object from parseUrl
     */
    upgradeLegacyUrl(route) {
        if (!route.legacy) return;

        let newPath;
        switch (route.type) {
            case 'incident':
                newPath = this.buildUrl('incident', route.slug);
                break;
            case 'about':
                newPath = this.buildUrl('about', route.section);
                break;
            case 'list':
                newPath = this.buildUrl('list', route.category);
                break;
            case 'new-updated':
                newPath = this.buildUrl('new-updated', route.dateStr);
                break;
            default:
                newPath = '/';
        }
        history.replaceState(null, '', newPath);
    }
};
