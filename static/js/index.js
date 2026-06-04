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
