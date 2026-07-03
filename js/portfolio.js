(function () {
    'use strict';

    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery__item');
    const contactForm = document.getElementById('contactForm');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    /* Navigation scroll effect */
    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    /* Mobile menu */
    navToggle.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* Portfolio filters */
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const filter = btn.dataset.filter;

            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            galleryItems.forEach(function (item) {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    /* Scroll reveal */
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) {
        revealObserver.observe(el);
    });

    /* Skill bar animation */
    const skillFills = document.querySelectorAll('.skill__fill');

    const skillObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.dataset.width;
                fill.style.width = width + '%';
                skillObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(function (fill) {
        skillObserver.observe(fill);
    });

    /* Custom cursor */
    if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        document.querySelectorAll('a, button, .gallery__link, input, select, textarea').forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', function () {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    /* Contact form */
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            contactForm.innerHTML =
                '<div class="form-success">' +
                    '<h3>Message sent!</h3>' +
                    '<p>Thanks for reaching out. I\'ll get back to you within 48 hours.</p>' +
                '</div>';
        });
    }

    /* Smooth anchor offset for fixed nav */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = nav.offsetHeight + 16;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });
})();
