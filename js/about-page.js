document.querySelector('#year').textContent = new Date().getFullYear();

const navPill = document.querySelector('.jm-pill');
const indicator = navPill?.querySelector('.jm-indicator');
const navLinks = [...(navPill?.querySelectorAll('a') || [])];
const currentLink = navPill?.querySelector('.is-current');

function moveIndicator(target) {
  if (!target || !indicator || !navPill) return;
  const pillRect = navPill.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  indicator.style.width = `${targetRect.width}px`;
  indicator.style.transform = `translateX(${targetRect.left - pillRect.left}px)`;
}

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => moveIndicator(link));
  link.addEventListener('focus', () => moveIndicator(link));
});
navPill?.addEventListener('mouseleave', () => moveIndicator(currentLink));
window.addEventListener('load', () => moveIndicator(currentLink));
window.addEventListener('resize', () => moveIndicator(currentLink));
requestAnimationFrame(() => moveIndicator(currentLink));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

/* Contact form handling lives in js/emailjs-contact.js */
