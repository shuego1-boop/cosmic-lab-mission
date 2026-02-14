// Основная логика приложения

class CosmicLabApp {
    constructor() {
        this.difficulty = null;
        this.selectedPlanetsForComparison = [];
        this.init();
    }

    init() {
        // Обработчики главного экрана
        this.setupMainScreen();
        
        // Обработчики карты солнечной системы
        this.setupSolarSystemScreen();
        
        // Обработчики брифинга
        this.setupBriefingScreen();
        
        // Обработчики результатов
        this.setupResultsScreen();
        
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
        UI.switchScreen('main-screen', 'solar-system-screen');
        this.loadSolarSystem();
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
            
            // Если выбрано 2+ планеты, показываем подсказку
            if (this.selectedPlanetsForComparison.length >= 2) {
                console.log('Совет: двойной клик на панели сравнения покажет детальное сравнение');
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
    }

    // Настройка экрана брифинга
    setupBriefingScreen() {
        const startMissionBtn = document.getElementById('start-mission-stages');
        startMissionBtn.addEventListener('click', () => {
            UI.switchScreen('briefing-screen', 'mission-screen');
            window.Mission.init(this.difficulty);
        });
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
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CosmicLabApp();
});
