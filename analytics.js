/**
 * Vercel Web Analytics Initialization
 * This file initializes Vercel Web Analytics for the static website
 */

// Initialize the analytics queue
(function() {
  // Create the va function and queue
  window.va = window.va || function a(...params) {
    (window.vaq = window.vaq || []).push(params);
  };
})();

// Inject the Vercel Analytics script
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Prevent duplicate script injection
  if (document.querySelector('script[data-vercel-analytics]')) return;
  
  // Determine the correct script source
  // In production on Vercel, this will automatically load the correct analytics script
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '';
  
  // Create and inject the analytics script
  const script = document.createElement('script');
  
  if (isDev) {
    // Development mode - logs to console
    script.src = '/_vercel/insights/script.js';
    console.log('[Vercel Analytics] Running in development mode');
  } else {
    // Production mode - sends to Vercel Analytics
    script.src = '/_vercel/insights/script.js';
  }
  
  script.defer = true;
  script.setAttribute('data-vercel-analytics', '');
  
  script.onerror = function() {
    const errorMessage = isDev
      ? 'Analytics script not loaded (this is normal in local development)'
      : 'Failed to load Vercel Analytics. Please ensure Web Analytics is enabled in your Vercel project settings.';
    
    console.log('[Vercel Analytics] ' + errorMessage);
  };
  
  document.head.appendChild(script);
})();

/**
 * Track custom events
 * Usage: window.trackEvent('Button Click', { button: 'CTA' })
 */
window.trackEvent = function(eventName, properties) {
  if (window.va) {
    window.va('event', { name: eventName, data: properties });
  }
};

console.log('[Vercel Analytics] Initialized successfully');
