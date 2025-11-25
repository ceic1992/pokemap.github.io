// ========== POKETIME WIDGET ==========

const REFERENCE_REAL_TIME_UTC = Date.UTC(2025, 10, 25, 0, 0, 0);
const REFERENCE_GAME_TIME = { hours: 0, minutes: 0 };
const SECONDS_PER_GAME_MINUTE = 12;

let updateCount = 0;

const routesData = {
    morning: [
        {
            route: "Route 24",
            city: "Kanto - Cerulean City",
            stats: [
                { name: "HP", type: "LAND" },
                { name: "DEF", type: "SURF" }
            ]
        },
        {
            route: "Route 31",
            city: "Johto - Violet City",
            stats: [
                { name: "ATK", type: "LAND" },
                { name: "SPD", type: "SURF" }
            ]
        },
        {
            route: "Route 120",
            city: "Hoenn - Fortree City",
            stats: [
                { name: "SP.ATK", type: "LAND" },
                { name: "SP.DEF", type: "SURF" }
            ]
        },
        {
            route: "Route 208",
            city: "Sinnoh - Hearthome City",
            stats: [
                { name: "HP", type: "LAND" },
                { name: "DEF", type: "SURF" }
            ]
        }
    ],
    day: [
        {
            route: "Route 24",
            city: "Kanto - Cerulean City",
            stats: [
                { name: "SPD", type: "LAND" },
                { name: "ATK", type: "SURF" }
            ]
        },
        {
            route: "Route 31",
            city: "Johto - Violet City",
            stats: [
                { name: "DEF", type: "LAND" },
                { name: "HP", type: "SURF" }
            ]
        },
        {
            route: "Route 120",
            city: "Hoenn - Fortree City",
            stats: [
                { name: "ATK", type: "LAND" },
                { name: "SPD", type: "SURF" }
            ]
        },
        {
            route: "Route 208",
            city: "Sinnoh - Hearthome City",
            stats: [
                { name: "SP.ATK", type: "LAND" },
                { name: "SP.DEF", type: "SURF" }
            ]
        }
    ],
    night: [
        {
            route: "Route 24",
            city: "Kanto - Cerulean City",
            stats: [
                { name: "SP.ATK", type: "LAND" },
                { name: "SP.DEF", type: "SURF" }
            ]
        },
        {
            route: "Route 31",
            city: "Johto - Violet City",
            stats: [
                { name: "SP.ATK", type: "LAND" },
                { name: "SP.DEF", type: "SURF" }
            ]
        },
        {
            route: "Route 120",
            city: "Hoenn - Fortree City",
            stats: [
                { name: "HP", type: "LAND" },
                { name: "DEF", type: "SURF" }
            ]
        },
        {
            route: "Route 208",
            city: "Sinnoh - Hearthome City",
            stats: [
                { name: "ATK", type: "LAND" },
                { name: "SPD", type: "SURF" }
            ]
        }
    ]
};

function calculateGameTime() {
    const nowUTC = Date.now();
    const timeDiff = nowUTC - REFERENCE_REAL_TIME_UTC;
    const realSecondsPassed = timeDiff / 1000;
    const gameMinutesPassed = realSecondsPassed / SECONDS_PER_GAME_MINUTE;
    
    let totalGameMinutes = (REFERENCE_GAME_TIME.hours * 60 + REFERENCE_GAME_TIME.minutes) + gameMinutesPassed;
    totalGameMinutes = totalGameMinutes % 1440;
    if (totalGameMinutes < 0) totalGameMinutes += 1440;
    
    const gameHours = Math.floor(totalGameMinutes / 60);
    const gameMinutes = Math.floor(totalGameMinutes % 60);
    const gameSeconds = Math.floor((totalGameMinutes % 1) * 60);
    
    return { hours: gameHours, minutes: gameMinutes, seconds: gameSeconds };
}

function getPeriod(hours) {
    if (hours >= 4 && hours < 10) {
        return { name: 'Morning', class: 'morning', icon: '🌅', key: 'morning' };
    } else if (hours >= 10 && hours < 20) {
        return { name: 'Day', class: 'day', icon: '☀️', key: 'day' };
    } else {
        return { name: 'Night', class: 'night', icon: '🌙', key: 'night' };
    }
}

function formatTime24h(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateRoutes(periodKey) {
    const routesContainer = document.getElementById('routesContainer');
    if (!routesContainer) return;

    const routes = routesData[periodKey];
    if (!routes) return;

    let html = '<div class="period-title">📍 EV Train</div>';
    html += '<div class="routes-grid">';

    routes.forEach(route => {
        html += `
            <div class="route-item">
                <div class="route-name">${route.route}</div>
                <div class="route-location">${route.city}</div>
                <div class="route-stats">
                    ${route.stats.map(stat => `
                        <span class="stat stat-${stat.type.toLowerCase()}">
                            ${stat.name} - ${stat.type}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    routesContainer.innerHTML = html;
}

function updatePokeTimeClock() {
    try {
        updateCount++;
        
        const gameTime = calculateGameTime();
        const period = getPeriod(gameTime.hours);
        const now = new Date();
        
        const gameTimeElement = document.getElementById('gameTime');
        if (gameTimeElement) {
            gameTimeElement.textContent = formatTime24h(gameTime.hours, gameTime.minutes);
        }
        
        const periodElement = document.getElementById('period');
        if (periodElement) {
            periodElement.textContent = `${period.icon} ${period.name}`;
            periodElement.className = `period ${period.class}`;
        }
        
        const realTimeElement = document.getElementById('realTime');
        if (realTimeElement) {
            realTimeElement.textContent = 
                `Local Time: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        }
        
        updateRoutes(period.key);
        
    } catch (error) {
        console.error('Error updating PokeTime:', error);
    }
}

function initPokeTime() {
    console.log('🎮 PokeTime initialized');
    
    // Toggle collapse/expand
    const toggleBtn = document.getElementById('poketime-toggle');
    const content = document.getElementById('poketime-content');
    const header = document.querySelector('.poketime-header');
    
    if (toggleBtn && content) {
        const savedState = localStorage.getItem('poketimeCollapsed');
        if (savedState === 'true') {
            content.classList.add('collapsed');
            toggleBtn.textContent = '+';
        }
        
        header.addEventListener('click', function() {
            content.classList.toggle('collapsed');
            const isCollapsed = content.classList.contains('collapsed');
            toggleBtn.textContent = isCollapsed ? '+' : '−';
            localStorage.setItem('poketimeCollapsed', isCollapsed);
        });
    }
    
    // Primera actualización
    updatePokeTimeClock();
    
    // Actualizar cada segundo
    setInterval(updatePokeTimeClock, 1000);
    
    // Verificar funcionamiento
    setTimeout(function() {
        if (updateCount < 3) {
            console.error('⚠️ PokeTime not updating correctly');
        } else {
            console.log('✅ PokeTime working correctly');
        }
    }, 5000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPokeTime);
} else {
    initPokeTime();
}

// Prevenir que se duerma
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updatePokeTimeClock();
    }
});
