// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ================= TYPING ANIMATION =================
document.addEventListener("DOMContentLoaded", () => {
    // Inject typing container into the hero section val-wrapper
    const valWrapper = document.querySelector('.val-wrapper');
    if (valWrapper) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-container';
        typingDiv.innerHTML = `
            <span class="typing-prefix">I AM A&nbsp;</span>
            <span id="typed-text" class="typed-text"></span>
            <span class="typing-cursor">|</span>
        `;
        valWrapper.appendChild(typingDiv);
    }

    const words = ['VIDEO EDITOR', 'GRAPHIC DESIGNER', 'CONTENT CREATOR', 'THUMBNAIL ARTIST', 'MOTION DESIGNER'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const typedEl = document.getElementById('typed-text');
        if (!typedEl) return;

        const currentWord = words[wordIndex];

        if (!isDeleting) {
            typedEl.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, 1500); // Pause before deleting
                return;
            }
        } else {
            typedEl.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        const speed = isDeleting ? 60 : 110;
        setTimeout(type, speed);
    }

    // Start after preloader
    setTimeout(type, 2500);
});


// ================= NAVBAR AUTO-HIDE & SCROLLSPY =================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const headerEl = document.querySelector('header');
const logoEl = document.querySelector('.logo-sticky');
let lastScrollTop = 0;
let scrollSpyTimeout;

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // 1. Navbar Auto-Hide Logic
    if (scrollTop > lastScrollTop && scrollTop > 150) {
        headerEl?.classList.add('nav-hidden');
        logoEl?.classList.add('nav-hidden');
    } else {
        headerEl?.classList.remove('nav-hidden');
        logoEl?.classList.remove('nav-hidden');
    }
    lastScrollTop = Math.max(0, scrollTop);

    // 2. Scroll Progress Bar
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / totalHeight) * 100;
        progressBar.style.width = progress + '%';
    }

    // 3. ScrollSpy Logic (Active Section Tracking)
    if (scrollSpyTimeout) cancelAnimationFrame(scrollSpyTimeout);
    
    scrollSpyTimeout = requestAnimationFrame(() => {
        let currentSectionId = "";
        const scrollPos = scrollTop + 120; // Adjusted offset for trigger

        sections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        // Update main nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });

        // Update mobile/bubble menu links if they exist
        const bubbleLinks = document.querySelectorAll('.bubble-menu-content a, .mobile-menu-item');
        bubbleLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    });
}, { passive: true });

// Initialize active state on load
window.dispatchEvent(new Event('scroll'));






// Video Facade Loader Logic
const initVideoFacades = () => {
    const facades = document.querySelectorAll('.video-facade');
    facades.forEach(facade => {
        facade.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-src');
            const wrapper = this.parentElement;
            
            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.src = videoSrc;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('webkitallowfullscreen', '');
            iframe.setAttribute('mozallowfullscreen', '');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.background = '#000';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            
            // Clear facade and append iframe
            wrapper.innerHTML = '';
            wrapper.appendChild(iframe);
            
            // Notification (optional)
            if (typeof showNotification === 'function') {
                showNotification('Streaming Started', 'Your video is loading...', 'info', 2000);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', initVideoFacades);


// Lightbox Logic for Project, Contact, Showcase, Social & Blog Sections
const galleryItems = document.querySelectorAll('.g-item img, .bottom-card, .showcase-img, #nova-result-img, .feed-content img, .blog-img img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox && lightboxImg && lightboxClose) {
    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            lightbox.classList.add('active');
            lightboxImg.src = this.tagName === 'IMG' ? this.src : this.querySelector('img').src;
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    lightboxClose.addEventListener('click', closeLightbox);

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-container')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// NOVA BANANA AI Image Generator Logic
const novaInput = document.getElementById('nova-prompt');
const novaBtn = document.getElementById('nova-generate');
const novaResult = document.getElementById('nova-result-img');
const novaPlaceholder = document.getElementById('nova-placeholder');
const novaLoader = document.getElementById('nova-loader');

if (novaBtn) {
    novaBtn.addEventListener('click', () => {
        const promptInfo = novaInput.value.trim();
        if (!promptInfo) return;

        // UI state update
        novaBtn.disabled = true;
        novaBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> GENERATING...';
        novaPlaceholder.style.display = 'none';
        novaResult.style.display = 'none';
        novaLoader.style.display = 'block';

        // Use seed to ensure new image generation each time
        const seed = Math.floor(Math.random() * 10000);
        const renderUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptInfo)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

        const tmpImg = new Image();
        tmpImg.crossOrigin = "anonymous";
        tmpImg.src = renderUrl;

        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            alert('Image generation is taking too long. Please try again with a simpler prompt.');
            novaLoader.style.display = 'none';
            novaPlaceholder.style.display = 'flex';
            novaBtn.disabled = false;
            novaBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> GENERATE';
        }, 30000);

        tmpImg.onload = () => {
            clearTimeout(timeout);
            novaResult.src = renderUrl;
            novaLoader.style.display = 'none';
            novaResult.style.display = 'block';
            novaBtn.disabled = false;
            novaBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> GENERATE';
        };

        tmpImg.onerror = () => {
            clearTimeout(timeout);
            alert('Failed to generate image. Please try again with a different prompt.');
            novaLoader.style.display = 'none';
            novaPlaceholder.style.display = 'flex';
            novaBtn.disabled = false;
            novaBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> GENERATE';
        };
    });

    // Add lightbox functionality for generated images
    if (novaResult && lightbox && lightboxImg) {
        novaResult.addEventListener('click', function () {
            lightbox.classList.add('active');
            lightboxImg.src = this.src;
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
}

// ================= SOCIAL EXTRACTOR LOGIC =================
const extractBtn = document.getElementById('extract-generate');
const extractInput = document.getElementById('extract-prompt');
const extractResult = document.getElementById('extract-result');

if (extractBtn && extractInput && extractResult) {
    extractBtn.addEventListener('click', () => {
        const url = extractInput.value.trim();
        if (!url) return alert('Please enter a valid video URL first!');

        // Aesthetic Processing UI
        const originalBtnHtml = extractBtn.innerHTML;
        extractBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> EXTRACTING...';
        extractBtn.disabled = true;

        extractResult.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 3.5rem; color: var(--accent-blue); margin-bottom: 20px;"></i>
            <p style="font-family: var(--font-head); font-size: 1.5rem; letter-spacing: 2px; color: #fff; margin:0;">ANALYZING SERVER...</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">Please wait a moment while we fetch the media.</p>
        `;

        // Smart Redirect / Routing Logic (1.8s delay for premium AI feel)
        setTimeout(() => {
            let platformIcon = 'video';
            let platformName = 'Video';
            let dlLink = '#';

            const lowerUrl = url.toLowerCase();

            if (lowerUrl.includes('tiktok.com')) {
                platformIcon = 'tiktok'; platformName = 'TikTok';
                dlLink = `https://snaptik.app/?url=${encodeURIComponent(url)}`;
            } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
                platformIcon = 'youtube'; platformName = 'YouTube';
                dlLink = `https://en.savefrom.net/1-youtube-video-downloader-362/?url=${encodeURIComponent(url)}`;
            } else if (lowerUrl.includes('instagram.com')) {
                platformIcon = 'instagram'; platformName = 'Instagram';
                dlLink = `https://snapinsta.app/?url=${encodeURIComponent(url)}`;
            } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch') || lowerUrl.includes('fb.com')) {
                platformIcon = 'facebook'; platformName = 'Facebook';
                dlLink = `https://fdown.net/download.php?url=${encodeURIComponent(url)}`;
            } else {
                // Fallback Error UI
                extractResult.innerHTML = `
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3.5rem; color: #ed215e; margin-bottom: 20px;"></i>
                    <p style="font-family: var(--font-head); font-size: 1.5rem; letter-spacing: 2px; color: #ed215e; margin:0;">UNSUPPORTED PLATFORM</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; padding: 0 20px; text-align: center;">Please try standard paths for YouTube, TikTok, Facebook, or Instagram.</p>
                `;
                extractBtn.innerHTML = originalBtnHtml;
                extractBtn.disabled = false;
                return;
            }

            // Success UI
            extractResult.innerHTML = `
                <div style="text-align: center; display:flex; flex-direction:column; align-items:center; justify-content: center; height: 100%; gap: 15px;">
                    <i class="fa-brands fa-${platformIcon}" style="font-size: 4rem; color: var(--accent-blue); filter: drop-shadow(0 0 20px rgba(27,138,219,0.5));"></i>
                    <h3 style="color: #fff; font-family: var(--font-head); letter-spacing: 3px; font-size: 2.2rem; margin:0;">${platformName} FILE READY</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; padding: 0 40px; margin:0;">The media stream has been processed successfully! Click below to safely download your media offline.</p>
                    <a href="${dlLink}" target="_blank" class="btn-generate" style="text-decoration: none; margin-top: 15px; width: auto; font-size:1rem; padding: 15px 35px; background: #fff; color: #000; box-shadow: 0 10px 20px rgba(255,255,255,0.2);">
                        <i class="fa-solid fa-cloud-arrow-down" style="color: #000;"></i> DOWNLOAD NOW
                    </a>
                </div>
            `;

            // Reset Button
            extractBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> PROCESS NEW LINK';
            extractBtn.disabled = false;
            extractInput.value = '';
        }, 1800);
    });
}

// ================= CREATOR TOOLS TAB LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const tabNova = document.getElementById('btn-tab-nova');
    const tabMotion = document.getElementById('btn-tab-motion');
    const tabExtractor = document.getElementById('btn-tab-extractor');

    const viewNova = document.getElementById('view-nova');
    const viewMotion = document.getElementById('view-motion');
    const viewExtractor = document.getElementById('view-extractor');

    const switchTab = (activeTab, activeView) => {
        [tabNova, tabMotion, tabExtractor].filter(t => t).forEach(t => t.classList.remove('active'));
        [viewNova, viewMotion, viewExtractor].filter(v => v).forEach(v => v.style.display = 'none');
        if (activeTab) activeTab.classList.add('active');
        if (activeView) activeView.style.display = 'flex';
    };

    if (tabNova) tabNova.addEventListener('click', () => switchTab(tabNova, viewNova));
    if (tabMotion) tabMotion.addEventListener('click', () => switchTab(tabMotion, viewMotion));
    if (tabExtractor) tabExtractor.addEventListener('click', () => switchTab(tabExtractor, viewExtractor));

    // ================= NOVA MOTION AI (VIDEO) LOGIC =================
    const motionBtn = document.getElementById('motion-generate');
    const motionInput = document.getElementById('motion-prompt');
    const motionVideo = document.getElementById('motion-result-video');
    const motionPlaceholder = document.getElementById('motion-placeholder');
    const motionLoader = document.getElementById('motion-loader');
    const motionContainer = document.getElementById('motion-video-container');

    const demoVideos = [
        "https://cdn.pixabay.com/vimeo/451368297/451368297.mp4?width=1280&hash=123", // Abstract
        "https://cdn.pixabay.com/vimeo/328940142/328940142.mp4?width=1280&hash=123", // Tech
        "https://cdn.pixabay.com/vimeo/464303350/464303350.mp4?width=1280&hash=123"  // Cyber
    ];

    if (motionBtn) {
        motionBtn.addEventListener('click', () => {
            const prompt = motionInput.value.trim();
            if (!prompt) return;

            motionBtn.disabled = true;
            motionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> GENERATING VIDEO...';
            motionPlaceholder.style.display = 'none';
            motionContainer.style.display = 'none';
            motionLoader.style.display = 'block';

            setTimeout(() => {
                const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
                motionVideo.src = randomVideo;
                motionVideo.load();
                motionVideo.oncanplay = () => {
                    motionLoader.style.display = 'none';
                    motionContainer.style.display = 'block';
                    motionVideo.play();
                    motionBtn.disabled = false;
                    motionBtn.innerHTML = '<i class="fa-solid fa-clapperboard"></i> GENERATE VIDEO';
                };
            }, 3500);
        });
    }
});

// ================= 3D ANIMATION & SCROLL EFFECTS =================
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically assign AOS attributes to elements
    document.querySelectorAll('section > .container').forEach((el) => {
        el.setAttribute('data-aos', 'fade-up');
    });

    document.querySelectorAll('.about-left, .nova-left').forEach(el => el.setAttribute('data-aos', 'fade-right'));
    document.querySelectorAll('.about-right, .nova-right').forEach(el => el.setAttribute('data-aos', 'fade-left'));

    document.querySelectorAll('.g-item, .bottom-card, .showcase-img-wrapper').forEach((el, index) => {
        el.setAttribute('data-aos', 'zoom-in-up');
        el.setAttribute('data-aos-delay', (index % 4) * 100);
    });

    document.querySelectorAll('.val-wrapper .val-side-text.left-text').forEach(el => el.setAttribute('data-aos', 'fade-right'));
    document.querySelectorAll('.val-wrapper .val-side-text.right-text').forEach(el => el.setAttribute('data-aos', 'fade-left'));
    document.querySelectorAll('.val-victory').forEach(el => {
        el.setAttribute('data-aos', 'zoom-in');
        el.setAttribute('data-aos-duration', '1500');
    });

    // Initialize AOS Physics
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 100
        });
    }

    // Initialize VanillaTilt 3D Engine for Interactive Hover (Optimized: Disabled on mobile)
    if (typeof VanillaTilt !== 'undefined' && window.innerWidth > 768) {
        VanillaTilt.init(document.querySelectorAll(".g-item, .bottom-card, .showcase-img-wrapper, .about-img-container, .contact-avatar, .skill-icon, .badge-card"), {
            max: 12,
            speed: 400,
            glare: true,
            "max-glare": 0.25,
            scale: 1.02
        });
    }

    // Add glowing card effects
    document.querySelectorAll('.g-item, .bottom-card, .showcase-img-wrapper').forEach(el => {
        el.classList.add('glowing-card');
    });

    // Add animated electric border to AI/Tech Cards
    document.querySelectorAll('.nova-container').forEach(el => {
        el.classList.add('electric-card');
    });

    // VFX Toggle handler
    const vfxToggle = document.getElementById('vfx-toggle');
    if (vfxToggle) {
        vfxToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('vfx-off');
            } else {
                document.body.classList.add('vfx-off');
            }
        });
    }

    // Glass Bubble Menu Toggle
    const bubbleBtn = document.getElementById('bubble-btn');
    const bubbleContent = document.getElementById('bubble-menu-content');
    if (bubbleBtn && bubbleContent) {
        bubbleBtn.addEventListener('click', () => {
            bubbleContent.classList.toggle('active');
            const icon = bubbleBtn.querySelector('i');
            if (bubbleContent.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        bubbleContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                bubbleContent.classList.remove('active');
                bubbleBtn.querySelector('i').classList.remove('fa-xmark');
                bubbleBtn.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // Currently Working On Widget Logic
    const YOUTUBE_API_KEY = '';// <--- Insert your YouTube Data API key here
    const CHANNEL_ID = '';// <--- Insert your channel ID here

    const subscriberSpan = document.getElementById('subscriber-count-value');
    const nextVideoDateSpan = document.getElementById('next-video-date');
    // Optionally set a static next video date (you can update this dynamically later)
    const NEXT_VIDEO_DATE = '2026-06-15';
    if (nextVideoDateSpan) nextVideoDateSpan.textContent = NEXT_VIDEO_DATE;

    function fetchSubscriberCount() {
        if (!YOUTUBE_API_KEY || !CHANNEL_ID) {
            if (subscriberSpan) subscriberSpan.textContent = 'API key missing';
            return;
        }
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const count = data.items?.[0]?.statistics?.subscriberCount;
                if (subscriberSpan) subscriberSpan.textContent = count ? `${Number(count).toLocaleString()} subscribers` : 'N/A';
            })
            .catch(() => {
                if (subscriberSpan) subscriberSpan.textContent = 'Error fetching';
            });
    }

    // Run on page load
    fetchSubscriberCount();

    const quoteBtn = document.getElementById('quote-btn');
    const quoteModal = document.getElementById('quote-modal');
    const quoteClose = document.getElementById('quote-close');
    const calculateBtn = document.getElementById('calculate-price');
    const priceResult = document.getElementById('price-result');

    const baseRates = {
        video: 100, // per minute
        animation: 150,
        graphic: 80,
    };
    const styleMultipliers = {
        basic: 1,
        advanced: 1.5,
        premium: 2,
    };
    const timelineMultipliers = {
        standard: 1,
        rush: 1.3,
    };

    function openQuote() { if (quoteModal) quoteModal.style.display = 'flex'; }
    function closeQuote() { if (quoteModal) quoteModal.style.display = 'none'; }

    if (quoteBtn) quoteBtn.addEventListener('click', openQuote);
    if (quoteClose) quoteClose.addEventListener('click', closeQuote);
    // Close when clicking outside the modal content
    if (quoteModal) {
        quoteModal.addEventListener('click', (e) => { if (e.target === quoteModal) closeQuote(); });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const service = document.getElementById('service-type').value;
            const length = parseInt(document.getElementById('video-length').value, 10) || 0;
            const style = document.getElementById('style-select').value;
            const timeline = document.getElementById('timeline-select').value;
            const base = baseRates[service] || 0;
            const price = Math.round(base * length * styleMultipliers[style] * timelineMultipliers[timeline]);
            if (priceResult) priceResult.textContent = price ? `$${price}` : 'Please fill all fields';
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const icon = themeToggleBtn.querySelector('i');
            if (document.body.classList.contains('light-theme')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }


// ================= GSAP SCROLLTRIGGER SECTIONS ANIMATION =================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Apply cinematic fade/slide animation to all main sections
        const mainSections = document.querySelectorAll('section');
        
        mainSections.forEach((section) => {
            // Skip the home/hero section as it typically has its own entrance animations
            if (section.id === 'home') return;

            // Cinematic GSAP ScrollTrigger effect
            gsap.fromTo(section, 
                { 
                    opacity: 0, 
                    y: 80, // Slide up from 80px for cinematic feel
                    scale: 0.96 // Subtle scale down
                }, 
                {
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    duration: 1.2, 
                    ease: "power3.out", // Smooth cinematic ease
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%", // Starts animating when top of section is 85% down the viewport
                        end: "top 20%",
                        toggleActions: "play none none reverse", // Play on enter, reverse on leave back
                    }
                }
            );
        });
    }

    // ================= MUSIC PLAYER LOGIC =================
    const musicMini = document.getElementById('music-mini');
    const musicPlayer = document.getElementById('music-player');
    const closePlayer = document.getElementById('close-player');
    const mainAudio = document.getElementById('main-audio');
    const playPauseBtn = document.getElementById('play-pause');
    const progress = document.getElementById('progress');
    const progressContainer = document.querySelector('.progress-container');
    const volumeSlider = document.getElementById('volume');
    const songTitle = document.getElementById('song-title');
    const artist = document.getElementById('artist');
    const songArt = document.querySelector('.song-art img');

    const songs = [
        { title: "2000 Medley", artist: "Embilipitiya Delighted", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/2000 Medley  Embilipitiya Delighted.mp3" },
        { title: "Pal Pal", artist: "Afusic", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Afusic - Pal Pal (Official Music Video) Prod. @AliSoomroMusic.mp3" },
        { title: "Headlights", artist: "Alok & Alan Walker", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Alok & Alan Walker - Headlights (feat. KIDDO) [Official Lyric Video].mp3" },
        { title: "Kansa Nonstop", artist: "Embilipitiya Delighted", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Kansa Nonstop  Embilipitiya Delighted.mp3" },
        { title: "Majboor", artist: "Sheheryar Rehan", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Majboor  Sheheryar Rehan x Zoha Waseem  Official Music Video 2025.mp3" },
        { title: "Majboor - Mashup", artist: "Aditya Rikhari x Talwiinder", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Majboor - Mashup  Aditya Rikhari x Talwiinder  Aapka hi kehna banta  Ash Vibes.mp3" },
        { title: "Api Aye Hamuwela", artist: "Uvindu Ayshcharya", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "MUSIC/Uvindu Ayshcharya Ft. @DILUBeats - Api Aye Hamuwela (නඹ නමතව හඳනන)  Official Music Video.mp3" }
    ];

    let songIndex = 0;
    let isPlaying = false;

    function loadSong(song) {
        if (songTitle) songTitle.innerText = song.title;
        if (artist) artist.innerText = song.artist;
        if (songArt) songArt.src = song.art;
        if (mainAudio) mainAudio.src = song.src;
    }

    // Load the first song initially
    loadSong(songs[songIndex]);

    function playSong() {
        if (!mainAudio) return;
        isPlaying = true;
        if (musicMini) musicMini.classList.add('playing');
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

        mainAudio.play().catch(err => {
            console.log('Autoplay blocked or audio error:', err);
            isPlaying = false;
            if (musicMini) musicMini.classList.remove('playing');
            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
    }

    function pauseSong() {
        isPlaying = false;
        if (musicMini) musicMini.classList.remove('playing');
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (mainAudio) mainAudio.pause();
    }

    if (musicMini && musicPlayer && closePlayer) {
        musicMini.addEventListener('click', () => {
            musicPlayer.classList.add('active');
        });

        closePlayer.addEventListener('click', () => {
            musicPlayer.classList.remove('active');
        });

        // Tab Switching Logic
        const tabLocal = document.getElementById('tab-local');
        const tabSoundCloud = document.getElementById('tab-soundcloud');
        const localView = document.getElementById('local-player-view');
        const scView = document.getElementById('soundcloud-player-view');

        if (tabLocal && tabSoundCloud && localView && scView) {
            tabLocal.addEventListener('click', () => {
                tabLocal.classList.add('active');
                tabSoundCloud.classList.remove('active');
                localView.style.display = 'block';
                scView.style.display = 'none';
            });

            tabSoundCloud.addEventListener('click', () => {
                tabSoundCloud.classList.add('active');
                tabLocal.classList.remove('active');
                localView.style.display = 'none';
                scView.style.display = 'block';
                pauseSong();
            });
        }

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                isPlaying ? pauseSong() : playSong();
            });
        }

        if (mainAudio) {
            mainAudio.addEventListener('timeupdate', (e) => {
                const { duration, currentTime } = e.target;
                if (duration && progress) {
                    const progressPercent = (currentTime / duration) * 100;
                    progress.style.width = `${progressPercent}%`;
                }
            });

            mainAudio.addEventListener('ended', () => {
                // Auto-play next song
                songIndex = (songIndex + 1) % songs.length;
                loadSong(songs[songIndex]);
                playSong();
            });

            mainAudio.addEventListener('error', (e) => {
                console.log('Audio loading error:', e);
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>';
            });
        }

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                if (!mainAudio) return;
                const width = progressContainer.clientWidth;
                const clickX = e.offsetX;
                const duration = mainAudio.duration;
                if (duration) mainAudio.currentTime = (clickX / width) * duration;
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                if (mainAudio) mainAudio.volume = e.target.value;
            });
        }

        const nextBtn = document.getElementById('next');
        const prevBtn = document.getElementById('prev');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                songIndex = (songIndex + 1) % songs.length;
                loadSong(songs[songIndex]);
                playSong();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                songIndex = (songIndex - 1 + songs.length) % songs.length;
                loadSong(songs[songIndex]);
                playSong();
            });
        }
    }

    // ================= AI ASSISTANT LOGIC =================
    const aiMini = document.getElementById('ai-mini');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const closeAi = document.getElementById('close-ai');
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const aiMessages = document.getElementById('ai-messages');
    const aiVoice = document.getElementById('ai-voice');

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && aiVoice) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            aiVoice.classList.add('recording');
            aiVoice.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
            aiInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            aiInput.value = transcript;
            setTimeout(() => sendMessage(), 600);
        };

        recognition.onerror = (e) => {
            console.error("Speech recognition error:", e.error);
            stopRecognition();
        };

        recognition.onend = () => {
            stopRecognition();
        };

        function stopRecognition() {
            aiVoice.classList.remove('recording');
            aiVoice.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            aiInput.placeholder = "Ask me anything...";
        }

        aiVoice.addEventListener('click', () => {
            if (aiVoice.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else if (aiVoice) {
        aiVoice.title = "Speech Recognition not supported in this browser";
        aiVoice.style.opacity = "0.5";
        aiVoice.style.cursor = "not-allowed";
    }

    if (aiMini && aiChatWindow && closeAi) {
        aiMini.addEventListener('click', () => {
            aiChatWindow.classList.add('active');
            if (aiMessages.children.length === 1) { // Only first time
                setTimeout(() => {
                    appendMessage("I can help you explore Biman's projects, skills, or even get in touch with him! Just ask.", 'bot');
                }, 1000);
            }
        });

        closeAi.addEventListener('click', () => {
            aiChatWindow.classList.remove('active');
        });

        const appendMessage = (text, type) => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('ai-msg', type);
            msgDiv.innerHTML = `<p>${text}</p>`;
            aiMessages.appendChild(msgDiv);

            // Smooth scroll to bottom
            aiMessages.scrollTo({
                top: aiMessages.scrollHeight,
                behavior: 'smooth'
            });
        };

        const showTypingIndicator = () => {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('ai-msg', 'bot', 'typing-indicator');
            typingDiv.id = 'ai-typing';
            typingDiv.innerHTML = `<p><span>.</span><span>.</span><span>.</span></p>`;
            aiMessages.appendChild(typingDiv);
            aiMessages.scrollTop = aiMessages.scrollHeight;
            return typingDiv;
        };

        const handleAiResponse = async (userText) => {
            const indicator = showTypingIndicator();
            const lowerText = userText.toLowerCase().trim();

            // --- INTENT MAPPING & COMMAND EXECUTION ---
            let response = "I'm not exactly sure how to help with that, but I'm learning! You can try asking about Biman's projects, skills, or contact info.";
            let quickActions = ['Who is Biman?', 'Show me projects', 'Contact info'];
            let command = null;

            // 1. Social Media Intents
            if (lowerText.includes('open instagram') || lowerText.includes('check instagram')) {
                response = "Opening Biman's Instagram for you! Don't forget to follow for behind-the-scenes content.";
                command = () => window.open('https://instagram.com/biman_ranasinghe', '_blank');
                quickActions = ['Follow on YouTube', 'Go to Contact'];
            } else if (lowerText.includes('open youtube') || lowerText.includes('watch youtube')) {
                response = "Sure! Heading over to Biman XD on YouTube. He has some amazing tutorials there.";
                command = () => window.open('https://youtube.com/@BIMANXD', '_blank');
                quickActions = ['Check Instagram', 'See his edits'];
            } else if (lowerText.includes('open tiktok')) {
                response = "Opening TikTok! Get ready for some quick creative tips.";
                command = () => window.open('https://tiktok.com/@biman_ranasinghe', '_blank');
            } else if (lowerText.includes('open github') || lowerText.includes('github')) {
                response = "Opening Biman's GitHub repository. Check out his latest code and projects!";
                command = () => window.open('https://github.com/bimanranasinghe', '_blank');
            }

            // 2. Navigation Intents
            else if (lowerText.includes('go to project') || lowerText.includes('show project') || lowerText.includes('view work')) {
                response = "Taking you to the Projects section. Biman has some stunning video edits and graphics there!";
                command = () => document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' });
                quickActions = ['Tell me about his skills', 'How much does he charge?'];
            } else if (lowerText.includes('contact') || lowerText.includes('reach him') || lowerText.includes('hire him')) {
                response = "Navigating to the Contact section. You can reach Biman via WhatsApp, Email, or the form!";
                command = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                quickActions = ['Open WhatsApp', 'Send an Email'];
            } else if (lowerText.includes('go to home') || lowerText.includes('back to top')) {
                response = "Heading back to the start!";
                command = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (lowerText.includes('go to services') || lowerText.includes('pricing')) {
                response = "Checking out the services and pricing? Great choice! Scrolling down for you.";
                command = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            } else if (lowerText.includes('creator tools') || lowerText.includes('nova ai tools')) {
                response = "Opening the Creator Tools section. You can try the AI Image Generator or Video Extractor here!";
                command = () => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
            }

            // 3. Utility Intents
            else if (lowerText.includes('time') || lowerText.includes('clock')) {
                const now = new Date();
                response = `The current time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Time to create something amazing!`;
            } else if (lowerText.includes('date') || lowerText.includes('today')) {
                const today = new Date();
                response = `Today's date is ${today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
            } else if (lowerText.includes('clear chat') || lowerText.includes('delete messages')) {
                response = "Clearing the chat history for you... Done!";
                command = () => {
                    setTimeout(() => {
                        aiMessages.innerHTML = `
                            <div class="ai-msg bot">
                                <p>Chat cleared! How can I help you now?</p>
                            </div>
                        `;
                    }, 1000);
                };
            } else if (lowerText.includes('reload') || lowerText.includes('refresh')) {
                response = "Refreshing the page in a second...";
                command = () => setTimeout(() => window.location.reload(), 1500);
            }

            // 4. Personal & Fun Intents
            else if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText === 'hi' || lowerText.includes('hey')) {
                response = "Hey! I'm Nova. I'm here to help you navigate Biman's portfolio. What's on your mind?";
                quickActions = ['Tell me about Biman', 'Show me his skills', 'Open Instagram'];
            } else if (lowerText.includes('who is biman') || lowerText.includes('about biman')) {
                response = "Biman is a multi-talented Content Creator, Video Editor, and Motion Designer from Sri Lanka. He specializes in creating high-impact visual content for gamers and brands!";
                quickActions = ['What are his skills?', 'Show his journey'];
            } else if (lowerText.includes('joke')) {
                const jokes = [
                    "Why did the video editor go to the doctor? Because he had too many 'cuts'!",
                    "How many motion designers does it take to change a lightbulb? Only one, but they'll need 3 weeks to render it.",
                    "Why do graphics designers always stay calm? Because they know how to 'Ctrl+Z' their mistakes!"
                ];
                response = jokes[Math.floor(Math.random() * jokes.length)];
            } else if (lowerText.includes('favorite game')) {
                response = "Biman is a huge fan of Valorant! That's why this website has that sleek, tactical feel.";
            }

            // 5. Portfolio Info Intents
            else if (lowerText.includes('skills') || lowerText.includes('software')) {
                response = "Biman is a master of Adobe Premiere Pro, After Effects, Photoshop, and Blender. He also works with Cinema 4D and DaVinci Resolve.";
                quickActions = ['View his projects', 'Check his pricing'];
            } else if (lowerText.includes('sri lanka') || lowerText.includes('location') || lowerText.includes('where')) {
                response = "Biman is based in the beautiful island of Sri Lanka! 🇱🇰 He works with clients globally from his home studio.";
            }

            setTimeout(() => {
                indicator.remove();
                appendMessage(response, 'bot');
                
                // Execute command if any
                if (command) {
                    setTimeout(command, 800);
                }

                if (quickActions) {
                    setTimeout(() => appendQuickActions(quickActions), 500);
                }
            }, 1000 + Math.random() * 800);
        };

        const appendQuickActions = (actions) => {
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('ai-msg', 'bot', 'quick-actions');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.flexWrap = 'wrap';
            actionsDiv.style.gap = '8px';
            actionsDiv.style.marginTop = '10px';
            
            actionsDiv.innerHTML = actions.map(action => `
                <button class="quick-btn" style="
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">${action}</button>
            `).join('');

            aiMessages.appendChild(actionsDiv);
            aiMessages.scrollTo({ top: aiMessages.scrollHeight, behavior: 'smooth' });

            // Add click handlers
            actionsDiv.querySelectorAll('.quick-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const action = btn.textContent;
                    appendMessage(action, 'user');
                    handleAiResponse(action);
                    
                    // Optional: Remove actions after click to keep chat clean
                    // actionsDiv.style.opacity = '0.5';
                    // actionsDiv.style.pointerEvents = 'none';
                });
                
                // Hover effect
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'var(--accent-blue)';
                    btn.style.borderColor = 'var(--accent-blue)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.borderColor = 'rgba(255,255,255,0.1)';
                });
            });
        };

        const handleQuickAction = (action) => {
            const indicator = showTypingIndicator();
            setTimeout(() => {
                indicator.remove();
                if (action === 'Show me his skills') {
                    appendMessage("Biman's skills include Video Editing (95%), Graphic Design (90%), 3D Modeling (75%), and Web Development (85%). He uses Adobe Suite, Blender, and more!", 'bot');
                    setTimeout(() => scrollToSection('#about'), 1000);
                } else if (action === 'Tell me about his projects') {
                    appendMessage("Biman has worked on Valorant montages, gaming thumbnails, stream overlays, and 3D animations. Check out his project showcase!", 'bot');
                    setTimeout(() => scrollToSection('#project'), 1000);

                } else if (action === 'View his projects') {
                    appendMessage("Scrolling to Biman's amazing project portfolio now!", 'bot');
                    scrollToSection('#project');
                } else if (action === 'See his software skills') {
                    appendMessage("Biman masters Premiere Pro, After Effects, Photoshop, Blender, and more. See the full list in his skills section!", 'bot');
                    scrollToSection('#about');

                } else if (action === 'View pricing') {
                    appendMessage("Check out Biman's service packages!", 'bot');
                    scrollToSection('#pricing');
                } else if (action === 'Order a service') {
                    appendMessage("Ready to hire Biman? Check out his services and packages!", 'bot');
                    scrollToSection('#pricing');
                } else if (action === 'Read the blog') {
                    appendMessage("Enjoy reading Biman's latest articles!", 'bot');
                    scrollToSection('#blog');
                } else if (action === 'Latest tips') {
                    appendMessage("Biman's blog has tips on editing, thumbnails, and growth!", 'bot');
                    scrollToSection('#blog');
                } else if (action === 'Read reviews') {
                    appendMessage("Clients give Biman 4.9 stars! Read their feedback.", 'bot');
                    scrollToSection('#testimonials');
                } else if (action === 'See client feedback') {
                    appendMessage("Scrolling to client testimonials!", 'bot');
                    scrollToSection('#testimonials');
                } else if (action === 'Read his story') {
                    appendMessage("Learn about Biman's journey from beginner to pro!", 'bot');
                    scrollToSection('#journey');
                } else if (action === 'View timeline') {
                    appendMessage("Check out the timeline of his achievements!", 'bot');
                    scrollToSection('#journey');
                } else if (action === 'Try image generator') {
                    appendMessage("Try Nova AI Image Generator in the tools section!", 'bot');
                    scrollToSection('#tools');
                } else if (action === 'Use video tool') {
                    appendMessage("Use the social extractor or motion AI tools!", 'bot');
                    scrollToSection('#tools');
                } else if (action === 'Follow on YouTube') {
                    window.open('https://youtube.com/@BIMANXD', '_blank');
                    appendMessage("Opened Biman's YouTube channel!", 'bot');
                } else if (action === 'Check Instagram') {
                    window.open('https://instagram.com/@BIMANXD', '_blank');
                    appendMessage("Opened Biman's Instagram!", 'bot');
                } else if (action === 'Explore portfolio') {
                    appendMessage("Let's explore! What interests you most?", 'bot');
                    setTimeout(() => appendQuickActions(['Projects', 'Skills', 'Services']), 500);
                } else if (action === 'Get help navigating') {
                    appendMessage("I can take you to any section. Which one?", 'bot');
                    setTimeout(() => appendQuickActions(['Home', 'About']), 500);
                } else if (action === 'Projects') {
                    scrollToSection('#project');
                    appendMessage("Enjoy exploring the projects!", 'bot');
                } else if (action === 'Skills') {
                    scrollToSection('#about');
                    appendMessage("Check out his impressive skills!", 'bot');
                } else if (action === 'Services') {
                    scrollToSection('#pricing');
                    appendMessage("See what services he offers!", 'bot');
                } else if (action === 'Home') {
                    scrollToSection('#home');
                    appendMessage("Back to the top!", 'bot');
                } else if (action === 'About') {
                    scrollToSection('#about');
                    appendMessage("Learn more about Biman!", 'bot');

                }
            }, 1500);
        };

        const scrollToSection = (selector) => {
            const target = document.querySelector(selector);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const sendMessage = () => {
            const text = aiInput.value.trim();
            if (!text) return;

            appendMessage(text, 'user');
            aiInput.value = '';
            handleAiResponse(text);
        };

        aiSend.addEventListener('click', sendMessage);
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// ================= PRELOADER LOGIC =================
document.addEventListener("DOMContentLoaded", function () {
    console.log("Portfolio Loaded Successfully");

    // ================= CUSTOM CINEMATIC CURSOR LOGIC =================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        let isHoveringMagnetic = false;

        window.addEventListener('mousemove', (e) => {
            if (!isHoveringMagnetic) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }
            
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        });

        // Smooth trailing effect for the outline
        function animateCursor() {
            let easing = 0.15;
            outlineX += (mouseX - outlineX) * easing;
            outlineY += (mouseY - outlineY) * easing;
            
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Magnetic and Hover states
        const interactables = document.querySelectorAll('a, button, .project-card, .service-card, .hover-target, .social-icon-new, .filter-btn, .pricing-btn');
        
        interactables.forEach(el => {
            const isMagnetic = el.classList.contains('nav-link') || 
                               el.classList.contains('pricing-btn') || 
                               el.classList.contains('resume-btn') || 
                               el.classList.contains('social-icon-new') ||
                               el.classList.contains('filter-btn') ||
                               el.tagName === 'BUTTON';

            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
                if (isMagnetic) {
                    isHoveringMagnetic = true;
                    el.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
            });

            if (isMagnetic) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const distanceX = e.clientX - centerX;
                    const distanceY = e.clientY - centerY;
                    
                    // Pull the element towards the cursor
                    el.style.transform = `translate(${distanceX * 0.3}px, ${distanceY * 0.3}px)`;
                    
                    // Pull the cursor outline towards the element center
                    mouseX = centerX + distanceX * 0.15;
                    mouseY = centerY + distanceY * 0.15;
                });
            }

            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                isHoveringMagnetic = false;
                if (isMagnetic) {
                    el.style.transform = `translate(0, 0)`;
                    el.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
            });
        });
        
        // Handle clicking state
        window.addEventListener('mousedown', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0.7)';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        
        window.addEventListener('mouseup', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // ================= STATS COUNTER ANIMATION =================
    const statsCounters = document.querySelectorAll('.stat-count');
    
    if (statsCounters.length > 0) {
        const animateCount = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            const hidePlus = el.style.getPropertyValue('--hide-plus') === '1';

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function: easeOutExpo
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                
                const currentCount = Math.floor(easeProgress * target);
                el.innerText = currentCount.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.innerText = target.toLocaleString();
                }
            };

            requestAnimationFrame(update);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        statsCounters.forEach(counter => statsObserver.observe(counter));
    }



    const preloader = document.getElementById("preloader");
    const loadingBar = document.getElementById("loading-bar");
    const loadingPercentage = document.getElementById("loading-percentage");

    if (preloader) {
        // Prevent scrolling while loading
        document.body.style.overflow = "hidden";

        let progress = 0;
        const duration = 2000; // 2 seconds total loading simulation
        const interval = 20; // ms
        const steps = duration / interval;
        const increment = 100 / steps;

        const loaderTimer = setInterval(() => {
            progress += increment;

            // Randomize progress for realistic effect
            if (Math.random() > 0.7) {
                progress += Math.random() * 5;
            }

            if (progress >= 100) {
                progress = 100;
                clearInterval(loaderTimer);

                // Complete! Fade out preloader
                setTimeout(() => {
                    preloader.classList.add("hidden");
                    document.body.style.overflow = "auto";

                    // Trigger AOS refresh after preloader is gone to make sure animations play correctly
                    setTimeout(() => {
                        if (typeof AOS !== 'undefined') {
                            AOS.refresh();
                        }
                    }, 500);
                }, 500);
            }

            loadingBar.style.width = `${progress}%`;
            loadingPercentage.innerText = `${Math.floor(progress)}%`;
        }, interval);
    }
});

// ================= 3D CAROUSEL LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById('carousel-3d');
    const prevBtn = document.getElementById('car-prev');
    const nextBtn = document.getElementById('car-next');

    if (carousel && prevBtn && nextBtn) {
        let currentAngle = 0;
        const angleStep = 72; // 360 / 5 cards
        let autoRotateTimer;

        function rotateCarousel() {
            carousel.style.transform = `rotateY(${currentAngle}deg)`;
            resetAutoRotate();
        }

        function nextSlide() {
            currentAngle -= angleStep;
            rotateCarousel();
        }

        function prevSlide() {
            currentAngle += angleStep;
            rotateCarousel();
        }

        function resetAutoRotate() {
            clearInterval(autoRotateTimer);
            autoRotateTimer = setInterval(nextSlide, 5000);
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Touch Support for Mobile Swiping
        let startX;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            clearInterval(autoRotateTimer); // Stop auto-rotate while interacting
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            const threshold = 50; // Minimum swipe distance in px

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide(); // Swipe left -> Next
                } else {
                    prevSlide(); // Swipe right -> Prev
                }
            } else {
                resetAutoRotate(); // Resume if no swipe occurred
            }
            isDragging = false;
        }, { passive: true });

        // Initial start
        resetAutoRotate();
    }
});

// ================= FAQ ACCORDION LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Check if item is already active
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));

            // If not active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// ================= NEWSLETTER LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMsg = document.getElementById('newsletter-msg');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('subscriber-email').value;

            // Simulation of submission
            newsletterMsg.style.display = 'block';
            newsletterMsg.style.color = 'var(--accent-blue)';
            newsletterMsg.innerText = 'Subscribing...';

            setTimeout(() => {
                newsletterMsg.style.color = '#10b981'; // Green success
                newsletterMsg.innerText = `Welcome to the squad! Success: ${email} registered.`;
                newsletterForm.reset();
            }, 1500);
        });
    }

// Live Visitor Counter Simulation
const visitorCountEl = document.getElementById('visitor-count');

if (visitorCountEl) {
    let count = 1; 
    // 125 saha 256 athara random number ekak target eka widiyata gannawa
    const targetCount = Math.floor(Math.random() * (256 - 125 + 1)) + 125; 
    
    visitorCountEl.innerText = count;

    // Step 1: Count up animation (1 idan target ekata yanawa)
    const countUpInterval = setInterval(() => {
        // Step size eka podi kala (125-256 nisa lassanata duwala yanna)
        const increment = Math.floor(Math.random() * 5) + 2; 
        count += increment;

        if (count >= targetCount) {
            count = targetCount; // Target ekatama set karanawa
            visitorCountEl.innerText = count;
            clearInterval(countUpInterval);

            // Step 2: Live fluctuate wena eka patan gannawa
            startLiveFluctuation(count);
        } else {
            visitorCountEl.innerText = count;
        }
    }, 50); 

    function startLiveFluctuation(initialCount) {
        let currentLiveCount = initialCount;
        
        setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1; 
            const fluctuation = Math.floor(Math.random() * 2) + 1;
            
            // Numbers 100 ta wada adu wenne nathi wenna limit ekak
            currentLiveCount = Math.max(100, currentLiveCount + (change * fluctuation));
            
            visitorCountEl.innerText = currentLiveCount;
            
        }, 4000 + Math.random() * 2000);
    }
}
    // Resume Download Counter Simulation
    const downloadBtn = document.getElementById('download-cv');
    const cvCountEl = document.getElementById('cv-count');

    if (downloadBtn && cvCountEl) {
        let cvDownloads = parseInt(localStorage.getItem('cv_downloads')) || 1426;
        cvCountEl.innerText = cvDownloads;

        downloadBtn.addEventListener('click', () => {
            cvDownloads++;
            cvCountEl.innerText = cvDownloads;
            localStorage.setItem('cv_downloads', cvDownloads);

            // Success animation
            cvCountEl.style.color = '#00ff88';
            cvCountEl.style.transition = 'all 0.3s ease';
            cvCountEl.parentElement.style.borderColor = '#00ff88';

            setTimeout(() => {
                cvCountEl.style.color = '';
                cvCountEl.parentElement.style.borderColor = '';
            }, 1000);
        });
    }
});

// ================= PROJECT FILTER LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.g-item');
    const searchInput = document.getElementById('project-search');

    let currentFilter = 'all';
    let searchQuery = '';

    const filterProjects = () => {
        projectItems.forEach(item => {
            const category = (item.getAttribute('data-category') || "").toLowerCase();
            const altText = (item.querySelector('img')?.getAttribute('alt') || "").toLowerCase();
            const iframeId = (item.querySelector('iframe')?.id || "").toLowerCase();

            const matchesFilter = currentFilter === 'all' || category === currentFilter;
            const matchesSearch = altText.includes(searchQuery) ||
                category.includes(searchQuery) ||
                iframeId.includes(searchQuery);

            if (matchesFilter && matchesSearch) {
                item.classList.remove('hidden');
                item.classList.add('show');
            } else {
                item.classList.remove('show');
                item.classList.add('hidden');
            }
        });

        // Refresh AOS to ensure animations work on filtered items
        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, 300);
    };

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter');
                filterProjects();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterProjects();
        });
    }
});

// ================= SCROLL PROGRESS BAR LOGIC =================
window.addEventListener('scroll', () => {
    const scrollBar = document.getElementById('scroll-progress-bar');
    if (scrollBar) {
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.clientHeight;
        const scrolled = window.scrollY;

        const progress = (scrolled / (fullHeight - windowHeight)) * 100;
        scrollBar.style.width = `${progress}%`;
    }
});

// ================= STATS COUNTER LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 1);
                    } else {
                        counter.innerText = target + "+";
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
});

// ================= CUSTOM CONTEXT MENU LOGIC =================
const customCM = document.getElementById('custom-cm');

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const { clientX: mouseX, clientY: mouseY } = e;
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    // Prevent menu from going off-screen
    let posX = mouseX;
    let posY = mouseY;

    if (posX + 220 > windowWidth) posX = windowWidth - 220;
    if (posY + 300 > windowHeight) posY = windowHeight - 300;

    customCM.style.display = 'block';
    customCM.style.left = `${posX}px`;
    customCM.style.top = `${posY}px`;
});

document.addEventListener('click', () => {
    customCM.style.display = 'none';
});

function copyPortfolioLink() {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
        alert("Portfolio Link Copied to Clipboard!");
    });
}

// ================= SKILLS RADAR CHART =================
document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById('skillsChart').getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Premiere Pro', 'After Effects', 'Photoshop', 'Illustrator', 'DaVinci Resolve', 'CapCut'],
            datasets: [{
                label: 'Skill Level',
                data: [95, 85, 90, 75, 80, 100],
                backgroundColor: 'rgba(27, 138, 219, 0.2)',
                borderColor: '#1b8adb',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#1b8adb',
                pointHoverBackgroundColor: '#1b8adb',
                pointHoverBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: {
                        color: '#fff',
                        font: { family: 'Inter', size: 12, weight: 'bold' }
                    },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            },
            maintainAspectRatio: true,
            responsive: true
        }
    });
});

// ================= MOUSE TRAIL LOGIC =================
document.addEventListener('mousemove', (e) => {
    // Throttle particle creation for performance
    if (Math.random() > 0.3) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';

    // Slight random offset
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;

    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;

    document.body.appendChild(particle);

    // Animate and remove
    setTimeout(() => {
        particle.style.transform = 'scale(0)';
        particle.style.opacity = '0';
        setTimeout(() => {
            particle.remove();
        }, 500);
    }, 50);
}

// ================= BACK TO TOP BUTTON (POLISHED) =================
const backToTopBtn = document.getElementById('back-to-top');
const progressCircle = document.querySelector('.progress-ring__circle');

if (backToTopBtn && progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
            setProgress(scrollPercent);
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        // Use GSAP for cinematic smooth scroll if available
        if (typeof gsap !== 'undefined') {
            gsap.to(window, { duration: 1.5, scrollTo: 0, ease: "power4.inOut" });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ================= RATINGS BAR ANIMATION =================
const ratingSummary = document.querySelector('.ratings-summary');

if (ratingSummary) {
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = document.querySelectorAll('.bar-fill');
                bars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    // Small delay so the transition is visible
                    setTimeout(() => {
                        bar.style.width = `${targetWidth}%`;
                    }, 200);
                });
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    barObserver.observe(ratingSummary);
}


// ================= THREE.JS 3D ELEMENT =================
const initThree = () => {
    const container = document.getElementById('three-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create a custom 3D Radianite Crystal (Octahedron)
    const geometry = new THREE.OctahedronGeometry(1.8, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x1b8adb,
        emissive: 0x0a111a,
        specular: 0xffffff,
        shininess: 100,
        flatShading: true,
        transparent: true,
        opacity: 0.6
    });

    const crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Add a glowing wireframe for tech feel
    const wireframeGeom = new THREE.OctahedronGeometry(1.85, 0);
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x1b8adb,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireframeGeom, wireframeMat);
    crystal.add(wireframe);

    // Inner core light
    const coreGeom = new THREE.OctahedronGeometry(0.8, 0);
    const coreMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff });
    const core = new THREE.Mesh(coreGeom, coreMat);
    crystal.add(core);

    // Cinematic Lighting
    const mainLight = new THREE.PointLight(0x1b8adb, 2, 50);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const sideLight = new THREE.PointLight(0xed215e, 1, 50);
    sideLight.position.set(-5, -5, 5);
    scene.add(sideLight);

    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 6;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 200;
        mouseY = (e.clientY - window.innerHeight / 2) / 200;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Follow mouse with smooth lerp
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        crystal.rotation.y += 0.005;
        crystal.rotation.x = targetY;
        crystal.rotation.z = -targetX;

        // Hovering floating motion
        crystal.position.y = Math.sin(Date.now() * 0.001) * 0.3;

        // Core breathing pulse
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.15;
        core.scale.set(pulse, pulse, pulse);

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// ================= DYNAMIC SECTION TRANSITIONS =================
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.classList.add('section-hidden');
    sectionObserver.observe(section);
});

// ================= SKILL BAR ANIMATION =================
const skillBars = document.querySelectorAll('.progress-fill');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fill = entry.target;
            const width = fill.getAttribute('data-width');
            fill.style.width = width + '%';
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => skillObserver.observe(bar));

// ================= CONTACT FORM HANDLING =================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const fileInput = document.getElementById('contact-attachment');
const fileNameDisplay = document.getElementById('file-name');
const submitBtn = document.getElementById('contact-submit');
const submitText = document.getElementById('submit-text');
const submitIcon = document.getElementById('submit-icon');

if (contactForm) {
    // File upload display
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            } else {
                fileNameDisplay.textContent = '';
            }
        });
    }

    // Form validation
    const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            message = isValid ? '' : 'Please enter a valid email address';
        } else if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }

        field.style.borderColor = isValid ? '' : '#ef4444';
        field.nextElementSibling?.remove(); // Remove previous error

        if (!isValid && message) {
            const error = document.createElement('div');
            error.className = 'field-error';
            error.textContent = message;
            error.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 5px;';
            field.parentNode.appendChild(error);
        }
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isFormValid = true;
        inputs.forEach(input => {
            validateField(input);
            if (!input.value.trim() && input.hasAttribute('required')) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please fill in all required fields correctly.';
            return;
        }

        const formData = new FormData(contactForm);
        const originalBtnText = submitText.textContent;
        const originalIconClass = submitIcon.className;

        submitText.textContent = 'SENDING...';
        submitIcon.className = 'fa-solid fa-spinner fa-spin';
        submitBtn.disabled = true;
        formStatus.className = 'form-status loading';
        formStatus.textContent = 'Sending your message...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '✓ Message sent successfully! I\'ll get back to you soon.';
                contactForm.reset();
                fileNameDisplay.textContent = '';

                // Show success animation
                submitText.textContent = 'SENT!';
                submitIcon.className = 'fa-solid fa-check';
                setTimeout(() => {
                    submitText.textContent = originalBtnText;
                    submitIcon.className = originalIconClass;
                }, 2000);
            } else {
                formStatus.className = 'form-status error';
                formStatus.textContent = data.message || 'Failed to send message. Please try again.';
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Network error. Please check your connection and try again.';
        } finally {
            submitBtn.disabled = false;
            setTimeout(() => {
                if (formStatus.classList.contains('success')) {
                    formStatus.textContent = '';
                }
            }, 5000);
        }
    });
}

// Delay initialization slightly to ensure libraries and containers are ready
setTimeout(initThree, 1000);

// ================= CLIENT PORTAL LOGIC =================
const portalBtn = document.getElementById('client-panel-btn');
const portalOverlay = document.getElementById('client-portal');
const closePortal = document.getElementById('close-portal');
const loginBtn = document.getElementById('portal-login-btn');
const logoutBtn = document.getElementById('logout-portal');
const loginView = document.getElementById('portal-login');
const dashboardView = document.getElementById('portal-dashboard');

if (portalBtn && portalOverlay) {
    portalBtn.addEventListener('click', () => {
        portalOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closePortal.addEventListener('click', () => {
        portalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('client-email').value;
        const pass = document.getElementById('client-pass').value;

        if (!email || !pass) {
            alert("Please enter both email and password.");
            return;
        }

        // Simulate Login Delay
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AUTHENTICATING...';
        loginBtn.disabled = true;

        setTimeout(() => {
            loginView.style.display = 'none';
            dashboardView.style.display = 'block';
            loginBtn.innerHTML = 'ACCESS DASHBOARD <i class="fa-solid fa-arrow-right-to-bracket"></i>';
            loginBtn.disabled = false;
        }, 2000);
    });

    logoutBtn.addEventListener('click', () => {
        dashboardView.style.display = 'none';
        loginView.style.display = 'block';
        portalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// User Activity Analytics Tracking
document.addEventListener('DOMContentLoaded', () => {
    try {
        fetch('nova_backend/log_activity.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action_type: 'page_view',
                page_url: window.location.pathname || '/'
            })
        });
    } catch(e) {
        console.log('Analytics tracking failed', e);
    }
});

// ================= DYNAMIC PARTICLES BACKGROUND =================
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height/80) * (canvas.width/80)
    };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse collision for particles
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 2;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 2;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 2;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 2;
                }
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 10000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.8) - 0.4;
            let directionY = (Math.random() * 0.8) - 0.4;
            let color = 'rgba(147, 51, 234, 0.4)'; // Purple glow
            if (Math.random() > 0.5) color = 'rgba(27, 138, 219, 0.4)'; // Blue glow

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width/10) * (canvas.height/10)) {
                    opacityValue = 1 - (distance/15000);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', function() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = ((canvas.height/80) * (canvas.height/80));
        initParticles();
    });

    window.addEventListener('mouseout', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    initParticles();
    animateParticles();
});

// ================= MOBILE VIEWPORT ADAPTATION (KEYBOARD FIX) =================
// Fixes layout shifts when the virtual keyboard is triggered on mobile devices
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        const musicPlayerWrapper = document.getElementById('music-player-wrapper');
        const isMobile = window.innerWidth <= 768;
        
        if (musicPlayerWrapper && isMobile) {
            // Calculate how much the keyboard is pushing up
            const offset = window.innerHeight - window.visualViewport.height;
            
            if (offset > 50) {
                // Keyboard is likely open
                // Shift player up above the keyboard, accounting for the bottom nav
                musicPlayerWrapper.style.setProperty('--player-bottom', `${offset + 5}px`);
            } else {
                // Keyboard is closed
                // Reset to default mobile bottom position (handled by CSS: 85px)
                musicPlayerWrapper.style.removeProperty('--player-bottom');
            }
        }
    });
}

// ================= PWA INSTALLATION LOGIC =================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    console.log('[PWA] Installation prompt captured');
    
    // Optionally show a custom install button in the UI
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'block';
});

async function installPWA() {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'none';
}

window.addEventListener('appinstalled', (event) => {
    console.log('[PWA] App installed successfully');
    if (typeof showNotification === 'function') {
        showNotification('App Installed', 'Biman XD is now on your home screen!', 'success', 3000);
    }
});


// ================= THEME TOGGLE LOGIC =================
const initThemeToggle = () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle?.querySelector('i');

    // Check for saved preference
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            
            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            // Update icon
            if (icon) {
                if (isLight) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    if (typeof showNotification === 'function') {
                        showNotification('Light Mode Active', 'Switched to cinematic light theme', 'success', 2000);
                    }
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    if (typeof showNotification === 'function') {
                        showNotification('Dark Mode Active', 'Back to premium dark aesthetic', 'info', 2000);
                    }
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', initThemeToggle);

// ================= BACK TO TOP LOGIC =================
const initBackToTop = () => {
    const backTop = document.getElementById('back-top');
    
    if (backTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backTop.style.opacity = '1';
                backTop.style.pointerEvents = 'all';
                backTop.style.transform = 'translateY(0)';
            } else {
                backTop.style.opacity = '0';
                backTop.style.pointerEvents = 'none';
                backTop.style.transform = 'translateY(20px)';
            }
        });

        backTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', initBackToTop);

// ================= TEXT REVEAL ANIMATIONS =================
function initTextRevealAnimations() {
    // Reveal on scroll for elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-blur, .reveal-scale');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after reveal (remove if you want it to repeat)
                // revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Typewriter effect for elements with .typewriter class
    const typewriterElements = document.querySelectorAll('.typewriter');
    typewriterElements.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        el.style.width = '0';
        el.style.overflow = 'hidden';
        el.style.whiteSpace = 'nowrap';

        const typeObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let i = 0;
                const typeInterval = setInterval(() => {
                    if (i < text.length) {
                        el.textContent += text[i];
                        i++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 50);
                typeObserver.unobserve(el);
            }
        }, { threshold: 0.5 });
        typeObserver.observe(el);
    });

    // Character by character reveal
    const charRevealElements = document.querySelectorAll('.reveal-chars');
    charRevealElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = '';
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? ' ' : char;
            span.className = 'reveal-char';
            span.style.transitionDelay = `${index * 30}ms`;
            el.appendChild(span);
        });

        const charObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                el.querySelectorAll('.reveal-char').forEach(char => {
                    char.classList.add('visible');
                });
                charObserver.unobserve(el);
            }
        }, { threshold: 0.5 });
        charObserver.observe(el);
    });
}

// Initialize text reveal animations
initTextRevealAnimations();

// ================= 3D TILT ENHANCEMENT =================
function initEnhancedTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card, .g-item, .bottom-card, .project-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Initialize enhanced tilt on desktop only
if (window.matchMedia('(pointer: fine)').matches) {
    initEnhancedTilt();
}

// Add floating animation to cards
document.querySelectorAll('.float-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.animationPlayState = 'paused';
    });
    card.addEventListener('mouseleave', () => {
        card.style.animationPlayState = 'running';
    });
});
