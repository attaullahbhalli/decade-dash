const BOARD_SIZE = 10;
const MINE_COUNT = 10;
const gameBoard = document.getElementById('game-board');
const mineCountDisplay = document.getElementById('mine-count');
let gameOver = false;
let flaggedCount = 0;
let board;

function getRandomColor() {
  const colors = [
    '#ff00de', // pink
    '#00ff9f', // cyan
    '#ff6b6b', // coral
    '#4d4dff', // blue
    '#9f00ff', // purple
    '#00ffff', // aqua
    '#ff00ff', // magenta
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function resetGame() {
  gameOver = false;
  flaggedCount = 0;
  mineCountDisplay.textContent = MINE_COUNT;
  gameBoard.innerHTML = '';
  board = initializeGame();
}

function initializeGame() {
  const board = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      row.push(Math.random() < MINE_COUNT / (BOARD_SIZE * BOARD_SIZE) ? 'mine' : null);
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      // Assign random color to each cell
      cell.style.backgroundColor = getRandomColor();
      // Add subtle glow effect based on the cell's color
      cell.style.boxShadow = `0 0 10px ${cell.style.backgroundColor}`;
      cell.addEventListener('click', revealCell);
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        toggleFlag(event.target);
      });
      gameBoard.appendChild(cell);
    }
    board.push(row);
  }
  return board;
}

function revealCell(event) {
  if (gameOver) return;

  const cell = event.target;
  if (cell.classList.contains('flagged') || cell.classList.contains('revealed')) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  cell.classList.add('revealed');
  if (board[y][x] === 'mine') {
    cell.classList.add('mine');
    gameOver = true;
    revealAllMines();
    setTimeout(() => alert('Game Over!'), 100);
    return;
  }

  const mineCount = getMineCount(board, x, y);
  cell.textContent = mineCount || '';
  if (mineCount === 0) revealAdjacentCells(x, y);
  checkWin();
}

function getMineCount(board, x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE && board[newY][newX] === 'mine') {
        count++;
      }
    }
  }
  return count;
}

function revealAdjacentCells(x, y) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
        const neighborCell = gameBoard.children[(newY * BOARD_SIZE) + newX];
        if (!neighborCell.classList.contains('revealed')) revealCell({ target: neighborCell });
      }
    }
  }
}

function toggleFlag(cell) {
  if (gameOver || cell.classList.contains('revealed')) return;

  if (cell.classList.contains('flagged')) {
    cell.classList.remove('flagged');
    flaggedCount--;
  } else if (flaggedCount < MINE_COUNT) {
    cell.classList.add('flagged');
    flaggedCount++;
  }

  mineCountDisplay.textContent = MINE_COUNT - flaggedCount;
  checkWin();
}

function revealAllMines() {
  [...gameBoard.children].forEach(cell => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    if (board[y][x] === 'mine') cell.classList.add('mine');
  });
}

function checkWin() {
  const allCells = [...gameBoard.children];
  const correctFlags = allCells.every(cell => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    return (board[y][x] === 'mine') === cell.classList.contains('flagged');
  });

  const allNonMinesRevealed = allCells.every(cell => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    return board[y][x] === 'mine' || cell.classList.contains('revealed');
  });

  if (correctFlags && allNonMinesRevealed) {
    gameOver = true;
    setTimeout(() => alert('Congratulations! You won!'), 100);
  }
}

board = initializeGame();