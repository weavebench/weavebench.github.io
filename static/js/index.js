// WeaveBench site interactions: scrolled navbar, IntersectionObserver reveal,
// copy-bibtex button. No frameworks; vanilla.

(function () {
  'use strict';

  // ---- Sticky navbar shadow on scroll ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- IntersectionObserver: reveal on scroll ----
  const revealTargets = document.querySelectorAll(
    'section.section, .teaser-showcase, .hero-ledger, .figure-frame, ' +
    '.method-card, .domain-card, .num-card, .ablation-card, .bibtex-wrap, .authors, ' +
    '.judge-ablation, .failure-family, .fingerprint, .toolmix-figure, .headline-comparison'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    // Fallback: just show everything
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  // ---- Copy BibTeX button ----
  const copyBtn = document.getElementById('bib-copy');
  const bibEl = document.getElementById('bibtex');
  if (copyBtn && bibEl) {
    copyBtn.addEventListener('click', async () => {
      const text = bibEl.innerText.trim();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 1800);
      } catch (err) {
        copyBtn.textContent = 'Press Ctrl+C';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
      }
    });
  }

  // ---- Smooth-scroll offset for fixed topbar (handled by CSS scroll-behavior; we just compensate for the navbar height when clicking) ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const top = rect.top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
 * Demo video carousel — one video at a time, paginated
 * ============================================================ */
(function () {
  'use strict';
  const root = document.getElementById('demo-carousel');
  if (!root) return;

  let items;
  try { items = JSON.parse(root.dataset.videos); } catch (e) { return; }
  if (!items || !items.length) return;
  const ver = root.dataset.ver ? ('?v=' + root.dataset.ver) : '';

  const video = document.getElementById('dc-video');
  const tag   = document.getElementById('dc-tag');
  const title = document.getElementById('dc-title');
  const count = document.getElementById('dc-count');
  const dotsWrap = document.getElementById('dc-dots');
  const prev = root.querySelector('.dc-prev');
  const next = root.querySelector('.dc-next');

  let idx = 0;

  // build dots
  items.forEach((it, i) => {
    const d = document.createElement('button');
    d.className = 'dc-dot';
    d.type = 'button';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', it.title);
    d.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function render(autoplay) {
    const it = items[idx];
    root.style.setProperty('--dc-accent', it.accent || '#0ea5e9');
    tag.textContent = it.domain || '';
    title.textContent = it.title || '';
    count.textContent = (idx + 1) + ' / ' + items.length;
    video.pause();
    video.poster = it.src + '.jpg' + ver;
    video.src = it.src + '.mp4' + ver;
    video.load();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (autoplay) { video.play().catch(() => {}); }
  }

  function go(n, autoplay) {
    idx = (n + items.length) % items.length;
    render(autoplay);
  }

  prev.addEventListener('click', () => go(idx - 1, true));
  next.addEventListener('click', () => go(idx + 1, true));

  // keyboard arrows when the carousel is in view / focused
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(idx - 1, true); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, true); }
  });

  render(false);
})();
