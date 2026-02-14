// Resource Collector - Strategy Click Game

class ResourceCollectorGame {
    constructor(containerId, callback) {
        this.containerId = containerId;
        this.callback = callback;
        
        // Game state
        this.score = 0;
        this.timeLeft = 30;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameActive = false;
        
        // Resources
        this.resources = [];
        this.resourceTypes = [
            { name: 'H₂O', emoji: '💧', value: 10, label: 'Вода (лёд)' },
            { name: 'Fe₂O₃', emoji: '🔴', value: 15, label: 'Оксид железа' },
            { name: 'CO₂', emoji: '🌫️', value: 8, label: 'Углекислый газ' },
            { name: 'SiO₂', emoji: '⚪', value: 12, label: 'Кремнезем' },
            { name: 'CH₄', emoji: '💨', value: 20, label: 'Метан' }
        ];
        
        // Animation
        this.animationFrame = null;
        this.lastTime = null;
        this.lastComboTime = 0;
    }
    
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = this.createGameHTML();
        this.start();
    }
    
    createGameHTML() {
        return `
            <div class="resource-collector-game">
                <div class="game-header">
                    <div class="game-stat">
                        <span class="stat-label">Счет:</span>
                        <span class="stat-value" id="resource-score">0</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Комбо:</span>
                        <span class="stat-value" id="resource-combo">x1</span>
                    </div>
                    <div class="game-stat">
                        <span class="stat-label">Время:</span>
                        <span class="stat-value" id="resource-time">30s</span>
                    </div>
                </div>
                
                <div class="resource-field" id="resource-field">
                    <!-- Resources will spawn here -->
                </div>
                
                <div class="resource-info-panel">
                    <h4>Ресурсы Марса:</h4>
                    <div class="resource-legend">
                        ${this.resourceTypes.map(r => `
                            <div class="legend-item">
                                <span class="legend-emoji">${r.emoji}</span>
                                <span class="legend-name">${r.name}</span>
                                <span class="legend-label">${r.label}</span>
                                <span class="legend-value">+${r.value} очков</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="game-instructions">
                    <p>🎯 Собирайте ресурсы Марса до истечения времени!</p>
                    <p>🔥 Комбо: Собирайте быстро для множителя очков!</p>
                </div>
            </div>
        `;
    }
    
    start() {
        this.gameActive = true;
        this.lastTime = performance.now();
        this.lastComboTime = this.lastTime;
        this.spawnResource();
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
        // Update timer
        this.timeLeft -= deltaTime;
        
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.endGame();
            return;
        }
        
        // Reset combo if too slow
        const timeSinceLastClick = (performance.now() - this.lastComboTime) / 1000;
        if (timeSinceLastClick > 2 && this.combo > 1) {
            this.combo = 1;
        }
        
        // Update resource animations
        this.resources.forEach(resource => {
            resource.life += deltaTime;
            
            // Remove if too old
            if (resource.life > 5) {
                this.removeResource(resource.id);
            }
        });
        
        // Spawn new resources
        if (this.resources.length < 3) {
            this.spawnResource();
        }
    }
    
    spawnResource() {
        const type = this.resourceTypes[Math.floor(Math.random() * this.resourceTypes.length)];
        const resource = {
            id: Date.now() + Math.random(),
            type: type,
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 10,
            life: 0
        };
        
        this.resources.push(resource);
        this.renderResources();
    }
    
    handleResourceClick(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;
        
        // Update score with combo multiplier
        const points = resource.type.value * this.combo;
        this.score += points;
        
        // Increase combo
        this.combo = Math.min(5, this.combo + 1);
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastComboTime = performance.now();
        
        // Show floating text
        this.showFloatingPoints(points, resource.x, resource.y);
        
        // Remove resource
        this.removeResource(resourceId);
        
        // Spawn new one
        setTimeout(() => {
            if (this.gameActive) {
                this.spawnResource();
            }
        }, 300);
        
        // AI Assistant feedback
        if (window.cosmicAssistant) {
            if (this.combo >= 3) {
                window.cosmicAssistant.hint(`Комбо x${this.combo}! Продолжайте!`);
            }
        }
    }
    
    removeResource(resourceId) {
        this.resources = this.resources.filter(r => r.id !== resourceId);
        this.renderResources();
    }
    
    showFloatingPoints(points, x, y) {
        const field = document.getElementById('resource-field');
        if (!field) return;
        
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-points';
        floatingText.textContent = `+${points}`;
        floatingText.style.left = `${x}%`;
        floatingText.style.top = `${y}%`;
        
        field.appendChild(floatingText);
        
        setTimeout(() => {
            floatingText.remove();
        }, 1000);
    }
    
    renderResources() {
        const field = document.getElementById('resource-field');
        if (!field) return;
        
        // Remove old resources
        const oldResources = field.querySelectorAll('.resource-item');
        oldResources.forEach(el => el.remove());
        
        // Add current resources
        this.resources.forEach(resource => {
            const resourceEl = document.createElement('div');
            resourceEl.className = 'resource-item';
            resourceEl.dataset.id = resource.id;
            resourceEl.style.left = `${resource.x}%`;
            resourceEl.style.top = `${resource.y}%`;
            
            // Urgency based on life
            const urgency = Math.min(resource.life / 5, 1);
            const scale = 1 + urgency * 0.3;
            
            resourceEl.innerHTML = `
                <div class="resource-icon" style="transform: scale(${scale});">
                    ${resource.type.emoji}
                </div>
                <div class="resource-name">${resource.type.name}</div>
            `;
            
            resourceEl.addEventListener('click', () => this.handleResourceClick(resource.id));
            resourceEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleResourceClick(resource.id);
            });
            
            field.appendChild(resourceEl);
        });
    }
    
    render() {
        // Update HUD
        const scoreEl = document.getElementById('resource-score');
        const comboEl = document.getElementById('resource-combo');
        const timeEl = document.getElementById('resource-time');
        
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        
        if (comboEl) {
            comboEl.textContent = `x${this.combo}`;
            comboEl.style.color = this.combo > 1 ? '#ffaa00' : 'var(--neon-cyan)';
        }
        
        if (timeEl) {
            const timeText = `${Math.ceil(this.timeLeft)}s`;
            timeEl.textContent = timeText;
            timeEl.style.color = this.timeLeft < 10 ? '#ff0000' : 'var(--neon-cyan)';
        }
    }
    
    endGame() {
        this.gameActive = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const success = this.score >= 150; // Pass threshold
        this.showResult(success);
    }
    
    showResult(success) {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'game-result-overlay';
        resultDiv.innerHTML = `
            <div class="game-result ${success ? 'success' : 'failure'}">
                <h2>${success ? '🎉 Отлично!' : '⏰ Время вышло'}</h2>
                <p>Итоговый счет: ${this.score}</p>
                <p>Максимальное комбо: x${this.maxCombo}</p>
                <p class="result-comment">${this.getResultComment()}</p>
                <button class="btn btn-primary btn-large" id="game-continue-btn">Продолжить</button>
            </div>
        `;
        
        container.appendChild(resultDiv);
        
        const continueBtn = document.getElementById('game-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (this.callback) {
                    this.callback(success, this.score);
                }
            });
        }
    }
    
    getResultComment() {
        if (this.score >= 300) {
            return '🌟 Невероятно! Вы - мастер сбора ресурсов!';
        } else if (this.score >= 200) {
            return '⭐ Отличная работа! Марсианская база обеспечена!';
        } else if (this.score >= 150) {
            return '✅ Хороший результат! Базовые ресурсы собраны.';
        } else {
            return '💪 Неплохо, но можно лучше! Попробуйте еще раз!';
        }
    }
}

// Add game styles
const resourceCollectorStyles = document.createElement('style');
resourceCollectorStyles.textContent = `
    .resource-collector-game {
        background: rgba(10, 0, 21, 0.95);
        border-radius: 20px;
        padding: 2rem;
        border: 2px solid var(--space-gold);
        font-family: 'Orbitron', sans-serif;
    }
    
    .resource-collector-game .game-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .resource-collector-game .game-stat {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .resource-collector-game .stat-label {
        font-size: 0.9rem;
        color: var(--color-gray);
    }
    
    .resource-collector-game .stat-value {
        font-size: 1.5rem;
        color: var(--space-gold);
        font-weight: bold;
    }
    
    .resource-field {
        position: relative;
        height: 400px;
        background: linear-gradient(180deg, #2d1b3d 0%, #3d1a1a 100%);
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }
    
    .resource-item {
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: pointer;
        user-select: none;
        animation: resource-appear 0.3s ease-out;
        min-width: 48px;
        min-height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
    }
    
    .resource-item:hover .resource-icon {
        transform: scale(1.3);
    }
    
    .resource-icon {
        font-size: 3rem;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        transition: transform 0.2s;
    }
    
    .resource-name {
        font-size: 0.9rem;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        font-weight: bold;
    }
    
    @keyframes resource-appear {
        from {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    .floating-points {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: bold;
        color: var(--space-gold);
        animation: float-up 1s ease-out forwards;
        pointer-events: none;
        z-index: 100;
    }
    
    @keyframes float-up {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-100px);
        }
    }
    
    .resource-info-panel {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .resource-info-panel h4 {
        margin-bottom: 1rem;
        color: var(--space-gold);
    }
    
    .resource-legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.8rem;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        border-radius: 8px;
    }
    
    .legend-emoji {
        font-size: 1.5rem;
    }
    
    .legend-name {
        font-weight: bold;
        color: var(--neon-cyan);
        min-width: 50px;
    }
    
    .legend-label {
        color: var(--color-gray);
        font-size: 0.85rem;
        flex: 1;
    }
    
    .legend-value {
        color: var(--space-gold);
        font-weight: bold;
    }
    
    .resource-collector-game .game-instructions {
        text-align: center;
        color: var(--color-gray);
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    .resource-collector-game .game-instructions p {
        margin: 0.3rem 0;
    }
    
    .result-comment {
        font-size: 1.1rem;
        color: var(--color-light-blue);
        margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
        .resource-field {
            height: 350px;
        }
        
        .resource-icon {
            font-size: 2.5rem;
        }
        
        .resource-legend {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(resourceCollectorStyles);

// Export
window.ResourceCollectorGame = ResourceCollectorGame;
