// ========== SOPORTE TÁCTIL PARA MÓVILES ==========

// Variables globales para touch
let touchStartTime = 0;
let touchTimer = null;
const LONG_PRESS_DURATION = 500; // 500ms para activar cooldown

// Función para detectar si es dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para agregar soporte táctil a los iconos
function addTouchSupport() {
    console.log('🔧 Inicializando soporte táctil móvil...');
    
    // Prevenir zoom con doble tap en el mapa
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // Agregar soporte táctil al mapa cada segundo (para iconos dinámicos)
    setInterval(addTouchToIcons, 1000);
    
    // Primera ejecución inmediata
    addTouchToIcons();
}

// Función para agregar eventos touch a todos los iconos
function addTouchToIcons() {
    // PokéStops
    document.querySelectorAll('.pokestop-icon').forEach(icon => {
        if (!icon.dataset.touchEnabled) {
            addTouchEvents(icon, 'pokestop');
            icon.dataset.touchEnabled = 'true';
        }
    });
    
    // Bosses
    document.querySelectorAll('.boss-icon').forEach(icon => {
        if (!icon.dataset.touchEnabled) {
            addTouchEvents(icon, 'boss');
            icon.dataset.touchEnabled = 'true';
        }
    });
    
    // Excavations
    document.querySelectorAll('.excavition-icon').forEach(icon => {
        if (!icon.dataset.touchEnabled) {
            addTouchEvents(icon, 'excavition');
            icon.dataset.touchEnabled = 'true';
        }
    });
}

// Función para agregar eventos touch a un icono específico
function addTouchEvents(icon, type) {
    // Touch Start - Iniciar temporizador para long press
    icon.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        
        // Feedback visual
        icon.style.transform = 'scale(1.1)';
        icon.style.filter = 'brightness(1.2)';
        
        // Temporizador para long press (cooldown)
        touchTimer = setTimeout(() => {
            // Vibración si está disponible
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Activar cooldown según el tipo
            handleLongPress(icon, type);
            
            // Feedback visual de cooldown activado
            icon.style.transform = 'scale(1.2)';
            icon.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
                icon.style.filter = '';
            }, 200);
        }, LONG_PRESS_DURATION);
        
        e.preventDefault();
    }, { passive: false });
    
    // Touch Move - Cancelar si se mueve mucho
    icon.addEventListener('touchmove', function(e) {
        clearTimeout(touchTimer);
        icon.style.transform = '';
        icon.style.filter = '';
    }, { passive: false });
    
    // Touch End - Click normal o cancelar long press
    icon.addEventListener('touchend', function(e) {
        const touchDuration = Date.now() - touchStartTime;
        clearTimeout(touchTimer);
        
        icon.style.transform = '';
        icon.style.filter = '';
        
        // Si fue un tap corto (< 500ms), es un click normal
        if (touchDuration < LONG_PRESS_DURATION) {
            handleNormalClick(icon, type);
        }
        
        e.preventDefault();
    }, { passive: false });
    
    // Touch Cancel - Cancelar todo
    icon.addEventListener('touchcancel', function(e) {
        clearTimeout(touchTimer);
        icon.style.transform = '';
        icon.style.filter = '';
    }, { passive: false });
}

// Función para manejar long press (activar cooldown)
function handleLongPress(icon, type) {
    console.log(`🔥 Long press detectado en ${type}:`, icon.dataset.name);
    
    switch(type) {
        case 'pokestop':
            if (typeof handlePokestopCooldown === 'function') {
                const pokestopName = icon.dataset.name;
                handlePokestopCooldown(pokestopName);
                showMobileNotification(`✅ Cooldown activado: ${pokestopName}`);
            }
            break;
            
        case 'boss':
            if (typeof handleBossCooldown === 'function') {
                const bossName = icon.dataset.name;
                handleBossCooldown(bossName);
                showMobileNotification(`✅ Cooldown activado: ${bossName}`);
            }
            break;
            
        case 'excavition':
            if (typeof handleExcavitionCooldown === 'function') {
                const excavitionName = icon.dataset.name;
                handleExcavitionCooldown(excavitionName);
                showMobileNotification(`✅ Cooldown activado: ${excavitionName}`);
            }
            break;
    }
}

// Función para manejar click normal (abrir detalles)
function handleNormalClick(icon, type) {
    console.log(`👆 Click normal en ${type}:`, icon.dataset.name);
    
    // Simular click del mouse para abrir detalles
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    icon.dispatchEvent(clickEvent);
}

// Función para mostrar notificación móvil
function showMobileNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'mobile-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
    
    /* Desactivar selección de texto en iconos */
    .pokestop-icon,
    .boss-icon,
    .excavition-icon {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTouchSupport);
} else {
    addTouchSupport();
}

// Exportar funciones para uso externo
window.mobileTouch = {
    addTouchSupport,
    addTouchToIcons,
    isMobileDevice
};

console.log('📱 Módulo de soporte táctil móvil cargado');

// Mostrar instrucciones solo en móvil
if (isMobileDevice()) {
    const instructions = document.querySelector('.mobile-instructions');
    if (instructions) {
        instructions.style.display = 'block';
    }
}
