/**
 * APP.JS – Hauptanwendungslogik
 *
 * Verantwortlich für:
 *  - Screen-Management & Navigation
 *  - QR-Code URL-Parameter
 *  - Rendering aller 6 Fragetypen
 *  - Punkte, Fortschritt, Abschluss
 *  - Dark-Mode-Toggle
 */

// ── Globaler Spielzustand ──────────────────────────────────
let progress       = null;
let currentStation = null;
let qIdx           = 0;      // aktueller Frage-Index in der Station
let stationPts     = 0;
let stationOK      = 0;
let stationTotal   = 0;

// Story-State
let storyResults = [];   // 'good' | 'bad' pro Entscheidung
let currentStoryScene = null;

// ── DOM-Refs ───────────────────────────────────────────────
const S = {
    start:    document.getElementById('start-screen'),
    stations: document.getElementById('stations-screen'),
    station:  document.getElementById('station-screen'),
    finish:   document.getElementById('finish-screen')
};
const M = {
    feedback: document.getElementById('feedback-modal'),
    letter:   document.getElementById('letter-modal')
};

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkURL();
    progress = Storage.getProgress();
    updateStartButtons();
    registerListeners();
});

// ── Theme (Dark Mode) ─────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('md_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
}
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('md_theme', theme);
    const icon = theme === 'dark' ? '☀️' : '🌙';
    document.querySelectorAll('.theme-toggle .theme-icon').forEach(el => el.textContent = icon);
    document.querySelectorAll('.theme-toggle-small').forEach(el => el.textContent = icon);
}
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── URL-Parameter für QR-Simulation ───────────────────────
function checkURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('station');
    if (id && getStationById(id)) {
        Storage.unlock(id);
        Storage.markStarted();
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => {
            showScreen('stations');
            toast(`Station "${getStationById(id).name}" freigeschaltet!`, 'success');
        }, 200);
    }
}

// ── Start-Buttons ──────────────────────────────────────────
function updateStartButtons() {
    const hasProg = Storage.hasProgress();
    document.getElementById('continue-btn').style.display = hasProg ? 'flex' : 'none';
    document.getElementById('reset-btn').style.display    = hasProg ? 'flex' : 'none';
}

// ── Event Listeners ────────────────────────────────────────
function registerListeners() {
    // Theme
    document.querySelectorAll('.theme-toggle, .theme-toggle-small').forEach(btn =>
        btn.addEventListener('click', toggleTheme));

    // Start
    document.getElementById('start-btn').addEventListener('click', () => {
        Storage.markStarted();
        showScreen('stations');
    });
    document.getElementById('continue-btn').addEventListener('click', () => showScreen('stations'));
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Fortschritt wirklich zurücksetzen?')) {
            Storage.reset();
            progress = Storage.getProgress();
            updateStartButtons();
            toast('Fortschritt zurückgesetzt');
        }
    });

    // Navigation
    document.getElementById('back-to-start').addEventListener('click', () => showScreen('start'));
    document.getElementById('back-to-stations').addEventListener('click', () => {
        if (confirm('Station verlassen? Dein Fortschritt in dieser Station geht verloren.')) {
            showScreen('stations');
        }
    });

    // QR Simulator
    const qrSubmit = document.getElementById('qr-submit');
    const qrInput  = document.getElementById('qr-input');
    qrSubmit.addEventListener('click', handleQR);
    qrInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleQR(); });

    // Modals
    document.getElementById('feedback-continue').addEventListener('click', () => {
        closeModal('feedback');
        nextQuestion();
    });
    document.getElementById('letter-continue').addEventListener('click', () => {
        closeModal('letter');
        showScreen('stations');
    });
    // Modal backdrop clicks
    document.querySelectorAll('.modal-backdrop').forEach(bd =>
        bd.addEventListener('click', () => {/* intentionally no close on backdrop for accessibility */}));

    // Finish
    document.getElementById('restart-btn').addEventListener('click', () => {
        Storage.reset();
        progress = Storage.getProgress();
        updateStartButtons();
        showScreen('start');
    });
    document.getElementById('share-btn').addEventListener('click', shareResults);
}

// ── QR Handler ─────────────────────────────────────────────
function handleQR() {
    const val = document.getElementById('qr-input').value.trim().toLowerCase();
    if (!val) return;
    const station = getStationById(val);
    if (!station) {
        toast('Unbekannter Code', 'error');
        return;
    }
    if (progress.completedStations.includes(val)) {
        toast('Diese Station ist bereits abgeschlossen ✓', 'info');
        return;
    }
    progress = Storage.unlock(val);
    document.getElementById('qr-input').value = '';
    renderStationsOverview();
    toast(`"${station.name}" freigeschaltet!`, 'success');
}

// ── Screen Management ──────────────────────────────────────
function showScreen(name) {
    Object.values(S).forEach(s => s.classList.remove('active'));
    S[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'stations') renderStationsOverview();
    if (name === 'finish')   renderFinish();
}

// ── Stations Overview ──────────────────────────────────────
function renderStationsOverview() {
    progress = Storage.getProgress();
    const done  = progress.completedStations.length;
    const total = STATIONS.length;

    document.getElementById('progress-fill').style.width = `${(done / total) * 100}%`;
    document.getElementById('completed-count').textContent = done;
    document.getElementById('total-count').textContent     = total;
    document.getElementById('header-points').textContent   = `${progress.totalPoints} ⭐`;

    renderLetters();

    const list = document.getElementById('stations-list');
    list.innerHTML = '';
    STATIONS.forEach(st => {
        const unlocked  = progress.unlockedStations.includes(st.id);
        const completed = progress.completedStations.includes(st.id);
        const card = document.createElement('div');
        card.className = `station-card ${completed ? 'completed' : unlocked ? 'unlocked' : 'locked'}`;
        card.setAttribute('role', 'listitem');
        let statusText = '🔒 QR-Code scannen';
        let badge = '🔒';
        if (completed) { statusText = '✓ Abgeschlossen'; badge = '✓'; }
        else if (unlocked) { statusText = '▶ Starten'; badge = '▶'; }

        card.innerHTML = `
            <div class="station-card-badge">${badge}</div>
            <div class="station-card-icon">${st.icon}</div>
            <div class="station-card-name">${st.name}</div>
            <div class="station-card-status">${statusText}</div>
        `;
        if (unlocked && !completed) {
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${st.name} starten`);
            card.addEventListener('click', () => startStation(st.id));
            card.addEventListener('keypress', e => { if (e.key === 'Enter') startStation(st.id); });
        }
        list.appendChild(card);
    });

    if (done === total && total > 0) setTimeout(() => showScreen('finish'), 400);
}

function renderLetters() {
    const container = document.getElementById('collected-letters');
    container.innerHTML = '';
    for (let i = 0; i < SOLUTION_WORD.length; i++) {
        const span = document.createElement('span');
        span.className = 'letter-slot' + (progress.collectedLetters[i] ? ' revealed' : '');
        span.textContent = progress.collectedLetters[i] || '?';
        span.setAttribute('aria-label', progress.collectedLetters[i] ? `Buchstabe ${progress.collectedLetters[i]}` : 'Noch unbekannt');
        container.appendChild(span);
    }
}

// ── Start Station ──────────────────────────────────────────
function startStation(id) {
    currentStation = getStationById(id);
    if (!currentStation) return;
    qIdx         = 0;
    stationPts   = 0;
    stationOK    = 0;
    stationTotal = 0;
    storyResults = [];
    currentStoryScene = null;

    document.getElementById('station-title').textContent = currentStation.name;
    showScreen('station');
    showStationIntro();
}

function showStationIntro() {
    const intro = document.getElementById('station-intro');
    const qc    = document.getElementById('question-container');
    intro.style.display = 'block';
    qc.innerHTML = '';
    intro.innerHTML = `
        <div class="intro-label">Einführung</div>
        <p>${currentStation.intro}</p>
        <div class="station-intro-actions">
            <button class="btn btn-primary" id="intro-start-btn">Los geht's!</button>
        </div>
    `;
    document.getElementById('intro-start-btn').addEventListener('click', () => {
        intro.style.display = 'none';
        renderQuestion();
    });
    updateStationProgress();
}

function updateStationProgress() {
    document.getElementById('station-progress').textContent =
        `${qIdx + 1}/${currentStation.questions.length}`;
}

// ── Question Routing ───────────────────────────────────────
function renderQuestion() {
    if (qIdx >= currentStation.questions.length) { completeStation(); return; }
    updateStationProgress();
    const q = currentStation.questions[qIdx];
    const qc = document.getElementById('question-container');
    qc.innerHTML = '';

    switch (q.type) {
        case 'multiple-choice': renderMultipleChoice(q, qc); break;
        case 'image-analysis':  renderImageAnalysis(q, qc);  break;
        case 'card-sort':       renderCardSort(q, qc);       break;
        case 'detective':       renderDetective(q, qc);      break;
        case 'comparison':      renderComparison(q, qc);     break;
        case 'seek-find':       renderSeekFind(q, qc);       break;
        case 'story':           renderStory(q, qc);          break;
        case 'reflection':      renderReflection(q, qc);     break;
        default: nextQuestion();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── MULTIPLE CHOICE ────────────────────────────────────────
function renderMultipleChoice(q, container) {
    const letters = ['A', 'B', 'C', 'D'];
    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">📝 Frage</span>
            <div class="question-visual">${q.visual || '❓'}</div>
            <p class="question-text">${q.question}</p>
            <div class="options-list" role="list">
                ${q.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}" role="listitem"
                            aria-label="Option ${letters[i]}: ${opt}">
                        <span class="option-letter">${letters[i]}</span>
                        <span>${opt}</span>
                    </button>`).join('')}
            </div>
        </div>`;

    container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sel = parseInt(btn.dataset.index);
            const ok  = sel === q.correctIndex;
            container.querySelectorAll('.option-btn').forEach((b, i) => {
                b.disabled = true;
                if (i === q.correctIndex) b.classList.add('correct');
                else if (i === sel && !ok) b.classList.add('incorrect');
            });
            if (ok) { stationPts += q.points; stationOK++; }
            stationTotal++;
            setTimeout(() => showFeedback(ok, q.explanation, ok ? q.points : 0), 400);
        });
    });
}

// ── IMAGE ANALYSIS (Station 1) ─────────────────────────────
function renderImageAnalysis(q, container) {
    const foundSet = new Set();

    const targetsHTML = q.targets.map(t =>
        `<span class="analysis-target-chip" id="chip-${t.id}">
            <span class="chip-dot"></span>${t.label}
        </span>`).join('');

    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">🖱️ Bildanalyse</span>
            <p class="question-text">${q.instruction}</p>
            <p class="hotspot-hint">Klicke auf die markierten Bereiche im Plakat ↓</p>
            <div class="image-analysis-area">
                ${buildPropagandaPosterSVG(q)}
            </div>
            <div class="analysis-targets">${targetsHTML}</div>
            <button class="btn btn-primary btn-block" id="analysis-done-btn" style="display:none">
                Weiter (${q.minToPass} von ${q.targets.length} gefunden)
            </button>
        </div>`;

    const area = container.querySelector('.image-analysis-area');
    area.querySelectorAll('.hotspot').forEach(hs => {
        hs.addEventListener('click', () => {
            const id = hs.dataset.id;
            if (foundSet.has(id)) return;
            const target = q.targets.find(t => t.id === id);
            foundSet.add(id);
            hs.classList.add('found');
            const chip = container.querySelector(`#chip-${id}`);
            if (chip) chip.classList.add('found');
            toast(`✓ ${target.label}`, 'success');

            if (foundSet.size >= q.minToPass) {
                const doneBtn = container.querySelector('#analysis-done-btn');
                doneBtn.style.display = 'block';
                doneBtn.textContent = `Weiter (${foundSet.size}/${q.targets.length} gefunden)`;
            }
            if (foundSet.size === q.targets.length) {
                stationPts += q.pointsPerTarget * q.targets.length;
                stationOK++;
                stationTotal++;
                setTimeout(() => showFeedback(true,
                    'Ausgezeichnet! Du hast alle Propagandamittel entlarvt.', stationPts), 500);
            }
        });
    });

    container.querySelector('#analysis-done-btn')?.addEventListener('click', () => {
        const pts = foundSet.size * q.pointsPerTarget;
        stationPts += pts;
        stationOK++;
        stationTotal++;
        showFeedback(true, `Du hast ${foundSet.size} von ${q.targets.length} Elementen gefunden.`, pts);
    });
}

function buildPropagandaPosterSVG(q) {
    // Fiktives Propagandaplakat als SVG
    const hotspotsHTML = q.targets.map(t =>
        `<div class="hotspot" data-id="${t.id}"
              style="left:${t.x}%;top:${t.y}%;transform:translate(-50%,-50%)"
              role="button" tabindex="0"
              aria-label="Bereich anklicken: ${t.label}"
              title="${t.label}"></div>`).join('');

    return `
    <div class="propaganda-poster" style="min-height:280px;background:linear-gradient(160deg,#8b1a1a,#2a1a0a);color:#fff;position:relative">
        <!-- Hintergrund-Muster -->
        <svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;opacity:.15">
            <pattern id="stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#fff" stroke-width="1"/>
            </pattern>
            <rect width="340" height="280" fill="url(#stripes)"/>
        </svg>
        <!-- Poster-Inhalt -->
        <div style="position:relative;text-align:center;padding:16px;width:100%">
            <!-- Nationalfarben-Banner (oben rechts) -->
            <div style="position:absolute;top:8px;right:8px;display:flex;gap:2px">
                <div style="width:12px;height:36px;background:#000"></div>
                <div style="width:12px;height:36px;background:#c00"></div>
                <div style="width:12px;height:36px;background:#ffce00"></div>
            </div>
            <!-- Feindliches Konterfei (links) -->
            <div style="position:absolute;left:10%;top:20%;font-size:2.5rem;filter:grayscale(1) contrast(2);opacity:.7">👺</div>
            <!-- Zentrales Faust-Symbol -->
            <div style="font-size:4.5rem;margin:20px 0 12px;text-shadow:0 4px 12px rgba(0,0,0,.5)">✊</div>
            <!-- Slogan -->
            <div style="font-family:serif;font-weight:900;font-size:1.1rem;letter-spacing:.05em;text-shadow:2px 2px 4px rgba(0,0,0,.8);padding:0 20%">
                EIN VOLK · EIN REICH · EIN FÜHRER
            </div>
            <div style="font-size:.75rem;margin-top:8px;opacity:.7;letter-spacing:.15em">VOLKSPARTEI DER ZUKUNFT</div>
        </div>
        <!-- Klickbare Hotspots -->
        ${hotspotsHTML}
    </div>`;
}

// ── CARD SORT (Station 2) ──────────────────────────────────
function renderCardSort(q, container) {
    let selectedCard = null;
    let sortedCount  = 0;
    const results    = {};

    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">🃏 Sortieraufgabe</span>
            <p class="question-text">Sortiere die Aussagen in die richtigen Kategorien</p>
            <div class="drag-intro">${q.instruction}</div>

            <div style="margin-bottom:16px">
                <div class="section-label" style="margin-bottom:8px">Aussagen</div>
                <div id="cards-pool">
                    ${q.cards.map(c => `
                        <div class="drag-card" id="card-${c.id}" data-id="${c.id}" tabindex="0"
                             role="button" aria-label="Aussage: ${c.text}">
                            ${c.text}
                        </div>`).join('')}
                </div>
            </div>

            <div class="section-label" style="margin-bottom:8px">Kategorien</div>
            <div class="drag-categories" id="categories-grid">
                ${q.categories.map(cat => `
                    <div class="drop-zone" id="zone-${cat.id}" data-cat="${cat.id}"
                         role="region" aria-label="Kategorie: ${cat.label}">
                        <div class="drop-zone-label" style="color:${cat.color}">${cat.label}</div>
                        <div class="drop-zone-items" id="items-${cat.id}">
                            <div class="drop-placeholder">Tippe auf eine Aussage, dann hier</div>
                        </div>
                    </div>`).join('')}
            </div>

            <div id="sort-result" style="margin-top:16px"></div>
        </div>`;

    // Card click → select
    container.querySelectorAll('.drag-card').forEach(card => {
        const activate = () => {
            container.querySelectorAll('.drag-card').forEach(c => c.style.outline = '');
            selectedCard = card.dataset.id;
            card.style.outline = '3px solid var(--color-primary)';
        };
        card.addEventListener('click', activate);
        card.addEventListener('keypress', e => { if (e.key === 'Enter') activate(); });
    });

    // Zone click → assign
    container.querySelectorAll('.drop-zone').forEach(zone => {
        const assign = () => {
            if (!selectedCard) { toast('Bitte zuerst eine Aussage auswählen', 'info'); return; }
            const cardData = q.cards.find(c => c.id === selectedCard);
            const catId    = zone.dataset.cat;
            const isOK     = cardData.correctCategory === catId;
            results[selectedCard] = isOK;

            const cardEl = container.querySelector(`#card-${selectedCard}`);
            if (cardEl) {
                cardEl.classList.add(isOK ? 'correct' : 'incorrect');
                cardEl.style.outline = '';
                cardEl.removeAttribute('tabindex');
                cardEl.style.cursor  = 'default';
                // Move card to zone
                const itemsArea = zone.querySelector('.drop-zone-items');
                itemsArea.querySelector('.drop-placeholder')?.remove();
                itemsArea.appendChild(cardEl);
            }

            if (isOK) { stationPts += q.pointsPerCard; stationOK++; }
            else toast(`Nicht ganz – "${cardData.text.substring(0,30)}…" gehört zu: ${q.categories.find(c=>c.id===cardData.correctCategory).label}`, 'info');

            selectedCard = null;
            sortedCount++;

            if (sortedCount === q.cards.length) {
                stationTotal++;
                setTimeout(() => showFeedback(true,
                    `Du hast ${stationOK} von ${q.cards.length} Karten richtig zugeordnet.`,
                    stationPts), 400);
            }
        };
        zone.addEventListener('click', assign);
        zone.addEventListener('keypress', e => { if (e.key === 'Enter') assign(); });
        zone.setAttribute('tabindex', '0');
    });
}

// ── DETECTIVE (Station 3) ──────────────────────────────────
function renderDetective(q, container) {
    const foundClues = new Set();

    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">🔎 Detektiv-Aufgabe</span>
            <p class="question-text">${q.instruction}</p>

            <div class="detective-clues">
                <div class="clue-label">Gefundene Hinweise</div>
                <div class="clue-list" id="clue-list">
                    ${q.targetClues.map(c => `<span class="clue-chip" id="clue-${slugify(c)}">${c}</span>`).join('')}
                </div>
            </div>

            <div class="detective-sources" id="sources">
                ${q.sources.map(src => `
                    <div class="source-card" id="src-${src.id}" data-id="${src.id}" tabindex="0"
                         role="button" aria-label="Quelle öffnen: ${src.type} vom ${src.date}">
                        <div class="source-header">
                            <span class="source-type-badge">${src.type}</span>
                            <span class="source-date">${src.date}</span>
                        </div>
                        <p class="source-text">${src.text}</p>
                        <div id="found-in-${src.id}" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px"></div>
                    </div>`).join('')}
            </div>

            <div id="detective-summary" style="display:none;margin-top:16px"></div>
        </div>`;

    container.querySelectorAll('.source-card').forEach(card => {
        const reveal = () => {
            const id  = card.dataset.id;
            const src = q.sources.find(s => s.id === id);
            card.classList.add('clue-found');

            src.clues.forEach(clue => {
                const match = q.targetClues.find(tc =>
                    tc.toLowerCase().includes(clue.split(' ')[0].toLowerCase()));
                if (match && !foundClues.has(match)) {
                    foundClues.add(match);
                    const chip = container.querySelector(`#clue-${slugify(match)}`);
                    if (chip) chip.classList.add('found');
                    // show chip inside source
                    const area = container.querySelector(`#found-in-${id}`);
                    const c = document.createElement('span');
                    c.className = 'clue-chip found';
                    c.textContent = match;
                    area.appendChild(c);
                    stationPts += q.pointsPerClue;
                }
            });
            toast(`${src.clues.length} Hinweis(e) in "${src.type}" gefunden!`, 'success');

            if (foundClues.size >= q.minClues) {
                showDetectiveSummary(q, container);
            }
        };
        card.addEventListener('click', reveal);
        card.addEventListener('keypress', e => { if (e.key === 'Enter') reveal(); });
    });
}

function showDetectiveSummary(q, container) {
    const summary = container.querySelector('#detective-summary');
    summary.style.display = 'block';
    summary.innerHTML = `
        <div style="background:var(--color-warning-bg);border:1px solid var(--color-warning);border-radius:var(--radius-lg);padding:16px">
            <p style="font-weight:700;margin-bottom:12px">🕵️ Abschlussfrage:</p>
            <p style="margin-bottom:12px">${q.summaryQuestion}</p>
            <div style="display:flex;flex-direction:column;gap:8px">
                ${q.summaryOptions.map((opt, i) => `
                    <button class="option-btn" data-idx="${i}" style="background:var(--color-surface)">
                        <span class="option-letter">${['A','B','C','D'][i]}</span>
                        <span>${opt}</span>
                    </button>`).join('')}
            </div>
        </div>`;

    summary.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ok = parseInt(btn.dataset.idx) === q.summaryCorrect;
            summary.querySelectorAll('.option-btn').forEach((b, i) => {
                b.disabled = true;
                if (i === q.summaryCorrect) b.classList.add('correct');
                else if (i === parseInt(btn.dataset.idx) && !ok) b.classList.add('incorrect');
            });
            if (ok) { stationPts += q.summaryPoints; stationOK++; }
            stationTotal++;
            setTimeout(() => showFeedback(ok, q.summaryExplanation, ok ? q.summaryPoints : 0), 400);
        });
    });
}

// ── COMPARISON (Station 4) ─────────────────────────────────
function renderComparison(q, container) {
    let decisions = {};

    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">⚖️ Vergleichsspiel</span>
            <p class="question-text">${q.instruction}</p>
            <div class="comparison-articles" id="articles-area">
                ${q.articles.map(art => `
                    <div class="article-card" id="art-${art.id}">
                        <div class="article-header">
                            <span class="article-source-name">📰 ${art.sourceName}</span>
                            <span class="article-date">${art.date}</span>
                        </div>
                        <div class="article-body">
                            <div class="article-headline">${art.headline}</div>
                            <p class="article-excerpt">${art.excerpt}</p>
                        </div>
                        <div class="article-verdict">
                            <button class="verdict-btn" data-art="${art.id}" data-verdict="free">
                                ${q.verdictLabels.free}
                            </button>
                            <button class="verdict-btn" data-art="${art.id}" data-verdict="propaganda">
                                ${q.verdictLabels.propaganda}
                            </button>
                        </div>
                    </div>`).join('')}
            </div>
            <div id="comparison-result" style="margin-top:16px"></div>
        </div>`;

    container.querySelectorAll('.verdict-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const artId   = btn.dataset.art;
            const verdict = btn.dataset.verdict;
            decisions[artId] = verdict;

            // Update visual for this article
            const artCard = container.querySelector(`#art-${artId}`);
            artCard.querySelectorAll('.verdict-btn').forEach(b => {
                b.classList.remove('selected-free', 'selected-propaganda');
            });
            btn.classList.add(verdict === 'free' ? 'selected-free' : 'selected-propaganda');

            // Check if all decided
            if (Object.keys(decisions).length === q.articles.length) {
                let pts = 0;
                q.articles.forEach(art => {
                    const isOK = decisions[art.id] === art.correct;
                    if (isOK) { pts += q.pointsPerArticle; stationOK++; }
                    // Show result on card
                    const btns = container.querySelectorAll(`[data-art="${art.id}"]`);
                    btns.forEach(b => {
                        b.disabled = true;
                        if (b.dataset.verdict === art.correct) b.classList.add('correct');
                        else if (b.dataset.verdict === decisions[art.id] && !isOK) b.classList.add('incorrect');
                    });
                });
                stationPts += pts;
                stationTotal++;

                const resDiv = container.querySelector('#comparison-result');
                resDiv.innerHTML = q.articles.map(art => `
                    <div style="margin-bottom:12px;padding:12px;background:var(--color-info-bg);border-radius:var(--radius-md)">
                        <strong>${art.sourceName}:</strong><br>
                        <small>${art.explanation}</small>
                    </div>`).join('');

                setTimeout(() => showFeedback(stationOK > 0,
                    `Du hast ${stationOK} von ${q.articles.length} Artikeln richtig eingeschätzt.`, pts), 600);
            }
        });
    });
}

// ── SEEK FIND (Station 5) ──────────────────────────────────
function renderSeekFind(q, container) {
    const found = new Set();

    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">🔭 Suchbild</span>
            <p class="question-text">${q.instruction}</p>

            <div class="seek-items-list" id="seek-chips">
                ${q.seekTargets.map(t =>
                    `<span class="seek-item-chip" id="sch-${t.id}">🔍 ${t.label}</span>`).join('')}
            </div>
            <p class="seek-progress-text" id="seek-progress">0 von ${q.seekTargets.length} gefunden</p>

            <div class="seek-image-wrapper" id="seek-area">
                ${buildPersonenKultSVG(q)}
            </div>
        </div>`;

    container.querySelectorAll('.seek-target').forEach(target => {
        const activate = () => {
            const id = target.dataset.id;
            if (found.has(id)) return;
            const tData = q.seekTargets.find(t => t.id === id);
            found.add(id);
            target.classList.add('found');
            const chip = container.querySelector(`#sch-${id}`);
            if (chip) chip.classList.add('found');
            stationPts += q.pointsPerTarget;
            container.querySelector('#seek-progress').textContent =
                `${found.size} von ${q.seekTargets.length} gefunden`;
            toast(`✓ ${tData.label}`, 'success');

            if (found.size === q.seekTargets.length) {
                stationOK++;
                stationTotal++;
                setTimeout(() => showFeedback(true, 'Alle Elemente des Personenkults gefunden! Sehr gut!', stationPts), 400);
            } else if (found.size >= q.minToPass) {
                // Show continue option
                if (!container.querySelector('#seekdone-btn')) {
                    const btn = document.createElement('button');
                    btn.id = 'seekdone-btn';
                    btn.className = 'btn btn-primary btn-block';
                    btn.style.marginTop = '12px';
                    btn.textContent = `Weiter (${found.size} gefunden)`;
                    btn.addEventListener('click', () => {
                        stationOK++;
                        stationTotal++;
                        showFeedback(true, `Du hast ${found.size} von ${q.seekTargets.length} Elemente gefunden!`, stationPts);
                    });
                    container.querySelector('.question-card').appendChild(btn);
                } else {
                    container.querySelector('#seekdone-btn').textContent = `Weiter (${found.size} gefunden)`;
                }
            }
        };
        target.addEventListener('click', activate);
        target.addEventListener('keypress', e => { if (e.key === 'Enter') activate(); });
    });
}

function buildPersonenKultSVG(q) {
    const hotspotsHTML = q.seekTargets.map(t =>
        `<div class="seek-target" data-id="${t.id}"
              style="left:${t.x}%;top:${t.y}%;transform:translate(-50%,-50%)"
              role="button" tabindex="0"
              aria-label="Element suchen: ${t.label}"
              title="${t.label}">
            <span class="seek-checkmark">✓</span>
        </div>`).join('');

    return `<div style="position:relative;min-height:320px;background:linear-gradient(170deg,#1a1a2e,#16213e);border-radius:var(--radius-md);overflow:hidden;padding:16px;display:flex;flex-direction:column;align-items:center">
        <!-- Himmel / Atmosphäre -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 100% 60% at 50% 0%,rgba(200,146,42,.2),transparent);pointer-events:none"></div>

        <!-- Riesenporträt oben mitte -->
        <div style="font-size:3.5rem;text-align:center;margin-bottom:4px;text-shadow:0 0 20px rgba(200,146,42,.8)">🧑‍💼</div>
        <div style="font-size:.65rem;color:rgba(255,215,0,.7);font-weight:700;letter-spacing:.15em;margin-bottom:8px">● DER FÜHRER ●</div>

        <!-- Podest / Bühne -->
        <div style="background:rgba(200,146,42,.3);border:2px solid rgba(200,146,42,.5);border-radius:4px;padding:6px 32px;margin-bottom:4px;font-size:.7rem;color:#ffd700;font-weight:700">TRIUMPHPODEST</div>

        <!-- Flaggen -->
        <div style="display:flex;gap:4px;margin-bottom:8px">
            ${Array(6).fill(0).map(() => '<div style="width:8px;height:24px;background:linear-gradient(#c00,#c00 33%,#fff 33%,#fff 66%,#c00 66%)"></div>').join('')}
        </div>

        <!-- Massenmenge -->
        <div style="font-size:1.8rem;letter-spacing:-4px;opacity:.85">
            👤👤👤👤👤👤👤👤👤👤👤👤👤👤👤
        </div>
        <div style="font-size:.65rem;color:rgba(255,255,255,.5);margin-top:4px">Massenaufmarsch</div>

        <!-- Clickable Targets -->
        ${hotspotsHTML}
    </div>`;
}

// ── STORY (Station 6) ──────────────────────────────────────
function renderStory(q, container) {
    currentStoryScene = q.scenes[0].id;
    renderStoryScene(q, container);
}

function renderStoryScene(q, container) {
    const scene = q.scenes.find(s => s.id === currentStoryScene)
                  || q.scenes[0];

    container.innerHTML = `
        <div>
            <div class="story-progress-bar">
                ${storyResults.map(r =>
                    `<div class="story-step-dot ${r === 'good' ? 'good' : 'bad'}"></div>`
                ).join('')}
                <div class="story-step-dot active"></div>
            </div>

            <div class="story-scene">
                <div class="story-scene-image">
                    <span style="font-size:3.5rem">${scene.emoji}</span>
                    <div class="story-scene-label">${scene.location}</div>
                </div>
                <div class="story-text">
                    <p class="story-narrator">${scene.narrator}</p>
                    <p class="story-paragraph">${scene.text}</p>
                </div>
            </div>

            <h3 style="font-size:var(--text-base);font-weight:700;margin-bottom:12px">Was tust du?</h3>
            <div class="story-choices">
                ${scene.choices.map(c => `
                    <button class="story-choice-btn" data-id="${c.id}" data-positive="${c.positive}"
                            data-next="${c.nextScene}">
                        <span class="story-choice-icon">${c.icon}</span>
                        <span>${c.text}</span>
                    </button>`).join('')}
            </div>
        </div>`;

    container.querySelectorAll('.story-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isPositive = btn.dataset.positive === 'true';
            const nextScene  = btn.dataset.next;

            storyResults.push(isPositive ? 'good' : 'bad');
            if (isPositive) stationPts += q.pointsPerGoodChoice;

            btn.classList.add(isPositive ? 'positive-outcome' : 'negative-outcome');
            container.querySelectorAll('.story-choice-btn').forEach(b => b.disabled = true);

            const outcome = document.createElement('div');
            outcome.className = `story-outcome ${isPositive ? 'positive' : 'negative'}`;
            outcome.innerHTML = `
                <div class="story-outcome-title">${isPositive ? '✅ Gut gemacht!' : '⚠️ Das hätte besser sein können...'}</div>
                <div class="story-outcome-text">${isPositive
                    ? 'Du hast Zivilcourage gezeigt. Das macht einen echten Unterschied!'
                    : 'Wegschauen ist einfacher – aber es verändert nichts. Was wäre besser gewesen?'}</div>`;
            container.querySelector('.story-choices').after(outcome);

            const continueBtn = document.createElement('button');
            continueBtn.className = 'btn btn-primary btn-block';
            continueBtn.style.marginTop = '16px';
            continueBtn.textContent = 'Weiter →';
            continueBtn.addEventListener('click', () => {
                const endScene = q.endScenes[nextScene];
                if (endScene) {
                    renderStoryEnd(q, container, endScene);
                } else {
                    currentStoryScene = nextScene;
                    renderStoryScene(q, container);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            outcome.after(continueBtn);
        });
    });
}

function renderStoryEnd(q, container, endScene) {
    stationPts  += endScene.points;
    stationOK++;
    stationTotal++;

    container.innerHTML = `
        <div>
            <div class="story-progress-bar">
                ${storyResults.map(r =>
                    `<div class="story-step-dot ${r === 'good' ? 'good' : 'bad'}"></div>`).join('')}
            </div>
            <div class="story-outcome ${endScene.type}" style="margin-bottom:16px">
                <div class="story-outcome-title" style="font-size:var(--text-lg)">${endScene.title}</div>
                <div class="story-outcome-text">${endScene.text}</div>
            </div>
            <div style="text-align:center;margin-bottom:16px">
                <div style="font-size:var(--text-2xl);font-weight:700;color:var(--color-gold)">+${endScene.points} Punkte</div>
                <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">${storyResults.filter(r=>r==='good').length} gute Entscheidungen von ${storyResults.length}</div>
            </div>
            <button class="btn btn-primary btn-block" id="story-done-btn">Weiter</button>
        </div>`;

    container.querySelector('#story-done-btn').addEventListener('click', () => {
        showFeedback(endScene.type === 'positive',
            endScene.text, endScene.points);
    });
}

// ── REFLECTION ─────────────────────────────────────────────
function renderReflection(q, container) {
    container.innerHTML = `
        <div class="question-card">
            <span class="question-type-badge">💭 Reflexion</span>
            <div class="question-visual">${q.visual || '💡'}</div>
            <p class="question-text">${q.question}</p>
            <p class="reflection-prompt">Es gibt keine falsche Antwort – wichtig ist deine persönliche Überlegung.</p>
            <textarea class="reflection-input" id="refl-text"
                      placeholder="${q.placeholder || 'Deine Gedanken...'}"
                      aria-label="Deine Antwort" rows="5"></textarea>
            <button class="btn btn-primary btn-block" id="refl-submit">Antwort absenden</button>
        </div>`;

    container.querySelector('#refl-submit').addEventListener('click', () => {
        const val = container.querySelector('#refl-text').value.trim();
        if (val.length < 10) {
            toast('Bitte etwas ausführlicher (mind. 10 Zeichen)', 'info');
            return;
        }
        stationPts += q.points;
        stationOK++;
        stationTotal++;
        showFeedback(true, 'Danke für deine Gedanken! Reflexion ist ein wichtiger Teil des Lernens.', q.points);
    });
}

// ── FEEDBACK MODAL ─────────────────────────────────────────
function showFeedback(ok, explanation, points) {
    document.getElementById('feedback-icon').textContent = ok ? '✓' : '✗';
    document.getElementById('feedback-icon').className   = `feedback-icon ${ok ? 'correct' : 'incorrect'}`;
    document.getElementById('feedback-title').textContent = ok ? 'Richtig!' : 'Nicht ganz...';
    document.getElementById('feedback-text').textContent  = ok ? 'Gut gemacht!' : 'Das war leider nicht korrekt.';

    const expEl = document.getElementById('feedback-explanation');
    if (explanation) {
        expEl.innerHTML = `<strong>Erklärung:</strong> ${explanation}`;
        expEl.style.display = 'block';
    } else { expEl.style.display = 'none'; }

    const ptsEl = document.getElementById('feedback-points');
    if (points > 0) {
        ptsEl.textContent = `+${points} Punkte ⭐`;
        ptsEl.style.display = 'block';
    } else { ptsEl.style.display = 'none'; }

    openModal('feedback');
}

// ── NEXT QUESTION ──────────────────────────────────────────
function nextQuestion() {
    qIdx++;
    if (qIdx >= currentStation.questions.length) { completeStation(); }
    else { renderQuestion(); }
}

// ── COMPLETE STATION ───────────────────────────────────────
function completeStation() {
    progress = Storage.complete(
        currentStation.id,
        currentStation.letter,
        currentStation.letterPosition,
        stationPts,
        stationOK,
        currentStation.questions.length
    );
    document.getElementById('earned-letter').textContent = currentStation.letter;
    document.getElementById('station-points-display').textContent = stationPts;
    openModal('letter');
}

// ── FINISH SCREEN ──────────────────────────────────────────
function renderFinish() {
    progress = Storage.getProgress();
    let word = '';
    for (let i = 0; i < SOLUTION_WORD.length; i++) {
        word += progress.collectedLetters[i] || '?';
    }
    document.getElementById('solution-word').textContent = word;
    document.getElementById('final-points').textContent   = progress.totalPoints;
    document.getElementById('final-correct').textContent  = progress.totalCorrect;
    document.getElementById('final-stations').textContent = progress.completedStations.length;
}

// ── SHARE ──────────────────────────────────────────────────
function shareResults() {
    const text = `Ich habe "Mission Demokratie" abgeschlossen! 🏆\nPunkte: ${progress.totalPoints}\nLösungswort: ${SOLUTION_WORD}\n\n#MissionDemokratie`;
    if (navigator.share) {
        navigator.share({ title: 'Mission Demokratie', text }).catch(() => copyText(text));
    } else { copyText(text); }
}
function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => toast('In Zwischenablage kopiert!', 'success'))
        .catch(() => toast('Kopieren fehlgeschlagen', 'error'));
}

// ── MODAL HELPERS ──────────────────────────────────────────
function openModal(name)  { M[name].classList.add('active'); }
function closeModal(name) { M[name].classList.remove('active'); }

// ── TOAST NOTIFICATION ─────────────────────────────────────
function toast(msg, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add('hiding');
        setTimeout(() => el.remove(), 350);
    }, 3000);
}

// ── UTIL ───────────────────────────────────────────────────
function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}