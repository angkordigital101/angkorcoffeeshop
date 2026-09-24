/**
 * Angkor Coffee Roasters - Cart & E-Commerce State Engine
 * Handles persistent shopping cart, currency conversion, coupons, and cart drawer
 */

const CART_STORAGE_KEY = 'angkor_coffee_cart_v1';
const CURRENCY_STORAGE_KEY = 'angkor_coffee_currency';
const COUPON_STORAGE_KEY = 'angkor_coffee_applied_coupon';

// Exchange rate: 1 USD = 4,100 KHR (Cambodian Riel)
const USD_TO_KHR_RATE = 4100;
const FREE_SHIPPING_THRESHOLD = 35.00;
const STANDARD_SHIPPING_FEE = 4.50;

// Weight price multipliers relative to 250g base price
const WEIGHT_MULTIPLIERS = {
  '250g': 1.0,
  '500g': 1.85,
  '1kg': 3.4
};

// Available coupons
const VALID_COUPONS = {
  'ANGKOR10': { discountPercent: 10, name: '10% Angkor Welcome Discount' },
  'ROASTMASTER': { discountPercent: 15, name: '15% Master Roaster Club Discount' },
  'FREESHIP': { freeShipping: true, name: 'Free Express Shipping' }
};

class CartService {
  constructor() {
    this.cart = this.loadCart();
    this.currency = localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD';
    this.appliedCoupon = this.loadCoupon();
    this.initEventListeners();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      this.updateBadges();
      this.renderDrawer();
      window.dispatchEvent(new CustomEvent('angkor_cart_updated', { detail: { cart: this.cart } }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  loadCoupon() {
    try {
      const code = localStorage.getItem(COUPON_STORAGE_KEY);
      return code && VALID_COUPONS[code] ? { code, ...VALID_COUPONS[code] } : null;
    } catch (e) {
      return null;
    }
  }

  setCurrency(curr) {
    this.currency = curr === 'KHR' ? 'KHR' : 'USD';
    localStorage.setItem(CURRENCY_STORAGE_KEY, this.currency);
    document.querySelectorAll('.currency-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === this.currency);
    });
    this.renderDrawer();
    window.dispatchEvent(new CustomEvent('angkor_currency_changed', { detail: { currency: this.currency } }));
  }

  formatPrice(usdAmount) {
    if (this.currency === 'KHR') {
      const khr = Math.round(usdAmount * USD_TO_KHR_RATE);
      return `${khr.toLocaleString()} ៛`;
    }
    return `$${Number(usdAmount).toFixed(2)}`;
  }

  calculateItemPrice(basePrice, weight) {
    const mult = WEIGHT_MULTIPLIERS[weight] || 1.0;
    return Number((basePrice * mult).toFixed(2));
  }

  addItem(product, weight = '250g', grind = 'Whole Bean', quantity = 1, showDrawer = true) {
    const unitPrice = this.calculateItemPrice(product.basePrice, weight);
    const cartItemId = `${product.id}-${weight}-${grind.replace(/\s+/g, '_')}`;

    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += Number(quantity);
    } else {
      this.cart.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        roastLevel: product.roastLevel,
        origin: product.origin,
        weight,
        grind,
        unitPrice,
        quantity: Number(quantity)
      });
    }

    this.saveCart();
    this.showToast('Roast Added to Bag', `${quantity}x ${product.name} (${weight}, ${grind}) added!`);

    if (showDrawer) {
      this.openDrawer();
    }
  }

  removeItem(cartItemId) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.saveCart();
    if (item) {
      this.showToast('Item Removed', `${item.name} removed from your bag.`);
    }
  }

  updateQuantity(cartItemId, quantity) {
    const qty = parseInt(quantity, 10);
    const item = this.cart.find(i => i.cartItemId === cartItemId);

    if (!item) return;

    if (qty <= 0) {
      this.removeItem(cartItemId);
    } else {
      item.quantity = qty;
      this.saveCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getTotalItemsCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getDiscountAmount() {
    const subtotal = this.getSubtotal();
    if (!this.appliedCoupon) return 0;
    if (this.appliedCoupon.discountPercent) {
      return Number((subtotal * (this.appliedCoupon.discountPercent / 100)).toFixed(2));
    }
    return 0;
  }

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    if (this.appliedCoupon && this.appliedCoupon.freeShipping) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return STANDARD_SHIPPING_FEE;
  }

  getFinalTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  }

  applyCouponCode(rawCode) {
    const code = rawCode.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      this.appliedCoupon = { code, ...VALID_COUPONS[code] };
      localStorage.setItem(COUPON_STORAGE_KEY, code);
      this.saveCart();
      this.showToast('Coupon Applied!', `${this.appliedCoupon.name} applied successfully.`);
      return { success: true, message: `Applied: ${this.appliedCoupon.name}` };
    } else {
      return { success: false, message: 'Invalid promo code. Try "ANGKOR10" or "ROASTMASTER"' };
    }
  }

  removeCoupon() {
    this.appliedCoupon = null;
    localStorage.removeItem(COUPON_STORAGE_KEY);
    this.saveCart();
    this.showToast('Coupon Removed', 'Promo code removed.');
  }

  updateBadges() {
    const count = this.getTotalItemsCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.renderDrawer();
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  renderDrawer() {
    const container = document.getElementById('cartDrawerItems');
    if (!container) return;

    const count = this.getTotalItemsCount();
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    const total = this.getFinalTotal();

    // Free shipping progress bar
    const progressContainer = document.getElementById('freeShippingProgress');
    if (progressContainer) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressContainer.innerHTML = `
          <div class="shipping-unlocked">
            <i class="fa-solid fa-circle-check"></i>
            <span><strong>You've unlocked Free Express Shipping!</strong> (Orders $${FREE_SHIPPING_THRESHOLD}+)</span>
          </div>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width: 100%"></div></div>
        `;
      } else {
        const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
        const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        progressContainer.innerHTML = `
          <div class="shipping-needed">
            <i class="fa-solid fa-truck-fast"></i>
            <span>Add <strong>${this.formatPrice(remaining)}</strong> more to get <strong>FREE SHIPPING</strong>!</span>
          </div>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width: ${percent}%"></div></div>
        `;
      }
    }

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-cart-icon"><i class="fa-solid fa-mug-hot"></i></div>
          <h3>Your Bag is Fresh & Empty</h3>
          <p>You haven't selected any artisan roasted coffees yet. Discover our highland harvests!</p>
          <a href="shop.html" class="btn btn-primary" onclick="cartService.closeDrawer()">
            <i class="fa-solid fa-compass"></i> Explore All Roasts
          </a>
        </div>
      `;
      const footer = document.getElementById('cartDrawerFooter');
      if (footer) footer.style.display = 'none';
      return;
    }

    const footer = document.getElementById('cartDrawerFooter');
    if (footer) footer.style.display = 'block';

    let html = '';
    this.cart.forEach(item => {
      html += `
        <div class="cart-item-card" data-id="${item.cartItemId}">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-header">
              <h4 class="cart-item-title">${item.name}</h4>
              <button class="cart-item-remove" onclick="cartService.removeItem('${item.cartItemId}')" title="Remove Roast">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <div class="cart-item-specs">
              <span class="spec-pill"><i class="fa-solid fa-weight-hanging"></i> ${item.weight}</span>
              <span class="spec-pill"><i class="fa-solid fa-gears"></i> ${item.grind}</span>
            </div>
            <div class="cart-item-bottom">
              <div class="qty-stepper">
                <button type="button" onclick="cartService.updateQuantity('${item.cartItemId}', ${item.quantity - 1})">-</button>
                <input type="number" min="1" value="${item.quantity}" onchange="cartService.updateQuantity('${item.cartItemId}', this.value)" readonly>
                <button type="button" onclick="cartService.updateQuantity('${item.cartItemId}', ${item.quantity + 1})">+</button>
              </div>
              <div class="cart-item-price">
                ${this.formatPrice(item.unitPrice * item.quantity)}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Subtotal and Totals
    const subtotalEl = document.getElementById('drawerSubtotal');
    if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);

    const discountRow = document.getElementById('drawerDiscountRow');
    const discountEl = document.getElementById('drawerDiscount');
    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${this.formatPrice(discount)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    const shippingEl = document.getElementById('drawerShipping');
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'FREE' : this.formatPrice(shipping);
    }

    const totalEl = document.getElementById('drawerTotal');
    if (totalEl) totalEl.textContent = this.formatPrice(total);

    // Coupon tag
    const couponAppliedTag = document.getElementById('drawerAppliedCoupon');
    if (couponAppliedTag) {
      if (this.appliedCoupon) {
        couponAppliedTag.style.display = 'inline-flex';
        couponAppliedTag.innerHTML = `
          <span><i class="fa-solid fa-tag"></i> ${this.appliedCoupon.code} (${this.appliedCoupon.name})</span>
          <button type="button" onclick="cartService.removeCoupon()"><i class="fa-solid fa-xmark"></i></button>
        `;
      } else {
        couponAppliedTag.style.display = 'none';
      }
    }
  }

  showToast(title, message, icon = 'fa-solid fa-mug-saucer') {
    let container = document.getElementById('toastNotificationContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastNotificationContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'angkor-toast animate-slide-in';
    toast.innerHTML = `
      <div class="toast-icon"><i class="${icon}"></i></div>
      <div class="toast-content">
        <strong class="toast-title">${title}</strong>
        <p class="toast-msg">${message}</p>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.updateBadges();
      this.renderDrawer();

      // Setup drawer trigger listeners
      document.querySelectorAll('.open-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openDrawer();
        });
      });

      const closeBtn = document.getElementById('cartDrawerCloseBtn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

      const overlay = document.getElementById('cartDrawerOverlay');
      if (overlay) overlay.addEventListener('click', () => this.closeDrawer());

      // Currency toggles
      document.querySelectorAll('.currency-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setCurrency(btn.dataset.currency);
        });
      });

      // Coupon submit in drawer
      const couponForm = document.getElementById('drawerCouponForm');
      if (couponForm) {
        couponForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = document.getElementById('drawerCouponInput');
          if (input && input.value) {
            const res = this.applyCouponCode(input.value);
            if (!res.success) {
              alert(res.message);
            } else {
              input.value = '';
            }
          }
        });
      }
    });
  }
}

// Global instance
const cartService = new CartService();
