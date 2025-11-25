// ========== SOPORTE TÁCTIL SIMPLE ==========

let longPressTimer = null;
let isLongPress = false;

// Agregar eventos touch a los iconos
function initMobileSupport() {
    console.log('📱 Iniciando soporte móvil...');
    
    // Actualizar cada 2 segundos para iconos nuevos
    setInterval(addTouchToAllIcons, 2000);
    addTouchToAllIcons();
}

function addTouchToAllIcons() {
    // PokéStops
    document.querySelectorAll('.pokestop-icon:not([data-touch])').forEach(icon => {
        icon.dataset.touch = 'true';
        addMobileTouch(icon, 'pokestop');
    });
    
    // Bosses
    document.querySelectorAll('.boss-icon:not([data-touch])').forEach(icon => {
        icon.dataset.touch = 'true';
        addMobileTouch(icon, 'boss');
    });
    
    // Excavations
    document.querySelectorAll('.excavition-icon:not([data-touch])').forEach(icon => {
        icon.dataset.touch = 'true';
        addMobileTouch(icon, 'excavition');
    });
}

function addMobileTouch(element, type) {
    element.addEventListener('touchstart', function(e) {
        isLongPress = false;
        
        // Long press para cooldown (1 segundo)
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            activateCooldown(element, type);
            
            // Vibración
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            
            // Feedback visual
            element.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                element.style.filter = '';
            }, 300);
        }, 1000);
    });
    
    element.addEventListener('touchend', function(e) {
        clearTimeout(longPressTimer);
        
        // Si NO fue long press, es click normal
        if (!isLongPress) {
            // Dejar que el evento click normal funcione
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
    });
    
    element.addEventListener('touchmove', function(e) {
        clearTimeout(longPressTimer);
    });
}

function activateCooldown(element, type) {
    const name = element.dataset.name || element.title;
    
    console.log(`🔥 Activando cooldown: ${type} - ${name}`);
    
    // Buscar el botón de cooldown y hacer click
    const cooldownBtn = element.querySelector('.cooldown-btn');
    if (cooldownBtn) {
        cooldownBtn.click();
        showNotification(`✅ Cooldown: ${name}`);
    } else {
        console.warn('❌ No se encontró botón de cooldown');
    }
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 99999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 1500);
}

// Iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSupport);
} else {
    initMobileSupport();
}
