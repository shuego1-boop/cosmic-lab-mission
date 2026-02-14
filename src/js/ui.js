// UI утилиты для управления интерфейсом и анимациями

const UI = {
    // Переключение между экранами
    switchScreen(fromScreenId, toScreenId) {
        const fromScreen = document.getElementById(fromScreenId);
        const toScreen = document.getElementById(toScreenId);
        
        if (fromScreen) {
            fromScreen.classList.remove('active');
        }
        
        if (toScreen) {
            toScreen.classList.add('active');
            toScreen.scrollTop = 0; // Прокрутка наверх
        }
    },

    // Показ/скрытие элемента
    toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    // Создание карточки планеты
    createPlanetCard(planetId, planetData) {
        const card = document.createElement('div');
        card.className = 'planet-card';
        card.dataset.planet = planetId;
        
        card.innerHTML = `
            <div class="planet-icon">${planetData.icon}</div>
            <div class="planet-name">${planetData.name}</div>
            <div class="planet-subtitle">${planetData.type}</div>
        `;
        
        return card;
    },

    // Показ детальной информации о планете
    showPlanetInfo(planetData) {
        const panel = document.getElementById('planet-info-panel');
        const content = document.getElementById('planet-info-content');
        
        let temperatureStr = '';
        if (typeof planetData.temperature === 'object') {
            if (planetData.temperature.average !== undefined) {
                temperatureStr = `${planetData.temperature.average}°C`;
            } else {
                temperatureStr = `День: ${planetData.temperature.day}°C, Ночь: ${planetData.temperature.night}°C`;
            }
        } else {
            temperatureStr = `${planetData.temperature}°C`;
        }
        
        content.innerHTML = `
            <div class="planet-header">
                <div class="planet-icon">${planetData.icon}</div>
                <h2>${planetData.name}</h2>
                <p class="planet-type">${planetData.type}</p>
            </div>
            <p style="text-align: center; font-size: 1.1rem; margin-bottom: 2rem; color: var(--color-gray);">
                ${planetData.description}
            </p>
            <div class="planet-details">
                <div class="planet-param">
                    <div class="param-label">Масса</div>
                    <div class="param-value">${planetData.mass}<span class="param-unit">M⊕</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Радиус</div>
                    <div class="param-value">${planetData.radius.toLocaleString()}<span class="param-unit">км</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Расстояние от Солнца</div>
                    <div class="param-value">${planetData.distanceFromSun}<span class="param-unit">млн км</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Температура</div>
                    <div class="param-value">${temperatureStr}</div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Длительность суток</div>
                    <div class="param-value">${planetData.dayLength}<span class="param-unit">земных суток</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Длительность года</div>
                    <div class="param-value">${planetData.yearLength}<span class="param-unit">земных суток</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Гравитация</div>
                    <div class="param-value">${planetData.gravity}<span class="param-unit">g</span></div>
                </div>
                <div class="planet-param">
                    <div class="param-label">Спутники</div>
                    <div class="param-value">${planetData.moons}</div>
                </div>
                <div class="planet-param" style="grid-column: 1 / -1;">
                    <div class="param-label">Атмосфера</div>
                    <div class="param-value" style="font-size: 1rem;">${planetData.atmosphere}</div>
                </div>
            </div>
        `;
        
        panel.style.display = 'block';
    },

    // Скрытие панели информации о планете
    hidePlanetInfo() {
        const panel = document.getElementById('planet-info-panel');
        panel.style.display = 'none';
    },

    // Обновление прогресса миссии
    updateMissionProgress(current, total) {
        const progressFill = document.getElementById('progress-fill');
        const currentStage = document.getElementById('current-stage');
        
        const percentage = (current / total) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (currentStage) {
            currentStage.textContent = current;
        }
    },

    // Создание контента этапа миссии
    createStageContent(stage) {
        return `
            <div class="stage-content">
                <h2 class="stage-title">${stage.title}</h2>
                <p class="stage-question">${stage.question}</p>
                <div class="options-container" id="stage-options">
                    ${stage.options.map((option, index) => `
                        <button class="option-btn" data-option="${index}">
                            ${option.text}
                        </button>
                    `).join('')}
                </div>
                <div id="stage-feedback"></div>
                <div id="stage-next-btn"></div>
            </div>
        `;
    },

    // Показ обратной связи на этапе миссии
    showStageFeedback(option, isCorrect) {
        const feedbackContainer = document.getElementById('stage-feedback');
        const nextBtnContainer = document.getElementById('stage-next-btn');
        
        feedbackContainer.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-title">${isCorrect ? '✅ Верно!' : '❌ Неверно'}</div>
                <p>${option.feedback}</p>
            </div>
        `;
        
        nextBtnContainer.innerHTML = `
            <button class="btn btn-primary btn-large glow-btn" id="next-stage-btn" style="margin-top: 2rem;">
                Продолжить →
            </button>
        `;
    },

    // Создание вопроса теста
    createQuizQuestion(question, questionNumber, totalQuestions) {
        const quizProgress = document.getElementById('quiz-progress');
        quizProgress.innerHTML = `<p>Вопрос <span id="quiz-current">${questionNumber}</span> из <span id="quiz-total">${totalQuestions}</span></p>`;
        
        return `
            <div class="stage-content">
                <p class="stage-question">${question.question}</p>
                <div class="options-container" id="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="option-btn" data-option="${index}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                <div id="quiz-feedback"></div>
            </div>
        `;
    },

    // Показ обратной связи на вопрос теста
    showQuizFeedback(question, selectedIndex, isCorrect) {
        const feedbackContainer = document.getElementById('quiz-feedback');
        
        feedbackContainer.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-title">${isCorrect ? '✅ Правильно!' : '❌ Неправильно'}</div>
                <p><strong>Правильный ответ:</strong> ${question.options[question.correct]}</p>
                <p>${question.explanation}</p>
            </div>
        `;
    },

    // Показ финальных результатов
    showResults(score, maxScore, breakdown, recommendations) {
        const quizContainer = document.getElementById('quiz-container');
        const resultsContainer = document.getElementById('results-container');
        const finalScore = document.getElementById('final-score');
        const maxScoreEl = document.getElementById('max-score');
        const scoreBreakdown = document.getElementById('score-breakdown');
        const recommendationsContent = document.getElementById('recommendations-content');
        
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        finalScore.textContent = score;
        maxScoreEl.textContent = maxScore;
        
        let breakdownHTML = '<h3>Результаты по этапам:</h3><ul style="list-style: none; padding: 0;">';
        breakdown.forEach(item => {
            breakdownHTML += `<li style="padding: 0.5rem 0; font-size: 1.1rem;">
                ${item.correct ? '✅' : '❌'} ${item.name}: ${item.points} баллов
            </li>`;
        });
        breakdownHTML += '</ul>';
        scoreBreakdown.innerHTML = breakdownHTML;
        
        if (recommendations.length > 0) {
            let recsHTML = '<ul style="list-style: none; padding: 0;">';
            recommendations.forEach(rec => {
                recsHTML += `<li style="padding: 0.5rem 0; font-size: 1rem;">📚 ${rec}</li>`;
            });
            recsHTML += '</ul>';
            recommendationsContent.innerHTML = recsHTML;
        } else {
            recommendationsContent.innerHTML = '<p style="font-size: 1.1rem; color: var(--color-light-blue);">🎉 Отлично! Вы показали отличные знания по всем темам!</p>';
        }
    },

    // Добавление планеты для сравнения
    addToComparison(planetId, planetData, selectedPlanets) {
        const container = document.getElementById('selected-planets');
        
        if (selectedPlanets.length >= 3) {
            alert('Можно сравнить максимум 3 планеты');
            return false;
        }
        
        if (selectedPlanets.includes(planetId)) {
            return false;
        }
        
        const miniCard = document.createElement('div');
        miniCard.className = 'comparison-mini-card';
        miniCard.dataset.planet = planetId;
        
        miniCard.innerHTML = `
            <div class="planet-icon">${planetData.icon}</div>
            <div class="planet-name">${planetData.name}</div>
            <button class="remove-comparison-btn" data-planet="${planetId}">✕</button>
        `;
        
        container.appendChild(miniCard);
        return true;
    },

    // Удаление планеты из сравнения
    removeFromComparison(planetId) {
        const container = document.getElementById('selected-planets');
        const miniCard = container.querySelector(`[data-planet="${planetId}"]`);
        if (miniCard) {
            miniCard.remove();
        }
    },

    // Показ сравнения планет
    showComparison(planetsToCompare) {
        if (planetsToCompare.length < 2) {
            alert('Выберите минимум 2 планеты для сравнения');
            return;
        }
        
        const panel = document.getElementById('planet-info-panel');
        const content = document.getElementById('planet-info-content');
        
        let comparisonHTML = '<h2 style="text-align: center; margin-bottom: 2rem;">Сравнение планет</h2>';
        
        // Таблица сравнения
        comparisonHTML += '<table class="comparison-table"><thead><tr><th>Параметр</th>';
        planetsToCompare.forEach(planetId => {
            const planet = window.planetsData[planetId];
            comparisonHTML += `<th><span class="comparison-planet-name">${planet.icon} ${planet.name}</span></th>`;
        });
        comparisonHTML += '</tr></thead><tbody>';
        
        // Строки параметров
        const params = [
            { key: 'mass', label: 'Масса (M⊕)', format: v => v },
            { key: 'radius', label: 'Радиус (км)', format: v => v.toLocaleString() },
            { key: 'distanceFromSun', label: 'Расстояние от Солнца (млн км)', format: v => v },
            { key: 'gravity', label: 'Гравитация (g)', format: v => v },
            { key: 'dayLength', label: 'Длительность суток (дней)', format: v => v },
            { key: 'yearLength', label: 'Длительность года (дней)', format: v => v },
            { key: 'moons', label: 'Спутники', format: v => v }
        ];
        
        params.forEach(param => {
            comparisonHTML += `<tr><td><strong>${param.label}</strong></td>`;
            planetsToCompare.forEach(planetId => {
                const planet = window.planetsData[planetId];
                comparisonHTML += `<td>${param.format(planet[param.key])}</td>`;
            });
            comparisonHTML += '</tr>';
        });
        
        comparisonHTML += '</tbody></table>';
        
        content.innerHTML = comparisonHTML;
        panel.style.display = 'block';
    },

    // Очистка сравнения
    clearComparison() {
        const container = document.getElementById('selected-planets');
        container.innerHTML = '';
    }
};

// Экспорт UI утилит
window.UI = UI;
