// Cosmic Assistant - AI Helper Character

class CosmicAssistant {
    constructor() {
        this.assistantName = 'КОРА'; // Космический Робот-Ассистент
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
    
    // Contextual hints
    hint(hintText) {
        this.show(`💡 Подсказка: ${hintText}`, 7000);
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
