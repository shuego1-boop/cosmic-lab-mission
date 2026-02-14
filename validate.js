#!/usr/bin/env node

/**
 * Validation script for Cosmic Lab Mission
 * Checks that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Космическая лаборатория — Валидация проекта\n');

let errors = 0;
let warnings = 0;

function check(condition, message, isWarning = false) {
    if (condition) {
        console.log(`✅ ${message}`);
    } else {
        if (isWarning) {
            console.log(`⚠️  ${message}`);
            warnings++;
        } else {
            console.log(`❌ ${message}`);
            errors++;
        }
    }
}

// Check files exist
console.log('📁 Проверка файлов:\n');

const requiredFiles = [
    'package.json',
    'main.js',
    'preload.js',
    'src/index.html',
    'src/css/style.css',
    'src/css/animations.css',
    'src/css/planets.css',
    'src/js/app.js',
    'src/js/data.js',
    'src/js/mission.js',
    'src/js/quiz.js',
    'src/js/ui.js',
    'README.md'
];

requiredFiles.forEach(file => {
    check(fs.existsSync(file), `Файл ${file} существует`);
});

// Check package.json
console.log('\n📦 Проверка package.json:\n');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check(packageJson.name === 'cosmic-lab-mission', 'Название проекта корректно');
check(packageJson.main === 'main.js', 'Main файл указан');
check(packageJson.scripts.start === 'electron .', 'Команда start настроена');
check(packageJson.scripts['build:win'], 'Команда build:win настроена');
check(packageJson.devDependencies.electron, 'Electron установлен как зависимость');

// Check HTML structure
console.log('\n🌐 Проверка HTML:\n');

const html = fs.readFileSync('src/index.html', 'utf8');
check(html.includes('lang="ru"'), 'Язык установлен на русский');
check(html.includes('id="main-screen"'), 'Главный экран определён');
check(html.includes('id="solar-system-screen"'), 'Экран солнечной системы определён');
check(html.includes('id="briefing-screen"'), 'Экран брифинга определён');
check(html.includes('id="mission-screen"'), 'Экран миссии определён');
check(html.includes('id="final-screen"'), 'Финальный экран определён');

// Check CSS files
console.log('\n🎨 Проверка CSS:\n');

const style = fs.readFileSync('src/css/style.css', 'utf8');
check(style.includes(':root'), 'CSS переменные определены');
check(style.includes('--color-dark-bg'), 'Цветовая схема настроена');
check(style.length > 5000, 'Основной CSS файл достаточно полный');

const animations = fs.readFileSync('src/css/animations.css', 'utf8');
check(animations.includes('@keyframes'), 'CSS анимации определены');
check(animations.includes('twinkle'), 'Анимация звёзд определена');

// Check JavaScript
console.log('\n⚙️  Проверка JavaScript:\n');

const data = fs.readFileSync('src/js/data.js', 'utf8');
check(data.includes('planetsData'), 'Данные планет определены');
check(data.includes('missionStages'), 'Этапы миссии определены');
check(data.includes('quizQuestions'), 'Вопросы теста определены');

const planetsCount = (data.match(/id:/g) || []).length;
check(planetsCount === 9, `Все 9 небесных тел определены (найдено: ${planetsCount})`);

check(data.includes('basic:'), 'Базовый уровень определён');
check(data.includes('advanced:'), 'Продвинутый уровень определён');

const app = fs.readFileSync('src/js/app.js', 'utf8');
check(app.includes('class CosmicLabApp'), 'Главный класс приложения определён');
check(app.includes('DOMContentLoaded'), 'Инициализация при загрузке DOM');

// Check documentation
console.log('\n📚 Проверка документации:\n');

const readme = fs.readFileSync('README.md', 'utf8');
check(readme.includes('npm start'), 'Инструкции по запуску присутствуют');
check(readme.includes('npm run build'), 'Инструкции по сборке присутствуют');
check(readme.length > 2000, 'README достаточно подробный');

check(fs.existsSync('TESTING.md'), 'Файл тестирования существует', true);
check(fs.existsSync('QUICKSTART.md'), 'Быстрый старт существует', true);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Итоги валидации:\n');

if (errors === 0 && warnings === 0) {
    console.log('🎉 Отлично! Все проверки пройдены успешно!');
    console.log('✅ Проект готов к использованию.');
} else if (errors === 0) {
    console.log(`⚠️  Проверка пройдена с ${warnings} предупреждением(ями).`);
    console.log('ℹ️  Проект работоспособен, но можно улучшить.');
} else {
    console.log(`❌ Обнаружено ${errors} ошибок и ${warnings} предупреждений.`);
    console.log('⚠️  Необходимо исправить ошибки перед использованием.');
    process.exit(1);
}

console.log('\n🚀 Запустите приложение командой: npm start');
console.log('📦 Соберите для Windows командой: npm run build:win');
console.log('');
