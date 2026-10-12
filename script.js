/**
 * Dark editorial portfolio — minimal interactions
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Active nav on scroll */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".site-nav a");

  function setActiveNav() {
    const y = window.scrollY + 120;
    let current = "";

    sections.forEach((section) => {
      if (y >= section.offsetTop && y < section.offsetTop + section.offsetHeight) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === `#${current}`);
    });
  }

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-inview"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-inview"));
  }

  /* Soft header fade after leaving hero */
  const bar = document.querySelector(".site-bar");
  const hero = document.getElementById("hero");

  function updateBar() {
    if (!bar || !hero) return;
    const past = window.scrollY > hero.offsetHeight * 0.55;
    bar.classList.toggle("is-solid", past);
  }

  window.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* Manifesto: word-by-word reveal while scrolling (zarcerog-style) */
  const manifestoSection = document.getElementById("manifesto");
  const manifestoWords = document.querySelectorAll("[data-manifesto-scroll] .m-word");

  function updateManifestoScroll() {
    if (!manifestoSection || !manifestoWords.length) return;

    if (prefersReducedMotion) {
      manifestoWords.forEach((word) => word.classList.add("is-lit"));
      return;
    }

    const rect = manifestoSection.getBoundingClientRect();
    const sectionHeight = manifestoSection.offsetHeight;
    const viewport = window.innerHeight;
    const scrollable = Math.max(sectionHeight - viewport, 1);
    // 0 when sticky starts pinning, 1 near end of section
    const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    const litCount = Math.round(progress * manifestoWords.length);

    manifestoWords.forEach((word, index) => {
      word.classList.toggle("is-lit", index < litCount);
    });
  }

  window.addEventListener("scroll", updateManifestoScroll, { passive: true });
  window.addEventListener("resize", updateManifestoScroll, { passive: true });
  updateManifestoScroll();
})();
