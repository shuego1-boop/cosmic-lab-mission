// Mars Landing Simulator - Full Physics Game

class MarsLandingGame {
    constructor(containerElement, callback) {
        this.container = typeof containerElement === 'string' 
            ? document.getElementById(containerElement) 
            : containerElement;
        this.callback = callback;
        
        // Physics constants
        this.MARS_GRAVITY = 3.71; // m/s² (Mars gravity)
        this.THRUST_POWER = 5.0;  // m/s² (upward acceleration when thrusting)
        this.TILT_POWER = 2.0;    // m/s² (horizontal acceleration)
        this.MAX_LANDING_VELOCITY = 5.0; // m/s (max safe landing speed)
        
        // Game state
        this.altitude = 500; // meters
        this.velocity = 0; // m/s (positive = falling, negative = rising)
        this.horizontalVelocity = 0; // m/s
        this.horizontalPosition = 50; // percent (0-100)
        this.fuel = 100; // percentage
        this.tilt = 0; // degrees (-30 to 30)
        
        // Control state
        this.isThrusting = false;
        this.isTiltingLeft = false;
        this.isTiltingRight = false;
        
        // Animation
        this.gameActive = false;
        this.animationFrame = null;
        this.lastTime = null;
        
        // Terrain
        this.landingZones = [
            { start: 30, end: 40, safe: true, label: 'Зона A' },
            { start: 55, end: 70, safe: true, label: 'Зона B' }
        ];
        
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
                        <span class="stat-label">Скорость:</span>
                        <span class="stat-value" id="velocity-display">0.0m/s</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Топливо:</span>
                        <div class="fuel-gauge">
                            <div class="fuel-fill" id="fuel-fill" style="width: 100%"></div>
                            <span class="fuel-percent" id="fuel-percent">100%</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-canvas" id="game-canvas">
                    <div class="lander" id="lander">
                        <div class="lander-body">🚀</div>
                        <div class="thruster-particles" id="thruster-particles"></div>
                    </div>
                    <div class="terrain" id="terrain">
                        ${this.landingZones.map(zone => `
                            <div class="landing-zone ${zone.safe ? 'safe' : 'danger'}" 
                                 style="left: ${zone.start}%; width: ${zone.end - zone.start}%">
                                <span class="zone-label">${zone.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="game-btn tilt-btn" id="tilt-left-btn">◄ Влево</button>
                    <button class="game-btn thrust-btn" id="thrust-btn">▲ Двигатель (Пробел)</button>
                    <button class="game-btn tilt-btn" id="tilt-right-btn">Вправо ►</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎯 Цель: Мягко приземлиться в зеленой зоне</p>
                    <p>⚠️ Скорость при посадке должна быть &lt; ${this.MAX_LANDING_VELOCITY} м/с</p>
                    <p>⌨️ Управление: Стрелки (лево/право), Пробел (тяга)</p>
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
            if (e.code === 'Space') {
                e.preventDefault();
                this.isThrusting = true;
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.isTiltingLeft = true;
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.isTiltingRight = true;
            }
        };
        
        this.keyupHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isThrusting = false;
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.isTiltingLeft = false;
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.isTiltingRight = false;
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
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
        // Apply thrust
        if (this.isThrusting && this.fuel > 0) {
            this.velocity -= this.THRUST_POWER * deltaTime;
            this.fuel -= 10 * deltaTime; // Consume fuel
            this.fuel = Math.max(0, this.fuel);
            this.createThrusterParticles();
        }
        
        // Apply tilt
        if (this.isTiltingLeft) {
            this.tilt = Math.max(-30, this.tilt - 60 * deltaTime);
            this.horizontalVelocity -= this.TILT_POWER * deltaTime;
        } else if (this.isTiltingRight) {
            this.tilt = Math.min(30, this.tilt + 60 * deltaTime);
            this.horizontalVelocity += this.TILT_POWER * deltaTime;
        } else {
            // Return to center
            this.tilt *= 0.95;
        }
        
        // Apply Mars gravity
        this.velocity += this.MARS_GRAVITY * deltaTime;
        
        // Update position
        this.altitude -= this.velocity * deltaTime;
        this.horizontalPosition += this.horizontalVelocity * deltaTime * 0.5;
        
        // Clamp horizontal position
        this.horizontalPosition = Math.max(0, Math.min(100, this.horizontalPosition));
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check landing/crash
        if (this.altitude <= 0) {
            this.altitude = 0;
            this.checkLanding();
        }
    }
    
    render() {
        // Update displays
        const altitudeDisplay = document.getElementById('altitude-display');
        const velocityDisplay = document.getElementById('velocity-display');
        const fuelFill = document.getElementById('fuel-fill');
        const fuelPercent = document.getElementById('fuel-percent');
        const lander = document.getElementById('lander');
        
        if (altitudeDisplay) {
            altitudeDisplay.textContent = `${Math.max(0, Math.round(this.altitude))}m`;
        }
        
        if (velocityDisplay) {
            const absVelocity = Math.abs(this.velocity);
            velocityDisplay.textContent = `${absVelocity.toFixed(1)}m/s`;
            velocityDisplay.style.color = absVelocity > this.MAX_LANDING_VELOCITY ? '#ff0000' : '#00ff00';
        }
        
        if (fuelFill) {
            fuelFill.style.width = `${this.fuel}%`;
            fuelFill.style.backgroundColor = this.fuel < 20 ? '#ff0000' : this.fuel < 50 ? '#ffaa00' : '#00ff00';
        }
        
        if (fuelPercent) {
            fuelPercent.textContent = `${Math.round(this.fuel)}%`;
        }
        
        // Update lander position and rotation
        if (lander) {
            const canvasHeight = 400; // Height of game canvas
            const verticalPercent = Math.max(0, Math.min(100, (1 - this.altitude / 500) * 100));
            lander.style.bottom = `${verticalPercent}%`;
            lander.style.left = `${this.horizontalPosition}%`;
            lander.style.transform = `translate(-50%, 0) rotate(${this.tilt}deg)`;
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
            const canvasHeight = 400;
            const verticalPercent = Math.max(0, Math.min(100, (1 - p.y / 500) * 100));
            
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
        
        const landingVelocity = Math.abs(this.velocity);
        const inSafeZone = this.landingZones.some(zone => 
            zone.safe && 
            this.horizontalPosition >= zone.start && 
            this.horizontalPosition <= zone.end
        );
        
        const success = landingVelocity <= this.MAX_LANDING_VELOCITY && inSafeZone;
        
        let message = '';
        let score = 0;
        
        if (success) {
            score = Math.round((1 - landingVelocity / this.MAX_LANDING_VELOCITY) * 50 + this.fuel / 2);
            message = `🎉 Успешная посадка! Скорость: ${landingVelocity.toFixed(1)} м/с. Счет: ${score}`;
        } else if (!inSafeZone) {
            message = `💥 Авария! Посадка вне безопасной зоны.`;
        } else {
            message = `💥 Слишком быстрая посадка! Скорость: ${landingVelocity.toFixed(1)} м/с (макс: ${this.MAX_LANDING_VELOCITY} м/с)`;
        }
        
        this.showResult(success, message, score);
    }
    
    showResult(success, message, score) {
        if (!this.container) return;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'game-result-overlay';
        resultDiv.innerHTML = `
            <div class="game-result ${success ? 'success' : 'failure'}">
                <h2>${success ? '✅ Миссия выполнена!' : '❌ Миссия провалена'}</h2>
                <p>${message}</p>
                <button class="btn btn-primary btn-large" id="game-continue-btn">Продолжить</button>
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
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .game-stat {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: var(--color-gray);
    }
    
    .stat-value {
        font-size: 1.5rem;
        color: var(--neon-cyan);
        font-weight: bold;
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
    
    @media (max-width: 768px) {
        .game-header {
            flex-direction: column;
            align-items: center;
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
