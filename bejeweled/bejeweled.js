const boardSize = 5;
const gemTypes = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
let board = [];
let selectedCell = null;
let gameOver = false;
let timer = 60;
let timerInterval;
let score = 0;

function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    for (let row = 0; row < boardSize; row++) {
        const rowArr = [];
        for (let col = 0; col < boardSize; col++) {
            const gem = gemTypes[Math.floor(Math.random() * gemTypes.length)];
            rowArr.push(gem);
            const cell = document.createElement('div');
            cell.classList.add('cell', gem);
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            cell.addEventListener('click', () => handleCellClick(row, col, cell));
            gameBoard.appendChild(cell);
        }
        board.push(rowArr);
    }
}

function handleCellClick(row, col, cell) {
    if (gameOver) return;

    if (selectedCell === null) {
        selectedCell = { row, col, element: cell };
        cell.style.border = '2px solid white';
        cell.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
    } else {
        if (isAdjacent(row, col)) {
            swapGems(selectedCell.row, selectedCell.col, row, col);
            checkAndRemoveMatches();
            selectedCell.element.style.border = '';
            selectedCell.element.style.boxShadow = '';
            selectedCell = null;
        } else {
            selectedCell.element.style.border = '';
            selectedCell.element.style.boxShadow = '';
            selectedCell = null;
        }
    }
}

function isAdjacent(row, col) {
    const selected = selectedCell;
    return (Math.abs(selected.row - row) === 1 && selected.col === col) ||
           (Math.abs(selected.col - col) === 1 && selected.row === row);
}

function swapGems(row1, col1, row2, col2) {
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;

    const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    const gem1 = cell1.classList[1];
    const gem2 = cell2.classList[1];

    cell1.classList.replace(gem1, gem2);
    cell2.classList.replace(gem2, gem1);
}

function checkAndRemoveMatches() {
    const cellsToRemove = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            const gem = board[row][col];
            if (board[row][col + 1] === gem && board[row][col + 2] === gem) {
                cellsToRemove.push({ row, col });
                cellsToRemove.push({ row, col: col + 1 });
                cellsToRemove.push({ row, col: col + 2 });
            }
        }
    }

    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            const gem = board[row][col];
            if (board[row + 1][col] === gem && board[row + 2][col] === gem) {
                cellsToRemove.push({ row, col });
                cellsToRemove.push({ row: row + 1, col });
                cellsToRemove.push({ row: row + 2, col });
            }
        }
    }

    if (cellsToRemove.length > 0) {
        score += cellsToRemove.length * 10;
        document.getElementById('score').innerText = `Score: ${score}`;

        cellsToRemove.forEach(cell => {
            const { row, col } = cell;
            board[row][col] = null;
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cellElement.classList.remove(...gemTypes);
        });

        dropGems();
    }
}

function dropGems() {
    for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;
        for (let row = boardSize - 1; row >= 0; row--) {
            if (board[row][col] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                const gem = board[row][col];
                board[row][col] = null;
                board[row + emptySpaces][col] = gem;
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const newCellElement = document.querySelector(`[data-row="${row + emptySpaces}"][data-col="${col}"]`);
                newCellElement.classList.add(gem);
                cellElement.classList.remove(gem);
            }
        }

        for (let row = 0; row < emptySpaces; row++) {
            const gem = gemTypes[Math.floor(Math.random() * gemTypes.length)];
            board[row][col] = gem;
            const newCellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            newCellElement.classList.add(gem);
        }
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').innerText = `Time left: ${timer}s`;
        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    gameOver = true;
    document.getElementById('game-over-message').style.display = 'block';
}

function resetGame() {
    gameOver = false;
    timer = 60;
    score = 0;
    board = [];
    document.getElementById('game-over-message').style.display = 'none';
    document.getElementById('score').innerText = `Score: 0`;
    document.getElementById('timer').innerText = `Time left: 60s`;
    clearInterval(timerInterval);
    createBoard();
    startTimer();
}

createBoard();
startTimer();

document.getElementById('reset-button').addEventListener('click', resetGame);