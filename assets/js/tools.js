/* =========================================
   tools.js
   Vanilla JS implementation of Featured Tools
   Performance optimized and decoupled
========================================= */

document.addEventListener('DOMContentLoaded', () => {

	/* ---- 1. Compound Interest Calculator ---- */
	const calcBtn = document.getElementById('calculate');
	if (calcBtn) {
		calcBtn.addEventListener('click', () => {
			const principal = parseFloat(document.getElementById('principal').value);
			const rate = parseFloat(document.getElementById('rate').value) / 100;
			const time = parseFloat(document.getElementById('time').value);
			const n = parseFloat(document.getElementById('compounds').value);
			const amount = principal * Math.pow(1 + rate / n, n * time);
			const interest = amount - principal;
			const resHTML = `<p><strong>Final Amount:</strong> $${amount.toFixed(2)}</p><p><strong>Interest Earned:</strong> $${interest.toFixed(2)}</p>`;
			document.getElementById('result').innerHTML = resHTML;
		});
	}

	/* ---- 2. Pomodoro Timer (Delta Time Approach) ---- */
	let pomoInterval = null;
	let isFocus = true; // true = 25m, false = 5m
	let targetTime = 0; // The timestamp when timer should end
	let timeLeft = 25 * 60; // seconds remaining

	const pomoDisplay = document.getElementById('pomodoro-display');
	const pomoStatus = document.getElementById('pomodoro-status');

	function formatPomo(seconds) {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
	}

	const btnPomoStart = document.getElementById('pomodoro-start');
	if (btnPomoStart) {
		btnPomoStart.addEventListener('click', () => {
			if (pomoInterval) return;
			// Calculate target end time based on current time + remaining time
			targetTime = Date.now() + (timeLeft * 1000);

			pomoInterval = setInterval(() => {
				const now = Date.now();
				const remainingMs = targetTime - now;

				if (remainingMs > 0) {
					timeLeft = remainingMs / 1000;
					pomoDisplay.textContent = formatPomo(timeLeft);
				} else {
					clearInterval(pomoInterval);
					pomoInterval = null;
					isFocus = !isFocus;
					timeLeft = isFocus ? 25 * 60 : 5 * 60;
					pomoStatus.textContent = isFocus ? 'Focus Time' : 'Break Time';
					pomoDisplay.textContent = formatPomo(timeLeft);

					// Attempt to play a sound or alert
					const msg = isFocus ? "Break's over! Back to work!" : "Pomodoro finished! Take a 5 min break.";
					if (window.Notification && Notification.permission === "granted") {
						new Notification(msg);
					} else {
						alert(msg);
					}
				}
			}, 100); // Check every 100ms for smoothness and to prevent drift
		});

		document.getElementById('pomodoro-pause').addEventListener('click', () => {
			clearInterval(pomoInterval);
			pomoInterval = null;
		});

		document.getElementById('pomodoro-reset').addEventListener('click', () => {
			clearInterval(pomoInterval);
			pomoInterval = null;
			isFocus = true;
			timeLeft = 25 * 60;
			pomoStatus.textContent = 'Focus Time';
			pomoDisplay.textContent = formatPomo(timeLeft);
		});
	}

	/* ---- 3. Random Name Picker ---- */
	const btnNamePicker = document.getElementById('name-picker-btn');
	if (btnNamePicker) {
		btnNamePicker.addEventListener('click', () => {
			const inputText = document.getElementById('name-picker-input').value;
			const names = inputText.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
			const resultDiv = document.getElementById('name-picker-result');

			if (names.length === 0) {
				resultDiv.textContent = 'Please enter some names!';
				return;
			}

			let count = 0;
			let interval = setInterval(() => {
				const rand = names[Math.floor(Math.random() * names.length)];
				resultDiv.textContent = rand;
				count++;
				if (count > 15) {
					clearInterval(interval);
					resultDiv.style.color = '#a78bfa';
					setTimeout(() => resultDiv.style.color = '#00c9ff', 300);
				}
			}, 50);
		});
	}

	/* ---- 4. Activity Stopwatch ---- */
	let swInterval = null;
	let swTime = 0;
	let swStart = 0;
	let swLapCount = 1;

	const swDisplay = document.getElementById('stopwatch-display');
	const swLapsList = document.getElementById('laps-list');

	function formatSWTime(ms) {
		const date = new Date(ms);
		const h = String(date.getUTCHours()).padStart(2, '0');
		const m = String(date.getUTCMinutes()).padStart(2, '0');
		const s = String(date.getUTCSeconds()).padStart(2, '0');
		const cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
		return `${h}:${m}:${s}.${cs}`;
	}

	const btnSwStart = document.getElementById('stopwatch-start');
	if (btnSwStart) {
		btnSwStart.addEventListener('click', () => {
			if (swInterval) return;
			swStart = Date.now() - swTime;
			swInterval = setInterval(() => {
				swTime = Date.now() - swStart;
				swDisplay.textContent = formatSWTime(swTime);
			}, 10);
		});

		document.getElementById('stopwatch-stop').addEventListener('click', () => {
			clearInterval(swInterval);
			swInterval = null;
		});

		document.getElementById('stopwatch-lap').addEventListener('click', () => {
			if (!swInterval) return;
			const li = document.createElement('li');
			li.textContent = `Lap ${swLapCount}: ${formatSWTime(swTime)}`;
			swLapsList.prepend(li);
			swLapCount++;
		});

		document.getElementById('stopwatch-reset').addEventListener('click', () => {
			clearInterval(swInterval);
			swInterval = null;
			swTime = 0;
			swLapCount = 1;
			swDisplay.textContent = '00:00:00.00';
			swLapsList.innerHTML = '';
		});
	}

	/* ---- 5. Progress Report ---- */
	const taskListUl = document.getElementById('progress-task-list');
	function loadTasks() {
		if (!taskListUl) return;
		const tasks = JSON.parse(localStorage.getItem('progressTasks') || '[]');
		taskListUl.innerHTML = '';

		tasks.forEach((t, i) => {
			const li = document.createElement('li');
			li.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:8px;";
			li.innerHTML = `
				<span><i class="fas fa-check-circle" style="color:#10b981; margin-right:0.5rem;"></i>${t}</span>
				<button class="remove-task" data-idx="${i}" style="background:none; box-shadow:none; padding:0; height:auto; line-height:1; border:none; color:#ef4444;"><i class="fas fa-times"></i></button>
			`;
			taskListUl.appendChild(li);
		});
	}

	if (taskListUl) {
		loadTasks();

		const btnAdd = document.getElementById('progress-add-btn');
		const inputTask = document.getElementById('progress-task-input');

		btnAdd.addEventListener('click', () => {
			const t = inputTask.value.trim();
			if (t) {
				const tasks = JSON.parse(localStorage.getItem('progressTasks') || '[]');
				tasks.push(t);
				localStorage.setItem('progressTasks', JSON.stringify(tasks));
				inputTask.value = '';
				loadTasks();
			}
		});

		inputTask.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') btnAdd.click();
		});

		taskListUl.addEventListener('click', (e) => {
			const btn = e.target.closest('.remove-task');
			if (btn) {
				const tasks = JSON.parse(localStorage.getItem('progressTasks') || '[]');
				tasks.splice(btn.getAttribute('data-idx'), 1);
				localStorage.setItem('progressTasks', JSON.stringify(tasks));
				loadTasks();
			}
		});

		document.getElementById('progress-clear-btn').addEventListener('click', () => {
			localStorage.removeItem('progressTasks');
			loadTasks();
		});

		const btnCopy = document.getElementById('progress-copy-btn');
		btnCopy.addEventListener('click', () => {
			const tasks = JSON.parse(localStorage.getItem('progressTasks') || '[]');
			if (tasks.length === 0) return alert("No tasks to copy!");
			const text = "Daily Progress Report:\n" + tasks.map(t => "- " + t).join("\n");
			navigator.clipboard.writeText(text).then(() => {
				const oldHtml = btnCopy.innerHTML;
				btnCopy.innerHTML = '<i class="fas fa-check" style="margin-right:0.5rem;"></i>Copied!';
				setTimeout(() => btnCopy.innerHTML = oldHtml, 2000);
			});
		});
	}

	/* ---- 6. Deep Search (Powered by Fuse.js) ---- */
	const searchInput = document.getElementById('deep-search-input');
	const searchResults = document.getElementById('deep-search-results');

	if (searchInput && searchResults) {
		const searchData = [];
		// Gather indexable data
		setTimeout(() => {
			document.querySelectorAll('#main article').forEach(article => {
				const id = article.id;
				if (['intro', 'work', 'code', 'luxaiops'].includes(id)) {
					const titleEl = article.querySelector('h2.major');
					if (titleEl) {
						const title = titleEl.textContent;
						const content = article.textContent.replace(/\s+/g, ' ').trim();
						searchData.push({ id, title, content });
					}
				}
			});
		}, 500); // Give time for DOM structure to settle

		let fuse;
		setTimeout(() => {
			if (window.Fuse) {
				fuse = new Fuse(searchData, {
					keys: ['title', 'content'],
					includeMatches: true,
					threshold: 0.3, // allows fuzzy matching
					distance: 1000
				});
			}
		}, 1000);

		searchInput.addEventListener('input', (e) => {
			const query = e.target.value;
			searchResults.innerHTML = '';

			if (query.length < 2) {
				searchResults.innerHTML = '<p style="text-align:center; color: #a78bfa;">Start typing to search...</p>';
				return;
			}

			if (!fuse) {
				searchResults.innerHTML = '<p style="text-align:center; color: #ef4444;">Search engine loading...</p>';
				return;
			}

			const results = fuse.search(query);

			if (results.length === 0) {
				searchResults.innerHTML = '<p style="text-align:center; color: #ef4444;">No results found.</p>';
				return;
			}

			results.forEach(res => {
				const item = res.item;
				let snippet = '';

				// Attempt to extract snippet from match using Fuse's match indices
				if (res.matches && res.matches.length > 0) {
					const contentMatch = res.matches.find(m => m.key === 'content');
					if (contentMatch) {
						const firstMatch = contentMatch.indices[0];
						const start = Math.max(0, firstMatch[0] - 40);
						const end = Math.min(item.content.length, firstMatch[1] + 40);
						snippet = "..." + item.content.substring(start, end) + "...";

						// Very basic highlight of the first exact word occurrence or close to it
						const qRegex = new RegExp(`(${query})`, "gi");
						snippet = snippet.replace(qRegex, `<span style="background: rgba(123,47,255,0.4); color:#fff; font-weight:bold;">$1</span>`);
					} else {
						snippet = item.content.substring(0, 100) + "...";
					}
				} else {
					snippet = item.content.substring(0, 100) + "...";
				}

				const a = document.createElement('a');
				a.href = `#${item.id}`;
				a.className = "skill-card";
				a.style.cssText = "text-align:left; align-items:flex-start; text-decoration:none; display:block; padding: 1.5rem; width:100%; box-sizing:border-box;";
				a.innerHTML = `
					<span style="font-size: 1.1rem; color: #ffffff; font-weight:bold; margin-bottom:0.5rem; display:block;">${item.title}</span>
					<p style="font-size:0.85rem; color:#d8b4fe; margin:0; line-height:1.4;">${snippet}</p>
				`;
				// Setup direct hash navigation to hook into Dimension framework
				a.addEventListener('click', () => {
					window.location.hash = item.id;
				});

				searchResults.appendChild(a);
			});
		});
	}
});
