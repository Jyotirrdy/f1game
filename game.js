const canvas = document.getElementById("track");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("score");
const speedLabel = document.getElementById("speed");
const restartBtn = document.getElementById("restart");
const statusLabel = document.getElementById("status");

const laneCount = 3;
const laneWidth = canvas.width / laneCount;
const carWidth = 54;
const carHeight = 90;

const player = {
  lane: 1,
  y: canvas.height - carHeight - 20,
  width: carWidth,
  height: carHeight,
  color: "#ff2f4f"
};

let enemies = [];
let keys = new Set();
let score = 0;
let speed = 4;
let gameOver = false;
let spawnTimer = 0;
let loopHandle;

function laneCenterX(lane) {
  return lane * laneWidth + laneWidth / 2 - carWidth / 2;
}

function resetGame() {
  enemies = [];
  keys.clear();
  player.lane = 1;
  score = 0;
  speed = 4;
  spawnTimer = 0;
  gameOver = false;
  restartBtn.hidden = true;
  statusLabel.textContent = "Race started!";
  updateHud();
}

function updateHud() {
  scoreLabel.textContent = score.toString();
  speedLabel.textContent = `${(speed / 4).toFixed(1)}x`;
}

function drawTrack() {
  ctx.fillStyle = "#3a3f4d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d8d8d8";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.strokeStyle = "#b9beca";
  ctx.lineWidth = 2;
  for (let i = 1; i < laneCount; i += 1) {
    for (let y = -40; y < canvas.height; y += 44) {
      ctx.beginPath();
      ctx.moveTo(i * laneWidth, y + (score % 44));
      ctx.lineTo(i * laneWidth, y + 24 + (score % 44));
      ctx.stroke();
    }
  }
}

function drawCar(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, carWidth, carHeight);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 7, y + 8, carWidth - 14, 26);

  ctx.fillStyle = "#ddd";
  ctx.fillRect(x + 8, y + carHeight - 16, carWidth - 16, 8);
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * laneCount);
  enemies.push({
    lane,
    y: -carHeight,
    width: carWidth,
    height: carHeight,
    color: ["#19a7ff", "#f7a325", "#41dc78"][Math.floor(Math.random() * 3)]
  });
}

function movePlayer() {
  if (keys.has("ArrowLeft") && player.lane > 0) {
    player.lane -= 1;
    keys.delete("ArrowLeft");
  }

  if (keys.has("ArrowRight") && player.lane < laneCount - 1) {
    player.lane += 1;
    keys.delete("ArrowRight");
  }
}

function detectCollision(a, b, ax, bx) {
  return (
    ax < bx + b.width &&
    ax + a.width > bx &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (gameOver) return;

  movePlayer();

  spawnTimer += 1;
  if (spawnTimer > Math.max(20, 80 - score / 12)) {
    spawnEnemy();
    spawnTimer = 0;
  }

  const playerX = laneCenterX(player.lane);

  enemies.forEach((enemy) => {
    enemy.y += speed;
  });

  enemies = enemies.filter((enemy) => enemy.y < canvas.height + enemy.height);

  for (const enemy of enemies) {
    const enemyX = laneCenterX(enemy.lane);
    if (detectCollision(player, enemy, playerX, enemyX)) {
      gameOver = true;
      statusLabel.textContent = `Crash! Final score: ${score}`;
      restartBtn.hidden = false;
      break;
    }
  }

  if (!gameOver) {
    score += 1;
    speed = 4 + score / 280;
    updateHud();
  }
}

function draw() {
  drawTrack();

  for (const enemy of enemies) {
    drawCar(laneCenterX(enemy.lane), enemy.y, enemy.color);
  }

  drawCar(laneCenterX(player.lane), player.y, player.color);
}

function gameLoop() {
  update();
  draw();
  loopHandle = requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    keys.add(event.key);
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

resetGame();
cancelAnimationFrame(loopHandle);
gameLoop();
