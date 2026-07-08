/* ─────────────────────────────────────────────
   Rishi Shah — Portfolio Script
   Animations inspired by juanmora.co
   Stack: Lenis smooth scroll + GSAP ScrollTrigger
───────────────────────────────────────────── */

/* ── Loader ── */
const loader = document.querySelector('.loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 1150));

/* ── Year ── */
document.querySelector('#year').textContent = new Date().getFullYear();

/* ── Juan Mora style nav pill + hover indicator ── */
const siteHeader = document.querySelector('.nav');
const originalNav = siteHeader ? siteHeader.querySelector('nav') : null;

if (siteHeader && originalNav) {
  originalNav.classList.add('jm-pill');
  originalNav.setAttribute('data-nav-pill', '');
  originalNav.innerHTML = `
    <span class="jm-indicator" aria-hidden="true"></span>
    <a href="about.html" data-section-link="about">About</a>
    <a class="jm-home" href="#top" aria-label="Back to top"><img src="assets/rs-logo.svg" alt=""></a>
    <a href="work.html" data-section-link="work">Work</a>
  `;

  if (!siteHeader.querySelector('.jm-social')) {
    siteHeader.insertAdjacentHTML('beforeend', `
      <div class="jm-social">
        <a href="#contact">Connect</a>
        <a href="https://www.linkedin.com/in/rishi-shah-89b1b3341/" target="_blank" rel="noreferrer">in</a>
        <a href="https://github.com/Rshah916" target="_blank" rel="noreferrer">Gh</a>
        <a href="https://www.behance.net/rishishah11" target="_blank" rel="noreferrer">Be</a>
      </div>
    `);
  }

  const pill = originalNav;
  const indicator = pill.querySelector('.jm-indicator');
  const pillLinks = Array.from(pill.querySelectorAll('a'));

  const moveIndicator = (target) => {
    if (!target || !indicator) return;
    const pillRect = pill.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    indicator.style.width = `${targetRect.width}px`;
    indicator.style.transform = `translateX(${targetRect.left - pillRect.left}px)`;
    indicator.style.opacity = '1';
  };

  const sectionForScroll = () => {
    const aboutTop = document.querySelector('#about')?.getBoundingClientRect().top ?? Infinity;
    const workTop = document.querySelector('#work')?.getBoundingClientRect().top ?? Infinity;
    if (aboutTop < window.innerHeight * 0.45) return pill.querySelector('[data-section-link="about"]');
    if (workTop < window.innerHeight * 0.55) return pill.querySelector('[data-section-link="work"]');
    const homeLink = pill.querySelector('.jm-home');
    return homeLink && homeLink.offsetParent !== null ? homeLink : pill.querySelector('[data-section-link="about"]');
  };

  const settleIndicator = () => moveIndicator(sectionForScroll());

  pillLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
    link.addEventListener('focus', () => moveIndicator(link));
  });
  pill.addEventListener('mouseleave', settleIndicator);
  window.addEventListener('scroll', settleIndicator, { passive: true });
  window.addEventListener('resize', settleIndicator);
  window.addEventListener('load', settleIndicator);
  requestAnimationFrame(settleIndicator);
}

/* Contact form handling lives in js/emailjs-contact.js */

/* ────────────────────────────────────────────
   GSAP + ScrollTrigger registration
──────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────
   Lenis smooth scroll
   Integrate with GSAP ticker so ScrollTrigger
   reads the Lenis scroll position correctly.
──────────────────────────────────────────── */
let lenis;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });

  // Bridge Lenis → ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ────────────────────────────────────────────
   Magnetic buttons
──────────────────────────────────────────── */
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = 'translate(0,0)');
  });
}

/* ────────────────────────────────────────────
   Generic scroll reveals (IntersectionObserver)
──────────────────────────────────────────── */
const caseCards = document.querySelectorAll('.case-card');
const cardObserver = new IntersectionObserver((entries) =>
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); cardObserver.unobserve(entry.target); }
  }), { threshold: 0.18 });
caseCards.forEach(card => cardObserver.observe(card));
const revealTargets = document.querySelectorAll('.landing-intro,.case-study-intro,.heading,.about-copy,.contact');
const revealObserver = new IntersectionObserver(entries =>
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.16 });
revealTargets.forEach(el => { el.classList.add('scroll-reveal'); revealObserver.observe(el); });

/* ── Work-gateway section reveal ── */
const workGateway = document.querySelector('.work-gateway');
if (workGateway) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  }, { threshold: 0.15 }).observe(workGateway);
}

/* ────────────────────────────────────────────
   GitHub repos
──────────────────────────────────────────── */
const repos = document.querySelector('#repos');
fetch('https://api.github.com/users/Rshah916/repos?sort=updated&per_page=6')
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(items => {
    if (!items.length) throw 0;
    repos.innerHTML = items.map((x, i) =>
      `<a class="repo" href="${x.homepage || x.html_url}" target="_blank" rel="noreferrer"><small>0${i + 1}</small><span><h3>${x.name.replaceAll('-', ' ')}</h3><p>${x.description || 'View project on GitHub'}</p></span><b>↗</b></a>`
    ).join('');
  })
  .catch(() => repos.innerHTML = '<a class="repo" href="https://github.com/Rshah916" target="_blank" rel="noreferrer"><small>01</small><span><h3>View GitHub projects</h3><p>Explore the latest work and code.</p></span><b>↗</b></a>');

/* ────────────────────────────────────────────
   JUAN MORA STYLE — 3D Scroll Stand Animation
   Cards start tilted on a 3D "floor" and
   rotate upright as the user scrolls into view.
──────────────────────────────────────────── */

// Only run on desktop — mobile uses swipe layout
if (!matchMedia('(max-width: 700px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {

  /* ── 1. Vanilla word splitter (no premium plugin needed) ── */
  function splitWords(el) {
    if (!el) return [];
    const raw = el.innerHTML;
    // preserve <br> tags, split everything else by whitespace
    const parts = raw.split(/(<br\s*\/?>)/gi);
    el.innerHTML = parts.map(part => {
      if (/^<br/i.test(part)) return part;
      return part.trim()
        ? part.trim().split(/\s+/)
          .map(w => `<span class="split-word">${w}</span>`)
          .join(' ')
        : part;
    }).join('');
    return Array.from(el.querySelectorAll('.split-word'));
  }

  /* ── 2. Starting 3D angles — outer cards tilt most, centre is flat ── */
  const cardStarts = [
    { rotateX: 58, rotateY: 18, y: 48 },
    { rotateX: 74, rotateY: 5, y: 32 },
    { rotateX: 90, rotateY: 0, y: 18 },
    { rotateX: 74, rotateY: -5, y: 32 },
    { rotateX: 58, rotateY: -18, y: 48 },
  ];

  /* ── 3. Set initial 3D state immediately (before scroll) ── */
  const landingSection = document.querySelector('.landing-pages');
  const cards = landingSection ? Array.from(landingSection.querySelectorAll('.landing-card')) : [];

  cards.forEach((card, i) => {
    const s = cardStarts[i] || cardStarts[2]; // fallback to flat if more than 5 cards
    gsap.set(card, {
      rotateX: s.rotateX,
      rotateY: s.rotateY,
      y: s.y,
      transformOrigin: '50% 100%',
      transformPerspective: 1560,
    });
  });

  /* ── 4. Split the heading words and set initial colour ── */
  const headingEl = landingSection ? landingSection.querySelector('.js-split-heading') : null;
  const words = splitWords(headingEl);
  gsap.set(words, { color: 'var(--rose)' });

  /* ── 5. GSAP timeline scrubbed to scroll ── */
  if (landingSection && cards.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: landingSection,
        start: 'top 55%',   // animation starts when section top hits 55% of viewport
        end: 'top 5%',    // animation completes when section top hits 5% of viewport
        scrub: 1.2,          // smooth tie to scroll position
      }
    });

    // Cards rotate upright
    tl.to(cards, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      ease: 'power2.inOut',
      duration: 1,
      stagger: 0.05,
    }, 0);

    // Words colour-shift from accent → ink, staggered
    if (words.length) {
      tl.to(words, {
        color: 'var(--ink)',
        ease: 'none',
        stagger: 0.15,
        duration: 0.6,
      }, 0.1);
    }
  }

  /* ── 6. Subtle parallax on the intro heading ── */
  if (headingEl) {
    gsap.to(headingEl, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: landingSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  const studySection = document.querySelector('.ux-case-studies');
  const studyCards = studySection ? Array.from(studySection.querySelectorAll('.study-card')) : [];
  const studyHeading = studySection ? studySection.querySelector('.js-split-heading') : null;
  const studyWords = splitWords(studyHeading);

  if (studySection && studyCards.length) {
    // Trigger off the CARD RAIL, not the section header —
    // this ensures the animation fires exactly when the cards enter view.
    const studyRail = studySection.querySelector('.case-study-rail') || studySection;

    // Cards start hidden below, tilted back
    gsap.set(studyCards, {
      y: 120,
      rotateX: 28,
      opacity: 0,
      transformOrigin: '50% 100%',
      transformPerspective: 1400,
    });

    gsap.set(studyWords, { color: 'var(--muted)' });

    // Scrub the animation as the card rail scrolls from the viewport bottom to 30% from top.
    // This means the full animation plays while the cards are actually on screen.
    const studyTl = gsap.timeline({
      scrollTrigger: {
        trigger: studyRail,
        start: 'top bottom',   // fires the moment the card rail enters the viewport
        end: 'top 30%',        // completes when the rail is 30% from top (cards well in view)
        scrub: 2,              // smooth lag tied to scroll speed
      }
    });

    // Phase 1: cards rise + rotate upright + fade in, staggered left-to-right
    studyTl.to(studyCards, {
      y: 0,
      rotateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
      stagger: 0.1,
    }, 0);

    // Phase 2: heading words colour-shift from muted → full ink
    if (studyWords.length) {
      studyTl.to(studyWords, {
        color: 'var(--ink)',
        ease: 'none',
        stagger: 0.14,
        duration: 0.7,
      }, 0.05);
    }
  }
}
