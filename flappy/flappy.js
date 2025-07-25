const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Base game dimensions (aspect ratio control)
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;

// Set initial canvas size
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = Math.min(
        containerWidth / GAME_WIDTH,
        containerHeight / GAME_HEIGHT
    );

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    canvas.style.width = `${GAME_WIDTH * scale}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let birdY = canvas.height / 2;
let birdVelocity = 0;
let gravity = 0.3;
let birdLift = -6;
let birdWidth = 34;
let birdHeight = 24;
let birdX = 60;

let pipeWidth = 52;
let pipeGap = 120;
let pipes = [];
let pipeVelocity = -2;
let score = 0;
let isGameOver = false;

// Border settings
const borderWidth = 40; // Width of the black borders

// Pixel bird definition (17x12 pixels)
const pixelSize = 2;
const birdPixels = [
    [0,0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,2,2,2,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,1,0,0,0],
    [0,1,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,3,1,0,0],
    [1,2,2,2,2,2,2,2,3,3,1,0,0],
    [1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,1,2,2,4,4,2,2,1,0,0,0,0],
    [0,0,1,1,4,4,1,1,0,0,0,0,0]
];

// Color palette
const colors = {
    0: 'transparent',
    1: '#000000',    // Black outline
    2: '#FED833',    // Yellow body
    3: '#FFFFFF',    // White eye
    4: '#FF6B6B'     // Red beak
};

// Draw pixel art bird
function drawPixelBird(x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const offsetX = -(birdPixels[0].length * pixelSize) / 2;
    const offsetY = -(birdPixels.length * pixelSize) / 2;

    for(let row = 0; row < birdPixels.length; row++) {
        for(let col = 0; col < birdPixels[row].length; col++) {
            const colorIndex = birdPixels[row][col];
            if(colorIndex !== 0) {
                ctx.fillStyle = colors[colorIndex];
                ctx.fillRect(
                    offsetX + col * pixelSize,
                    offsetY + row * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }

    ctx.restore();
}

// Draw borders
function drawBorders() {
    ctx.fillStyle = '#000000';
    // Left border
    ctx.fillRect(0, 0, borderWidth, canvas.height);
    // Right border
    ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height);
}

// Draw clouds
function drawClouds() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(borderWidth, canvas.height - 20, canvas.width - borderWidth * 2, 20);
}

// Draw a single pipe
function drawPipe(x, topHeight, bottomY) {
    ctx.fillStyle = '#74BF2E';
    ctx.fillRect(x, 0, pipeWidth, topHeight);
    ctx.fillRect(x, bottomY, pipeWidth, canvas.height - bottomY);

    ctx.strokeStyle = '#557F22';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);
    ctx.strokeRect(x, bottomY, pipeWidth, canvas.height - bottomY);

    const capHeight = 28;
    ctx.fillRect(x - 2, topHeight - capHeight, pipeWidth + 4, capHeight);
    ctx.fillRect(x - 2, bottomY, pipeWidth + 4, capHeight);
    ctx.strokeRect(x - 2, topHeight - capHeight, pipeWidth + 4, capHeight);
    ctx.strokeRect(x - 2, bottomY, pipeWidth + 4, capHeight);
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    pipes.push({
        top: pipeHeight,
        bottom: pipeHeight + pipeGap,
        x: canvas.width,
        scored: false
    });
}

function updateBird() {
    birdVelocity += gravity;
    birdY += birdVelocity;

    if (birdY + birdHeight/2 > canvas.height) {
        birdY = canvas.height - birdHeight/2;
        birdVelocity = 0;
        isGameOver = true;
    }

    if (birdY - birdHeight/2 < 0) {
        birdY = birdHeight/2;
        birdVelocity = 0;
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x += pipeVelocity;

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }

        if (!pipes[i].scored && pipes[i].x + pipeWidth < birdX) {
            score++;
            pipes[i].scored = true;
        }

        if (birdX + birdWidth/2 > pipes[i].x &&
            birdX - birdWidth/2 < pipes[i].x + pipeWidth &&
            (birdY - birdHeight/2 < pipes[i].top ||
             birdY + birdHeight/2 > pipes[i].bottom)) {
            isGameOver = true;
        }
    }
}

function draw() {
    // Clear the canvas with sky blue color
    ctx.fillStyle = '#4EC0CA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();

    pipes.forEach(pipe => {
        drawPipe(pipe.x, pipe.top, pipe.bottom);
    });

    const rotation = Math.min(Math.max(birdVelocity * 0.04, -0.4), 0.4);
    drawPixelBird(birdX, birdY, rotation);

    // Draw borders last so they overlay everything
    drawBorders();

    // Draw score on top of everything
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeText(score, canvas.width/2 - 10, 50);
    ctx.fillText(score, canvas.width/2 - 10, 50);

    if (isGameOver) {
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText("GAME OVER!", canvas.width/2 - 140, canvas.height/2);
        ctx.fillText("GAME OVER!", canvas.width/2 - 140, canvas.height/2);
        ctx.font = "24px Arial";
        ctx.strokeText("Press R to Restart", canvas.width/2 - 90, canvas.height/2 + 40);
        ctx.fillText("Press R to Restart", canvas.width/2 - 90, canvas.height/2 + 40);
    }
}

function flap() {
    if (!isGameOver) {
        birdVelocity = birdLift;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp") {
        flap();
    }
    if (e.key === "r" && isGameOver) {
        resetGame();
    }
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    flap();
});

function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    isGameOver = false;
}

function gameLoop() {
    if (!isGameOver) {
        updateBird();
        updatePipes();

        if (pipes.length === 0 ||
            pipes[pipes.length - 1].x < canvas.width - 200) {
            createPipe();
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();