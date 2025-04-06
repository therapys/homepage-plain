// Snake game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = 0;
let gameLoop;
let gameSpeed = 100;
let gridSize = 20;
let gameStarted = false;

// Initialize the game
function initGame() {
    canvas = document.getElementById('snakeCanvas');
    ctx = canvas.getContext('2d');
    
    // Set up event listeners
    document.getElementById('startGame').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Load high score from local storage
    loadHighScore();
    
    // Initialize snake
    resetGame();
}

// Load high score from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

// Save high score to local storage
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

// Reset game state
function resetGame() {
    snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];
    direction = 'right';
    score = 0;
    document.getElementById('score').textContent = score;
    generateFood();
}

// Start the game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    document.getElementById('gameStartScreen').classList.add('hidden');
    document.querySelector('.game-controls').classList.add('visible');
    canvas.style.display = 'block';
    resetGame();
    gameLoop = setInterval(updateGame, gameSpeed);
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    // Start game on any key press if not started
    if (!gameStarted && e.key.startsWith('Arrow')) {
        startGame();
        return;
    }
    
    if (!gameStarted) return;
    
    const key = e.key;
    if (key === 'ArrowUp' && direction !== 'down') direction = 'up';
    else if (key === 'ArrowDown' && direction !== 'up') direction = 'down';
    else if (key === 'ArrowLeft' && direction !== 'right') direction = 'left';
    else if (key === 'ArrowRight' && direction !== 'left') direction = 'right';
}

// Update game state
function updateGame() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    // Move head based on direction
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check for collisions
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
        // Increase speed slightly as score increases
        if (gameSpeed > 60 && snake.length % 3 === 0) {
            clearInterval(gameLoop);
            gameSpeed -= 5;
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        snake.pop();
    }
    
    drawGame();
}

// Check for collisions
function isCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= canvas.width / gridSize ||
        head.y < 0 || head.y >= canvas.height / gridSize) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#001830';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < canvas.width / gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake with gradient effect
    snake.forEach((segment, index) => {
        const alpha = 1 - (index / (snake.length * 2));
        ctx.fillStyle = `rgba(255, 105, 180, ${Math.max(0.4, alpha)})`;
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 5;
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    ctx.shadowBlur = 0;
    
    // Draw food with glow effect
    ctx.fillStyle = '#e0ffff';
    ctx.shadowColor = '#e0ffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    
    // Update high score
    saveHighScore();
    
    // Fade effect
    let alpha = 0;
    const fadeInterval = setInterval(() => {
        alpha += 0.05;
        if (alpha >= 0.7) {
            clearInterval(fadeInterval);
            document.getElementById('gameStartScreen').classList.remove('hidden');
            document.querySelector('.game-controls').classList.remove('visible');
            canvas.style.display = 'none';
        }
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game over text
        ctx.fillStyle = '#ff69b4';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 10;
        ctx.font = '30px var(--font-main)';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.font = '20px var(--font-main)';
        ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 30);
        
        // Show high score
        ctx.font = '18px var(--font-main)';
        ctx.fillText(`High Score: ${highScore}`, canvas.width/2, canvas.height/2 + 60);
        ctx.shadowBlur = 0;
    }, 50);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame); 