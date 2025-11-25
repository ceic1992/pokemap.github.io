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
    
    function saveProfiles() {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }
    
    // ========== NOTIFICACIÓN VISUAL ==========
    function showCooldownNotification(type, name) {
        // Remover notificación anterior si existe
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
        
        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remover después de 2 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // ========== POKESTOP TAP ==========
    function handlePokestopTap(icon, pokestop) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const profile = getCurrentProfile();
            const now = Date.now();
            profile.pokestops[pokestop.name] = now;
            
            const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
            const currentProfileName = localStorage.getItem('currentProfile') || 'Default';
            profiles[currentProfileName] = profile;
            localStorage.setItem('profiles', JSON.stringify(profiles));
            
            // Actualizar visualmente
            if (typeof displayPokestops === 'function') {
                displayPokestops();
            }
            
            showCooldownNotification('PokéStop', pokestop.name);
            console.log('✅ Cooldown activado para PokéStop:', pokestop.name);
        });
    }
    
    // ========== BOSS TAP ==========
    function handleBossTap(icon, bossName) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const profile = getCurrentProfile();
            const now = Date.now();
            profile.bosses[bossName] = now;
            
            const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
            const currentProfileName = localStorage.getItem('currentProfile') || 'Default';
            profiles[currentProfileName] = profile;
            localStorage.setItem('profiles', JSON.stringify(profiles));
            
            // Actualizar visualmente
            if (typeof displayBosses === 'function') {
                displayBosses();
            }
            
            showCooldownNotification('Boss', bossName);
            console.log('✅ Cooldown activado para Boss:', bossName);
        });
    }
    
    // ========== EXCAVATION TAP ==========
    function handleExcavationTap(icon, excavation) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const profile = getCurrentProfile();
            const now = Date.now();
            profile.excavitions[excavation.name] = now;
            
            const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
            const currentProfileName = localStorage.getItem('currentProfile') || 'Default';
            profiles[currentProfileName] = profile;
            localStorage.setItem('profiles', JSON.stringify(profiles));
            
            // Actualizar visualmente
            if (typeof ex_displayExcavitions === 'function') {
                ex_displayExcavitions();
            }
            
            showCooldownNotification('Excavation', excavation.name);
            console.log('✅ Cooldown activado para Excavation:', excavation.name);
        });
    }
    
    // ========== APLICAR A ICONOS EXISTENTES ==========
    function attachTapToIcons() {
        // PokéStops
        if (typeof pokestopIcons !== 'undefined' && Array.isArray(pokestopIcons)) {
            pokestopIcons.forEach(iconData => {
                if (iconData.icon && iconData.pokestop) {
                    handlePokestopTap(iconData.icon, iconData.pokestop);
                }
            });
            console.log(`📱 Tap para cooldown aplicado a ${pokestopIcons.length} PokéStops`);
        }
        
        // Bosses
        if (typeof bossIcons !== 'undefined' && Array.isArray(bossIcons)) {
            bossIcons.forEach(iconData => {
                if (iconData.icon && iconData.name) {
                    handleBossTap(iconData.icon, iconData.name);
                }
            });
            console.log(`📱 Tap para cooldown aplicado a ${bossIcons.length} Bosses`);
        }
        
        // Excavations
        if (typeof ex_excavitionIcons !== 'undefined' && Array.isArray(ex_excavitionIcons)) {
            ex_excavitionIcons.forEach(iconData => {
                if (iconData.icon && iconData.excavition) {
                    handleExcavationTap(iconData.icon, iconData.excavition);
                }
            });
            console.log(`📱 Tap para cooldown aplicado a ${ex_excavitionIcons.length} Excavations`);
        }
    }
    
    // Ejecutar después de que se carguen los datos
    setTimeout(attachTapToIcons, 2000);
    
    // Re-aplicar cuando cambie el perfil o se actualicen los iconos
    window.addEventListener('profileChanged', function() {
        setTimeout(attachTapToIcons, 500);
    });
    
    // Observer para detectar cuando se crean nuevos iconos
    const mapObserver = new MutationObserver((mutations) => {
        let shouldReattach = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && 
                    (node.classList?.contains('pokestop-icon') || 
                     node.classList?.contains('boss-icon') || 
                     node.classList?.contains('excavition-icon'))) {
                    shouldReattach = true;
                }
            });
        });
        
        if (shouldReattach) {
            setTimeout(attachTapToIcons, 100);
        }
    });
    
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapObserver.observe(mapContainer, {
            childList: true,
            subtree: true
        });
    }
    
    console.log('✅ Sistema de tap para cooldown inicializado (SOLO MÓVIL)');
}

// Inicializar tap después del sidebar
setTimeout(function() {
    if (window.innerWidth <= 768) {
        initMobileCooldownTap();
    }
}, 1000);

// Reinicializar al cambiar tamaño de ventana
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768 && typeof initMobileCooldownTap === 'function') {
        initMobileCooldownTap();
    }
});
