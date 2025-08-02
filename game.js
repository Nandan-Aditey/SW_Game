const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const loadImage = src => {
  const img = new Image();
  img.src = src;
  return img;
};

const playerImg = loadImage("xwing.png");
const enemyImg = loadImage("tiefighter.png");
const healerImg = loadImage("healer.png");
const vaderImg = loadImage("vader.png");
const laserImg = loadImage("laser.png");
const greenLaserImg = loadImage("green_laser.png"); 

const keys = {};
const lasers = [];
const enemies = [];
const enemyLasers = [];
const healers = [];

let score = 0;
let boss = null;
let bossHealth = 20;
let gameOver = false;
let lastPlayerShot = 0;
let lastEnemyShot = 0;
let lastActionTime = Date.now();
let peaceGiven = false;
let glitchGiven = false;

const flagVictory = "ZGJkdGh7YW5ha2luX2lzX3BhbmFraW59";
const flagPeace = "ZGJkdGh7cGVhY2Vfd2FzX25ldmVyX2FuX29wdGlvbn0=";
const flagGlitch = "ZGJkdGh7Z2xpdGNoeV9zeXN0ZW19";

const revealFlag = (b64, label = "Flag") => {
  setTimeout(() => {
    alert(`${label}: ${atob(b64)}`);
  }, 200 + Math.random() * 800);
};

const player = {
  x: 50,
  y: canvas.height / 2 - 40,
  width: 80,
  height: 80,
  speed: 5,
  lastShotTime: 0
};

const vaderQuotes = [
  "I find your lack of faith disturbing.",
  "You don’t know the power of the dark side.",
  "The Force is strong with you... but not strong enough.",
  "Impressive. Most impressive.",
  "It is your destiny.",
  "You are unwise to lower your defenses.",
  "The ability to destroy a planet is insignificant next to the power of the Force."
];


document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") {
    lastActionTime = Date.now();
  }
});

document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    const now = Date.now();
    if (now - player.lastShotTime > 500) {
      lasers.push({
        x: player.x + 60,
        y: player.y + 30,
        width: 30,
        height: 10,
        color: "green"
      });
      player.lastShotTime = now;
      lastActionTime = now;
    }
  }
});

setInterval(() => {
  if (!boss) {
    enemies.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 60),
      width: 60,
      height: 60,
      speed: 3 + Math.random() * 2,
      lastShot: 0
    });
  }
}, 1500);

function sayVader(text) {
  const quoteBox = document.createElement("div");
  quoteBox.textContent = "Darth Vader: " + text;
  quoteBox.style.position = "absolute";
  quoteBox.style.top = "10px";
  quoteBox.style.left = "50%";
  quoteBox.style.transform = "translateX(-50%)";
  quoteBox.style.padding = "10px";
  quoteBox.style.background = "rgba(0,0,0,0.8)";
  quoteBox.style.border = "1px solid red";
  quoteBox.style.color = "white";
  quoteBox.style.fontFamily = "serif";
  quoteBox.style.zIndex = 1000;
  document.body.appendChild(quoteBox);
  setTimeout(() => quoteBox.remove(), 4000);
}

function shootBossLaser() {
  if (!boss || gameOver) return;
  enemyLasers.push({
    x: boss.x,
    y: boss.y + boss.height / 2,
    width: 30,
    height: 10,
    speed: 6,
    color: "red"
  });
}

setInterval(() => {
  if (boss && !gameOver) {
    const quote = vaderQuotes[Math.floor(Math.random() * vaderQuotes.length)];
    sayVader(quote);
  }
}, 8000);

function update() {
  if (gameOver) return;

  const now = Date.now();

  if (!peaceGiven && now - lastActionTime > 30000) {
    peaceGiven = true;
    alert("Flag: dbdth{peace_was_never_an_option}");
  }

  if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  lasers.forEach((laser, index) => {
    laser.x += 10;
    if (laser.x > canvas.width) lasers.splice(index, 1);
  });

  enemies.forEach((enemy, eIndex) => {
    enemy.x -= enemy.speed;
    if (enemy.x + enemy.width < 0) enemies.splice(eIndex, 1);

    if (now - enemy.lastShot > 4000) {
      enemyLasers.push({
        x: enemy.x,
        y: enemy.y + enemy.height / 2,
        width: 30,
        height: 10,
        speed: 6,
        color: "red"
      });
      enemy.lastShot = now;
    }

    lasers.forEach((laser, lIndex) => {
      if (
        laser.x < enemy.x + enemy.width &&
        laser.x + laser.width > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + laser.height > enemy.y
      ) {
        enemies.splice(eIndex, 1);
        lasers.splice(lIndex, 1);
        score += 1;
      }
    });
  });

  lasers.forEach((laser, lIndex) => {
    if (laser.y < 40 && laser.x < 140 && !glitchGiven) {
      glitchGiven = true;
      lasers.splice(lIndex, 1);
      score += 1000;
      alert("Flag: dbdth{glitchy_system}");
    }
  });

  if (score >= 10 && !boss) {
    boss = {
      x: canvas.width - 150,
      y: 100,
      width: 120,
      height: 120,
      direction: 1
    };

    healers.push(
      { x: boss.x - 100, y: boss.y + 30, width: 60, height: 60 },
      { x: boss.x - 100, y: boss.y + 90, width: 60, height: 60 }
    );

    setInterval(shootBossLaser, 1500);
    sayVader("So... the Rebel pilot has come.");
    document.getElementById("vaderBreath").play();
  }

  if (boss) {
    boss.y += boss.direction * 2;
    if (boss.y <= 0 || boss.y + boss.height >= canvas.height) {
      boss.direction *= -1;
    }

    if (healers.length > 0 && bossHealth < 20) {
      bossHealth += 0.01;
    }

    lasers.forEach((laser, lIndex) => {
      if (
        laser.x < boss.x + boss.width &&
        laser.x + laser.width > boss.x &&
        laser.y < boss.y + boss.height &&
        laser.y + laser.height > boss.y
      ) {
        lasers.splice(lIndex, 1);
        bossHealth -= 1;
        if (bossHealth <= 0) {
          gameOver = true;
          sayVader("Nooo... I am defeated...");
          setTimeout(() => {
            alert("Flag: dbdth{anakin_is_panakin}");
            document.getElementById("vaderBreath").pause();
          }, 1000);
        }
      }
    });
  }

  enemyLasers.forEach((blaser, bIndex) => {
    blaser.x -= blaser.speed;
    if (blaser.x < 0) enemyLasers.splice(bIndex, 1);

    if (
      blaser.x < player.x + player.width &&
      blaser.x + blaser.width > player.x &&
      blaser.y < player.y + player.height &&
      blaser.y + blaser.height > player.y
    ) {
      gameOver = true;
      sayVader("The Force is with me. You have failed.");
      document.getElementById("vaderBreath").pause();
      setTimeout(() => alert("Vader destroyed you! Try again."), 1000);
    }
  });

  // Healer movement and destruction
  healers.forEach((healer, hIndex) => {
    healer.y += Math.sin(now / 500 + hIndex) * 2;
    healer.x += Math.cos(now / 800 + hIndex) * 2;

    lasers.forEach((laser, lIndex) => {
      if (
        laser.x < healer.x + healer.width &&
        laser.x + laser.width > healer.x &&
        laser.y < healer.y + healer.height &&
        laser.y + laser.height > healer.y
      ) {
        healers.splice(hIndex, 1);
        lasers.splice(lIndex, 1);
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  lasers.forEach(laser => {
    const img = laser.color === "green" ? greenLaserImg : laserImg;
    ctx.drawImage(img, laser.x, laser.y, laser.width, laser.height);
  });

  enemies.forEach(enemy => {
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
  });

  enemyLasers.forEach(blaser => {
    const img = blaser.color === "red" ? laserImg : greenLaserImg;
    ctx.drawImage(img, blaser.x, blaser.y, blaser.width, blaser.height);
  });

  if (boss) {
    ctx.drawImage(vaderImg, boss.x, boss.y, boss.width, boss.height);
    ctx.fillStyle = "red";
    ctx.fillRect(boss.x, boss.y - 10, bossHealth * 5, 5);
  }

  healers.forEach(healer => {
    ctx.drawImage(healerImg, healer.x, healer.y, healer.width, healer.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

gameLoop();
