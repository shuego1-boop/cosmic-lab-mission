// Asteroid Navigator - Dodge and Collect Game

class AsteroidNavigatorGame {
    constructor(containerElement, callback) {
        this.container = typeof containerElement === 'string' 
            ? document.getElementById(containerElement) 
            : containerElement;
        this.callback = callback;
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.time = 0;
        this.gameActive = false;
        this.difficulty = 1;
        
        // Player
        this.playerPosition = 50; // percent (0-100)
        this.playerWidth = 8; // percent
        
        // Asteroids and collectibles
        this.asteroids = [];
        this.collectibles = [];
        this.nextAsteroidSpawn = 0;
        this.nextCollectibleSpawn = 0;
        
        // Animation
        this.animationFrame = null;
        this.lastTime = null;
        
        // Constants
        this.ASTEROID_SPAWN_RATE = 1.5; // seconds
        this.COLLECTIBLE_SPAWN_RATE = 4; // seconds
        this.BASE_SPEED = 150; // pixels per second
        this.DIFFICULTY_INCREASE_INTERVAL = 10; // seconds
    }
    
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = this.createGameHTML();
        this.setupControls();
        this.start();
    }
    
    createGameHTML() {
        return `
            <div class="asteroid-navigator-game">
                <div class="game-header">
                    <div class="game-stat">
                        <span class="stat-label">Счет:</span>
                        <span class="stat-value" id="game-score">0</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Жизни:</span>
                        <span class="stat-value" id="game-lives">❤️ ❤️ ❤️</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Время:</span>
                        <span class="stat-value" id="game-time">0s</span>
                    </div>
                </div>
                
                <div class="game-canvas" id="asteroid-canvas">
                    <div class="spaceship" id="player-ship">🚀</div>
                    <div class="game-objects" id="game-objects"></div>
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="move-left-btn">◄ Влево</button>
                    <button class="game-btn" id="move-right-btn">Вправо ►</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎯 Уклоняйтесь от астероидов и собирайте бонусы!</p>
                    <p>⭐ Топливо = +10 очков | 🛡️ Щит = +1 жизнь</p>
                    <p>⌨️ Управление: Стрелки ← → или кнопки</p>
                </div>
            </div>
        `;
    }
    
    setupControls() {
        const moveLeftBtn = document.getElementById('move-left-btn');
        const moveRightBtn = document.getElementById('move-right-btn');
        
        // Button controls
        if (moveLeftBtn) {
            moveLeftBtn.addEventListener('click', () => this.movePlayer(-15));
            moveLeftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.movePlayer(-15);
            });
        }
        
        if (moveRightBtn) {
            moveRightBtn.addEventListener('click', () => this.movePlayer(15));
            moveRightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.movePlayer(15);
            });
        }
        
        // Keyboard controls
        this.keydownHandler = (e) => {
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.movePlayer(-15);
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.movePlayer(15);
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
    }
    
    movePlayer(delta) {
        this.playerPosition += delta;
        this.playerPosition = Math.max(this.playerWidth / 2, Math.min(100 - this.playerWidth / 2, this.playerPosition));
    }
    
    start() {
        this.gameActive = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameActive) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update time and difficulty
        this.time += deltaTime;
        this.difficulty = 1 + Math.floor(this.time / this.DIFFICULTY_INCREASE_INTERVAL) * 0.3;
        
        // Spawn asteroids
        this.nextAsteroidSpawn -= deltaTime;
        if (this.nextAsteroidSpawn <= 0) {
            this.spawnAsteroid();
            this.nextAsteroidSpawn = this.ASTEROID_SPAWN_RATE / this.difficulty;
        }
        
        // Spawn collectibles
        this.nextCollectibleSpawn -= deltaTime;
        if (this.nextCollectibleSpawn <= 0) {
            this.spawnCollectible();
            this.nextCollectibleSpawn = this.COLLECTIBLE_SPAWN_RATE;
        }
        
        // Update asteroids
        this.asteroids = this.asteroids.filter(asteroid => {
            asteroid.y += this.BASE_SPEED * this.difficulty * deltaTime;
            
            // Check collision with player
            if (asteroid.y >= 85 && asteroid.y <= 95) {
                const distance = Math.abs(asteroid.x - this.playerPosition);
                if (distance < this.playerWidth) {
                    this.handleCollision();
                    return false;
                }
            }
            
            return asteroid.y < 110;
        });
        
        // Update collectibles
        this.collectibles = this.collectibles.filter(collectible => {
            collectible.y += this.BASE_SPEED * this.difficulty * deltaTime;
            
            // Check collection
            if (collectible.y >= 85 && collectible.y <= 95) {
                const distance = Math.abs(collectible.x - this.playerPosition);
                if (distance < this.playerWidth) {
                    this.handleCollection(collectible.type);
                    return false;
                }
            }
            
            return collectible.y < 110;
        });
    }
    
    spawnAsteroid() {
        this.asteroids.push({
            x: Math.random() * 90 + 5,
            y: -5,
            size: Math.random() * 30 + 40,
            rotation: Math.random() * 360
        });
    }
    
    spawnCollectible() {
        const types = ['fuel', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.collectibles.push({
            x: Math.random() * 90 + 5,
            y: -5,
            type: type,
            size: 35
        });
    }
    
    handleCollision() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            // Visual feedback
            const ship = document.getElementById('player-ship');
            if (ship) {
                ship.style.animation = 'hit-flash 0.5s';
                setTimeout(() => {
                    ship.style.animation = '';
                }, 500);
            }
        }
    }
    
    handleCollection(type) {
        if (type === 'fuel') {
            this.score += 10;
        } else if (type === 'shield') {
            this.lives = Math.min(3, this.lives + 1);
        }
    }
    
    render() {
        // Update HUD
        const scoreEl = document.getElementById('game-score');
        const livesEl = document.getElementById('game-lives');
        const timeEl = document.getElementById('game-time');
        
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        
        if (livesEl) {
            livesEl.textContent = '❤️ '.repeat(this.lives) + '🖤 '.repeat(3 - this.lives);
        }
        
        if (timeEl) {
            timeEl.textContent = `${Math.floor(this.time)}s`;
        }
        
        // Update player position
        const ship = document.getElementById('player-ship');
        if (ship) {
            ship.style.left = `${this.playerPosition}%`;
        }
        
        // Render asteroids and collectibles
        const objectsContainer = document.getElementById('game-objects');
        if (objectsContainer) {
            objectsContainer.innerHTML = [
                ...this.asteroids.map(a => `
                    <div class="asteroid" style="
                        left: ${a.x}%;
                        top: ${a.y}%;
                        width: ${a.size}px;
                        height: ${a.size}px;
                        transform: translate(-50%, -50%) rotate(${a.rotation}deg);
                    ">☄️</div>
                `),
                ...this.collectibles.map(c => `
                    <div class="collectible ${c.type}" style="
                        left: ${c.x}%;
                        top: ${c.y}%;
                        width: ${c.size}px;
                        height: ${c.size}px;
                        transform: translate(-50%, -50%);
                    ">${c.type === 'fuel' ? '⭐' : '🛡️'}</div>
                `)
            ].join('');
        }
    }
    
    endGame(forceEnd = false) {
        this.gameActive = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.removeEventListener('keydown', this.keydownHandler);
        
        const survivalTime = Math.floor(this.time);
        const finalScore = this.score + survivalTime;
        const success = this.lives > 0 && !forceEnd;
        
        this.showResult(success, finalScore, survivalTime);
    }
    
    showResult(success, finalScore, survivalTime) {
        if (!this.container) return;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'game-result-overlay';
        resultDiv.innerHTML = `
            <div class="game-result ${success ? 'success' : 'failure'}">
                <h2>${success ? '🎉 Отличный результат!' : '💥 Игра окончена'}</h2>
                <p>Счет: ${finalScore}</p>
                <p>Время выживания: ${survivalTime}s</p>
                <button class="btn btn-primary btn-large" id="game-continue-btn">Продолжить</button>
            </div>
        `;
        
        this.container.appendChild(resultDiv);
        
        const continueBtn = document.getElementById('game-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (this.callback) {
                    this.callback(success, finalScore);
                }
            });
        }
    }
}

// Add game styles
const asteroidNavigatorStyles = document.createElement('style');
asteroidNavigatorStyles.textContent = `
    .asteroid-navigator-game {
        background: rgba(10, 0, 21, 0.95);
        border-radius: 20px;
        padding: 2rem;
        border: 2px solid var(--neon-purple);
        font-family: 'Orbitron', sans-serif;
    }
    
    .asteroid-navigator-game .game-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .asteroid-navigator-game .game-stat {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .asteroid-navigator-game .stat-label {
        font-size: 0.9rem;
        color: var(--color-gray);
    }
    
    .asteroid-navigator-game .stat-value {
        font-size: 1.5rem;
        color: var(--neon-purple);
        font-weight: bold;
    }
    
    #asteroid-canvas {
        position: relative;
        height: 500px;
        background: linear-gradient(180deg, #0a0a2e 0%, #1a0a2e 100%);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }
    
    .spaceship {
        position: absolute;
        bottom: 5%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 3rem;
        filter: drop-shadow(0 0 10px rgba(76, 201, 240, 0.8));
        z-index: 10;
        transition: left 0.2s ease-out;
    }
    
    @keyframes hit-flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; filter: drop-shadow(0 0 20px rgba(255, 0, 0, 1)); }
    }
    
    .game-objects {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .asteroid {
        position: absolute;
        font-size: 2rem;
        animation: rotate-asteroid 2s linear infinite;
    }
    
    @keyframes rotate-asteroid {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .collectible {
        position: absolute;
        font-size: 2rem;
        animation: pulse-collectible 1s ease-in-out infinite;
    }
    
    @keyframes pulse-collectible {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
    }
    
    .asteroid-navigator-game .game-controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .asteroid-navigator-game .game-btn {
        padding: 15px 30px;
        font-size: 1rem;
        font-family: 'Orbitron', sans-serif;
        border: 2px solid var(--neon-purple);
        background: rgba(191, 0, 255, 0.1);
        color: white;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
        min-width: 48px;
        min-height: 48px;
    }
    
    .asteroid-navigator-game .game-btn:hover {
        background: rgba(191, 0, 255, 0.3);
        box-shadow: 0 0 20px rgba(191, 0, 255, 0.6);
    }
    
    .asteroid-navigator-game .game-btn:active {
        transform: scale(0.95);
    }
    
    .asteroid-navigator-game .game-instructions {
        text-align: center;
        color: var(--color-gray);
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    .asteroid-navigator-game .game-instructions p {
        margin: 0.3rem 0;
    }
    
    @media (max-width: 768px) {
        #asteroid-canvas {
            height: 400px;
        }
        
        .spaceship {
            font-size: 2rem;
        }
    }
`;
document.head.appendChild(asteroidNavigatorStyles);

// Export
window.AsteroidNavigatorGame = AsteroidNavigatorGame;
