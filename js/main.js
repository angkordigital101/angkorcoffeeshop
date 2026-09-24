/**
 * Angkor Coffee Roasters - Main Interactive Application Script
 * Orchestrates UI interactions, filters, modals, quiz, and product rendering
 */

// Helper to generate flame icons based on roast score (1-5)
function renderRoastFlames(score) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= score) {
      html += '<i class="fa-solid fa-fire text-roast-active"></i>';
    } else {
      html += '<i class="fa-solid fa-fire text-roast-inactive"></i>';
    }
  }
  return html;
}

// Helper to render star ratings
function renderStars(rating) {
  let html = '';
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalf) {
      html += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      html += '<i class="fa-regular fa-star"></i>';
    }
  }
  return html;
}

// Generate single product card HTML
function renderProductCard(product) {
  const formattedPrice = cartService.formatPrice(product.basePrice);
  const badgeHtml = product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}">${product.badge}</span>` : '';

  const notesHtml = product.tastingNotes.slice(0, 3).map(n => `<span class="note-pill">${n}</span>`).join('');

  return `
    <article class="roast-card" data-category="${product.category}" data-roast="${product.roastLevel.toLowerCase()}" data-id="${product.id}">
      <div class="card-media">
        <a href="product-detail.html?id=${product.id}" class="card-image-link">
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        </a>
        ${badgeHtml}
        <button class="quick-view-btn" onclick="openQuickViewModal('${product.id}')" title="Quick View Roast">
          <i class="fa-regular fa-eye"></i> Quick View
        </button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-origin"><i class="fa-solid fa-location-dot"></i> ${product.origin.split(',')[0]}</span>
          <div class="roast-meter" title="Roast Level: ${product.roastLevel} (${product.roastScore}/5)">
            <span class="roast-label">${product.roastLevel}</span>
            <div class="flames">${renderRoastFlames(product.roastScore)}</div>
          </div>
        </div>
        
        <h3 class="product-title">
          <a href="product-detail.html?id=${product.id}">${product.name}</a>
        </h3>

        <p class="product-desc">${product.tagline}</p>

        <div class="tasting-notes-strip">
          ${notesHtml}
        </div>

        <div class="card-reviews">
          <div class="stars">${renderStars(product.rating)}</div>
          <span class="rating-num">${product.rating}</span>
          <span class="review-count">(${product.reviewsCount})</span>
        </div>

        <div class="card-purchase-controls">
          <div class="card-selectors">
            <div class="select-group">
              <label>Weight:</label>
              <select class="card-weight-select" id="weight-${product.id}" onchange="updateCardPrice('${product.id}')">
                <option value="250g" selected>250g (8.8oz)</option>
                <option value="500g">500g (1.1lb)</option>
                <option value="1kg">1kg (2.2lb)</option>
              </select>
            </div>
            <div class="select-group">
              <label>Grind:</label>
              <select class="card-grind-select" id="grind-${product.id}">
                <option value="Whole Bean" selected>Whole Bean</option>
                <option value="Pour Over (Medium)">Pour Over (V60)</option>
                <option value="Espresso Fine">Espresso Fine</option>
                <option value="Phin Traditional">Phin Filter</option>
                <option value="French Press / Cold Brew">French Press</option>
              </select>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-box">
              <span class="price-from">From</span>
              <span class="current-price" id="price-display-${product.id}">${formattedPrice}</span>
            </div>
            <button class="btn btn-add-cart" onclick="quickAddToCart('${product.id}')">
              <i class="fa-solid fa-bag-shopping"></i> Add to Bag
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Update card price when user switches weight dropdown on card
function updateCardPrice(productId) {
  const product = getProductById(productId);
  if (!product) return;
  const weightSelect = document.getElementById(`weight-${productId}`);
  const priceDisplay = document.getElementById(`price-display-${productId}`);
  if (weightSelect && priceDisplay) {
    const selectedWeight = weightSelect.value;
    const itemPrice = cartService.calculateItemPrice(product.basePrice, selectedWeight);
    priceDisplay.textContent = cartService.formatPrice(itemPrice);
  }
}

// Quick add to cart directly from card
function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const weightSelect = document.getElementById(`weight-${productId}`);
  const grindSelect = document.getElementById(`grind-${productId}`);

  const weight = weightSelect ? weightSelect.value : '250g';
  const grind = grindSelect ? grindSelect.value : 'Whole Bean';

  cartService.addItem(product, weight, grind, 1, true);
}

// Quick View Modal
function openQuickViewModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'angkor-modal-overlay';
    document.body.appendChild(modal);
  }

  const formattedBasePrice = cartService.formatPrice(product.basePrice);

  modal.innerHTML = `
    <div class="angkor-modal-container animate-scale-up">
      <button class="modal-close-btn" onclick="closeQuickViewModal()">&times;</button>
      <div class="quick-view-grid">
        <div class="quick-view-gallery">
          <div class="quick-main-img">
            <img src="${product.image}" alt="${product.name}" id="qvMainImg">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          </div>
          <div class="roast-origin-meta">
            <div><i class="fa-solid fa-mountain-sun"></i> <strong>Elevation:</strong> ${product.altitude}</div>
            <div><i class="fa-solid fa-seedling"></i> <strong>Process:</strong> ${product.process}</div>
            <div><i class="fa-solid fa-map-pin"></i> <strong>Terroir:</strong> ${product.origin}</div>
          </div>
        </div>
        <div class="quick-view-info">
          <div class="qv-header">
            <div class="roast-badge-strip">
              <span class="roast-pill">${product.roastLevel} Roast</span>
              <div class="flames-sm">${renderRoastFlames(product.roastScore)}</div>
            </div>
            <h2>${product.name}</h2>
            <div class="qv-rating-row">
              <div class="stars">${renderStars(product.rating)}</div>
              <span>${product.rating} (${product.reviewsCount} verified roast reviews)</span>
            </div>
          </div>

          <div class="qv-price-row">
            <div class="qv-price" id="qvPrice">${formattedBasePrice}</div>
            <span class="freshness-guarantee"><i class="fa-solid fa-shield-halved"></i> Roasted within 48h</span>
          </div>

          <p class="qv-desc">${product.description}</p>

          <!-- Sensory Profile Radar/Bars -->
          <div class="sensory-bars">
            <div class="sensory-item">
              <span class="sensory-label">Sweetness</span>
              <div class="bar-track"><div class="bar-fill" style="width: ${product.sweetness * 20}%"></div></div>
            </div>
            <div class="sensory-item">
              <span class="sensory-label">Body / Viscosity</span>
              <div class="bar-track"><div class="bar-fill" style="width: ${product.body * 20}%"></div></div>
            </div>
            <div class="sensory-item">
              <span class="sensory-label">Acidity / Brightness</span>
              <div class="bar-track"><div class="bar-fill" style="width: ${product.acidity * 20}%"></div></div>
            </div>
          </div>

          <div class="tasting-notes-box">
            <strong>Cupping Notes:</strong>
            <div class="tasting-notes-pills">
              ${product.tastingNotes.map(n => `<span class="note-pill"><i class="fa-solid fa-feather"></i> ${n}</span>`).join('')}
            </div>
          </div>

          <form id="qvAddForm" onsubmit="handleQuickViewSubmit(event, '${product.id}')" class="qv-form">
            <div class="form-row-selectors">
              <div class="selector-field">
                <label>Select Weight:</label>
                <div class="weight-pills">
                  <label class="weight-option">
                    <input type="radio" name="qvWeight" value="250g" checked onchange="updateQvPrice('${product.id}')">
                    <span>250g <em>(8.8 oz)</em></span>
                  </label>
                  <label class="weight-option">
                    <input type="radio" name="qvWeight" value="500g" onchange="updateQvPrice('${product.id}')">
                    <span>500g <em>(1.1 lb)</em></span>
                  </label>
                  <label class="weight-option">
                    <input type="radio" name="qvWeight" value="1kg" onchange="updateQvPrice('${product.id}')">
                    <span>1 kg <em>(2.2 lb)</em></span>
                  </label>
                </div>
              </div>

              <div class="selector-field">
                <label for="qvGrind">Brew Grind Profile:</label>
                <select id="qvGrind" class="styled-select" required>
                  <option value="Whole Bean">Whole Bean (Maximum Freshness)</option>
                  <option value="Pour Over (Medium)">Pour Over / V60 / Chemex (Medium)</option>
                  <option value="Espresso Fine">Espresso Machine / Moka Pot (Fine)</option>
                  <option value="Phin Traditional">Traditional Cambodian Phin (Medium-Fine)</option>
                  <option value="French Press / Cold Brew">French Press / Cold Brew (Coarse)</option>
                </select>
              </div>
            </div>

            <div class="qv-action-row">
              <div class="qv-qty-stepper">
                <button type="button" onclick="stepQvQty(-1)">-</button>
                <input type="number" id="qvQty" value="1" min="1" max="50" readonly>
                <button type="button" onclick="stepQvQty(1)">+</button>
              </div>
              <button type="submit" class="btn btn-primary btn-large btn-block">
                <i class="fa-solid fa-bag-shopping"></i> Add to Coffee Bag
              </button>
            </div>
          </form>

          <div class="qv-footer-links">
            <a href="product-detail.html?id=${product.id}" class="view-full-details-link">
              View Full Origin & Cupping Story <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateQvPrice(productId) {
  const product = getProductById(productId);
  if (!product) return;
  const checked = document.querySelector('input[name="qvWeight"]:checked');
  const priceEl = document.getElementById('qvPrice');
  if (checked && priceEl) {
    const unitPrice = cartService.calculateItemPrice(product.basePrice, checked.value);
    priceEl.textContent = cartService.formatPrice(unitPrice);
  }
}

function stepQvQty(delta) {
  const qtyInput = document.getElementById('qvQty');
  if (qtyInput) {
    let val = parseInt(qtyInput.value, 10) || 1;
    val = Math.max(1, val + delta);
    qtyInput.value = val;
  }
}

function handleQuickViewSubmit(e, productId) {
  e.preventDefault();
  const product = getProductById(productId);
  if (!product) return;

  const checkedWeight = document.querySelector('input[name="qvWeight"]:checked')?.value || '250g';
  const grind = document.getElementById('qvGrind')?.value || 'Whole Bean';
  const qty = parseInt(document.getElementById('qvQty')?.value, 10) || 1;

  cartService.addItem(product, checkedWeight, grind, qty, true);
  closeQuickViewModal();
}

function closeQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Coffee Flavor Finder Quiz Engine
const QUIZ_STATE = {
  step: 1,
  brewMethod: null,
  flavorPreference: null,
  roastTolerance: null
};

function selectQuizOption(question, value) {
  QUIZ_STATE[question] = value;
  
  if (QUIZ_STATE.step === 1) {
    QUIZ_STATE.step = 2;
    renderQuizStep();
  } else if (QUIZ_STATE.step === 2) {
    QUIZ_STATE.step = 3;
    renderQuizStep();
  } else if (QUIZ_STATE.step === 3) {
    calculateQuizMatch();
  }
}

function renderQuizStep() {
  const container = document.getElementById('quizStepContainer');
  if (!container) return;

  const stepIndicators = document.querySelectorAll('.quiz-step-dot');
  stepIndicators.forEach((dot, idx) => {
    dot.classList.toggle('active', idx + 1 === QUIZ_STATE.step);
    dot.classList.toggle('completed', idx + 1 < QUIZ_STATE.step);
  });

  if (QUIZ_STATE.step === 1) {
    container.innerHTML = `
      <div class="quiz-question-box animate-fade-in">
        <span class="quiz-eyebrow">Step 1 of 3</span>
        <h3 class="quiz-title">How do you usually brew your morning coffee?</h3>
        <p class="quiz-subtitle">Every extraction style pairs differently with roast density and bean elevation.</p>
        <div class="quiz-options-grid">
          <button class="quiz-opt-card" onclick="selectQuizOption('brewMethod', 'pourover')">
            <div class="opt-icon"><i class="fa-solid fa-filter"></i></div>
            <strong>Pour Over / Drip</strong>
            <span>V60, Chemex, Kalita, Auto Drip</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('brewMethod', 'espresso')">
            <div class="opt-icon"><i class="fa-solid fa-mug-hot"></i></div>
            <strong>Espresso / Moka</strong>
            <span>High pressure extraction, thick crema</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('brewMethod', 'phin')">
            <div class="opt-icon"><i class="fa-solid fa-fire-burner"></i></div>
            <strong>Phin / Southeast Asian Style</strong>
            <span>Traditional slow drip with condensed milk</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('brewMethod', 'french_press')">
            <div class="opt-icon"><i class="fa-solid fa-snowflake"></i></div>
            <strong>French Press / Cold Brew</strong>
            <span>Immersion, full body, cold extraction</span>
          </button>
        </div>
      </div>
    `;
  } else if (QUIZ_STATE.step === 2) {
    container.innerHTML = `
      <div class="quiz-question-box animate-fade-in">
        <span class="quiz-eyebrow">Step 2 of 3</span>
        <h3 class="quiz-title">What flavors do you crave in your cup?</h3>
        <p class="quiz-subtitle">Select the tasting notes that make your heart beat faster.</p>
        <div class="quiz-options-grid">
          <button class="quiz-opt-card" onclick="selectQuizOption('flavorPreference', 'chocolate_nutty')">
            <div class="opt-icon"><i class="fa-solid fa-cookie-bite"></i></div>
            <strong>Dark Chocolate & Roasted Nuts</strong>
            <span>Rich, decadent, caramel, comforting</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('flavorPreference', 'fruity_floral')">
            <div class="opt-icon"><i class="fa-solid fa-seedling"></i></div>
            <strong>Wild Honey & Tropical Fruits</strong>
            <span>Jasmine, blackberry, honey, lively sweetness</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('flavorPreference', 'smoky_spiced')">
            <div class="opt-icon"><i class="fa-solid fa-cloud"></i></div>
            <strong>Smoky Molasses & Ancient Spices</strong>
            <span>Bold, cardamom, dark cacao, syrupy depth</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('flavorPreference', 'balanced_palm')">
            <div class="opt-icon"><i class="fa-solid fa-sun"></i></div>
            <strong>Palm Sugar & Milk Chocolate</strong>
            <span>Balanced everyday sweetness with zero bitterness</span>
          </button>
        </div>
        <div class="quiz-back-btn">
          <button class="btn btn-outline-sm" onclick="restartQuiz(1)"><i class="fa-solid fa-arrow-left"></i> Previous Step</button>
        </div>
      </div>
    `;
  } else if (QUIZ_STATE.step === 3) {
    container.innerHTML = `
      <div class="quiz-question-box animate-fade-in">
        <span class="quiz-eyebrow">Final Step 3 of 3</span>
        <h3 class="quiz-title">What roast intensity & caffeine balance do you prefer?</h3>
        <p class="quiz-subtitle">Our master roasters will match your exact roast profile.</p>
        <div class="quiz-options-grid">
          <button class="quiz-opt-card" onclick="selectQuizOption('roastTolerance', 'light_medium')">
            <div class="opt-icon"><i class="fa-solid fa-feather-pointed"></i></div>
            <strong>Light to Medium Roast</strong>
            <span>Bright origin nuances, sparkling aroma, medium body</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('roastTolerance', 'dark_bold')">
            <div class="opt-icon"><i class="fa-solid fa-fire"></i></div>
            <strong>Dark & Heavy Body</strong>
            <span>Intense roasted oils, low acidity, thick crema</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('roastTolerance', 'balanced_medium')">
            <div class="opt-icon"><i class="fa-solid fa-scale-balanced"></i></div>
            <strong>Smooth Harmonious Medium</strong>
            <span>The golden standard of sweetness and body</span>
          </button>
          <button class="quiz-opt-card" onclick="selectQuizOption('roastTolerance', 'decaf')">
            <div class="opt-icon"><i class="fa-solid fa-moon"></i></div>
            <strong>100% Swiss Water Decaf</strong>
            <span>Rich flavor, zero jitters, anytime enjoyment</span>
          </button>
        </div>
        <div class="quiz-back-btn">
          <button class="btn btn-outline-sm" onclick="restartQuiz(2)"><i class="fa-solid fa-arrow-left"></i> Previous Step</button>
        </div>
      </div>
    `;
  }
}

function calculateQuizMatch() {
  const container = document.getElementById('quizStepContainer');
  if (!container) return;

  let matchedId = 'mondulkiri-peaberry';

  if (QUIZ_STATE.roastTolerance === 'decaf') {
    matchedId = 'mondulkiri-swiss-water-decaf';
  } else if (QUIZ_STATE.roastTolerance === 'dark_bold' || QUIZ_STATE.flavorPreference === 'smoky_spiced') {
    matchedId = 'sacred-temple-dark';
  } else if (QUIZ_STATE.flavorPreference === 'fruity_floral' || QUIZ_STATE.brewMethod === 'pourover') {
    matchedId = 'ratanakiri-red-earth';
  } else if (QUIZ_STATE.brewMethod === 'espresso') {
    matchedId = 'bayon-espresso-crema';
  } else if (QUIZ_STATE.flavorPreference === 'balanced_palm') {
    matchedId = 'siem-reap-sunrise';
  } else if (QUIZ_STATE.brewMethod === 'french_press') {
    matchedId = 'phnom-penh-coldbrew';
  }

  const product = getProductById(matchedId);

  container.innerHTML = `
    <div class="quiz-result-card animate-scale-up">
      <div class="quiz-result-banner">
        <i class="fa-solid fa-wand-magic-sparkles"></i> 100% Master Roaster Match For You
      </div>
      <div class="result-layout">
        <div class="result-img-wrap">
          <img src="${product.image}" alt="${product.name}">
          <span class="product-badge">${product.badge}</span>
        </div>
        <div class="result-content">
          <div class="result-meta">
            <span class="result-origin">${product.origin}</span>
            <div class="flames-sm">${renderRoastFlames(product.roastScore)} ${product.roastLevel} Roast</div>
          </div>
          <h3>${product.name}</h3>
          <p class="result-reason">
            Based on your preference for <strong>${formatQuizChoice(QUIZ_STATE.flavorPreference)}</strong> and <strong>${formatQuizChoice(QUIZ_STATE.brewMethod)}</strong>, our master roasters identified this micro-lot as your ultimate flavor soulmate.
          </p>
          <div class="tasting-notes-strip">
            ${product.tastingNotes.map(n => `<span class="note-pill">${n}</span>`).join('')}
          </div>
          <div class="result-price-bar">
            <span class="price-val">${cartService.formatPrice(product.basePrice)} <small>/ 250g</small></span>
            <div class="result-cta-group">
              <button class="btn btn-primary" onclick="cartService.addItem(getProductById('${product.id}'), '250g', 'Whole Bean', 1, true)">
                <i class="fa-solid fa-bag-shopping"></i> Add Matched Roast to Bag
              </button>
              <button class="btn btn-outline" onclick="restartQuiz(1)">
                <i class="fa-solid fa-rotate-left"></i> Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatQuizChoice(val) {
  if (!val) return 'custom brewing';
  return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function restartQuiz(step = 1) {
  QUIZ_STATE.step = step;
  renderQuizStep();
}

// Newsletter submit handler
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('input[type="email"]');
  if (emailInput && emailInput.value) {
    cartService.showToast('Welcome to Angkor Club!', `10% off code 'ANGKOR10' applied! Check your inbox: ${emailInput.value}`, 'fa-solid fa-envelope-open-text');
    cartService.applyCouponCode('ANGKOR10');
    emailInput.value = '';
  }
}

// Wholesale inquiry handler
function handleWholesaleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="contactName"]')?.value || 'Partner';
  cartService.showToast('Wholesale Inquiry Received', `Thank you ${name}! Our Master Roaster will reach out within 24 hours with sample beans.`, 'fa-solid fa-handshake');
  form.reset();
  const modal = document.getElementById('wholesaleModal');
  if (modal) modal.classList.remove('active');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('nav-open');
      mobileToggle.classList.toggle('active');
    });
  }

  // Sticky header class
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    });
  }

  // Render Homepage Featured Grid if container exists
  const featuredGrid = document.getElementById('featuredRoastsGrid');
  if (featuredGrid) {
    const featured = getFeaturedProducts();
    featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');
  }

  // Render Full Catalog Grid if container exists
  const catalogGrid = document.getElementById('catalogProductsGrid');
  if (catalogGrid) {
    catalogGrid.innerHTML = ANGKOR_PRODUCTS.map(p => renderProductCard(p)).join('');
  }

  // Setup Quiz if container exists
  if (document.getElementById('quizStepContainer')) {
    renderQuizStep();
  }

  // Setup Newsletter form listeners
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', handleNewsletterSubmit);
  });

  // Currency changed listener: update all visible prices on cards
  window.addEventListener('angkor_currency_changed', () => {
    ANGKOR_PRODUCTS.forEach(product => {
      updateCardPrice(product.id);
    });
    // Also re-render featured & catalog grids if present
    if (featuredGrid) {
      const activeFilter = document.querySelector('.roast-filter-tab.active')?.dataset.filter || 'all';
      filterHomepageRoasts(activeFilter);
    }
    if (catalogGrid && typeof filterCatalogProducts === 'function') {
      filterCatalogProducts();
    }
  });
});

// Category filtering for homepage tabs
function filterHomepageRoasts(filter) {
  document.querySelectorAll('.roast-filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });

  const featuredGrid = document.getElementById('featuredRoastsGrid');
  if (!featuredGrid) return;

  let filtered = ANGKOR_PRODUCTS;
  if (filter === 'single-origin') {
    filtered = ANGKOR_PRODUCTS.filter(p => p.category === 'single-origin' || p.category === 'micro-lot');
  } else if (filter === 'signature') {
    filtered = ANGKOR_PRODUCTS.filter(p => p.category === 'signature');
  } else if (filter === 'espresso') {
    filtered = ANGKOR_PRODUCTS.filter(p => p.category === 'espresso');
  } else if (filter === 'dark') {
    filtered = ANGKOR_PRODUCTS.filter(p => p.roastLevel === 'Dark' || p.roastLevel === 'Medium-Dark');
  }

  featuredGrid.innerHTML = filtered.map(p => renderProductCard(p)).join('');
}
