// Shopping Cart Functionality
let cart = [];
const cartCount = document.querySelector('.cart-count');
const cartCount2 = document.querySelector('.cart-count2');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const buyNowButtons = document.querySelectorAll('.buy-now');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutTotal = document.getElementById('checkoutTotal');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const orderDetails = document.getElementById('orderDetails');
const orderTotal = document.getElementById('orderTotal');
const submitOrder = document.getElementById('submitOrder');
const formLoading = document.getElementById('formLoading');

// ✅ ڈیلیوری چارجز کے لیے کنسٹنٹس
const FREE_SHIPPING_THRESHOLD = 3000;
const DELIVERY_CHARGES = 270;

// ✅ FIXED: Global functions for cart operations
window.addToCart = function(id, name, price, image) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name,
      price: parseInt(price),
      image,
      quantity: 1
    });
  }
  
  updateCart();
  showNotification(`${name} added to cart!`);
}

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
  showNotification('Item removed from cart');
}

window.updateQuantity = function(id, change) {
  const item = cart.find(item => item.id === id);
  
  if (item) {
    item.quantity += change;
    
    if (item.quantity < 1) {
      window.removeFromCart(id);
    } else {
      updateCart();
    }
  }
}

// ✅ کیلکولیٹ ٹوٹل پرائس ڈیلیوری چارجز کے ساتھ
function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // اگر سب ٹوٹل 3000 سے کم ہے تو ڈیلیوری چارجز شامل کریں
  const delivery = subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 ? DELIVERY_CHARGES : 0;
  const total = subtotal + delivery;
  
  return {
    subtotal,
    delivery,
    total
  };
}

// ✅ FIXED: Update Cart Display with Event Delegation
function updateCart() {
  // Update cart count
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount2.textContent = totalItems;
  
  // کیلکولیٹ پرائسز ڈیلیوری چارجز کے ساتھ
  const { subtotal, delivery, total } = calculateTotal();
  
  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">₨${item.price * item.quantity}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
            <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
            <button class="remove-item" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // ✅ ڈیلیوری چارجز کا نوٹیفیکیشن شامل کریں
  if (delivery > 0) {
    cartItems.innerHTML += `
      <div style="padding: 10px 0; margin-top: 10px; border-top: 1px dashed var(--border);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: var(--text-light);">Subtotal:</span>
          <span style="font-weight: bold;">₨${subtotal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--accent);">
          <span>Delivery Charges:</span>
          <span>+₨${delivery}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--primary); margin-top: 5px; text-align: center;">
          <i class="fas fa-info-circle"></i> Free delivery on orders above ₨${FREE_SHIPPING_THRESHOLD}
        </div>
      </div>
    `;
  }
  
  // Update cart total with delivery charges
  cartTotal.textContent = `₨${total}`;
  
  // ✅ IMPORTANT: Add event listeners to the newly created buttons
  attachCartItemEvents();
}

// ✅ FIXED: Attach events to cart item buttons using event delegation
function attachCartItemEvents() {
  // Use event delegation for dynamically created elements
  cartItems.addEventListener('click', function(e) {
    const target = e.target;
    const id = target.getAttribute('data-id') || 
               target.closest('button')?.getAttribute('data-id') ||
               target.closest('.remove-item')?.getAttribute('data-id');
    
    if (!id) return;
    
    if (target.classList.contains('minus-btn') || target.closest('.minus-btn')) {
      window.updateQuantity(id, -1);
    } else if (target.classList.contains('plus-btn') || target.closest('.plus-btn')) {
      window.updateQuantity(id, 1);
    } else if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
      window.removeFromCart(id);
    }
  });
}

// ✅ چیک آؤٹ سمری اپڈیٹ فنکشن میں ڈیلیوری چارجز شامل کریں
function updateCheckoutSummary() {
  checkoutSummary.innerHTML = '';
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    checkoutSummary.innerHTML += `
      <div class="summary-item">
        <span>${item.name} x${item.quantity}</span>
        <span>₨${itemTotal}</span>
      </div>
    `;
  });
  
  // ڈیلیوری چارجز شامل کریں
  const { subtotal, delivery, total } = calculateTotal();
  
  if (delivery > 0) {
    checkoutSummary.innerHTML += `
      <div class="summary-item">
        <span>Delivery Charges</span>
        <span>+₨${delivery}</span>
      </div>
    `;
  }
  
  checkoutTotal.textContent = `₨${total}`;
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.querySelector('i').className = 'fas fa-sun';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Cart Toggle
cartToggle.addEventListener('click', () => {
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
});

mobileCartBtn.addEventListener('click', (e) => {
  e.preventDefault();
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
});

closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
  checkoutModal.classList.remove('active');
});

// Add event listeners to Add to Cart buttons
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = button.getAttribute('data-price');
    const image = button.getAttribute('data-image');
    
    window.addToCart(id, name, price, image);
  });
});

// Add event listeners to Buy Now buttons
buyNowButtons.forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = button.getAttribute('data-price');
    const image = button.getAttribute('data-image');
    
    // Clear cart and add only this product
    cart = [{
      id: id,
      name,
      price: parseInt(price),
      image,
      quantity: 1
    }];
    
    updateCart();
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    showNotification(`${name} added to cart!`);
  });
});

// Checkout Functionality
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showNotification('Your cart is empty!');
    return;
  }
  
  updateCheckoutSummary();
  checkoutModal.classList.add('active');
  overlay.classList.add('active');
});

closeCheckout.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
  overlay.classList.remove('active');
});

// Checkout Form Submission with Formspree
checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loading animation
  submitOrder.style.display = 'none';
  formLoading.style.display = 'block';

  // Prepare order details for Formspree
  const orderItems = cart.map(item =>
    `${item.name} (x${item.quantity}) - ₨${item.price * item.quantity}`
  ).join(', ');

  // ڈیلیوری چارجز کو بھی شامل کریں
  const { subtotal, delivery, total } = calculateTotal();
  
  if (delivery > 0) {
    orderDetails.value = orderItems + ` + Delivery Charges: ₨${delivery}`;
  } else {
    orderDetails.value = orderItems + " (Free Delivery)";
  }
  
  orderTotal.value = `₨${total}`;

  try {
    const formData = new FormData(checkoutForm);
    const response = await fetch(checkoutForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      showNotification('✅ Order placed successfully! We\'ll contact you soon.');

      // Reset everything
      cart = [];
      updateCart();
      checkoutModal.classList.remove('active');
      overlay.classList.remove('active');
      checkoutForm.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    showNotification('❌ Error sending order. Please try again later.');
    console.error('Order Error:', error);
  } finally {
    submitOrder.style.display = 'block';
    formLoading.style.display = 'none';
  }
});

// Show Notification
function showNotification(message) {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(notification => {
    notification.remove();
  });
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// FAQ Functionality
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    // Close all other FAQ items
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });
    
    // Toggle current FAQ item
    item.classList.toggle('active');
  });
});

// Mobile Bottom Navigation Active State
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
mobileNavItems.forEach(item => {
  item.addEventListener('click', function() {
    mobileNavItems.forEach(navItem => {
      navItem.classList.remove('active');
    });
    this.classList.add('active');
  });
});

// Other Button Functionality
document.getElementById('viewAllProducts')?.addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Showing all products');
});

document.getElementById('accountBtn')?.addEventListener('click', () => {
  showNotification('Account management coming soon!');
});

document.getElementById('mobileAccountBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Account management coming soon!');
});

document.getElementById('trackOrder')?.addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Order tracking feature coming soon!');
});

document.getElementById('wishlistBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Wishlist feature coming soon!');
});

// Initialize cart
updateCart();