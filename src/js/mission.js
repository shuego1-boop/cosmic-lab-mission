// Логика миссии "Полёт на Марс"

const Mission = {
    difficulty: 'basic',
    currentStage: 1,
    totalStages: 3,
    scores: [],

    // Инициализация миссии
    init(difficulty) {
        this.difficulty = difficulty;
        this.currentStage = 1;
        this.scores = [];
        this.startStage(1);
    },

    // Запуск этапа
    startStage(stageNumber) {
        this.currentStage = stageNumber;
        UI.updateMissionProgress(stageNumber, this.totalStages);
        
        const stages = window.missionStages[this.difficulty];
        const stage = stages[`stage${stageNumber}`];
        
        const missionContent = document.getElementById('mission-content');
        missionContent.innerHTML = UI.createStageContent(stage);
        
        // Обработчики для вариантов ответа
        const optionButtons = document.querySelectorAll('#stage-options .option-btn');
        optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.handleAnswer(index, stage));
        });
    },

    // Обработка ответа
    handleAnswer(optionIndex, stage) {
        const option = stage.options[optionIndex];
        const isCorrect = option.correct;
        
        // Блокируем кнопки после ответа
        const optionButtons = document.querySelectorAll('#stage-options .option-btn');
        optionButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        });
        
        // Подсвечиваем выбранный ответ
        optionButtons[optionIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Показываем правильный ответ если выбран неправильный
        if (!isCorrect) {
            const correctIndex = stage.options.findIndex(opt => opt.correct);
            if (correctIndex !== -1) {
                optionButtons[correctIndex].classList.add('correct');
            }
        }
        
        // Сохраняем результат
        this.scores.push({
            stage: this.currentStage,
            correct: isCorrect,
            points: isCorrect ? 10 : 0
        });
        
        // Показываем обратную связь
        UI.showStageFeedback(option, isCorrect);
        
        // Обработчик кнопки "Продолжить"
        setTimeout(() => {
            const nextBtn = document.getElementById('next-stage-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextStage());
            }
        }, 100);
    },

    // Переход к следующему этапу
    nextStage() {
        if (this.currentStage < this.totalStages) {
            this.startStage(this.currentStage + 1);
        } else {
            // Миссия завершена, переходим к тесту
            this.completeMission();
        }
    },

    // Завершение миссии
    completeMission() {
        // Передаём результаты миссии в Quiz
        window.Quiz.missionScores = this.scores;
        window.Quiz.difficulty = this.difficulty;
        
        // Переходим к финальному тесту
        UI.switchScreen('mission-screen', 'final-screen');
        window.Quiz.init(this.difficulty);
    },

    // Получение результатов миссии
    getResults() {
        const totalPoints = this.scores.reduce((sum, score) => sum + score.points, 0);
        const maxPoints = this.totalStages * 10;
        
        return {
            total: totalPoints,
            max: maxPoints,
            breakdown: this.scores.map(score => ({
                name: `Этап ${score.stage}`,
                correct: score.correct,
                points: score.points
            }))
        };
    }
};

// Экспорт Mission
window.Mission = Mission;
