// Mars Landing Simulator - Full Physics Game v2

class MarsLandingGame {
    constructor(containerElement, callback) {
        // Version marker
        console.log('🚀 mars-landing v2 loaded');
        
        this.container = typeof containerElement === 'string' 
            ? document.getElementById(containerElement) 
            : containerElement;
        this.callback = callback;
        
        // Physics constants
        this.MARS_GRAVITY = 3.71; // m/s² (Mars gravity - pulls down)
        this.THRUST_POWER = 6.0;  // m/s² (upward acceleration when thrusting)
        this.SIDE_THRUST_POWER = 3.0; // m/s² (horizontal acceleration)
        this.ROTATION_SPEED = 90; // degrees/s
        
        // Safe landing thresholds
        this.VY_SAFE = 5.0; // m/s (max safe vertical velocity)
        this.VX_SAFE = 3.0; // m/s (max safe horizontal velocity)
        this.ANGLE_SAFE = 15; // degrees (max safe angle)
        
        // Game state
        this.altitude = 500; // meters (starts high)
        this.velocity = 0; // m/s (positive = falling down, negative = rising up)
        this.horizontalVelocity = 0; // m/s
        this.horizontalPosition = 50; // percent (0-100)
        this.fuel = 100; // percentage
        this.angle = 0; // degrees (-45 to 45, 0 = upright)
        
        // Control state
        this.isThrusting = false;
        this.isTiltingLeft = false;
        this.isTiltingRight = false;
        this.isRotatingLeft = false;
        this.isRotatingRight = false;
        
        // Animation
        this.gameActive = false;
        this.animationFrame = null;
        this.lastTime = null;
        this.landingChecked = false; // Prevent double-fire
        
        // Landing pad (single pad in center)
        this.landingPad = { start: 40, end: 60, label: '🎯 Landing Pad' };
        
        // Wind (difficulty-based)
        this.difficulty = 'normal'; // easy, normal, hard
        this.windForce = 0;
        this.windTimer = 0;
        
        // Particles
        this.particles = [];
    }
    
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = this.createGameHTML();
        this.setupControls();
        this.start();
    }
    
    createGameHTML() {
        return `
            <div class="mars-landing-game" id="mars-landing-container">
                <div class="game-header">
                    <div class="game-stat">
                        <span class="stat-label">Высота:</span>
                        <span class="stat-value" id="altitude-display">500m</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">↓ Верт. скорость:</span>
                        <span class="stat-value" id="velocity-display">0.0m/s</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">→ Гориз. скорость:</span>
                        <span class="stat-value" id="hvelocity-display">0.0m/s</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Угол:</span>
                        <span class="stat-value" id="angle-display">0°</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Топливо:</span>
                        <div class="fuel-gauge">
                            <div class="fuel-fill" id="fuel-fill" style="width: 100%"></div>
                            <span class="fuel-percent" id="fuel-percent">100%</span>
                        </div>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Статус:</span>
                        <span class="stat-value safety-indicator" id="safety-indicator">SAFE</span>
                    </div>
                </div>
                
                <div class="game-canvas" id="game-canvas">
                    <div class="lander" id="lander">
                        <div class="lander-body">🚀</div>
                        <div class="thruster-particles" id="thruster-particles"></div>
                    </div>
                    <div class="terrain" id="terrain">
                        <div class="landing-zone safe" 
                             style="left: ${this.landingPad.start}%; width: ${this.landingPad.end - this.landingPad.start}%">
                            <span class="zone-label">${this.landingPad.label}</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="game-btn tilt-btn" id="tilt-left-btn">◄ Влево (A)</button>
                    <button class="game-btn thrust-btn" id="thrust-btn">▲ Двигатель (W/Space)</button>
                    <button class="game-btn tilt-btn" id="tilt-right-btn">Вправо (D) ►</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎯 Цель: Мягко приземлиться в зеленой зоне посадки</p>
                    <p>⚠️ Безопасно: Верт. &lt;${this.VY_SAFE}м/с, Гориз. &lt;${this.VX_SAFE}м/с, Угол &lt;${this.ANGLE_SAFE}°</p>
                    <p>⌨️ Управление: W/Space (тяга) • A/D или ◄/► (боковые двигатели) • Q/E (поворот) • R (рестарт)</p>
                </div>
            </div>
        `;
    }
    
    setupControls() {
        // Button controls
        const thrustBtn = document.getElementById('thrust-btn');
        const tiltLeftBtn = document.getElementById('tilt-left-btn');
        const tiltRightBtn = document.getElementById('tilt-right-btn');
        
        if (thrustBtn) {
            thrustBtn.addEventListener('mousedown', () => this.isThrusting = true);
            thrustBtn.addEventListener('mouseup', () => this.isThrusting = false);
            thrustBtn.addEventListener('mouseleave', () => this.isThrusting = false);
            thrustBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isThrusting = true;
            });
            thrustBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isThrusting = false;
            });
        }
        
        if (tiltLeftBtn) {
            tiltLeftBtn.addEventListener('mousedown', () => this.isTiltingLeft = true);
            tiltLeftBtn.addEventListener('mouseup', () => this.isTiltingLeft = false);
            tiltLeftBtn.addEventListener('mouseleave', () => this.isTiltingLeft = false);
            tiltLeftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isTiltingLeft = true;
            });
            tiltLeftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isTiltingLeft = false;
            });
        }
        
        if (tiltRightBtn) {
            tiltRightBtn.addEventListener('mousedown', () => this.isTiltingRight = true);
            tiltRightBtn.addEventListener('mouseup', () => this.isTiltingRight = false);
            tiltRightBtn.addEventListener('mouseleave', () => this.isTiltingRight = false);
            tiltRightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isTiltingRight = true;
            });
            tiltRightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isTiltingRight = false;
            });
        }
        
        // Keyboard controls
        this.keydownHandler = (e) => {
            if (e.code === 'Space' || e.code === 'KeyW') {
                e.preventDefault();
                this.isThrusting = true;
            } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                e.preventDefault();
                this.isTiltingLeft = true;
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                e.preventDefault();
                this.isTiltingRight = true;
            } else if (e.code === 'KeyQ') {
                e.preventDefault();
                this.isRotatingLeft = true;
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                this.isRotatingRight = true;
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.restart();
            }
        };
        
        this.keyupHandler = (e) => {
            if (e.code === 'Space' || e.code === 'KeyW') {
                e.preventDefault();
                this.isThrusting = false;
            } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                e.preventDefault();
                this.isTiltingLeft = false;
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                e.preventDefault();
                this.isTiltingRight = false;
            } else if (e.code === 'KeyQ') {
                e.preventDefault();
                this.isRotatingLeft = false;
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                this.isRotatingRight = false;
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    
    restart() {
        // Reset game state
        this.altitude = 500;
        this.velocity = 0;
        this.horizontalVelocity = 0;
        this.horizontalPosition = 50;
        this.fuel = 100;
        this.angle = 0;
        this.isThrusting = false;
        this.isTiltingLeft = false;
        this.isTiltingRight = false;
        this.isRotatingLeft = false;
        this.isRotatingRight = false;
        this.particles = [];
        this.landingChecked = false;
        this.windForce = 0;
        this.windTimer = 0;
        
        // Remove any existing result overlay
        const existingOverlay = this.container.querySelector('.game-result-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Restart game
        this.gameActive = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    start() {
        this.gameActive = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    destroy() {
        this.gameActive = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remove event listeners
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    gameLoop() {
        if (!this.gameActive) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Cap deltaTime to prevent huge jumps
        deltaTime = Math.min(deltaTime, 0.1);
        
        // Apply main thrust (reduces velocity = slows fall or goes up)
        if (this.isThrusting && this.fuel > 0) {
            this.velocity -= this.THRUST_POWER * deltaTime;
            this.fuel -= 10 * deltaTime; // Consume fuel
            this.fuel = Math.max(0, this.fuel);
            this.createThrusterParticles();
        }
        
        // Apply side thrusters (horizontal movement)
        if (this.isTiltingLeft && this.fuel > 0) {
            this.horizontalVelocity -= this.SIDE_THRUST_POWER * deltaTime;
            this.fuel -= 3 * deltaTime;
            this.fuel = Math.max(0, this.fuel);
        }
        if (this.isTiltingRight && this.fuel > 0) {
            this.horizontalVelocity += this.SIDE_THRUST_POWER * deltaTime;
            this.fuel -= 3 * deltaTime;
            this.fuel = Math.max(0, this.fuel);
        }
        
        // Apply rotation
        if (this.isRotatingLeft) {
            this.angle = Math.max(-45, this.angle - this.ROTATION_SPEED * deltaTime);
        }
        if (this.isRotatingRight) {
            this.angle = Math.min(45, this.angle + this.ROTATION_SPEED * deltaTime);
        }
        
        // Auto-stabilize angle slightly when not rotating
        if (!this.isRotatingLeft && !this.isRotatingRight) {
            this.angle *= 0.98;
        }
        
        // Apply Mars gravity (increases velocity = speeds up fall)
        this.velocity += this.MARS_GRAVITY * deltaTime;
        
        // Apply wind (on normal/hard difficulty)
        if (this.difficulty !== 'easy') {
            this.windTimer += deltaTime;
            if (this.windTimer > 2) { // Change wind every 2 seconds
                this.windTimer = 0;
                const windStrength = this.difficulty === 'hard' ? 0.8 : 0.4;
                this.windForce = (Math.random() - 0.5) * windStrength;
            }
            this.horizontalVelocity += this.windForce * deltaTime;
        }
        
        // Apply horizontal damping (air resistance)
        this.horizontalVelocity *= 0.99;
        
        // Update position
        this.altitude -= this.velocity * deltaTime;
        this.horizontalPosition += this.horizontalVelocity * deltaTime * 0.5;
        
        // Clamp horizontal position
        this.horizontalPosition = Math.max(0, Math.min(100, this.horizontalPosition));
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check landing/crash (only once)
        if (this.altitude <= 0 && !this.landingChecked) {
            this.altitude = 0;
            this.landingChecked = true;
            this.checkLanding();
        }
    }
    
    render() {
        // Update displays
        const altitudeDisplay = document.getElementById('altitude-display');
        const velocityDisplay = document.getElementById('velocity-display');
        const hvelocityDisplay = document.getElementById('hvelocity-display');
        const angleDisplay = document.getElementById('angle-display');
        const fuelFill = document.getElementById('fuel-fill');
        const fuelPercent = document.getElementById('fuel-percent');
        const safetyIndicator = document.getElementById('safety-indicator');
        const lander = document.getElementById('lander');
        
        if (altitudeDisplay) {
            altitudeDisplay.textContent = `${Math.max(0, Math.round(this.altitude))}m`;
        }
        
        if (velocityDisplay) {
            const absVelocity = Math.abs(this.velocity);
            velocityDisplay.textContent = `${absVelocity.toFixed(1)}m/s`;
            velocityDisplay.style.color = absVelocity > this.VY_SAFE ? '#ff0000' : '#00ff00';
        }
        
        if (hvelocityDisplay) {
            const absHVelocity = Math.abs(this.horizontalVelocity);
            hvelocityDisplay.textContent = `${absHVelocity.toFixed(1)}m/s`;
            hvelocityDisplay.style.color = absHVelocity > this.VX_SAFE ? '#ff0000' : '#00ff00';
        }
        
        if (angleDisplay) {
            const absAngle = Math.abs(this.angle);
            angleDisplay.textContent = `${absAngle.toFixed(0)}°`;
            angleDisplay.style.color = absAngle > this.ANGLE_SAFE ? '#ff0000' : '#00ff00';
        }
        
        if (fuelFill) {
            fuelFill.style.width = `${this.fuel}%`;
            fuelFill.style.backgroundColor = this.fuel < 20 ? '#ff0000' : this.fuel < 50 ? '#ffaa00' : '#00ff00';
        }
        
        if (fuelPercent) {
            fuelPercent.textContent = `${Math.round(this.fuel)}%`;
        }
        
        // Safety indicator
        if (safetyIndicator) {
            const isSafe = Math.abs(this.velocity) < this.VY_SAFE && 
                          Math.abs(this.horizontalVelocity) < this.VX_SAFE && 
                          Math.abs(this.angle) < this.ANGLE_SAFE;
            safetyIndicator.textContent = isSafe ? 'SAFE ✓' : 'RISK ⚠';
            safetyIndicator.style.color = isSafe ? '#00ff00' : '#ff0000';
        }
        
        // Update lander position (FIXED: was inverted before)
        if (lander) {
            // altitude goes from 500 (top) to 0 (bottom)
            // We want: altitude 500 -> top of canvas (100% from bottom)
            //          altitude 0 -> bottom of canvas (0% from bottom)
            const verticalPercent = (this.altitude / 500) * 100;
            lander.style.bottom = `${verticalPercent}%`;
            lander.style.left = `${this.horizontalPosition}%`;
            lander.style.transform = `translate(-50%, 0) rotate(${this.angle}deg)`;
        }
        
        // Render particles
        this.renderParticles();
    }
    
    createThrusterParticles() {
        const lander = document.getElementById('lander');
        if (!lander) return;
        
        for (let i = 0; i < 3; i++) {
            const particle = {
                x: this.horizontalPosition,
                y: this.altitude,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                life: 0.5,
                maxLife: 0.5,
                size: Math.random() * 4 + 2
            };
            this.particles.push(particle);
        }
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime;
            p.y -= p.vy * deltaTime * 20;
            p.x += p.vx * deltaTime * 5;
            return p.life > 0;
        });
    }
    
    renderParticles() {
        const container = document.getElementById('thruster-particles');
        if (!container) return;
        
        container.innerHTML = this.particles.map(p => {
            const opacity = p.life / p.maxLife;
            // Use same coordinate system as lander
            const verticalPercent = (p.y / 500) * 100;
            
            return `<div class="particle" style="
                position: absolute;
                bottom: ${verticalPercent}%;
                left: ${p.x}%;
                width: ${p.size}px;
                height: ${p.size}px;
                background: rgba(255, ${Math.floor(150 + opacity * 105)}, 0, ${opacity});
                border-radius: 50%;
                pointer-events: none;
            "></div>`;
        }).join('');
    }
    
    checkLanding() {
        this.gameActive = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        
        // Calculate landing parameters
        const landingVelocityY = Math.abs(this.velocity);
        const landingVelocityX = Math.abs(this.horizontalVelocity);
        const landingAngle = Math.abs(this.angle);
        
        // Check if in landing pad
        const inLandingPad = this.horizontalPosition >= this.landingPad.start && 
                            this.horizontalPosition <= this.landingPad.end;
        
        // Check if all parameters are safe
        const velocityYSafe = landingVelocityY <= this.VY_SAFE;
        const velocityXSafe = landingVelocityX <= this.VX_SAFE;
        const angleSafe = landingAngle <= this.ANGLE_SAFE;
        
        const success = inLandingPad && velocityYSafe && velocityXSafe && angleSafe;
        
        // Build detailed message
        let message = '';
        let failureReasons = [];
        
        if (!inLandingPad) {
            failureReasons.push('❌ Вне зоны посадки');
        }
        if (!velocityYSafe) {
            failureReasons.push(`❌ Верт. скорость слишком большая: ${landingVelocityY.toFixed(1)} м/с (макс: ${this.VY_SAFE})`);
        }
        if (!velocityXSafe) {
            failureReasons.push(`❌ Гориз. скорость слишком большая: ${landingVelocityX.toFixed(1)} м/с (макс: ${this.VX_SAFE})`);
        }
        if (!angleSafe) {
            failureReasons.push(`❌ Угол слишком большой: ${landingAngle.toFixed(0)}° (макс: ${this.ANGLE_SAFE}°)`);
        }
        
        // Calculate score and grade
        let score = 0;
        let grade = 'F';
        
        if (success) {
            // Score based on: softness (50), precision (30), fuel efficiency (20)
            const softnessScore = ((this.VY_SAFE - landingVelocityY) / this.VY_SAFE) * 50;
            
            // Precision: distance from center of pad
            const padCenter = (this.landingPad.start + this.landingPad.end) / 2;
            const padWidth = this.landingPad.end - this.landingPad.start;
            const distanceFromCenter = Math.abs(this.horizontalPosition - padCenter);
            const precisionScore = (1 - (distanceFromCenter / (padWidth / 2))) * 30;
            
            const fuelScore = (this.fuel / 100) * 20;
            
            score = Math.round(softnessScore + precisionScore + fuelScore);
            
            // Assign grade
            if (score >= 95) grade = 'S';
            else if (score >= 85) grade = 'A';
            else if (score >= 70) grade = 'B';
            else if (score >= 50) grade = 'C';
            else grade = 'D';
            
            message = `🎉 Успешная посадка!\n\nОценка: ${grade}\nОчки: ${score}\n\n✓ Верт. скорость: ${landingVelocityY.toFixed(1)} м/с\n✓ Гориз. скорость: ${landingVelocityX.toFixed(1)} м/с\n✓ Угол: ${landingAngle.toFixed(0)}°\n✓ Топливо: ${Math.round(this.fuel)}%`;
        } else {
            message = `💥 Авария при посадке!\n\n${failureReasons.join('\n')}`;
        }
        
        this.showResult(success, message, score, grade);
    }
    
    showResult(success, message, score, grade = 'F') {
        if (!this.container) return;
        
        // Remove any existing overlay first
        const existingOverlay = this.container.querySelector('.game-result-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'game-result-overlay';
        
        const gradeDisplay = success ? `<div class="grade-display grade-${grade}">${grade}</div>` : '';
        
        resultDiv.innerHTML = `
            <div class="game-result ${success ? 'success' : 'failure'}">
                <h2>${success ? '✅ Миссия выполнена!' : '❌ Миссия провалена'}</h2>
                ${gradeDisplay}
                <p class="result-message">${message}</p>
                <div class="result-buttons">
                    <button class="btn btn-secondary btn-large" id="game-restart-btn">🔄 Попробовать снова (R)</button>
                    <button class="btn btn-primary btn-large" id="game-continue-btn">Продолжить</button>
                </div>
            </div>
        `;
        
        this.container.appendChild(resultDiv);
        
        const continueBtn = document.getElementById('game-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (this.callback) {
                    this.callback(success, score);
                }
            });
        }
        
        const restartBtn = document.getElementById('game-restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
    }
}

// Add game styles
const marsLandingStyles = document.createElement('style');
marsLandingStyles.textContent = `
    .mars-landing-game {
        background: rgba(10, 0, 21, 0.95);
        border-radius: 20px;
        padding: 2rem;
        border: 2px solid var(--neon-cyan);
        font-family: 'Orbitron', sans-serif;
    }
    
    .game-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .game-stat {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        min-width: 100px;
    }
    
    .stat-label {
        font-size: 0.75rem;
        color: var(--color-gray);
        white-space: nowrap;
    }
    
    .stat-value {
        font-size: 1.2rem;
        color: var(--neon-cyan);
        font-weight: bold;
        transition: color 0.3s;
    }
    
    .safety-indicator {
        font-size: 1rem;
        font-weight: bold;
        text-shadow: 0 0 10px currentColor;
    }
    
    .fuel-gauge {
        width: 150px;
        height: 30px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        position: relative;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .fuel-fill {
        height: 100%;
        background: #00ff00;
        transition: width 0.2s, background-color 0.3s;
    }
    
    .fuel-percent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 0.9rem;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
    
    .game-canvas {
        position: relative;
        height: 400px;
        background: linear-gradient(180deg, #1a0a2e 0%, #3d1a1a 100%);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }
    
    .lander {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 0);
        transition: transform 0.1s;
        z-index: 10;
    }
    
    .lander-body {
        font-size: 3rem;
        filter: drop-shadow(0 0 10px rgba(76, 201, 240, 0.8));
    }
    
    .thruster-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
    
    .terrain {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: #8B4513;
        border-top: 3px solid #654321;
    }
    
    .landing-zone {
        position: absolute;
        bottom: 0;
        height: 100%;
        border-top: 4px solid;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .landing-zone.safe {
        background: rgba(0, 255, 0, 0.2);
        border-color: #00ff00;
    }
    
    .landing-zone.danger {
        background: rgba(255, 0, 0, 0.2);
        border-color: #ff0000;
    }
    
    .zone-label {
        color: white;
        font-size: 0.9rem;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
    
    .game-controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .game-btn {
        padding: 15px 30px;
        font-size: 1rem;
        font-family: 'Orbitron', sans-serif;
        border: 2px solid var(--neon-cyan);
        background: rgba(76, 201, 240, 0.1);
        color: white;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
        min-width: 48px;
        min-height: 48px;
    }
    
    .game-btn:hover {
        background: rgba(76, 201, 240, 0.3);
        box-shadow: 0 0 20px rgba(76, 201, 240, 0.6);
    }
    
    .game-btn:active {
        transform: scale(0.95);
        box-shadow: 0 0 30px rgba(76, 201, 240, 0.9);
    }
    
    .thrust-btn {
        border-color: var(--neon-pink);
        background: rgba(255, 0, 191, 0.1);
    }
    
    .thrust-btn:hover {
        background: rgba(255, 0, 191, 0.3);
        box-shadow: 0 0 20px rgba(255, 0, 191, 0.6);
    }
    
    .game-instructions {
        text-align: center;
        color: var(--color-gray);
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    .game-instructions p {
        margin: 0.3rem 0;
    }
    
    .game-result-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in;
    }
    
    .game-result {
        background: rgba(22, 33, 62, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
        border: 2px solid;
        max-width: 500px;
    }
    
    .game-result.success {
        border-color: #00ff00;
        box-shadow: 0 0 40px rgba(0, 255, 0, 0.4);
    }
    
    .game-result.failure {
        border-color: #ff0000;
        box-shadow: 0 0 40px rgba(255, 0, 0, 0.4);
    }
    
    .game-result h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .game-result p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: var(--color-gray);
    }
    
    .result-message {
        white-space: pre-line;
        line-height: 1.6;
        text-align: left;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }
    
    .result-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .grade-display {
        font-size: 5rem;
        font-weight: bold;
        margin: 1rem 0;
        text-shadow: 0 0 30px currentColor;
        animation: gradeAppear 0.5s ease-out;
    }
    
    .grade-S { color: #FFD700; }
    .grade-A { color: #00FF00; }
    .grade-B { color: #4CAF50; }
    .grade-C { color: #FFA500; }
    .grade-D { color: #FF6B6B; }
    .grade-F { color: #FF0000; }
    
    @keyframes gradeAppear {
        from {
            transform: scale(0);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .game-header {
            flex-direction: row;
            justify-content: space-around;
        }
        
        .game-stat {
            min-width: 80px;
        }
        
        .stat-label {
            font-size: 0.65rem;
        }
        
        .stat-value {
            font-size: 1rem;
        }
        
        .game-canvas {
            height: 300px;
        }
        
        .lander-body {
            font-size: 2rem;
        }
    }
`;
document.head.appendChild(marsLandingStyles);

// Export
window.MarsLandingGame = MarsLandingGame;
