// Matrix rain animation
let matrixCanvas, matrixCtx;
let matrixChars = [];
let fontSize = 14;
let columns;
let drops = [];
let matrixColor = '#ff69b4'; // Default pink theme color

// Initialize matrix animation
function initMatrix() {
    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrixCanvas';
    matrixCanvas.style.position = 'fixed';
    matrixCanvas.style.top = '0';
    matrixCanvas.style.left = '0';
    matrixCanvas.style.width = '100%';
    matrixCanvas.style.height = '100%';
    matrixCanvas.style.zIndex = '-1';
    document.body.appendChild(matrixCanvas);
    
    matrixCtx = matrixCanvas.getContext('2d');
    if (!matrixCtx) {
        console.error('Could not get matrix canvas context');
        return;
    }
    
    // Set canvas size to window size
    function resizeCanvas() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        columns = Math.floor(matrixCanvas.width / fontSize);
        drops = new Array(columns).fill(1);
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window change
    window.addEventListener('resize', resizeCanvas);
    
    // Generate matrix characters
    for (let i = 0; i < 128; i++) {
        matrixChars.push(String.fromCharCode(i));
    }
    
    // Listen for theme changes
    document.addEventListener('themeChanged', (event) => {
        updateMatrixColor(event.detail.theme);
    });
    
    // Set initial color based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'pink';
    updateMatrixColor(currentTheme);
    
    // Start animation
    drawMatrix();
}

// Update matrix color based on theme
function updateMatrixColor(theme) {
    switch(theme) {
        case 'cyan':
            matrixColor = '#00ffff';
            break;
        case 'green':
            matrixColor = '#00ff7f';
            break;
        case 'pink':
        default:
            matrixColor = '#ff69b4';
    }
}

// Draw matrix rain effect
function drawMatrix() {
    // Semi-transparent black background to create fade effect
    matrixCtx.fillStyle = 'rgba(0, 24, 48, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    // Set text color and font
    matrixCtx.fillStyle = matrixColor;
    matrixCtx.font = fontSize + 'px monospace';
    
    // Draw characters
    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset drop to top with random delay if it reaches bottom
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
    
    // Continue animation
    requestAnimationFrame(drawMatrix);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMatrix); 