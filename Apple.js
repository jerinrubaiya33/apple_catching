const gameContainer = document.getElementById('gameContainer');
const bucket = document.getElementById('bucket');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const welcomePopup = document.getElementById('welcomePopup');
const gameOverPopup = document.getElementById('gameOverPopup');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');
const highScoreElement = document.getElementById('highScore');
const powerUpIndicator = document.getElementById('powerUpIndicator');

let score = 0;
let timeLeft = 45;
let gameInterval;
let timerInterval;
let isGameActive = false;
let highScore = localStorage.getItem('highScore') || 0;
let isPowerUpActive = false;

highScoreElement.textContent = highScore;

function showPopup(popup) {
    popup.classList.add('active');
}

function hidePopup(popup) {
    popup.classList.remove('active');
}

function resetGame() {
    document.querySelectorAll('.apple, .golden-apple, .banana, .flower, .bird, .cat, .butterfly').forEach(el => el.remove());
    bucket.style.left = (gameContainer.offsetWidth - bucket.offsetWidth) / 2 + 'px';
    score = 0;
    timeLeft = 45;
    scoreElement.textContent = 'Score: 0';
    timerElement.textContent = 'Time: 45';
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(difficultyInterval);
    hidePopup(welcomePopup);
    hidePopup(gameOverPopup);
    powerUpIndicator.classList.add('hidden');
    isPowerUpActive = false;
}

function createGameObject(type) {
    if (!isGameActive) return;

    const object = document.createElement('div');
    object.className = type;
    object.style.left = Math.random() * (gameContainer.offsetWidth - 60) + 'px';
    object.style.top = type === 'bird' ? `${Math.random() * 200}px` : '-30px';
    gameContainer.appendChild(object);

    let pos = parseFloat(object.style.top);
    const fall = setInterval(() => {
        if (!isGameActive) {
            clearInterval(fall);
            return;
        }

        if (type === 'flower') {
            pos += 0.5;
            const horizontalMovement = Math.sin(pos / 50) * 2;
            object.style.left = `${parseFloat(object.style.left) + horizontalMovement}px`;
        } else if (type === 'bird') {
            const leftPos = parseFloat(object.style.left);
            object.style.left = `${leftPos + 2}px`;
        } else {
            pos += 5;
        }
        object.style.top = `${pos}px`;

        if (pos >= gameContainer.offsetHeight || parseFloat(object.style.left) > gameContainer.offsetWidth) {
            clearInterval(fall);
            gameContainer.removeChild(object);
            if (type === 'apple') endGame();
            return;
        }

        if (['apple', 'golden-apple', 'banana'].includes(type)) {
            checkCollision(object);
        }
    }, 30);

    if (type === 'cat') {
        const direction = Math.random() < 0.5 ? 1 : -1;
        let catPos = direction === 1 ? -60 : gameContainer.offsetWidth;
        const move = setInterval(() => {
            if (!isGameActive) {
                clearInterval(move);
                return;
            }

            catPos += 3 * direction;
            object.style.left = `${catPos}px`;

            if ((direction === 1 && catPos > gameContainer.offsetWidth) || 
                (direction === -1 && catPos < -60)) {
                clearInterval(move);
                gameContainer.removeChild(object);
            }
        }, 50);
    }
}

function checkCollision(object) {
    const objectRect = object.getBoundingClientRect();
    const bucketRect = bucket.getBoundingClientRect();

    if (
        objectRect.bottom >= bucketRect.top &&
        objectRect.right >= bucketRect.left &&
        objectRect.left <= bucketRect.right &&
        objectRect.top <= bucketRect.bottom
    ) {
        gameContainer.removeChild(object);
        if (object.className === 'apple') {
            score += isPowerUpActive ? 2 : 1;
            scoreElement.textContent = `Score: ${score}`;
            createParticles(objectRect.left, objectRect.top);
        } else if (object.className === 'golden-apple') {
            activatePowerUp();
            createParticles(objectRect.left, objectRect.top);
        } else if (object.className === 'banana') {
            endGame();
        }
    }
}

function activatePowerUp() {
    isPowerUpActive = true;
    powerUpIndicator.classList.remove('hidden');
    setTimeout(() => {
        isPowerUpActive = false;
        powerUpIndicator.classList.add('hidden');
    }, 5000);
}

function startGame() {
    resetGame();
    isGameActive = true;

    gameInterval = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.4) {
            createGameObject('apple');
        } else if (rand < 0.6) {
            createGameObject('banana');
        } else if (rand < 0.7) {
            createGameObject('golden-apple');
        } else if (rand < 0.6) {
            createGameObject('flower'); 
            createGameObject('flower'); 
        } else {
            createGameObject('bird');
        }
    }, 1000);

    createButterflies();
    startTimer();
    increaseDifficulty();
}

function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(difficultyInterval);
    finalScore.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
    showPopup(gameOverPopup);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function moveBucket(e) {
    const containerRect = gameContainer.getBoundingClientRect();
    let newX;

    if (e.type.startsWith('touch')) {
        newX = e.touches[0].clientX - containerRect.left - bucket.offsetWidth / 2;
    } else {
        newX = e.clientX - containerRect.left - bucket.offsetWidth / 2;
    }

    newX = Math.max(0, Math.min(newX, containerRect.width - bucket.offsetWidth));
    bucket.style.left = `${newX}px`;
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.backgroundColor = '#ff0000';
        particle.style.borderRadius = '50%';
        gameContainer.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        let particleX = 0;
        let particleY = 0;

        const moveParticle = setInterval(() => {
            particleX += Math.cos(angle) * speed;
            particleY += Math.sin(angle) * speed + 0.5;
            particle.style.transform = `translate(${particleX}px, ${particleY}px)`;
            particle.style.opacity = 1 - (Math.abs(particleX) + Math.abs(particleY)) / 100;

            if (parseFloat(particle.style.opacity) <= 0) {
                clearInterval(moveParticle);
                gameContainer.removeChild(particle);
            }
        }, 20);
    }
}

let difficultyInterval;

function increaseDifficulty() {
    difficultyInterval = setInterval(() => {
        if (isGameActive) {
            clearInterval(gameInterval);
            gameInterval = setInterval(() => {
                const rand = Math.random();
                if (rand < 0.4) {
                    createGameObject('apple');
                } else if (rand < 0.6) {
                    createGameObject('banana');
                } else if (rand < 0.8) {
                    createGameObject('golden-apple');
                } else if (rand < 0.95) {
                    createGameObject('bird');
                } else {
                    createGameObject('flower');
                }                
            }, Math.max(600, 1000 - score * 5));
        }
    }, 10000);
}
function createFlower() {
    if (!isGameActive) return;

    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.style.left = Math.random() * (gameContainer.offsetWidth - 60) + 'px';
    flower.style.top = '-30px'; // Start slightly above the game container
    gameContainer.appendChild(flower);

    let posY = parseFloat(flower.style.top);
    let posX = parseFloat(flower.style.left);
    let angle = 0; // For the waving motion

    const fall = setInterval(() => {
        if (!isGameActive) {
            clearInterval(fall);
            return;
        }

        // Update position for waving motion
        angle += 0.1;
        posY += 3; // Falling speed
        posX += Math.sin(angle) * 4; // Waving motion

        flower.style.top = `${posY}px`;
        flower.style.left = `${posX}px`;

        // Check collision
        checkCollision(flower);

        // Remove if out of bounds
        if (posY >= gameContainer.offsetHeight || posX < -30 || posX > gameContainer.offsetWidth + 30) {
            clearInterval(fall);
            if (flower.parentElement) {
                gameContainer.removeChild(flower);
            }
        }
    }, 30);
}

function createButterflies() {
    setInterval(() => {
        if (!isGameActive) return;

        const butterfly = document.createElement('div');
        butterfly.className = 'butterfly';
        const direction = Math.random() < 0.5 ? 1 : -1; // Random direction
        butterfly.style.left = direction === 1 ? '-40px' : `${gameContainer.offsetWidth + 40}px`;
        butterfly.style.top = `${Math.random() * (gameContainer.offsetHeight - 30)}px`;
        butterfly.style.animationDirection = direction === 1 ? 'normal' : 'reverse';
        gameContainer.appendChild(butterfly);

        setTimeout(() => {
            gameContainer.removeChild(butterfly);
        }, 8000);
    }, 3000); // Adjust frequency if needed
}


bucket.addEventListener('mousedown', () => {
    document.addEventListener('mousemove', moveBucket);
});

document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', moveBucket);
});

bucket.addEventListener('touchstart', (e) => {
    e.preventDefault();
    document.addEventListener('touchmove', moveBucket);
});

document.addEventListener('touchend', () => {
    document.removeEventListener('touchmove', moveBucket);
});

document.addEventListener('keydown', (e) => {
    const step = 20;
    const currentLeft = parseInt(bucket.style.left) || 0;
    if (e.key === 'ArrowLeft') {
        bucket.style.left = `${Math.max(0, currentLeft - step)}px`;
    } else if (e.key === 'ArrowRight') {
        bucket.style.left = `${Math.min(gameContainer.offsetWidth - bucket.offsetWidth, currentLeft + step)}px`;
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

showPopup(welcomePopup);