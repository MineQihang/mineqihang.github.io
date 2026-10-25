(() => {
    const mobileNav = document.querySelector('.mobile-nav');
    const header = document.querySelector('.site-header');
    const main = document.querySelector('#main-content');
    let headerVisible = false;
    let headerFrame = null;

    const updateHeader = () => {
        const menuOpen = mobileNav && mobileNav.open;
        const threshold = headerVisible ? 160 : 220;
        const shouldShow = Boolean(menuOpen) || window.scrollY > threshold;

        if (shouldShow !== headerVisible) {
            if (!shouldShow && header.contains(document.activeElement)) {
                main.focus({ preventScroll: true });
            }
            headerVisible = shouldShow;
            header.classList.toggle('is-visible', shouldShow);
        }
        headerFrame = null;
    };

    const scheduleHeaderUpdate = () => {
        if (headerFrame === null) {
            headerFrame = window.requestAnimationFrame(updateHeader);
        }
    };

    if (header && main) {
        document.documentElement.classList.add('nav-enhanced');
        window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
        if (mobileNav) {
            mobileNav.addEventListener('toggle', scheduleHeaderUpdate);
        }
        updateHeader();
        window.requestAnimationFrame(() => header.classList.add('is-animated'));
    }

    if (mobileNav) {
        const summary = mobileNav.querySelector('summary');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let closeTimer = null;
        let openFrame = null;

        const openMobileNav = () => {
            window.clearTimeout(closeTimer);
            if (openFrame !== null) {
                window.cancelAnimationFrame(openFrame);
            }
            mobileNav.setAttribute('open', '');
            openFrame = window.requestAnimationFrame(() => {
                mobileNav.classList.add('is-open');
                openFrame = null;
            });
        };

        const closeMobileNav = () => {
            if (!mobileNav.open) {
                return;
            }
            if (openFrame !== null) {
                window.cancelAnimationFrame(openFrame);
                openFrame = null;
            }
            mobileNav.classList.remove('is-open');
            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(() => {
                mobileNav.removeAttribute('open');
                closeTimer = null;
            }, reducedMotion.matches ? 0 : 280);
        };

        summary.addEventListener('click', event => {
            event.preventDefault();
            if (mobileNav.open) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        document.addEventListener('click', event => {
            if (mobileNav.open && !mobileNav.contains(event.target)) {
                closeMobileNav();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && mobileNav.open) {
                closeMobileNav();
                summary.focus();
            }
        });

        window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
            if (event.matches) {
                closeMobileNav();
            }
        });
    }

    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    const setActiveSection = sectionId => {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActiveSection(link.getAttribute('href').slice(1));
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -65% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }
})();
