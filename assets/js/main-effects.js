hljs.highlightAll();

/* ---- Typing Animation ---- */
(function () {
    var phrases = [
        'Data Scientist & MLOps Engineer',
        'Co-Founder, LuxAiOps',
        'IT Consultant & MLOps',
        'Python & Cloud Specialist',
        'Cybersecurity & Automation Expert'
    ];
    var el = document.getElementById('typed-subtitle');
    var cursor = document.getElementById('typed-cursor');
    if (!el || !cursor) return;
    var phraseIdx = 0, charIdx = 0, deleting = false;
    cursor.style.cssText = 'animation:blink 0.7s step-end infinite;margin-left:2px;color:#a78bfa;';
    var style = document.createElement('style');
    style.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
    document.head.appendChild(style);
    function tick() {
        var phrase = phrases[phraseIdx];
        if (deleting) {
            charIdx--;
        } else {
            charIdx++;
        }
        // rebuild text content without cursor span
        el.childNodes[0] && el.removeChild(el.childNodes[0]);
        el.insertBefore(document.createTextNode(phrase.slice(0, charIdx)), cursor);
        if (!deleting && charIdx === phrase.length) {
            deleting = true;
            setTimeout(tick, 1800);
        } else if (deleting && charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(tick, 400);
        } else {
            setTimeout(tick, deleting ? 45 : 80);
        }
    }
    setTimeout(tick, 600);
})();

/* ---- Interactive Cursor Glow ---- */
(function () {
    var glow = document.getElementById('cursor-glow');
    var luxGlow = document.getElementById('luxaiops-active-glow');
    var main = document.getElementById('main');

    window.addEventListener('mousemove', function (e) {
        var x = e.clientX;
        var y = e.clientY;

        if (glow) {
            glow.style.left = x + 'px';
            glow.style.top = y + 'px';
            glow.style.opacity = '1';
        }

        if (luxGlow) {
            luxGlow.style.left = x + 'px';
            luxGlow.style.top = y + 'px';
        }
    });

    // Show LuxAiOps specific glow when that article is active
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                var luxArticle = document.getElementById('luxaiops');
                if (luxArticle && luxArticle.classList.contains('active')) {
                    if (luxGlow) luxGlow.style.opacity = '1';
                    if (glow) glow.style.opacity = '0';
                } else {
                    if (luxGlow) luxGlow.style.opacity = '0';
                    if (glow) glow.style.opacity = '1';
                }
            }
        });
    });

    var articles = document.querySelectorAll('#main article');
    articles.forEach(function (article) {
        observer.observe(article, { attributes: true });
    });
})();

/* ---- Floating Particles (Interactive) ---- */
(function () {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var NUM = 65;
    var mouse = { x: -1000, y: -1000 };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function Particle() {
        this.init();
    }

    Particle.prototype.init = function () {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '167,139,250' : '96,195,255';
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }

    Particle.prototype.update = function () {
        // Base movement
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;

        // Mouse interaction (repel)
        var dx = mouse.x - this.x;
        var dy = mouse.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var forceDirectionX = dx / distance;
        var forceDirectionY = dy / distance;
        var maxDistance = 150;
        var force = (maxDistance - distance) / maxDistance;
        var directionX = forceDirectionX * force * this.density;
        var directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        }
    };

    function init() {
        resize();
        particles = [];
        for (var i = 0; i < NUM; i++) particles.push(new Particle());
    }

    function connectParticles() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    ctx.beginPath();
                    var alpha = (0.15 * (1 - dist / 140));
                    ctx.strokeStyle = 'rgba(123,47,255,' + alpha + ')';
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function (p) {
            p.update();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
            ctx.fill();
        });
        connectParticles();
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', init);
    init();
    loop();
})();
