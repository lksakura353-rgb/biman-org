/**
 * ============================================
 * BIMAN PORTFOLIO - CINEMATIC PAGE TRANSITIONS
 * Liquid Glass Overlay System
 * ============================================
 */

(function () {
    'use strict';

    // ── 1. BUILD THE OVERLAY ELEMENT ──────────────────────────────────────────
    function buildOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        overlay.innerHTML = `
            <div class="pt-panels">
                <div class="pt-panel"></div>
                <div class="pt-panel"></div>
                <div class="pt-panel"></div>
            </div>
            <div class="pt-logo">
                <div class="pt-logo-inner">
                    <i class="fa-solid fa-bolt"></i>
                    <span>BIMAN</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // ── 2. CSS INJECTION (runs once) ──────────────────────────────────────────
    function injectCSS() {
        if (document.getElementById('pt-styles')) return;
        const style = document.createElement('style');
        style.id = 'pt-styles';
        style.textContent = `
            #page-transition-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                pointer-events: none;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .pt-panels {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
            }

            .pt-panel {
                flex: 1;
                background: #050505;
                transform: scaleX(0);
                transform-origin: right;
                transition: transform 0.55s cubic-bezier(0.76, 0, 0.24, 1);
            }
            .pt-panel:nth-child(1) { transition-delay: 0s; }
            .pt-panel:nth-child(2) { transition-delay: 0.05s; }
            .pt-panel:nth-child(3) { transition-delay: 0.10s; }

            /* COVER: panels slide in from right */
            #page-transition-overlay.pt-covering .pt-panel {
                transform: scaleX(1);
                transform-origin: right;
            }

            /* REVEAL: panels slide out to left */
            #page-transition-overlay.pt-revealing .pt-panel {
                transform: scaleX(0);
                transform-origin: left;
                transition-delay: 0s !important;
            }
            #page-transition-overlay.pt-revealing .pt-panel:nth-child(2) { transition-delay: 0.05s !important; }
            #page-transition-overlay.pt-revealing .pt-panel:nth-child(3) { transition-delay: 0.10s !important; }

            /* Logo that appears while panels are covering */
            .pt-logo {
                position: relative;
                z-index: 1;
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
            }
            #page-transition-overlay.pt-covering .pt-logo {
                opacity: 1;
                transform: scale(1);
                transition-delay: 0.35s;
            }

            .pt-logo-inner {
                display: flex;
                align-items: center;
                gap: 14px;
                color: #ffffff;
            }
            .pt-logo-inner i {
                font-size: 2.5rem;
                color: #1b8adb;
                filter: drop-shadow(0 0 15px rgba(27,138,219,0.8));
                animation: pt-bolt-pulse 0.8s ease-in-out infinite alternate;
            }
            .pt-logo-inner span {
                font-family: 'Bebas Neue', 'Orbitron', sans-serif;
                font-size: 2.8rem;
                letter-spacing: 8px;
                color: #fff;
                text-shadow: 0 0 20px rgba(27,138,219,0.5);
            }

            @keyframes pt-bolt-pulse {
                from { filter: drop-shadow(0 0 8px rgba(27,138,219,0.6)); }
                to   { filter: drop-shadow(0 0 25px rgba(27,138,219,1)); }
            }

            /* Thin accent line on panels */
            .pt-panel::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                width: 2px;
                height: 100%;
                background: linear-gradient(to bottom, transparent, #1b8adb, transparent);
                opacity: 0.6;
            }
        `;
        document.head.appendChild(style);
    }

    // ── 3. CORE ANIMATION LOGIC ───────────────────────────────────────────────
    let overlay;

    function cover(callback) {
        overlay.classList.remove('pt-revealing');
        overlay.style.pointerEvents = 'all';
        overlay.classList.add('pt-covering');
        // Wait for all 3 panels to finish (0.55s + 0.10s delay = 0.65s)
        setTimeout(callback, 700);
    }

    function reveal() {
        overlay.classList.remove('pt-covering');
        overlay.classList.add('pt-revealing');
        // Allow click-through after reveal is done
        setTimeout(() => {
            overlay.style.pointerEvents = 'none';
            overlay.classList.remove('pt-revealing');
        }, 750);
    }

    // ── 4. INTERCEPT LINK CLICKS ──────────────────────────────────────────────
    function interceptLinks() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Skip: anchor links, external links, new-tab, js-void, mailto/tel
            const isExternal   = link.hostname && link.hostname !== window.location.hostname;
            const isAnchor     = href.startsWith('#');
            const isSpecial    = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:');
            const opensNewTab  = link.target === '_blank';

            if (isExternal || isAnchor || isSpecial || opensNewTab) return;

            e.preventDefault();
            const destination = link.href;

            cover(() => {
                window.location.href = destination;
            });
        });
    }

    // ── 5. REVEAL ON PAGE LOAD ────────────────────────────────────────────────
    function revealOnLoad() {
        // Start fully covered (panels scaleX=1 instantly, no transition)
        overlay.querySelectorAll('.pt-panel').forEach(p => {
            p.style.transition = 'none';
            p.style.transform = 'scaleX(1)';
            p.style.transformOrigin = 'left';
        });
        overlay.style.pointerEvents = 'all';

        // Re-enable transitions then trigger reveal
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.querySelectorAll('.pt-panel').forEach(p => {
                    p.style.transition = '';
                    p.style.transformOrigin = '';
                    p.style.transform = '';
                });
                overlay.classList.add('pt-revealing');
                setTimeout(() => {
                    overlay.style.pointerEvents = 'none';
                    overlay.classList.remove('pt-revealing');
                }, 800);
            });
        });
    }

    // ── 6. INIT ───────────────────────────────────────────────────────────────
    function init() {
        injectCSS();
        overlay = buildOverlay();
        revealOnLoad();
        interceptLinks();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


// ============================================================
//  SHARE PORTFOLIO BUTTON — floats on every page
//  Copies current URL → clipboard → animated toast feedback
// ============================================================
(function () {
    'use strict';

    function buildShareUI() {
        // ── CSS ────────────────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            /* Floating Share Button */
            #share-btn {
                position: fixed;
                bottom: 102px;
                right: 30px;
                z-index: 9000;
                display: flex;
                align-items: center;
                gap: 7px;
                padding: 9px 14px;
                background: rgba(10, 15, 25, 0.75);
                backdrop-filter: blur(18px) saturate(180%);
                -webkit-backdrop-filter: blur(18px) saturate(180%);
                border: 1px solid rgba(27, 138, 219, 0.35);
                border-radius: 50px;
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 0.7rem;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0,0,0,0.35);
                transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                            box-shadow 0.3s ease,
                            border-color 0.3s ease,
                            background 0.3s ease;
                user-select: none;
                overflow: hidden;
            }

            #share-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg,
                    rgba(27,138,219,0.15) 0%,
                    rgba(27,138,219,0) 60%);
                border-radius: 50px;
                pointer-events: none;
            }

            #share-btn:hover {
                transform: translateY(-4px) scale(1.04);
                border-color: rgba(27,138,219,0.7);
                box-shadow: 0 16px 48px rgba(0,0,0,0.5),
                            0 0 24px rgba(27,138,219,0.25);
                background: rgba(10, 15, 25, 0.92);
            }

            #share-btn:active {
                transform: translateY(-1px) scale(0.98);
            }

            #share-btn .share-icon {
                width: 22px;
                height: 22px;
                background: linear-gradient(135deg, #1b8adb, #0d5fa3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.65rem;
                flex-shrink: 0;
                transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
                box-shadow: 0 0 8px rgba(27,138,219,0.4);
            }

            #share-btn:hover .share-icon {
                transform: rotate(20deg) scale(1.1);
            }

            #share-btn.copied .share-icon {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                box-shadow: 0 0 12px rgba(34,197,94,0.5);
                transform: scale(1.2);
            }

            #share-btn .share-label {
                position: relative;
                height: 14px;
                overflow: hidden;
            }

            #share-btn .share-label span {
                display: block;
                transition: transform 0.35s cubic-bezier(0.76,0,0.24,1),
                            opacity 0.35s ease;
            }

            #share-btn .share-label .label-copied {
                position: absolute;
                top: 0; left: 0;
                transform: translateY(100%);
                opacity: 0;
                color: #4ade80;
                white-space: nowrap;
            }

            #share-btn.copied .share-label .label-default {
                transform: translateY(-100%);
                opacity: 0;
            }

            #share-btn.copied .share-label .label-copied {
                transform: translateY(0);
                opacity: 1;
            }

            /* Ripple effect on click */
            #share-btn .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(27,138,219,0.25);
                transform: scale(0);
                animation: share-ripple 0.6s linear;
                pointer-events: none;
            }

            @keyframes share-ripple {
                to { transform: scale(4); opacity: 0; }
            }

            /* ── Toast Notification ── */
            #share-toast {
                position: fixed;
                bottom: 160px;
                right: 30px;
                z-index: 9001;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 11px 18px;
                background: rgba(10, 15, 25, 0.92);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(34, 197, 94, 0.4);
                border-radius: 16px;
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 0.88rem;
                font-weight: 600;
                box-shadow: 0 12px 40px rgba(0,0,0,0.5),
                            0 0 20px rgba(34,197,94,0.15);
                transform: translateY(20px) scale(0.95);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                            opacity 0.3s ease;
            }

            #share-toast.toast-show {
                transform: translateY(0) scale(1);
                opacity: 1;
            }

            #share-toast .toast-icon {
                width: 22px;
                height: 22px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.65rem;
                flex-shrink: 0;
                animation: toast-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
            }

            @keyframes toast-pop {
                from { transform: scale(0); }
                to   { transform: scale(1); }
            }

            .toast-progress {
                position: absolute;
                bottom: 0; left: 0;
                height: 3px;
                background: linear-gradient(90deg, #22c55e, #4ade80);
                border-radius: 0 0 16px 16px;
                width: 100%;
                transform-origin: left;
                transform: scaleX(1);
                transition: transform 2.5s linear;
            }

            #share-toast.toast-show .toast-progress {
                transform: scaleX(0);
            }

            /* Pulse ring on button */
            #share-btn-ring {
                position: fixed;
                bottom: 106px;
                right: 34px;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                border: 2px solid rgba(27,138,219,0.5);
                pointer-events: none;
                z-index: 8999;
                animation: share-ring-pulse 2.5s ease-out infinite;
            }

            @keyframes share-ring-pulse {
                0%   { transform: scale(1);   opacity: 0.6; }
                70%  { transform: scale(2.2); opacity: 0; }
                100% { transform: scale(2.2); opacity: 0; }
            }

            @media (max-width: 480px) {
                #share-btn { bottom: 160px; right: 16px; padding: 8px 12px; font-size: 0.65rem; }
                #share-btn-ring { bottom: 164px; right: 20px; width: 28px; height: 28px; }
                #share-toast { bottom: 210px; right: 16px; left: 16px; }
            }
        `;
        document.head.appendChild(style);

        // ── Pulse Ring ─────────────────────────────────────
        const ring = document.createElement('div');
        ring.id = 'share-btn-ring';
        document.body.appendChild(ring);

        // ── Button ─────────────────────────────────────────
        const btn = document.createElement('button');
        btn.id = 'share-btn';
        btn.setAttribute('aria-label', 'Share this portfolio');
        btn.innerHTML = `
            <div class="share-icon"><i class="fa-solid fa-share-nodes"></i></div>
            <div class="share-label">
                <span class="label-default">SHARE PORTFOLIO</span>
                <span class="label-copied">LINK COPIED!</span>
            </div>
        `;
        document.body.appendChild(btn);

        // ── Toast ──────────────────────────────────────────
        const toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid fa-check"></i></div>
            <div>
                <div style="font-weight:700;margin-bottom:2px;">Link Copied! 🎉</div>
                <div style="font-size:0.78rem;color:#94a3b8;font-weight:400;">Share your portfolio with the world</div>
            </div>
            <div class="toast-progress"></div>
        `;
        document.body.appendChild(toast);

        // ── Logic ──────────────────────────────────────────
        let toastTimer = null;

        btn.addEventListener('click', function (e) {
            // Ripple effect
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.className = 'ripple';
            ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            // Copy URL
            const url = window.location.origin + '/index.html';
            const copyTarget = (window.location.pathname === '/' ||
                                window.location.pathname.endsWith('index.html'))
                                ? window.location.href
                                : url;

            navigator.clipboard.writeText(copyTarget).then(() => {
                // Button state
                btn.classList.add('copied');
                ring.style.animation = 'none';

                // Show toast
                if (toastTimer) clearTimeout(toastTimer);
                toast.classList.add('toast-show');

                // Reset
                toastTimer = setTimeout(() => {
                    btn.classList.remove('copied');
                    toast.classList.remove('toast-show');
                    ring.style.animation = '';
                    toastTimer = null;
                }, 2800);

            }).catch(() => {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = copyTarget;
                ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                document.execCommand('copy');
                ta.remove();
                btn.classList.add('copied');
                toast.classList.add('toast-show');
                toastTimer = setTimeout(() => {
                    btn.classList.remove('copied');
                    toast.classList.remove('toast-show');
                    toastTimer = null;
                }, 2800);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildShareUI);
    } else {
        buildShareUI();
    }
})();
