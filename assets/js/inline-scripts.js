(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealTargets = document.querySelectorAll('.timeline-item, .skill-card, .tool-card, .code-window, .pomo-card, .todo-input-group, .code-tab-bar, form, #contact .icons li');

    if (revealTargets.length && 'IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-on-scroll', 'is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(function (target) {
            target.classList.add('reveal-on-scroll');
            observer.observe(target);
        });
    } else {
        document.querySelectorAll('.reveal-on-scroll').forEach(function (target) {
            target.classList.add('is-visible');
        });
    }

    var btns = document.querySelectorAll('.code-tab-btn');
    var panels = document.querySelectorAll('.code-tab-panel');
    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = btn.getAttribute('data-code-tab');
            btns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            panels.forEach(function (p) { p.classList.remove('active'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById('code-panel-' + target).classList.add('active');
        });
    });

    // ---- Contact form client-side monitoring & simple rate-limit ----
    try {
        var contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                try {
                    var now = Date.now();
                    var raw = localStorage.getItem('contact_submits') || '[]';
                    var arr = JSON.parse(raw);
                    // Keep only last 30 minutes for tracking
                    var windowMs = 30 * 60 * 1000;
                    arr = arr.filter(ts => (now - ts) < windowMs);
                    if (arr.length >= 5) {
                        // Rate limit exceeded — block and inform user
                        e.preventDefault();
                        var msg = 'Too many contact attempts. Please wait a while before retrying.';
                        if (typeof showToast === 'function') showToast(msg, 'warning'); else alert(msg);
                        return false;
                    }
                    // accept and record (timestamp stored before actual network send)
                    arr.push(now);
                    localStorage.setItem('contact_submits', JSON.stringify(arr));
                    // Also store last submit summary for quick monitoring (keep last 20)
                    var meta = JSON.parse(localStorage.getItem('contact_submit_meta') || '[]');
                    meta.push({ ts: now, url: window.location.pathname });
                    if (meta.length > 20) meta = meta.slice(-20);
                    localStorage.setItem('contact_submit_meta', JSON.stringify(meta));
                    return true;
                } catch (err) {
                    return true;
                }
            });
        }
    } catch (err) {}
})();
