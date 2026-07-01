// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// FAQ accordion
document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const panel = trigger.nextElementSibling;
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.accordion-trigger').forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
      t.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// Scroll reveal animations
const revealEls = document.querySelectorAll('[data-reveal]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add('in-view'));
} else if ('IntersectionObserver' in window) {
  // Toggle (not unobserve) so the reveal replays every time an element
  // crosses into or out of view, whether scrolling down or back up.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// Scroll-driven chrome: shrinking nav, back-to-top, spinning header flowers
const siteHeader = document.querySelector('.site-header');
const backToTop = document.getElementById('back-to-top');
const headerFlowers = Array.from(document.querySelectorAll('.header-flower')).map((el) => ({
  el,
  base: parseFloat(el.dataset.base) || 0,
  spin: parseFloat(el.dataset.spin) || 0,
}));

let lastScrollY = -1;
let scrollTicking = false;

function updateOnScroll() {
  const y = window.scrollY;

  if (siteHeader) siteHeader.classList.toggle('scrolled', y > 8);
  if (backToTop) backToTop.classList.toggle('visible', y > 700);

  headerFlowers.forEach(({ el, base, spin }) => {
    const scrollSpin = prefersReducedMotion ? 0 : y * spin;
    el.style.transform = `rotate(${base + scrollSpin}deg)`;
  });

  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (window.scrollY === lastScrollY) return;
  lastScrollY = window.scrollY;
  if (!scrollTicking) {
    requestAnimationFrame(updateOnScroll);
    scrollTicking = true;
  }
}, { passive: true });

updateOnScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// Cart: a single-product demo cart persisted in localStorage, since
// there's no backend. Shared across pages via the nav cart badge.
const CART_KEY = 'kleanCartQty';
const CART_PRICE = 14.99;

function getCartQty() {
  return parseInt(localStorage.getItem(CART_KEY), 10) || 0;
}

function setCartQty(qty) {
  const clamped = Math.max(0, qty);
  localStorage.setItem(CART_KEY, String(clamped));
  updateCartBadge();
  return clamped;
}

function updateCartBadge() {
  const qty = getCartQty();
  document.querySelectorAll('.cart-badge').forEach((badge) => {
    badge.textContent = String(qty);
    badge.hidden = qty === 0;
  });
}

updateCartBadge();

const addToCartBtn = document.getElementById('add-to-cart-btn');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    setCartQty(getCartQty() + 1);
  });
}

// Cart page only
const cartItemEl = document.getElementById('cart-item');
if (cartItemEl) {
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartSummaryEl = document.getElementById('cart-summary');
  const qtyValueEl = document.getElementById('qty-value');
  const lineTotalEl = document.getElementById('line-total');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const decreaseBtn = document.getElementById('qty-decrease');
  const increaseBtn = document.getElementById('qty-increase');
  const removeBtn = document.getElementById('remove-item');
  const preorderCta = document.getElementById('preorder-cta');
  const preorderBtn = document.getElementById('preorder-btn');
  const preorderForm = document.getElementById('preorder-form');
  const preorderEmailInput = document.getElementById('preorder-email');
  const preorderQtyField = document.getElementById('preorder-qty-field');
  const preorderTotalField = document.getElementById('preorder-total-field');
  const preorderSubmitBtn = document.getElementById('preorder-submit-btn');
  const preorderError = document.getElementById('preorder-error');
  const preorderSuccess = document.getElementById('preorder-success');
  const preorderEmailDisplay = document.getElementById('preorder-email-display');
  const PREORDER_ENDPOINT = 'https://formsubmit.co/mykleanhair@gmail.com';

  function resetPreorderFlow() {
    if (preorderCta) preorderCta.hidden = false;
    if (preorderForm) preorderForm.hidden = true;
    if (preorderSuccess) preorderSuccess.hidden = true;
  }

  function formatPrice(n) {
    return `$${n.toFixed(2)}`;
  }

  function renderCart() {
    const qty = getCartQty();
    const hasItem = qty > 0;

    cartItemEl.hidden = !hasItem;
    cartSummaryEl.hidden = !hasItem;
    cartEmptyEl.hidden = hasItem;

    if (hasItem) {
      const lineTotal = qty * CART_PRICE;
      qtyValueEl.textContent = String(qty);
      lineTotalEl.textContent = formatPrice(lineTotal);
      subtotalEl.textContent = formatPrice(lineTotal);
      totalEl.textContent = formatPrice(lineTotal);
      decreaseBtn.disabled = qty <= 1;
      if (preorderQtyField) preorderQtyField.value = String(qty);
      if (preorderTotalField) preorderTotalField.value = formatPrice(lineTotal);
    }
  }

  // First-time visitors land with an empty cart instead of a default 1,
  // so the empty state is reachable without manually clearing storage.
  if (localStorage.getItem(CART_KEY) === null) {
    setCartQty(0);
  }

  renderCart();

  decreaseBtn.addEventListener('click', () => {
    setCartQty(getCartQty() - 1);
    renderCart();
  });
  increaseBtn.addEventListener('click', () => {
    setCartQty(getCartQty() + 1);
    renderCart();
  });
  removeBtn.addEventListener('click', () => {
    setCartQty(0);
    renderCart();
    resetPreorderFlow();
  });

  if (preorderBtn && preorderForm) {
    preorderBtn.addEventListener('click', () => {
      preorderCta.hidden = true;
      preorderForm.hidden = false;
      document.getElementById('preorder-name').focus();
    });
  }

  if (preorderForm) {
    preorderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!preorderForm.checkValidity()) {
        preorderForm.reportValidity();
        return;
      }

      if (preorderError) preorderError.hidden = true;
      preorderSubmitBtn.disabled = true;
      preorderSubmitBtn.textContent = 'Sending…';

      try {
        const response = await fetch(PREORDER_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(preorderForm),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success !== 'true') throw new Error('Request failed');

        preorderEmailDisplay.textContent = preorderEmailInput.value;
        preorderForm.hidden = true;
        preorderSuccess.hidden = false;
      } catch (err) {
        if (preorderError) preorderError.hidden = false;
      } finally {
        preorderSubmitBtn.disabled = false;
        preorderSubmitBtn.textContent = 'Confirm Preorder';
      }
    });
  }
}
