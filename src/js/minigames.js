// Mini-games for missions

// Configuration
const MINIGAME_CONFIG = {
    sampleTypes: ['🪨', '💎', '🔬', '⚗️', '🧪']
};

const MiniGames = {
    // New Mars Landing Simulator (replaces landing mini-game)
    marsLanding: {
        name: 'Посадка на Марс',
        description: 'Посадите корабль с реалистичной физикой',
        
        init(containerId, callback) {
            if (window.MarsLandingGame) {
                const game = new MarsLandingGame(containerId, callback);
                game.init();
            } else {
                console.error('MarsLandingGame not loaded');
            }
        }
    },
    
    // New Asteroid Navigator (replaces dodge meteors)
    asteroidNavigator: {
        name: 'Навигатор астероидов',
        description: 'Уклоняйтесь от астероидов и собирайте бонусы',
        
        init(containerId, callback) {
            if (window.AsteroidNavigatorGame) {
                const game = new AsteroidNavigatorGame(containerId, callback);
                game.init();
            } else {
                console.error('AsteroidNavigatorGame not loaded');
            }
        }
    },
    
    // New Resource Collector (replaces collect samples)
    resourceCollector: {
        name: 'Сбор ресурсов',
        description: 'Собирайте научные ресурсы Марса',
        
        init(containerId, callback) {
            if (window.ResourceCollectorGame) {
                const game = new ResourceCollectorGame(containerId, callback);
                game.init();
            } else {
                console.error('ResourceCollectorGame not loaded');
            }
        }
    },
    
    // Legacy: Dodge Meteors mini-game (kept for compatibility)
    dodgeMeteors: {
        name: 'Избежать метеоритов',
        description: 'Кликайте по метеоритам, чтобы уничтожить их и защитить корабль!',
        duration: 30, // seconds
        difficulty: 'medium',
        
        init(containerId, callback) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            let score = 0;
            let misses = 0;
            let timeLeft = this.duration;
            let gameActive = true;
            let meteorInterval;
            
            container.innerHTML = `
                <div class="minigame-container" style="position: relative; height: 400px; background: rgba(10, 0, 21, 0.9); border-radius: 20px; overflow: hidden; border: 2px solid var(--neon-cyan);">
                    <div class="minigame-header" style="padding: 1rem; display: flex; justify-content: space-between; color: white; font-family: 'Orbitron', sans-serif;">
                        <div>Метеоритов уничтожено: <span id="meteor-score">0</span></div>
                        <div>Промахи: <span id="meteor-misses">0</span>/5</div>
                        <div>Время: <span id="meteor-time">${timeLeft}</span>с</div>
                    </div>
                    <div class="minigame-field" id="meteor-field" style="position: relative; height: calc(100% - 60px); cursor: crosshair;">
                        <!-- Meteors will appear here -->
                    </div>
                </div>
            `;
            
            const field = document.getElementById('meteor-field');
            const scoreEl = document.getElementById('meteor-score');
            const missesEl = document.getElementById('meteor-misses');
            const timeEl = document.getElementById('meteor-time');
            
            // Timer countdown
            const timer = setInterval(() => {
                timeLeft--;
                timeEl.textContent = timeLeft;
                
                if (timeLeft <= 0 || misses >= 5) {
                    gameActive = false;
                    clearInterval(timer);
                    clearInterval(meteorInterval);
                    this.endGame(score, misses < 5, callback);
                }
            }, 1000);
            
            // Spawn meteors
            meteorInterval = setInterval(() => {
                if (!gameActive) return;
                
                const meteor = document.createElement('div');
                meteor.className = 'meteor-object';
                meteor.style.cssText = `
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background: radial-gradient(circle, #8B7355, #4A3728);
                    border-radius: 50%;
                    cursor: pointer;
                    top: ${Math.random() * 80}%;
                    left: ${Math.random() * 90}%;
                    animation: meteor-appear 0.3s ease-out;
                    box-shadow: 0 0 15px rgba(255, 107, 53, 0.6);
                `;
                
                let clicked = false;
                
                meteor.addEventListener('click', () => {
                    if (!clicked) {
                        clicked = true;
                        score++;
                        scoreEl.textContent = score;
                        
                        // Explosion effect
                        meteor.style.animation = 'explosion 0.3s ease-out';
                        setTimeout(() => meteor.remove(), 300);
                        
                        // Update resources
                        if (window.gameProgress) {
                            window.gameProgress.updateResources(0, 2, 0); // Small oxygen boost
                        }
                    }
                });
                
                field.appendChild(meteor);
                
                // Remove meteor after timeout if not clicked
                setTimeout(() => {
                    if (!clicked && gameActive) {
                        misses++;
                        missesEl.textContent = misses;
                        meteor.remove();
                        
                        // Damage resources
                        if (window.gameProgress) {
                            window.gameProgress.updateResources(-5, -5, 0);
                        }
                    }
                }, 2000);
            }, 1000);
        },
        
        endGame(score, success, callback) {
            setTimeout(() => {
                if (callback) callback(success, score);
            }, 500);
        }
    },
    
    // Landing mini-game
    landing: {
        name: 'Посадка',
        description: 'Выберите безопасное место для посадки на поверхности планеты',
        
        init(containerId, callback) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const safezones = [
                { x: 20, y: 30, label: 'Зона A - Ровная поверхность' },
                { x: 60, y: 50, label: 'Зона B - Кратер (опасно)' },
                { x: 40, y: 70, label: 'Зона C - Плато' }
            ];
            
            const correctZone = 0; // Zone A is correct
            
            container.innerHTML = `
                <div class="minigame-container" style="position: relative; height: 500px; background: linear-gradient(180deg, #0a0015, #2d1b3d); border-radius: 20px; overflow: hidden; border: 2px solid var(--neon-cyan);">
                    <div class="minigame-header" style="padding: 1rem; color: white; text-align: center; font-family: 'Orbitron', sans-serif;">
                        <h3>${this.name}</h3>
                        <p style="font-family: 'Inter', sans-serif; font-size: 0.9rem; color: var(--color-gray);">${this.description}</p>
                    </div>
                    <div class="landing-surface" id="landing-surface" style="position: relative; height: calc(100% - 100px); background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><circle cx=\"30\" cy=\"30\" r=\"10\" fill=\"%23444\"/><circle cx=\"70\" cy=\"60\" r=\"15\" fill=\"%23333\"/></svg>'); background-size: 100px;">
                        ${safezones.map((zone, i) => `
                            <div class="landing-zone" data-zone="${i}" style="
                                position: absolute;
                                left: ${zone.x}%;
                                top: ${zone.y}%;
                                width: 80px;
                                height: 80px;
                                border: 3px solid ${i === 1 ? '#ff0000' : '#00ff00'};
                                border-radius: 50%;
                                cursor: pointer;
                                transition: all 0.3s;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: rgba(0, 240, 255, 0.1);
                            " title="${zone.label}">
                                <span style="color: white; font-size: 1.5rem; font-family: 'Orbitron', sans-serif;">${String.fromCharCode(65 + i)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            const zones = container.querySelectorAll('.landing-zone');
            zones.forEach((zone, i) => {
                zone.addEventListener('mouseenter', () => {
                    zone.style.transform = 'scale(1.2)';
                    zone.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.8)';
                });
                
                zone.addEventListener('mouseleave', () => {
                    zone.style.transform = 'scale(1)';
                    zone.style.boxShadow = 'none';
                });
                
                zone.addEventListener('click', () => {
                    const success = i === correctZone;
                    
                    // Visual feedback
                    zone.style.background = success ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
                    zone.style.transform = 'scale(1.5)';
                    
                    setTimeout(() => {
                        if (callback) callback(success, i);
                    }, 1000);
                });
            });
        }
    },
    
    // Collect Samples mini-game
    collectSamples: {
        name: 'Сбор образцов',
        description: 'Найдите и соберите 5 научных образцов на поверхности планеты',
        
        init(containerId, callback) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            let collected = 0;
            const totalSamples = 5;
            let timeLeft = 45;
            let gameActive = true;
            
            container.innerHTML = `
                <div class="minigame-container" style="position: relative; height: 450px; background: linear-gradient(180deg, #1a0a2e, #3d2645); border-radius: 20px; overflow: hidden; border: 2px solid var(--neon-cyan);">
                    <div class="minigame-header" style="padding: 1rem; display: flex; justify-content: space-between; color: white; font-family: 'Orbitron', sans-serif;">
                        <div>Собрано: <span id="samples-collected">0</span>/${totalSamples}</div>
                        <div>Время: <span id="samples-time">${timeLeft}</span>с</div>
                    </div>
                    <div class="samples-field" id="samples-field" style="position: relative; height: calc(100% - 60px); cursor: pointer;">
                        <!-- Samples will appear here -->
                    </div>
                </div>
            `;
            
            const field = document.getElementById('samples-field');
            const collectedEl = document.getElementById('samples-collected');
            const timeEl = document.getElementById('samples-time');
            
            // Timer
            const timer = setInterval(() => {
                timeLeft--;
                timeEl.textContent = timeLeft;
                
                if (timeLeft <= 0 || collected >= totalSamples) {
                    gameActive = false;
                    clearInterval(timer);
                    setTimeout(() => {
                        if (callback) callback(collected >= totalSamples, collected);
                    }, 500);
                }
            }, 1000);
            
            // Spawn samples
            for (let i = 0; i < totalSamples; i++) {
                setTimeout(() => {
                    if (!gameActive) return;
                    
                    const sample = document.createElement('div');
                    sample.className = 'sample-object';
                    sample.style.cssText = `
                        position: absolute;
                        width: 60px;
                        height: 60px;
                        font-size: 2.5rem;
                        cursor: pointer;
                        top: ${20 + Math.random() * 60}%;
                        left: ${10 + Math.random() * 80}%;
                        animation: sample-glow 2s ease-in-out infinite;
                        transition: all 0.3s;
                    `;
                    sample.textContent = MINIGAME_CONFIG.sampleTypes[i % MINIGAME_CONFIG.sampleTypes.length];
                    
                    sample.addEventListener('mouseenter', () => {
                        sample.style.transform = 'scale(1.3)';
                    });
                    
                    sample.addEventListener('mouseleave', () => {
                        sample.style.transform = 'scale(1)';
                    });
                    
                    sample.addEventListener('click', () => {
                        collected++;
                        collectedEl.textContent = collected;
                        
                        // Collection animation
                        sample.style.animation = 'sample-collect 0.5s ease-out';
                        setTimeout(() => sample.remove(), 500);
                        
                        // Assistant feedback
                        if (window.cosmicAssistant) {
                            window.cosmicAssistant.say('mission', `Образец ${collected} собран!`);
                        }
                    });
                    
                    field.appendChild(sample);
                }, i * 2000); // Stagger spawn
            }
        }
    }
};

// Add CSS animations for mini-games
const style = document.createElement('style');
style.textContent = `
    @keyframes meteor-appear {
        from {
            transform: scale(0) rotate(0deg);
            opacity: 0;
        }
        to {
            transform: scale(1) rotate(360deg);
            opacity: 1;
        }
    }
    
    @keyframes explosion {
        from {
            transform: scale(1);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
            background: radial-gradient(circle, #ff6b35, transparent);
        }
    }
    
    @keyframes sample-glow {
        0%, 100% {
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
        }
        50% {
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
        }
    }
    
    @keyframes sample-collect {
        from {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export MiniGames
window.MiniGames = MiniGames;
