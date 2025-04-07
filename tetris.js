// Tetris game implementation
let tetrisCanvas, tetrisCtx;
let tetrisBoard = [];
let tetrisCurrentPiece;
let tetrisScore = 0;
let tetrisGameLoop;
let tetrisIsPaused = true;
let tetrisHighScore = localStorage.getItem('tetrisHighScore') || 0;

const TETRIS_BOARD_WIDTH = 10;
const TETRIS_BOARD_HEIGHT = 20;
let tetrisBlockSize;
const TETRIS_GAME_SPEED = 500;

// Tetromino shapes
const TETRIS_SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

// Initialize Tetris game
function initTetris() {
    tetrisCanvas = document.getElementById('tetrisCanvas');
    tetrisCtx = tetrisCanvas.getContext('2d');

    // Set canvas size
    const container = tetrisCanvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Get device pixel ratio for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Calculate block size based on container dimensions
    // Use the smaller dimension to ensure the board fits
    const maxWidth = containerWidth - 20; // 20px padding
    const maxHeight = containerHeight - 20;
    
    // Calculate block size to fit the board
    tetrisBlockSize = Math.min(
        Math.floor(maxWidth / TETRIS_BOARD_WIDTH),
        Math.floor(maxHeight / TETRIS_BOARD_HEIGHT)
    );
    
    // Set canvas dimensions to be exactly the size of the board
    // Multiply by pixel ratio for high-DPI displays
    tetrisCanvas.width = tetrisBlockSize * TETRIS_BOARD_WIDTH * pixelRatio;
    tetrisCanvas.height = tetrisBlockSize * TETRIS_BOARD_HEIGHT * pixelRatio;
    
    // Scale the canvas CSS size to match the logical size
    tetrisCanvas.style.width = `${tetrisBlockSize * TETRIS_BOARD_WIDTH}px`;
    tetrisCanvas.style.height = `${tetrisBlockSize * TETRIS_BOARD_HEIGHT}px`;
    
    // Scale the context to match the pixel ratio
    tetrisCtx.scale(pixelRatio, pixelRatio);

    // Initialize board
    for (let i = 0; i < TETRIS_BOARD_HEIGHT; i++) {
        tetrisBoard[i] = new Array(TETRIS_BOARD_WIDTH).fill(0);
    }

    // Event listeners
    document.getElementById('startTetris').addEventListener('click', startTetris);
    document.addEventListener('keydown', handleTetrisKeyPress);

    // Update high score display
    document.getElementById('tetrisHighScore').textContent = tetrisHighScore;

    // Handle resize
    window.addEventListener('resize', () => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Recalculate block size
        const maxWidth = containerWidth - 20;
        const maxHeight = containerHeight - 20;
        
        tetrisBlockSize = Math.min(
            Math.floor(maxWidth / TETRIS_BOARD_WIDTH),
            Math.floor(maxHeight / TETRIS_BOARD_HEIGHT)
        );
        
        // Update canvas dimensions
        tetrisCanvas.width = tetrisBlockSize * TETRIS_BOARD_WIDTH * pixelRatio;
        tetrisCanvas.height = tetrisBlockSize * TETRIS_BOARD_HEIGHT * pixelRatio;
        
        // Update CSS size
        tetrisCanvas.style.width = `${tetrisBlockSize * TETRIS_BOARD_WIDTH}px`;
        tetrisCanvas.style.height = `${tetrisBlockSize * TETRIS_BOARD_HEIGHT}px`;
        
        // Reset and apply scaling
        tetrisCtx.setTransform(1, 0, 0, 1, 0, 0);
        tetrisCtx.scale(pixelRatio, pixelRatio);
        
        drawTetrisBoard();
    });

    // Initial render
    drawTetrisBoard();
}

function startTetris() {
    if (!tetrisIsPaused) return;
    
    // Reset game state
    tetrisBoard = Array(TETRIS_BOARD_HEIGHT).fill().map(() => Array(TETRIS_BOARD_WIDTH).fill(0));
    tetrisScore = 0;
    document.getElementById('tetrisScore').textContent = tetrisScore;
    
    // Hide start screen
    document.getElementById('tetrisStartScreen').classList.add('hidden');
    
    // Start game
    tetrisIsPaused = false;
    spawnTetrisPiece();
    tetrisGameLoop = setInterval(tetrisGameStep, TETRIS_GAME_SPEED);
}

function spawnTetrisPiece() {
    const shapes = Object.keys(TETRIS_SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    tetrisCurrentPiece = {
        shape: TETRIS_SHAPES[randomShape],
        x: Math.floor(TETRIS_BOARD_WIDTH / 2) - Math.floor(TETRIS_SHAPES[randomShape][0].length / 2),
        y: 0
    };
    
    if (checkTetrisCollision(tetrisCurrentPiece.shape, tetrisCurrentPiece.x, tetrisCurrentPiece.y)) {
        TetrisgameOver();
    }
}

function tetrisGameStep() {
    if (tetrisIsPaused) return;
    
    if (!moveTetrisDown()) {
        placeTetrisPiece();
        clearTetrisLines();
        spawnTetrisPiece();
    }
    drawTetrisBoard();
}

function moveTetrisDown() {
    if (!checkTetrisCollision(tetrisCurrentPiece.shape, tetrisCurrentPiece.x, tetrisCurrentPiece.y + 1)) {
        tetrisCurrentPiece.y++;
        return true;
    }
    return false;
}

function moveTetrisLeft() {
    if (!checkTetrisCollision(tetrisCurrentPiece.shape, tetrisCurrentPiece.x - 1, tetrisCurrentPiece.y)) {
        tetrisCurrentPiece.x--;
        drawTetrisBoard();
    }
}

function moveTetrisRight() {
    if (!checkTetrisCollision(tetrisCurrentPiece.shape, tetrisCurrentPiece.x + 1, tetrisCurrentPiece.y)) {
        tetrisCurrentPiece.x++;
        drawTetrisBoard();
    }
}

function rotateTetrisPiece() {
    const rotated = tetrisCurrentPiece.shape[0].map((_, i) =>
        tetrisCurrentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (!checkTetrisCollision(rotated, tetrisCurrentPiece.x, tetrisCurrentPiece.y)) {
        tetrisCurrentPiece.shape = rotated;
        drawTetrisBoard();
    }
}

function checkTetrisCollision(shape, x, y) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                const newX = x + j;
                const newY = y + i;
                
                if (newX < 0 || newX >= TETRIS_BOARD_WIDTH || newY >= TETRIS_BOARD_HEIGHT) {
                    return true;
                }
                
                if (newY >= 0 && tetrisBoard[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placeTetrisPiece() {
    for (let i = 0; i < tetrisCurrentPiece.shape.length; i++) {
        for (let j = 0; j < tetrisCurrentPiece.shape[i].length; j++) {
            if (tetrisCurrentPiece.shape[i][j]) {
                const x = tetrisCurrentPiece.x + j;
                const y = tetrisCurrentPiece.y + i;
                if (y >= 0) {
                    tetrisBoard[y][x] = 1;
                }
            }
        }
    }
}

function clearTetrisLines() {
    for (let i = TETRIS_BOARD_HEIGHT - 1; i >= 0; i--) {
        if (tetrisBoard[i].every(cell => cell)) {
            tetrisBoard.splice(i, 1);
            tetrisBoard.unshift(new Array(TETRIS_BOARD_WIDTH).fill(0));
            tetrisScore += 100;
            document.getElementById('tetrisScore').textContent = tetrisScore;
        }
    }
}

function drawTetrisBoard() {
    if (!tetrisCanvas || !tetrisCtx) return;
    
    // Clear canvas
    tetrisCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width / window.devicePixelRatio, tetrisCanvas.height / window.devicePixelRatio);
    
    // Draw grid
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    tetrisCtx.strokeStyle = `${gridColor}20`;
    tetrisCtx.lineWidth = 1;
    
    // Draw vertical lines
    for (let i = 0; i <= TETRIS_BOARD_WIDTH; i++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(i * tetrisBlockSize, 0);
        tetrisCtx.lineTo(i * tetrisBlockSize, tetrisCanvas.height / window.devicePixelRatio);
        tetrisCtx.stroke();
    }
    
    // Draw horizontal lines
    for (let i = 0; i <= TETRIS_BOARD_HEIGHT; i++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(0, i * tetrisBlockSize);
        tetrisCtx.lineTo(tetrisCanvas.width / window.devicePixelRatio, i * tetrisBlockSize);
        tetrisCtx.stroke();
    }
    
    // Draw placed pieces
    for (let y = 0; y < TETRIS_BOARD_HEIGHT; y++) {
        for (let x = 0; x < TETRIS_BOARD_WIDTH; x++) {
            if (tetrisBoard[y][x]) {
                drawTetrisBlock(x, y);
            }
        }
    }
    
    // Draw current piece
    if (tetrisCurrentPiece) {
        for (let y = 0; y < tetrisCurrentPiece.shape.length; y++) {
            for (let x = 0; x < tetrisCurrentPiece.shape[y].length; x++) {
                if (tetrisCurrentPiece.shape[y][x]) {
                    drawTetrisBlock(
                        tetrisCurrentPiece.x + x,
                        tetrisCurrentPiece.y + y
                    );
                }
            }
        }
    }
    
    // Draw score on the right side of the board
    drawTetrisScore();
}

function drawTetrisBlock(x, y) {
    const blockColor = getComputedStyle(document.documentElement).getPropertyValue('--heading-color');
    const padding = 2; // Padding between blocks
    
    // Draw block with glow effect
    tetrisCtx.fillStyle = blockColor;
    tetrisCtx.shadowColor = blockColor;
    tetrisCtx.shadowBlur = 10;
    
    tetrisCtx.fillRect(
        x * tetrisBlockSize + padding,
        y * tetrisBlockSize + padding,
        tetrisBlockSize - (padding * 2),
        tetrisBlockSize - (padding * 2)
    );
    
    // Reset shadow
    tetrisCtx.shadowBlur = 0;
}

function drawTetrisScore() {
    // Get the container dimensions
    const container = tetrisCanvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // Calculate the position for the score display
    const scoreX = tetrisCanvas.width / window.devicePixelRatio + 20; // 20px padding from the board
    const scoreY = 50; // Start from the top with some padding
    
    // Set text style
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    tetrisCtx.fillStyle = textColor;
    tetrisCtx.font = `${tetrisBlockSize / 2}px monospace`;
    tetrisCtx.textAlign = 'left';
    
    // Draw score
    tetrisCtx.fillText(`Score: ${tetrisScore}`, scoreX, scoreY);
    
    // Draw high score
    tetrisCtx.fillText(`High Score: ${tetrisHighScore}`, scoreX, scoreY + tetrisBlockSize);
    
    // Draw next piece preview if game is active
    if (!tetrisIsPaused && tetrisCurrentPiece) {
        tetrisCtx.fillText('Next:', scoreX, scoreY + tetrisBlockSize * 3);
        
        // Draw a small preview of the next piece
        const previewSize = tetrisBlockSize / 2;
        const previewX = scoreX;
        const previewY = scoreY + tetrisBlockSize * 4;
        
        // Draw a border for the preview
        tetrisCtx.strokeStyle = textColor;
        tetrisCtx.strokeRect(previewX, previewY, previewSize * 4, previewSize * 4);
        
        // Draw the current piece in the preview area
        const blockColor = getComputedStyle(document.documentElement).getPropertyValue('--heading-color');
        tetrisCtx.fillStyle = blockColor;
        
        for (let y = 0; y < tetrisCurrentPiece.shape.length; y++) {
            for (let x = 0; x < tetrisCurrentPiece.shape[y].length; x++) {
                if (tetrisCurrentPiece.shape[y][x]) {
                    tetrisCtx.fillRect(
                        previewX + x * previewSize,
                        previewY + y * previewSize,
                        previewSize - 1,
                        previewSize - 1
                    );
                }
            }
        }
    } else {
        // Always show the score, even when game is paused
        tetrisCtx.fillText('Press START to play', scoreX, scoreY + tetrisBlockSize * 3);
    }
}

function TetrisgameOver() {
    tetrisIsPaused = true;
    clearInterval(tetrisGameLoop);
    
    if (tetrisScore > tetrisHighScore) {
        tetrisHighScore = tetrisScore;
        localStorage.setItem('tetrisHighScore', tetrisHighScore);
        document.getElementById('tetrisHighScore').textContent = tetrisHighScore;
    }
    
    document.getElementById('tetrisStartScreen').classList.remove('hidden');
}

function handleTetrisKeyPress(event) {
    if (tetrisIsPaused) return;
    
    // Prevent default scrolling for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
    }
    
    switch(event.key) {
        case 'ArrowLeft':
            moveTetrisLeft();
            break;
        case 'ArrowRight':
            moveTetrisRight();
            break;
        case 'ArrowDown':
            moveTetrisDown();
            break;
        case 'ArrowUp':
            rotateTetrisPiece();
            break;
    }
}

// Initialize Tetris when the page loads
document.addEventListener('DOMContentLoaded', initTetris); 