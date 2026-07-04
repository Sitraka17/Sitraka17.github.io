(function () {
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
