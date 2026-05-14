/**
 * Store Wishlist System
 * Save favorite products with localStorage
 */
(function() {
    'use strict';

    const WISHLIST_KEY = 'biman_store_wishlist';

    // ============================================================
    //  WISHLIST FUNCTIONS
    // ============================================================

    window.Wishlist = {
        /**
         * Get wishlist from localStorage
         */
        getWishlist: function() {
            const wishlist = localStorage.getItem(WISHLIST_KEY);
            return wishlist ? JSON.parse(wishlist) : [];
        },

        /**
         * Save wishlist to localStorage
         */
        saveWishlist: function(wishlist) {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
            this.updateWishlistUI();
        },

        /**
         * Add item to wishlist
         */
        addItem: function(product) {
            const wishlist = this.getWishlist();
            const exists = wishlist.some(item => item.id === product.id);

            if (!exists) {
                wishlist.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image_url || '',
                    category: product.category || ''
                });
                this.saveWishlist(wishlist);
                this.showNotification(`"${product.name}" added to wishlist!`);
            } else {
                this.showNotification('Already in wishlist!');
            }
        },

        /**
         * Remove item from wishlist
         */
        removeItem: function(productId) {
            let wishlist = this.getWishlist();
            wishlist = wishlist.filter(item => item.id !== productId);
            this.saveWishlist(wishlist);
        },

        /**
         * Check if item is in wishlist
         */
        isInWishlist: function(productId) {
            const wishlist = this.getWishlist();
            return wishlist.some(item => item.id === productId);
        },

        /**
         * Toggle wishlist item
         */
        toggle: function(product) {
            if (this.isInWishlist(product.id)) {
                this.removeItem(product.id);
                this.showNotification(`"${product.name}" removed from wishlist`);
            } else {
                this.addItem(product);
            }
        },

        /**
         * Update wishlist UI elements
         */
        updateWishlistUI: function() {
            const count = this.getWishlist().length;

            // Update wishlist count badge
            const countEl = document.getElementById('wishlist-count');
            if (countEl) {
                countEl.textContent = count;
                countEl.style.display = count > 0 ? 'flex' : 'none';
            }

            // Update wishlist icon states (hearts)
            this.updateHeartIcons();
        },

        /**
         * Update heart icons on product cards
         */
        updateHeartIcons: function() {
            const wishlist = this.getWishlist();
            const wishlistBtns = document.querySelectorAll('.wishlist-btn');

            wishlistBtns.forEach(btn => {
                const productId = btn.getAttribute('data-product-id');
                if (productId && wishlist.some(item => item.id == productId)) {
                    btn.classList.add('active');
                }
            });
        },

        /**
         * Show notification
         */
        showNotification: function(message) {
            const notification = document.createElement('div');
            notification.className = 'wishlist-notification';
            notification.innerHTML = `<i class="fa-solid fa-heart"></i> ${message}`;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                color: #fff;
                padding: 15px 25px;
                border-radius: 10px;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2500);
        },

        /**
         * Render wishlist modal
         */
        renderWishlistModal: function() {
            const container = document.getElementById('wishlist-items-container');
            const emptyState = document.getElementById('wishlist-empty');
            const wishlist = this.getWishlist();

            if (!container) return;

            if (wishlist.length === 0) {
                container.innerHTML = '';
                if (emptyState) emptyState.style.display = 'flex';
            } else {
                if (emptyState) emptyState.style.display = 'none';
                container.innerHTML = wishlist.map(item => `
                    <div class="wishlist-item">
                        <img src="${item.image || 'https://i.postimg.cc/9fP6Ggbf/image.png'}" alt="${item.name}" class="wishlist-item-img">
                        <div class="wishlist-item-info">
                            <h4>${item.name}</h4>
                            <p class="wishlist-item-price">$${item.price.toFixed(2)}</p>
                            <p class="wishlist-item-cat">${item.category || ''}</p>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="add-to-cart-btn" onclick="Wishlist.moveToCart(${item.id})">
                                <i class="fa-solid fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="remove-btn" onclick="Wishlist.removeItem(${item.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        },

        /**
         * Open wishlist modal
         */
        openWishlist: function() {
            this.renderWishlistModal();
            const modal = document.getElementById('wishlist-modal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        },

        /**
         * Close wishlist modal
         */
        closeWishlist: function() {
            const modal = document.getElementById('wishlist-modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        },

        /**
         * Move item from wishlist to cart
         */
        moveToCart: function(productId) {
            const wishlist = this.getWishlist();
            const item = wishlist.find(i => i.id === productId);

            if (item && window.Cart) {
                Cart.addItem(item);
                this.removeItem(productId);
                this.showNotification(`"${item.name}" moved to cart!`);
            }
        }
    };

    // ============================================================
    //  INITIALIZATION
    // ============================================================

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize wishlist UI
        if (window.Wishlist) {
            Wishlist.updateWishlistUI();
        }

        // Make toggleWishlistItem function available globally
        window.toggleWishlistItem = function(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                Wishlist.toggle(product);
                // Update heart icon visually
                const btn = document.querySelector(`.wishlist-btn[onclick*="${productId}"]`);
                if (btn) {
                    btn.classList.toggle('active');
                }
            }
        };
    });

    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        /* Wishlist Modal Styles */
        .wishlist-modal {
            max-width: 500px;
        }

        .wishlist-item {
            display: flex;
            gap: 15px;
            padding: 15px;
            background: var(--bg-dark);
            border-radius: 12px;
            margin-bottom: 10px;
        }

        .wishlist-item-img {
            width: 70px;
            height: 70px;
            object-fit: cover;
            border-radius: 8px;
        }

        .wishlist-item-info {
            flex: 1;
        }

        .wishlist-item-info h4 {
            font-size: 0.9rem;
            margin-bottom: 5px;
        }

        .wishlist-item-price {
            color: var(--accent-rog);
            font-weight: 600;
        }

        .wishlist-item-cat {
            font-size: 0.75rem;
            color: var(--text-gray);
        }

        .wishlist-item-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .add-to-cart-btn {
            background: var(--accent-rog);
            border: none;
            color: var(--bg-black);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .add-to-cart-btn:hover {
            background: #b3e600;
        }

        .wishlist-item-actions .remove-btn {
            background: none;
            border: 1px solid var(--border-gray);
            color: var(--text-gray);
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
        }

        .wishlist-item-actions .remove-btn:hover {
            border-color: #ef4444;
            color: #ef4444;
        }

        #wishlist-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-gray);
        }

        #wishlist-empty i {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
            color: #ff6b6b;
        }

        .wishlist-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid var(--border-gray);
        }

        .wishlist-header h3 {
            font-size: 1.2rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .wishlist-header h3 i {
            color: #ff6b6b;
        }
    `;
    document.head.appendChild(style);

})();