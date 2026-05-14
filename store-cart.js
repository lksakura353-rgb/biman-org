/**
 * Store Shopping Cart System
 * Handles cart operations with localStorage
 */
(function() {
    'use strict';

    const CART_KEY = 'biman_store_cart';

    // ============================================================
    //  CART FUNCTIONS
    // ============================================================

    window.Cart = {
        /**
         * Get cart from localStorage
         */
        getCart: function() {
            const cart = localStorage.getItem(CART_KEY);
            return cart ? JSON.parse(cart) : [];
        },

        /**
         * Save cart to localStorage
         */
        saveCart: function(cart) {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            this.updateCartUI();
        },

        /**
         * Add item to cart
         */
        addItem: function(product) {
            const cart = this.getCart();
            const existingItem = cart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image_url || '',
                    quantity: 1,
                    type: product.product_type || 'physical'
                });
            }

            this.saveCart(cart);
            this.showNotification(`"${product.name}" added to cart!`);
        },

        /**
         * Remove item from cart
         */
        removeItem: function(productId) {
            let cart = this.getCart();
            cart = cart.filter(item => item.id !== productId);
            this.saveCart(cart);
        },

        /**
         * Update item quantity
         */
        updateQuantity: function(productId, quantity) {
            const cart = this.getCart();
            const item = cart.find(item => item.id === productId);

            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    this.saveCart(cart);
                }
            }
        },

        /**
         * Clear entire cart
         */
        clearCart: function() {
            localStorage.removeItem(CART_KEY);
            this.updateCartUI();
        },

        /**
         * Get cart total
         */
        getTotal: function() {
            const cart = this.getCart();
            return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },

        /**
         * Get cart item count
         */
        getItemCount: function() {
            const cart = this.getCart();
            return cart.reduce((sum, item) => sum + item.quantity, 0);
        },

        /**
         * Update cart UI elements
         */
        updateCartUI: function() {
            const count = this.getItemCount();
            const total = this.getTotal();

            // Update cart count badge
            const countEl = document.getElementById('cart-count');
            if (countEl) {
                countEl.textContent = count;
                countEl.style.display = count > 0 ? 'flex' : 'none';
            }

            // Update cart modal if open
            this.renderCartModal();
        },

        /**
         * Show notification
         */
        showNotification: function(message) {
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ccff00;
                color: #000;
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
         * Render cart modal content
         */
        renderCartModal: function() {
            const container = document.getElementById('cart-items-container');
            const totalEl = document.getElementById('cart-total');

            if (!container) return;

            const cart = this.getCart();

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="cart-empty">
                        <i class="fa-solid fa-shopping-basket"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
            } else {
                container.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image || 'https://i.postimg.cc/9fP6Ggbf/image.png'}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                            <div class="cart-item-qty">
                                <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" onclick="Cart.removeItem(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }

            if (totalEl) {
                totalEl.textContent = '$' + this.getTotal().toFixed(2);
            }
        },

        /**
         * Open cart modal
         */
        openCart: function() {
            this.renderCartModal();
            const modal = document.getElementById('cart-modal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        },

        /**
         * Close cart modal
         */
        closeCart: function() {
            const modal = document.getElementById('cart-modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        },

        /**
         * Open checkout modal
         */
        openCheckout: function() {
            const cart = this.getCart();
            if (cart.length === 0) {
                this.showNotification('Your cart is empty!');
                return;
            }

            const checkoutModal = document.getElementById('checkout-modal');
            if (checkoutModal) {
                this.closeCart();
                checkoutModal.classList.add('show');
                document.body.style.overflow = 'hidden';

                // Update order summary
                document.getElementById('checkout-items').innerHTML = cart.map(item => `
                    <div class="checkout-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                document.getElementById('checkout-total').textContent = '$' + this.getTotal().toFixed(2);
            }
        },

        /**
         * Process checkout
         */
        checkout: async function(formData) {
            const cart = this.getCart();
            const loadingBtn = document.getElementById('checkout-btn');
            const originalText = loadingBtn.textContent;

            loadingBtn.disabled = true;
            loadingBtn.textContent = 'Processing...';

            try {
                const response = await fetch('nova_backend/ecommerce.php?action=checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        items: cart.map(item => ({
                            product_id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            type: item.type
                        }))
                    })
                });

                const data = await response.json();

                if (data.success) {
                    this.clearCart();

                    // Show success modal with order number
                    document.getElementById('checkout-modal').classList.remove('show');
                    document.getElementById('success-order-number').textContent = data.order_number;

                    // Add download links if any
                    const downloadSection = document.getElementById('success-downloads');
                    if (data.download_links && data.download_links.length > 0) {
                        downloadSection.innerHTML = `
                            <div class="success-downloads">
                                <h4><i class="fa-solid fa-download"></i> Your Downloads:</h4>
                                ${data.download_links.map(link => `
                                    <a href="${link.download_url}" class="download-link">
                                        <i class="fa-solid fa-file-zipper"></i> ${link.product_name}
                                    </a>
                                `).join('')}
                            </div>
                        `;
                    }

                    document.getElementById('success-modal').classList.add('show');
                } else {
                    alert('Payment failed: ' + data.message);
                }
            } catch (error) {
                alert('Error processing payment. Please try again.');
                console.error(error);
            } finally {
                loadingBtn.disabled = false;
                loadingBtn.textContent = originalText;
            }
        }
    };

    // ============================================================
    //  INITIALIZATION
    // ============================================================

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize cart UI
        if (window.Cart) {
            window.Cart.updateCartUI();
        }

        // Add click handler for cart button
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => window.Cart.openCart());
        }

        // Close modals on background click
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
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
    `;
    document.head.appendChild(style);

})();