const GRID_SIZE = 20;
const CELL_SIZE = 25;
const GAME_SPEED = 150;
const GHOST_MOVE_INTERVAL = 3;

let pacman = {
  x: 0,
  y: 0,
  direction: 0
};

let ghost = {
  x: GRID_SIZE - 1,
  y: GRID_SIZE - 1,
  moveCounter: 0
};

let ghost2 = {
  x: GRID_SIZE - 2,
  y: GRID_SIZE - 2,
  moveCounter: 0
};

let ghost3 = {
  x: GRID_SIZE - 3,
  y: GRID_SIZE - 3,
  moveCounter: 0
};

const walls = [
  // Horizontal walls - adjusted for new grid size
  { x: 4*25, y: 4*25, width: 75, height: 25 },
  { x: 12*25, y: 4*25, width: 50, height: 25 },
  { x: 4*25, y: 14*25, width: 75, height: 25 },
  { x: 12*25, y: 14*25, width: 50, height: 25 },
  // Vertical walls
  { x: 4*25, y: 8*25, width: 25, height: 50 },
  { x: 14*25, y: 8*25, width: 25, height: 50 }
];

let score = 0;
let gameOver = false;
let dots = [];
let gameLoop;

function createWalls() {
  walls.forEach(wall => {
    const wallElement = document.createElement('div');
    wallElement.className = 'wall';
    wallElement.style.left = wall.x + 'px';
    wallElement.style.top = wall.y + 'px';
    wallElement.style.width = wall.width + 'px';
    wallElement.style.height = wall.height + 'px';
    document.getElementById('game-container').appendChild(wallElement);
  });
}

function isWallCollision(x, y) {
  const characterBox = {
    left: x * CELL_SIZE + 5,
    right: x * CELL_SIZE + 20,
    top: y * CELL_SIZE + 5,
    bottom: y * CELL_SIZE + 20
  };

  return walls.some(wall => {
    return !(characterBox.left >= wall.x + wall.width ||
            characterBox.right <= wall.x ||
            characterBox.top >= wall.y + wall.height ||
            characterBox.bottom <= wall.y);
  });
}

function getValidMoves(x, y) {
  const moves = [];
  if (x < GRID_SIZE - 1 && !isWallCollision(x + 1, y)) moves.push({x: x + 1, y: y});
  if (x > 0 && !isWallCollision(x - 1, y)) moves.push({x: x - 1, y: y});
  if (y < GRID_SIZE - 1 && !isWallCollision(x, y + 1)) moves.push({x: x, y: y + 1});
  if (y > 0 && !isWallCollision(x, y - 1)) moves.push({x: x, y: y - 1});
  return moves;
}

function initGame() {
  createWalls();

  const dotsContainer = document.querySelector('.dots-container');
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!isWallCollision(x, y) &&
          !(x === 0 && y === 0) &&
          !(x === GRID_SIZE-1 && y === GRID_SIZE-1)) {
        const dot = document.createElement('div');
        dot.className = 'cell';
        dot.style.left = (x * CELL_SIZE) + 'px';
        dot.style.top = (y * CELL_SIZE) + 'px';

        const dotInner = document.createElement('div');
        dotInner.className = 'dot';
        dot.appendChild(dotInner);

        dotsContainer.appendChild(dot);
        dots.push({ x, y, element: dot });
      }
    }
  }

  updatePosition(pacman, document.getElementById('pacman'));
  updatePosition(ghost, document.getElementById('ghost'));
  updatePosition(ghost2, document.getElementById('ghost2'));
  updatePosition(ghost3, document.getElementById('ghost3'));

  gameLoop = setInterval(update, GAME_SPEED);
}

function update() {
  if (gameOver) return;

  ghost.moveCounter++;
  ghost2.moveCounter++;
  ghost3.moveCounter++;

  if (ghost.moveCounter % GHOST_MOVE_INTERVAL === 0) {
    // Ghost 1: Chase Pacman
    const validMoves = getValidMoves(ghost.x, ghost.y);
    if (validMoves.length > 0) {
      let bestMove = validMoves[0];
      let shortestDistance = Math.abs(bestMove.x - pacman.x) + Math.abs(bestMove.y - pacman.y);

      validMoves.forEach((move) => {
        const distance = Math.abs(move.x - pacman.x) + Math.abs(move.y - pacman.y);
        if (distance < shortestDistance) {
          bestMove = move;
          shortestDistance = distance;
        }
      });

      ghost.x = bestMove.x;
      ghost.y = bestMove.y;
    }

    // Ghost 2: Random Movement
    const randomMoves = getValidMoves(ghost2.x, ghost2.y);
    if (randomMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomMoves.length);
      ghost2.x = randomMoves[randomIndex].x;
      ghost2.y = randomMoves[randomIndex].y;
    }

    // Ghost 3: Chase Ghost 1
    const ghost3Moves = getValidMoves(ghost3.x, ghost3.y);
    if (ghost3Moves.length > 0) {
      let bestMove = ghost3Moves[0];
      let shortestDistance = Math.abs(bestMove.x - ghost.x) + Math.abs(bestMove.y - ghost.y);

      ghost3Moves.forEach((move) => {
        const distance = Math.abs(move.x - ghost.x) + Math.abs(move.y - ghost.y);
        if (distance < shortestDistance) {
          bestMove = move;
          shortestDistance = distance;
        }
      });

      ghost3.x = bestMove.x;
      ghost3.y = bestMove.y;
    }

    updatePosition(ghost, document.getElementById('ghost'));
    updatePosition(ghost2, document.getElementById('ghost2'));
    updatePosition(ghost3, document.getElementById('ghost3'));
  }

  // Check ghost collisions
  if ((ghost.x === pacman.x && ghost.y === pacman.y) ||
      (ghost2.x === pacman.x && ghost2.y === pacman.y) ||
      (ghost3.x === pacman.x && ghost3.y === pacman.y)) {
    endGame();
  }

  checkDotCollision();
}

function updatePosition(character, element) {
  element.style.left = (character.x * CELL_SIZE) + 'px';
  element.style.top = (character.y * CELL_SIZE) + 'px';
}

document.addEventListener('keydown', (event) => {
  if (gameOver) return;

  const oldX = pacman.x;
  const oldY = pacman.y;

  switch(event.key) {
    case 'ArrowRight':
    case 'd':
      pacman.x = Math.min(pacman.x + 1, GRID_SIZE - 1);
      pacman.direction = 0;
      break;
    case 'ArrowDown':
    case 's':
      pacman.y = Math.min(pacman.y + 1, GRID_SIZE - 1);
      pacman.direction = 1;
      break;
    case 'ArrowLeft':
    case 'a':
      pacman.x = Math.max(pacman.x - 1, 0);
      pacman.direction = 2;
      break;
    case 'ArrowUp':
    case 'w':
      pacman.y = Math.max(pacman.y - 1, 0);
      pacman.direction = 3;
      break;
  }

  if (isWallCollision(pacman.x, pacman.y)) {
    pacman.x = oldX;
    pacman.y = oldY;
  } else if (oldX !== pacman.x || oldY !== pacman.y) {
    const pacmanElement = document.getElementById('pacman');
    updatePosition(pacman, pacmanElement);
    pacmanElement.style.transform = `rotate(${pacman.direction * 90}deg)`;
  }
});

function checkDotCollision() {
  for (let i = dots.length - 1; i >= 0; i--) {
    if (dots[i].x === pacman.x && dots[i].y === pacman.y) {
      dots[i].element.remove();
      dots.splice(i, 1);
      updateScore(10);

      if (dots.length === 0) {
        endGame(true);
      }
    }
  }
}

function updateScore(points) {
  score += points;
  document.getElementById('score').textContent = `Score: ${score}`;
}

function endGame(won = false) {
  gameOver = true;
  clearInterval(gameLoop);
  const gameOverElement = document.getElementById('game-over');
  gameOverElement.style.display = 'block';
  gameOverElement.style.color = won ? '#0f0' : '#f00';
  gameOverElement.textContent = won ? 'YOU WIN!' : 'GAME OVER';
}

function resetGame() {
  // Clear existing dots and walls
  dots.forEach(dot => dot.element.remove());
  dots = [];
  const walls = document.querySelectorAll('.wall');
  walls.forEach(wall => wall.remove());
  document.querySelector('.dots-container').innerHTML = '';

  // Reset variables
  pacman.x = 0;
  pacman.y = 0;
  pacman.direction = 0;
  ghost.x = GRID_SIZE - 1;
  ghost.y = GRID_SIZE - 1;
  ghost.moveCounter = 0;
  ghost2.x = GRID_SIZE - 2;
  ghost2.y = GRID_SIZE - 2;
  ghost2.moveCounter = 0;
  ghost3.x = GRID_SIZE - 3;
  ghost3.y = GRID_SIZE - 3;
  ghost3.moveCounter = 0;
  score = 0;
  gameOver = false;

  // Reset display
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('score').textContent = 'Score: 0';

  // Reset positions
  updatePosition(pacman, document.getElementById('pacman'));
  document.getElementById('pacman').style.transform = 'rotate(0deg)';
  updatePosition(ghost, document.getElementById('ghost'));
  updatePosition(ghost2, document.getElementById('ghost2'));
  updatePosition(ghost3, document.getElementById('ghost3'));

  // Clear and restart game loop
  clearInterval(gameLoop);
  initGame();
}

initGame();