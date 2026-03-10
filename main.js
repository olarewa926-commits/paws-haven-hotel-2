/* ============================================================
   Paws Haven Hotel — main.js  (Enhanced Edition)
   ============================================================ */

/* ── 1. NAV: scroll shadow + mobile hamburger ── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', scrollY > 40);
});

// Mobile menu toggle
function initMobileMenu() {
  if (!nav) return;
  const ul = nav.querySelector('ul');
  if (!ul) return;

  // Create hamburger button if not exists
  if (!document.getElementById('hamburger')) {
    const btn = document.createElement('button');
    btn.id = 'hamburger';
    btn.setAttribute('aria-label', 'فتح القائمة');
    btn.innerHTML = `<span></span><span></span><span></span>`;
    btn.addEventListener('click', () => {
      ul.classList.toggle('nav-open');
      btn.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    nav.appendChild(btn);
  }

  // Close menu on link click
  ul.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ul.classList.remove('nav-open');
      const btn = document.getElementById('hamburger');
      if (btn) btn.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      ul.classList.remove('nav-open');
      const btn = document.getElementById('hamburger');
      if (btn) btn.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });
}

/* ── 2. REVEAL on scroll (IntersectionObserver) ── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('up'), i * 65);
        io.unobserve(e.target); // fire once only
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(r => io.observe(r));
}

/* ── 3. LIGHTBOX ── */
let lbImages = [];
let lbIndex  = 0;

function initLightbox() {
  const lb = document.getElementById('lb');
  if (!lb) return;

  // Close on overlay click
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLb();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowRight') lbPrev();
    if (e.key === 'ArrowLeft')  lbNext();
  });

  // Collect all gallery images for prev/next
  lbImages = Array.from(document.querySelectorAll('.gi img'));
}

function openLb(srcOrEl, alt) {
  const lb  = document.getElementById('lb');
  const lbi = document.getElementById('lbi');
  const lbCaption = document.getElementById('lb-caption');
  if (!lb || !lbi) return;

  let src = typeof srcOrEl === 'string' ? srcOrEl : srcOrEl.src;
  lbIndex = lbImages.findIndex(img => img.src === src || img.getAttribute('src') === srcOrEl);

  lbi.src = src;
  lbi.alt = alt || '';
  if (lbCaption) lbCaption.textContent = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLb() {
  const lb = document.getElementById('lb');
  if (lb) {
    lb.classList.remove('open');
    const lbi = document.getElementById('lbi');
    if (lbi) lbi.src = '';
  }
  document.body.style.overflow = '';
}

function lbNext() {
  if (!lbImages.length) return;
  lbIndex = (lbIndex + 1) % lbImages.length;
  _lbGoTo(lbIndex);
}

function lbPrev() {
  if (!lbImages.length) return;
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  _lbGoTo(lbIndex);
}

function _lbGoTo(i) {
  const lbi = document.getElementById('lbi');
  const lbCaption = document.getElementById('lb-caption');
  if (!lbi || !lbImages[i]) return;
  lbi.style.opacity = '0';
  setTimeout(() => {
    lbi.src = lbImages[i].src;
    lbi.alt = lbImages[i].alt || '';
    if (lbCaption) lbCaption.textContent = lbImages[i].alt || '';
    lbi.style.opacity = '1';
  }, 180);
}

/* ── 4. TOAST ── */
function showToast(msg, duration = 4000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ── 5. SMOOTH COUNTER animation (for stats) ── */
function animateCounter(el, target, duration = 1400) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = (el.dataset.prefix || '') +
      Math.round(start).toLocaleString('ar-EG') +
      (el.dataset.suffix || '');
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.count));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

/* ── 6. FORM VALIDATION ── */
function validateForm(formEl) {
  let valid = true;
  formEl.querySelectorAll('[required]').forEach(field => {
    field.classList.remove('field-error');
    if (!field.value.trim()) {
      field.classList.add('field-error');
      valid = false;
    }
  });
  // Email check
  formEl.querySelectorAll('input[type=email]').forEach(field => {
    if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      field.classList.add('field-error');
      valid = false;
    }
  });
  return valid;
}

/* ── 7. BOOKING form submit ── */
function submitBooking(e) {
  if (e) e.preventDefault();
  const form = document.getElementById('booking-form') || document.querySelector('.booking-form');
  if (form && !validateForm(form)) {
    showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة');
    return false;
  }
  showToast('✅ تم استلام طلب الحجز! سنتواصل معك خلال 24 ساعة 🐾');
  return false;
}

/* ── 8. CONTACT form submit ── */
function submitContact(e) {
  if (e) e.preventDefault();
  const form = document.getElementById('contact-form') || document.querySelector('.contact-form');
  if (form && !validateForm(form)) {
    showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة');
    return false;
  }
  showToast('✅ تم إرسال رسالتك! سنرد عليك خلال 24 ساعة 🐾');
  return false;
}

/* ── 9. BACK TO TOP button ── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'العودة للأعلى');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── 10. LAZY LOAD images ── */
function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.loading = 'lazy';
    });
    return;
  }
  // Fallback for older browsers
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
}

/* ── 11. SOUND helpers (used on inner pages) ── */
function playTick() {
  try {
    const a = document.getElementById('tickAudio') || new Audio('../Sounds/tick.wav');
    a.currentTime = 0; a.volume = 0.35; a.play().catch(() => {});
  } catch (err) {}
}

function playSuccess() {
  try {
    const a = document.getElementById('successAudio') || new Audio('../Sounds/success.wav');
    a.currentTime = 0; a.volume = 0.6; a.play().catch(() => {});
  } catch (err) {}
}

/* ── 12. ACTIVE NAV link highlighter ── */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === path) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initReveal();
  initLightbox();
  initCounters();
  initBackToTop();
  initLazyLoad();
  initActiveNav();
});


/* ── SPA ENGINE ── */
const PAGES = ['home','facilities','services','gallery','packages','about','contact','booking','sitemap'];

function goPage(id) {
  // hide all
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });
  // show target
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(initReveal, 80);
  }
  // update nav active
  document.querySelectorAll('#nav-ul a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
    if (id === 'booking') {
      const bk = document.querySelector('.nav-book');
      if (bk) bk.classList.add('active');
    }
  });
  // close mobile menu
  const ul = document.getElementById('nav-ul');
  const hb = document.getElementById('hamburger');
  if (ul) ul.classList.remove('nav-open');
  if (hb) hb.classList.remove('open');
  document.body.classList.remove('menu-open');
}

// override initActiveNav so it doesn't break SPA
function initActiveNav() {}

document.addEventListener('DOMContentLoaded', () => {
  goPage('home');
});