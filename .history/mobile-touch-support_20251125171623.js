// ========== TAP SIMPLE PARA ACTIVAR COOLDOWN ==========

function initMobileTouchCooldown() {
    console.log('📱 Iniciando soporte táctil para cooldown...');
    
    // Actualizar cada 2 segundos para iconos nuevos
    setInterval(addTouchCooldown, 2000);
    addTouchCooldown();
}

function addTouchCooldown() {
    // PokéStops
    document.querySelectorAll('.pokestop-icon:not([data-mobile-touch])').forEach(icon => {
        icon.dataset.mobileTouch = 'true';
        addTapCooldown(icon);
    });
    
    // Bosses
    document.querySelectorAll('.boss-icon:not([data-mobile-touch])').forEach(icon => {
        icon.dataset.mobileTouch = 'true';
        addTapCooldown(icon);
    });
    
    // Excavations
    document.querySelectorAll('.excavition-icon:not([data-mobile-touch])').forEach(icon => {
        icon.dataset.mobileTouch = 'true';
        addTapCooldown(icon);
    });
}

function addTapCooldown(icon) {
    let touchStartTime = 0;
    let touchMoved = false;
    
    icon.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        touchMoved = false;
    }, { passive: true });
    
    icon.addEventListener('touchmove', function(e) {
        touchMoved = true;
    }, { passive: true });
    
    icon.addEventListener('touchend', function(e) {
        const touchDuration = Date.now() - touchStartTime;
        
        // Si fue un tap rápido y sin movimiento
        if (!touchMoved && touchDuration < 300) {
            e.preventDefault();
            e.stopPropagation();
            
            // Buscar y hacer click en el botón de cooldown
            const cooldownBtn = icon.querySelector('.cooldown-btn');
            if (cooldownBtn) {
                // Feedback visual
                icon.style.transform = 'scale(1.2)';
                icon.style.filter = 'brightness(1.3)';
                
                // Vibración
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                // Activar cooldown
                setTimeout(() => {
                    cooldownBtn.click();
                    
                    // Restaurar estilo
                    setTimeout(() => {
                        icon.style.transform = '';
                        icon.style.filter = '';
                    }, 200);
                    
                    // Notificación
                    const name = icon.dataset.name || icon.title;
                    showMobileNotification(`✅ ${name}`);
                }, 100);
            }
        }
    }, { passive: false });
}

function showMobileNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        z-index: 99999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideInDown 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 1500);
}

// Agregar animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileTouchCooldown);
} else {
    initMobileTouchCooldown();
}

console.log('📱 Soporte táctil de cooldown cargado');
