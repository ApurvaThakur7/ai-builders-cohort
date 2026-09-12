document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  if (open) {
    navLinks.style.cssText = 'display:flex;flex-direction:column;gap:16px;position:absolute;top:100%;left:0;right:0;background:#0a0b12;padding:22px 28px;border-bottom:1px solid #262b3d;z-index:600;';
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

/* Reveal on scroll */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* Stat count-up */
const statEls = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
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
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObserver.observe(el));

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
const ctaObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    stickyCta.classList.toggle('show', !entry.isIntersecting);
  });
}, { threshold: 0 });
ctaObserver.observe(hero);

/* Nav background solidify on scroll */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 10px 30px -20px rgba(0,0,0,.6)' : 'none';
}, { passive: true });
