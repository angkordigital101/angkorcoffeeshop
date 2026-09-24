# Angkor Coffee Roasters (អាំងគ័រ កាហ្វេ)
### Full Artisan Coffee Roastery E-Commerce Web Application

**Angkor Coffee Roasters** is a premier e-commerce website showcasing Cambodian high-altitude specialty coffee roasted in Siem Reap and Phnom Penh. Built with clean, modern HTML5, handcrafted luxury CSS3, and vanilla JavaScript.

---

## 🌟 Key Features

### 1. E-Commerce & Shopping Cart Engine
- **Persistent Cart**: Saves shopping bag state in `localStorage` across all pages.
- **Dynamic Slide-out Cart Drawer**: Accessible from any page with live item count badges.
- **Grind & Weight Customization**: Choose between 250g, 500g, or 1kg bags, with specific grind profiles (Whole Bean, Espresso Fine, V60 Pour Over, Traditional Phin, French Press/Cold Brew).
- **Free Shipping Calculator**: Dynamic progress bar incentivizing orders over $35 for free express courier.
- **Dual Currency Switcher**: Live price conversion between **USD ($)** and **Cambodian Riel (៛ KHR)**.
- **Coupon & Promo Engine**:
  - `ANGKOR10`: 10% Welcome discount
  - `ROASTMASTER`: 15% Master Roaster Club discount
  - `FREESHIP`: Free express shipping

### 2. Multi-Step Checkout with Local Cambodian & International Payments
- **Contact & Delivery Forms**: Full validation for Siem Reap, Phnom Penh, Battambang, Sihanoukville, Kampot, Mondulkiri, and international countries.
- **ABA PAY / Bakong KHQR Simulation**: Interactive Cambodian national QR payment modal.
- **Credit/Debit Card & Cash on Delivery (COD)** payment options.
- **Order Confirmation & Printable Receipt**: Generates a unique batch order number (e.g. `#AK-2026-XXXX`), estimated roast date, and printable invoice.

### 3. Interactive Coffee Roast Finder Quiz
- A 3-step personalized quiz matching user extraction methods, flavor preferences, and roast intensity tolerances directly to the ideal micro-lot with 1-click addition to bag.

### 4. Rich Product Catalog & Deep Filtration (`shop.html`)
- Filter by Roast Level: Light, Light-Medium, Medium, Medium-Dark, Dark French Roast.
- Filter by Terroir/Region: Mondulkiri Highlands, Ratanakiri Red Earth, Cardamom Mountains.
- Filter by Process: Wild Honey, Fully Washed, 72hr Anaerobic Natural, Swiss Water Decaf.
- Real-time search keyword input and sorting (Price, Rating, Alphabetical).

### 5. Detailed Product Experience (`product-detail.html`)
- Interactive roast intensity flame scale (1–5).
- Sensory profile radar bars (Sweetness, Viscosity/Body, Acidity/Brightness).
- Cupping notes tags and farm elevation coordinates.
- Barista brew ratio tables and gold-cup extraction recipes.
- Customer review submission form.

### 6. Coffee Club Subscription (`#clubSection`)
- Configurable roast subscription builder (Weekly, Bi-weekly, Monthly) with 15% recurring savings.

---

## 📂 Project Architecture

```
Exercise 2/
├── index.html              # Flagship Homepage (Hero, collections, quiz, club, brew guides)
├── shop.html               # Comprehensive product catalog with facet filters and search
├── product-detail.html     # Deep product page with roast bars, grind selection, and cupping notes
├── cart.html               # Full shopping bag page with shipping estimator and gift notes
├── checkout.html           # Multi-step checkout with ABA PAY KHQR and order confirmation
├── story.html              # Our Story: Mondulkiri highlands, Bunong fair trade, roasting craft
├── contact.html            # Tasting rooms, cupping reservations, and wholesale inquiries
├── css/
│   └── style.css           # Master stylesheet with luxury coffee palette & responsive layout
├── js/
│   ├── products.js         # Single source of truth product catalog (8 specialty roasts)
│   ├── cart.js             # Cart state service, currency conversion, coupons, and drawer UI
│   └── main.js             # Interactive quiz, filters, modals, toasts, and card rendering
└── assets/
    └── images/             # Coffee assets and local visuals
```

---

## 🚀 How to Run Locally

You can run this website on any browser or local server:

1. **Directly open**: Double-click `Exercise 2/index.html` (or `index.html` at the project root) in Google Chrome, Microsoft Edge, Firefox, or Safari.
2. **Using a static server (recommended)**:
   ```bash
   npx serve "Exercise 2"
   ```
   or with Python:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your web browser.
