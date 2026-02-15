// Mars Landing - Asteroid Run Edition (clean arcade rewrite)

const RUN_CONFIG = {
    gravity: 30,
    thrust: 55,
    horizontalSpeed: 14,
    maxFallSpeed: 34,
    maxRiseSpeed: -28,
    tunnelMinGap: 32,
    tunnelMaxGap: 44,
    segmentWidth: 22,
    spawnAhead: 7,
    startFuel: 100,
    fuelBurnPerSec: 12,
    fuelRecoverPerSec: 8,
    comboWindowSec: 2.6,
    safeStartSegments: 10,
    noCollisionDistance: 120,
    trackRenderIntervalSec: 1 / 24,
    perfectBaseScore: 12
};

class MarsLandingGame {
    constructor(containerElement, callback) {
        this.container = typeof containerElement === 'string'
            ? document.getElementById(containerElement)
            : containerElement;
        this.callback = callback;

        this.bestScore = this.loadBestScore();
        this.credits = this.loadCredits();

        this.isPressingThrust = false;
        this.isRunning = false;
        this.frameId = null;
        this.lastTime = 0;

        this.resetState();
    }

    loadBestScore() {
        const raw = localStorage.getItem('marsRun_bestScore');
        return raw ? parseInt(raw, 10) : 0;
    }

    saveBestScore() {
        localStorage.setItem('marsRun_bestScore', String(this.bestScore));
    }

    loadCredits() {
        const raw = localStorage.getItem('marsLanding_credits');
        return raw ? parseInt(raw, 10) : 0;
    }

    saveCredits() {
        localStorage.setItem('marsLanding_credits', String(this.credits));
    }

    resetState() {
        this.distance = 0;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.perfectPasses = 0;
        this.perfectChain = 0;
        this.perfectBonusScore = 0;
        this.achievementBonusScore = 0;
        this.noThrustStreak = 0;
        this.survivalTime = 0;
        this.unlockedAchievements = new Set();
        this.shipY = 50;
        this.shipVy = 0;
        this.fuel = RUN_CONFIG.startFuel;
        this.shake = 0;
        this.segments = [];
        this.lastPassedSegment = -1;
        this.trackRenderTimer = 0;
        this.lastTrackHtml = '';
        this.resultTimers = [];
        this.dead = false;
        this.startedAt = performance.now();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = this.createHTML();
        this.cacheElements();
        this.bindControls();
        this.buildInitialSegments();
        this.start();
    }

    showContractSelect() {
        this.init();
    }

    cacheElements() {
        this.canvas = this.container.querySelector('#mars-run-canvas');
        this.ship = this.container.querySelector('#mars-run-ship');
        this.track = this.container.querySelector('#mars-run-track');
        this.scoreEl = this.container.querySelector('#mars-run-score');
        this.bestEl = this.container.querySelector('#mars-run-best');
        this.comboEl = this.container.querySelector('#mars-run-combo');
        this.fuelFillEl = this.container.querySelector('#mars-run-fuel-fill');
        this.fuelTextEl = this.container.querySelector('#mars-run-fuel-text');
        this.speedEl = this.container.querySelector('#mars-run-speed');
        this.distanceEl = this.container.querySelector('#mars-run-distance');
        this.achievementsEl = this.container.querySelector('#mars-run-achievements');
        this.statusEl = this.container.querySelector('#mars-run-status');
        this.bestEl.textContent = String(this.bestScore);
    }

    createHTML() {
        return `
            <div class="mars-run-game">
                <div class="mars-run-head">
                    <div class="mars-run-stat"><span>Очки</span><strong id="mars-run-score">0</strong></div>
                    <div class="mars-run-stat"><span>Рекорд</span><strong id="mars-run-best">0</strong></div>
                    <div class="mars-run-stat"><span>Комбо</span><strong id="mars-run-combo">x1</strong></div>
                    <div class="mars-run-stat"><span>Скорость</span><strong id="mars-run-speed">0</strong></div>
                    <div class="mars-run-stat"><span>Дистанция</span><strong id="mars-run-distance">0</strong></div>
                    <div class="mars-run-stat"><span>Ачивки</span><strong id="mars-run-achievements">0/3</strong></div>
                    <div class="mars-run-stat"><span>Статус</span><strong id="mars-run-status">GO</strong></div>
                </div>

                <div class="mars-run-fuel">
                    <div class="mars-run-fuel-fill" id="mars-run-fuel-fill"></div>
                    <span id="mars-run-fuel-text">100%</span>
                </div>

                <div class="mars-run-canvas" id="mars-run-canvas">
                    <div class="mars-run-stars"></div>
                    <div class="mars-run-track" id="mars-run-track"></div>
                    <div class="mars-run-ship" id="mars-run-ship">🚀</div>
                    <div class="mars-run-hint">Зажимай W / Space / ЛКМ чтобы держать высоту</div>
                </div>

                <div class="mars-run-controls">
                    <button class="btn btn-secondary" id="mars-run-thrust-btn">▲ Тяга</button>
                    <button class="btn btn-primary" id="mars-run-restart-btn">↻ Рестарт</button>
                </div>
            </div>
        `;
    }

    bindControls() {
        this.keyDownHandler = (e) => {
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.isPressingThrust = true;
            }
            if (e.code === 'KeyR') {
                e.preventDefault();
                this.restart();
            }
        };

        this.keyUpHandler = (e) => {
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.isPressingThrust = false;
            }
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);

        const thrustBtn = this.container.querySelector('#mars-run-thrust-btn');
        const restartBtn = this.container.querySelector('#mars-run-restart-btn');

        if (thrustBtn) {
            thrustBtn.addEventListener('mousedown', () => { this.isPressingThrust = true; });
            thrustBtn.addEventListener('mouseup', () => { this.isPressingThrust = false; });
            thrustBtn.addEventListener('mouseleave', () => { this.isPressingThrust = false; });
            thrustBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.isPressingThrust = true; }, { passive: false });
            thrustBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.isPressingThrust = false; });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }

        if (this.canvas) {
            this.canvas.addEventListener('mousedown', () => { this.isPressingThrust = true; });
            this.canvas.addEventListener('mouseup', () => { this.isPressingThrust = false; });
            this.canvas.addEventListener('mouseleave', () => { this.isPressingThrust = false; });
            this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.isPressingThrust = true; }, { passive: false });
            this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.isPressingThrust = false; });
        }
    }

    buildInitialSegments() {
        this.segments = [];
        let prevCenter = 50;

        for (let i = 0; i < 18; i += 1) {
            const safeStart = i < RUN_CONFIG.safeStartSegments;
            const gapSize = safeStart
                ? this.randRange(38, 46)
                : this.randRange(RUN_CONFIG.tunnelMinGap, RUN_CONFIG.tunnelMaxGap);
            const maxDelta = safeStart ? 4 : 11;
            const nextCenter = this.clamp(prevCenter + this.randRange(-maxDelta, maxDelta), 22, 78);

            this.segments.push({
                index: i,
                x: i * RUN_CONFIG.segmentWidth,
                center: nextCenter,
                gap: gapSize,
                passed: false
            });

            prevCenter = nextCenter;
        }
    }

    start() {
        this.isRunning = true;
        this.dead = false;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(() => this.gameLoop());
    }

    gameLoop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        this.update(dt);
        this.render();

        this.frameId = requestAnimationFrame(() => this.gameLoop());
    }

    update(dt) {
        if (this.dead) return;

        const speedScale = 1 + Math.min(0.9, this.distance / 2200);
        const worldSpeed = RUN_CONFIG.horizontalSpeed * speedScale;

        if (this.isPressingThrust && this.fuel > 0) {
            this.shipVy -= RUN_CONFIG.thrust * dt;
            this.fuel = Math.max(0, this.fuel - RUN_CONFIG.fuelBurnPerSec * dt);
            this.shake = Math.min(6, this.shake + 0.5);
        } else {
            this.fuel = Math.min(100, this.fuel + RUN_CONFIG.fuelRecoverPerSec * dt);
        }

        this.shipVy += RUN_CONFIG.gravity * dt;
        this.shipVy = this.clamp(this.shipVy, RUN_CONFIG.maxRiseSpeed, RUN_CONFIG.maxFallSpeed);
        this.shipY += this.shipVy * dt;

        this.distance += worldSpeed * dt;
        this.survivalTime += dt;
        this.comboTimer = Math.max(0, this.comboTimer - dt);
        this.shake = Math.max(0, this.shake - 14 * dt);
        this.trackRenderTimer += dt;

        if (!this.isPressingThrust || this.fuel <= 0) {
            this.noThrustStreak += dt;
        } else {
            this.noThrustStreak = 0;
        }

        if (this.comboTimer === 0) {
            this.combo = 0;
        }

        if (this.shipY < 2 || this.shipY > 98) {
            this.crash('Разбился о каньон');
            return;
        }

        this.updateSegments(worldSpeed, dt);
        this.checkCollisionsAndScore();
        this.checkRunAchievements();
    }

    updateSegments(worldSpeed, dt) {
        for (const segment of this.segments) {
            segment.x -= worldSpeed * dt;
        }

        this.segments = this.segments.filter((segment) => segment.x > -RUN_CONFIG.segmentWidth);

        while (this.segments.length < RUN_CONFIG.spawnAhead + 8) {
            const last = this.segments[this.segments.length - 1];
            const prevCenter = last ? last.center : 50;
            const earlyGame = this.distance < 380;
            const gapSize = earlyGame
                ? this.randRange(38, 46)
                : this.randRange(RUN_CONFIG.tunnelMinGap, RUN_CONFIG.tunnelMaxGap);
            const maxDelta = earlyGame
                ? 5
                : (10 + Math.min(8, this.distance / 550));
            const center = this.clamp(prevCenter + this.randRange(-maxDelta, maxDelta), 16, 84);
            const nextIndex = last ? last.index + 1 : 0;
            const nextX = last ? last.x + RUN_CONFIG.segmentWidth : 0;

            this.segments.push({
                index: nextIndex,
                x: nextX,
                center,
                gap: gapSize,
                passed: false
            });
        }
    }

    checkCollisionsAndScore() {
        const shipX = 22;
        const shipRadius = 2.8;

        if (this.distance < RUN_CONFIG.noCollisionDistance) {
            return;
        }

        for (const segment of this.segments) {
            const inColumn = shipX + shipRadius > segment.x && shipX - shipRadius < segment.x + RUN_CONFIG.segmentWidth;
            if (!inColumn) continue;

            const topLimit = segment.center - segment.gap / 2;
            const bottomLimit = segment.center + segment.gap / 2;
            const safe = this.shipY > topLimit + 0.9 && this.shipY < bottomLimit - 0.9;

            if (!safe) {
                this.crash('Влетел в астероидный пояс');
                return;
            }
        }

        for (const segment of this.segments) {
            if (segment.passed) continue;
            if (segment.x + RUN_CONFIG.segmentWidth < shipX) {
                segment.passed = true;
                this.combo += 1;
                this.comboTimer = RUN_CONFIG.comboWindowSec;

                const comboMult = 1 + Math.min(3, Math.floor(this.combo / 3)) * 0.5;
                const gain = Math.round(10 * comboMult);
                this.score += gain;

                const offsetFromCenter = Math.abs(this.shipY - segment.center);
                const perfectWindow = segment.gap * 0.14;
                if (offsetFromCenter <= perfectWindow) {
                    this.perfectPasses += 1;
                    this.perfectChain += 1;

                    let chainLabel = 'x1';
                    let chainMult = 1;
                    if (this.perfectChain >= 6) {
                        chainLabel = 'MEGA';
                        chainMult = 4;
                    } else if (this.perfectChain >= 4) {
                        chainLabel = 'x3';
                        chainMult = 3;
                    } else if (this.perfectChain >= 2) {
                        chainLabel = 'x2';
                        chainMult = 2;
                    }

                    const perfectGain = RUN_CONFIG.perfectBaseScore * chainMult;
                    this.score += perfectGain;
                    this.perfectBonusScore += perfectGain;
                    this.comboTimer = Math.min(4.2, this.comboTimer + 0.35);
                    this.shake = Math.max(0, this.shake - 1.5);
                    this.flashPerfect(chainLabel, perfectGain);
                    this.playFeedbackSound(chainLabel === 'MEGA' ? 'mega' : 'perfect');
                }
                else {
                    this.perfectChain = 0;
                }

                this.lastPassedSegment = segment.index;
            }
        }
    }

    checkRunAchievements() {
        if (!this.unlockedAchievements.has('distance_300') && this.distance >= 300) {
            this.unlockAchievement('distance_300', '🏁 300м без аварии', 30);
        }

        if (!this.unlockedAchievements.has('no_thrust_8') && this.noThrustStreak >= 8) {
            this.unlockAchievement('no_thrust_8', '🧊 8с без тяги', 35);
        }

        if (!this.unlockedAchievements.has('perfect_chain_3') && this.perfectChain >= 3) {
            this.unlockAchievement('perfect_chain_3', '🎯 Perfect Chain x3', 45);
        }
    }

    unlockAchievement(id, title, bonusScore) {
        this.unlockedAchievements.add(id);
        this.score += bonusScore;
        this.achievementBonusScore += bonusScore;
        this.flashToast(`АЧИВКА: ${title}  +${bonusScore}`, 'achievement');
        this.playFeedbackSound('achievement');
    }

    flashPerfect(chainLabel, perfectGain) {
        if (!this.canvas) return;

        const existing = this.container.querySelector('.mars-run-perfect, .mars-run-toast');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'mars-run-perfect';
        popup.textContent = `PERFECT ${chainLabel} +${perfectGain}`;
        this.canvas.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 420);
    }

    flashToast(text, type = 'info') {
        if (!this.canvas) return;

        const toast = document.createElement('div');
        toast.className = `mars-run-toast ${type}`;
        toast.textContent = text;
        this.canvas.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 900);
    }

    playFeedbackSound(type = 'perfect') {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            if (!this.audioCtx) {
                this.audioCtx = new AudioCtx();
            }

            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const now = this.audioCtx.currentTime;
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            const tones = {
                perfect: { freq: 620, dur: 0.07, gain: 0.04 },
                achievement: { freq: 880, dur: 0.12, gain: 0.06 },
                mega: { freq: 1040, dur: 0.14, gain: 0.08 }
            };
            const tone = tones[type] || tones.perfect;

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(tone.freq, now);
            oscillator.frequency.exponentialRampToValueAtTime(tone.freq * 0.84, now + tone.dur);

            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.exponentialRampToValueAtTime(tone.gain, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.dur);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            oscillator.start(now);
            oscillator.stop(now + tone.dur + 0.02);
        } catch (e) {
            // Ignore audio errors in restricted environments
        }
    }

    crash(reason) {
        this.dead = true;
        this.isRunning = false;

        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }

        const finalScore = this.score;
        const earnedCredits = Math.max(5, Math.round(finalScore * 0.35));
        this.credits += earnedCredits;
        this.saveCredits();

        if (finalScore > this.bestScore) {
            this.bestScore = finalScore;
            this.saveBestScore();
        }

        if (typeof this.callback === 'function') {
            this.callback(false, finalScore);
        }

        this.showGameOver(reason, finalScore, earnedCredits);
    }

    showGameOver(reason, finalScore, earnedCredits) {
        if (this.resultTimers?.length) {
            this.resultTimers.forEach((timerId) => clearTimeout(timerId));
            this.resultTimers = [];
        }

        const isNewRecord = finalScore >= this.bestScore;
        const overlay = document.createElement('div');
        overlay.className = 'mars-run-overlay';
        overlay.innerHTML = `
            <div class="mars-run-result">
                <h2>💥 Миссия провалена</h2>
                <p class="mars-run-reason">${reason}</p>
                <div class="mars-run-step" id="result-step-1">Очки: <strong>${finalScore}</strong></div>
                <div class="mars-run-step" id="result-step-2">Бонусы: <strong>Perfect +${this.perfectBonusScore}, Ачивки +${this.achievementBonusScore}</strong></div>
                <div class="mars-run-step" id="result-step-3">Дистанция: <strong>${Math.round(this.distance)}м</strong> • Кредиты: <strong>+${earnedCredits}</strong></div>
                <div class="mars-run-step ${isNewRecord ? 'record-new' : ''}" id="result-step-4">${isNewRecord ? '🏆 Новый рекорд!' : 'Рекорд'}: <strong>${this.bestScore}</strong></div>
                <button class="btn btn-primary mars-run-play-again" id="mars-run-play-again">Играть снова</button>
            </div>
        `;

        this.container.appendChild(overlay);

        const playAgain = overlay.querySelector('#mars-run-play-again');
        if (playAgain) {
            playAgain.addEventListener('click', () => this.restart());
        }

        const steps = overlay.querySelectorAll('.mars-run-step');
        steps.forEach((step, index) => {
            const timerId = setTimeout(() => {
                step.classList.add('show');
                if (index === 0) this.playFeedbackSound('perfect');
                if (index === 1) this.playFeedbackSound('achievement');
                if (index === 3 && isNewRecord) this.playFeedbackSound('mega');
            }, 260 + index * 320);
            this.resultTimers.push(timerId);
        });

        const buttonTimer = setTimeout(() => {
            playAgain?.classList.add('show');
        }, 260 + steps.length * 320 + 60);
        this.resultTimers.push(buttonTimer);
    }

    restart() {
        if (this.resultTimers?.length) {
            this.resultTimers.forEach((timerId) => clearTimeout(timerId));
            this.resultTimers = [];
        }

        const overlay = this.container.querySelector('.mars-run-overlay');
        if (overlay) overlay.remove();

        this.resetState();
        this.buildInitialSegments();
        this.isPressingThrust = false;

        this.start();
    }

    render() {
        if (!this.ship || !this.track) return;

        const wobble = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
        this.canvas.style.transform = `translate(${wobble}px, ${wobble * 0.5}px)`;

        this.ship.style.left = '22%';
        this.ship.style.top = `${this.shipY}%`;
        this.ship.style.transform = `translate(-50%, -50%) rotate(${this.clamp(this.shipVy * 0.9, -28, 35)}deg)`;

        if (this.trackRenderTimer >= RUN_CONFIG.trackRenderIntervalSec || !this.lastTrackHtml) {
            const trackHtml = this.segments.map((segment) => {
                const topHeight = Math.max(0, segment.center - segment.gap / 2);
                const bottomStart = Math.min(100, segment.center + segment.gap / 2);
                const bottomHeight = 100 - bottomStart;

                return `
                    <div class="mars-run-block top" style="left:${segment.x}%; width:${RUN_CONFIG.segmentWidth}%; height:${topHeight}%"></div>
                    <div class="mars-run-block bottom" style="left:${segment.x}%; width:${RUN_CONFIG.segmentWidth}%; top:${bottomStart}%; height:${bottomHeight}%"></div>
                `;
            }).join('');

            if (trackHtml !== this.lastTrackHtml) {
                this.track.innerHTML = trackHtml;
                this.lastTrackHtml = trackHtml;
            }
            this.trackRenderTimer = 0;
        }

        this.scoreEl.textContent = String(this.score);
        this.bestEl.textContent = String(this.bestScore);
        this.comboEl.textContent = `x${Math.max(1, this.combo)}`;
        this.speedEl.textContent = `${(RUN_CONFIG.horizontalSpeed * (1 + Math.min(0.9, this.distance / 2200))).toFixed(0)}`;
        this.distanceEl.textContent = `${Math.round(this.distance)}`;
        if (this.achievementsEl) {
            this.achievementsEl.textContent = `${this.unlockedAchievements.size}/3`;
        }

        const danger = this.shipY < 14 || this.shipY > 86;
        this.statusEl.textContent = this.dead ? 'DEAD' : danger ? 'RISK' : 'FLOW';
        this.statusEl.style.color = this.dead ? '#ff4d6d' : danger ? '#ffd166' : '#7ae582';

        const fuelSafe = Math.round(this.fuel);
        this.fuelFillEl.style.width = `${fuelSafe}%`;
        this.fuelTextEl.textContent = `${fuelSafe}%`;
        this.fuelFillEl.style.background = fuelSafe < 25
            ? 'linear-gradient(90deg, #ff4d6d, #ff758f)'
            : fuelSafe < 55
                ? 'linear-gradient(90deg, #ffd166, #fca311)'
                : 'linear-gradient(90deg, #00f5d4, #4cc9f0)';
    }

    destroy() {
        this.isRunning = false;

        if (this.resultTimers?.length) {
            this.resultTimers.forEach((timerId) => clearTimeout(timerId));
            this.resultTimers = [];
        }

        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }

        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    randRange(min, max) {
        return min + Math.random() * (max - min);
    }

    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
}

const marsRunStyles = document.createElement('style');
marsRunStyles.textContent = `
    .mars-run-game {
        background: rgba(10, 0, 21, 0.92);
        border-radius: 20px;
        border: 2px solid var(--neon-cyan);
        padding: 1rem;
        font-family: 'Orbitron', sans-serif;
    }

    .mars-run-head {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .mars-run-stat {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 0.45rem 0.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .mars-run-stat span {
        color: var(--color-gray);
        font-size: 0.7rem;
    }

    .mars-run-stat strong {
        color: var(--neon-cyan);
        font-size: 1.05rem;
    }

    .mars-run-fuel {
        position: relative;
        height: 20px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-bottom: 0.8rem;
    }

    .mars-run-fuel-fill {
        height: 100%;
        width: 100%;
        transition: width 0.15s linear;
        background: linear-gradient(90deg, #00f5d4, #4cc9f0);
    }

    .mars-run-fuel span {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 0.75rem;
        color: #fff;
        text-shadow: 0 0 6px rgba(0,0,0,0.6);
        font-weight: 700;
    }

    .mars-run-canvas {
        position: relative;
        height: 420px;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 0.8rem;
        background: radial-gradient(circle at 20% 20%, #2a1f55, #0c0a18 55%, #12040a 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mars-run-stars {
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.9), transparent),
            radial-gradient(2px 2px at 140px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 280px 180px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 420px 40px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 520px 260px, rgba(255,255,255,0.8), transparent);
        opacity: 0.7;
    }

    .mars-run-track {
        position: absolute;
        inset: 0;
    }

    .mars-run-block {
        position: absolute;
        background: linear-gradient(160deg, #5c3d2e, #8d6748);
        box-shadow: inset 0 0 18px rgba(0,0,0,0.45), 0 0 18px rgba(237, 137, 54, 0.25);
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        border-right: 1px solid rgba(0, 0, 0, 0.2);
    }

    .mars-run-block.top {
        top: 0;
        border-bottom: 3px solid rgba(255, 185, 100, 0.45);
    }

    .mars-run-block.bottom {
        border-top: 3px solid rgba(255, 185, 100, 0.45);
    }

    .mars-run-ship {
        position: absolute;
        left: 22%;
        top: 50%;
        z-index: 5;
        font-size: 2.2rem;
        filter: drop-shadow(0 0 14px rgba(76, 201, 240, 0.9));
        will-change: transform, top;
        user-select: none;
    }

    .mars-run-hint {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,0.8);
        font-size: 0.82rem;
        text-align: center;
        z-index: 4;
        background: rgba(0,0,0,0.25);
        border-radius: 999px;
        padding: 0.25rem 0.65rem;
    }

    .mars-run-perfect {
        position: absolute;
        left: 50%;
        top: 18%;
        transform: translate(-50%, 0);
        color: #7ae582;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-shadow: 0 0 14px rgba(122, 229, 130, 0.95);
        animation: marsRunPerfectPop 0.42s ease-out forwards;
        pointer-events: none;
        z-index: 8;
    }

    @keyframes marsRunPerfectPop {
        0% { opacity: 0; transform: translate(-50%, 8px) scale(0.85); }
        22% { opacity: 1; transform: translate(-50%, 0) scale(1.06); }
        100% { opacity: 0; transform: translate(-50%, -16px) scale(0.98); }
    }

    .mars-run-controls {
        display: flex;
        justify-content: center;
        gap: 0.6rem;
    }

    .mars-run-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        display: grid;
        place-items: center;
        z-index: 30;
    }

    .mars-run-result {
        width: min(92%, 430px);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(14, 12, 31, 0.95);
        padding: 1.2rem 1rem;
        text-align: center;
    }

    .mars-run-result h2 {
        color: #ff758f;
        margin: 0 0 0.55rem;
    }

    .mars-run-result p {
        margin: 0.3rem 0;
        color: #d6d3f0;
    }

    .mars-run-reason {
        margin-bottom: 0.6rem !important;
    }

    .mars-run-step {
        margin: 0.35rem 0;
        color: #d6d3f0;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.24s ease, transform 0.24s ease;
    }

    .mars-run-step.show {
        opacity: 1;
        transform: translateY(0);
    }

    .mars-run-step.record-new {
        color: #7ae582;
        text-shadow: 0 0 12px rgba(122, 229, 130, 0.45);
    }

    .mars-run-play-again {
        margin-top: 0.7rem;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.24s ease, transform 0.24s ease;
    }

    .mars-run-play-again.show {
        opacity: 1;
        transform: translateY(0);
    }

    .mars-run-toast {
        position: absolute;
        left: 50%;
        top: 24%;
        transform: translate(-50%, 0);
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        font-weight: 700;
        letter-spacing: 0.03em;
        animation: marsRunToast 0.9s ease-out forwards;
        pointer-events: none;
        z-index: 8;
    }

    .mars-run-toast.achievement {
        color: #0c0a18;
        background: linear-gradient(90deg, #7ae582, #4cc9f0);
        box-shadow: 0 0 16px rgba(122, 229, 130, 0.55);
    }

    @keyframes marsRunToast {
        0% { opacity: 0; transform: translate(-50%, 8px) scale(0.92); }
        12% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -14px) scale(0.97); }
    }

    @media (max-width: 768px) {
        .mars-run-canvas {
            height: 330px;
        }

        .mars-run-ship {
            font-size: 1.85rem;
        }
    }
`;

if (!document.getElementById('mars-run-styles')) {
    marsRunStyles.id = 'mars-run-styles';
    document.head.appendChild(marsRunStyles);
}

window.MarsLandingGame = MarsLandingGame;
