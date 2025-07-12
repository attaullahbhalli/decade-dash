let obstacleDiameter = 250;
let score = 0;
let obstacleThickness = 20;
let obstaclePassRadius = obstacleDiameter / 2 - 50;
let colors = ['#FF0060', '#00F0FF', '#F6FF00', '#8A2BE2'];
let ball;
let obstacles = [];
let gameState = 'START';
let bestScore = 0;
let obstaclesPassed = 0;

p5.disableFriendlyErrors = true;

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = 0;
        this.colorIndex = 0;
        this.color = colors[this.colorIndex];
        this.shouldChangeColor = false;
    }

    draw() {
        fill(this.color);
        noStroke();
        circle(this.x, this.y, this.radius * 2);
    }

    gravity() {
        this.velocity += 0.28;
        this.y += this.velocity;
    }

    jump() {
        if (gameState === 'PLAYING') {
            this.velocity = -8;
        }
    }

    switchColor() {
        this.colorIndex = (this.colorIndex + 1) % colors.length;
        this.color = colors[this.colorIndex];
        this.shouldChangeColor = false;
    }

    reset() {
        this.y = windowHeight - 100;
        this.velocity = 0;
        this.colorIndex = 0;
        this.color = colors[this.colorIndex];
        this.shouldChangeColor = false;
    }
}

class CircularObstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = random(TWO_PI);
        this.rotationSpeed = 0.02;
        this.passed = false;
        this.isColorSwitcher = false;
    }

    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);

        noFill();
        strokeWeight(obstacleThickness);

        if (!this.isColorSwitcher) {
            for(let i = 0; i < 4; i++) {
                stroke(colors[i]);
                arc(0, 0, obstacleDiameter, obstacleDiameter, i * HALF_PI, (i + 1) * HALF_PI);
            }
        }

        this.rotation += this.rotationSpeed;
        pop();
    }

    checkCollision(ball) {
        let d = dist(ball.x, ball.y, this.x, this.y);

        if (d < obstacleDiameter / 2 + ball.radius &&
            d > obstacleDiameter / 2 - ball.radius - obstacleThickness) {

            let angle = atan2(ball.y - this.y, ball.x - this.x) - this.rotation;
            while (angle < 0) angle += TWO_PI;
            let segment = floor(angle / HALF_PI) % 4;

            if (colors[segment] !== ball.color) {
                gameState = 'GAME_OVER';
                if (score > bestScore) {
                    bestScore = score;
                }
            }
        }

        if (!this.passed && d < obstaclePassRadius) {
            this.passed = true;
            score++;
            obstaclesPassed++;

            if (obstaclesPassed % 2 === 0) {
                ball.shouldChangeColor = true;
            }
        }
    }
}

class LineObstacle {
    constructor(x, y) {
        this.y = y;
        this.thickness = 20;
        this.passed = false;
        this.movementSpeed = 2;
        this.offset = 0;
        this.direction = 1;

        this.updateColors();
    }

    updateColors() {
        this.colors = [...colors];
    }

    draw() {
        this.offset += this.movementSpeed * this.direction;

        if (this.offset > width / 2 || this.offset < -width / 2) {
            this.direction *= -1;
        }

        let segmentWidth = width / 4;

        noStroke();
        for (let i = 0; i < 8; i++) {
            let colorIndex = i % 4;
            fill(this.colors[colorIndex]);

            let xPos = (i * segmentWidth) + this.offset;

            rect(xPos, this.y - this.thickness / 2, segmentWidth, this.thickness);

            if (xPos > width) {
                rect(xPos - width, this.y - this.thickness / 2, segmentWidth, this.thickness);
            }
            if (xPos + segmentWidth < 0) {
                rect(xPos + width, this.y - this.thickness / 2, segmentWidth, this.thickness);
            }
        }
    }

    checkCollision(ball) {
        if (abs(ball.y - this.y) < (ball.radius + this.thickness / 2)) {
            let segmentWidth = width / 4;
            let adjustedX = (ball.x - this.offset) % width;
            if (adjustedX < 0) adjustedX += width;

            let segment = floor(adjustedX / segmentWidth) % 4;

            if (ball.color !== this.colors[segment]) {
                gameState = 'GAME_OVER';
                if (score > bestScore) {
                    bestScore = score;
                }
            }
        }

        if (!this.passed && ball.y < this.y - this.thickness) {
            this.passed = true;
            score++;
            obstaclesPassed++;

            if (obstaclesPassed % 2 === 0) {
                ball.shouldChangeColor = true;
            }
        }
    }
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    ball = new Ball(windowWidth / 2, windowHeight - 100, 15);
    resetGame();
}

function resetGame() {
    score = 0;
    obstaclesPassed = 0;
    obstacles = [];
    ball.reset();

    obstacles.push(new CircularObstacle(windowWidth / 2, windowHeight - 500));
    for (let i = 0; i < 3; i++) {
        createNextObstacle();
    }
}

function createNextObstacle() {
    let lastY = obstacles[obstacles.length - 1].y;
    let obstacleY = lastY - 575;

    let randomType = random(1);
    if (randomType < 0.5) {
        obstacles.push(new CircularObstacle(windowWidth / 2, obstacleY));
    } else {
        obstacles.push(new LineObstacle(windowWidth / 2, obstacleY));
    }
}

function draw() {
    background(20);

    if (gameState === 'START') {
        drawStartScreen();
    } else if (gameState === 'PLAYING') {
        drawGame();
    } else if (gameState === 'GAME_OVER') {
        drawGameOver();
    }
}

function drawGame() {
    push();
    if (ball.y < windowHeight / 2) {
        translate(0, windowHeight / 2 - ball.y);
    }

    if (ball.shouldChangeColor) {
        ball.switchColor();
    }

    for (let obstacle of obstacles) {
        obstacle.draw();
        obstacle.checkCollision(ball);
    }

    if (obstacles[0].y > ball.y + windowHeight / 2) {
        obstacles.shift();
        createNextObstacle();
    }

    ball.draw();
    ball.gravity();

    if (ball.y > windowHeight - ball.radius) {
        ball.y = windowHeight - ball.radius;
        ball.velocity = 0;
    }
    pop();

    fill(255);
    noStroke();
    textSize(40);
    textAlign(CENTER);
    text(score, width/2, 50);
}

function drawStartScreen() {
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text('COLOR SWITCH', width/2, height/3);
    textSize(25);
    text('Click or Press SPACE to Start', width/2, height/2);
    text('Best Score: ' + bestScore, width/2, height/2 + 40);

    ball.draw();
}

function drawGameOver() {
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text('GAME OVER', width/2, height/3);
    textSize(30);
    text('Score: ' + score, width/2, height/2);
    text('Best Score: ' + bestScore, width/2, height/2 + 40);
    textSize(25);
    text('Click or Press SPACE to Restart', width/2, height/2 + 100);
}

function keyPressed() {
    if (keyCode === 32) {
        if (gameState === 'START') {
            gameState = 'PLAYING';
        } else if (gameState === 'PLAYING') {
            ball.jump();
        } else if (gameState === 'GAME_OVER') {
            gameState = 'PLAYING';
            resetGame();
        }
    }
}

function mousePressed() {
    if (gameState === 'START') {
        gameState = 'PLAYING';
    } else if (gameState === 'PLAYING') {
        ball.jump();
    } else if (gameState === 'GAME_OVER') {
        gameState = 'PLAYING';
        resetGame();
    }
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}