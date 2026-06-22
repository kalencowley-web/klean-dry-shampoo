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
