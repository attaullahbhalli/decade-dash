const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 4;
const paddleHeight = 40;
const ballSize = 2;
const trailLength = 10; // Number of positions to keep in trail

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 2.5;
let ballSpeedY = 1.5;

// Array to store previous ball positions for trail effect
let trailPositions = [];

const leftPaddle = {
  x: canvas.width * 0.1,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 0
};

const rightPaddle = {
  x: canvas.width * 0.9,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 0
};

const paddleSpeed = 5;

function draw() {
  // Create fade effect by applying semi-transparent black overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the line style to match phosphor display
  ctx.strokeStyle = "#33ff33";
  ctx.lineWidth = 2;

  // Draw center line
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Update trail positions
  trailPositions.unshift({x: ballX, y: ballY});
  if (trailPositions.length > trailLength) {
    trailPositions.pop();
  }

  // Draw trail
  trailPositions.forEach((pos, index) => {
    const alpha = (trailLength - index) / trailLength;
    ctx.fillStyle = `rgba(51, 255, 51, ${alpha * 0.5})`;
    ctx.shadowColor = "#33ff33";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ballSize * (1 - index/trailLength), 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw current ball position with stronger glow
  ctx.fillStyle = "#33ff33";
  ctx.shadowColor = "#33ff33";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fill();

  // Draw paddles with glow effect
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#33ff33";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

  // Reset shadow for next frame
  ctx.shadowBlur = 0;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY >= canvas.height - ballSize) {
    ballSpeedY = -ballSpeedY;
  }

  if (ballX <= leftPaddle.x + paddleWidth &&
      ballY >= leftPaddle.y &&
      ballY <= leftPaddle.y + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }

  if (ballX >= rightPaddle.x - ballSize &&
      ballY >= rightPaddle.y &&
      ballY <= rightPaddle.y + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }

  if (ballX < 0 || ballX > canvas.width) {
    resetBall();
  }

  leftPaddle.y += leftPaddle.speed;
  rightPaddle.y += rightPaddle.speed;

  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + paddleHeight > canvas.height) leftPaddle.y = canvas.height - paddleHeight;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + paddleHeight > canvas.height) rightPaddle.y = canvas.height - paddleHeight;
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = (Math.random() * 2 - 1) * 2.5;
  trailPositions = []; // Clear the trail when resetting
}

function handleKeydown(event) {
  if (event.key === "w") leftPaddle.speed = -paddleSpeed;
  if (event.key === "s") leftPaddle.speed = paddleSpeed;
  if (event.key === "o") rightPaddle.speed = -paddleSpeed;
  if (event.key === "l") rightPaddle.speed = paddleSpeed;
}

function handleKeyup(event) {
  if (event.key === "w" || event.key === "s") leftPaddle.speed = 0;
  if (event.key === "o" || event.key === "l") rightPaddle.speed = 0;
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();