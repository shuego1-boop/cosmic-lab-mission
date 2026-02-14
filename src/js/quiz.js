// Логика финального теста

const Quiz = {
    difficulty: 'basic',
    currentQuestion: 0,
    questions: [],
    answers: [],
    missionScores: [],

    // Инициализация теста
    init(difficulty) {
        this.difficulty = difficulty;
        this.currentQuestion = 0;
        this.questions = window.quizQuestions[difficulty];
        this.answers = [];
        
        this.showQuestion(0);
    },

    // Показ вопроса
    showQuestion(questionIndex) {
        this.currentQuestion = questionIndex;
        
        const question = this.questions[questionIndex];
        const quizContent = document.getElementById('quiz-content');
        
        quizContent.innerHTML = UI.createQuizQuestion(
            question,
            questionIndex + 1,
            this.questions.length
        );
        
        // Обработчики для вариантов ответа
        const optionButtons = document.querySelectorAll('#quiz-options .option-btn');
        optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.handleAnswer(index, question));
        });
    },

    // Обработка ответа
    handleAnswer(optionIndex, question) {
        const isCorrect = optionIndex === question.correct;
        
        // Блокируем кнопки после ответа
        const optionButtons = document.querySelectorAll('#quiz-options .option-btn');
        optionButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        });
        
        // Подсвечиваем ответы
        optionButtons[optionIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
        if (!isCorrect) {
            optionButtons[question.correct].classList.add('correct');
        }
        
        // Сохраняем ответ
        this.answers.push({
            question: this.currentQuestion,
            selected: optionIndex,
            correct: isCorrect,
            points: isCorrect ? 10 : 0
        });
        
        // Показываем обратную связь
        UI.showQuizFeedback(question, optionIndex, isCorrect);
        
        // Автоматический переход к следующему вопросу или результатам
        setTimeout(() => {
            if (this.currentQuestion < this.questions.length - 1) {
                this.showQuestion(this.currentQuestion + 1);
            } else {
                this.showResults();
            }
        }, 4000); // 4 секунды на чтение обратной связи
    },

    // Показ результатов
    showResults() {
        const missionResults = window.Mission.getResults();
        const quizPoints = this.answers.reduce((sum, answer) => sum + answer.points, 0);
        const quizMaxPoints = this.questions.length * 10;
        
        const totalScore = missionResults.total + quizPoints;
        const maxScore = missionResults.max + quizMaxPoints;
        
        // Собираем детализацию
        const breakdown = [
            ...missionResults.breakdown,
            ...this.answers.map(answer => ({
                name: `Вопрос ${answer.question + 1}`,
                correct: answer.correct,
                points: answer.points
            }))
        ];
        
        // Генерируем рекомендации на основе ошибок
        const recommendations = this.generateRecommendations();
        
        UI.showResults(totalScore, maxScore, breakdown, recommendations);
    },

    // Генерация рекомендаций
    generateRecommendations() {
        const recommendations = [];
        
        // Проверяем результаты миссии
        const missionErrors = this.missionScores.filter(s => !s.correct);
        if (missionErrors.length > 0) {
            if (missionErrors.some(e => e.stage === 1)) {
                recommendations.push('Повторите материал о выборе планет для колонизации');
            }
            if (missionErrors.some(e => e.stage === 2)) {
                recommendations.push('Изучите параметры планет и их сравнение');
            }
            if (missionErrors.some(e => e.stage === 3)) {
                recommendations.push('Обратите внимание на условия посадки и анализ среды');
            }
        }
        
        // Проверяем результаты теста
        const quizErrors = this.answers.filter(a => !a.correct);
        if (quizErrors.length > 2) {
            recommendations.push('Повторите общие характеристики планет Солнечной системы');
        }
        
        // Специфичные рекомендации по вопросам
        quizErrors.forEach(error => {
            const question = this.questions[error.question];
            if (question.question.includes('атмосфер')) {
                recommendations.push('Изучите состав атмосфер различных планет');
            }
            if (question.question.includes('гравитаци')) {
                recommendations.push('Обратите внимание на гравитацию планет');
            }
            if (question.question.includes('температур')) {
                recommendations.push('Повторите температурные режимы планет');
            }
        });
        
        // Убираем дубликаты
        return [...new Set(recommendations)];
    }
};

// Экспорт Quiz
window.Quiz = Quiz;
