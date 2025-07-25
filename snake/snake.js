const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');

let snake = [];
let food = {};
let direction = '';
let gameLoopId = null;
let score = 0;
let hue = 0;
let lastMoveTime = 0;
let baseInterval = 200;
let moveInterval = baseInterval;
let bgParticles = [];
let scoreAnimations = [];

const gridSize = 20;
const tileCount = canvas.width / gridSize;

class ScoreAnimation {
    constructor(score) {
        this.score = score;
        this.age = 0;
        this.maxAge = 120;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.opacity = 1;
        this.size = 20;
        this.maxSize = 60;
    }

    update() {
        this.age++;
        const progress = this.age / this.maxAge;
        this.opacity = 1 - progress;
        this.size = this.size + (this.maxSize - this.size) * 0.05;
        return this.age < this.maxAge;
    }

    draw(ctx) {
        const text = `Score: ${this.score}`;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = `hsl(${(hue + this.score * 20) % 360}, 100%, 50%)`;
        ctx.font = `bold ${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.x, this.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeText(text, this.x, this.y);
        ctx.restore();
    }
}

function createParticles() {
    bgParticles = [];
    for (let i = 0; i < 50; i++) {
        bgParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            hue: Math.random() * 360
        });
    }
}

function updateParticles() {
    bgParticles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.hue = (particle.hue + 0.5) % 360;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
    });
}

function drawParticles() {
    bgParticles.forEach(particle => {
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, 0.2)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function initGame() {
    snake = [
        { x: 5, y: 5 }
    ];
    direction = 'right';
    score = 0;
    scoreElement.textContent = score;
    moveInterval = baseInterval;
    createParticles();
    spawnFood();
    lastMoveTime = performance.now();
    scoreAnimations = [];
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
            break;
        }
    }
}

function drawSnakeSegment(x, y, isHead, index) {
    const segmentSize = gridSize - 2;
    ctx.fillStyle = `hsl(${(hue + index * 10) % 360}, 100%, 50%)`;
    ctx.fillRect(x * gridSize, y * gridSize, segmentSize, segmentSize);

    if (isHead) {
        const eyeSize = 4;
        ctx.fillStyle = 'white';

        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        switch(direction) {
            case 'right':
                leftEyeX = x * gridSize + segmentSize - eyeSize - 2;
                leftEyeY = y * gridSize + 4;
                rightEyeX = x * gridSize + segmentSize - eyeSize - 2;
                rightEyeY = y * gridSize + segmentSize - eyeSize - 4;
                break;
            case 'left':
                leftEyeX = x * gridSize + 2;
                leftEyeY = y * gridSize + 4;
                rightEyeX = x * gridSize + 2;
                rightEyeY = y * gridSize + segmentSize - eyeSize - 4;
                break;
            case 'up':
                leftEyeX = x * gridSize + 4;
                leftEyeY = y * gridSize + 2;
                rightEyeX = x * gridSize + segmentSize - eyeSize - 4;
                rightEyeY = y * gridSize + 2;
                break;
            case 'down':
                leftEyeX = x * gridSize + 4;
                leftEyeY = y * gridSize + segmentSize - eyeSize - 2;
                rightEyeX = x * gridSize + segmentSize - eyeSize - 4;
                rightEyeY = y * gridSize + segmentSize - eyeSize - 2;
                break;
        }

        ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);

        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.beginPath();
        switch(direction) {
            case 'right':
                ctx.moveTo(x * gridSize + segmentSize, y * gridSize + segmentSize/2);
                ctx.lineTo(x * gridSize + segmentSize + 5, y * gridSize + segmentSize/2);
                break;
            case 'left':
                ctx.moveTo(x * gridSize, y * gridSize + segmentSize/2);
                ctx.lineTo(x * gridSize - 5, y * gridSize + segmentSize/2);
                break;
            case 'up':
                ctx.moveTo(x * gridSize + segmentSize/2, y * gridSize);
                ctx.lineTo(x * gridSize + segmentSize/2, y * gridSize - 5);
                break;
            case 'down':
                ctx.moveTo(x * gridSize + segmentSize/2, y * gridSize + segmentSize);
                ctx.lineTo(x * gridSize + segmentSize/2, y * gridSize + segmentSize + 5);
                break;
        }
        ctx.stroke();
    }
}

function drawGame() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateParticles();
    drawParticles();

    scoreAnimations = scoreAnimations.filter(anim => {
        const keepAnimation = anim.update();
        if (keepAnimation) {
            anim.draw(ctx);
        }
        return keepAnimation;
    });

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2,
        0,
        2 * Math.PI
    );
    ctx.fill();

    snake.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, index === 0, index);
    });

    hue = (hue + 0.5) % 360;
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };

    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        scoreAnimations.push(new ScoreAnimation(score));
        moveInterval = Math.max(baseInterval * Math.pow(0.95, score), 50);
        spawnFood();
    } else {
        snake.pop();
    }
}

function runGame(currentTime) {
    if (currentTime - lastMoveTime >= moveInterval) {
        moveSnake();
        lastMoveTime = currentTime;
    }

    drawGame();
    gameLoopId = requestAnimationFrame(runGame);
}

function gameOver() {
    menu.style.display = 'block';
    startBtn.textContent = 'Play Again';
    cancelAnimationFrame(gameLoopId);
}

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    initGame();
    gameLoopId = requestAnimationFrame(runGame);
});

let lastKeyPressTime = 0;
const keyPressInterval = 100;

document.addEventListener('keydown', (e) => {
    const currentTime = performance.now();
    if (currentTime - lastKeyPressTime < keyPressInterval) {
        return;
    }

    lastKeyPressTime = currentTime;

    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
});