// Gamification System - Achievements, Progress, Resources

class GameProgress {
    constructor() {
        this.achievements = [
            { 
                id: 'first_launch', 
                name: 'Первый запуск', 
                icon: '🚀',
                description: 'Начните свою первую миссию',
                unlocked: false 
            },
            { 
                id: 'moon_explorer', 
                name: 'Исследователь Луны', 
                icon: '🌙',
                description: 'Завершите миссию на Луну',
                unlocked: false 
            },
            { 
                id: 'mars_pioneer', 
                name: 'Пионер Марса', 
                icon: '🔴',
                description: 'Завершите миссию на Марс',
                unlocked: false 
            },
            { 
                id: 'planet_master', 
                name: 'Мастер планет', 
                icon: '🌟',
                description: 'Изучите все планеты',
                unlocked: false 
            },
            { 
                id: 'quiz_perfect', 
                name: 'Идеальный результат', 
                icon: '💯',
                description: 'Получите 100% в финальном тесте',
                unlocked: false 
            }
        ];
        
        this.resources = {
            fuel: 100,
            oxygen: 100,
            time: 0
        };
        
        this.missionStats = {
            totalMissions: 0,
            completedMissions: 0,
            planetsExplored: [],
            totalScore: 0
        };
        
        this.currentMission = null;
        
        // Load progress from localStorage
        this.loadProgress();
    }
    
    // Initialize resources for a mission
    initMissionResources(missionType) {
        switch(missionType) {
            case 'moon':
                this.resources = { fuel: 100, oxygen: 100, time: 300 }; // 5 min
                break;
            case 'mars':
                this.resources = { fuel: 100, oxygen: 100, time: 600 }; // 10 min
                break;
            case 'jupiter':
                this.resources = { fuel: 100, oxygen: 100, time: 900 }; // 15 min
                break;
            default:
                this.resources = { fuel: 100, oxygen: 100, time: 600 };
        }
        this.currentMission = missionType;
    }
    
    // Update resources during flight
    updateResources(fuelDelta = 0, oxygenDelta = 0, timeDelta = 0) {
        this.resources.fuel = Math.max(0, Math.min(100, this.resources.fuel + fuelDelta));
        this.resources.oxygen = Math.max(0, Math.min(100, this.resources.oxygen + oxygenDelta));
        this.resources.time = Math.max(0, this.resources.time + timeDelta);
        
        // Trigger UI update
        this.displayResources();
        
        // Check for critical levels
        if (this.resources.fuel < 20 || this.resources.oxygen < 20) {
            this.showResourceWarning();
        }
        
        return this.resources;
    }
    
    // Display resources in UI
    displayResources() {
        const resourcePanel = document.getElementById('resource-panel');
        if (!resourcePanel) return;
        
        resourcePanel.innerHTML = `
            <div class="resource-indicator">
                <div class="resource-icon">⛽</div>
                <div class="resource-label">Топливо</div>
                <div class="resource-bar">
                    <div class="resource-bar-fill ${this.resources.fuel < 20 ? 'low' : ''}" 
                         style="width: ${this.resources.fuel}%"></div>
                </div>
                <div class="resource-value">${Math.round(this.resources.fuel)}%</div>
            </div>
            <div class="resource-indicator">
                <div class="resource-icon">💨</div>
                <div class="resource-label">Кислород</div>
                <div class="resource-bar">
                    <div class="resource-bar-fill ${this.resources.oxygen < 20 ? 'low' : ''}" 
                         style="width: ${this.resources.oxygen}%"></div>
                </div>
                <div class="resource-value">${Math.round(this.resources.oxygen)}%</div>
            </div>
            <div class="resource-indicator">
                <div class="resource-icon">⏱️</div>
                <div class="resource-label">Время</div>
                <div class="resource-value">${this.formatTime(this.resources.time)}</div>
            </div>
        `;
    }
    
    // Format time in MM:SS
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Show resource warning
    showResourceWarning() {
        // This can be enhanced with a modal or notification
        console.warn('⚠️ Внимание! Критический уровень ресурсов!');
    }
    
    // Unlock achievement
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showAchievementUnlock(achievement);
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Show achievement unlock animation
    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-badge unlocked">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideInFromRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
        console.log(`🏆 Достижение разблокировано: ${achievement.name}`);
    }
    
    // Display all achievements
    displayAchievements(containerId = 'achievements-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Update mission stats
    updateMissionStats(completed = false, score = 0, planetExplored = null) {
        this.missionStats.totalMissions++;
        if (completed) {
            this.missionStats.completedMissions++;
            this.missionStats.totalScore += score;
            
            // Unlock mission-specific achievements
            if (this.currentMission === 'moon') {
                this.unlockAchievement('moon_explorer');
            } else if (this.currentMission === 'mars') {
                this.unlockAchievement('mars_pioneer');
            }
            
            // Check for quiz perfect
            if (score >= 100) {
                this.unlockAchievement('quiz_perfect');
            }
        }
        
        if (planetExplored && !this.missionStats.planetsExplored.includes(planetExplored)) {
            this.missionStats.planetsExplored.push(planetExplored);
            
            // Check if all planets explored (8 planets)
            if (this.missionStats.planetsExplored.length >= 8) {
                this.unlockAchievement('planet_master');
            }
        }
        
        this.saveProgress();
    }
    
    // Save progress to localStorage
    saveProgress() {
        const progressData = {
            achievements: this.achievements,
            missionStats: this.missionStats,
            resources: this.resources
        };
        
        try {
            localStorage.setItem('cosmicLabProgress', JSON.stringify(progressData));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    
    // Load progress from localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem('cosmicLabProgress');
            if (saved) {
                const progressData = JSON.parse(saved);
                
                // Restore achievements
                if (progressData.achievements) {
                    this.achievements = this.achievements.map(achievement => {
                        const saved = progressData.achievements.find(a => a.id === achievement.id);
                        return saved ? { ...achievement, unlocked: saved.unlocked } : achievement;
                    });
                }
                
                // Restore stats
                if (progressData.missionStats) {
                    this.missionStats = { ...this.missionStats, ...progressData.missionStats };
                }
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }
    
    // Reset progress
    resetProgress() {
        this.achievements.forEach(a => a.unlocked = false);
        this.missionStats = {
            totalMissions: 0,
            completedMissions: 0,
            planetsExplored: [],
            totalScore: 0
        };
        this.resources = { fuel: 100, oxygen: 100, time: 0 };
        this.saveProgress();
    }
    
    // Get progress summary
    getProgressSummary() {
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        const totalAchievements = this.achievements.length;
        
        return {
            achievementProgress: `${unlockedCount}/${totalAchievements}`,
            achievementPercentage: Math.round((unlockedCount / totalAchievements) * 100),
            totalMissions: this.missionStats.totalMissions,
            completedMissions: this.missionStats.completedMissions,
            planetsExplored: this.missionStats.planetsExplored.length,
            averageScore: this.missionStats.completedMissions > 0 
                ? Math.round(this.missionStats.totalScore / this.missionStats.completedMissions)
                : 0
        };
    }
}

// Export GameProgress
window.GameProgress = GameProgress;

// Initialize global instance
if (!window.gameProgress) {
    window.gameProgress = new GameProgress();
}
