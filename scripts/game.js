/* ===============================
   1. GAME STATE & UPGRADES
================================ */
let coins = 0; 
let health = 100;
let SPEED = 5; 
let cameraX = 0;
let gameOver = false;
let facingDirection = 1;

const upgrades = JSON.parse(localStorage.getItem("upgrades")) || {};
if (upgrades.health) health = 120;
if (upgrades.speed) SPEED = 7;

const player = document.getElementById("player");
const background = document.querySelector(".background");
const midground = document.querySelector(".midground");
const coinsDisplay = document.getElementById("coins");
const healthDisplay = document.getElementById("health");
const winScreen = document.getElementById("winScreen");
const loseScreen = document.getElementById("loseScreen");
const finalCoins = document.getElementById("finalCoins");
const lostCoinsDisplay = document.getElementById("lostCoins");
const COIN_GOAL = 200;
const DESPAWN_DISTANCE = 600;

const ENEMY = {
  GROUND_OFFSET: -52,   
  SPEED: 1.2,
  PATROL_RANGE: 150,
  ATTACK_RANGE: 120
};

const GROUND_Y = "36px"; 

/* ===============================
   2. LEVEL & BACKGROUND SETUP
================================ */
const activePlanet = localStorage.getItem("activePlanet") || "earth";

if (background) {
    background.style.backgroundImage = `url('assets/${activePlanet}/background.jpg')`;
}

if (midground) {     
    if (activePlanet === "aether") midground.style.filter = "hue-rotate(120deg) opacity(0.3)";
    else if (activePlanet === "cryon") midground.style.filter = "saturate(0) brightness(1.5) opacity(0.4)";
}

/* ===============================
   3. ANIMATION CONFIGS
================================ */
const enemyAnims = {
  walk:   { img: "assets/enemy/move.png", frames: 8, delay: 150 },
  attack: { img: "assets/enemy/attack.png", frames: 4, delay: 100 }
};

const animations = {
  idle: { img: "assets/player/idle.png", frames: 16, cols: 4, w: 128, h: 128, delay: 110 },
  run:  { img: "assets/player/move.png", frames: 18, cols: 4, w: 128, h: 128, delay: 90 },
  attack: { img: "assets/player/attack.png", frames: 21, cols: 21, w: 128, h: 128, delay: 45}
};

const EN_W = 240;
const EN_H = 240;

let currentAnim = null; 
let frame = 0;
let lastFrameTime = 0;
let movingLeft = false;
let movingRight = false;
let attacking = false;

/* ===============================
   4. VISUAL ENGINE
================================ */
function setAnimation(name) {
  if (currentAnim === name && name !== "attack") return;
  const anim = animations[name];
  currentAnim = name;
  frame = 0;
  lastFrameTime = performance.now();
  const rows = Math.ceil(anim.frames / anim.cols);

  player.style.backgroundImage = `url(${anim.img})`;
  player.style.width = `${anim.w}px`;
  player.style.height = `${anim.h}px`;
  player.style.bottom = GROUND_Y; 

  player.style.backgroundSize = `${anim.cols * anim.w}px ${rows * anim.h}px`;
  player.style.backgroundPosition = "0px 0px";
}

function updatePlayerFrame(time) {
  const anim = animations[currentAnim];
  if (anim && time - lastFrameTime >= anim.delay) {
    if (currentAnim === "attack" && frame >= anim.frames - 1) {
        attacking = false;
        setAnimation(movingLeft || movingRight ? "run" : "idle");
    } else {
        frame = (frame + 1) % anim.frames;
    }
    player.style.backgroundPosition = `${-(frame % anim.cols * anim.w)}px ${-(Math.floor(frame / anim.cols) * anim.h)}px`;
    lastFrameTime = time;
  }
}

function attackAction() {
  if (attacking) return;
  attacking = true;
  const snd = new Audio("assets/sounds/attack.wav");
  snd.play().catch(() => {});
  setAnimation("attack");
  checkCombat();
  const anim = animations.attack;
  setTimeout(() => {
    attacking = false;
    setAnimation(movingLeft || movingRight ? "run" : "idle");
  }, anim.frames * anim.delay);
}

/* ===============================
   5. LOGIC & COLLISIONS
================================ */
function checkCombat() {
  const playerWorldX = cameraX + 200 + 64; 

  document.querySelectorAll(".enemy").forEach(enemy => {
    const enemyWorldX = parseFloat(enemy.dataset.worldX) + (EN_W / 2);
    const dist = Math.abs(enemyWorldX - playerWorldX);

    if (dist < 120) {
      enemy.style.transition = "0.2s";
      enemy.style.transform = "scale(0)";
      setTimeout(() => {
        enemy.remove();
        spawnObject("enemy");
      }, 200);
    }
  });
}

function checkCollisions() {
  const pRect = player.getBoundingClientRect();
  
  document.querySelectorAll(".coin").forEach(coin => {
    if (isOverlapping(pRect, coin.getBoundingClientRect())) {
      coins += 10;
      if(coinsDisplay) coinsDisplay.innerText = coins; 
      coin.remove();
      spawnObject("coin");
    }
  });


  let isDamage = false;
  document.querySelectorAll(".enemy").forEach(enemy => {
    const worldX = parseFloat(enemy.dataset.worldX);
    const dist = Math.abs((worldX - cameraX) - 200);
    if (dist < 60) {
        isDamage = true;
        health -= attacking ? 0.1 : 0.4; 
        if(healthDisplay) healthDisplay.innerText = Math.floor(health);
        if (health <= 0 && !gameOver) triggerLose();
    }
  });
  player.style.filter = isDamage ? "sepia(1) saturate(5) hue-rotate(-50deg)" : "none";
}

function isOverlapping(r1, r2) {
  return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function triggerLose() {
    gameOver = true;
    localStorage.setItem("totalCoins", (parseInt(localStorage.getItem("totalCoins")) || 0) + coins); 
    if(loseScreen) loseScreen.classList.remove("hidden");
    if(lostCoinsDisplay) lostCoinsDisplay.innerText = coins;
    setAnimation("idle");
}

function checkWin() {
  if (coins >= COIN_GOAL && !gameOver) {
    gameOver = true;
    
    // Save coins to global wallet for the shop
    let globalCoins = parseInt(localStorage.getItem("totalCoins")) || 0;
    localStorage.setItem("totalCoins", globalCoins + coins);

    // Unlock next planet
    const currentPlanet = localStorage.getItem("activePlanet") || "earth";
    localStorage.setItem(currentPlanet + "Completed", "true");

    // Display Win Screen
    if (winScreen) winScreen.classList.remove("hidden");
    if (finalCoins) finalCoins.innerText = coins;

    setAnimation("idle");
    velocity = 0;
  }
}

function spawnObject(type) {
  const obj = document.createElement("div");
  obj.className = type;
  const worldX = cameraX + 800 + Math.random() * 500;
  obj.dataset.worldX = worldX; 
  obj.style.bottom = type === "coin" ? "80px" : GROUND_Y;

  if (type === "enemy") {
    obj.dataset.startX = worldX;
    obj.dataset.direction = "1";
    obj.dataset.range = ENEMY.PATROL_RANGE;
  }
  document.querySelector(".game-world").appendChild(obj);
}

function resetProgress() {
  localStorage.clear();
  location.reload();
}
/* ===============================
   6. INPUTS
================================ */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { movingRight = true; facingDirection = 1; if(!attacking) setAnimation("run"); }
  if (e.key === "ArrowLeft") { movingLeft = true; facingDirection = -1; if(!attacking) setAnimation("run"); }
  if (e.key === " " || e.key === "f") attackAction();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") movingRight = false;
  if (e.key === "ArrowLeft") movingLeft = false;
  if (!movingRight && !movingLeft && !attacking) setAnimation("idle");
});

/* ===============================
   7. GAME LOOP (FIXED SYNTAX)
================================ */
function gameLoop(time) {
  if (gameOver) return;

  // 1. INPUT & CAMERA
  let velocity = 0;
  if (movingRight) velocity = SPEED;
  if (movingLeft) velocity = -SPEED;
  cameraX += velocity;

  // 2. PLAYER TRANSFORM (Fixed Backticks)
  player.style.left = "200px";
  player.style.transform = `scaleX(${facingDirection})`;

  // 3. PARALLAX (Fixed Backticks)
  if (background) background.style.backgroundPositionX = `${-cameraX * 0.5}px`;
  if (midground) midground.style.backgroundPositionX  = `${-cameraX * 0.8}px`;
   
  updatePlayerFrame(time);
  
  // 4. UPDATE ENEMIES
  document.querySelectorAll(".enemy").forEach(obj => {
    let worldX = parseFloat(obj.dataset.worldX);
    const startX = parseFloat(obj.dataset.startX) || worldX;
    let dir = parseInt(obj.dataset.direction) || 1;
    
   const playerCenter = 200 + 64;        
   const enemyCenter  = (worldX - cameraX) + (EN_W / 2);

   const distToPlayer = Math.abs(enemyCenter - playerCenter);
   const isAttacking  = distToPlayer < ENEMY.ATTACK_RANGE;


    let currentState = isAttacking ? "attack" : "walk";

    if (!isAttacking) {
        worldX += dir * ENEMY.SPEED;

        if (worldX > startX + ENEMY.PATROL_RANGE || worldX < startX - ENEMY.PATROL_RANGE) {
            dir *= -1; obj.dataset.direction = dir;
        }
    }
    obj.dataset.worldX = worldX;
      
    // Despawn enemy if far behind player
    if ((cameraX - worldX) > DESPAWN_DISTANCE) {
       obj.remove();
       spawnObject("enemy");
       return;
     }

    // Animation Engine (Fixed Backticks)
    const eAnim = enemyAnims[currentState];
    const enemyFrame = Math.floor(Date.now() / eAnim.delay) % eAnim.frames;
    
    obj.style.display = "block";
    obj.style.backgroundImage = `url(${eAnim.img})`;
    obj.style.backgroundSize = `${eAnim.frames * EN_W}px ${EN_H}px`;
    obj.style.backgroundPosition = `${-(enemyFrame * EN_W)}px 0px`;
    obj.style.transform = `scaleX(${-dir})`; 
    obj.style.bottom = `calc(${GROUND_Y} + ${ENEMY.GROUND_OFFSET}px)`;
    obj.style.width = `${EN_W}px`;
    obj.style.height = `${EN_H}px`;

    // Screen Projection (Fixed Backticks)
    obj.style.left = `${worldX - cameraX}px`;
  });

  // 5. UPDATE COINS (Added this back so coins move too!)
  document.querySelectorAll(".coin").forEach(obj => {
      const worldX = parseFloat(obj.dataset.worldX) || 0;
      obj.style.left = `${worldX - cameraX}px`;
  });

  checkCollisions();
  checkWin(); 
  requestAnimationFrame(gameLoop);
}

/* ===============================
   8. STARTUP
================================ */
document.querySelectorAll(".coin, .enemy").forEach((obj, index) => {
  let startingPos = parseFloat(getComputedStyle(obj).left);
  if (isNaN(startingPos) || startingPos < 250) {
      startingPos = 700 + (index * 450); 
  }
  obj.dataset.worldX = startingPos;
});

const uiClick = new Audio('assets/sounds/click.wav');
const setupBtn = (id, url) => {
    const el = document.getElementById(id);
    if(el) {
        el.onclick = (e) => {
            e.preventDefault(); 
            uiClick.play().catch(()=>{}); 
            setTimeout(() => { 
                window.location.href = (url === "reload") ? location.href : url; 
            }, 200); 
        };
    }
}
setupBtn("retryBtn", "reload");
setupBtn("shopBtn", "shop.html");
setupBtn("homeBtn", "index.html");     
setupBtn("winHomeBtn", "index.html");  
setupBtn("nextLevelBtn", "planets.html"); 

if (winScreen) winScreen.classList.add("hidden");
if (loseScreen) loseScreen.classList.add("hidden");

setAnimation("idle");
requestAnimationFrame(gameLoop);