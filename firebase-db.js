import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ==========================================
// FIREBASE CONFIGURATION (REPLACE WITH YOURS)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA9Y8FP_nZOwAPs8GqRpd5NkSzN0IXpIvA",
  authDomain: "biman-portfolio.firebaseapp.com",
  projectId: "biman-portfolio",
  storageBucket: "biman-portfolio.firebasestorage.app",
  messagingSenderId: "649941396027",
  appId: "1:649941396027:web:b5b23dd80946315b97ca1e",
  measurementId: "G-6GWRS2GLT2"
};

// Initialize Firebase App & Firestore Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make db globally accessible if other scripts need it
window.firebaseDB = db;
window.fbCollection = collection;
window.fbAddDoc = addDoc;

// ==========================================
// 1. CONTACT FORM TO FIREBASE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const contactFormNew = document.getElementById('contact-form-new');
    const formStatusNew = document.getElementById('form-status-new');
    const submitBtnNew = document.getElementById('contact-submit-new');
    const submitTextNew = document.getElementById('submit-text-new');

    if (contactFormNew) {
        contactFormNew.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitTextNew.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SENDING...';
            submitBtnNew.disabled = true;
            formStatusNew.className = 'form-status loading';
            formStatusNew.textContent = 'Sending your message securely...';

            try {
                // Get Form Data
                const formData = new FormData(contactFormNew);
                const data = Object.fromEntries(formData.entries());
                data.timestamp = new Date(); // Save the exact time

                // Send to Firestore Collection named 'messages'
                // WARNING: Make sure your Firestore Rules allow 'write' access
                await addDoc(collection(db, "messages"), data);

                // Success UI
                formStatusNew.className = 'form-status success';
                formStatusNew.innerHTML = '<i class="fa-solid fa-check-circle"></i> Message sent successfully! I\'ll get back to you soon.';
                contactFormNew.reset();

                setTimeout(() => {
                    formStatusNew.textContent = '';
                }, 5000);

            } catch (error) {
                console.error("Firebase Error: ", error);
                formStatusNew.className = 'form-status error';
                formStatusNew.textContent = 'Error connecting to database. Have you added your Firebase API Keys?';
            } finally {
                submitTextNew.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
                submitBtnNew.disabled = false;
            }
        });
    }

    // 2. FETCH DYNAMIC CONTENT (CMS)
    loadDynamicContent();
});

async function loadDynamicContent() {
    const db = window.firebaseDB;
    if (!db) return;

    // Load Packages
    const packagesGrid = document.querySelector('.pricing-grid.forma-grid');
    if (packagesGrid) {
        try {
            const q = query(collection(db, "packages"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                packagesGrid.innerHTML = ''; // Clear hardcoded
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const featuresHtml = data.features ? data.features.map(f => `
                        <li><div class="feature-icon"><i class="fa-solid fa-check"></i></div> ${f}</li>
                    `).join('') : '';

                    packagesGrid.innerHTML += `
                        <div class="forma-card liquid-glass" data-aos="fade-up">
                            <div class="top-icon"><i class="fa-solid ${data.icon || 'fa-star'}"></i></div>
                            <h3>${data.title}</h3>
                            <div class="price-label">FROM</div>
                            <h4 class="price">${data.price}</h4>
                            <p class="desc">${data.desc}</p>
                            <ul class="features">
                                ${featuresHtml}
                            </ul>
                            <a href="booking.html" class="forma-btn">BOOK SERVICE</a>
                        </div>
                    `;
                });
            }
        } catch (e) { console.error("Error loading packages:", e); }
    }

    // Load Blog Posts
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        try {
            const q = query(collection(db, "blog"), orderBy("title")); // Simple sort
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                blogGrid.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    blogGrid.innerHTML += `
                        <div class="blog-card liquid-glass" data-aos="fade-up">
                            <div class="blog-img">
                                <img src="${data.img}" alt="${data.title}" loading="lazy">
                                <span class="blog-date">NEW</span>
                            </div>
                            <div class="blog-content">
                                <span class="blog-category">${data.category}</span>
                                <h3>${data.title}</h3>
                                <p>${data.desc}</p>
                                <a href="blog.html" class="read-more">READ MORE <i class="fa-solid fa-arrow-right"></i></a>
                            </div>
                        </div>
                    `;
                });
            }
        } catch (e) { console.error("Error loading blog:", e); }
    }
}
