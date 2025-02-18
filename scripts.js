// === DOM Elements ===
const menuToggle = document.getElementById('menu-toggle'); // Hamburger icon
const menuClose = document.getElementById('menu-close'); // Close button
const hamburgerMenu = document.getElementById('hamburger-menu'); // Hamburger menu
const header = document.getElementById('mobile-header'); // Mobile header
const viewAllButton = document.querySelector('#view-all button'); // "View All" button
let lastScrollTop = 0; // Track scroll position

// Load cart from localStorage on page load
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count immediately on page load
updateCartCount();

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (currentPage === '/' || currentPage === '/') {
        // This block runs on the main product listing page
        attachAddToCartButtons();
    }
});



// Attach event listeners to "Add to Cart" buttons
function attachAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    if (addToCartButtons.length === 0) {
        console.error('No "Add to Cart" buttons found. Ensure your HTML is correct.');
        return;
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productItem = button.closest('.product-item');

            if (!productItem) {
                console.error('Product item not found for button:', button);
                return;
            }

            const product = {
                id: productItem.dataset.id,
                name: productItem.dataset.name,
                price: parseFloat(productItem.dataset.price),
                image: productItem.dataset.image,
            };

            if (!product.id || !product.name || isNaN(product.price) || !product.image) {
                console.error('Invalid product data:', product);
                alert('Error: Could not add product to cart due to missing or invalid data.');
                return;
            }

            addToCart(product);
            showAddedToCartNotification(product);
        });
    });
}

// Add product to cart
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Show notification after adding product to cart
function showAddedToCartNotification(product) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="cart-notification-content">
            <h3>JUST ADDED TO YOUR CART</h3>
            <div class="cart-notification-product">
                <img src="${product.image}" alt="${product.name}" class="cart-notification-img">
                <div>
                    <p>${product.name}</p>
                    <p>KSh ${product.price.toFixed(2)}</p>
                    <p>Qty: 1</p>
                </div>
            </div>
            <button id="view-cart-btn" class="view-cart-btn">VIEW CART (${cart.reduce((total, item) => total + item.quantity, 0)})</button>
            <a href="#" class="continue-shopping">Continue shopping</a>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            top: 40px;
            right: 20px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            width: 300px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            padding: 16px;
            animation: fadeIn 0.9s ease;
        }
        .cart-notification-content {
            text-align: center;
        }
        .cart-notification-product {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 16px 0;
        }
        .cart-notification-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
        }
        .view-cart-btn {
            background: #ff6600;
            color: white;
            border: none;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 4px;
        }
        .continue-shopping {
            display: block;
            margin-top: 10px;
            font-size: 12px;
            color: #555;
            text-decoration: underline;
            cursor: pointer;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    document.getElementById('view-cart-btn').addEventListener('click', () => {
        window.location.href = '/cart';
    });

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Render the cart on cart.html using cards
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsContainer || !cartTotalElement) {
        console.error('Cart items or total element not found. Ensure /cart is correct.');
        return;
    }

    cartItemsContainer.innerHTML = '';

    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="empty-cart-text">Your cart is empty.</p>
            <div class="continue-shopping-container">
                <a href="/" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `;
        cartTotalElement.textContent = '0.00';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = isNaN(item.price) ? 0 : item.price;

        const card = document.createElement('div');
        card.className = 'cart-card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.image}" alt="${item.name}" class="card-img">
            </div>
            <div class="card-details">
                <h3>${item.name}</h3>
                <p>Price: KSh ${itemPrice.toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
                <div class="card-actions">
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(card);
        total += itemPrice * item.quantity;
    });

    cartTotalElement.textContent = total.toFixed(2);
    attachRemoveEventListeners();
}

// Add CSS styles for the empty cart message and button
const emptyCartStyles = document.createElement('style');
emptyCartStyles.textContent = `
.empty-cart-text {
    text-align: center;
    font-size: 18px;
    color: #555;
    margin-top: 20px;
}

.continue-shopping-container {
    text-align: center;
    margin-top: 20px;
}

.continue-shopping-btn {
    display: inline-block;
    text-decoration: none;
    background-color: #297AC1;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.continue-shopping-btn:hover {
    background-color: #205B8A;
}

.cart-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin: 16px 24px; /* Add spaces to the left and right */
    padding: 15px 20px; /* Add inner spacing for content */
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-img-container {
    flex: 0 0 100px;
    text-align: center;
}

.card-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
}

.card-details {
    flex: 1;
    margin-left: 16px;
}

.card-details h3 {
    font-size: 16px;
    margin: 0;
    font-weight: bold;
}

.card-details p {
    margin: 4px 0;
    text-align: left;
}

.card-actions {
    margin-top: 10px;
}

.remove-btn {
    background: #ff4444;
    color: #fff;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
}

.remove-btn:hover {
    background: #ff2222;
}

`;
document.head.appendChild(emptyCartStyles);

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Attach event listeners to remove buttons
function attachRemoveEventListeners() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            removeFromCart(index);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Load cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const orderSummary = document.getElementById('order-summary');
    const checkoutTotal = document.getElementById('checkout-total');

    if (!orderSummary || !checkoutTotal) {
        console.error('Order summary or checkout total element not found. Ensure checkout.html has the correct IDs.');
        return;
    }

    // Render cart items in the order summary
    let total = 0;

    if (cart.length === 0) {
        // If cart is empty, show a message and hide total
        // In the checkout flow:
        orderSummary.innerHTML = '<p>Your cart is empty. <a href="/">Continue shopping</a></p>';
        checkoutTotal.textContent = 'KSh 0.00';
        return;
    }

    cart.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.className = 'checkout-item';
        productDiv.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>Price: KSh ${item.price.toLocaleString()}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Subtotal: KSh ${(item.price * item.quantity).toLocaleString()}</p>
            </div>
        `;
        orderSummary.appendChild(productDiv);
        total += item.price * item.quantity;
    });

    // Update total
    checkoutTotal.textContent = `KSh ${total.toLocaleString()}`;

    // Handle place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            alert('Order placed successfully!');
            localStorage.removeItem('cart'); // Clear cart
            window.location.href = '/'; // Redirect to homepage
        });
    }
});


// Update cart count in header and footer
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count-header').textContent = cartCount;
    document.getElementById('cart-count-footer').textContent = cartCount;
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});


// === Other Features ===

// 1. Hamburger Menu Toggle
if (menuToggle && menuClose && hamburgerMenu) {
    menuToggle.addEventListener('click', () => {
        hamburgerMenu.classList.add('open'); // Show the menu
    });

    menuClose.addEventListener('click', () => {
        hamburgerMenu.classList.remove('open'); // Hide the menu
    });

    // Close Hamburger Menu on Outside Click
    document.addEventListener('click', (event) => {
        if (
            hamburgerMenu.classList.contains('open') &&
            !hamburgerMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            hamburgerMenu.classList.remove('open'); // Close menu
        }
    });
}

// 2. Header Scroll Behavior
if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > 50) {
            header.classList.add('scrolled'); // Add shadow
            if (currentScroll > lastScrollTop) {
                header.style.top = '-100px'; // Hide on downscroll
            } else {
                header.style.top = '0'; // Show on upscroll
            }
        } else {
            header.classList.remove('scrolled');
            header.style.top = '0'; // Reset at top of page
        }

        lastScrollTop = Math.max(0, currentScroll); // Prevent negative scroll values
    });
}

// 3. Scroll to Categories
if (viewAllButton) {
    viewAllButton.addEventListener('click', () => {
        const categoriesSection = document.querySelector('#categories');
        if (categoriesSection) {
            categoriesSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// 4. Search Functionality
const searchInput = document.querySelector("#bottom-menu a[href='#search']");
if (searchInput) {
    searchInput.addEventListener('click', () => {
        const query = prompt('Search for a product:');
        if (query) {
            const products = document.querySelectorAll('.product-item');
            products.forEach((product) => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                product.style.display = title.includes(query.toLowerCase()) ? 'block' : 'none';
            });
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkout-btn');
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'checkout.html'; // Redirect to checkout.html
        });
    }
});

