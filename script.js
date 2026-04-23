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

window.addEventListener('scroll', () => {
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

// Initialize on load
window.dispatchEvent(new Event('scroll'));

// Lightbox Logic for Project, Contact, Showcase, Social & Blog Sections
const galleryItems = document.querySelectorAll('.g-item img, .bottom-card, .showcase-img, #nova-result-img, .feed-content img, .blog-img img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox && lightboxImg && lightboxClose) {
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
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
        if(!promptInfo) return;

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
        novaResult.addEventListener('click', function() {
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
        if(!url) return alert('Please enter a valid video URL first!');

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
    
    // Initialize VanillaTilt 3D Engine for Interactive Hover
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".g-item, .bottom-card, .showcase-img-wrapper, .about-img-container, .contact-avatar, .skill-icon"), {
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
                const response = await fetch('nova_api.php', {
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

            if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
                response = "Hi there! I'm Nova. How can I assist you today?";
            } else if (lowerText.includes('who are you') || lowerText.includes('name') || lowerText.includes('what are you')) {
                response = "I am Nova, Biman's custom AI Assistant. I'm here to help you navigate his portfolio and learn about his expertise.";
            } else if (lowerText.includes('work') || lowerText.includes('project') || lowerText.includes('skills') || lowerText.includes('video')) {
                response = "Biman is a pro in Graphic Design, Video Editing, and Motion Graphics. You should definitely check his 'MY ARSENAL' section!";
            } else if (lowerText.includes('contact') || lowerText.includes('email') || lowerText.includes('hire') || lowerText.includes('call') || lowerText.includes('message')) {
                response = "The best way to reach Biman is via the 'CONTACT ME' form at the bottom, or through his social links!";
            } else if (lowerText.includes('valorant')) {
                response = "Biman loves Valorant! The theme of this website is actually inspired by the game's sleek UI.";
            }

            setTimeout(() => {
                indicator.remove();
                appendMessage(response, 'bot');
            }, 1000 + Math.random() * 1000);
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
});

// ================= PROJECT FILTER LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.g-item');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to current button
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                projectItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
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
                }, 500);
            });
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

// ================= GUESTBOOK LOGIC =================
document.addEventListener("DOMContentLoaded", () => {
    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookList = document.getElementById('guestbook-list');
    const API_URL = 'nova_backend/guestbook.php';

    if (!guestbookList) return;

    let messages = [];

    // Function to render messages to the UI
    function renderMessages(data) {
        guestbookList.innerHTML = '';
        if (data.length === 0) {
            guestbookList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:20px;">No signatures yet. Be the first!</p>';
            return;
        }
        
        data.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'guestbook-item';
            item.innerHTML = `
                <div class="guest-header">
                    <h4>${msg.name}</h4>
                    <span>${msg.created_at || msg.date}</span>
                </div>
                <p>${msg.message}</p>
            `;
            guestbookList.appendChild(item);
        });
    }

    // Load messages from Backend or LocalStorage
    async function fetchMessages() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            messages = data;
            renderMessages(messages);
        } catch (err) {
            console.warn("Backend offline, using localStorage fallback.");
            messages = JSON.parse(localStorage.getItem('guestbook_messages')) || [
                { name: "Biman XD", message: "Welcome to my guestbook! Feel free to leave a message.", date: "2026-04-20" },
                { name: "Sarah J.", message: "Insane portfolio bro! The liquid glass design is fire.", date: "2026-04-21" }
            ];
            renderMessages(messages.slice().reverse());
        }
    }

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('guest-name');
            const messageInput = document.getElementById('guest-message');
            const btn = guestbookForm.querySelector('button');

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();
            const date = new Date().toISOString().split('T')[0];

            if (!name || !message) return;

            // UI feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SIGNING...';
            btn.disabled = true;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, message })
                });
                
                if (!response.ok) throw new Error('Submission failed');
                
                await fetchMessages();
                guestbookForm.reset();
                showSuccess(btn, originalText);
            } catch (err) {
                // Fallback to localStorage
                const newMsg = { name, message, date };
                messages.push(newMsg);
                localStorage.setItem('guestbook_messages', JSON.stringify(messages));
                renderMessages(messages.slice().reverse());
                guestbookForm.reset();
                showSuccess(btn, originalText);
            } finally {
                btn.disabled = false;
            }
        });
    }

    function showSuccess(btn, originalText) {
        btn.innerHTML = 'SIGNED! <i class="fa-solid fa-check"></i>';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2500);
    }

    fetchMessages();
});



