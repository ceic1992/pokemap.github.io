let bossIconsVisible = true;

function toggleBossIcons() {
    console.log("=== TOGGLE BOSS ICONS ===");
    
    bossIconsVisible = !bossIconsVisible;
    
    const allBossIcons = document.querySelectorAll('.boss-icon');
    console.log("Boss icons found:", allBossIcons.length, "- New state:", bossIconsVisible ? "VISIBLE" : "HIDDEN");
    
    allBossIcons.forEach(icon => {
        icon.style.display = bossIconsVisible ? 'block' : 'none';
    });
    
    if (!bossIconsVisible) {
        const bossTooltip = document.querySelector('.boss-tooltip');
        if (bossTooltip) bossTooltip.style.display = 'none';
        
        const hoverTooltip = document.getElementById('boss-hover-tooltip');
        if (hoverTooltip) {
            hoverTooltip.style.display = 'none';
            if (hoverTooltip.updateInterval) {
                clearInterval(hoverTooltip.updateInterval);
            }
        }
    }
    
    // Actualizar AMBOS botones - SOLO clases, SIN tocar opacity
    const toggleButtons = [
        document.getElementById('boss-toggle-btn'),
        document.getElementById('route-boss-toggle-btn')
    ];
    
    toggleButtons.forEach(btn => {
        if (btn) {
            if (bossIconsVisible) {
                btn.classList.add('active');
                btn.classList.remove('inactive');
            } else {
                btn.classList.remove('active');
                btn.classList.add('inactive');
            }
        }
    });
    
    localStorage.setItem('bossIconsVisible', bossIconsVisible);
    console.log("✓ Toggle completed");
}

function restoreBossIconsVisibility() {
    const savedState = localStorage.getItem('bossIconsVisible');
    if (savedState !== null) {
        bossIconsVisible = savedState === 'true';
        
        setTimeout(() => {
            const allBossIcons = document.querySelectorAll('.boss-icon');
            if (allBossIcons.length > 0 && !bossIconsVisible) {
                allBossIcons.forEach(icon => icon.style.display = 'none');
            }
            
            const toggleButtons = [
                document.getElementById('boss-toggle-btn'),
                document.getElementById('route-boss-toggle-btn')
            ];
            
            toggleButtons.forEach(btn => {
                if (btn) {
                    if (bossIconsVisible) {
                        btn.classList.add('active');
                        btn.classList.remove('inactive');
                    } else {
                        btn.classList.remove('active');
                        btn.classList.add('inactive');
                    }
                }
            });
        }, 100);
    }
}

function initBossToggleButton() {
    const buttons = [
        { element: document.getElementById('boss-toggle-btn'), name: 'main' },
        { element: document.getElementById('route-boss-toggle-btn'), name: 'route' }
    ];
    
    buttons.forEach(({ element, name }) => {
        if (element) {
            const newButton = element.cloneNode(true);
            element.parentNode.replaceChild(newButton, element);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleBossIcons();
            });
            
            // Establecer estado inicial
            if (bossIconsVisible) {
                newButton.classList.add('active');
                newButton.classList.remove('inactive');
            } else {
                newButton.classList.remove('active');
                newButton.classList.add('inactive');
            }
            
            console.log(`✓ ${name} boss toggle initialized`);
        }
    });
}

window.toggleBossIcons = toggleBossIcons;
window.restoreBossIconsVisibility = restoreBossIconsVisibility;
window.initBossToggleButton = initBossToggleButton;
window.bossIconsVisible = bossIconsVisible;
