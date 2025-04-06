class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 30;
        this.tileCount = 20;
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = { x: 15, y: 15 };
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.score = 0;
        this.gameLoop = null;
        this.gameSpeed = 150; // Slowed down a bit for better playability
        this.isGameOver = false;

        // Bind event listeners
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Add loading state
        this.isLoading = true;
        this.loadAssets().then(() => {
            this.isLoading = false;
            this.draw();
        });
    }

    async loadAssets() {
        // Simulate asset loading (you can add actual assets later)
        await new Promise(resolve => setTimeout(resolve, 300));
        this.draw();
    }

    startGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        // Reset game state
        this.snake = [
            { x: 5, y: 10 }, // Start more to the left to give player time
            { x: 4, y: 10 }  // Add initial tail segment
        ];
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.score = 0;
        this.isGameOver = false;
        this.updateScore();
        this.placeFood();
        this.gameLoop = setInterval(() => this.gameUpdate(), this.gameSpeed);
    }

    gameUpdate() {
        if (this.isGameOver) return;

        // Move snake
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision - start checking from index 1 to avoid false collision with neck
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.placeFood();
            // Speed up the game slightly with each food eaten
            if (this.gameSpeed > 70) {
                clearInterval(this.gameLoop);
                this.gameSpeed -= 2;
                this.gameLoop = setInterval(() => this.gameUpdate(), this.gameSpeed);
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        if (this.isLoading) {
            // Show loading state
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff69b4';
            this.ctx.font = '20px VT323';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.canvas.width/2, this.canvas.height/2);
            return;
        }

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw snake with gradient effect
        this.snake.forEach((segment, index) => {
            const alpha = 1 - (index / (this.snake.length * 2)); // Gradient effect
            this.ctx.fillStyle = `rgba(255, 105, 180, ${Math.max(0.4, alpha)})`;
            this.ctx.shadowColor = '#ff69b4';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            this.ctx.shadowBlur = 0; // Reset shadow for next elements
        });

        // Draw food with glow effect
        this.ctx.fillStyle = '#8cc2dd';
        this.ctx.shadowColor = '#8cc2dd';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(
            this.food.x * this.gridSize + 1,
            this.food.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
        this.ctx.shadowBlur = 0;
    }

    handleKeyPress(e) {
        // Prevent page scrolling when using arrow keys
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        // Prevent reverse direction
        switch(e.key) {
            case 'ArrowUp':
                if (this.dy !== 1 && !this.isGameOver) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
                if (this.dy !== -1 && !this.isGameOver) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.dx !== 1 && !this.isGameOver) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (this.dx !== -1 && !this.isGameOver) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }

    placeFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.tileCount - 2)) + 1,
                y: Math.floor(Math.random() * (this.tileCount - 2)) + 1
            };
        } while (this.snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y));
        this.food = newFood;
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        
        // Fade effect
        let alpha = 0;
        const fadeInterval = setInterval(() => {
            alpha += 0.05;
            if (alpha >= 0.7) {
                clearInterval(fadeInterval);
            }
            
            this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw game over text with glow effect
            this.ctx.fillStyle = '#ff69b4';
            this.ctx.shadowColor = '#ff69b4';
            this.ctx.shadowBlur = 10;
            this.ctx.font = '30px VT323';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '20px VT323';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 30);
            this.ctx.fillText('Press Start to play again', this.canvas.width/2, this.canvas.height/2 + 60);
            this.ctx.shadowBlur = 0;
        }, 50);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    handleError(error) {
        console.error('Game error:', error);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.font = '20px VT323';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Oops! Something went wrong.', this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText('Please refresh the page.', this.canvas.width/2, this.canvas.height/2 + 30);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    game.draw();
}); 