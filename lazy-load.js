/**
 * Advanced Lazy Loading Script
 * Handles lazy loading for videos, iframes, background images, and deferred scripts
 * Compatible with all modern browsers
 */
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        rootMargin: '50px 0px',
        threshold: 0.1,
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-error'
    };

    // Intersection Observer for lazy loading
    let observer;

    /**
     * Initialize lazy loading
     */
    function init() {
        if (!('IntersectionObserver' in window)) {
            loadAllImmediately();
            return;
        }

        observer = new IntersectionObserver(handleIntersection, {
            rootMargin: CONFIG.rootMargin,
            threshold: CONFIG.threshold
        });

        // Observe images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });

        // Observe iframes with data-src
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            observer.observe(iframe);
        });

        // Observe video elements
        document.querySelectorAll('video[data-src], video[data-poster]').forEach(video => {
            observer.observe(video);
        });

        // Observe elements with background-image lazy loading
        document.querySelectorAll('[data-bg]').forEach(el => {
            observer.observe(el);
        });

        // Observe lazy scripts
        document.querySelectorAll('script[data-src]').forEach(script => {
            observer.observe(script);
        });

        // Defer non-critical CSS
        deferNonCriticalCSS();
    }

    /**
     * Handle intersection observer callback
     */
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                if (el.tagName === 'IMG') {
                    loadImage(el);
                } else if (el.tagName === 'IFRAME') {
                    loadIframe(el);
                } else if (el.tagName === 'VIDEO') {
                    loadVideo(el);
                } else if (el.hasAttribute('data-bg')) {
                    loadBackground(el);
                } else if (el.tagName === 'SCRIPT') {
                    loadScript(el);
                }

                observer.unobserve(el);
            }
        });
    }

    /**
     * Load image lazily
     */
    function loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        const poster = img.dataset.poster;

        img.classList.add(CONFIG.loadingClass);

        if (src) {
            img.src = src;
        }

        if (srcset) {
            img.srcset = srcset;
        }

        if (poster) {
            img.poster = poster;
        }

        img.onload = () => {
            img.classList.remove(CONFIG.loadingClass);
            img.classList.add(CONFIG.loadedClass);
            img.removeAttribute('data-src');
        };

        img.onerror = () => {
            img.classList.remove(CONFIG.loadingClass);
            img.classList.add(CONFIG.errorClass);
        };
    }

    /**
     * Load iframe lazily
     */
    function loadIframe(iframe) {
        const src = iframe.dataset.src;

        if (src) {
            iframe.src = src;
            iframe.classList.add(CONFIG.loadingClass);

            iframe.onload = () => {
                iframe.classList.remove(CONFIG.loadingClass);
                iframe.classList.add(CONFIG.loadedClass);
                iframe.removeAttribute('data-src');
            };
        }
    }

    /**
     * Load video lazily
     */
    function loadVideo(video) {
        const src = video.dataset.src;
        const poster = video.dataset.poster;

        video.classList.add(CONFIG.loadingClass);

        if (poster) {
            video.poster = poster;
        }

        if (src) {
            // Create source element
            const source = document.createElement('source');
            source.src = src;
            source.type = video.dataset.type || 'video/mp4';
            video.appendChild(source);
        }

        video.oncanplay = () => {
            video.classList.remove(CONFIG.loadingClass);
            video.classList.add(CONFIG.loadedClass);
        };

        video.onerror = () => {
            video.classList.remove(CONFIG.loadingClass);
            video.classList.add(CONFIG.errorClass);
        };

        // Load the video
        video.load();
    }

    /**
     * Load background image lazily
     */
    function loadBackground(el) {
        const bg = el.dataset.bg;

        if (bg) {
            el.style.backgroundImage = `url(${bg})`;
            el.classList.add(CONFIG.loadedClass);
            el.removeAttribute('data-bg');
        }
    }

    /**
     * Load script lazily
     */
    function loadScript(script) {
        const src = script.dataset.src;

        if (src) {
            const newScript = document.createElement('script');
            newScript.src = src;

            if (script.type) newScript.type = script.type;
            if (script.id) newScript.id = script.id;
            if (script.dataset.async) newScript.async = true;
            if (script.dataset.defer) newScript.defer = true;

            // Copy other attributes
            Array.from(script.attributes).forEach(attr => {
                if (!['src', 'data-src', 'type', 'id', 'data-async', 'data-defer'].includes(attr.name)) {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });

            script.parentNode.replaceChild(newScript, script);
        }
    }

    /**
     * Defer non-critical CSS
     */
    function deferNonCriticalCSS() {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = 'style.css';
        document.head.appendChild(link);

        link.onload = function() {
            this.rel = 'stylesheet';
        };
    }

    /**
     * Fallback for old browsers - load all immediately
     */
    function loadAllImmediately() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });

        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            iframe.src = iframe.dataset.src;
        });

        document.querySelectorAll('[data-bg]').forEach(el => {
            el.style.backgroundImage = `url(${el.dataset.bg})`;
        });
    }

    /**
     * Add loading="lazy" to native lazy elements
     */
    function addNativeLazy() {
        // Add loading="lazy" to iframes (except above-the-fold)
        document.querySelectorAll('iframe').forEach(iframe => {
            if (!iframe.hasAttribute('loading') && !isAboveTheFold(iframe)) {
                iframe.setAttribute('loading', 'lazy');
            }
        });

        // Add decoding="async" to images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('decoding') && !img.dataset.src) {
                img.setAttribute('decoding', 'async');
            }
        });
    }

    /**
     * Check if element is above the fold
     */
    function isAboveTheFold(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight;
    }

    /**
     * Preload critical images
     */
    function preloadCritical() {
        const criticalImages = [
            // Add critical above-fold images here
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addNativeLazy();
            init();
            preloadCritical();
        });
    } else {
        addNativeLazy();
        init();
        preloadCritical();
    }

    // Expose API for manual control
    window.LazyLoad = {
        observe: (el) => observer && observer.observe(el),
        load: (el) => handleIntersection([{ target: el, isIntersecting: true }], observer),
        refresh: () => {
            document.querySelectorAll('img[data-src], iframe[data-src], [data-bg]').forEach(el => {
                observer && observer.observe(el);
            });
        }
    };
})();