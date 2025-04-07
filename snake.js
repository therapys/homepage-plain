// Snake game variables
let snakeCanvas, snakeCtx;
let snakeBody = [];
let snakeFood = {};
let snakeDirection = 'right';
let snakeScore = 0;
let snakeHighScore = 0;
let snakeGameLoop;
let snakeGameSpeed = 100;
let snakeGridSize = 20;
let snakeGameStarted = false;

// Initialize game
function initGame() {
    snakeCanvas = document.getElementById('snakeCanvas');
    if (!snakeCanvas) {
        console.error('Snake canvas not found');
        return;
    }
    
    snakeCtx = snakeCanvas.getContext('2d');
    if (!snakeCtx) {
        console.error('Could not get 2D context');
        return;
    }
    
    // Set canvas dimensions based on container size
    const container = snakeCanvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas size to match container, accounting for padding
    snakeCanvas.width = containerWidth - 20;
    snakeCanvas.height = containerHeight - 20;
    
    console.log(`Canvas dimensions set to: ${snakeCanvas.width}x${snakeCanvas.height}`);
    
    // Add event listeners
    const startButton = document.getElementById('startGame');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error('Start button not found');
    }
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Load high score
    loadHighScore();
    
    // Initialize game state
    resetGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const container = snakeCanvas.parentElement;
        snakeCanvas.width = container.clientWidth - 20;
        snakeCanvas.height = container.height - 20;
        drawGame();
    });
}

// Load high score from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        snakeHighScore = parseInt(savedHighScore);
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = snakeHighScore;
        }
    }
}

// Save high score to local storage
function saveHighScore() {
    if (snakeScore > snakeHighScore) {
        snakeHighScore = snakeScore;
        localStorage.setItem('snakeHighScore', snakeHighScore);
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = snakeHighScore;
        }
    }
}

// Reset game
function resetGame() {
    if (!snakeCanvas || !snakeCtx) return;
    
    // Reset snake
    snakeBody = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];
    
    // Reset game state
    snakeDirection = 'right';
    snakeScore = 0;
    snakeGameSpeed = 100;
    snakeGameStarted = false;
    
    // Update score display
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = snakeScore;
    }
    
    // Generate new food
    generateFood();
    
    // Show start screen
    const gameStartScreen = document.getElementById('gameStartScreen');
    if (gameStartScreen) {
        gameStartScreen.classList.remove('hidden');
    }
    
    // Hide canvas
    if (snakeCanvas) {
        snakeCanvas.style.display = 'none';
    }
    
    // Hide controls
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.classList.remove('visible');
    }
}

// Start game
function startGame() {
    if (snakeGameStarted) return;
    
    snakeGameStarted = true;
    
    // Hide start screen
    const gameStartScreen = document.getElementById('gameStartScreen');
    if (gameStartScreen) {
        gameStartScreen.classList.add('hidden');
    }
    
    // Show canvas
    if (snakeCanvas) {
        snakeCanvas.style.display = 'block';
    }
    
    // Show controls
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.classList.add('visible');
    }
    
    // Start game loop
    snakeGameLoop = setInterval(updateGame, snakeGameSpeed);
}

// Generate food at random position
function generateFood() {
    if (!snakeCanvas) return;
    
    // Calculate grid dimensions
    const gridWidth = Math.floor(snakeCanvas.width / snakeGridSize);
    const gridHeight = Math.floor(snakeCanvas.height / snakeGridSize);
    
    snakeFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snakeBody) {
        if (segment.x === snakeFood.x && segment.y === snakeFood.y) {
            generateFood();
            break;
        }
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!snakeGameStarted) return;
    
    const key = e.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        if (key === 'ArrowUp' && snakeDirection !== 'down') snakeDirection = 'up';
        else if (key === 'ArrowDown' && snakeDirection !== 'up') snakeDirection = 'down';
        else if (key === 'ArrowLeft' && snakeDirection !== 'right') snakeDirection = 'left';
        else if (key === 'ArrowRight' && snakeDirection !== 'left') snakeDirection = 'right';
    }
}

// Update game state
function updateGame() {
    if (!snakeGameStarted) return;
    
    // Move snake
    const head = {x: snakeBody[0].x, y: snakeBody[0].y};
    
    switch(snakeDirection) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Calculate grid dimensions
    const gridWidth = Math.floor(snakeCanvas.width / snakeGridSize);
    const gridHeight = Math.floor(snakeCanvas.height / snakeGridSize);
    
    console.log(`Head position: (${head.x}, ${head.y}), Grid dimensions: ${gridWidth}x${gridHeight}`);
    
    // Check for collisions with walls
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        console.log("Wall collision detected!");
        gameOver();
        return;
    }
    
    // Check for collisions with self (skip the head)
    for (let i = 1; i < snakeBody.length; i++) {
        if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
            console.log("Self collision detected!");
            gameOver();
            return;
        }
    }
    
    // Add new head
    snakeBody.unshift(head);
    
    // Check for food
    if (head.x === snakeFood.x && head.y === snakeFood.y) {
        snakeScore += 10;
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = snakeScore;
        }
        generateFood();
        
        // Increase speed
        if (snakeScore % 50 === 0) {
            snakeGameSpeed = Math.max(50, snakeGameSpeed - 10);
            clearInterval(snakeGameLoop);
            snakeGameLoop = setInterval(updateGame, snakeGameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snakeBody.pop();
    }
    
    // Draw game
    drawGame();
}

// Draw the game
function drawGame() {
    if (!snakeCanvas || !snakeCtx) return;
    
    // Clear canvas
    snakeCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw grid
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    snakeCtx.strokeStyle = `${gridColor}10`;
    for (let i = 0; i < snakeCanvas.width / snakeGridSize; i++) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(i * snakeGridSize, 0);
        snakeCtx.lineTo(i * snakeGridSize, snakeCanvas.height);
        snakeCtx.stroke();
        
        snakeCtx.beginPath();
        snakeCtx.moveTo(0, i * snakeGridSize);
        snakeCtx.lineTo(snakeCanvas.width, i * snakeGridSize);
        snakeCtx.stroke();
    }
    
    // Draw snake with gradient effect
    const snakeColor = getComputedStyle(document.documentElement).getPropertyValue('--heading-color');
    snakeBody.forEach((segment, index) => {
        const alpha = 1 - (index / (snakeBody.length * 2));
        snakeCtx.fillStyle = `${snakeColor}${Math.floor(Math.max(0.4, alpha) * 255).toString(16).padStart(2, '0')}`;
        snakeCtx.shadowColor = snakeColor;
        snakeCtx.shadowBlur = 5;
        snakeCtx.fillRect(
            segment.x * snakeGridSize + 1,
            segment.y * snakeGridSize + 1,
            snakeGridSize - 2,
            snakeGridSize - 2
        );
    });
    snakeCtx.shadowBlur = 0;
    
    // Draw food with glow effect
    const foodColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    snakeCtx.fillStyle = foodColor;
    snakeCtx.shadowColor = foodColor;
    snakeCtx.shadowBlur = 8;
    snakeCtx.beginPath();
    snakeCtx.arc(
        snakeFood.x * snakeGridSize + snakeGridSize/2,
        snakeFood.y * snakeGridSize + snakeGridSize/2,
        snakeGridSize/2 - 2,
        0,
        Math.PI * 2
    );
    snakeCtx.fill();
    snakeCtx.shadowBlur = 0;
}

// Game over
function gameOver() {
    console.log("Game Over called");
    
    // Stop the game loop immediately
    if (snakeGameLoop) {
        clearInterval(snakeGameLoop);
        snakeGameLoop = null;
    }
    
    // Set game state to not started
    snakeGameStarted = false;
    
    // Update high score
    saveHighScore();
    
    // Show game over screen
    const gameStartScreen = document.getElementById('gameStartScreen');
    if (gameStartScreen) {
        // Clear existing content
        gameStartScreen.innerHTML = '';
        
        // Create and append new content
        const startScreenContent = document.createElement('div');
        startScreenContent.className = 'start-screen-content';
        startScreenContent.innerHTML = `
            <div class="high-score">High Score: <span id="highScore">${snakeHighScore}</span></div>
            <div class="game-over-score">Game Over! Score: ${snakeScore}</div>
            <button class="retro-btn" id="startGame">Play Again</button>
        `;
        gameStartScreen.appendChild(startScreenContent);
        
        // Show the start screen
        gameStartScreen.classList.remove('hidden');
        
        // Re-attach event listener to the new start button
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.addEventListener('click', () => {
                resetGame();
                startGame();
            });
        }
    }
    
    // Hide canvas
    if (snakeCanvas) {
        snakeCanvas.style.display = 'none';
    }
    
    // Hide controls
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.classList.remove('visible');
    }
    
    // Reset game state
    snakeDirection = 'right';
    snakeScore = 0;
    snakeGameSpeed = 100;
    
    // Update score display
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = '0';
    }
    
    console.log("Game Over completed");
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame); 