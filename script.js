/**
 * Portfolio — interactions & animations
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Loader ---------- */
  const loader = document.querySelector('.loader');

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
    document.querySelector('.header')?.classList.add('nav-enter');
  }

  window.addEventListener('load', () => {
    setTimeout(hideLoader, prefersReducedMotion ? 0 : 1200);
  });

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  if (cursor && !isTouch && !prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    /* Smooth follow with ~200ms feel */
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.35;
      cursorY += (mouseY - cursorY) * 0.35;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    /* Expand ring on links & buttons */
    const hoverSelector =
      'a, button, .btn, input, select, textarea, label[for], [role="button"], [data-cursor="hover"]';

    document.querySelectorAll(hoverSelector).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    /* Click pulse: 1.2x scale */
    document.addEventListener('mousedown', () => {
      cursor.classList.add('click');
    });

    document.addEventListener('mouseup', () => {
      cursor.classList.remove('click');
    });

    cursor.addEventListener('animationend', (e) => {
      if (e.animationName === 'cursorClick') {
        cursor.classList.remove('click');
      }
    });
  }

  /* ---------- Header scroll: shrink on down, expand on up ---------- */
  const header = document.querySelector('[data-header]');
  let lastScroll = window.scrollY;
  const SCROLL_THRESHOLD = 24;

  function onScroll() {
    if (!header) return;

    const y = window.scrollY;

    if (y <= SCROLL_THRESHOLD) {
      header.classList.remove('is-compact', 'is-scrolled');
    } else {
      header.classList.add('is-scrolled');
      if (y > lastScroll) {
        /* Scrolling down — shrink */
        header.classList.add('is-compact');
      } else if (y < lastScroll) {
        /* Scrolling up — expand height, keep readable bar */
        header.classList.remove('is-compact');
      }
    }

    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinksEl = document.getElementById('nav-links');

  function setMenuOpen(open) {
    navLinksEl?.classList.toggle('open', open);
    navToggle?.classList.toggle('open', open);
    navToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    /* Reset stagger animation when closing */
    if (!open && navLinksEl) {
      navLinksEl.querySelectorAll('li').forEach((li) => {
        li.style.animation = 'none';
        void li.offsetWidth;
        li.style.animation = '';
      });
    }
  }

  navToggle?.addEventListener('click', () => {
    setMenuOpen(!navLinksEl?.classList.contains('open'));
  });

  /* Close menu when clicking backdrop (outside drawer + toggle) */
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('menu-open')) return;
    const target = e.target;
    if (
      target instanceof Element &&
      !navLinksEl?.contains(target) &&
      !navToggle?.contains(target)
    ) {
      setMenuOpen(false);
    }
  });

  navLinksEl?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  /* ---------- Section title animations ---------- */
  const sectionHeaders = document.querySelectorAll('[data-section-header]');

  if (sectionHeaders.length && 'IntersectionObserver' in window) {
    const sectionHeaderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            sectionHeaderObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
    );

    sectionHeaders.forEach((header) => {
      if (prefersReducedMotion) {
        header.classList.add('in-view');
      } else {
        sectionHeaderObserver.observe(header);
      }
    });
  } else {
    sectionHeaders.forEach((header) => header.classList.add('in-view'));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }

    requestAnimationFrame(tick);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ---------- Service cards: stagger reveal + number counter ---------- */
  const servicesGrid = document.getElementById('services-grid');
  const serviceNums = document.querySelectorAll('[data-service-count]');

  function animateServiceNum(el) {
    const target = parseInt(el.getAttribute('data-service-count'), 10);
    const pad = parseInt(el.getAttribute('data-pad') || '2', 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(eased * target);
      el.textContent = String(value).padStart(pad, '0');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = String(target).padStart(pad, '0');
    }

    requestAnimationFrame(tick);
  }

  if (servicesGrid && 'IntersectionObserver' in window) {
    const servicesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          servicesGrid.classList.add('in-view');
          serviceNums.forEach((num) => {
            if (!num.classList.contains('counted')) {
              num.classList.add('counted');
              if (!prefersReducedMotion) animateServiceNum(num);
              else {
                const target = parseInt(num.getAttribute('data-service-count'), 10);
                const pad = parseInt(num.getAttribute('data-pad') || '2', 10);
                num.textContent = String(target).padStart(pad, '0');
              }
            }
          });
          servicesObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );

    servicesObserver.observe(servicesGrid);
  } else if (servicesGrid) {
    servicesGrid.classList.add('in-view');
    serviceNums.forEach((num) => {
      const target = parseInt(num.getAttribute('data-service-count'), 10);
      const pad = parseInt(num.getAttribute('data-pad') || '2', 10);
      num.textContent = String(target).padStart(pad, '0');
    });
  }

  /* ---------- CTA button interactions ---------- */
  function triggerCtaClick(btn) {
    if (prefersReducedMotion) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    btn.classList.remove('btn-shake');
    void btn.offsetWidth;
    btn.classList.add('btn-shake');
    setTimeout(() => btn.classList.remove('btn-shake'), 350);

    if (btn.classList.contains('btn-primary')) {
      setTimeout(() => {
        btn.classList.remove('btn-pulse-glow');
        void btn.offsetWidth;
        btn.classList.add('btn-pulse-glow');
        const onPulseEnd = () => {
          btn.classList.remove('btn-pulse-glow');
          btn.removeEventListener('animationend', onPulseEnd);
        };
        btn.addEventListener('animationend', onPulseEnd);
      }, 360);
    }
  }

  document.querySelectorAll('.btn-primary, .btn-ghost').forEach((btn) => {
    btn.classList.add('btn-ripple');
    btn.addEventListener('click', () => triggerCtaClick(btn));
  });

  /* ---------- Licenses & certifications (from LinkedIn) ---------- */
  const CERTIFICATIONS = [
    {
      issuer: 'Udemy',
      name: 'Graphic Design Masterclass Intermediate: The NEXT Level',
      issued: 'Issued May 2025',
      credentialId: 'UC-06335b07-863e-4574-909a-59d96db8e9b8',
      url: 'https://www.udemy.com/certificate/UC-06335b07-863e-4574-909a-59d96db8e9b8/',
      skills: 'Typography, Infographic',
    },
    {
      issuer: 'California Institute of the Arts',
      name: 'Graphic Design Specialization',
      issued: 'Issued Feb 2025',
      credentialId: 'NSAB24YYYSY3',
      url: 'https://www.coursera.org/verify/NSAB24YYYSY3',
    },
    {
      issuer: 'California Institute of the Arts',
      name: 'Ideas from the History of Graphic Design',
      issued: 'Issued Feb 2025',
      credentialId: '0BE5O84G323N',
      url: 'https://www.coursera.org/verify/0BE5O84G323N',
    },
    {
      issuer: 'Google',
      name: 'Foundations of User Experience (UX) Design',
      issued: 'Issued Aug 2024',
      credentialId: 'WFE8Y8N4DOWH',
      url: 'https://www.coursera.org/verify/WFE8Y8N4DOWH',
    },
    {
      issuer: 'California Institute of the Arts',
      name: 'Fundamentals of Graphic Design',
      issued: 'Issued Nov 2022',
      credentialId: 'PMBBTGUJNB48',
      url: 'https://www.coursera.org/verify/PMBBTGUJNB48',
      skills: 'Graphic Design, Typography',
    },
  ];

  const CERT_BADGE_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M8 4h8v3l2 13H6L8 7V4z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' +
    '<path d="M9 2h6v2H9z" stroke="currentColor" stroke-width="1.2"/>' +
    '<path d="M9 11h6M9 14h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
    '</svg>';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCertificationCard(cert, index) {
    const title = cert.url
      ? `<a href="${escapeHtml(cert.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cert.name)}</a>`
      : escapeHtml(cert.name);
    const dateParts = [cert.issued, cert.expires].filter(Boolean);
    const dateText = dateParts.length ? dateParts.join(' · ') : '';
    const credential = cert.credentialId
      ? `<span class="award-credential">Credential ID ${escapeHtml(cert.credentialId)}</span>`
      : '';
    const skills = cert.skills
      ? `<span class="award-skills">Skills: ${escapeHtml(cert.skills)}</span>`
      : '';

    return (
      `<li class="award-card cert-card" data-cert-item style="--award-index: ${index}">` +
      `<div class="award-badge" aria-hidden="true">${CERT_BADGE_SVG}</div>` +
      `<div class="award-body">` +
      `<p class="award-org">${escapeHtml(cert.issuer)}</p>` +
      `<h3 class="award-title">${title}</h3>` +
      (dateText ? `<time class="award-date">${escapeHtml(dateText)}</time>` : '') +
      credential +
      skills +
      `</div></li>`
    );
  }

  function initCertifications() {
    const list = document.getElementById('certifications-list');
    if (!list) return;

    const items =
      CERTIFICATIONS.length > 0
        ? CERTIFICATIONS.map(renderCertificationCard).join('')
        : `<li class="award-card cert-card cert-card--empty" data-cert-item style="--award-index: 0">
            <div class="award-badge" aria-hidden="true">${CERT_BADGE_SVG}</div>
            <div class="award-body">
              <p class="award-org">LinkedIn</p>
              <h3 class="award-title">
                <a href="https://www.linkedin.com/in/dagarneha5/" target="_blank" rel="noopener noreferrer">View licenses &amp; certifications</a>
              </h3>
              <time class="award-date">linkedin.com/in/dagarneha5</time>
            </div>
          </li>`;

    list.innerHTML = items;

    if ('IntersectionObserver' in window) {
      const certObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              list.classList.add('in-view');
              certObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      if (prefersReducedMotion) {
        list.classList.add('in-view');
      } else {
        certObserver.observe(list);
      }
    } else {
      list.classList.add('in-view');
    }
  }

  initCertifications();

  /* ---------- About profile: scroll reveal + mouse parallax ---------- */
  const aboutVisual = document.querySelector('[data-about-visual]');
  const aboutProfile = document.querySelector('[data-about-profile]');
  const aboutImage = document.querySelector('[data-about-image]');

  if (aboutVisual && 'IntersectionObserver' in window) {
    const aboutVisualObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            aboutVisual.classList.add('in-view');
            aboutVisualObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
    );

    if (prefersReducedMotion) {
      aboutVisual.classList.add('in-view');
    } else {
      aboutVisualObserver.observe(aboutVisual);
    }
  } else if (aboutVisual) {
    aboutVisual.classList.add('in-view');
  }

  if (aboutProfile && aboutImage && !isTouch && !prefersReducedMotion) {
    const parallaxStrength = 14;

    aboutProfile.addEventListener('mousemove', (e) => {
      const rect = aboutProfile.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      aboutImage.style.transform = `scale(1.04) translate(${x * parallaxStrength}px, ${y * parallaxStrength}px)`;
    });

    aboutProfile.addEventListener('mouseleave', () => {
      if (aboutVisual?.classList.contains('in-view')) {
        aboutImage.style.transform = 'scale(1) translate(0, 0)';
      }
    });
  }

  /* ---------- Stat box counter (Element.animate + 2.5s) ---------- */
  function animateStatBoxCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    const target = parseInt(el.getAttribute('data-stat-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2500;

    if (prefersReducedMotion) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const animation = el.animate(
      [{ opacity: 1 }, { opacity: 1 }],
      { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
    );

    const update = () => {
      const time = animation.currentTime ?? duration;
      const progress = Math.min(time / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = `${prefix}${Math.floor(eased * target)}${suffix}`;
      if (animation.playState === 'running' || animation.playState === 'pending') {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    animation.ready.then(() => requestAnimationFrame(update));
  }

  /* ---------- About stats boxes ---------- */
  const aboutStats = document.querySelector('[data-about-stats]');

  if (aboutStats && 'IntersectionObserver' in window) {
    const aboutStatsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          entry.target.querySelectorAll('[data-stat-count]').forEach(animateStatBoxCounter);
          aboutStatsObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    if (prefersReducedMotion) {
      aboutStats.classList.add('in-view');
      aboutStats.querySelectorAll('[data-stat-count]').forEach(animateStatBoxCounter);
    } else {
      aboutStatsObserver.observe(aboutStats);
    }
  } else if (aboutStats) {
    aboutStats.classList.add('in-view');
    aboutStats.querySelectorAll('[data-stat-count]').forEach(animateStatBoxCounter);
  }

  /* ---------- About bio text: staggered reveal ---------- */
  const aboutBio = document.querySelector('[data-about-bio]');

  if (aboutBio && 'IntersectionObserver' in window) {
    const aboutBioObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            aboutBioObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (prefersReducedMotion) {
      aboutBio.classList.add('in-view');
    } else {
      aboutBioObserver.observe(aboutBio);
    }
  } else if (aboutBio) {
    aboutBio.classList.add('in-view');
  }

  /* ---------- Hero blue panel: letters fall in sequence (P → O → R …) ---------- */
  function initFallingLetters() {
    const root = document.querySelector('[data-falling-letters]');
    const line = root?.querySelector('.falling-word-line');
    if (!root || !line) return;

    const words = ['Portfolio', 'Branding', 'Design', 'Creative', 'ProofHub'];
    const letterGap = 160;
    const holdMs = 2400;
    const exitMs = 500;
    let wordIndex = 0;
    let active = true;
    let loopRunning = false;

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function appendLetter(char) {
      const span = document.createElement('span');
      span.className = 'fall-letter' + (char === ' ' ? ' is-space' : '');
      span.textContent = char === ' ' ? '\u00a0' : char;
      line.appendChild(span);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => span.classList.add('is-dropping'));
      });
    }

    async function playWord(word) {
      line.innerHTML = '';
      line.classList.remove('is-exiting');

      if (prefersReducedMotion) {
        line.textContent = word;
        return;
      }

      for (const char of word) {
        if (!active) return;
        appendLetter(char);
        await wait(letterGap);
      }

      await wait(holdMs);
      if (!active) return;

      line.classList.add('is-exiting');
      await wait(exitMs);
      line.classList.remove('is-exiting');
    }

    async function runLoop() {
      if (loopRunning) return;
      loopRunning = true;

      while (active) {
        await playWord(words[wordIndex]);
        wordIndex = (wordIndex + 1) % words.length;
      }

      loopRunning = false;
    }

    if (prefersReducedMotion) {
      line.textContent = words[0];
      return;
    }

    runLoop();

    document.addEventListener('visibilitychange', () => {
      active = !document.hidden;
      if (active) runLoop();
    });
  }

  initFallingLetters();

  /* ---------- Hero visual parallax on scroll ---------- */
  const parallaxEl = document.querySelector('[data-parallax]');

  if (parallaxEl && !prefersReducedMotion) {
    window.addEventListener(
      'scroll',
      () => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          parallaxEl.style.transform = `translateY(${window.scrollY * 0.14}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Hero blue panel tilt (desktop) ---------- */
  const heroBluePanel = document.querySelector('.hero-blue-panel');
  if (heroBluePanel && !isTouch && !prefersReducedMotion) {
    let rafId = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    const MAX_TILT = 7;

    function animateTilt() {
      currentRotateX += (targetRotateX - currentRotateX) * 0.14;
      currentRotateY += (targetRotateY - currentRotateY) * 0.14;

      heroBluePanel.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;

      const isStillMoving =
        Math.abs(targetRotateX - currentRotateX) > 0.01 ||
        Math.abs(targetRotateY - currentRotateY) > 0.01;

      if (isStillMoving) {
        rafId = requestAnimationFrame(animateTilt);
      } else {
        rafId = null;
      }
    }

    heroBluePanel.addEventListener('mousemove', (e) => {
      const rect = heroBluePanel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      targetRotateY = (x - 0.5) * MAX_TILT * 2;
      targetRotateX = (0.5 - y) * MAX_TILT * 2;
      heroBluePanel.classList.add('is-tilting');

      if (!rafId) {
        rafId = requestAnimationFrame(animateTilt);
      }
    });

    heroBluePanel.addEventListener('mouseleave', () => {
      targetRotateX = 0;
      targetRotateY = 0;
      heroBluePanel.classList.remove('is-tilting');

      if (!rafId) {
        rafId = requestAnimationFrame(animateTilt);
      }
    });
  }

  /* ---------- Magnetic elements ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic:not(.btn-ripple)').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Card tilt ---------- */

  /* ---------- Scroll progress ---------- */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');

  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgressBar.style.width = `${pct}%`;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('back-to-top');
  let scrollPulseTimer;

  function updateBackToTop() {
    if (!backToTop) return;
    const show = window.scrollY > 400;
    backToTop.hidden = !show;
    backToTop.classList.toggle('is-visible', show);
  }

  window.addEventListener(
    'scroll',
    () => {
      updateBackToTop();
      if (backToTop?.classList.contains('is-visible')) {
        backToTop.classList.add('is-scrolling');
        clearTimeout(scrollPulseTimer);
        scrollPulseTimer = setTimeout(() => backToTop?.classList.remove('is-scrolling'), 150);
      }
    },
    { passive: true }
  );

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  updateBackToTop();

  /* ---------- Timeline ---------- */
  const timeline = document.getElementById('timeline');

  if (timeline && 'IntersectionObserver' in window) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add('in-view');
            timelineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    if (prefersReducedMotion) timeline.classList.add('in-view');
    else timelineObserver.observe(timeline);
  } else if (timeline) {
    timeline.classList.add('in-view');
  }

  /* ---------- Testimonials carousel ---------- */
  const testimonialCarousel = document.getElementById('testimonial-carousel');
  const testimonialTrack = document.getElementById('testimonial-track');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  const testimonialPrev = document.getElementById('testimonial-prev');
  const testimonialNext = document.getElementById('testimonial-next');
  let currentSlide = 0;
  let slideInterval;

  function fillStars(container) {
    if (!container || container.classList.contains('stars-filled')) return;
    container.classList.add('stars-filled');
  }

  function goToSlide(index) {
    if (!testimonialCards.length) return;
    currentSlide = Math.max(0, Math.min(index, testimonialCards.length - 1));

    testimonialCards.forEach((card, i) => {
      card.classList.toggle('active', i === currentSlide);
      if (i === currentSlide) fillStars(card.querySelector('[data-stars]'));
    });

    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });

    if (testimonialTrack) {
      testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if (testimonialPrev) testimonialPrev.disabled = currentSlide === 0;
    if (testimonialNext) testimonialNext.disabled = currentSlide === testimonialCards.length - 1;
  }

  testimonialDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.getAttribute('data-go'), 10));
      resetSlideInterval();
    });
  });

  testimonialPrev?.addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    resetSlideInterval();
  });

  testimonialNext?.addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    resetSlideInterval();
  });

  function resetSlideInterval() {
    clearInterval(slideInterval);
    if (!prefersReducedMotion && testimonialCards.length > 1) {
      slideInterval = setInterval(() => {
        const next = currentSlide >= testimonialCards.length - 1 ? 0 : currentSlide + 1;
        goToSlide(next);
      }, 6000);
    }
  }

  if (testimonialCarousel && 'IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            testimonialCarousel.classList.add('in-view');
            fillStars(testimonialCards[currentSlide]?.querySelector('[data-stars]'));
            carouselObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (prefersReducedMotion) testimonialCarousel.classList.add('in-view');
    else carouselObserver.observe(testimonialCarousel);
  }

  goToSlide(0);
  resetSlideInterval();

  /* ---------- FAQ accordion ---------- */
  const faqList = document.getElementById('faq-list');
  const faqItems = document.querySelectorAll('[data-faq-item]');

  if (faqList && 'IntersectionObserver' in window) {
    const faqObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            faqList.classList.add('in-view');
            faqObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (prefersReducedMotion) faqList.classList.add('in-view');
    else faqObserver.observe(faqList);
  } else if (faqList) {
    faqList.classList.add('in-view');
  }

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        if (answer) answer.hidden = true;
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
      }
    });
  });

  /* ---------- Contact section observers ---------- */
  const contactInfo = document.querySelector('[data-contact-info]');
  const contactForm = document.getElementById('contact-form');

  function observeInView(el, className = 'in-view') {
    if (!el || !('IntersectionObserver' in window)) {
      el?.classList.add(className);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(className);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    if (prefersReducedMotion) el.classList.add(className);
    else obs.observe(el);
  }

  observeInView(contactInfo);
  observeInView(contactForm);

  /* Contact copy feedback */
  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const text = el.getAttribute('data-copy');
      if (!text) return;
      e.preventDefault();
      navigator.clipboard?.writeText(text).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1500);
      });
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const toast = document.getElementById('toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 4000);
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const label = btn?.querySelector('.btn-label');
    let valid = true;

    form.querySelectorAll('[data-form-field]').forEach((group) => {
      const input = group.querySelector('input, textarea');
      const errorEl = group.querySelector('.form-error');
      group.classList.remove('is-error', 'is-success');

      if (input?.hasAttribute('required') && !input.value.trim()) {
        valid = false;
        group.classList.add('is-error');
        if (errorEl) errorEl.textContent = 'This field is required.';
      } else if (input?.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        valid = false;
        group.classList.add('is-error');
        if (errorEl) errorEl.textContent = 'Please enter a valid email.';
      } else if (input?.value.trim()) {
        group.classList.add('is-success');
      }
    });

    if (!valid) return;

    const name = form.querySelector('#name')?.value.trim() || '';
    const email = form.querySelector('#email')?.value.trim() || '';
    const budget = form.querySelector('#budget')?.value || '';
    const message = form.querySelector('#message')?.value.trim() || '';

    btn?.classList.add('is-loading');
    btn.disabled = true;
    if (label) label.textContent = 'Opening email...';

    await new Promise((r) => setTimeout(r, prefersReducedMotion ? 0 : 600));

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nBudget: ${budget || 'Not specified'}\n\n${message}`
    );
    window.location.href = `mailto:dagarneha5@gmail.com?subject=${subject}&body=${body}`;

    btn?.classList.remove('is-loading');
    btn?.classList.add('is-success');
    if (label) label.textContent = 'Email Ready!';
    if (formSuccess) {
      formSuccess.textContent = 'Your email app should open with your message pre-filled. Send it from there to reach me.';
      formSuccess.hidden = false;
    }
    showToast('Email draft opened — send from your mail app.');

    setTimeout(() => {
      btn?.classList.remove('is-success');
      btn.disabled = false;
      if (label) label.textContent = 'Send Message';
      if (formSuccess) formSuccess.hidden = true;
      form.reset();
      form.querySelectorAll('[data-form-field]').forEach((g) => g.classList.remove('is-success', 'is-error'));
    }, 3500);
  });

  /* ---------- Footer reveal ---------- */
  const footer = document.getElementById('footer');
  observeInView(footer);

  /* ---------- Smooth anchor offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- Projects showcase ---------- */
  function initProjectsShowcase() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

const PAGE_SIZE = 6;

  const PROJECTS = window.PASTEL_PROJECTS ?? [
    {
      id: 'proofhub-marketing',
      title: 'ProofHub Marketing',
      category: 'branding',
      categoryLabel: 'SaaS Marketing',
      service: 'Marketing Design',
      description: 'Marketing visuals and brand graphics for ProofHub — project management software for teams worldwide.',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02dca?w=900&q=80',
      stat: 'SaaS Brand',
      client: 'ProofHub',
      date: '2023–Present',
      problem: 'ProofHub needed consistent, clear marketing visuals that communicate product value across web, social, and campaigns.',
      solution: 'Designed marketing assets, feature graphics, and brand-aligned visuals that bring clarity to complex product messaging.',
      results: [
        { value: 141, suffix: '+', label: 'Countries served' },
        { value: 2012, suffix: '', label: 'Company founded' },
        { value: 50, suffix: '+', label: 'Team members' },
      ],
      tools: ['Figma', 'Adobe Illustrator', 'Photoshop'],
      gallery: [
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
      ],
      process: [
        { title: 'Brief', text: 'Align with marketing and product on campaign goals.' },
        { title: 'Design', text: 'Create visuals that bring clarity to the message.' },
        { title: 'Deliver', text: 'Hand off assets for web, social, and email.' },
      ],
      layout: 'wide',
    },
    {
      id: 'venus-remedies',
      title: 'Venus Remedies',
      category: 'branding',
      categoryLabel: 'Pharma Packaging',
      service: 'Print Design',
      description: 'Product packaging, brochures, and regulated marketing collaterals for a pharmaceutical company.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&q=80',
      stat: '10 mos',
      client: 'Venus Remedies Limited',
      date: '2022–2023',
      problem: 'Complex pharmaceutical information needed to be translated into clear, compliant visual communication across packaging and marketing.',
      solution: 'Designed product packaging, brochures, internal communications, and social graphics aligned with industry visual standards.',
      results: [
        { value: 10, suffix: ' mos', label: 'Tenure' },
        { value: 100, suffix: '%', label: 'Brand compliance' },
        { value: 3, suffix: '+', label: 'Product lines' },
      ],
      tools: ['Illustrator', 'InDesign', 'Photoshop'],
      gallery: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      ],
      process: [
        { title: 'Research', text: 'Review regulatory and brand requirements.' },
        { title: 'Design', text: 'Create packaging and collateral layouts.' },
        { title: 'Deliver', text: 'Prepare print-ready production files.' },
      ],
      layout: 'wide',
    },
    {
      id: 'ultra-healthcare',
      title: 'Ultra Healthcare',
      category: 'campaign',
      categoryLabel: 'Healthcare Branding',
      service: 'Brand Design',
      description: 'Branding materials, print collaterals, and social infographics for a healthcare company.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
      stat: '1 yr 5 mos',
      client: 'Ultra Healthcare Official',
      date: '2021–2022',
      problem: 'Ultra Healthcare needed consistent branding and educational visuals that met healthcare regulations.',
      solution: 'Built branding materials, product illustrations, social content, and infographics for customer education.',
      results: [
        { value: 17, suffix: ' mos', label: 'Tenure' },
        { value: 100, suffix: '%', label: 'Regulatory alignment' },
        { value: 4, suffix: '+', label: 'Campaign types' },
      ],
      tools: ['Illustrator', 'Photoshop', 'InDesign'],
      gallery: [
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
      ],
      process: [
        { title: 'Brief', text: 'Gather requirements with marketing teams.' },
        { title: 'Create', text: 'Design collaterals and social infographics.' },
        { title: 'Review', text: 'Ensure accuracy with healthcare guidelines.' },
      ],
    },
    {
      id: 'lumen-finance',
      title: 'Lumen Finance',
      category: 'ui-ux',
      categoryLabel: 'Product Design',
      service: 'UI/UX',
      description: 'Mobile-first fintech dashboard with intuitive data visualization.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80',
      stat: '40% engagement',
      client: 'Lumen Finance',
      date: '2024',
      problem: 'Users struggled to complete key banking tasks on mobile due to dense interfaces and unclear hierarchy.',
      solution: 'A redesigned dashboard with progressive disclosure, accessible charts, and a cohesive component library.',
      results: [
        { value: 40, suffix: '%', label: 'Engagement lift' },
        { value: 18, suffix: 'pts', label: 'NPS gain' },
        { value: 60, suffix: '%', label: 'Faster tasks' },
      ],
      tools: ['Figma', 'Principle', 'React'],
      gallery: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
      ],
      process: [
        { title: 'Research', text: 'User interviews and journey mapping.' },
        { title: 'Design', text: 'Wireframes to high-fidelity UI.' },
        { title: 'Validate', text: 'Usability testing and iteration.' },
      ],
    },
    {
      id: 'aurora-launch',
      title: 'Aurora Launch',
      category: 'campaign',
      categoryLabel: 'Campaign',
      service: 'Campaign',
      description: '360° campaign visuals for a sustainable fashion launch.',
      image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=900&q=80',
      stat: '1M+ impressions',
      client: 'Aurora',
      date: '2024',
      problem: 'Launch a new sustainable line with limited budget but maximum visual impact across digital channels.',
      solution: 'Cohesive art direction, photography direction, and motion snippets for social and OOH.',
      results: [
        { value: 1, suffix: 'M+', label: 'Impressions' },
        { value: 220, suffix: '%', label: 'Social growth' },
        { value: 35, suffix: '%', label: 'Conversion lift' },
      ],
      tools: ['Photoshop', 'Cinema 4D', 'Figma'],
      gallery: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
      ],
      process: [
        { title: 'Concept', text: 'Moodboards and creative territories.' },
        { title: 'Production', text: 'Shoot art direction and asset creation.' },
        { title: 'Launch', text: 'Channel rollout and performance tracking.' },
      ],
    },
    {
      id: 'pulse-health',
      title: 'Pulse Health',
      category: 'web-design',
      categoryLabel: 'Web Design',
      service: 'Web Design',
      description: 'Responsive marketing site with motion-rich storytelling.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&q=80',
      stat: '50K views',
      client: 'Pulse Health',
      date: '2024',
      problem: 'Pulse needed a trustworthy digital presence that explained complex health services simply.',
      solution: 'A scroll-driven narrative site with clear IA, custom illustrations, and subtle motion.',
      results: [
        { value: 50, suffix: 'K', label: 'Monthly views' },
        { value: 3, suffix: 'min', label: 'Avg. session' },
        { value: 28, suffix: '%', label: 'Lead growth' },
      ],
      tools: ['Figma', 'Webflow', 'Lottie'],
      gallery: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
      ],
      process: [
        { title: 'Strategy', text: 'Content architecture and messaging.' },
        { title: 'Design', text: 'Visual design and prototyping.' },
        { title: 'Build', text: 'Development handoff and QA.' },
      ],
    },
    {
      id: 'ember-video',
      title: 'Ember Motion',
      category: 'video',
      categoryLabel: 'Motion',
      service: 'Video',
      description: 'Brand film and social motion package for a tech startup.',
      image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&q=80',
      stat: '2M views',
      client: 'Ember Tech',
      date: '2023',
      problem: 'Explain a complex product in under 90 seconds while maintaining brand energy.',
      solution: 'Scripted storyboard, 2D/3D hybrid motion, and a toolkit of social cutdowns.',
      results: [
        { value: 2, suffix: 'M', label: 'Video views' },
        { value: 85, suffix: '%', label: 'Completion rate' },
        { value: 4.2, suffix: 'x', label: 'Share rate', decimal: true },
      ],
      tools: ['After Effects', 'Cinema 4D', 'Premiere'],
      gallery: [
        'https://images.unsplash.com/photo-1626785774573-4b799314346d?w=600&q=80',
      ],
      layout: 'tall',
    },
    {
      id: 'sage-brand',
      title: 'Sage Botanicals',
      category: 'branding',
      categoryLabel: 'Packaging',
      service: 'Branding',
      description: 'Packaging and retail identity for an organic skincare line.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&q=80',
      stat: '120% sales',
      client: 'Sage Botanicals',
      date: '2023',
      problem: 'Differentiate on shelf with a premium yet earthy aesthetic.',
      solution: 'Illustrated botanical motifs, tactile finishes, and a modular label system.',
      results: [
        { value: 120, suffix: '%', label: 'Sales growth' },
        { value: 15, suffix: '+', label: 'Stockists' },
        { value: 92, suffix: '%', label: 'Positive reviews' },
      ],
      tools: ['Illustrator', 'InDesign', 'Keyshot'],
      gallery: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      ],
    },
    {
      id: 'orbit-app',
      title: 'Orbit Workspace',
      category: 'ui-ux',
      categoryLabel: 'SaaS UI',
      service: 'UI/UX',
      description: 'Collaboration tool UI with real-time features and dark mode.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
      stat: '98% satisfaction',
      client: 'Orbit Inc.',
      date: '2023',
      problem: 'Reduce friction in async collaboration for remote teams.',
      solution: 'Information-dense layouts with clear focus modes and accessible color systems.',
      results: [
        { value: 98, suffix: '%', label: 'Satisfaction' },
        { value: 45, suffix: '%', label: 'Less churn' },
        { value: 3, suffix: 'x', label: 'Daily active use' },
      ],
      tools: ['Figma', 'Storybook', 'Zeroheight'],
      gallery: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      ],
    },
    {
      id: 'metro-web',
      title: 'Metro Arts',
      category: 'web-design',
      categoryLabel: 'Cultural Web',
      service: 'Web Design',
      description: 'Exhibition microsite with immersive gallery experiences.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
      stat: '15K tickets',
      client: 'Metro Arts Foundation',
      date: '2022',
      problem: 'Drive ticket sales for a time-limited exhibition with an editorial feel.',
      solution: 'Full-bleed imagery, timed content reveals, and integrated booking flow.',
      results: [
        { value: 15, suffix: 'K', label: 'Tickets sold' },
        { value: 67, suffix: '%', label: 'Mobile traffic' },
        { value: 4.9, suffix: '/5', label: 'User rating', decimal: true },
      ],
      tools: ['Figma', 'Next.js', 'GSAP'],
      gallery: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
      ],
      layout: 'wide',
    },
    {
      id: 'flux-campaign',
      title: 'Flux Energy',
      category: 'campaign',
      categoryLabel: 'Digital Campaign',
      service: 'Campaign',
      description: 'Multi-channel campaign for a renewable energy brand refresh.',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=80',
      stat: '500K reach',
      client: 'Flux Energy',
      date: '2022',
      problem: 'Reposition a legacy energy company as innovative and sustainable.',
      solution: 'Bold visual language, influencer kits, and animated digital banners.',
      results: [
        { value: 500, suffix: 'K', label: 'Reach' },
        { value: 3.2, suffix: 'x', label: 'CTR lift', decimal: true },
        { value: 42, suffix: '%', label: 'Awareness' },
      ],
      tools: ['Figma', 'After Effects', 'Meta Ads'],
      gallery: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
      ],
    },
  ];

  let activeFilter = 'all';
  let searchQuery = '';
  let visibleCount = PAGE_SIZE;
  let isFiltering = false;
  let openProjectId = null;
  let filteredList = [...PROJECTS];

  const loadMoreBtn = document.getElementById('load-more');
  const searchInput = document.getElementById('project-search');
  const searchClear = document.getElementById('search-clear');
  const resultsCount = document.getElementById('results-count');
  const projectsEmpty = document.getElementById('projects-empty');
  const filterBtns = document.querySelectorAll('.projects-filter');
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  const projectCountEl = document.getElementById('project-count');
  const statsSection = document.getElementById('projects-stats');

  if (projectCountEl) projectCountEl.textContent = String(PROJECTS.length);

  function getFiltered() {
    return PROJECTS.filter((p) => {
      const matchFilter = activeFilter === 'all' || p.category === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  function createCard(project, index) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('tabindex', '0');
    article.dataset.id = project.id;
    article.style.setProperty('--card-delay', `${(index % 3) * 50}ms`);

    if (project.layout === 'wide') article.classList.add('project-card--wide');
    if (project.layout === 'tall') article.classList.add('project-card--tall');

    article.innerHTML = `
      <div class="project-card-media">
        <img class="project-card-img" src="${project.image}" alt="${project.title} — ${project.categoryLabel}" loading="lazy" width="800" height="450" />
        <div class="project-card-overlay project-card-overlay--dark" aria-hidden="true"></div>
        <div class="project-card-overlay project-card-overlay--accent" aria-hidden="true"></div>
        <span class="project-card-arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M14 4H6M14 4v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
      <div class="project-card-body">
        <span class="project-card-badge">${project.categoryLabel}</span>
        <h3 class="project-card-title">${project.title}</h3>
        <span class="project-card-service">${project.service}</span>
        ${project.stat ? `<span class="project-card-stat">${project.stat}</span>` : ''}
        <p class="project-card-desc">${project.description}</p>
      </div>
    `;

    article.addEventListener('click', () => openModal(project.id));
    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(project.id);
      }
    });

    return article;
  }

  function insertCtaCard() {
    const cta = document.createElement('article');
    cta.className = 'project-card project-card--cta';
    cta.setAttribute('role', 'listitem');
    cta.innerHTML = `
      <div class="project-cta-inner">
        <h3>Let's work together</h3>
        <p>Have a project in mind? I'd love to hear about it.</p>
        <a href="#contact" class="btn btn-primary btn-ripple">Get in Touch</a>
      </div>
    `;
    return cta;
  }

  function updateResultsText() {
    if (!resultsCount) return;
    const total = filteredList.length;
    if (searchQuery.trim()) {
      resultsCount.textContent = `Showing ${Math.min(visibleCount, total)} of ${total} results`;
    } else {
      resultsCount.textContent = total ? '' : '';
    }
  }

  function renderGrid(animateFilter = false) {
    filteredList = getFiltered();
    const toShow = filteredList.slice(0, visibleCount);

    if (projectsEmpty) {
      projectsEmpty.hidden = filteredList.length > 0;
    }

    if (loadMoreBtn) {
      const allShown = visibleCount >= filteredList.length;
      loadMoreBtn.disabled = allShown || filteredList.length === 0;
      loadMoreBtn.classList.toggle('is-done', allShown && filteredList.length > 0);
      if (allShown && filteredList.length > 0) {
        loadMoreBtn.querySelector('.btn-label').textContent = `Showing all ${filteredList.length} projects`;
      } else {
        loadMoreBtn.querySelector('.btn-label').textContent = 'Load More Projects';
      }
    }

    updateResultsText();

    if (animateFilter && !prefersReducedMotion) {
      grid.classList.add('is-filtering');
      const existing = [...grid.querySelectorAll('.project-card:not(.project-card--cta)')];
      existing.forEach((card, i) => {
        card.classList.add('is-exiting');
        card.style.animationDelay = `${i * 50}ms`;
      });

      setTimeout(() => {
        grid.innerHTML = '';
        appendCards(toShow, true);
        grid.classList.remove('is-filtering');
      }, 350);
    } else {
      grid.innerHTML = '';
      appendCards(toShow, false);
    }
  }

  function appendCards(projects, filterEnter) {
    projects.forEach((project, i) => {
      const card = createCard(project, i);
      if (filterEnter) {
        card.classList.add('is-entering');
        card.style.animationDelay = `${i * 50}ms`;
      } else {
        observeCard(card, i);
      }
      grid.appendChild(card);
    });

    if (projects.length > 0 && visibleCount >= filteredList.length && !searchQuery && activeFilter === 'all') {
      grid.appendChild(insertCtaCard());
    }
  }

  function observeCard(card, index) {
    if (prefersReducedMotion) {
      card.classList.add('is-visible');
      return;
    }
    card.style.animationDelay = `${Math.floor(index / 3) * 100 + (index % 3) * 50}ms`;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(card);
  }

  function setFilter(filter) {
    if (filter === activeFilter) return;
    const currentY = window.scrollY;
    activeFilter = filter;
    visibleCount = PAGE_SIZE;

    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderGrid(false);
    window.scrollTo({ top: currentY, behavior: 'auto' });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  let searchTimer;
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    searchClear.hidden = !searchQuery;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      visibleCount = PAGE_SIZE;
      renderGrid(true);
    }, 250);
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    visibleCount = PAGE_SIZE;
    renderGrid(true);
    searchInput.focus();
  });

  loadMoreBtn?.addEventListener('click', () => {
    if (loadMoreBtn.classList.contains('is-loading')) return;
    loadMoreBtn.classList.add('is-loading');
    setTimeout(() => {
      visibleCount += PAGE_SIZE;
      renderGrid(false);
      loadMoreBtn.classList.remove('is-loading');
      if (visibleCount >= filteredList.length) {
        loadMoreBtn.querySelector('.btn-label').textContent = `All ${filteredList.length} projects shown`;
      }
    }, prefersReducedMotion ? 0 : 400);
  });

  function getProjectIndex(id) {
    return filteredList.findIndex((p) => p.id === id);
  }

  function getAdjacentId(direction) {
    const idx = getProjectIndex(openProjectId);
    if (idx === -1) return null;
    const next = direction === 'next' ? idx + 1 : idx - 1;
    if (next < 0 || next >= filteredList.length) return null;
    return filteredList[next].id;
  }

  function animateModalStats() {
    modalContent.querySelectorAll('[data-modal-stat]').forEach((el) => {
      const target = parseFloat(el.dataset.modalStat);
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.decimal === 'true';
      const duration = prefersReducedMotion ? 0 : 2000;
      const start = performance.now();

      function tick(now) {
        const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const val = eased * target;
        el.textContent = isDecimal ? val.toFixed(1) + suffix : Math.floor(val) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  function buildModalHTML(project) {
    const nextId = getAdjacentId('next');
    const nextProject = nextId ? PROJECTS.find((p) => p.id === nextId) : null;

    const statsHtml = (project.results || [])
      .map(
        (r) => `
      <div class="modal-stat">
        <span class="modal-stat-num" data-modal-stat="${r.value}" data-suffix="${r.suffix}" data-decimal="${r.decimal ? 'true' : 'false'}">0${r.suffix}</span>
        <span class="modal-stat-label">${r.label}</span>
      </div>`
      )
      .join('');

    const galleryHtml = (project.gallery || [])
      .map((src) => `<img src="${src}" alt="" loading="lazy" />`)
      .join('');

    const processHtml = (project.process || [])
      .map(
        (step, i) => `
      <div class="modal-step">
        <span class="modal-step-num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <strong>${step.title}</strong>
          <p>${step.text}</p>
        </div>
      </div>`
      )
      .join('');

    const toolsHtml = (project.tools || []).map((t) => `<span class="modal-tool">${t}</span>`).join('');

    return `
      <img class="modal-hero-img" src="${project.image}" alt="${project.title}" />
      <header class="modal-header">
        <h2 id="modal-title" class="modal-title">${project.title}</h2>
        <div class="modal-meta">
          <span class="modal-badge">${project.categoryLabel}</span>
          <span class="modal-client">${project.client} · ${project.date}</span>
        </div>
      </header>
      <section class="modal-section" data-modal-section>
        <h3>The Challenge</h3>
        <p>${project.problem || ''}</p>
      </section>
      <section class="modal-section" data-modal-section>
        <h3>The Solution</h3>
        <p>${project.solution || ''}</p>
      </section>
      ${statsHtml ? `<div class="modal-stats">${statsHtml}</div>` : ''}
      ${galleryHtml ? `<div class="modal-gallery">${galleryHtml}</div>` : ''}
      ${processHtml ? `<section class="modal-section" data-modal-section><h3>Process</h3><div class="modal-process">${processHtml}</div></section>` : ''}
      ${toolsHtml ? `<div class="modal-tools">${toolsHtml}</div>` : ''}
      ${
        nextProject
          ? `
      <div class="modal-next-project" data-next-id="${nextProject.id}" tabindex="0" role="button">
        <img src="${nextProject.image}" alt="" />
        <div>
          <span class="modal-next-label">Next Project</span>
          <span class="modal-next-title">${nextProject.title} →</span>
        </div>
      </div>`
          : ''
      }
    `;
  }

  function observeModalSections() {
    modalContent.querySelectorAll('[data-modal-section]').forEach((section) => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { root: modalContent.closest('.project-modal-scroll'), threshold: 0.2 }
      );
      obs.observe(section);
    });
  }

  function openModal(id) {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project || !modal) return;

    openProjectId = id;
    modalContent.innerHTML = buildModalHTML(project);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modal.classList.remove('is-closing');
      modal.classList.add('is-open');
    });

    observeModalSections();
    animateModalStats();

    modalContent.querySelector('.modal-next-project')?.addEventListener('click', () => {
      const nextId = modalContent.querySelector('.modal-next-project')?.dataset.nextId;
      if (nextId) openModal(nextId);
    });

    modalClose?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('is-closing');
    modal.classList.remove('is-open');

    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.style.overflow = '';
      openProjectId = null;
    }, prefersReducedMotion ? 0 : 280);
  }

  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);

  modalPrev?.addEventListener('click', () => {
    const prev = getAdjacentId('prev');
    if (prev) openModal(prev);
  });

  modalNext?.addEventListener('click', () => {
    const next = getAdjacentId('next');
    if (next) openModal(next);
  });

  document.addEventListener('keydown', (e) => {
    if (modal?.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') {
      const prev = getAdjacentId('prev');
      if (prev) openModal(prev);
    }
    if (e.key === 'ArrowRight') {
      const next = getAdjacentId('next');
      if (next) openModal(next);
    }
  });

  if (statsSection && 'IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          statsSection.classList.add('in-view');
          statsSection.querySelectorAll('.projects-stat').forEach((stat) => {
            const numEl = stat.querySelector('.projects-stat-num');
            const target = parseFloat(stat.dataset.statCount);
            const suffix = stat.dataset.statSuffix || '';
            const isDecimal = stat.dataset.statDecimal === 'true';
            const duration = prefersReducedMotion ? 0 : 2500;
            const start = performance.now();

            function tick(now) {
              const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const val = eased * target;
              numEl.textContent = isDecimal ? val.toFixed(1) + suffix : Math.floor(val) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
          });
          statsObs.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    statsObs.observe(statsSection);
  }

  if (!prefersReducedMotion) {
    const workSection = document.getElementById('work');
    const heroBg = workSection?.querySelector('.projects-hero-bg');
    if (heroBg && workSection) {
      window.addEventListener(
        'scroll',
        () => {
          const rect = workSection.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          heroBg.style.transform = `translateY(${rect.top * -0.08}px)`;
        },
        { passive: true }
      );
    }
  }

  renderGrid(false);
  }

  initProjectsShowcase();

  /* Expose for easy updates from LinkedIn export */
  window.PORTFOLIO_CERTIFICATIONS = CERTIFICATIONS;

})();
