// Cosmic Assistant - AI Helper Character

class CosmicAssistant {
    constructor() {
        this.assistantName = 'КОРА'; // Космический Робот-Ассистент
        
        // Planet-specific scientific facts
        this.planetFacts = {
            mercury: [
                'Меркурий - самая маленькая планета, но имеет огромное железное ядро!',
                'На Меркурии день длится 176 земных дней - дольше, чем год!',
                'Температура на Меркурии колеблется от -180°C до +430°C!'
            ],
            venus: [
                'Венера - самая горячая планета благодаря парниковому эффекту от CO₂!',
                'Атмосферное давление на Венере в 92 раза выше земного!',
                'Венера вращается в обратную сторону - Солнце там восходит на западе!'
            ],
            earth: [
                'Земля - единственная планета с жидкой водой на поверхности!',
                '71% поверхности Земли покрыто водой!',
                'Магнитное поле Земли защищает нас от солнечного ветра!'
            ],
            moon: [
                'Луна всегда повернута к Земле одной стороной!',
                'Гравитация Луны создает приливы и отливы на Земле!',
                'На Луне нет атмосферы, поэтому следы астронавтов сохранятся миллионы лет!'
            ],
            mars: [
                'Марс красный из-за оксида железа (ржавчины) в почве!',
                'Олимп на Марсе - самая большая гора в Солнечной системе (25 км)!',
                'Гравитация на Марсе всего 38% от земной - вы бы прыгали в 2.5 раза выше!'
            ],
            jupiter: [
                'Юпитер настолько массивен, что может вместить 1300 Земель!',
                'Большое Красное Пятно - это шторм размером больше Земли!',
                'У Юпитера 79 известных спутников!'
            ],
            saturn: [
                'Кольца Сатурна состоят из льда и камней!',
                'Сатурн настолько легкий, что мог бы плавать в воде!',
                'Ветры на Сатурне достигают 1800 км/ч!'
            ],
            uranus: [
                'Уран наклонен на 98° - он практически лежит на боку!',
                'Уран - самая холодная планета (-224°C)!',
                'Уран имеет 27 известных спутников, названных в честь героев Шекспира!'
            ],
            neptune: [
                'Нептун - самая ветреная планета (скорость ветра 2100 км/ч)!',
                'Один год на Нептуне длится 165 земных лет!',
                'Нептун излучает больше тепла, чем получает от Солнца!'
            ]
        };
        
        // Quiz wrong answer explanations
        this.quizExplanations = {
            atmosphere: 'Атмосфера планеты определяет её температуру и возможность поддержания жизни.',
            gravity: 'Гравитация зависит от массы планеты - чем больше масса, тем сильнее притяжение.',
            temperature: 'Температура зависит от расстояния до Солнца и парникового эффекта атмосферы.',
            size: 'Размер планет варьируется: газовые гиганты намного больше каменистых планет.',
            distance: 'Чем дальше от Солнца, тем холоднее и дольше орбитальный период.'
        };
        
        // Game hints
        this.gameHints = {
            marsLanding: [
                'Постепенно снижайте тягу для мягкой посадки!',
                'Следите за топливом - оно ограничено!',
                'Скорость посадки должна быть меньше 5 м/с!',
                'Наклон помогает управлять горизонтальным положением!'
            ],
            asteroidNavigator: [
                'Собирайте щиты для дополнительной жизни!',
                'Топливо дает +10 очков!',
                'Сложность увеличивается каждые 10 секунд!',
                'Не паникуйте - следите за траекторией астероидов!'
            ],
            resourceCollector: [
                'Собирайте быстро для увеличения комбо!',
                'Метан (CH₄) дает больше всего очков!',
                'Комбо x5 - максимальный множитель!',
                'H₂O (вода) - самый ценный ресурс для колонизации!'
            ]
        };
        
        this.messages = {
            welcome: [
                'Добро пожаловать на борт, командир! Я КОРА - ваш космический ассистент.',
                'Привет! Готовы к новым космическим приключениям?',
                'Отличный день для космической миссии, командир!'
            ],
            missionSelect: [
                'Выберите миссию с умом. Каждая имеет свои особенности!',
                'Начните с Луны, если это ваша первая миссия.',
                'Более сложные миссии дают больше очков!'
            ],
            solarSystem: [
                'Изучите планеты перед стартом. Знания - ключ к успеху!',
                'Двойной клик по планете добавит её в сравнение.',
                'Каждая планета уникальна. Узнайте их особенности!'
            ],
            briefing: [
                'Внимательно прочитайте брифинг. Это важная информация!',
                'Готовы к старту? Проверьте все системы!',
                'Эта миссия будет непростой, но я верю в вас!'
            ],
            launch: [
                'Запуск через 3... 2... 1... Поехали!',
                'Все системы в норме. Готовы к запуску!',
                'Удачного полета, командир!'
            ],
            flight: [
                'Следите за уровнем топлива и кислорода!',
                'Полет проходит нормально. Держим курс!',
                'Внимание! Впереди пояс астероидов!'
            ],
            lowResources: [
                '⚠️ Критический уровень топлива!',
                '⚠️ Внимание! Низкий уровень кислорода!',
                '⚠️ Ресурсы на исходе. Будьте осторожны!'
            ],
            mission: [
                'Подумайте перед ответом. Используйте научные данные!',
                'Отличное решение, командир!',
                'Не переживайте, можно попробовать снова!'
            ],
            quiz: [
                'Финальный тест! Покажите свои знания!',
                'Вспомните всё, что изучили о планетах.',
                'Каждый правильный ответ важен!'
            ],
            success: [
                '🎉 Поздравляю! Миссия выполнена успешно!',
                '🌟 Отличная работа, командир!',
                '🚀 Вы справились! Горжусь вами!'
            ],
            failure: [
                'Не расстраивайтесь. Учимся на ошибках!',
                'Попробуйте еще раз. У вас получится!',
                'Каждая ошибка - шаг к успеху!'
            ],
            achievement: [
                '🏆 Новое достижение разблокировано!',
                '⭐ Отличная работа! Продолжайте в том же духе!',
                '💫 Вы становитесь настоящим космонавтом!'
            ]
        };
        
        this.currentContext = 'welcome';
        this.currentPlanet = null;
        this.isVisible = true;
        this.element = null;
        
        this.init();
    }
    
    // Initialize assistant
    init() {
        this.createAssistantElement();
        this.show(this.getRandomMessage('welcome'));
    }
    
    // Create assistant DOM element
    createAssistantElement() {
        this.element = document.createElement('div');
        this.element.className = 'cosmic-assistant';
        this.element.id = 'cosmic-assistant';
        
        this.element.innerHTML = `
            <div class="assistant-avatar">
                <div class="assistant-robot">
                    🤖
                </div>
            </div>
            <div class="assistant-speech-bubble" id="assistant-speech">
                <div class="assistant-message" id="assistant-message"></div>
                <button class="assistant-close" id="assistant-close">✕</button>
            </div>
        `;
        
        document.body.appendChild(this.element);
        
        // Add event listeners
        const closeBtn = document.getElementById('assistant-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Click on avatar to show/hide
        const avatar = this.element.querySelector('.assistant-avatar');
        if (avatar) {
            avatar.addEventListener('click', () => this.toggle());
        }
    }
    
    // Get random message from context
    getRandomMessage(context) {
        const messages = this.messages[context] || this.messages.welcome;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Show assistant with message
    show(message, duration = 5000) {
        if (!this.element) return;
        
        const messageEl = document.getElementById('assistant-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        this.element.classList.add('active');
        this.isVisible = true;
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(), duration);
        }
    }
    
    // Hide assistant
    hide() {
        if (!this.element) return;
        
        this.element.classList.remove('active');
        this.isVisible = false;
    }
    
    // Toggle visibility
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(this.getRandomMessage(this.currentContext));
        }
    }
    
    // Say something based on context
    say(context, customMessage = null) {
        this.currentContext = context;
        const message = customMessage || this.getRandomMessage(context);
        this.show(message);
    }
    
    // Show planet-specific fact
    showPlanetFact(planetId) {
        this.currentPlanet = planetId;
        const facts = this.planetFacts[planetId];
        if (facts && facts.length > 0) {
            const fact = facts[Math.floor(Math.random() * facts.length)];
            this.show(`💡 ${fact}`, 8000);
        }
    }
    
    // Explain wrong quiz answer
    explainQuizError(question, selectedAnswer, correctAnswer, explanation) {
        const message = `❌ Неверно! Правильный ответ: ${correctAnswer}. 
        
📚 ${explanation}`;
        this.show(message, 10000);
    }
    
    // Show progress tracking
    showProgress(correctAnswers, totalQuestions) {
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        let message = '';
        
        if (percentage >= 80) {
            message = `🌟 Отлично! ${percentage}% правильных ответов!`;
        } else if (percentage >= 60) {
            message = `✅ Хорошо! ${percentage}% правильных ответов. Можете лучше!`;
        } else {
            message = `📚 ${percentage}% правильных ответов. Повторите материал!`;
        }
        
        this.show(message, 6000);
    }
    
    // Contextual hints
    hint(hintText) {
        this.show(`💡 Подсказка: ${hintText}`, 7000);
    }
    
    // Game-specific hints
    gameHint(gameType) {
        const hints = this.gameHints[gameType];
        if (hints && hints.length > 0) {
            const hint = hints[Math.floor(Math.random() * hints.length)];
            this.hint(hint);
        }
    }
    
    // Warning messages
    warn(warningText) {
        this.show(`⚠️ ${warningText}`, 6000);
    }
    
    // Celebration messages
    celebrate(celebrationText) {
        this.show(`🎉 ${celebrationText}`, 5000);
    }
    
    // Update context automatically based on screen
    updateContext(screenId) {
        const contextMap = {
            'main-screen': 'welcome',
            'mission-select-screen': 'missionSelect',
            'solar-system-screen': 'solarSystem',
            'briefing-screen': 'briefing',
            'launch-screen': 'launch',
            'flight-screen': 'flight',
            'mission-screen': 'mission',
            'final-screen': 'quiz'
        };
        
        const newContext = contextMap[screenId] || this.currentContext;
        if (newContext !== this.currentContext) {
            this.currentContext = newContext;
            this.say(newContext);
        }
    }
}

// Export CosmicAssistant
window.CosmicAssistant = CosmicAssistant;

// Initialize global instance
if (!window.cosmicAssistant) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cosmicAssistant = new CosmicAssistant();
        });
    } else {
        window.cosmicAssistant = new CosmicAssistant();
    }
}
