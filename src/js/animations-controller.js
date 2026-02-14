// Complex Animations Controller

const AnimationsController = {
    // Launch countdown with animation
    launchCountdown(callback) {
        const countdownDisplay = document.getElementById('countdown-display');
        if (!countdownDisplay) {
            if (callback) callback();
            return;
        }
        
        let count = 3;
        
        const countdown = () => {
            if (count > 0) {
                countdownDisplay.innerHTML = `<div class="countdown-number">${count}</div>`;
                
                // Play countdown sound (if available)
                if (window.cosmicAssistant) {
                    window.cosmicAssistant.say('launch', `${count}...`);
                }
                
                count--;
                setTimeout(countdown, 1000);
            } else {
                countdownDisplay.innerHTML = `<div class="countdown-number" style="font-size: 8rem;">🚀</div>`;
                
                if (window.cosmicAssistant) {
                    window.cosmicAssistant.say('launch', 'Поехали!');
                }
                
                // Add launch effect
                setTimeout(() => {
                    const rocket = countdownDisplay.querySelector('.countdown-number');
                    if (rocket) {
                        rocket.classList.add('launching');
                    }
                }, 500);
                
                setTimeout(() => {
                    if (callback) callback();
                }, 2500);
            }
        };
        
        countdown();
    },
    
    // Flight animation with progress
    flightAnimation(fromPlanet, toPlanet, duration, callback) {
        const flightScreen = document.getElementById('flight-screen');
        const progressEl = document.getElementById('flight-progress-percent');
        const resourcePanelFlight = document.getElementById('resource-panel-flight');
        const flightObjects = document.getElementById('flight-objects');
        
        if (!flightScreen) {
            if (callback) callback();
            return;
        }
        
        // Initialize resources
        if (window.gameProgress) {
            window.gameProgress.displayResources();
            
            // Copy resource panel to flight screen
            if (resourcePanelFlight) {
                resourcePanelFlight.innerHTML = document.getElementById('resource-panel').innerHTML;
            }
        }
        
        let progress = 0;
        const steps = duration * 10; // Update every 100ms
        const increment = 100 / steps;
        
        // Add flying asteroids
        this.addFlyingObjects(flightObjects);
        
        // Progress interval
        const progressInterval = setInterval(() => {
            progress += increment;
            
            if (progressEl) {
                progressEl.textContent = Math.min(100, Math.round(progress));
            }
            
            // Update resources gradually
            if (window.gameProgress && progress < 100) {
                const fuelDecrease = -0.5; // Gradual fuel consumption
                const oxygenDecrease = -0.3; // Gradual oxygen consumption
                window.gameProgress.updateResources(fuelDecrease, oxygenDecrease, 0);
                
                // Update display on flight screen
                if (resourcePanelFlight) {
                    resourcePanelFlight.innerHTML = document.getElementById('resource-panel').innerHTML;
                }
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                if (window.cosmicAssistant) {
                    window.cosmicAssistant.say('mission', 'Прибыли на место назначения!');
                }
                
                setTimeout(() => {
                    if (callback) callback();
                }, 1000);
            }
        }, 100);
    },
    
    // Add flying objects (asteroids, satellites)
    addFlyingObjects(container) {
        if (!container) return;
        
        const objectTypes = [
            { emoji: '☄️', speed: 8, size: '30px' },
            { emoji: '🌑', speed: 12, size: '25px' },
            { emoji: '🛰️', speed: 10, size: '35px' }
        ];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
                const obj = document.createElement('div');
                obj.className = 'asteroid';
                obj.style.cssText = `
                    position: absolute;
                    font-size: ${type.size};
                    top: ${Math.random() * 80}%;
                    right: -50px;
                    animation: asteroid-drift ${type.speed}s linear;
                    filter: drop-shadow(0 0 10px rgba(139, 115, 85, 0.6));
                `;
                obj.textContent = type.emoji;
                
                container.appendChild(obj);
                
                setTimeout(() => obj.remove(), type.speed * 1000);
            }, i * 2000);
        }
    },
    
    // Planet exploration animation
    planetZoom(planetCard, callback) {
        if (!planetCard) {
            if (callback) callback();
            return;
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const clonedCard = planetCard.cloneNode(true);
        clonedCard.style.cssText = `
            transform: scale(3);
            animation: scaleIn 0.5s ease-out;
        `;
        
        overlay.appendChild(clonedCard);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 300);
        }, 2000);
    },
    
    // Achievement unlock animation
    achievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            animation: achievementPop 1s ease-out;
        `;
        
        notification.innerHTML = `
            <div class="achievement-badge unlocked" style="
                padding: 2rem 3rem;
                font-size: 1.2rem;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            ">
                <div class="achievement-icon" style="font-size: 4rem;">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name" style="font-size: 1.5rem;">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add confetti effect
        this.addConfetti();
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },
    
    // Confetti effect
    addConfetti() {
        const colors = ['#00f0ff', '#bf00ff', '#ff00bf', '#ffd700'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: 50%;
                    left: 50%;
                    z-index: 9999;
                    animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
                    border-radius: 50%;
                `;
                
                const angle = (Math.PI * 2 * i) / 50;
                const velocity = 100 + Math.random() * 200;
                confetti.style.setProperty('--x', `${Math.cos(angle) * velocity}px`);
                confetti.style.setProperty('--y', `${Math.sin(angle) * velocity}px`);
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 20);
        }
    },
    
    // Screen transition with direction
    transitionScreen(from, to, direction = 'right') {
        const fromScreen = document.getElementById(from);
        const toScreen = document.getElementById(to);
        
        if (fromScreen) {
            fromScreen.classList.remove('active');
        }
        
        if (toScreen) {
            toScreen.classList.add('active');
            
            // Add transition class based on direction
            if (direction === 'right') {
                toScreen.classList.add('screen-transition');
            } else if (direction === 'left') {
                toScreen.classList.add('screen-transition-left');
            } else if (direction === 'up') {
                toScreen.classList.add('screen-transition-up');
            }
            
            // Remove transition class after animation
            setTimeout(() => {
                toScreen.classList.remove('screen-transition', 'screen-transition-left', 'screen-transition-up');
            }, 600);
        }
    }
};

// Add CSS for confetti
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confetti-fall {
        from {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
        }
        to {
            transform: translate(var(--x), var(--y)) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes achievementPop {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
        }
        100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Export AnimationsController
window.AnimationsController = AnimationsController;
