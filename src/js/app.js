// Основная логика приложения

class CosmicLabApp {
    constructor() {
        this.difficulty = null;
        this.selectedPlanetsForComparison = [];
        this.currentMission = null;
        this.currentGame = null;
        this.init();
    }

    init() {
        // Обработчики главного экрана
        this.setupMainScreen();
        
        // Обработчики выбора миссии
        this.setupMissionSelectScreen();
        
        // Обработчики карты солнечной системы
        this.setupSolarSystemScreen();
        
        // Обработчики брифинга
        this.setupBriefingScreen();
        
        // Обработчики результатов
        this.setupResultsScreen();
        
        // Обработчики мини-игр
        this.setupMinigamesScreen();
        this.loadMinigameStats();
        
        // Unlock first launch achievement
        if (window.gameProgress) {
            window.gameProgress.unlockAchievement('first_launch');
        }
        
        console.log('Космическая лаборатория — Миссия загружена');
    }

    // Настройка главного экрана
    setupMainScreen() {
        const startBtn = document.getElementById('start-mission-btn');
        const difficultySelector = document.getElementById('difficulty-selector');
        
        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
            difficultySelector.style.display = 'block';
        });
        
        const difficultyButtons = document.querySelectorAll('.btn-difficulty');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.level;
                this.startGame();
            });
        });
    }

    // Начало игры
    startGame() {
        UI.switchScreen('main-screen', 'mission-select-screen');
        this.loadMissionCards();
    }
    
    // Load mission selection cards
    loadMissionCards() {
        const container = document.getElementById('mission-cards-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.values(window.missionTypes).forEach(mission => {
            const card = document.createElement('div');
            card.className = 'mission-card glass-card';
            card.dataset.missionId = mission.id;
            
            card.innerHTML = `
                <div class="mission-card-content">
                    <div class="mission-icon">${mission.icon}</div>
                    <h3 class="mission-title">${mission.name}</h3>
                    <p class="mission-subtitle">${mission.subtitle}</p>
                    <div class="mission-stats">
                        <div class="mission-stat">
                            <span class="mission-stat-label">Сложность:</span>
                            <span class="mission-stat-value difficulty-${mission.difficulty}">${mission.difficultyLabel}</span>
                        </div>
                        <div class="mission-stat">
                            <span class="mission-stat-label">Длительность:</span>
                            <span class="mission-stat-value">${mission.duration} мин</span>
                        </div>
                        <div class="mission-stat">
                            <span class="mission-stat-label">Награда:</span>
                            <span class="mission-stat-value">${mission.rewards.points} очков</span>
                        </div>
                    </div>
                    <p style="text-align: center; color: var(--color-gray); margin-top: 1rem;">${mission.description}</p>
                </div>
            `;
            
            card.addEventListener('click', () => {
                this.selectMission(mission.id);
            });
            
            container.appendChild(card);
        });
    }
    
    // Select a mission
    selectMission(missionId) {
        this.currentMission = missionId;
        const mission = window.missionTypes[missionId];
        
        if (window.gameProgress) {
            window.gameProgress.initMissionResources(missionId);
        }
        
        // Update briefing with mission-specific content
        this.updateBriefing(mission);
        
        // Load solar system before switching
        this.loadSolarSystem();
        
        UI.switchScreen('mission-select-screen', 'solar-system-screen');
    }
    
    // Update briefing with mission content
    updateBriefing(mission) {
        const briefingText = document.querySelector('.briefing-text');
        if (briefingText) {
            briefingText.innerHTML = `
                <p class="briefing-intro">🛸 <strong>Миссия: ${mission.name}</strong></p>
                ${mission.briefing}
                <h3>Задачи миссии:</h3>
                <ul>
                    ${mission.objectives.map(obj => `<li>✓ ${obj}</li>`).join('')}
                </ul>
            `;
        }
    }
    
    // Setup mission select screen
    setupMissionSelectScreen() {
        // Mission cards are set up dynamically
    }

    // Загрузка солнечной системы
    loadSolarSystem() {
        const map = document.getElementById('solar-system-map');
        map.innerHTML = '';
        
        Object.keys(window.planetsData).forEach(planetId => {
            const planetData = window.planetsData[planetId];
            const card = UI.createPlanetCard(planetId, planetData);
            
            // Обработчик клика на планету
            card.addEventListener('click', () => {
                UI.showPlanetInfo(planetData);
            });
            
            // Обработчик двойного клика для добавления в сравнение
            card.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.addPlanetToComparison(planetId, planetData);
            });
            
            map.appendChild(card);
        });
    }

    // Настройка экрана солнечной системы
    setupSolarSystemScreen() {
        // Load solar system when screen becomes active
        // We'll trigger this from continue button
        
        // Кнопка закрытия информации о планете
        const closeBtn = document.getElementById('close-planet-info');
        closeBtn.addEventListener('click', () => {
            UI.hidePlanetInfo();
        });
        
        // Кнопка перехода к брифингу
        const continueBtn = document.getElementById('continue-to-briefing');
        continueBtn.addEventListener('click', () => {
            UI.switchScreen('solar-system-screen', 'briefing-screen');
        });
        
        // Кнопка очистки сравнения
        const clearBtn = document.getElementById('clear-comparison');
        clearBtn.addEventListener('click', () => {
            this.clearComparison();
        });
        
        // Кнопка сравнения планет
        const compareBtn = document.getElementById('compare-planets-btn');
        compareBtn.addEventListener('click', () => {
            if (this.selectedPlanetsForComparison.length >= 2) {
                UI.showComparison(this.selectedPlanetsForComparison);
            }
        });
        
        // Обработчик удаления планет из сравнения (делегирование)
        const selectedPlanets = document.getElementById('selected-planets');
        selectedPlanets.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-comparison-btn')) {
                const planetId = e.target.dataset.planet;
                this.removePlanetFromComparison(planetId);
            }
        });
        
        // Клик по панели сравнения для показа детального сравнения
        selectedPlanets.addEventListener('dblclick', () => {
            if (this.selectedPlanetsForComparison.length >= 2) {
                UI.showComparison(this.selectedPlanetsForComparison);
            }
        });
    }

    // Добавление планеты в сравнение
    addPlanetToComparison(planetId, planetData) {
        if (UI.addToComparison(planetId, planetData, this.selectedPlanetsForComparison)) {
            this.selectedPlanetsForComparison.push(planetId);
            
            // Подсвечиваем карточку планеты
            const card = document.querySelector(`.planet-card[data-planet="${planetId}"]`);
            if (card) {
                card.classList.add('selected');
            }
            
            // Показываем кнопку сравнения если выбрано ≥2
            const compareBtn = document.getElementById('compare-planets-btn');
            if (compareBtn && this.selectedPlanetsForComparison.length >= 2) {
                compareBtn.style.display = 'block';
            }
        }
    }

    // Удаление планеты из сравнения
    removePlanetFromComparison(planetId) {
        UI.removeFromComparison(planetId);
        
        const index = this.selectedPlanetsForComparison.indexOf(planetId);
        if (index > -1) {
            this.selectedPlanetsForComparison.splice(index, 1);
        }
        
        // Убираем подсветку с карточки
        const card = document.querySelector(`.planet-card[data-planet="${planetId}"]`);
        if (card) {
            card.classList.remove('selected');
        }
        
        // Скрываем кнопку если < 2
        const compareBtn = document.getElementById('compare-planets-btn');
        if (compareBtn && this.selectedPlanetsForComparison.length < 2) {
            compareBtn.style.display = 'none';
        }
    }

    // Очистка сравнения
    clearComparison() {
        UI.clearComparison();
        
        // Убираем подсветку со всех карточек
        this.selectedPlanetsForComparison.forEach(planetId => {
            const card = document.querySelector(`.planet-card[data-planet="${planetId}"]`);
            if (card) {
                card.classList.remove('selected');
            }
        });
        
        this.selectedPlanetsForComparison = [];
        
        // Скрываем кнопку
        const compareBtn = document.getElementById('compare-planets-btn');
        if (compareBtn) {
            compareBtn.style.display = 'none';
        }
    }

    // Настройка экрана брифинга
    setupBriefingScreen() {
        const startMissionBtn = document.getElementById('start-mission-stages');
        startMissionBtn.addEventListener('click', () => {
            // Show launch screen with countdown
            UI.switchScreen('briefing-screen', 'launch-screen');
            
            // Initialize resource panel
            if (window.gameProgress) {
                window.gameProgress.displayResources();
            }
            
            // Start countdown
            if (window.AnimationsController) {
                window.AnimationsController.launchCountdown(() => {
                    // After launch, show flight animation
                    this.startFlightSequence();
                });
            } else {
                // Fallback if animations not loaded
                setTimeout(() => this.startFlightSequence(), 3000);
            }
        });
    }
    
    // Start flight sequence
    startFlightSequence() {
        UI.switchScreen('launch-screen', 'flight-screen');
        
        if (window.AnimationsController) {
            // Flight animation duration depends on mission
            const mission = window.missionTypes[this.currentMission];
            const flightDuration = mission ? mission.duration : 5; // seconds for demo
            
            window.AnimationsController.flightAnimation(
                'earth',
                mission ? mission.target : 'mars',
                flightDuration,
                () => {
                    // After flight, go to solar system or mission stages
                    UI.switchScreen('flight-screen', 'mission-screen');
                    window.Mission.init(this.difficulty);
                }
            );
        } else {
            // Fallback
            setTimeout(() => {
                UI.switchScreen('flight-screen', 'mission-screen');
                window.Mission.init(this.difficulty);
            }, 5000);
        }
    }

    // Настройка экрана результатов
    setupResultsScreen() {
        const restartBtn = document.getElementById('restart-mission');
        const menuBtn = document.getElementById('back-to-menu');
        
        restartBtn.addEventListener('click', () => {
            this.restartMission();
        });
        
        menuBtn.addEventListener('click', () => {
            this.backToMenu();
        });
    }

    // Перезапуск миссии
    restartMission() {
        // Сброс состояния
        window.Mission.init(this.difficulty);
        
        // Переход к брифингу
        UI.switchScreen('final-screen', 'briefing-screen');
        
        // Сброс отображения теста/результатов
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';
    }

    // Возврат в главное меню
    backToMenu() {
        // Сброс состояния
        this.difficulty = null;
        this.selectedPlanetsForComparison = [];
        
        // Сброс UI главного экрана
        document.getElementById('start-mission-btn').style.display = 'block';
        document.getElementById('difficulty-selector').style.display = 'none';
        
        // Сброс отображения теста/результатов
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';
        
        // Очистка сравнения
        this.clearComparison();
        
        // Переход к главному экрану
        UI.switchScreen('final-screen', 'main-screen');
    }

    // Настройка экрана мини-игр
    setupMinigamesScreen() {
        const goToMinigamesBtn = document.getElementById('go-to-minigames');
        if (goToMinigamesBtn) {
            goToMinigamesBtn.addEventListener('click', () => {
                UI.switchScreen('solar-system-screen', 'minigames-screen');
                this.loadMinigameStats();
            });
        }

        const backBtn = document.getElementById('back-from-minigames');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                UI.switchScreen('minigames-screen', 'solar-system-screen');
            });
        }

        const marsBtn = document.getElementById('start-mars-landing');
        if (marsBtn) {
            marsBtn.addEventListener('click', () => this.startMinigame('mars-landing'));
        }

        const asteroidBtn = document.getElementById('start-asteroid-navigator');
        if (asteroidBtn) {
            asteroidBtn.addEventListener('click', () => this.startMinigame('asteroid-navigator'));
        }

        const resourceBtn = document.getElementById('start-resource-collector');
        if (resourceBtn) {
            resourceBtn.addEventListener('click', () => this.startMinigame('resource-collector'));
        }

        const exitBtn = document.getElementById('exit-game');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.exitGame());
        }

        // Кнопка возврата в меню из мини-игр
        const minigamesToMenuBtn = document.getElementById('minigames-to-menu');
        if (minigamesToMenuBtn) {
            minigamesToMenuBtn.addEventListener('click', () => {
                this.backToMenu();
                UI.switchScreen('minigames-screen', 'main-screen');
            });
        }

        // Кнопка возврата в меню из игры
        const gameToMenuBtn = document.getElementById('game-to-menu');
        if (gameToMenuBtn) {
            gameToMenuBtn.addEventListener('click', () => {
                this.exitGame();
                this.backToMenu();
                UI.switchScreen('game-container-screen', 'main-screen');
            });
        }
    }

    // Загрузка статистики
    loadMinigameStats() {
        const stats = JSON.parse(localStorage.getItem('minigameResults') || '{}');
        
        this.updateGameStats('mars', stats['mars-landing'] || []);
        this.updateGameStats('asteroid', stats['asteroid-navigator'] || []);
        this.updateGameStats('resource', stats['resource-collector'] || []);
    }

    updateGameStats(prefix, results) {
        const played = results.length;
        const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;

        const playedEl = document.getElementById(`${prefix}-played`);
        const bestEl = document.getElementById(`${prefix}-best-score`);
        
        if (playedEl) playedEl.textContent = played;
        if (bestEl) bestEl.textContent = bestScore > 0 ? bestScore : '-';
    }

    // Запуск мини-игры
    startMinigame(gameType) {
        console.log('🎮 Starting game:', gameType);
        
        UI.switchScreen('minigames-screen', 'game-container-screen');
        
        const wrapper = document.getElementById('game-canvas-wrapper');
        if (!wrapper) {
            console.error('❌ Game wrapper not found!');
            return;
        }
        
        wrapper.innerHTML = '';

        const onGameComplete = (success, score) => {
            this.onGameComplete(gameType, success, score);
        };

        switch(gameType) {
            case 'mars-landing':
                if (window.MarsLandingGame) {
                    console.log('✅ MarsLandingGame found');
                    this.currentGame = new MarsLandingGame(wrapper, onGameComplete);
                    this.currentGame.init();
                } else {
                    console.error('❌ MarsLandingGame not loaded!');
                }
                break;
            
            case 'asteroid-navigator':
                if (window.AsteroidNavigatorGame) {
                    console.log('✅ AsteroidNavigatorGame found');
                    this.currentGame = new AsteroidNavigatorGame(wrapper, onGameComplete);
                    this.currentGame.init();
                } else {
                    console.error('❌ AsteroidNavigatorGame not loaded!');
                }
                break;
            
            case 'resource-collector':
                if (window.ResourceCollectorGame) {
                    console.log('✅ ResourceCollectorGame found');
                    this.currentGame = new ResourceCollectorGame(wrapper, onGameComplete);
                    this.currentGame.init();
                } else {
                    console.error('❌ ResourceCollectorGame not loaded!');
                }
                break;
        }
    }

    // Выход из игры
    exitGame() {
        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
        }
        this.currentGame = null;
        
        const wrapper = document.getElementById('game-canvas-wrapper');
        wrapper.innerHTML = '';
        
        UI.switchScreen('game-container-screen', 'minigames-screen');
    }

    // Завершение игры
    onGameComplete(gameType, success, score) {
        const message = success 
            ? `✅ Успех! Счёт: ${score}` 
            : `❌ Попробуйте ещё раз. Счёт: ${score}`;
        
        setTimeout(() => {
            alert(`Игра завершена!\n${message}`);
            
            // Сохранить результат
            const results = JSON.parse(localStorage.getItem('minigameResults') || '{}');
            if (!results[gameType]) results[gameType] = [];
            results[gameType].push({ 
                success, 
                score, 
                date: new Date().toISOString() 
            });
            localStorage.setItem('minigameResults', JSON.stringify(results));
            
            this.exitGame();
        }, 500);
    }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CosmicLabApp();
});
