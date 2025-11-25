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
