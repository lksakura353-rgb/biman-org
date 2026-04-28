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


// Update active state on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

// OPTIMIZATION: Debounce the scroll event to prevent layout thrashing
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = requestAnimationFrame(() => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });

        const bubbleLinks = document.querySelectorAll('.bubble-menu-content a');
        if (bubbleLinks.length > 0) {
            bubbleLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === current) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Initialize on load
window.dispatchEvent(new Event('scroll'));

// ================= SKILL BARS & PROGRESS ANIMATION =================
const animateProgressBars = () => {
    const progressBars = document.querySelectorAll('.progress-fill, .bar-fill');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                if (width) {
                    bar.style.width = width + '%';
                }
                // Once animated, stop observing
                observer.unobserve(bar);
            }
        });
    }, observerOptions);

    progressBars.forEach(bar => {
        // Reset width to 0 initially to ensure animation triggers
        bar.style.width = '0';
        observer.observe(bar);
    });
};

// Start observer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateProgressBars);
} else {
    animateProgressBars();
}

// ================= STATS COUNTER ANIMATION =================
const initCounters = () => {
    const counters = document.querySelectorAll('.counter');
    const speed = 100;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText.replace(/,/g, '');
                    
                    const inc = Math.max(1, Math.ceil(target / speed));
                    
                    if (count < target) {
                        counter.innerText = (count + inc).toLocaleString();
                        setTimeout(updateCount, 30);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5, rootMargin: "0px 0px -50px 0px" });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
} else {
    initCounters();
}

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

        // Wait a small bit, then start loading image
        const renderUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptInfo)}?width=1024&height=1024&nologo=true`;

        const tmpImg = new Image();
        tmpImg.src = renderUrl;

        tmpImg.onload = () => {
            novaResult.src = renderUrl;
            novaLoader.style.display = 'none';
            novaResult.style.display = 'block';
            novaBtn.disabled = false;
            novaBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> GENERATE';
        };

        tmpImg.onerror = () => {
            alert('Failed to generate image. Please try again.');
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

    // Theme Toggle Handler
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
        { title: "VALORANT THEME", artist: "Riot Games", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { title: "CIRCUITS", artist: "Cyberpunk", art: "https://i.postimg.cc/T3Qdxw8c/image.png", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
    ];

    let songIndex = 0;
    let isPlaying = false;

    function loadSong(song) {
        songTitle.innerText = song.title;
        artist.innerText = song.artist;
        songArt.src = song.art;
        mainAudio.src = song.src;
    }

    function playSong() {
        isPlaying = true;
        musicMini.classList.add('playing');
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        mainAudio.play();
    }

    function pauseSong() {
        isPlaying = false;
        musicMini.classList.remove('playing');
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        mainAudio.pause();
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
                // Stop local music if it's playing
                pauseSong();
            });
        }

        playPauseBtn.addEventListener('click', () => {
            isPlaying ? pauseSong() : playSong();
        });

        mainAudio.addEventListener('timeupdate', (e) => {
            const { duration, currentTime } = e.srcElement;
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
        });

        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = mainAudio.duration;
            mainAudio.currentTime = (clickX / width) * duration;
        });

        volumeSlider.addEventListener('input', (e) => {
            mainAudio.volume = e.target.value;
        });

        document.getElementById('next').addEventListener('click', () => {
            songIndex = (songIndex + 1) % songs.length;
            loadSong(songs[songIndex]);
            playSong();
        });

        document.getElementById('prev').addEventListener('click', () => {
            songIndex = (songIndex - 1 + songs.length) % songs.length;
            loadSong(songs[songIndex]);
            playSong();
        });
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
            const lowerText = userText.toLowerCase();

            // --- BACKEND OPTIMIZATION (PHP/SQL READY) ---
            /* 
            // Uncomment this block if you have nova_api.php deployed
            try {
                const response = await fetch('nova_backend/api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userText })
                });
                const data = await response.json();
                indicator.remove();
                appendMessage(data.reply, 'bot');
                return;
            } catch (err) { console.error("Backend offline, using fallback."); }
            */

            let response = "I'm not exactly sure what you mean, but Biman can definitely help! You can reach him through the Contact section.";
            let quickActions = null;

            if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('greetings')) {
                response = "Hi there! I'm Nova, Biman's AI Assistant. How can I help you explore his portfolio today?";
                quickActions = ['Show me his skills', 'Tell me about his projects', 'How to contact him'];
            } else if (lowerText.includes('who are you') || lowerText.includes('name') || lowerText.includes('what are you') || lowerText.includes('nova')) {
                response = "I am Nova, Biman's custom AI Assistant. I'm here to help you navigate his portfolio, learn about his expertise in video editing and graphic design, and connect you with him!";
            } else if (lowerText.includes('work') || lowerText.includes('project') || lowerText.includes('skills') || lowerText.includes('video') || lowerText.includes('graphic') || lowerText.includes('design')) {
                response = "Biman excels in Graphic Design, Video Editing, Motion Graphics, and 3D Modeling. He uses tools like Adobe Premiere, After Effects, Photoshop, and Blender. Check out his 'MY ARSENAL' section for more!";
                quickActions = ['View his projects', 'See his software skills'];
            } else if (lowerText.includes('contact') || lowerText.includes('email') || lowerText.includes('hire') || lowerText.includes('call') || lowerText.includes('message') || lowerText.includes('reach')) {
                response = "The best way to reach Biman is via the 'CONTACT ME' form at the bottom, or through his WhatsApp (+94 7X XXX XXXX) and email (bimanranasinghe@email.com). He's open to new projects!";
                quickActions = ['Go to contact section', 'Send a message'];
            } else if (lowerText.includes('valorant') || lowerText.includes('game') || lowerText.includes('gaming')) {
                response = "Biman loves Valorant and gaming content! The theme of this website is actually inspired by the game's sleek UI. He creates amazing gaming montages and thumbnails.";
            } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('fee') || lowerText.includes('rate')) {
                response = "Biman's services start from $15 for thumbnails, $50 for video editing, and $20 for graphic design. Check the 'SERVICES' section for detailed packages!";
                quickActions = ['View pricing', 'Order a service'];
            } else if (lowerText.includes('blog') || lowerText.includes('article') || lowerText.includes('post') || lowerText.includes('write')) {
                response = "Biman shares tips on video editing, thumbnail design, and content creation in his blog. He has articles on Premiere Pro techniques and YouTube growth strategies.";
                quickActions = ['Read the blog', 'Latest tips'];
            } else if (lowerText.includes('testimonial') || lowerText.includes('review') || lowerText.includes('client') || lowerText.includes('feedback')) {
                response = "Biman's clients love his work! He has a 4.9-star rating from 47 reviews. Clients praise his fast delivery, creative designs, and professional communication.";
                quickActions = ['Read reviews', 'See client feedback'];
            } else if (lowerText.includes('about') || lowerText.includes('background') || lowerText.includes('story') || lowerText.includes('journey')) {
                response = "Biman is a self-taught creator from Sri Lanka with 2+ years of experience. He started with basic editing and now masters advanced VFX and 3D. His journey is detailed in the 'MY JOURNEY' section.";
                quickActions = ['Read his story', 'View timeline'];
            } else if (lowerText.includes('tool') || lowerText.includes('ai') || lowerText.includes('nova') || lowerText.includes('generator')) {
                response = "Biman has built Nova AI tools for image generation, video creation, and social media extraction. Try the 'CREATOR TOOLS' section to generate AI images or download videos!";
                quickActions = ['Try image generator', 'Use video tool'];
            } else if (lowerText.includes('social') || lowerText.includes('youtube') || lowerText.includes('instagram') || lowerText.includes('follow')) {
                response = "Follow Biman on YouTube (@BIMANXD) for editing tutorials, Instagram for behind-the-scenes, and TikTok for quick tips. He has 25,000+ subscribers!";
                quickActions = ['Follow on YouTube', 'Check Instagram'];
            } else if (lowerText.includes('help') || lowerText.includes('what can you do') || lowerText.includes('assist')) {
                response = "I can help you learn about Biman's skills, view his projects, navigate the site, get contact info, or even generate AI content. What would you like to know?";
                quickActions = ['Explore portfolio', 'Get help navigating'];
            }

            setTimeout(() => {
                indicator.remove();
                appendMessage(response, 'bot');
                if (quickActions) {
                    setTimeout(() => appendQuickActions(quickActions), 500);
                }
            }, 1000 + Math.random() * 1000);
        };

        const appendQuickActions = (actions) => {
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('ai-msg', 'bot', 'quick-actions');
            actionsDiv.innerHTML = actions.map(action => `<button class="quick-btn">${action}</button>`).join('');
            aiMessages.appendChild(actionsDiv);
            aiMessages.scrollTo({ top: aiMessages.scrollHeight, behavior: 'smooth' });

            // Add click handlers
            actionsDiv.querySelectorAll('.quick-btn').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    const action = actions[index];
                    appendMessage(action, 'user');
                    handleQuickAction(action);
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
                } else if (action === 'How to contact him') {
                    appendMessage("Use the contact form below or WhatsApp him directly. He's responsive and open to collaborations!", 'bot');
                    setTimeout(() => scrollToSection('#contact'), 1000);
                } else if (action === 'View his projects') {
                    appendMessage("Scrolling to Biman's amazing project portfolio now!", 'bot');
                    scrollToSection('#project');
                } else if (action === 'See his software skills') {
                    appendMessage("Biman masters Premiere Pro, After Effects, Photoshop, Blender, and more. See the full list in his skills section!", 'bot');
                    scrollToSection('#about');
                } else if (action === 'Go to contact section') {
                    appendMessage("Taking you to the contact form!", 'bot');
                    scrollToSection('#contact');
                } else if (action === 'Send a message') {
                    appendMessage("The contact form is ready for your message!", 'bot');
                    scrollToSection('#contact');
                } else if (action === 'View pricing') {
                    appendMessage("Check out Biman's service packages!", 'bot');
                    scrollToSection('#pricing');
                } else if (action === 'Order a service') {
                    appendMessage("Ready to hire Biman? Fill out the contact form!", 'bot');
                    scrollToSection('#contact');
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
                    setTimeout(() => appendQuickActions(['Home', 'About', 'Contact']), 500);
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
                } else if (action === 'Contact') {
                    scrollToSection('#contact');
                    appendMessage("Ready to get in touch!", 'bot');
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
document.addEventListener("DOMContentLoaded", () => {
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

        function rotateCarousel() {
            carousel.style.transform = `rotateY(${currentAngle}deg)`;
        }

        prevBtn.addEventListener('click', () => {
            currentAngle += angleStep;
            rotateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentAngle -= angleStep;
            rotateCarousel();
        });

        // Auto-rotate every 5 seconds
        setInterval(() => {
            currentAngle -= angleStep;
            rotateCarousel();
        }, 5000);
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

// ================= BACK TO TOP BUTTON =================
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

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
