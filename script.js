// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy:   { dropsPerTick: 2, winScore: 20, time: 30, dropSpeed: 4 },
  normal: { dropsPerTick: 3, winScore: 25, time: 30, dropSpeed: 3 },
  hard:   { dropsPerTick: 4, winScore: 25, time: 20, dropSpeed: 2.7 }
};

let currentDifficulty = null;
let winScore = null;
let dropSpeed = null;
let DROPS_PER_TICK = null;
let timeLeft = null;

// Setup difficulty modal logic and start/reset button handlers
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('difficulty-modal');
  const startBtn = document.getElementById('start-btn');
  modal.style.display = 'flex';
  startBtn.disabled = true;
  currentDifficulty = null;

  // Difficulty selection logic
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.onclick = function() {
      currentDifficulty = btn.dataset.difficulty;
      const settings = DIFFICULTY_SETTINGS[currentDifficulty];
      winScore = settings.winScore;
      dropSpeed = settings.dropSpeed;
      DROPS_PER_TICK = settings.dropsPerTick;
      timeLeft = settings.time;
      startBtn.disabled = false;
      updateTimeDisplay();
      // Hide all difficulty buttons after selection
      document.querySelectorAll('.difficulty-btn').forEach(b => b.style.display = 'none');
    };
  });

  // Start button logic (in modal)
  startBtn.onclick = function() {
    modal.style.display = 'none';
    // Show difficulty buttons again for next time
    document.querySelectorAll('.difficulty-btn').forEach(b => b.style.display = '');
    startGame();
  };

  // Reset button logic (in score panel)
  document.getElementById("reset-btn").onclick = resetGame;
});

// Variables to control game state
let gameRunning = false;
let dropMaker;
let score = 0;
let timerInterval;

// Milestone messages (percentages of winScore)
const MILESTONES = [
  { percent: 0.5, message: "Halfway there!" },
  { percent: 0.75, message: "Almost there!" },
  { percent: 1.0, message: "You reached the goal!" }
];
let triggeredMilestones = [];

function startGame() {
  if (gameRunning) return;
  if (!currentDifficulty) return; // Prevent start if no difficulty chosen

  gameRunning = true;
  score = 0;
  timeLeft = DIFFICULTY_SETTINGS[currentDifficulty].time;
  triggeredMilestones = []; // Reset milestones for new game
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

  // Create new drops every second
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
  document.getElementById("time").textContent = timeLeft !== null ? timeLeft : '';
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;

  const scorePanel = document.querySelector('.score-panel');
  let message, positive;
  if (score >= winScore) {
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
    // Show difficulty modal again before restarting
    document.getElementById('difficulty-modal').style.display = 'flex';
    document.getElementById('start-btn').disabled = true;
    currentDifficulty = null;
    // Show difficulty buttons again for next time
    document.querySelectorAll('.difficulty-btn').forEach(b => b.style.display = '');
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

// Sound for drop collection
const dropSound = document.getElementById("dropSound");
const badDropSound = document.getElementById("badDropSound");
badDropSound.playbackRate = 3; // Play bad drop sound 2x faster

function playDropSound() {
  dropSound.currentTime = 0;
  dropSound.play();
}

function playBadDropSound() {
  badDropSound.currentTime = 0;
  badDropSound.play();
}

function createDrop() {
  const drop = document.createElement("div");
  const isGood = Math.random() > 0.3;
  if (isGood) {
    drop.className = "water-drop";
    drop.style.backgroundColor = "#0099ff";
  } else {
    drop.className = "water-drop bad-drop";
    drop.style.backgroundColor = "#222";
  }
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = dropSpeed ? `${dropSpeed}s` : "4s";
  document.getElementById("game-container").appendChild(drop);
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
  drop.addEventListener("click", () => {
    const scorePanel = document.querySelector('.score-panel');
    if (isGood) {
      playDropSound(); // Play sound when good drop is collected
      score++;
      updateScoreDisplay();
      checkMilestones();
      if (scorePanel) {
        scorePanel.style.backgroundColor = "#e6ffe6";
        setTimeout(() => {
          scorePanel.style.backgroundColor = "#fff";
        }, 200);
      }
    } else {
      playBadDropSound(); // Play sound when bad drop is collected
      score--;
      updateScoreDisplay();
      checkMilestones();
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

// Example for custom game logic (not used in this code, but as requested):
// if (drop.type === 'bad' && isColliding(player, drop)) {
//   playBadDropSound();
//   score -= 5; // or your bad drop logic
//   drops.splice(index, 1); // remove the drop if needed
// }

function checkMilestones() {
  if (!winScore) return;
  MILESTONES.forEach(milestone => {
    const milestoneScore = Math.ceil(winScore * milestone.percent);
    if (
      score >= milestoneScore &&
      !triggeredMilestones.includes(milestone.percent) &&
      milestone.percent < 1 // Don't show "You reached the goal!" here
    ) {
      showMilestoneMessage(milestone.message);
      triggeredMilestones.push(milestone.percent);
    }
  });
}

function showMilestoneMessage(msg) {
  // Simple floating message at top center
  let el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.top = '40px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.background = '#FFC907';
  el.style.color = '#222';
  el.style.fontWeight = 'bold';
  el.style.fontFamily = 'Georgia, serif';
  el.style.fontSize = '20px';
  el.style.padding = '12px 32px';
  el.style.borderRadius = '10px';
  el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
  el.style.zIndex = 3000;
  el.style.opacity = '0.97';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.7s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 700);
  }, 1200);
}

function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  score = 0;
  timeLeft = currentDifficulty ? DIFFICULTY_SETTINGS[currentDifficulty].time : '';
  updateScoreDisplay();
  updateTimeDisplay();
  const endModal = document.getElementById('end-modal');
  if (endModal) endModal.style.display = 'none';
  removeConfetti();
  document.getElementById('difficulty-modal').style.display = 'flex';
  document.getElementById('start-btn').disabled = true;
  currentDifficulty = null;
  // Show difficulty buttons again for next time
  document.querySelectorAll('.difficulty-btn').forEach(b => b.style.display = '');
}
