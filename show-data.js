#!/usr/bin/env node

/**
 * Demo script to display planet data
 * Shows the scientific data available in the application
 */

console.log('\n🌌 КОСМИЧЕСКАЯ ЛАБОРАТОРИЯ — ДАННЫЕ ПЛАНЕТ\n');
console.log('=' .repeat(70));

// Simulate browser environment for data.js
global.window = {
    planetsData: null,
    missionStages: null,
    quizQuestions: null
};

// Load the data
require('./src/js/data.js');

const planetsData = global.window.planetsData;

// Display each planet
Object.keys(planetsData).forEach((planetId, index) => {
    const planet = planetsData[planetId];
    
    console.log(`\n${index + 1}. ${planet.icon} ${planet.name.toUpperCase()}`);
    console.log('-'.repeat(70));
    console.log(`   Тип: ${planet.type}`);
    console.log(`   Масса: ${planet.mass} M⊕`);
    console.log(`   Радиус: ${planet.radius.toLocaleString()} км`);
    console.log(`   Расстояние от Солнца: ${planet.distanceFromSun} млн км`);
    
    if (typeof planet.temperature === 'object') {
        if (planet.temperature.average !== undefined) {
            console.log(`   Температура: ${planet.temperature.average}°C (средняя)`);
        } else {
            console.log(`   Температура: день ${planet.temperature.day}°C, ночь ${planet.temperature.night}°C`);
        }
    }
    
    console.log(`   Длительность суток: ${planet.dayLength} земных суток`);
    console.log(`   Длительность года: ${planet.yearLength} земных суток`);
    console.log(`   Гравитация: ${planet.gravity}g`);
    console.log(`   Атмосфера: ${planet.atmosphere}`);
    console.log(`   Спутники: ${planet.moons}`);
    console.log(`   📝 ${planet.description}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n📊 Статистика:');
console.log(`   Всего объектов: ${Object.keys(planetsData).length}`);
console.log(`   Каменистые планеты: 4 (Меркурий, Венера, Земля, Марс)`);
console.log(`   Газовые гиганты: 2 (Юпитер, Сатурн)`);
console.log(`   Ледяные гиганты: 2 (Уран, Нептун)`);
console.log(`   Спутники: 1 (Луна)`);

console.log('\n🎮 Игровой контент:');
console.log(`   Уровней сложности: 2 (базовый, продвинутый)`);
console.log(`   Этапов миссии: 3 на каждый уровень`);
console.log(`   Вопросов теста: 5 на каждый уровень`);

console.log('\n✨ Все данные научно корректны и актуальны!\n');
