/**
 * Homepage V2 — Experimental scroll-driven experience
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const spineSvg = document.getElementById('v2-spine');
  const spinePath = document.getElementById('spine-path');
  const spineGhost = document.getElementById('spine-path-ghost');
  const spineNode = document.getElementById('spine-node');
  const spineNodeGlow = document.getElementById('spine-node-glow');
  const main = document.getElementById('v2-main');
  const scrollFill = document.getElementById('scroll-fill');
  const scrollPct = document.getElementById('scroll-pct');
  const loader = document.getElementById('v2-loader');
  const cursor = document.getElementById('v2-cursor');
  const horizontal = document.getElementById('v2-horizontal');
  const horizontalTrack = document.getElementById('horizontal-track');
  const labCanvas = document.getElementById('v2-lab-canvas');
  const labWave = document.getElementById('lab-wave');
  const labWave2 = document.getElementById('lab-wave-2');
  const labPulse = document.getElementById('lab-pulse');
  const statVelocity = document.getElementById('stat-velocity');
  const statPath = document.getElementById('stat-path');
  const statDepth = document.getElementById('stat-depth');

  let pathLength = 0;
  let lastScrollY = 0;
  let lastScrollTime = performance.now();
  let scrollVelocity = 0;

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader?.classList.add('is-done');
      revealHeroChars();
      buildSpinePath();
      onScroll();
    }, prefersReducedMotion ? 0 : 1400);
  });

  /* ---------- Build scroll spine path from panel positions ---------- */
  function buildSpinePath() {
    if (!spinePath || !main) return;

    const panels = [...main.querySelectorAll('.v2-panel')];
    const w = window.innerWidth;
    const docH = document.documentElement.scrollHeight;
    const points = [];

    panels.forEach((panel, i) => {
      const rect = panel.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const mid = top + rect.height * 0.45;
      const x = w * (i % 2 === 0 ? 0.18 : 0.82);
      points.push({ x, y: mid });
    });

    if (points.length < 2) return;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy1 = prev.y + (curr.y - prev.y) * 0.15;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy2 = curr.y - (curr.y - prev.y) * 0.15;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    const last = points[points.length - 1];
    d += ` L ${last.x} ${Math.min(last.y + 200, docH)}`;

    spinePath.setAttribute('d', d);
    spineGhost?.setAttribute('d', d);

    pathLength = spinePath.getTotalLength();
    spinePath.style.strokeDasharray = pathLength;
    spinePath.style.strokeDashoffset = pathLength;
    if (spineGhost) {
      spineGhost.style.strokeDasharray = pathLength;
      spineGhost.style.strokeDashoffset = pathLength * 0.15;
    }

    spineSvg.setAttribute('viewBox', `0 0 ${w} ${docH}`);
    spineSvg.style.height = `${docH}px`;
  }

  /* ---------- Scroll handler ---------- */
  function onScroll() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? scrollY / docH : 0;

    if (scrollFill) scrollFill.style.width = `${progress * 100}%`;
    if (scrollPct) scrollPct.textContent = String(Math.round(progress * 100)).padStart(3, '0');

    if (pathLength && spinePath) {
      const draw = pathLength * (1 - progress);
      spinePath.style.strokeDashoffset = draw;

      const point = spinePath.getPointAtLength(pathLength * progress);
      spineNode?.setAttribute('cx', point.x);
      spineNode?.setAttribute('cy', point.y);
      spineNodeGlow?.setAttribute('cx', point.x);
      spineNodeGlow?.setAttribute('cy', point.y);

      if (statPath) statPath.textContent = `${Math.round(progress * 100)}%`;
    }

    const now = performance.now();
    const dt = now - lastScrollTime;
    if (dt > 0) {
      scrollVelocity = Math.abs(scrollY - lastScrollY) / dt * 1000;
      if (statVelocity) statVelocity.textContent = Math.round(scrollVelocity);
    }
    lastScrollY = scrollY;
    lastScrollTime = now;

    const skew = Math.min(scrollVelocity * 0.002, 2);
    document.body.style.setProperty('--v2-skew', `${scrollVelocity > 50 ? skew : 0}deg`);
    document.body.classList.toggle('v2-skew', scrollVelocity > 80 && !prefersReducedMotion);
    document.body.classList.toggle('v2-chroma-active', scrollVelocity > 120);

    if (labCanvas && !prefersReducedMotion) {
      const rot = scrollVelocity * 0.05;
      labCanvas.style.transform = `perspective(800px) rotateX(${rot}deg) rotateY(${-rot * 0.5}deg)`;
    }

    if (statDepth) statDepth.textContent = Math.round(progress * 1000);

    updateLabWaves(progress, scrollVelocity);
    updateStackCards(progress);
    revealManifestoLines();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    buildSpinePath();
    onScroll();
  });

  /* ---------- Lab wave animation ---------- */
  function updateLabWaves(progress, velocity) {
    if (!labWave) return;
    const amp = 30 + velocity * 0.15;
    const y1 = 250 + Math.sin(progress * Math.PI * 4) * amp;
    const y2 = 280 + Math.cos(progress * Math.PI * 3) * amp;
    labWave.setAttribute('d', `M0,${y1} Q125,${y1 - amp} 250,${y1} T500,${y1}`);
    labWave2?.setAttribute('d', `M0,${y2} Q125,${y2 + amp} 250,${y2} T500,${y2}`);
    if (labPulse) {
      const r = 40 + progress * 80 + velocity * 0.08;
      labPulse.setAttribute('r', r);
    }
  }

  /* ---------- Sticky stack cards ---------- */
  function updateStackCards(globalProgress) {
    const stack = document.querySelector('.v2-stack');
    if (!stack) return;
    const rect = stack.getBoundingClientRect();
    const stackH = stack.offsetHeight - window.innerHeight;
    const local = Math.max(0, Math.min(1, -rect.top / stackH));

    document.querySelectorAll('.v2-stack-card').forEach((card, i) => {
      const threshold = i * 0.22;
      const active = local > threshold;
      const scale = active ? 1 - (local - threshold) * 0.08 : 0.92 + i * 0.02;
      const y = active ? (local - threshold) * -120 : i * 14;
      const opacity = active ? 1 - (local - threshold) * 1.5 : 0.4;
      card.style.transform = `translateY(${y}px) scale(${Math.max(0.85, scale)})`;
      card.style.opacity = Math.max(0.2, Math.min(1, opacity));
    });
  }

  /* ---------- Hero char reveal ---------- */
  function revealHeroChars() {
    document.querySelectorAll('[data-split]').forEach((row) => {
      const text = row.textContent;
      row.textContent = '';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00a0' : char;
        span.style.transitionDelay = `${i * 40}ms`;
        row.appendChild(span);
      });
      requestAnimationFrame(() => row.classList.add('is-revealed'));
    });
  }

  /* ---------- Manifesto line reveal ---------- */
  function revealManifestoLines() {
    document.querySelectorAll('.v2-manifesto-line').forEach((line) => {
      const rect = line.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) line.classList.add('is-visible');
    });
  }

  /* ---------- Text scramble ---------- */
  const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const target = el.dataset.scramble || el.textContent;
    let frame = 0;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const interval = setInterval(() => {
        el.textContent = target
          .split('')
          .map((c, i) => (i < frame ? c : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]))
          .join('');
        frame++;
        if (frame > target.length) clearInterval(interval);
      }, prefersReducedMotion ? 0 : 40);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---------- Custom cursor ---------- */
  if (cursor && !isTouch) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    function tick() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(tick);
    }
    tick();
    document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Magnetic elements ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.25;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    if (isTouch || prefersReducedMotion) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Horizontal scroll section (pinned) ---------- */
  if (horizontal && horizontalTrack) {
    const workSection = document.getElementById('panel-work');

    function onHorizontalScroll() {
      if (!workSection) return;
      const rect = workSection.getBoundingClientRect();
      const scrollRange = workSection.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;

      const scrolled = Math.max(0, -rect.top);
      const hProgress = Math.min(1, scrolled / scrollRange);
      const trackW = horizontalTrack.scrollWidth - window.innerWidth + 80;
      horizontalTrack.style.transform = `translate3d(${-hProgress * trackW}px, 0, 0)`;
    }

    window.addEventListener('scroll', onHorizontalScroll, { passive: true });
    window.addEventListener('resize', onHorizontalScroll);
    onHorizontalScroll();
  }

  /* ---------- Smooth scroll buttons ---------- */
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.scroll);
      target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Orbit ring draw on scroll ---------- */
  const orbitRing = document.getElementById('orbit-ring');
  if (orbitRing) {
    const len = orbitRing.getTotalLength();
    orbitRing.style.strokeDasharray = len;
    orbitRing.style.strokeDashoffset = len;
    window.addEventListener('scroll', () => {
      const p = Math.min(window.scrollY / 800, 1);
      orbitRing.style.strokeDashoffset = len * (1 - p);
    }, { passive: true });
  }

  /* ---------- Burst path pulse ---------- */
  const burstPath = document.getElementById('burst-path');
  if (burstPath) {
    const bl = burstPath.getTotalLength();
    burstPath.style.strokeDasharray = bl;
    burstPath.style.strokeDashoffset = bl;
    window.addEventListener('scroll', () => {
      const contact = document.getElementById('panel-contact');
      if (!contact) return;
      const rect = contact.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        const p = 1 - rect.top / window.innerHeight;
        burstPath.style.strokeDashoffset = bl * (1 - Math.min(p, 1));
      }
    }, { passive: true });
  }
})();
