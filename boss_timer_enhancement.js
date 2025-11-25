// Función para formatear el tiempo restante de los bosses (similar a PokéStops y Excavations)
function formatBossTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return window.i18n?.t("boss.available") || "Available";
    
    const seconds = Math.floor((milliseconds / 1000) % 60).toString().padStart(2, '0');
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60).toString().padStart(2, '0');
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
        return `${days}:${hours}:${minutes}:${seconds}`;
    } else {
        return `${hours}:${minutes}:${seconds}`;
    }
}

// Función mejorada para actualizar los timers de bosses
function enhancedUpdateBossTimers() {
    let killedBosses = {};
    try {
        const savedData = localStorage.getItem('killedBosses');
        if (savedData) {
            killedBosses = JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Error reading killedBosses from localStorage:", error);
        return;
    }
    
    const timerElements = document.querySelectorAll('.boss-timer');
    timerElements.forEach(timerElement => {
        const bossName = timerElement.dataset.bossName;
        if (!bossName) return;
        
        const killedButton = timerElement.closest('div').closest('div').parentElement.querySelector('.killed-button');
        
        if (killedBosses[bossName] && killedBosses[bossName].availableAt) {
            const availableAt = killedBosses[bossName].availableAt;
            const now = Date.now();
            const timeRemaining = availableAt - now;
            
            if (timeRemaining <= 0) {
                // Boss está disponible
                timerElement.textContent = `${window.i18n?.t("boss.availableIn") || "Available in"}: ${window.i18n?.t("boss.available") || "Available"}`;
                timerElement.style.color = "#4CAF50";
                
                // Actualizar botón de killed
                if (killedButton) {
                    const img = killedButton.querySelector('img');
                    if (img) {
                        img.style.opacity = '1.0';
                    }
                    killedButton.style.pointerEvents = 'auto';
                    killedButton.style.cursor = 'pointer';
                }
                
                // Limpiar datos del localStorage
                delete killedBosses[bossName];
                try {
                    localStorage.setItem('killedBosses', JSON.stringify(killedBosses));
                } catch (error) {
                    console.error("Error saving killedBosses to localStorage:", error);
                }
            } else {
                // Boss está en cooldown - mostrar tiempo restante
                const formattedTime = formatBossTimeRemaining(timeRemaining);
                timerElement.textContent = `${window.i18n?.t("boss.availableIn") || "Available in"}: ${formattedTime}`;
                timerElement.style.color = "#FF5722";
                
                // Actualizar botón de killed
                if (killedButton) {
                    const img = killedButton.querySelector('img');
                    if (img) {
                        img.style.opacity = '0.5';
                    }
                    killedButton.style.pointerEvents = 'none';
                    killedButton.style.cursor = 'not-allowed';
                }
            }
        } else {
            // Boss está disponible (no hay datos de cooldown)
            timerElement.textContent = `${window.i18n?.t("boss.availableIn") || "Available in"}: ${window.i18n?.t("boss.available") || "Available"}`;
            timerElement.style.color = "#4CAF50";
            
            // Actualizar botón de killed
            if (killedButton) {
                const img = killedButton.querySelector('img');
                if (img) {
                    img.style.opacity = '1.0';
                }
                killedButton.style.pointerEvents = 'auto';
                killedButton.style.cursor = 'pointer';
            }
        }
    });
    
    // También actualizar iconos en el mapa
    updateBossIconsOnMap(killedBosses);
}

// Nueva función para actualizar los iconos de bosses en el mapa
function updateBossIconsOnMap(killedBosses) {
    // Buscar todos los iconos de bosses en el mapa
    const bossIcons = getBossIcons();
    
    bossIcons.forEach(icon => {
        // Obtener el nombre del boss
        const bossName = getBossNameFromIcon(icon);
        if (!bossName) return;
        
        // Verificar si el boss está en cooldown
        if (killedBosses[bossName] && killedBosses[bossName].availableAt) {
            const availableAt = killedBosses[bossName].availableAt;
            const now = Date.now();
            
            if (availableAt > now) {
                // Boss en cooldown - hacer el icono transparente
                icon.style.opacity = '0.5';
                
                // Guardar el estado de cooldown en el icono
                icon.dataset.cooldown = 'true';
                icon.dataset.availableAt = availableAt;
            } else {
                // Boss disponible
                icon.style.opacity = '1.0';
                icon.dataset.cooldown = 'false';
                delete icon.dataset.availableAt;
            }
        } else {
            // Boss disponible
            icon.style.opacity = '1.0';
            icon.dataset.cooldown = 'false';
            delete icon.dataset.availableAt;
        }
    });
}

// Función para obtener todos los iconos de bosses en el mapa
function getBossIcons() {
    // Buscar todos los iconos de bosses en el mapa usando diferentes selectores
    const bossIconSelectors = [
        '.boss-icon', 
        'img[src*="boss"]', 
        'img[alt*="boss"]',
        '.map-icon[data-type="boss"]',
        'img[data-type="boss"]'
    ];
    
    let bossIcons = [];
    
    // Recopilar todos los posibles iconos de bosses
    bossIconSelectors.forEach(selector => {
        const icons = document.querySelectorAll(selector);
        if (icons.length > 0) {
            bossIcons = [...bossIcons, ...icons];
        }
    });
    
    // Eliminar duplicados
    return [...new Set(bossIcons)];
}

// Función para obtener el nombre del boss a partir de un icono
function getBossNameFromIcon(icon) {
    return icon.dataset.bossName || 
           icon.alt || 
           icon.title || 
           icon.getAttribute('data-name') || 
           icon.getAttribute('data-boss-name');
}

// Función para marcar un boss como derrotado (activar cooldown)
function markBossAsKilled(bossName) {
    if (!isBossAvailable(bossName)) {
        console.log(window.i18n.t("log.bossAlreadyOnCooldown", [bossName]));
        return false;
    }

    const weeklyData = getWeeklyKillData();
    if (weeklyData.killCount >= WEEKLY_BOSS_LIMIT) {
        console.log(window.i18n.t("log.weeklyLimitReached", [WEEKLY_BOSS_LIMIT]));
        alert(window.i18n.t("weeklyKills.limit", [WEEKLY_BOSS_LIMIT, formatNextResetTime()]));
        return false;
    }
    
    console.log(window.i18n.t("log.markingBossAsKilled", [bossName]));
    const bossData = bosses[bossName] || {};

    // Parsear el cooldown del JSON
    let cooldownHours = 24;
    
    if (bossData.cooldown) {
        try {
            const cooldownStr = String(bossData.cooldown).toLowerCase();
            
            if (cooldownStr.includes("day")) {
                const match = cooldownStr.match(/(\d+)/);
                if (match) {
                    cooldownHours = parseInt(match[1]) * 24;
                }
            } else if (cooldownStr.includes("hour")) {
                const match = cooldownStr.match(/(\d+)/);
                if (match) {
                    cooldownHours = parseInt(match[1]);
                }
            } else {
                const match = cooldownStr.match(/(\d+)/);
                if (match) {
                    cooldownHours = parseInt(match[1]) * 24;
                }
            }
        } catch (e) {
            console.error("Error parsing cooldown:", e);
            cooldownHours = 24;
        }
    }

    const now = Date.now();
    const availableAt = now + (cooldownHours * 60 * 60 * 1000);

    let killedBosses = {};
    try {
        const savedData = localStorage.getItem('killedBosses');
        if (savedData) {
            killedBosses = JSON.parse(savedData);
        }
    } catch (error) {
        console.error(window.i18n.t("log.errorReadingFromLocalStorage"), error);
    }

    killedBosses[bossName] = {
        killedAt: now,
        availableAt: availableAt,
        cooldownHours: cooldownHours
    };

    try {
        localStorage.setItem('killedBosses', JSON.stringify(killedBosses));
    } catch (error) {
        console.error(window.i18n.t("log.errorSavingToLocalStorage"), error);
    }

    const routeNumbersBeforeRefresh = [];
    const routeNumberElements = document.querySelectorAll('.route-number');
    
    routeNumberElements.forEach(element => {
        routeNumbersBeforeRefresh.push({
            left: element.style.left,
            top: element.style.top,
            textContent: element.textContent
        });
    });

    addWeeklyKill(bossName);
    updateBossTimers();
    displayBossIcons();
    restoreRouteNumbers(routeNumbersBeforeRefresh);
    updateWeeklyKillsDisplay();
    
    return true;
}



// Función para mejorar showBossTooltip para incluir información de cooldown
function enhanceShowBossTooltip() {
    // Verificar si la función original existe
    if (typeof window.showBossTooltip !== 'function') {
        console.log("showBossTooltip function not found yet, will retry...");
        return false;
    }
    
    // Guardar la función original si no se ha hecho ya
    if (!window.originalShowBossTooltip) {
        window.originalShowBossTooltip = window.showBossTooltip;
        
        // Crear la función mejorada
        window.showBossTooltip = function(bossName, x, y) {
            // Llamar a la función original
            window.originalShowBossTooltip.call(this, bossName, x, y);
            
            // Agregar información de cooldown
            const bossTooltip = document.getElementById('boss-tooltip');
            if (bossTooltip) {
                // Marcar el tooltip con el boss actual
                bossTooltip.dataset.currentBoss = bossName;
                
                // Verificar si el boss está en cooldown
                try {
                    const savedData = localStorage.getItem('killedBosses');
                    if (savedData) {
                        const killedBosses = JSON.parse(savedData);
                        if (killedBosses[bossName] && killedBosses[bossName].availableAt) {
                            const availableAt = killedBosses[bossName].availableAt;
                            const now = Date.now();
                            const timeRemaining = availableAt - now;
                            
                            // Buscar o crear el elemento para mostrar el cooldown
                            let cooldownContainer = bossTooltip.querySelector('.boss-cooldown-info');
                            if (!cooldownContainer) {
                                cooldownContainer = document.createElement('div');
                                cooldownContainer.className = 'boss-cooldown-info';
                                bossTooltip.appendChild(cooldownContainer);
                            }
                            
                            if (timeRemaining > 0) {
                                cooldownContainer.innerHTML = `
                                    <div style="background-color: #ff5722; color: white; padding: 8px; border-radius: 4px; margin-top: 10px;">
                                        <strong>${window.i18n?.t("boss.cooldown") || "Available in"}:</strong> 
                                        <span class="boss-cooldown-timer">${formatBossTimeRemaining(timeRemaining)}</span>
                                    </div>
                                `;
                            } else {
                                cooldownContainer.innerHTML = `
                                    <div style="background-color: #4caf50; color: white; padding: 8px; border-radius: 4px; margin-top: 10px;">
                                        <strong>${window.i18n?.t("boss.available") || "Available"}</strong>
                                    </div>
                                `;
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error adding cooldown info to boss tooltip:", error);
                }
            }
        };
        
        console.log("Enhanced showBossTooltip function created successfully");
        return true;
    }
    return true;
}

// Función para actualizar tooltips activos de bosses
function updateActiveBossTooltip() {
    const activeTooltip = document.getElementById('boss-tooltip');
    if (!activeTooltip || activeTooltip.style.display === 'none') return;
    
    const bossName = activeTooltip.dataset.currentBoss;
    if (!bossName) return;
    
    try {
        const savedData = localStorage.getItem('killedBosses');
        if (savedData) {
            const killedBosses = JSON.parse(savedData);
            if (killedBosses[bossName] && killedBosses[bossName].availableAt) {
                const availableAt = killedBosses[bossName].availableAt;
                const now = Date.now();
                const timeRemaining = availableAt - now;
                
                // Buscar o crear el elemento para mostrar el cooldown
                let cooldownContainer = activeTooltip.querySelector('.boss-cooldown-info');
                if (!cooldownContainer) {
                    cooldownContainer = document.createElement('div');
                    cooldownContainer.className = 'boss-cooldown-info';
                    activeTooltip.appendChild(cooldownContainer);
                }
                
                if (timeRemaining > 0) {
                    cooldownContainer.innerHTML = `
                        <div style="background-color: #ff5722; color: white; padding: 8px; border-radius: 4px; margin-top: 10px;">
                            <strong>${window.i18n?.t("boss.cooldown") || "Available in"}:</strong> 
                            <span class="boss-cooldown-timer">${formatBossTimeRemaining(timeRemaining)}</span>
                        </div>
                    `;
                } else {
                    cooldownContainer.innerHTML = `
                        <div style="background-color: #4caf50; color: white; padding: 8px; border-radius: 4px; margin-top: 10px;">
                            <strong>${window.i18n?.t("boss.available") || "Available"}</strong>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error("Error updating boss tooltip:", error);
    }
}

// Nueva función para agregar evento de clic derecho a los iconos de bosses
function addRightClickToBossIcons() {
    console.log("Adding right-click event to boss icons...");
    
    // Obtener todos los iconos de bosses
    const bossIcons = getBossIcons();
    
    let addedCount = 0;
    
    bossIcons.forEach(icon => {
        // Verificar si ya tiene el evento contextmenu
        if (!icon.dataset.rightClickAdded) {
            // Agregar evento de clic derecho
            icon.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Obtener el nombre del boss
                const bossName = getBossNameFromIcon(icon);
                
                if (bossName) {
                    // Verificar si el boss ya está en cooldown
                    try {
                        const savedData = localStorage.getItem('killedBosses');
                        if (savedData) {
                            const killedBosses = JSON.parse(savedData);
                            if (killedBosses[bossName] && killedBosses[bossName].availableAt) {
                                const availableAt = killedBosses[bossName].availableAt;
                                const now = Date.now();
                                if (availableAt > now) {
                                    // El boss ya está en cooldown, mostrar mensaje
                                    console.log(`Boss ${bossName} is already on cooldown`);
                                
                                    return false;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error checking boss cooldown:", error);
                    }
                    
                    // Marcar el boss como derrotado (activar cooldown)
                    markBossAsKilled(bossName, icon);
                } else {
                    console.log("Could not determine boss name from icon:", icon);
                }
                
                return false;
            });
            
            // Marcar que ya se agregó el evento
            icon.dataset.rightClickAdded = 'true';
            addedCount++;
        }
        
        // Actualizar el estado visual del icono basado en el cooldown
        try {
            const savedData = localStorage.getItem('killedBosses');
            if (savedData) {
                const killedBosses = JSON.parse(savedData);
                const bossName = getBossNameFromIcon(icon);
                
                if (bossName && killedBosses[bossName] && killedBosses[bossName].availableAt) {
                    const availableAt = killedBosses[bossName].availableAt;
                    const now = Date.now();
                    
                    if (availableAt > now) {
                        // Boss en cooldown - hacer el icono transparente
                        icon.style.opacity = '0.5';
                        icon.dataset.cooldown = 'true';
                        icon.dataset.availableAt = availableAt;
                    }
                }
            }
        } catch (error) {
            console.error("Error updating boss icon state:", error);
        }
    });
    
    console.log(`Added right-click event to ${addedCount} new boss icons (total: ${bossIcons.length})`);
    
    // Programar otra verificación para nuevos iconos que puedan aparecer después
    setTimeout(addRightClickToBossIcons, 5000);
}

// Función para inicializar los timers mejorados de bosses
function initEnhancedBossTimers() {
    console.log("Initializing enhanced boss timers...");
    
    // Intentar mejorar la función showBossTooltip
    let tooltipEnhanced = enhanceShowBossTooltip();
    
    // Si no se pudo mejorar, reintentar después de un tiempo
    if (!tooltipEnhanced) {
        setTimeout(() => {
            enhanceShowBossTooltip();
        }, 1000);
    }
    
    // Reemplazar la función original updateBossTimers con la mejorada
    if (typeof window.updateBossTimers === 'function') {
        window.originalUpdateBossTimers = window.updateBossTimers;
        console.log("Original updateBossTimers function saved");
    }
    
    window.updateBossTimers = enhancedUpdateBossTimers;
    
    // Ejecutar actualización inicial
    enhancedUpdateBossTimers();
    
    // Configurar intervalo de actualización (cada segundo)
    if (window.bossTimerInterval) {
        clearInterval(window.bossTimerInterval);
    }
    
    window.bossTimerInterval = setInterval(() => {
        enhancedUpdateBossTimers();
        updateActiveBossTooltip();
    }, 1000);
    
    console.log("Enhanced boss timers initialized successfully - bosses now show countdown like PokéStops and Excavations");
    
    // Agregar evento contextmenu (clic derecho) a los iconos de bosses
    addRightClickToBossIcons();
}

function tryInitialize() {
    let attempts = 0;
    const maxAttempts = 10;
    
    function attemptInit() {
        attempts++;
        console.log(`Boss timer enhancement initialization attempt ${attempts}/${maxAttempts}`);
        
        // Verificar si las funciones necesarias están disponibles
        if (typeof window.showBossTooltip === 'function') {
            initEnhancedBossTimers();
            console.log("Boss timer enhancement initialized successfully");
        } else if (attempts < maxAttempts) {
            console.log("Required functions not ready yet, retrying in 1 second...");
            setTimeout(attemptInit, 1000);
        } else {
            console.error("Failed to initialize boss timer enhancement after maximum attempts");
            
            // Intento de último recurso: buscar iconos de bosses y agregarles eventos de clic derecho
            console.log("Last resort: trying to add right-click events to boss icons directly");
            addRightClickToBossIcons();
        }
    }
    
    attemptInit();
}

// Observador de mutaciones para detectar nuevos iconos de bosses agregados dinámicamente
function setupBossMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Verificar si hay nuevos iconos de bosses
                setTimeout(addRightClickToBossIcons, 500);
            }
        });
    });
    
    // Observar cambios en el contenedor del mapa
    const mapContainer = document.getElementById('map-container') || document.body;
    if (mapContainer) {
        observer.observe(mapContainer, { childList: true, subtree: true });
        console.log("Mutation observer set up for boss icons");
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(tryInitialize, 1000);
    });
} else {
    setTimeout(tryInitialize, 1000);
}

// También inicializar cuando la ventana esté completamente cargada
window.addEventListener('load', function() {
    setTimeout(() => {
        tryInitialize();
        setupBossMutationObserver();
    }, 2000);
    
    // Intentar nuevamente después de un tiempo más largo por si acaso
    setTimeout(() => {
        addRightClickToBossIcons();
    }, 10000);
});

// Exportar funciones para uso global
window.formatBossTimeRemaining = formatBossTimeRemaining;
window.enhancedUpdateBossTimers = enhancedUpdateBossTimers;
window.initEnhancedBossTimers = initEnhancedBossTimers;
window.enhanceShowBossTooltip = enhanceShowBossTooltip;
window.addRightClickToBossIcons = addRightClickToBossIcons;
window.markBossAsKilled = markBossAsKilled;
window.updateBossIconsOnMap = updateBossIconsOnMap;

console.log("Boss timer enhancement script loaded");