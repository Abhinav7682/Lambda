'use strict';

// ═══════════════════════════════════════════════════════
// CONFIG
// Values are injected by frontend/config.js (loaded BEFORE
// this script in index.html). That file sets window.APP_CONFIG
// with the correct API_BASE_URL and MOCK_MODE for each env:
//
//   Local dev  → frontend/config.js      (API = localhost:3000)
//   Production → frontend/config.prod.js → copied to config.js
//                on the EC2 instance     (API = public EC2 IP)
//
// The fallback here is intentionally safe: mock mode on,
// so the UI never breaks if config.js is missing.
// ═══════════════════════════════════════════════════════
const CONFIG = {
  API_BASE_URL: (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000',
  MOCK_MODE:    (window.APP_CONFIG && window.APP_CONFIG.MOCK_MODE    !== undefined)
                  ? window.APP_CONFIG.MOCK_MODE
                  : true, // safe fallback: never call a missing backend
};


// ═══════════════════════════════════════════════════════
// MOCK DATA
// Used when CONFIG.MOCK_MODE === true.
// Mirrors the exact shape the Express API returns.
// ═══════════════════════════════════════════════════════
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Keychron Q1 Pro',
    description: 'Gasket-mounted 75% mechanical keyboard. QMK/VIA support. Sandblasted aluminium housing with a satisfying thock.',
    price: 15900,
    stock_quantity: 14,
  },
  {
    id: 2,
    name: 'Logitech MX Master 3S',
    description: 'Electromagnetic scroll wheel. 8,000 DPI optical sensor. Virtually silent clicks for open offices.',
    price: 7999,
    stock_quantity: 31,
  },
  {
    id: 3,
    name: 'LG 27UK850-W 4K Monitor',
    description: '27-inch IPS. USB-C 60W PD. Out-of-box DeltaE < 2 colour accuracy. HDR10 with Nano IPS coating.',
    price: 35900,
    stock_quantity: 7,
  },
  {
    id: 4,
    name: 'Elgato Stream Deck MK.2',
    description: '15 customisable LCD keys. Drag-and-drop macro builder. Works on macOS and Windows without a driver reboot.',
    price: 11900,
    stock_quantity: 22,
  },
  {
    id: 5,
    name: 'Rode PodMic USB',
    description: 'Dynamic broadcast microphone. Internal pop filter. Dual USB-C and XLR — records flat, sounds warm.',
    price: 10300,
    stock_quantity: 18,
  },
  {
    id: 6,
    name: 'Anker PowerConf S330',
    description: 'USB speakerphone. 4-mic array with bidirectional noise cancellation. Full 360° voice pickup radius.',
    price: 4799,
    stock_quantity: 40,
  },
  {
    id: 7,
    name: 'CalDigit TS4 Thunderbolt Hub',
    description: '18 ports. Thunderbolt 4. 98W host charging. One cable to your MacBook or PC, zero desk cable chaos.',
    price: 30300,
    stock_quantity: 9,
  },
  {
    id: 8,
    name: 'Peak Design Laptop Bag 13L',
    description: 'Full-grain leather trim. Magnetic FlexFold dividers. Recycled 400D nylon shell. Fits a 16" MacBook with room.',
    price: 22300,
    stock_quantity: 5,
  },
];


// ═══════════════════════════════════════════════════════
// CART STORE
// localStorage-backed. All mutations go through here.
// ═══════════════════════════════════════════════════════
const CartStore = {
  _key: 'lambda_cart',

  /** Returns the current cart items array. */
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this._key) || '[]');
    } catch {
      return [];
    }
  },

  /** Persists the cart array to localStorage. */
  _save(items) {
    localStorage.setItem(this._key, JSON.stringify(items));
  },

  /**
   * Adds a product to the cart.
   * If already present, increments qty (capped at stock_quantity).
   */
  add(product) {
    const items = this.getItems();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, product.stock_quantity);
    } else {
      items.push({ ...product, quantity: 1 });
    }
    this._save(items);
  },

  /** Removes a product from the cart entirely. */
  remove(productId) {
    const items = this.getItems().filter((i) => i.id !== productId);
    this._save(items);
  },

  /**
   * Sets the quantity for a product.
   * Removes the item if qty ≤ 0.
   */
  update(productId, quantity) {
    const items = this.getItems();
    const item = items.find((i) => i.id === productId);
    if (!item) return;
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    item.quantity = Math.min(quantity, item.stock_quantity);
    this._save(items);
  },

  /** Clears the cart completely. */
  clear() {
    localStorage.removeItem(this._key);
  },

  /** Returns the total price across all items. */
  getTotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  /** Returns the total item count (sum of all quantities). */
  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  },
};


// ═══════════════════════════════════════════════════════
// PRODUCTS API
// Wraps fetch calls to GET /api/products.
// Falls back to MOCK_PRODUCTS when MOCK_MODE is true.
// ═══════════════════════════════════════════════════════
const ProductsAPI = {
  async fetchAll() {
    if (CONFIG.MOCK_MODE) {
      // Simulate network latency so the skeleton is visible
      await new Promise((r) => setTimeout(r, 700));
      return MOCK_PRODUCTS;
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
    return res.json();
  },

  async fetchOne(id) {
    if (CONFIG.MOCK_MODE) {
      return MOCK_PRODUCTS.find((p) => p.id === id) || null;
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/products/${id}`);
    if (!res.ok) throw new Error(`Product ${id} not found (${res.status})`);
    return res.json();
  },
};


// ═══════════════════════════════════════════════════════
// CHECKOUT API
// POSTs cart payload to /api/checkout.
// ═══════════════════════════════════════════════════════
const CheckoutAPI = {
  async submit(payload) {
    if (CONFIG.MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 900));
      // Simulate an order ID with realistic entropy
      return {
        success: true,
        message: 'Order confirmed.',
        order_id: `LMB-${Date.now().toString(36).toUpperCase()}`,
      };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Checkout failed.');
    return data;
  },
};


// ═══════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/** Formats a number as INR currency string. */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns the local product image URL for a product ID.
 */
function getProductImage(id) {
  return `/images/${id}.jpg`;
}


// ═══════════════════════════════════════════════════════
// RENDER PRODUCTS
// Builds the asymmetric masonry grid from the products
// array. Groups products in sets of 3:
//   Even group: [featured-left | two-stacked-right]
//   Odd group:  [two-stacked-left | featured-right]
// ═══════════════════════════════════════════════════════
function renderProducts(products) {
  const grid = $('#products-grid');
  const countEl = $('#product-count');
  if (!grid) return;

  countEl && (countEl.textContent = `${products.length} items`);

  let html = '';
  for (let i = 0; i < products.length; i += 3) {
    const group = products.slice(i, i + 3);
    const isEven = Math.floor(i / 3) % 2 === 0;
    html += buildProductGroup(group, isEven);
  }

  grid.innerHTML = html;
  grid.classList.remove('hidden');
  $('#products-skeleton') && $('#products-skeleton').classList.add('hidden');

  // Wire up every "Add to cart" button
  grid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.addToCart, 10);
      const product = products.find((p) => p.id === id);
      if (!product) return;
      CartStore.add(product);
      renderCart();
      updateCartBadge();
      flashAddButton(btn);
    });
  });
}

/** Wraps one group of up to 3 products in the alternating layout. */
function buildProductGroup(products, isEven) {
  const [featured, second, third] = products;
  const smallCards = [second, third]
    .filter(Boolean)
    .map(buildSmallCard)
    .join('');

  const featureHtml = buildFeaturedCard(featured);

  if (isEven) {
    // Featured on left (spans 2 cols), small stack on right
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="md:col-span-2">${featureHtml}</div>
        <div class="flex flex-col gap-4">${smallCards}</div>
      </div>`;
  } else {
    // Small stack on left, featured on right (spans 2 cols)
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="flex flex-col gap-4">${smallCards}</div>
        <div class="md:col-span-2">${featureHtml}</div>
      </div>`;
  }
}

/** Builds the large featured product card HTML string. */
function buildFeaturedCard(product) {
  if (!product) return '';
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const outOfStock = product.stock_quantity === 0;

  return `
    <article
      class="product-card group bg-zinc-900 border border-zinc-800 h-full flex flex-col"
      style="min-height: 500px;"
      data-product-id="${product.id}"
    >
      <!-- Image -->
      <div class="relative overflow-hidden flex-1" style="min-height: 300px;">
        <img
          src="${getProductImage(product.id)}"
          alt="${escapeHtml(product.name)}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent"></div>
        ${lowStock ? `
          <span class="absolute top-4 left-4 bg-amber-400 text-zinc-950 text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">
            Only ${product.stock_quantity} left
          </span>` : ''}
        ${outOfStock ? `
          <span class="absolute top-4 left-4 bg-zinc-700 text-zinc-300 text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">
            Out of stock
          </span>` : ''}
      </div>

      <!-- Details -->
      <div class="p-6">
        <p class="text-zinc-600 text-xs font-semibold tracking-[0.25em] uppercase mb-2">Featured</p>
        <h3 class="text-zinc-50 font-semibold text-xl mb-2 leading-snug">${escapeHtml(product.name)}</h3>
        <p class="text-zinc-400 text-sm mb-6 leading-relaxed">${escapeHtml(product.description)}</p>
        <div class="flex items-center justify-between gap-4">
          <span class="text-amber-400 font-bold text-2xl tabular-nums">${formatPrice(product.price)}</span>
          <button
            data-add-to-cart="${product.id}"
            class="bg-zinc-50 text-zinc-950 font-semibold text-sm px-6 py-3 hover:bg-amber-400 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            ${outOfStock ? 'disabled' : ''}
          >
            ${outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>`;
}

/** Builds the compact small product card HTML string. */
function buildSmallCard(product) {
  if (!product) return '';
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const outOfStock = product.stock_quantity === 0;

  return `
    <article
      class="product-card group bg-zinc-900 border border-zinc-800 flex flex-col flex-1"
      data-product-id="${product.id}"
    >
      <!-- Image -->
      <div class="relative overflow-hidden" style="height: 200px;">
        <img
          src="${getProductImage(product.id)}"
          alt="${escapeHtml(product.name)}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        ${lowStock ? `
          <span class="absolute top-3 left-3 bg-amber-400 text-zinc-950 text-xs font-semibold px-2 py-0.5 uppercase tracking-wide">
            ${product.stock_quantity} left
          </span>` : ''}
      </div>

      <!-- Details -->
      <div class="p-5 flex flex-col flex-1">
        <h3 class="text-zinc-50 font-semibold text-base mb-1 leading-snug">${escapeHtml(product.name)}</h3>
        <p class="text-zinc-500 text-xs mb-4 flex-1 leading-relaxed line-clamp-2">${escapeHtml(product.description)}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-amber-400 font-bold text-lg tabular-nums">${formatPrice(product.price)}</span>
          <button
            data-add-to-cart="${product.id}"
            class="bg-zinc-50 text-zinc-950 font-semibold text-sm px-6 py-3 hover:bg-amber-400 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            ${outOfStock ? 'disabled' : ''}
          >
            ${outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>`;
}

/** Renders shimmer skeleton cards while products are loading. */
function renderSkeletons() {
  const el = $('#products-skeleton');
  if (!el) return;
  el.innerHTML = Array(6).fill(null).map(() => `
    <div class="bg-zinc-900 border border-zinc-800">
      <div class="skeleton" style="height: 220px;"></div>
      <div class="p-5 space-y-3">
        <div class="skeleton h-4 rounded" style="width: 65%;"></div>
        <div class="skeleton h-3 rounded" style="width: 100%;"></div>
        <div class="skeleton h-3 rounded" style="width: 80%;"></div>
        <div class="skeleton h-8 rounded mt-4" style="width: 40%;"></div>
      </div>
    </div>
  `).join('');
  el.classList.remove('hidden');
}

/**
 * Briefly flashes an "Add to cart" button to confirm the action.
 * Restores original text after 1.2 s.
 */
function flashAddButton(btn) {
  const original = btn.innerHTML;
  const originalClasses = [...btn.classList];

  btn.textContent = '✓ Added';
  btn.classList.add('btn-flash', '!bg-amber-400', '!text-zinc-950');

  setTimeout(() => {
    btn.innerHTML = original;
    // Restore classes cleanly
    btn.className = originalClasses.join(' ');
  }, 1200);
}

/** Minimal HTML escaping to prevent XSS from API data. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ═══════════════════════════════════════════════════════
// RENDER CART
// Fully re-renders the cart drawer contents on every
// mutation (add, remove, qty change).
// ═══════════════════════════════════════════════════════
function renderCart() {
  const container = $('#cart-items');
  const totalEl = $('#cart-total');
  const countEl = $('#cart-item-count');
  const checkoutBtn = $('#checkout-open');
  if (!container) return;

  const items = CartStore.getItems();
  const total = CartStore.getTotal();
  const count = CartStore.getCount();

  // Update item count label
  if (countEl) {
    countEl.textContent = count === 1 ? '1 item' : `${count} items`;
  }

  // Enable / disable checkout button
  if (checkoutBtn) checkoutBtn.disabled = items.length === 0;

  // Empty state
  if (items.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-20">
        <p class="text-5xl mb-4 select-none">∅</p>
        <p class="text-zinc-400 font-medium text-sm">Your cart is empty.</p>
        <p class="text-zinc-700 text-xs mt-1">Add something worth owning.</p>
      </div>`;
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  // Render items
  container.innerHTML = items.map((item) => `
    <div class="flex gap-4 py-4 border-b border-zinc-800 last:border-0" data-cart-item="${item.id}">

      <!-- Thumbnail -->
      <img
        src="${getProductImage(item.id)}"
        alt="${escapeHtml(item.name)}"
        class="w-16 h-16 object-cover flex-shrink-0 bg-zinc-800"
        loading="lazy"
      />

      <!-- Name + qty controls -->
      <div class="flex-1 min-w-0">
        <p class="text-zinc-100 text-sm font-medium leading-snug truncate">${escapeHtml(item.name)}</p>
        <p class="text-zinc-600 text-xs mt-0.5">${formatPrice(item.price)} each</p>

        <!-- Quantity stepper -->
        <div class="flex items-center gap-2.5 mt-2.5">
          <button
            class="qty-btn w-6 h-6 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-amber-400 hover:text-amber-400 transition-colors text-sm leading-none"
            data-action="decrement"
            data-id="${item.id}"
            data-qty="${item.quantity}"
            aria-label="Decrease quantity"
          >−</button>
          <span class="text-zinc-100 text-sm font-semibold w-5 text-center tabular-nums">${item.quantity}</span>
          <button
            class="qty-btn w-6 h-6 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-amber-400 hover:text-amber-400 transition-colors text-sm leading-none"
            data-action="increment"
            data-id="${item.id}"
            data-qty="${item.quantity}"
            data-max="${item.stock_quantity}"
            aria-label="Increase quantity"
          >+</button>
        </div>
      </div>

      <!-- Line total + remove -->
      <div class="flex flex-col items-end justify-between flex-shrink-0">
        <button
          class="remove-btn text-zinc-700 hover:text-red-400 transition-colors p-0.5"
          data-id="${item.id}"
          aria-label="Remove ${escapeHtml(item.name)}"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <span class="text-zinc-100 font-semibold text-sm tabular-nums">
          ${formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  `).join('');

  // Update total
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Wire qty steppers
  container.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const current = parseInt(btn.dataset.qty, 10);
      const max = parseInt(btn.dataset.max || '999', 10);
      const next = btn.dataset.action === 'decrement' ? current - 1 : Math.min(current + 1, max);
      CartStore.update(id, next);
      renderCart();
      updateCartBadge();
    });
  });

  // Wire remove buttons
  container.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      CartStore.remove(parseInt(btn.dataset.id, 10));
      renderCart();
      updateCartBadge();
    });
  });
}


// ═══════════════════════════════════════════════════════
// CART BADGE
// ═══════════════════════════════════════════════════════
function updateCartBadge() {
  const badge = $('#cart-badge');
  if (!badge) return;
  const count = CartStore.getCount();
  badge.textContent = count;
  // Toggle between hidden and flex (badge is a flex container)
  badge.style.display = count > 0 ? 'flex' : 'none';
}


// ═══════════════════════════════════════════════════════
// CART OPEN / CLOSE
// ═══════════════════════════════════════════════════════
function openCart() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-overlay');
  if (!drawer || !overlay) return;

  renderCart(); // always refresh before opening

  overlay.classList.remove('hidden');

  // Trigger CSS transitions on next frame
  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
    drawer.classList.add('is-open');
  });

  document.body.style.overflow = 'hidden';
  drawer.focus && drawer.focus();
}

function closeCart() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-overlay');
  if (!drawer || !overlay) return;

  drawer.classList.remove('is-open');
  overlay.classList.remove('is-visible');

  // Hide overlay after transition completes (300 ms)
  setTimeout(() => overlay.classList.add('hidden'), 320);
  document.body.style.overflow = '';
}


// ═══════════════════════════════════════════════════════
// CHECKOUT MODAL OPEN / CLOSE
// ═══════════════════════════════════════════════════════
function openCheckout() {
  closeCart(); // cart must close first to avoid z-index clash
  const modal = $('#checkout-modal');
  if (!modal) return;

  renderCheckoutSummary();

  // Reset form to clean state (in case of previous visit)
  const form = $('#checkout-form');
  if (form) form.reset();

  const errorEl = $('#checkout-error');
  if (errorEl) errorEl.classList.add('hidden');

  // Restore form area in case a success state was showing
  restoreCheckoutForm();

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const modal = $('#checkout-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

/** Populates the left column of the checkout modal with cart items. */
function renderCheckoutSummary() {
  const container = $('#checkout-summary-items');
  const subtotalEl = $('#checkout-summary-subtotal');
  const shippingEl = $('#checkout-summary-shipping');
  const totalEl = $('#checkout-summary-total');
  if (!container) return;

  const items = CartStore.getItems();
  const subtotal = CartStore.getTotal();
  const shipping = subtotal >= 15000 ? 0 : 500;
  const total = subtotal + shipping;

  container.innerHTML = items.map((item) => `
    <div class="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0">
      <img
        src="${getProductImage(item.id)}"
        alt="${escapeHtml(item.name)}"
        class="w-12 h-12 object-cover bg-zinc-800 flex-shrink-0"
        loading="lazy"
      />
      <div class="flex-1 min-w-0">
        <p class="text-zinc-200 text-sm font-medium truncate">${escapeHtml(item.name)}</p>
        <p class="text-zinc-600 text-xs mt-0.5">Qty: ${item.quantity}</p>
      </div>
      <span class="text-zinc-100 text-sm font-semibold flex-shrink-0 tabular-nums">
        ${formatPrice(item.price * item.quantity)}
      </span>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

/**
 * Restores the checkout form if it was replaced by the success state.
 * Called each time the modal is opened fresh.
 */
function restoreCheckoutForm() {
  const area = $('#checkout-form-area');
  if (!area || area.querySelector('#checkout-form')) return; // form already present

  area.innerHTML = `
    <p class="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase mb-8">Your Details</p>
    <p id="checkout-error" class="hidden mb-6 text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-sm" role="alert"></p>
    <form id="checkout-form" class="space-y-5" novalidate>
      <div>
        <label for="field-name" class="block text-zinc-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">Full Name</label>
        <input type="text" id="field-name" name="name" required autocomplete="name"
          placeholder="Aritra Biswas"
          class="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 px-4 py-3.5 text-sm placeholder:text-zinc-700 focus:border-amber-400 focus:outline-none transition-colors" />
      </div>
      <div>
        <label for="field-email" class="block text-zinc-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">Email Address</label>
        <input type="email" id="field-email" name="email" required autocomplete="email"
          placeholder="aritra@lambda.dev"
          class="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 px-4 py-3.5 text-sm placeholder:text-zinc-700 focus:border-amber-400 focus:outline-none transition-colors" />
      </div>
      <div>
        <label for="field-address" class="block text-zinc-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">Delivery Address</label>
        <textarea id="field-address" name="address" required autocomplete="street-address"
          placeholder="42 Sector V, Salt Lake&#10;Kolkata 700 091" rows="3"
          class="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 px-4 py-3.5 text-sm placeholder:text-zinc-700 focus:border-amber-400 focus:outline-none transition-colors resize-none"></textarea>
      </div>
      <div class="border-t border-zinc-800 pt-5">
        <p class="text-zinc-500 text-xs font-semibold tracking-[0.15em] uppercase mb-4">Payment</p>
        <div class="bg-zinc-900 border border-zinc-700 px-4 py-3.5 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-zinc-600 flex-shrink-0" aria-hidden="true">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span class="text-zinc-600 text-sm tracking-widest">•••• •••• •••• 4242</span>
          <span class="ml-auto text-zinc-700 text-xs font-medium">Demo — no charge</span>
        </div>
      </div>
      <div class="pt-2">
        <button type="submit"
          class="w-full bg-amber-400 text-zinc-950 font-semibold py-4 hover:bg-amber-300 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          Place Order
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <p class="text-zinc-700 text-xs text-center mt-3">
          By placing your order you agree to our
          <a href="#" class="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Terms</a>
          and
          <a href="#" class="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </form>`;

  // Re-attach the submit handler (since the form element is new)
  $('#checkout-form').addEventListener('submit', handleCheckoutSubmit);
}


// ═══════════════════════════════════════════════════════
// CHECKOUT FORM SUBMIT
// ═══════════════════════════════════════════════════════
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');
  const errorEl = $('#checkout-error');

  // Clear previous errors
  if (errorEl) errorEl.classList.add('hidden');

  // Validate required fields manually for better UX
  const name = form.querySelector('#field-name').value.trim();
  const email = form.querySelector('#field-email').value.trim();
  const address = form.querySelector('#field-address').value.trim();

  if (!name || !email || !address) {
    if (errorEl) {
      errorEl.textContent = 'Please fill in all required fields.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  // Loading state
  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25"/>
      <path d="M21 12a9 9 0 01-9 9" stroke-linecap="round"/>
    </svg>
    Processing…`;
  submitBtn.disabled = true;

  const subtotal = CartStore.getTotal();
  const shipping = subtotal >= 15000 ? 0 : 500;

  const payload = {
    customer: { name, email, address },
    items: CartStore.getItems().map((i) => ({
      product_id: i.id,
      quantity: i.quantity,
    })),
    total: subtotal + shipping,
  };

  try {
    const result = await CheckoutAPI.submit(payload);
    CartStore.clear();
    updateCartBadge();
    showCheckoutSuccess(result);
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'Something went wrong. Please try again.';
      errorEl.classList.remove('hidden');
    }
    submitBtn.innerHTML = originalBtnHtml;
    submitBtn.disabled = false;
  }
}

/** Replaces the form with a success confirmation panel. */
function showCheckoutSuccess(result) {
  const area = $('#checkout-form-area');
  if (!area) return;

  area.innerHTML = `
    <div id="checkout-success" class="flex flex-col items-start py-16">
      <!-- Checkmark badge -->
      <div class="w-12 h-12 bg-amber-400 flex items-center justify-center mb-8">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 13L9 17L19 7"/>
        </svg>
      </div>

      <h3 class="text-2xl font-bold text-zinc-50 mb-2">Order confirmed.</h3>
      <p class="text-zinc-400 text-sm mb-1">
        Reference:
        <span class="text-amber-400 font-mono font-semibold ml-1">${escapeHtml(result.order_id || 'N/A')}</span>
      </p>
      <p class="text-zinc-600 text-sm mb-10">
        A confirmation will be sent to your email address.<br/>
        Your order ships within 3 working days.
      </p>

      <button
        onclick="closeCheckout()"
        class="inline-flex items-center gap-2 bg-zinc-50 text-zinc-950 font-semibold text-sm px-8 py-3.5 hover:bg-amber-400 transition-colors"
      >
        Continue browsing
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>`;
}


// ═══════════════════════════════════════════════════════
// INIT
// Entry point — called on DOMContentLoaded.
// ═══════════════════════════════════════════════════════
async function init() {
  // Show skeletons immediately
  renderSkeletons();

  // Restore cart state from localStorage
  updateCartBadge();

  // ── Event listeners ──────────────────────────────────

  // Cart open / close
  $('#cart-toggle')?.addEventListener('click', openCart);
  $('#cart-close')?.addEventListener('click', closeCart);
  $('#cart-close-bottom')?.addEventListener('click', closeCart);
  $('#cart-overlay')?.addEventListener('click', closeCart);

  // Checkout open / close
  $('#checkout-open')?.addEventListener('click', openCheckout);
  $('#checkout-modal-close')?.addEventListener('click', closeCheckout);

  // Checkout form submit (initial binding; re-bound by restoreCheckoutForm)
  $('#checkout-form')?.addEventListener('submit', handleCheckoutSubmit);

  // Escape key closes whichever overlay is open
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = $('#checkout-modal');
    if (modal && !modal.classList.contains('hidden')) {
      closeCheckout();
    } else {
      closeCart();
    }
  });

  // ── Fetch products ────────────────────────────────────
  try {
    const products = await ProductsAPI.fetchAll();
    renderProducts(products);
  } catch (err) {
    const skeleton = $('#products-skeleton');
    if (skeleton) {
      skeleton.innerHTML = `
        <div class="col-span-3 py-32 text-center">
          <p class="text-zinc-500 text-sm font-medium mb-2">Failed to load products.</p>
          <p class="text-zinc-700 text-xs font-mono">${escapeHtml(err.message)}</p>
          <p class="text-zinc-700 text-xs mt-3">
            Make sure the backend is running at
            <span class="text-zinc-500 font-mono">${escapeHtml(CONFIG.API_BASE_URL)}</span>
            or set <span class="text-zinc-500 font-mono">CONFIG.MOCK_MODE = true</span>.
          </p>
        </div>`;
    }
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);

