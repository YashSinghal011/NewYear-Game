
let score = 0;
let lives = 3;
let gameMode = false;
let currentTarget = null;
let audioContext = null;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Success sound
function playSuccessSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Fail sound
function playFailSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function createFirework(x, y, color = null) {
    const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#ff8c00', '#fff'];
    const finalColor = color || colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.backgroundColor = finalColor;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

function createTarget() {
    if (!gameMode || currentTarget || lives <= 0) return;
    
    const target = document.createElement('div');
    target.className = 'target';
    const x = Math.random() * (window.innerWidth - 40);
    const y = Math.random() * (window.innerHeight - 200) + 100;
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    document.body.appendChild(target);
    currentTarget = target;

    setTimeout(() => {
        if (currentTarget === target) {
            target.remove();
            currentTarget = null;
            loseLife();
            createTarget();
        }
    }, 2000);
}

function loseLife() {
    lives--;
    document.getElementById('livesValue').textContent = lives;
    playFailSound();

    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    document.getElementById('gameOver').style.display = 'block';
    if (currentTarget) {
        currentTarget.remove();
        currentTarget = null;
    }
    gameMode = false;
    document.getElementById('gameMode').textContent = '🎮 Game Mode: Off';
}

function restartGame() {
    score = 0;
    lives = 3;
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('livesValue').textContent = lives;
    document.getElementById('gameOver').style.display = 'none';
    if (currentTarget) {
        currentTarget.remove();
        currentTarget = null;
    }
    if (gameMode) {
        createTarget();
    }
}

document.addEventListener('click', (e) => {
    initAudio();
    
    if (e.target.classList.contains('button')) return;

    if (gameMode && currentTarget) {
        const rect = currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width/2;
        const centerY = rect.top + rect.height/2;
        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        
        if (distance < 50) {
            score += 10;
            document.getElementById('scoreValue').textContent = score;
            playSuccessSound();
            createFirework(centerX, centerY, '#ffd700');
            currentTarget.remove();
            currentTarget = null;
            setTimeout(createTarget, 500);
        } else {
            loseLife();
            createFirework(e.clientX, e.clientY, '#ff0000');
        }
    } else if (!gameMode) {
        createFirework(e.clientX, e.clientY);
    }
});

document.getElementById('gameMode').addEventListener('click', function() {
    gameMode = !gameMode;
    this.textContent = `🎮 Game Mode: ${gameMode ? 'On' : 'Off'}`;
    if (gameMode) {
        restartGame();
        createTarget();
    } else if (currentTarget) {
        currentTarget.remove();
        currentTarget = null;
    }
});

document.getElementById('restart').addEventListener('click', restartGame);
