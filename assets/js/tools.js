/* ---- custom Toast Notification System ---- */
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    else if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
    else if (type === 'warning') iconClass = 'fas fa-exclamation-circle';
    
    toast.innerHTML = `<i class="${iconClass}" style="margin-right: 8px;"></i><span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => { toast.classList.add('show'); }, 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ---- Pomodoro Floating Popup ---- */
function isPomodoroVisible() {
    var el = document.getElementById('tool-pomodoro');
    if (!el) return false;
    var s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetHeight > 0;
}
function pomoShowFloatingAlert(title, msg, type) {
    var existing = document.getElementById('pomo-float-alert');
    if (existing) existing.remove();
    var isBreak = (type === 'green');
    var accent  = isBreak ? '#10b981' : '#a78bfa';
    var emoji   = isBreak ? '\u2615' : '\ud83c\udf45';
    var el = document.createElement('div');
    el.id = 'pomo-float-alert';
    el.innerHTML = '<div style="display:flex;align-items:flex-start;gap:0.9rem;">'
        + '<span style="font-size:1.8rem;line-height:1;">' + emoji + '</span>'
        + '<div style="flex:1;"><div style="font-weight:700;font-size:0.97rem;color:#fff;margin-bottom:0.25rem;">' + title + '</div>'
        + '<div style="font-size:0.82rem;color:rgba(255,255,255,0.72);">' + msg + '</div></div>'
        + '<button id="pomo-float-close" style="background:none;border:none;color:rgba(255,255,255,0.45);cursor:pointer;font-size:1.4rem;line-height:1;padding:0;">&times;</button></div>'
        + '<div style="margin-top:0.7rem;border-top:1px solid rgba(255,255,255,0.08);padding-top:0.6rem;">'
        + '<a href="#tool-pomodoro" id="pomo-float-link" style="font-size:0.8rem;color:' + accent + ';text-decoration:none;font-weight:600;">\u25b6 Go to Timer</a></div>';
    el.style.cssText = 'position:fixed;bottom:1.8rem;right:1.8rem;z-index:99999;'
        + 'background:rgba(12,8,30,0.97);border:1px solid ' + accent + ';border-radius:14px;'
        + 'padding:1.1rem 1.3rem;width:290px;box-shadow:0 10px 40px rgba(0,0,0,0.6);'
        + 'backdrop-filter:blur(14px);font-family:Inter,sans-serif;'
        + 'transform:translateX(130%);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);';
    document.body.appendChild(el);
    setTimeout(function() { el.style.transform = 'translateX(0)'; }, 30);
    function dismiss() {
        el.style.transform = 'translateX(130%)';
        setTimeout(function() { if (el.parentNode) el.remove(); }, 420);
    }
    document.getElementById('pomo-float-close').addEventListener('click', dismiss);
    document.getElementById('pomo-float-link').addEventListener('click', dismiss);
    setTimeout(dismiss, 14000);
}

/* ---- Featured Tools Logic ---- */
$(document).ready(function () {
    // 1. Pomodoro Timer
    const POMO_CIRC = 2 * Math.PI * 100;
    let pomoInterval = null;
    let isFocus = true;
    let isLongBreak = false;
    let pomoSessionCount = 0;
    let pomoSessionLog = [];
    let pomoCurrentGoal = '';
    let pomoTotalTime = 25 * 60;
    let pomoTimeLeft  = 25 * 60;
    let pomoOrigTitle = document.title;

    // Web Audio beep (no external files needed)
    function pomoBeep(freq, dur) {
        if (!$('#pomo-sound-toggle').prop('checked')) return;
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.start(); osc.stop(ctx.currentTime + dur);
        } catch(e) {}
    }

    // Update session dots
    function updatePomoDots() {
        var dots = document.querySelectorAll('#pomo-dots .pomo-dot');
        dots.forEach(function(d, i) {
            d.classList.toggle('done', i < (pomoSessionCount % 8));
        });
    }

    function applyPomoMode(focus, lb) {
        var ring = document.getElementById('pomo-ring-fill');
        var wrap = document.getElementById('pomo-ring-wrap');
        if (ring) ring.setAttribute('stroke', focus ? 'url(#pgFocus)' : (lb ? '#f59e0b' : 'url(#pgBreak)'));
        if (wrap) {
            wrap.classList.toggle('pulsing',       focus && !lb);
            wrap.classList.toggle('break-pulse',   !focus && !lb);
            wrap.classList.toggle('longbreak-pulse', !!lb);
        }
        var badge = document.getElementById('pomodoro-status');
        if (badge) {
            badge.classList.toggle('focus',     focus);
            badge.classList.toggle('break',     !focus && !lb);
            badge.classList.toggle('longbreak', !!lb);
        }
    }

    function getPomoDurations() {
        var f  = parseInt($('#pomo-focus-min').val(), 10);
        var b  = parseInt($('#pomo-break-min').val(), 10);
        var lb = parseInt($('#pomo-long-break-min').val(), 10);
        return { focus:     (isNaN(f)  || f  < 1 ? 25 : f)  * 60,
                 breakT:    (isNaN(b)  || b  < 1 ? 5  : b)  * 60,
                 longBreak: (isNaN(lb) || lb < 5 ? 15 : lb) * 60 };
    }

    function updatePomoDisplay() {
        const m = Math.floor(pomoTimeLeft / 60);
        const s = pomoTimeLeft % 60;
        const txt = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        $('#pomodoro-display').text(txt);
        // tab title
        document.title = txt + ' | ' + (isFocus ? '🎯 Focus' : '☕ Break');
        // ring
        const ring = document.getElementById('pomo-ring-fill');
        if (ring && pomoTotalTime > 0) {
            ring.style.strokeDashoffset = POMO_CIRC * (1 - pomoTimeLeft / pomoTotalTime);
        }
    }

    function pomoSendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification(title, { body: body, tag: 'pomodoro', renotify: true }); } catch(e) {}
        }
    }

    function pomoRingColor(focus) { applyPomoMode(focus, isLongBreak); }

    // Render session log
    function renderPomoLog() {
        var section = document.getElementById('pomo-log-section');
        var list    = document.getElementById('pomo-log-list');
        if (!section || !list) return;
        if (pomoSessionLog.length === 0) { section.style.display = 'none'; return; }
        section.style.display = 'block';
        list.innerHTML = '';
        pomoSessionLog.slice().reverse().forEach(function(e) {
            var el = document.createElement('div');
            el.className = 'pomo-log-entry';
            el.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">'
                + '<strong style="color:#a78bfa;">Session #' + e.num + '</strong>'
                + '<span style="color:rgba(255,255,255,0.3);font-size:0.72rem;">' + e.ts + '</span></div>'
                + (e.goal     ? '<div class="log-goal">🎯 ' + e.goal + '</div>' : '')
                + (e.achieved ? '<div class="log-achieved">✨ ' + e.achieved + '</div>'
                              : '<div style="color:rgba(255,255,255,0.25);font-style:italic;">No notes</div>');
            list.appendChild(el);
        });
    }

    // Export session log as CSV
    function exportPomoLog() {
        if (pomoSessionLog.length === 0) { showToast('No sessions to export yet!', 'warning'); return; }
        var rows = ['Session,Date/Time,Goal,Achieved,Focus (min)'];
        pomoSessionLog.forEach(function(e) {
            rows.push([e.num,
                '"' + e.ts + '"',
                '"' + (e.goal     || '').replace(/"/g, '""') + '"',
                '"' + (e.achieved || '').replace(/"/g, '""') + '"',
                e.focusMins].join(','));
        });
        var blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pomodoro_' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showToast('Sessions exported!', 'success');
    }

    // Achievement modal (shown when focus session ends)
    function showAchievementModal() {
        var existing = document.getElementById('pomo-ach-modal');
        if (existing) existing.remove();
        var goal = pomoCurrentGoal || 'No goal set';
        var sNum = pomoSessionCount;
        var lb   = isLongBreak;
        var bMin = Math.round(pomoTotalTime / 60);
        var overlay = document.createElement('div');
        overlay.id = 'pomo-ach-modal';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:1rem;';
        overlay.innerHTML = '<div style="background:rgba(12,6,30,0.98);border:1px solid rgba(167,139,250,0.3);border-radius:20px;padding:2rem;max-width:450px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.7);">'
            + '<div style="text-align:center;margin-bottom:1.4rem;"><div style="font-size:2.4rem;">' + (lb ? '🌙' : '🍅') + '</div>'
            + '<h3 style="color:#c4b5fd;margin:0.4rem 0 0.2rem;font-size:1.1rem;">Session ' + sNum + ' Complete!</h3>'
            + '<p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0;">' + (lb ? 'Long Break' : 'Break') + ' — ' + bMin + ' minutes</p></div>'
            + '<div style="background:rgba(123,47,255,0.08);border:1px solid rgba(123,47,255,0.2);border-radius:10px;padding:0.85rem 1rem;margin-bottom:1.1rem;">'
            + '<div style="font-size:0.7rem;color:rgba(167,139,250,0.6);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.35rem;">🎯 You planned to</div>'
            + '<div style="color:rgba(255,255,255,0.85);font-size:0.9rem;">' + goal + '</div></div>'
            + '<label style="display:block;font-size:0.7rem;color:rgba(167,139,250,0.6);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.4rem;">✨ What did you actually achieve?</label>'
            + '<textarea id="pomo-ach-input" rows="3" placeholder="Describe what you accomplished…" style="width:100%;box-sizing:border-box;font-size:0.88rem;padding:0.6rem 0.8rem;border-radius:8px;resize:vertical;margin-bottom:1.2rem;"></textarea>'
            + '<div style="display:flex;gap:0.8rem;justify-content:flex-end;">'
            + '<button id="pomo-ach-skip" class="button" style="font-size:0.85rem;">Skip</button>'
            + '<button id="pomo-ach-save" class="button primary" style="font-size:0.85rem;">💾 Save &amp; Start Break</button></div></div>';
        document.body.appendChild(overlay);
        setTimeout(function() { var t = document.getElementById('pomo-ach-input'); if(t) t.focus(); }, 80);
        function saveAndClose() {
            var achieved = (document.getElementById('pomo-ach-input').value || '').trim();
            pomoSessionLog.push({ num: sNum, goal: pomoCurrentGoal, achieved: achieved,
                ts: new Date().toLocaleString(), focusMins: Math.round(getPomoDurations().focus / 60) });
            renderPomoLog();
            overlay.remove();
            startPomoInterval();
        }
        document.getElementById('pomo-ach-skip').addEventListener('click', function() { overlay.remove(); startPomoInterval(); });
        document.getElementById('pomo-ach-save').addEventListener('click', saveAndClose);
        document.getElementById('pomo-ach-input').addEventListener('keydown', function(e) { if (e.ctrlKey && e.key === 'Enter') saveAndClose(); });
    }

    function pomoPhaseEnd() {
        clearInterval(pomoInterval);
        pomoInterval = null;
        var d = getPomoDurations();
        if (isFocus) {
            // Focus session just ended
            isFocus = false;
            pomoSessionCount++;
            $('#pomo-session-count').text(pomoSessionCount);
            updatePomoDots();
            isLongBreak = (pomoSessionCount % 4 === 0);
            pomoTotalTime = isLongBreak ? d.longBreak : d.breakT;
            pomoTimeLeft  = pomoTotalTime;
            var label = isLongBreak ? '🌙 Long Break' : 'Break Time';
            $('#pomodoro-status').text(label).removeClass('focus break longbreak').addClass(isLongBreak ? 'longbreak' : 'break');
            applyPomoMode(false, isLongBreak);
            updatePomoDisplay();
            pomoBeep(880, 0.3); setTimeout(function(){ pomoBeep(660, 0.4); }, 320);
            if (isLongBreak) setTimeout(function(){ pomoBeep(440, 0.5); }, 700);
            var nTitle = isLongBreak ? '🌙 Long Break! You earned it!' : '🍅 Pomodoro Complete!';
            var nBody  = isLongBreak ? 'Session ' + pomoSessionCount + ' done! Enjoy your ' + Math.round(d.longBreak/60) + '-min break.' : 'Take a ' + Math.round(d.breakT/60) + '-min break.';
            showToast(nTitle, 'success');
            pomoSendNotification(nTitle, nBody);
            if (!isPomodoroVisible()) pomoShowFloatingAlert(nTitle, nBody, 'green');
            // Show achievement modal (it will call startPomoInterval when closed)
            showAchievementModal();
        } else {
            // Break just ended → switch back to focus
            isFocus = true;
            isLongBreak = false;
            pomoTotalTime = d.focus;
            pomoTimeLeft  = pomoTotalTime;
            $('#pomodoro-status').text('Focus Time').removeClass('break longbreak').addClass('focus');
            applyPomoMode(true, false);
            updatePomoDisplay();
            pomoBeep(440, 0.5);
            showToast("Break's over! Back to work! 🎯", 'info');
            pomoSendNotification("⏰ Break's Over!", 'Time to focus again!');
            if (!isPomodoroVisible()) pomoShowFloatingAlert("⏰ Break's Over!", 'Time to focus again!', 'purple');
            startPomoInterval();
        }
    }

    function startPomoInterval() {
        if (pomoInterval) return;
        pomoInterval = setInterval(function () {
            if (pomoTimeLeft > 0) {
                pomoTimeLeft--;
                updatePomoDisplay();
            } else {
                pomoPhaseEnd();
            }
        }, 1000);
    }

    // Notification permission button
    if ('Notification' in window && Notification.permission === 'granted') {
        $('#pomo-notif-banner').hide();
    }
    $('#pomo-notif-btn').on('click', function () {
        if (!('Notification' in window)) {
            showToast('Your browser does not support notifications.', 'error');
            return;
        }
        var handled = false;
        function onPerm(perm) {
            if (handled) return; handled = true;
            if (perm === 'granted') {
                $('#pomo-notif-banner').slideUp(300);
                showToast('\ud83d\udd14 Notifications enabled!', 'success');
                try { new Notification('Pomodoro Timer', { body: "You'll be alerted when sessions end!" }); } catch(e) {}
            } else {
                showToast('Notifications blocked \u2014 allow them in browser settings.', 'warning');
            }
        }
        var result = Notification.requestPermission(onPerm);
        if (result && typeof result.then === 'function') result.then(onPerm);
    });

    $('#pomodoro-start').on('click', function () {
        if (pomoInterval) return;
        if (isFocus && pomoTimeLeft === pomoTotalTime) {
            // Fresh focus session — capture goal
            pomoCurrentGoal = $('#pomo-goal-input').val().trim();
            var d = getPomoDurations();
            pomoTotalTime = d.focus;
            pomoTimeLeft  = pomoTotalTime;
            updatePomoDisplay();
        } else if (pomoTimeLeft === pomoTotalTime) {
            var d2 = getPomoDurations();
            pomoTotalTime = isLongBreak ? d2.longBreak : (isFocus ? d2.focus : d2.breakT);
            pomoTimeLeft  = pomoTotalTime;
            updatePomoDisplay();
        }
        startPomoInterval();
    });
    $('#pomodoro-pause').on('click', function () {
        clearInterval(pomoInterval);
        pomoInterval = null;
        document.title = pomoOrigTitle;
    });
    $('#pomodoro-reset').on('click', function () {
        clearInterval(pomoInterval);
        pomoInterval = null;
        isFocus = true; isLongBreak = false;
        var d = getPomoDurations();
        pomoTotalTime = d.focus;
        pomoTimeLeft  = pomoTotalTime;
        $('#pomodoro-status').text('Focus Time').removeClass('break longbreak').addClass('focus');
        applyPomoMode(true, false);
        document.title = pomoOrigTitle;
        updatePomoDisplay();
    });
    // Export button
    $('#pomo-export-btn').on('click', exportPomoLog);
    // update display when user changes duration inputs (only when stopped)
    $('#pomo-focus-min, #pomo-break-min').on('change', function () {
        if (!pomoInterval) {
            const d = getPomoDurations();
            pomoTotalTime = isFocus ? d.focus : d.breakT;
            pomoTimeLeft  = pomoTotalTime;
            updatePomoDisplay();
        }
    });
    updatePomoDisplay();
    applyPomoMode(true, false);

    // Space key shortcut
    $(document).on('keydown', function(e) {
        var active = document.getElementById('tool-pomodoro');
        if (!active || window.getComputedStyle(active).display === 'none') return;
        if (e.code === 'Space' && !$(e.target).is('input,textarea,button')) {
            e.preventDefault();
            if (pomoInterval) { $('#pomodoro-pause').trigger('click'); }
            else              { $('#pomodoro-start').trigger('click'); }
        }
    });

    // 2. Random Name Picker
    $('#name-picker-btn').click(function () {
        let text = $('#name-picker-input').val();
        let names = text.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
        if (names.length === 0) {
            $('#name-picker-result').text('Please enter some names!');
            return;
        }
        let count = 0;
        let interval = setInterval(() => {
            let rand = names[Math.floor(Math.random() * names.length)];
            $('#name-picker-result').text(rand);
            count++;
            if (count > 15) {
                clearInterval(interval);
                $('#name-picker-result').css('color', '#a78bfa');
                setTimeout(() => $('#name-picker-result').css('color', '#00c9ff'), 300);
            }
        }, 50);
    });

    // 3. Activity Stopwatch
    let swInterval;
    let swTime = 0;
    let swStart = 0;
    let swLapCount = 1;

    function formatTime(ms) {
        let date = new Date(ms);
        let h = String(date.getUTCHours()).padStart(2, '0');
        let m = String(date.getUTCMinutes()).padStart(2, '0');
        let s = String(date.getUTCSeconds()).padStart(2, '0');
        let cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
        return `${h}:${m}:${s}.${cs}`;
    }
    $('#stopwatch-start').click(function () {
        if (swInterval) return;
        swStart = Date.now() - swTime;
        swInterval = setInterval(() => {
            swTime = Date.now() - swStart;
            $('#stopwatch-display').text(formatTime(swTime));
        }, 10);
    });
    $('#stopwatch-stop').click(function () {
        clearInterval(swInterval);
        swInterval = null;
    });
    $('#stopwatch-lap').click(function () {
        if (!swInterval) return;
        $('#laps-list').prepend(`<li>Lap ${swLapCount}: ${formatTime(swTime)}</li>`);
        swLapCount++;
    });
    $('#stopwatch-reset').click(function () {
        clearInterval(swInterval);
        swInterval = null;
        swTime = 0;
        swLapCount = 1;
        $('#stopwatch-display').text('00:00:00.00');
        $('#laps-list').empty();
    });
    $('#stopwatch-export-ics').click(function () {
        if (swTime === 0) {
            showToast("Run the stopwatch first to record time before exporting.", "error");
            return;
        }
        const evtName = $('#stopwatch-event-name').val().trim() || 'Activity Session';
        const hrs = Math.floor(swTime / 3600000);
        const mins = Math.floor((swTime % 3600000) / 60000);
        const secs = Math.floor((swTime % 60000) / 1000);
        const timeStr = `${hrs}h ${mins}m ${secs}s`;

        const end = new Date();
        const start = new Date(end.getTime() - swTime);

        const pad = n => String(n).padStart(2, '0');
        const formatICSDate = d => {
            return d.getUTCFullYear() +
                pad(d.getUTCMonth() + 1) +
                pad(d.getUTCDate()) + 'T' +
                pad(d.getUTCHours()) +
                pad(d.getUTCMinutes()) +
                pad(d.getUTCSeconds()) + 'Z';
        };

        let laps = [];
        $('#laps-list li').each(function () { laps.push($(this).text()); });
        let desc = `Time recorded using Activity Stopwatch: ${timeStr}\\n` + (laps.length > 0 ? `\\nLaps:\\n${laps.join('\\n')}` : '');

        const icsContent = "BEGIN:VCALENDAR\r\n" +
            "VERSION:2.0\r\n" +
            "PRODID:-//Sitraka Portfolio//Activity Stopwatch//EN\r\n" +
            "BEGIN:VEVENT\r\n" +
            "DTSTART:" + formatICSDate(start) + "\r\n" +
            "DTEND:" + formatICSDate(end) + "\r\n" +
            "SUMMARY:" + evtName + "\r\n" +
            "DESCRIPTION:" + desc + "\r\n" +
            "END:VEVENT\r\n" +
            "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = evtName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Stopwatch log exported to calendar!", "success");
    });

    // 4. To-Do List Maker
    function getTodos() {
        return JSON.parse(localStorage.getItem('todoListItems') || '[]');
    }
    function saveTodos(todos) {
        localStorage.setItem('todoListItems', JSON.stringify(todos));
    }
    function updateTodoStats() {
        const todos = getTodos();
        const total = todos.length;
        const done = todos.filter(t => t.done).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        $('#todo-stats-text').text(`${done} of ${total} tasks completed`);
        $('#todo-stats-pct').text(`${pct}%`);
        $('#todo-progress-fill').css('width', pct + '%');
    }
    function renderTodos() {
        const todos = getTodos();
        const container = document.getElementById('todo-task-list');
        if (!container) return;
        container.innerHTML = '';
        if (todos.length === 0) {
            container.innerHTML = '<div class="todo-empty"><i class="fas fa-clipboard-list" style="font-size:2rem; display:block; margin-bottom:0.8rem; opacity:0.3;"></i>No tasks yet — add one above!</div>';
            updateTodoStats();
            return;
        }
        todos.forEach((t, i) => {
            let metaHtml = '';
            if (t.date) metaHtml += `<span><i class="fas fa-calendar" style="margin-right:3px;"></i>${t.date}</span>`;
            if (t.timeStart) metaHtml += `<span><i class="fas fa-clock" style="margin-right:3px;"></i>${t.timeStart}${t.timeEnd ? ' – ' + t.timeEnd : ''}</span>`;
            const safeText = document.createElement('span');
            safeText.textContent = t.text;

            const row = document.createElement('div');
            row.className = 'todo-item' + (t.done ? ' checked' : '');
            row.innerHTML = `
                <div class="todo-checkbox${t.done ? ' checked' : ''}" aria-label="${t.done ? 'Mark pending' : 'Mark done'}"></div>
                <div style="flex:1; min-width:0;">
                    <div class="todo-text">${safeText.innerHTML}</div>
                    ${metaHtml ? '<div class="todo-meta">' + metaHtml + '</div>' : ''}
                </div>
                <button class="todo-delete" type="button" aria-label="Delete pending action"><i class="fas fa-trash-alt"></i></button>
            `;
            container.appendChild(row);

            // Bind checkbox click directly
            row.querySelector('.todo-checkbox').addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                const items = getTodos();
                items[i].done = !items[i].done;
                saveTodos(items);
                renderTodos();
            });

            // Bind delete click directly
            row.querySelector('.todo-delete').addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                const items = getTodos();
                items.splice(i, 1);
                saveTodos(items);
                renderTodos();
            });
        });
        updateTodoStats();
    }
    
    // Set default date to today
    const dateInput = $('#todo-date-input');
    if(dateInput.length) {
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.val(todayStr);
    }

    if ($('#todo-task-list').length) renderTodos();

    $('#todo-add-btn').click(function () {
        const text = $('#todo-task-input').val().trim();
        if (!text) return;
        const todos = getTodos();
        todos.push({
            text: text,
            date: $('#todo-date-input').val() || '',
            timeStart: $('#todo-time-start').val() || '',
            timeEnd: $('#todo-time-end').val() || '',
            done: false
        });
        saveTodos(todos);
        $('#todo-task-input').val('');
        renderTodos();
    });
    $('#todo-task-input').keypress(function (e) { if (e.which === 13) $('#todo-add-btn').click(); });

    $('#todo-clear-btn').click(function () {
        if (getTodos().length === 0) return;
        if (!confirm('Clear all tasks?')) return;
        localStorage.removeItem('todoListItems');
        renderTodos();
    });
    $('#todo-copy-btn').click(function () {
        const todos = getTodos();
        if (todos.length === 0) {
            showToast('No tasks to copy!', 'warning');
            return;
        }
        const lines = todos.map(t => {
            let line = (t.done ? '☑' : '☐') + ' ' + t.text;
            if (t.date) line += ` (${t.date}${t.timeStart ? ' ' + t.timeStart : ''}${t.timeEnd ? '-' + t.timeEnd : ''})`;
            return line;
        });
        const text = 'To-Do List:\\n' + lines.join('\\n');
        navigator.clipboard.writeText(text).then(() => {
            const btn = $(this);
            const old = btn.html();
            btn.html('<i class="fas fa-check" style="margin-right:0.5rem;"></i>Copied!');
            showToast('List copied to clipboard!', 'success');
            setTimeout(() => btn.html(old), 2000);
        });
    });

    // Export to .ics for Google Calendar
    $('#todo-export-ics').click(function () {
        const todos = getTodos();
        if (todos.length === 0) {
            showToast('Add some tasks first!', 'warning');
            return;
        }

        const pad = n => String(n).padStart(2, '0');
        const fmtICS = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
        const uid = () => 'todo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);

        let events = '';
        todos.forEach(t => {
            const dateStr = t.date || new Date().toISOString().split('T')[0];
            const startTime = t.timeStart || '09:00';
            const endTime = t.timeEnd || (function () {
                const [h, m] = startTime.split(':').map(Number);
                return pad(Math.min(h + 1, 23)) + ':' + pad(m);
            })();

            const dtStart = new Date(dateStr + 'T' + startTime + ':00');
            const dtEnd = new Date(dateStr + 'T' + endTime + ':00');
            const status = t.done ? 'COMPLETED' : 'NEEDS-ACTION';

            events += 'BEGIN:VEVENT\r\n' +
                'UID:' + uid() + '@sitraka-todo\r\n' +
                'DTSTAMP:' + fmtICS(new Date()) + '\r\n' +
                'DTSTART:' + fmtICS(dtStart) + '\r\n' +
                'DTEND:' + fmtICS(dtEnd) + '\r\n' +
                'SUMMARY:' + (t.done ? '✅ ' : '') + t.text + '\r\n' +
                'DESCRIPTION:Status: ' + (t.done ? 'Done' : 'Pending') + '\r\n' +
                'STATUS:' + (t.done ? 'CONFIRMED' : 'TENTATIVE') + '\r\n' +
                'END:VEVENT\r\n';
        });

        const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sitraka Portfolio//To-Do List//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n' + events + 'END:VCALENDAR';

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'todo_list_' + new Date().toISOString().split('T')[0] + '.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const btn = $(this);
        const old = btn.html();
        btn.html('<i class="fas fa-check" style="margin-right:0.5rem;"></i>Downloaded!');
        showToast('To-Do list exported as .ics calendar file!', 'success');
        setTimeout(() => btn.html(old), 2500);
    });

    // ── Reset All Tools ──
    $('#reset-all-tools-btn').click(function () {
        if (!confirm('Reset ALL tools to their initial state? This will clear your to-do list, stopwatch, laps, and name picker.')) return;
        // Reset To-Do List
        localStorage.removeItem('todoListItems');
        renderTodos();
        // Reset Pomodoro
        clearInterval(pomoInterval);
        pomoInterval = null;
        isFocus = true;
        pomoSessionCount = 0;
        $('#pomo-session-count').text(0);
        const _d = getPomoDurations();
        pomoTotalTime = _d.focus;
        pomoTimeLeft  = pomoTotalTime;
        $('#pomodoro-status').text('Focus Time');
        pomoRingColor(true);
        document.title = pomoOrigTitle;
        updatePomoDisplay();
        // Reset Stopwatch
        clearInterval(swInterval);
        swInterval = null;
        swTime = 0;
        swLapCount = 1;
        $('#stopwatch-display').text('00:00:00.00');
        $('#laps-list').empty();
        $('#stopwatch-event-name').val('');
        // Reset Name Picker
        $('#name-picker-input').val('');
        $('#name-picker-result').text('');
        // Feedback
        const btn = $(this);
        const old = btn.html();
        btn.html('<i class="fas fa-check" style="margin-right:0.5rem;"></i>All Reset!');
        showToast('All tools have been reset to their initial state.', 'success');
        setTimeout(() => btn.html(old), 2500);
    });

    // 5. Deep Search
    const searchData = [];
    setTimeout(() => {
        $('#main article').each(function () {
            const id = $(this).attr('id');
            if (['intro', 'work', 'code', 'luxaiops'].includes(id)) {
                const title = $(this).find('h2.major').text();
                let content = $(this).text().replace(/\\s+/g, ' ').trim();
                searchData.push({ id, title, content });
            }
        });
    }, 500);

    $('#deep-search-input').on('input', function () {
        const query = $(this).val().toLowerCase();
        const resContainer = $('#deep-search-results');
        resContainer.empty();

        if (query.length < 2) {
            resContainer.html('<p style="text-align:center; color: #a78bfa;">Start typing to search...</p>');
            return;
        }

        let results = 0;
        searchData.forEach(item => {
            if (item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query)) {
                results++;
                // Find snippet
                let snippet = '';
                const matchIdx = item.content.toLowerCase().indexOf(query);
                if (matchIdx !== -1) {
                    const start = Math.max(0, matchIdx - 40);
                    const end = Math.min(item.content.length, matchIdx + query.length + 40);
                    snippet = "..." + item.content.substring(start, end) + "...";
                    const regex = new RegExp(`(${query})`, "gi");
                    snippet = snippet.replace(regex, `<span style="background: rgba(123,47,255,0.4); color:#fff; font-weight:bold;">$1</span>`);
                } else {
                    snippet = item.content.substring(0, 100) + "...";
                }

                resContainer.append(`
                    <a href="#${item.id}" class="skill-card" style="text-align:left; align-items:flex-start; text-decoration:none; display:block; padding: 1.5rem; width:100%; box-sizing:border-box;">
                        <span style="font-size: 1.1rem; color: #ffffff; font-weight:bold; margin-bottom:0.5rem; display:block;">${item.title}</span>
                        <p style="font-size:0.85rem; color:#d8b4fe; margin:0; line-height:1.4;">${snippet}</p>
                    </a>
                `);
            }
        });

        if (results === 0) {
            resContainer.html('<p style="text-align:center; color: #ef4444;">No results found.</p>');
        }
    });
});
