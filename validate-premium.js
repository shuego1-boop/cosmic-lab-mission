#!/usr/bin/env node

// Validation script for Cosmic Lab Premium v2.0

const fs = require('fs');
const path = require('path');

console.log('🚀 Validating Cosmic Lab Premium v2.0...\n');

const checks = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function check(condition, message, isWarning = false) {
    if (condition) {
        console.log(`✅ ${message}`);
        checks.passed++;
    } else {
        if (isWarning) {
            console.log(`⚠️  ${message}`);
            checks.warnings++;
        } else {
            console.log(`❌ ${message}`);
            checks.failed++;
        }
    }
}

// Check file existence
const files = [
    'src/index.html',
    'src/css/style.css',
    'src/css/animations.css',
    'src/css/planets.css',
    'src/css/glassmorphism.css',
    'src/css/gamification.css',
    'src/js/app.js',
    'src/js/data.js',
    'src/js/ui.js',
    'src/js/mission.js',
    'src/js/quiz.js',
    'src/js/gamification.js',
    'src/js/assistant.js',
    'src/js/minigames.js',
    'src/js/animations-controller.js'
];

console.log('📁 Checking file existence...');
files.forEach(file => {
    const exists = fs.existsSync(file);
    check(exists, `File exists: ${file}`);
});

// Check HTML structure
console.log('\n🏗️  Checking HTML structure...');
const html = fs.readFileSync('src/index.html', 'utf8');

check(html.includes('mission-select-screen'), 'Mission selection screen present');
check(html.includes('launch-screen'), 'Launch screen present');
check(html.includes('flight-screen'), 'Flight screen present');
check(html.includes('glassmorphism.css'), 'Glassmorphism CSS linked');
check(html.includes('gamification.css'), 'Gamification CSS linked');
check(html.includes('gamification.js'), 'Gamification JS linked');
check(html.includes('assistant.js'), 'Assistant JS linked');
check(html.includes('minigames.js'), 'Mini-games JS linked');
check(html.includes('animations-controller.js'), 'Animations controller JS linked');
check(html.includes('spaceship'), 'Animated spaceship present');
check(html.includes('comet'), 'Comets present');
check(html.includes('nebula'), 'Nebulae present');
check(html.includes('achievements-container'), 'Achievements container present');

// Check CSS features
console.log('\n🎨 Checking CSS features...');
const styleCss = fs.readFileSync('src/css/style.css', 'utf8');
const glassCss = fs.readFileSync('src/css/glassmorphism.css', 'utf8');
const gamifCss = fs.readFileSync('src/css/gamification.css', 'utf8');
const animCss = fs.readFileSync('src/css/animations.css', 'utf8');

check(styleCss.includes('--neon-cyan'), 'Neon cyan color defined');
check(styleCss.includes('--neon-purple'), 'Neon purple color defined');
check(styleCss.includes('--neon-pink'), 'Neon pink color defined');
check(styleCss.includes('--space-gold'), 'Space gold color defined');
check(styleCss.includes('sun-pulse'), 'Sun pulsation animation');

check(glassCss.includes('backdrop-filter'), 'Glassmorphism backdrop-filter');
check(glassCss.includes('glass-panel'), 'Glass panel styles');
check(glassCss.includes('glass-card'), 'Glass card styles');

check(gamifCss.includes('achievement-badge'), 'Achievement badge styles');
check(gamifCss.includes('mission-card'), 'Mission card styles');
check(gamifCss.includes('resource-panel'), 'Resource panel styles');
check(gamifCss.includes('cosmic-assistant'), 'Cosmic assistant styles');

check(animCss.includes('stars4'), 'Additional star layers (stars4)');
check(animCss.includes('stars5'), 'Additional star layers (stars5)');
check(animCss.includes('comet-fly'), 'Comet animation');
check(animCss.includes('nebula-drift'), 'Nebula animation');
check(animCss.includes('spaceship-float'), 'Spaceship float animation');
check(animCss.includes('prefers-reduced-motion'), 'Reduced motion support');

// Check JavaScript features
console.log('\n⚙️  Checking JavaScript features...');
const dataJs = fs.readFileSync('src/js/data.js', 'utf8');
const gamifJs = fs.readFileSync('src/js/gamification.js', 'utf8');
const assistJs = fs.readFileSync('src/js/assistant.js', 'utf8');
const minigamesJs = fs.readFileSync('src/js/minigames.js', 'utf8');
const animControllerJs = fs.readFileSync('src/js/animations-controller.js', 'utf8');

check(dataJs.includes('missionTypes'), 'Mission types data present');
check(dataJs.includes('moon:'), 'Moon mission defined');
check(dataJs.includes('mars:'), 'Mars mission defined');
check(dataJs.includes('jupiter:'), 'Jupiter mission defined');

check(gamifJs.includes('class GameProgress'), 'GameProgress class defined');
check(gamifJs.includes('achievements:'), 'Achievements array present');
check(gamifJs.includes('first_launch'), 'First launch achievement');
check(gamifJs.includes('moon_explorer'), 'Moon explorer achievement');
check(gamifJs.includes('mars_pioneer'), 'Mars pioneer achievement');
check(gamifJs.includes('planet_master'), 'Planet master achievement');
check(gamifJs.includes('quiz_perfect'), 'Quiz perfect achievement');
check(gamifJs.includes('localStorage'), 'LocalStorage integration');

check(assistJs.includes('class CosmicAssistant'), 'CosmicAssistant class defined');
check(assistJs.includes('КОРА'), 'Assistant name (KORA) present');
check(assistJs.includes('updateContext'), 'Context update method');

check(minigamesJs.includes('dodgeMeteors'), 'Dodge meteors mini-game');
check(minigamesJs.includes('landing'), 'Landing mini-game');
check(minigamesJs.includes('collectSamples'), 'Collect samples mini-game');

check(animControllerJs.includes('launchCountdown'), 'Launch countdown animation');
check(animControllerJs.includes('flightAnimation'), 'Flight animation');
check(animControllerJs.includes('achievementUnlock'), 'Achievement unlock animation');
check(animControllerJs.includes('addConfetti'), 'Confetti effect');

// Check app integration
console.log('\n🔗 Checking app integration...');
const appJs = fs.readFileSync('src/js/app.js', 'utf8');

check(appJs.includes('setupMissionSelectScreen'), 'Mission select setup');
check(appJs.includes('loadMissionCards'), 'Mission cards loading');
check(appJs.includes('selectMission'), 'Mission selection handler');
check(appJs.includes('startFlightSequence'), 'Flight sequence integration');
check(appJs.includes('AnimationsController'), 'Animations controller usage');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Validation Summary:');
console.log(`✅ Passed:   ${checks.passed}`);
console.log(`❌ Failed:   ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.failed === 0) {
    console.log('\n🎉 All critical checks passed!');
    console.log('✨ Cosmic Lab Premium v2.0 is ready!');
} else {
    console.log(`\n⚠️  ${checks.failed} critical issue(s) found.`);
    console.log('Please review and fix the issues above.');
}

// Exit with appropriate code
process.exit(checks.failed > 0 ? 1 : 0);
