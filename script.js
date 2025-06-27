// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Track the player's score

const DROPS_PER_TICK = 3; // Number of drops to create per interval

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

let timeLeft = 30;
let timerInterval;

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateScoreDisplay();
  updateTimeDisplay();

  // Remove any old drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimeDisplay();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(() => {
    for (let i = 0; i < DROPS_PER_TICK; i++) {
      createDrop();
    }
  }, 1000);
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = score;
}

function updateTimeDisplay() {
  document.getElementById("time").textContent = timeLeft;
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;

  // Show feedback
  const scorePanel = document.querySelector('.score-panel');
  let message, positive;
  if (score > 25) {
    message = `Water Warrior! You scored ${score} points!`;
    positive = true;
    if (scorePanel) {
      scorePanel.style.backgroundColor = "#e6ffe6";
      setTimeout(() => {
        scorePanel.style.backgroundColor = "#fff";
      }, 1000);
    }
  } else {
    message = `Better luck next time! You scored ${score} points.`;
    positive = false;
    if (scorePanel) {
      scorePanel.style.backgroundColor = "#ffe6e6";
      setTimeout(() => {
        scorePanel.style.backgroundColor = "#fff";
      }, 1000);
    }
  }
  showEndModal(message, positive);
}

function showEndModal(message, positive) {
  let modal = document.getElementById('end-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'end-modal';
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = 1000;
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div style="background:#fff;padding:40px 30px 30px 30px;border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,0.2);text-align:center;min-width:300px;max-width:90vw;position:relative;">
    <h2 style='color:${positive ? '#159A48' : '#F5402C'};margin-bottom:16px;'>${positive ? 'Congratulations!' : 'Game Over'}</h2>
    <div style='font-size:22px;margin-bottom:24px;'>${message}</div>
    <button id='play-again-btn' style='padding:10px 24px;font-size:18px;background:${positive ? '#4FCB53' : '#F5402C'};color:#fff;border:none;border-radius:6px;cursor:pointer;'>Play Again</button>
  </div>`;
  if (positive) {
    launchConfetti();
  }
  document.getElementById('play-again-btn').onclick = function() {
    modal.style.display = 'none';
    removeConfetti();
    startGame();
  };
  modal.style.display = 'flex';
}

function launchConfetti() {
  removeConfetti();
  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.left = 0;
  confettiContainer.style.top = 0;
  confettiContainer.style.width = '100vw';
  confettiContainer.style.height = '100vh';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = 2000;
  document.body.appendChild(confettiContainer);
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.position = 'absolute';
    conf.style.width = '10px';
    conf.style.height = '18px';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.top = '-30px';
    conf.style.opacity = 0.8;
    conf.style.borderRadius = '3px';
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiContainer.appendChild(conf);
    // Animate
    const fall = 600 + Math.random()*600;
    const drift = (Math.random()-0.5)*200;
    conf.animate([
      { transform: conf.style.transform, top: '-30px', left: conf.style.left },
      { transform: `rotate(${Math.random()*360}deg)`, top: '100vh', left: `calc(${conf.style.left} + ${drift}px)` }
    ], {
      duration: fall,
      easing: 'ease-in',
      fill: 'forwards'
    });
  }
}

function removeConfetti() {
  const confetti = document.getElementById('confetti-container');
  if (confetti) confetti.remove();
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a good (blue) or bad (black) drop
  const isGood = Math.random() > 0.3; // 70% blue, 30% black
  if (isGood) {
    drop.className = "water-drop";
    drop.style.backgroundColor = "#0099ff";
  } else {
    drop.className = "water-drop bad-drop";
    drop.style.backgroundColor = "#222"; // black
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 7 seconds (was 4s)
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });

  // Add click handler for scoring and feedback
  drop.addEventListener("click", () => {
    const scorePanel = document.querySelector('.score-panel');
    if (isGood) {
      score++;
      updateScoreDisplay();
      // Visual feedback: briefly highlight the score panel green
      if (scorePanel) {
        scorePanel.style.backgroundColor = "#e6ffe6";
        setTimeout(() => {
          scorePanel.style.backgroundColor = "#fff";
        }, 200);
      }
    } else {
      score--;
      updateScoreDisplay();
      // Visual feedback: briefly highlight the score panel red
      if (scorePanel) {
        scorePanel.style.backgroundColor = "#ffe6e6";
        setTimeout(() => {
          scorePanel.style.backgroundColor = "#fff";
        }, 200);
      }
    }
    drop.remove();
  });
}
