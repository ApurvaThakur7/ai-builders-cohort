document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  if (open) {
    navLinks.style.cssText = 'display:flex;flex-direction:column;gap:16px;position:absolute;top:100%;left:0;right:0;background:#0c0c0a;padding:22px 28px;border-bottom:1px solid rgba(244,239,226,.14);z-index:600;';
  } else {
    navLinks.removeAttribute('style');
  }
});
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navLinks.removeAttribute('style');
  }
});

/* Reveal on scroll + stat count-up
   Uses getBoundingClientRect polled on scroll/resize (rAF-throttled) rather than
   IntersectionObserver — some embedded/sandboxed viewports never fire IO callbacks
   even for elements plainly on screen, which would leave most of the page stuck at
   opacity:0. This approach reads real screen geometry, so it can't silently fail. */
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const statEls = Array.from(document.querySelectorAll('.stat-num'));
const revealDone = new WeakSet();
const statDone = new WeakSet();

function elementIsVisible(el, thresholdPx) {
  const r = el.getBoundingClientRect();
  if (r.height === 0 && r.width === 0) return false;
  return r.top < (window.innerHeight - thresholdPx) && r.bottom > 0;
}

function runCountUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1100;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function checkVisibility() {
  revealEls.forEach(el => {
    if (!revealDone.has(el) && elementIsVisible(el, 60)) {
      el.classList.add('in');
      revealDone.add(el);
    }
  });
  statEls.forEach(el => {
    if (!statDone.has(el) && elementIsVisible(el, 100)) {
      runCountUp(el);
      statDone.add(el);
    }
  });
}

/* Called directly on every scroll/resize — checking ~48 elements' getBoundingClientRect
   is well under a millisecond, so there's no real cost to skip a throttle here, and
   skipping one removes any chance of a fast scroll jumping an element fully through
   the viewport between checks. */
window.addEventListener('scroll', checkVisibility, { passive: true });
window.addEventListener('resize', checkVisibility);
window.addEventListener('scrollend', checkVisibility);
document.addEventListener('visibilitychange', checkVisibility);
window.addEventListener('pageshow', checkVisibility);
checkVisibility();
/* Safety net: re-check on a staggered schedule after load settles, covering
   fonts/images finishing layout, or a tab that was backgrounded (0-size) during
   the checks above and only becomes properly laid out a moment later. */
window.addEventListener('load', () => setTimeout(checkVisibility, 300));
[300, 800, 1500, 3000].forEach(ms => setTimeout(checkVisibility, ms));

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* Sticky CTA bar — show after hero is scrolled past */
const stickyCta = document.getElementById('stickyCta');
const hero = document.querySelector('.hero');
function updateStickyCta() {
  const heroBottom = hero.getBoundingClientRect().bottom;
  stickyCta.classList.toggle('show', heroBottom < 0);
}
window.addEventListener('scroll', updateStickyCta, { passive: true });
window.addEventListener('resize', updateStickyCta);
updateStickyCta();

/* Nav background solidify on scroll + scroll progress bar */
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 10px 30px -20px rgba(0,0,0,.6)' : 'none';
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollProgress.style.width = pct + '%';
}, { passive: true });

/* ===== Custom cursor (desktop / fine pointer only) ===== */
if (window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-cursor');
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function raf() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a, button, .tilt, .week-card, .included-card, .outcome-card, .ticket').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });

  /* Magnetic buttons */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${relX * 0.22}px, ${relY * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* Tilt cards */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ===== Build-log horizontal filmstrip ===== */
const track = document.getElementById('buildlogTrack');
const rail = document.getElementById('buildlogRail');
const counter = document.getElementById('buildlogCounter');
const prevBtn = document.getElementById('buildlogPrev');
const nextBtn = document.getElementById('buildlogNext');
const cards = track.querySelectorAll('.week-card');
const total = cards.length;

rail.innerHTML = Array.from({ length: total }, () => '<div class="rail-dot"><i></i></div>').join('');
const railDots = rail.querySelectorAll('.rail-dot');

function setActive(index) {
  index = Math.max(0, Math.min(total - 1, index));
  railDots.forEach((dot, i) => {
    dot.classList.toggle('done', i < index);
    dot.classList.toggle('active', i === index);
  });
  counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
}

function cardStep() {
  const card = cards[0];
  const style = getComputedStyle(track);
  const gap = parseFloat(style.columnGap || style.gap || 24);
  return card.getBoundingClientRect().width + gap;
}

prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
nextBtn.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));

/* Wheel → horizontal scroll when hovering the track (desktop convenience) */
track.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  }
}, { passive: false });

/* Drag to scroll */
let isDown = false, startX = 0, startScroll = 0;
track.addEventListener('pointerdown', (e) => {
  isDown = true; startX = e.clientX; startScroll = track.scrollLeft;
  track.setPointerCapture(e.pointerId);
});
track.addEventListener('pointermove', (e) => {
  if (!isDown) return;
  track.scrollLeft = startScroll - (e.clientX - startX);
});
track.addEventListener('pointerup', () => { isDown = false; });
track.addEventListener('pointercancel', () => { isDown = false; });

/* Track active card via scroll position */
let ticking = false;
track.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const trackRect = track.getBoundingClientRect();
    let closest = 0, closestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const dist = Math.abs((r.left - trackRect.left));
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    setActive(closest);
    ticking = false;
  });
}, { passive: true });

setActive(0);
