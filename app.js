/**
 * IGCSE Computer Science Chapter 4: Software Quest
 * Core Application Engine & Audio Synthesizer
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playTone(freq, type, duration, startVol = 0.2) {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio error:", e);
        }
    }

    correct() {
        this.init();
        this.playTone(523.25, 'sine', 0.1, 0.2); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2), 80); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.2), 160); // G5
    }

    wrong() {
        this.init();
        this.playTone(220, 'sawtooth', 0.15, 0.25);
        setTimeout(() => this.playTone(180, 'sawtooth', 0.3, 0.25), 120);
    }

    click() {
        this.init();
        this.playTone(800, 'sine', 0.04, 0.08);
    }

    stageComplete() {
        this.init();
        const freqs = [440, 554.37, 659.25, 880];
        freqs.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.25), i * 100);
        });
    }
}

const audio = new SoundEngine();

// Global Game State
const state = {
    playerName: "Student",
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentStage: 1,
    correctCount: 0,
    totalQuestionsAnswered: 0,
    stageData: {
        stage1: { items: [], categorized: { system: [], application: [] } },
        stage2: { currentIndex: 0 },
        stage3: { matches: {} },
        stage4: { matches: {} },
        stage5: { currentIndex: 0, answers: [] }
    },
    syncChannel: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initClassroomSync();
    setupEventListeners();
    renderLeaderboard();
});

// Classroom Broadcast / LocalStorage Sync
function initClassroomSync() {
    if ('BroadcastChannel' in window) {
        state.syncChannel = new BroadcastChannel('igcse_chapter4_game');
        state.syncChannel.onmessage = (event) => {
            if (event.data && event.data.type === 'SCORE_UPDATE') {
                saveStudentToLeaderboard(event.data.name, event.data.score, event.data.accuracy);
            }
        };
    }
}

function broadcastScore() {
    const accuracy = state.totalQuestionsAnswered > 0 
        ? Math.round((state.correctCount / state.totalQuestionsAnswered) * 100) 
        : 0;

    const data = {
        type: 'SCORE_UPDATE',
        name: state.playerName,
        score: state.score,
        accuracy: accuracy,
        timestamp: Date.now()
    };

    saveStudentToLeaderboard(data.name, data.score, data.accuracy);

    if (state.syncChannel) {
        state.syncChannel.postMessage(data);
    }
}

function saveStudentToLeaderboard(name, score, accuracy) {
    let leaderboard = JSON.parse(localStorage.getItem('igcse_ch4_leaderboard') || '[]');
    const existingIndex = leaderboard.findIndex(entry => entry.name.toLowerCase() === name.toLowerCase());

    if (existingIndex >= 0) {
        if (score > leaderboard[existingIndex].score) {
            leaderboard[existingIndex].score = score;
            leaderboard[existingIndex].accuracy = accuracy;
        }
    } else {
        leaderboard.push({ name, score, accuracy, date: new Date().toLocaleTimeString() });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('igcse_ch4_leaderboard', JSON.stringify(leaderboard));
    renderLeaderboard();
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;

    let leaderboard = JSON.parse(localStorage.getItem('igcse_ch4_leaderboard') || '[]');
    if (leaderboard.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No student scores recorded yet. Play a round!</td></tr>`;
        return;
    }

    tbody.innerHTML = leaderboard.map((entry, index) => {
        let badge = '';
        if (index === 0) badge = ' 🥇';
        else if (index === 1) badge = ' 🥈';
        else if (index === 2) badge = ' 🥉';

        return `
            <tr>
                <td class="rank-num">#${index + 1}${badge}</td>
                <td><strong>${escapeHTML(entry.name)}</strong></td>
                <td style="color: var(--neon-cyan); font-family: var(--font-code); font-weight:700;">${entry.score} pts</td>
                <td style="color: var(--neon-green); font-family: var(--font-code);">${entry.accuracy}%</td>
            </tr>
        `;
    }).join('');
}

function setupEventListeners() {
    // Start Game Button
    document.getElementById('btnStartGame').addEventListener('click', () => {
        const input = document.getElementById('studentNameInput');
        const name = input.value.trim();
        if (name) {
            state.playerName = name;
        }
        audio.click();
        startStage(1);
    });

    // Mute Toggle Button
    const btnMute = document.getElementById('btnMute');
    if (btnMute) {
        btnMute.addEventListener('click', () => {
            audio.muted = !audio.muted;
            btnMute.innerText = audio.muted ? "🔇" : "🔊";
        });
    }

    // Host Leaderboard Toggle
    const btnLeaderboard = document.getElementById('btnLeaderboard');
    const modalLeaderboard = document.getElementById('modalLeaderboard');
    const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');

    if (btnLeaderboard && modalLeaderboard) {
        btnLeaderboard.addEventListener('click', () => {
            audio.click();
            renderLeaderboard();
            modalLeaderboard.classList.add('active');
        });
    }
    if (btnCloseLeaderboard) {
        btnCloseLeaderboard.addEventListener('click', () => {
            modalLeaderboard.classList.remove('active');
        });
    }

    // Reset Leaderboard (Protected by Presenter Key "kishan12$")
    const btnResetLeaderboard = document.getElementById('btnResetLeaderboard');
    if (btnResetLeaderboard) {
        btnResetLeaderboard.addEventListener('click', () => {
            let authorized = false;

            if (state.playerName.trim() === "kishan12$") {
                authorized = true;
            } else {
                const inputKey = prompt("🔒 Presenter Authorization Required:\nEnter presenter key to reset classroom session:");
                if (inputKey && inputKey.trim() === "kishan12$") {
                    authorized = true;
                }
            }

            if (authorized) {
                if (confirm("Reset classroom leaderboard for a new session?")) {
                    localStorage.removeItem('igcse_ch4_leaderboard');
                    renderLeaderboard();
                    alert("✅ Classroom leaderboard session successfully reset!");
                }
            } else {
                alert("❌ Access Denied: Only authorized presenters can reset the classroom session.");
            }
        });
    }
}

// Stage Switcher
function startStage(stageNum) {
    if (stageNum === 1) {
        state.score = 0;
        state.streak = 0;
        state.correctCount = 0;
        state.totalQuestionsAnswered = 0;
    }
    state.currentStage = stageNum;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const stageScreen = document.getElementById(`screenStage${stageNum}`);
    if (stageScreen) {
        stageScreen.classList.add('active');
    }

    updateTrackerUI(stageNum);
    updateScoreDisplay();

    switch (stageNum) {
        case 1: initStage1(); break;
        case 2: initStage2(); break;
        case 3: initStage3(); break;
        case 4: initStage4(); break;
        case 5: initStage5(); break;
    }
}

function updateTrackerUI(current) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`trackStep${i}`);
        if (!el) continue;
        el.classList.remove('active', 'completed');
        if (i < current) el.classList.add('completed');
        else if (i === current) el.classList.add('active');
    }
}

function updateScoreDisplay() {
    document.querySelectorAll('.valScore').forEach(el => el.innerText = state.score);
    document.querySelectorAll('.valStreak').forEach(el => el.innerText = state.streak);
    document.querySelectorAll('.valPlayer').forEach(el => el.innerText = state.playerName);
}

function addScore(points) {
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    
    // Bonus multiplier for streaks
    const multiplier = state.streak >= 3 ? 1.5 : 1;
    const finalPts = Math.round(points * multiplier);
    
    state.score += finalPts;
    state.correctCount++;
    state.totalQuestionsAnswered++;

    audio.correct();
    updateScoreDisplay();
    broadcastScore();
}

function registerWrong() {
    state.streak = 0;
    state.totalQuestionsAnswered++;
    audio.wrong();
    updateScoreDisplay();
    broadcastScore();
}

/* =========================================================
   STAGE 1: Software Classifier (System vs Application)
   ========================================================= */
function initStage1() {
    const container = document.getElementById('stage1Cards');
    const zoneSystem = document.getElementById('zoneSystem');
    const zoneApplication = document.getElementById('zoneApplication');

    container.innerHTML = '';
    zoneSystem.innerHTML = '<div class="zone-title">⚙️ System Software</div>';
    zoneApplication.innerHTML = '<div class="zone-title">📱 Application Software</div>';

    // Pick 5 random items out of pool and shuffle
    state.stageData.stage1.items = [...CHAPTER4_DATA.classificationItems]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    state.stageData.stage1.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'draggable-card';
        card.innerText = item.name;
        card.setAttribute('draggable', 'true');
        card.dataset.id = item.id;

        card.addEventListener('click', () => showCategoryPicker(item, card));
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
        });

        container.appendChild(card);
    });

    setupDropZones();
}

function showCategoryPicker(item, cardEl) {
    audio.click();
    const category = prompt(`Classify "${item.name}":\nType "1" for System Software\nType "2" for Application Software`);
    if (category === "1") handleSort(item, "system", cardEl);
    else if (category === "2") handleSort(item, "application", cardEl);
}

function setupDropZones() {
    ['zoneSystem', 'zoneApplication'].forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        const targetType = zoneId === 'zoneSystem' ? 'system' : 'application';

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const id = parseInt(e.dataTransfer.getData('text/plain'));
            const item = state.stageData.stage1.items.find(i => i.id === id);
            const cardEl = document.querySelector(`.draggable-card[data-id="${id}"]`);

            if (item && cardEl) {
                handleSort(item, targetType, cardEl);
            }
        });
    });
}

function handleSort(item, chosenType, cardEl) {
    if (item.type === chosenType) {
        addScore(100);
        const zone = chosenType === 'system' ? document.getElementById('zoneSystem') : document.getElementById('zoneApplication');
        cardEl.style.background = 'rgba(0, 245, 212, 0.2)';
        cardEl.style.borderColor = 'var(--neon-green)';
        cardEl.removeAttribute('draggable');
        zone.appendChild(cardEl);

        checkStage1Complete();
    } else {
        registerWrong();
        alert(`❌ Incorrect!\n\n"${item.name}" is ${item.type.toUpperCase()} SOFTWARE.\n\nExplanation: ${item.description}`);
    }
}

function checkStage1Complete() {
    const remaining = document.getElementById('stage1Cards').children.length;
    if (remaining === 0) {
        audio.stageComplete();
        setTimeout(() => {
            alert("🎉 Stage 1 Complete! Excellent job sorting System and Application software!");
            startStage(2);
        }, 500);
    }
}

/* =========================================================
   STAGE 2: OS Functions & Interrupt Simulator
   ========================================================= */
function initStage2() {
    state.stageData.stage2.currentIndex = 0;
    // Pick 3 random scenarios out of pool and fresh-shuffle choices
    state.stageData.stage2.scenarios = [...CHAPTER4_DATA.interruptScenarios]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(scen => ({
            ...scen,
            shuffledOptions: scen.options.map(opt => ({
                text: opt,
                isCorrect: opt === scen.correctISRAction
            })).sort(() => Math.random() - 0.5)
        }));

    renderStage2Scenario();
}

function renderStage2Scenario() {
    const idx = state.stageData.stage2.currentIndex;
    const scenarios = state.stageData.stage2.scenarios;

    if (!scenarios || idx >= scenarios.length) {
        audio.stageComplete();
        alert("🎉 Stage 2 Complete! You mastered Interrupt Handling and OS Memory Management!");
        startStage(3);
        return;
    }

    const scenario = scenarios[idx];
    const box = document.getElementById('stage2Content');
    const bufferGaugePct = Math.min(100, Math.round(((idx + 1) / scenarios.length) * 100));

    box.innerHTML = `
        <div class="cpu-sim-box">
            <div>
                <div class="scenario-card">
                    <span class="scenario-type">⚡ ${scenario.type} | Source: ${scenario.source}</span>
                    <h3 class="scenario-title">${scenario.title}</h3>
                    <p class="scenario-desc">${scenario.description}</p>
                </div>
                <h4 style="margin-bottom:12px; color: var(--neon-cyan);">Select the Correct ISR (Interrupt Service Routine) Action:</h4>
                <div class="options-list">
                    ${scenario.shuffledOptions.map((item, i) => `
                        <button class="option-btn" onclick="handleStage2Answer(${i})">
                            <strong>${String.fromCharCode(65 + i)}:</strong> ${item.text}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="buffer-gauge">
                <div style="font-size:12px; text-transform:uppercase; color:var(--text-muted);">RAM Buffer Level</div>
                <div class="gauge-circle">${bufferGaugePct}%</div>
                <div style="font-size:13px; text-align:center; color:var(--neon-green);">OS Priority: NORMAL</div>
            </div>
        </div>
    `;
}

function handleStage2Answer(optionIndex) {
    const idx = state.stageData.stage2.currentIndex;
    const scenario = state.stageData.stage2.scenarios[idx];
    const chosenItem = scenario.shuffledOptions[optionIndex];

    if (chosenItem && chosenItem.isCorrect) {
        addScore(150);
        alert("✅ Correct ISR Execution!\n\nThe CPU successfully saved current registers to stack, resolved the interrupt signal, and resumed CPU processing.");
        state.stageData.stage2.currentIndex++;
        renderStage2Scenario();
    } else {
        registerWrong();
        alert(`❌ Wrong ISR Response!\n\nCorrect Action: ${scenario.correctISRAction}`);
    }
}

/* =========================================================
   STAGE 3: Translator Showdown (Compiler vs Interpreter vs Assembler)
   ========================================================= */
function initStage3() {
    state.stageData.stage3.matches = {};
    // Pick 3 random cards out of pool
    state.stageData.stage3.activeCards = [...CHAPTER4_DATA.translatorCards]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    const container = document.getElementById('stage3Content');
    container.innerHTML = `
        <p style="margin-bottom:20px; color:var(--text-muted);">Classify each translator characteristic to its matching translator type:</p>
        <div class="quiz-grid">
            ${state.stageData.stage3.activeCards.map(card => `
                <div class="quiz-card" id="card_t_${card.id}">
                    <p style="font-size:14px; margin-bottom:14px; line-height:1.5;">"${card.statement}"</p>
                    <div style="display:flex; gap:8px;">
                        <button class="option-btn" style="flex:1; text-align:center;" onclick="handleStage3Match('${card.id}', 'Compiler')">Compiler</button>
                        <button class="option-btn" style="flex:1; text-align:center;" onclick="handleStage3Match('${card.id}', 'Interpreter')">Interpreter</button>
                        <button class="option-btn" style="flex:1; text-align:center;" onclick="handleStage3Match('${card.id}', 'Assembler')">Assembler</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function handleStage3Match(cardId, chosenTarget) {
    const cardData = state.stageData.stage3.activeCards.find(c => c.id === cardId);
    const cardEl = document.getElementById(`card_t_${cardId}`);

    if (cardData && cardData.target === chosenTarget) {
        addScore(120);
        cardEl.style.background = 'rgba(0, 245, 212, 0.15)';
        cardEl.style.borderColor = 'var(--neon-green)';
        cardEl.querySelectorAll('button').forEach(btn => btn.disabled = true);

        state.stageData.stage3.matches[cardId] = true;

        if (Object.keys(state.stageData.stage3.matches).length === state.stageData.stage3.activeCards.length) {
            audio.stageComplete();
            setTimeout(() => {
                alert("🎉 Stage 3 Complete! You understand Compilers, Interpreters, and Assemblers!");
                startStage(4);
            }, 400);
        }
    } else {
        registerWrong();
        alert(`❌ Incorrect!\n\nThis statement applies to: ${cardData.target.toUpperCase()}`);
    }
}

/* =========================================================
   STAGE 4: IDE Feature Builder
   ========================================================= */
function initStage4() {
    state.stageData.stage4.matches = {};
    // Pick 3 random IDE features out of pool
    state.stageData.stage4.activeFeatures = [...CHAPTER4_DATA.ideFeatures]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    const container = document.getElementById('stage4Content');
    container.innerHTML = `
        <div style="max-width:800px; margin:0 auto;">
            <p style="margin-bottom:20px; color:var(--text-muted);">Match the Integrated Development Environment (IDE) tool to its primary function:</p>
            <div style="display:flex; flex-direction:column; gap:16px;">
                ${state.stageData.stage4.activeFeatures.map((item, i) => `
                    <div class="glass-card" style="padding:20px; margin-bottom:0;" id="ide_row_${i}">
                        <h4 style="color:var(--neon-cyan); margin-bottom:8px;">🛠️ ${item.tool}</h4>
                        <p style="font-size:14px; color:var(--text-muted); margin-bottom:14px;">${item.description}</p>
                        <button class="btn-cyber btn-secondary" onclick="confirmIDEKnowledge(${i})">Identify IDE Component</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function confirmIDEKnowledge(index) {
    addScore(100);
    const row = document.getElementById(`ide_row_${index}`);
    row.style.borderColor = 'var(--neon-green)';
    row.querySelector('button').innerText = "✅ Feature Mastered";
    row.querySelector('button').disabled = true;

    state.stageData.stage4.matches[index] = true;
    if (Object.keys(state.stageData.stage4.matches).length === state.stageData.stage4.activeFeatures.length) {
        audio.stageComplete();
        setTimeout(() => {
            alert("🎉 Stage 4 Complete! You unlocked all IDE Development Tools!");
            startStage(5);
        }, 400);
    }
}

/* =========================================================
   STAGE 5: IGCSE Chapter 4 Exam Boss Round
   ========================================================= */
function initStage5() {
    state.stageData.stage5.currentIndex = 0;
    // Pick 4 random exam questions out of pool & fresh-shuffle options
    state.stageData.stage5.questions = [...CHAPTER4_DATA.examQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map(q => ({
            ...q,
            shuffledOptions: q.options.map((opt, i) => ({
                text: opt,
                isCorrect: i === q.correct
            })).sort(() => Math.random() - 0.5)
        }));

    renderStage5Question();
}

function renderStage5Question() {
    const idx = state.stageData.stage5.currentIndex;
    const questions = state.stageData.stage5.questions;

    if (!questions || idx >= questions.length) {
        showFinalResults();
        return;
    }

    const q = questions[idx];
    const box = document.getElementById('stage5Content');

    box.innerHTML = `
        <div style="max-width:800px; margin:0 auto;" class="glass-card">
            <div style="display:flex; justify-between:space-between; margin-bottom:14px; font-size:13px; color:var(--neon-purple); font-weight:700;">
                <span>IGCSE PAPER 1 EXAM QUESTION ${idx + 1} OF ${questions.length}</span>
            </div>
            <h3 style="font-size:20px; line-height:1.4; margin-bottom:20px;">${q.question}</h3>
            <div class="options-list">
                ${q.shuffledOptions.map((item, i) => `
                    <button class="option-btn" onclick="handleStage5Answer(${i})">
                        <strong>${String.fromCharCode(65 + i)}:</strong> ${item.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function handleStage5Answer(optionIndex) {
    const idx = state.stageData.stage5.currentIndex;
    const q = state.stageData.stage5.questions[idx];
    const chosenItem = q.shuffledOptions[optionIndex];

    if (chosenItem && chosenItem.isCorrect) {
        addScore(200);
        alert(`✅ Correct!\n\nExplanation: ${q.explanation}`);
    } else {
        registerWrong();
        const correctText = q.options[q.correct];
        alert(`❌ Incorrect.\n\nCorrect Answer: ${correctText}\n\nExplanation: ${q.explanation}`);
    }

    state.stageData.stage5.currentIndex++;
    renderStage5Question();
}

/* =========================================================
   FINAL RESULTS & RANK SCREEN
   ========================================================= */
function showFinalResults() {
    audio.stageComplete();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screenResults').classList.add('active');

    const accuracy = state.totalQuestionsAnswered > 0 
        ? Math.round((state.correctCount / state.totalQuestionsAnswered) * 100) 
        : 0;

    let grade = "C";
    let rankBadge = "🥉";
    let title = "System Trainee";

    if (accuracy >= 90) {
        grade = "A*";
        rankBadge = "👑";
        title = "IGCSE Software Architect";
    } else if (accuracy >= 75) {
        grade = "A";
        rankBadge = "🏆";
        title = "System Core Engineer";
    } else if (accuracy >= 60) {
        grade = "B";
        rankBadge = "🥈";
        title = "Bug Hunter";
    }

    document.getElementById('resName').innerText = state.playerName;
    document.getElementById('resScore').innerText = state.score;
    document.getElementById('resAccuracy').innerText = `${accuracy}%`;
    document.getElementById('resGrade').innerText = grade;
    document.getElementById('resBadge').innerText = rankBadge;
    document.getElementById('resTitle').innerText = title;
    document.getElementById('resMaxStreak').innerText = state.maxStreak;

    broadcastScore();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Global scope helpers for HTML onClick inline triggers
window.handleStage2Answer = handleStage2Answer;
window.handleStage3Match = handleStage3Match;
window.confirmIDEKnowledge = confirmIDEKnowledge;
window.handleStage5Answer = handleStage5Answer;

function switchNavTab(tabName) {
    audio.click();
    const btnReading = document.getElementById('btnNavReading');
    const btnQuiz = document.getElementById('btnNavQuiz');
    const screenReading = document.getElementById('screenReading');
    const screenWelcome = document.getElementById('screenWelcome');
    const quizBadges = document.querySelectorAll('.quiz-only-badge');

    if (tabName === 'reading') {
        if (btnReading) btnReading.classList.add('active');
        if (btnQuiz) btnQuiz.classList.remove('active');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screenReading) screenReading.classList.add('active');
        document.getElementById('stageTrackerBar').style.display = 'none';
        quizBadges.forEach(el => el.style.display = 'none');
    } else if (tabName === 'quiz') {
        if (btnQuiz) btnQuiz.classList.add('active');
        if (btnReading) btnReading.classList.remove('active');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screenWelcome) screenWelcome.classList.add('active');
        quizBadges.forEach(el => el.style.display = 'inline-flex');
    }
}

function toggleReveal(id) {
    audio.click();
    const content = document.getElementById(id);
    if (content) {
        content.classList.toggle('active');
    }
}

window.switchNavTab = switchNavTab;
window.toggleReveal = toggleReveal;

function playUnmutedVideo() {
    audio.click();
    const video = document.getElementById('introVideo');
    const overlay = document.getElementById('videoOverlay');
    if (video) {
        video.muted = false;
        video.currentTime = 0;
        video.play().catch(e => console.log('Video play error:', e));
        if (overlay) overlay.style.display = 'none';

        video.onended = () => {
            if (overlay) {
                const btn = overlay.querySelector('.video-overlay-btn');
                if (btn) btn.innerHTML = '🔄 Replay Intro Video (50s) ▶';
                overlay.style.display = 'flex';
            }
        };
    }
}

function openVideoFullscreen() {
    audio.click();
    const video = document.getElementById('introVideo');
    const overlay = document.getElementById('videoOverlay');
    if (video) {
        video.muted = false;
        if (overlay) overlay.style.display = 'none';
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
        video.play();
    }
}

window.playUnmutedVideo = playUnmutedVideo;
window.openVideoFullscreen = openVideoFullscreen;


