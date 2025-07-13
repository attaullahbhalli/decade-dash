let gameSeq = [];
let userSeq = [];
let btns = ["yellow", "red", "purple", "blue"];
let started = false;
let level = 0;
let timerInterval;
let timeLeft;

const h3 = document.querySelector("h3");
const startBtn = document.querySelector(".start-btn");
const timerDisplay = document.querySelector(".timer");

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 3;
    timerDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 1) {
            timerDisplay.classList.add('warning');
        }

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = '';
            gameOver('Time\'s up!');
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerDisplay.textContent = '';
}

function gameOver(message) {
    const gameOverText = window.innerWidth < 610
        ? `${message}\nLevel ${level}\nPress Start to restart`
        : `${message}\nLevel ${level}\nPress any key to restart`;

    h3.innerText = gameOverText;

    if (window.innerWidth < 610) {
        displayStartBtn();
    }

    document.body.style.backgroundColor = "red";
    setTimeout(() => {
        document.body.style.backgroundColor = "var(--main-purple)";
    }, 200);

    reset();
}

function generateNewPattern(length) {
    let newPattern = [];
    for(let i = 0; i < length; i++) {
        let randIndex = Math.floor(Math.random() * 4);
        newPattern.push(btns[randIndex]);
    }
    return newPattern;
}

function flashSequence(sequence, index = 0) {
    if (index >= sequence.length) {
        setTimeout(() => startTimer(), 500);
        return;
    }

    const btn = document.querySelector(`.${sequence[index]}`);
    const baseSpeed = 300;
    const speedReduction = Math.min(200, level * 10);
    const currentSpeed = Math.max(50, baseSpeed - speedReduction);

    setTimeout(() => {
        gameFlash(btn);
        setTimeout(() => flashSequence(sequence, index + 1), currentSpeed);
    }, currentSpeed);
}

function checkWindowSize() {
    if (window.innerWidth < 610) {
        h3.innerText = `Click Start to start the Game`;
    } else {
        hiddenStartBtn();
    }
}

window.addEventListener('resize', checkWindowSize);
checkWindowSize();

document.addEventListener("keypress", function() {
    if (!started) {
        started = true;
        levelUp();
    }
});

startBtn.addEventListener("click", function() {
    if (!started) {
        started = true;
        hiddenStartBtn();
        levelUp();
    }
});

function hiddenStartBtn() {
    startBtn.classList.remove('visible');
    startBtn.classList.add('hidden');
}

function displayStartBtn() {
    startBtn.classList.add('visible');
    startBtn.classList.remove('hidden');
}

function gameFlash(btn) {
    btn.classList.add("flash");
    const flashDuration = Math.max(100, 250 - (level * 5));
    setTimeout(() => {
        btn.classList.remove("flash");
    }, flashDuration);
}

function userFlash(btn) {
    btn.classList.add("userflash");
    setTimeout(() => {
        btn.classList.remove("userflash");
    }, 150);
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            stopTimer();
            const nextLevelDelay = Math.max(200, 500 - (level * 10));
            setTimeout(levelUp, nextLevelDelay);
        }
    } else {
        gameOver('Wrong pattern!');
    }
}

function btnPress() {
    if (!started) return;

    if (userSeq.length === 0) {
        stopTimer();
    }

    const userColor = this.getAttribute("id");
    userSeq.push(userColor);
    userFlash(this);
    checkAns(userSeq.length - 1);
}

const allBtns = document.querySelectorAll(".btn");
allBtns.forEach(btn => btn.addEventListener("click", btnPress));

function reset() {
    stopTimer();
    started = false;
    level = 0;
    gameSeq = [];
    userSeq = [];
}