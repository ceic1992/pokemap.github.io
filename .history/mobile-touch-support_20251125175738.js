// ========== SIDEBAR COLAPSABLE MÓVIL ==========

function initMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-mobile');
    
    if (!sidebar || !toggleBtn) {
        console.warn('⚠️ No se encontró sidebar o botón toggle');
        return;
    }
    
    // Crear overlay oscuro
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Toggle sidebar al hacer click en el botón hamburguesa
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Cerrar sidebar al hacer click en el overlay
    overlay.addEventListener('click', function() {
        closeSidebar();
    });
    
    // Cerrar sidebar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
    
    // Función para abrir/cerrar sidebar
    function toggleSidebar() {
        const isOpen = sidebar.classList.toggle('open');
        toggleBtn.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevenir scroll del body cuando sidebar está abierto
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            console.log('📱 Sidebar abierto');
        } else {
            document.body.style.overflow = '';
            console.log('📱 Sidebar cerrado');
        }
    }
    
    // Función para cerrar sidebar
    function closeSidebar() {
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('📱 Sidebar cerrado');
    }
    
    // Cerrar sidebar automáticamente al hacer ciertas acciones (opcional)
    sidebar.addEventListener('click', function(e) {
        // Cerrar si se hace click en botones específicos
        if (e.target.classList.contains('control-btn') || 
            e.target.closest('.pokestop-toggle-btn') ||
            e.target.closest('.boss-toggle-btn') ||
            e.target.id === 'route-creator-btn') {
            
            // Esperar un poco antes de cerrar para que se vea la acción
            setTimeout(closeSidebar, 300);
        }
        
        // Cerrar si se selecciona un perfil
        if (e.target.id === 'profile-selector') {
            setTimeout(closeSidebar, 500);
        }
        
        // Cerrar si se selecciona una región
        if (e.target.id === 'region-filter') {
            setTimeout(closeSidebar, 500);
        }
    });
    
    // Cerrar sidebar al seleccionar una ruta del creador
    const routeSelect = document.getElementById('route-select');
    if (routeSelect) {
        routeSelect.addEventListener('change', function() {
            setTimeout(closeSidebar, 500);
        });
    }
    
    // Cerrar sidebar al buscar un Pokémon y seleccionar resultado
    const pokemonSearchResults = document.getElementById('pokemon-search-results');
    if (pokemonSearchResults) {
        pokemonSearchResults.addEventListener('click', function(e) {
            if (e.target.classList.contains('search-result-item')) {
                setTimeout(closeSidebar, 300);
            }
        });
    }
    
    // Detectar si es móvil
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Cerrar sidebar automáticamente al cambiar de orientación en móvil
    window.addEventListener('orientationchange', function() {
        if (isMobile() && sidebar.classList.contains('open')) {
            setTimeout(closeSidebar, 300);
        }
    });
    
    // Cerrar sidebar al redimensionar ventana si ya no es móvil
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (!isMobile() && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        }, 250);
    });
    
    // Prevenir que el sidebar se cierre al hacer scroll dentro de él
    sidebar.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    }, { passive: true });
    
    // Swipe para cerrar sidebar (deslizar hacia la izquierda)
    let touchStartX = 0;
    let touchEndX = 0;
    
    sidebar.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sidebar.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchStartX - touchEndX;
        const swipeThreshold = 100; // Mínimo de píxeles para considerar swipe
        
        // Si desliza hacia la izquierda más de 100px, cerrar sidebar
        if (swipeDistance > swipeThreshold) {
            closeSidebar();
        }
    }
    
    // Exportar funciones para uso externo
    window.mobileSidebar = {
        open: function() {
            if (!sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        },
        close: closeSidebar,
        toggle: toggleSidebar,
        isOpen: function() {
            return sidebar.classList.contains('open');
        }
    };
    
    console.log('📱 Sidebar móvil inicializado correctamente');
    console.log('📱 Funciones disponibles: window.mobileSidebar.open(), .close(), .toggle(), .isOpen()');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSidebar);
} else {
    initMobileSidebar();
}

// Reinicializar si se carga dinámicamente
window.addEventListener('load', function() {
    if (typeof window.mobileSidebar === 'undefined') {
        initMobileSidebar();
    }
});


// Ocultar cualquier botón de navegación que aparezca dinámicamente
const observer = new MutationObserver((mutations) => {
    if (window.innerWidth <= 768) {
        // Buscar y ocultar botones de navegación
        const navButtons = document.querySelectorAll('button[aria-label*="back"], button[aria-label*="return"], .back-button, .arrow-button');
        navButtons.forEach(btn => {
            if (btn.id !== 'sidebar-toggle-mobile' && 
                btn.id !== 'return-to-main-btn' &&
                !btn.classList.contains('control-btn')) {
                btn.style.display = 'none';
            }
        });
    }
});

// Observar cambios en el sidebar
const sidebar = document.getElementById('sidebar');
if (sidebar) {
    observer.observe(sidebar, {
        childList: true,
        subtree: true
    });
}


// ========== ACTIVAR COOLDOWN CON 1 TAP EN MÓVIL ==========

function initMobileCooldownTap() {
    console.log('📱 Inicializando tap para activar cooldown en móvil');
    
    // Detectar si es dispositivo móvil
    function isMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    if (!isMobile()) {
        console.log('📱 No es móvil, tap para cooldown desactivado');
        return;
    }
    
    // ========== HELPER FUNCTIONS ==========
    function getCurrentProfile() {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        const currentProfileName = localStorage.getItem('currentProfile') || 'Default';
        if (!profiles[currentProfileName]) {
            profiles[currentProfileName] = {
                pokestops: {},
                bosses: {},
                excavitions: {}
            };
        }
        return profiles[currentProfileName];
    }
    
    // ========== NOTIFICACIÓN VISUAL ==========
    function showCooldownNotification(type, name) {
        const existingNotification = document.querySelector('.cooldown-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'cooldown-notification';
        notification.innerHTML = `
            <div class="cooldown-notification-content">
                <span class="cooldown-icon">⏱️</span>
                <div class="cooldown-text">
                    <strong>${type} Cooldown</strong>
                    <span>${name}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // ========== INTERCEPTAR CLICKS EN EL MAPA ==========
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.warn('⚠️ No se encontró el contenedor del mapa');
        return;
    }
    
    // Usar capture phase para interceptar ANTES que otros eventos
    mapContainer.addEventListener('click', function(e) {
        // Solo en móvil
        if (!isMobile()) return;
        
        const target = e.target;
        const profile = getCurrentProfile();
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        const currentProfileName = localStorage.getItem('currentProfile') || 'Default';
        const now = Date.now();
        let cooldownActivated = false;
        
        // ========== POKESTOP ==========
        if (target.classList.contains('pokestop-icon')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Buscar el pokestop en el array pokestopIcons
            const pokestopData = pokestopIcons.find(item => item.icon === target);
            if (pokestopData && pokestopData.pokestop) {
                profile.pokestops[pokestopData.pokestop.name] = now;
                profiles[currentProfileName] = profile;
                localStorage.setItem('profiles', JSON.stringify(profiles));
                
                showCooldownNotification('PokéStop', pokestopData.pokestop.name);
                console.log('✅ Cooldown activado para PokéStop:', pokestopData.pokestop.name);
                
                // Actualizar visualmente
                if (typeof displayPokestops === 'function') {
                    setTimeout(() => displayPokestops(), 100);
                }
                cooldownActivated = true;
            }
        }
        
        // ========== BOSS ==========
        else if (target.classList.contains('boss-icon')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Buscar el boss en el array bossIcons
            const bossData = bossIcons.find(item => item.icon === target);
            if (bossData && bossData.name) {
                profile.bosses[bossData.name] = now;
                profiles[currentProfileName] = profile;
                localStorage.setItem('profiles', JSON.stringify(profiles));
                
                showCooldownNotification('Boss', bossData.name);
                console.log('✅ Cooldown activado para Boss:', bossData.name);
                
                // Actualizar visualmente
                if (typeof displayBosses === 'function') {
                    setTimeout(() => displayBosses(), 100);
                }
                cooldownActivated = true;
            }
        }
        
        // ========== EXCAVATION ==========
        else if (target.classList.contains('excavition-icon')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Buscar la excavation en el array ex_excavitionIcons
            const excavationData = ex_excavitionIcons.find(item => item.icon === target);
            if (excavationData && excavationData.excavition) {
                profile.excavitions[excavationData.excavition.name] = now;
                profiles[currentProfileName] = profile;
                localStorage.setItem('profiles', JSON.stringify(profiles));
                
                showCooldownNotification('Excavation', excavationData.excavition.name);
                console.log('✅ Cooldown activado para Excavation:', excavationData.excavition.name);
                
                // Actualizar visualmente
                if (typeof ex_displayExcavitions === 'function') {
                    setTimeout(() => ex_displayExcavitions(), 100);
                }
                cooldownActivated = true;
            }
        }
        
        if (cooldownActivated) {
            return false;
        }
        
    }, true); // ← TRUE = capture phase (se ejecuta ANTES que otros eventos)
    
    console.log('✅ Sistema de tap para cooldown inicializado (SOLO MÓVIL - CAPTURE PHASE)');
}

// Inicializar después de que se carguen los datos
setTimeout(function() {
    if (window.innerWidth <= 768) {
        initMobileCooldownTap();
    }
}, 2000);

// Reinicializar cuando cambie el perfil
window.addEventListener('profileChanged', function() {
    if (window.innerWidth <= 768) {
        setTimeout(initMobileCooldownTap, 500);
    }
});


