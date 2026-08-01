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
})();
