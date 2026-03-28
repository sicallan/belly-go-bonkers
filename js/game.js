// ============================================================
// game.js — main game loop, state machine, and spawning logic
// ============================================================
// This is the heart of the game. It:
//   1. Manages game states: 'title', 'playing', 'gameover', 'levelcomplete'
//   2. Runs the game loop (requestAnimationFrame → update → render)
//   3. Spawns obstacles, collectibles, planks, and candy canes
//   4. Handles collisions and scoring
//   5. Manages the Bonkers Mode phases (flash → shake → run)
//   6. Shows HTML overlays for game-over and level-complete screens
//
// Creator Task 1: find requestAnimationFrame below and follow the chain
// to understand how every frame of the game works!
// ============================================================

// ---- Core gameplay constants ----------------------------------------
// Explorer Task 4: change INITIAL_SPEED to make the game faster or slower!
const CONFIG = {
  INITIAL_SPEED:              160,  // world scroll speed at game start (px/second)
  SPEED_RAMP:                 2,    // px/s increase per second (progressive difficulty)
  GROUND_OFFSET:              80,   // pixels from canvas bottom to ground surface
  MAX_BOOST_DURATION:         1,    // seconds the jump key can extend a jump
  OBSTACLE_SPAWN_MIN_GAP:     200,  // minimum px between obstacle spawns (world-space)
  OBSTACLE_SPAWN_RANGE:       150,  // random extra px added to obstacle gap
  COLLECTIBLE_SPAWN_MIN_GAP:  150,  // minimum px between collectible spawns
  COLLECTIBLE_SPAWN_RANGE:    150,  // random extra px added to collectible gap
  PLANK_SPAWN_FRACTION:       0.7,  // first plank spawns at canvas.width * this fraction
  PLANK_SPAWN_MIN_SCREENS:    1.5,  // minimum screens between plank spawns
  PLANK_SPAWN_SCREEN_RANGE:   0.5,  // random extra screens added to plank gap
  SCORE_PER_PIXEL:            0.1,  // score points per pixel of distance travelled
  CANDY_SCORE:                150,  // score awarded for collecting a candy cane
  COLLECT_SCORE:              50,   // score awarded for collecting any other treat
};

const Game = (function () {

  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  // ---- Game state -------------------------------------------------------
  // Current game state: 'title' | 'playing' | 'gameover' | 'levelcomplete'
  let state      = 'title';
  let belly      = null;     // the player character (Belly class instance)
  let scroll     = 0;        // total world distance scrolled (pixels)
  let speed      = CONFIG.INITIAL_SPEED; // current world scroll speed
  let last       = performance.now();    // timestamp of previous frame (ms)

  // Active game objects
  let obstacles    = [];
  let collectibles = [];
  let planks       = [];

  // Scroll positions at which the next entity should be spawned
  let nextPlankScroll       = 0;
  let nextObstacleScroll    = 0;
  let nextCollectibleScroll = 0;
  let nextCandyCaneScroll   = 0;

  // Scoring and level tracking
  let score              = 0;
  let candyCaneCount     = 0;   // candy canes collected toward Bonkers Mode
  let currentLevel       = 1;
  let lostLifeThisLevel  = false; // used to decide perfect-run accessory reward
  let levelCompleteTimer = 0;

  // Bonkers Mode state — phases: null | 'flash' | 'shake' | 'run'
  let bonkersPhase = null;
  let bonkersTimer = 0;
  let savedSpeed   = 0;    // speed before Bonkers Mode started
  let shakeX       = 0;   // random position used during shake phase
  let shakeY       = 0;

  // Invincibility (triggered by Bonkers Mode or the cheat menu)
  let invincible      = false;
  let invincibleTimer = 0;
  let cheatInvincible = false;

  // Accessories equipped for this run (persisted in localStorage)
  let equippedAccessories = JSON.parse(localStorage.getItem('belly_accessories') || '[]');

  // Loads the saved high-score list from localStorage (up to 6 entries).
  function loadRecent() {
    const raw = localStorage.getItem('belly_recent') || '[]';
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  /**
   * Adds a new name+score entry to the recent-scores list, keeps the top 6.
   * @param {string} name  - Player's display name.
   * @param {number} score - Final score to record.
   * @returns {void}
   */
  function saveRecent(name, score) {
    const arr = loadRecent();
    arr.push({ name, score });
    arr.sort((a, b) => b.score - a.score);
    while (arr.length > 6) arr.pop();
    localStorage.setItem('belly_recent', JSON.stringify(arr));
  }

  // Renders the high-score list into the title-screen HTML elements.
  function showRecent() {
    const list   = document.getElementById('scores-list');
    const empty  = document.getElementById('scores-empty');
    const recent = loadRecent();
    list.innerHTML = '';
    const medals = ['🥇','🥈','🥉','🏅','🏅','🏅'];
    const labels = ['1ST','2ND','3RD','4TH','5TH','6TH'];
    if(recent.length === 0){
      if(empty) empty.style.display = 'block';
    } else {
      if(empty) empty.style.display = 'none';
      recent.forEach((s, i) => {
        const li = document.createElement('li');
        li.innerHTML =
          `<span class="score-rank">${medals[i]||'🏅'}</span>`+
          `<span class="score-name">${labels[i]||''} ${(s.name||'ANON').toUpperCase()}</span>`+
          `<span class="score-pts">${s.score.toLocaleString()}</span>`;
        list.appendChild(li);
      });
    }
  }

  // ---- Bonkers Mode configuration --------------------------------------
  // Explorer Task 3: find 'candyCaneRequired' below and change the number!
  // Builder Task 2: copy one of the blocks below to add a new difficulty tier!
  // localStorage key that stores the player's chosen difficulty.
  const BONKERS_MODE_STORAGE_KEY = 'belly_bonkers_mode';
  let bonkersMode = localStorage.getItem(BONKERS_MODE_STORAGE_KEY) || 'normal';
  // Difficulty settings for each Bonkers Mode tier.
  // Each entry controls how many candy canes are needed, how long each
  // phase lasts, and how fast the world moves during the run phase.
  const BONKERS_CONFIGS = { // difficulty settings for each bonkers mode
    easy: {
      candyCaneRequired: 2,
      candyCaneSpawnMin: 550,
      candyCaneSpawnRange: 250,
      flashDuration: 1.5,
      shakeDuration: 1.8,
      runDuration: 4.5,
      invincibleDuration: 1.2,
      speedMultiplier: 2.4,
    },
    normal: {
      candyCaneRequired: 3,
      candyCaneSpawnMin: 700,
      candyCaneSpawnRange: 400,
      flashDuration: 2.0,
      shakeDuration: 2.5,
      runDuration: 5.0,
      invincibleDuration: 1.0,
      speedMultiplier: 3.0,
    },
    hard: {
      candyCaneRequired: 4,
      candyCaneSpawnMin: 900,
      candyCaneSpawnRange: 450,
      flashDuration: 2.1,
      shakeDuration: 2.5,
      runDuration: 6.0,
      invincibleDuration: 1.0,
      speedMultiplier: 3.35,
    },
    chaos: {
      candyCaneRequired: 5,
      candyCaneSpawnMin: 1000,
      candyCaneSpawnRange: 650,
      flashDuration: 2.5,
      shakeDuration: 3.0,
      runDuration: 7.0,
      invincibleDuration: 1.0,
      speedMultiplier: 4.2,
    },
  };

  // Returns true if the given mode string is one of the known difficulty tiers.
  function isValidBonkersMode(mode) {
    return Object.prototype.hasOwnProperty.call(BONKERS_CONFIGS, mode);
  }

  /**
   * Changes the active Bonkers Mode difficulty and persists it.
   * @param {string} mode - One of 'easy', 'normal', 'hard', 'chaos'.
   * @returns {void}
   */
  function setBonkersMode(mode) {
    if(!isValidBonkersMode(mode)) return;
    bonkersMode = mode;
    localStorage.setItem(BONKERS_MODE_STORAGE_KEY, mode);
  }

  // Returns the config object for the currently selected difficulty mode.
  function getBonkersConfig() {
    if(!isValidBonkersMode(bonkersMode)) bonkersMode = 'normal';
    return BONKERS_CONFIGS[bonkersMode] || BONKERS_CONFIGS.normal;
  }

  // Wires up the difficulty <select> on the title screen to setBonkersMode().
  function initBonkersModePicker() {
    const select = document.getElementById('bonkers-mode-select');
    if(!select) return;
    if(!isValidBonkersMode(bonkersMode)) bonkersMode = 'normal';
    select.value = bonkersMode;
    select.addEventListener('change', () => {
      setBonkersMode(select.value);
    });
  }

  // List of cosmetic accessories Belly can unlock through perfect runs.
  // Builder Task 4: add a new object to this array to create a new accessory!
  const ACCESSORIES = [
    { id: 'hat',        emoji: '🎩', name: 'Magic Hat',      desc: 'Tips with style!' },
    { id: 'boots',      emoji: '👢', name: 'Power Boots',    desc: 'Spring in every step!' },
    { id: 'glasses',    emoji: '🕶️',  name: 'Cool Shades',   desc: 'Looking so groovy!' },
    { id: 'pogo-stick', emoji: '🎯', name: 'Pogo Stick',     desc: 'Boing boing boing!' },
    { id: 'coat',       emoji: '🧥', name: 'Fancy Coat',     desc: 'So fashionable!' },
    { id: 'necklace',   emoji: '📿', name: 'Jewel Necklace', desc: 'Bling bling bling!' },
  ];

  /**
   * Resets all game state and starts a new run from the given level.
   * @param {number} [level] - Level to start from (defaults to 1).
   * @returns {void}
   */
  function startGame(level) {
    const bonkersCfg = getBonkersConfig();
    currentLevel       = level || 1;
    state              = 'playing';
    levelCompleteTimer = 0;
    lostLifeThisLevel  = false;

    // Remove any leftover HTML overlay from a previous run.
    const lcBox = document.getElementById('levelcomplete-box');
    if (lcBox) lcBox.remove();

    // Create a fresh Belly and clear all active entities.
    belly        = new exported.Belly(120, 400);
    obstacles    = [];
    collectibles = [];
    planks       = [];
    score        = 0;
    scroll       = 0;
    speed        = CONFIG.INITIAL_SPEED; // Explorer Task 4: CONFIG.INITIAL_SPEED is defined at the top!

    // Levels 3+ are sky/space — no floating planks.
    nextPlankScroll       = currentLevel >= 3 ? Infinity : canvas.width * CONFIG.PLANK_SPAWN_FRACTION;
    nextObstacleScroll    = CONFIG.OBSTACLE_SPAWN_MIN_GAP;
    nextCollectibleScroll = CONFIG.COLLECTIBLE_SPAWN_MIN_GAP / 2;

    // Reset Bonkers Mode state.
    candyCaneCount  = 0;
    bonkersPhase    = null;
    bonkersTimer    = 0;
    invincible      = false;
    invincibleTimer = 0;
    nextCandyCaneScroll = bonkersCfg.candyCaneSpawnMin + Math.random() * bonkersCfg.candyCaneSpawnRange;

    // Level 4 uses jetpack physics instead of normal jump.
    belly.hasJetpack = (currentLevel === 4);

    setTitleVisible(false);

    // Start the correct music track for this level.
    Assets.stopMusic(); // also resets tempo if Bonkers was active
    if      (currentLevel === 6) Assets.startPortalMusic();
    else if (currentLevel === 5) Assets.startHandbagMusic();
    else if (currentLevel === 4) Assets.startSpaceMusic();
    else if (currentLevel === 3) Assets.startSkyMusic();
    else                         Assets.startMusic();

    // Position Belly at the correct height for this level.
    const groundTopY = canvas.height - CONFIG.GROUND_OFFSET;
    if (currentLevel === 4) {
      // Space level: Belly floats freely with no gravity snap.
      belly.y      = canvas.height / 2 - belly.height / 2;
      belly.groundY = canvas.height + 1000; // effectively disable ground snap
    } else {
      belly.y      = groundTopY - belly.height;
      belly.groundY = groundTopY - belly.height;
    }
  }

  // Shorthand accessors for key DOM elements.
  const ui     = () => document.getElementById('ui');
  const exitBtn = () => document.getElementById('exit-button');

  /**
   * Shows or hides the title-screen HTML overlay and the in-game exit button.
   * @param {boolean} visible - true to show the title screen, false to hide it.
   * @returns {void}
   */
  function setTitleVisible(visible) {
    const el = ui();
    if (!el) return;
    el.style.display = visible ? 'flex' : 'none';

    const eb = exitBtn();
    if (eb) eb.style.display = visible ? 'none' : 'block';

    const lcBox = document.getElementById('levelcomplete-box');
    if (lcBox) lcBox.remove();

    if (visible) {
      Assets.stopMusic();
      // Reset accessories so each run starts fresh (they are re-earned each time).
      equippedAccessories = [];
      localStorage.removeItem('belly_accessories');
    }
  }
  
  // Returns the Y coordinate of the top surface of the ground.
  function groundTop() { return canvas.height - CONFIG.GROUND_OFFSET; }

  // Resizes the canvas to fill the window and repositions all entities accordingly.
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const groundTop = canvas.height - CONFIG.GROUND_OFFSET;
    // if belly exists, reposition for current level
    if(belly){
      belly.x = 120;
      if(currentLevel === 4){
        belly.groundY = canvas.height + 1000;
        // y stays where it was — belly floats in space
      } else {
        belly.y = groundTop - belly.height;
        belly.groundY = groundTop - belly.height;
      }
    }
    // Reposition existing obstacles/collectibles to the new ground height.
    for (const o of obstacles)    { o.y = groundTop - o.h; }
    for (const c of collectibles) { c.y = groundTop - 40;  }
  }

  // Spawns a randomly-chosen obstacle for the current level just off the right edge.
  // Builder Task 5: add a new kind name to one of the kindsByLevel arrays below!
  function spawnObstacle() {
    const x = canvas.width + scroll + 80 + Math.random()*200;
    const kindsByLevel = {
      1: ['toy-small','toy-large','toy-ball','rattle','bicycle','blocks','toy-car','dinosaur'],
      2: ['ant','worm','roman-pot','boulder','clock'],
      3: ['bird','balloon','plane','hot-air-balloon','blimp'],
      4: ['alien','alien-ship','comet','meteorite','rocket'],
      5: ['lipstick','receipt','chewing-gum','nail-varnish','bank-card','keys'],
      6: ['zombie','dancing-skeleton','rat','white-ghost','angry-pumpkin','dragon'],
    };
    const kinds = kindsByLevel[currentLevel] || kindsByLevel[1];
    const kind = kinds[Math.floor(Math.random()*kinds.length)];
    const o = new exported.Obstacle(x, 0, kind);
    if(currentLevel === 3){
      // ~65% sit right on the cloud floor (Belly must jump); ~35% hover a bit higher
      const lift = Math.random() < 0.65 ? 0 : 50 + Math.random() * 70;
      o.y = groundTop() - o.h - lift;
    } else if(currentLevel === 4){
      // space obstacles float freely with sinusoidal drift
      const safeY = 80 + Math.random() * (canvas.height - 200);
      o.y = safeY;
      o.baseY = safeY;
      o.floatTimer = Math.random() * 6.28;
      o.floatAmp = 20 + Math.random() * 30;
      o.floatSpeed = 0.8 + Math.random() * 0.8;
    } else if(currentLevel === 5){
      const lift5 = (o.kind==='receipt'||o.kind==='chewing-gum')&&Math.random()<0.3?20+Math.random()*30:0;
      o.y = groundTop() - o.h - lift5;
      if(o.kind==='keys') o.swing = Math.random() * 6.28;
    } else if(currentLevel === 6){
      const ghostLift = o.kind === 'white-ghost' ? 50 + Math.random() * 110 : 0;
      const dragonLift = o.kind === 'dragon' ? 35 + Math.random() * 70 : 0;
      const randomLift = (o.kind === 'zombie' || o.kind === 'dancing-skeleton') ? Math.random() * 10 : 0;
      o.y = groundTop() - o.h - ghostLift - dragonLift - randomLift;
      if(o.kind === 'white-ghost'){
        o.baseY = o.y;
        o.floatTimer = Math.random() * 6.28;
        o.floatAmp = 18 + Math.random() * 22;
        o.floatSpeed = 1.0 + Math.random() * 0.8;
      }
      if(o.kind === 'dragon') o.flapTimer = Math.random() * 6.28;
    } else {
      o.y = groundTop() - o.h;
    }
    obstacles.push(o);
  }
  // Spawns a randomly-chosen collectible treat just off the right edge.
  // Builder Task 1: add your new kind name to the 'kinds' array below!
  function spawnCollectible() {
    const x = canvas.width + scroll + 100 + Math.random()*300;
    const kinds = ['donut','pizza','icecream','lollipop','hotdog','cupcake','candybar','milkshake'];
    const kind = kinds[Math.floor(Math.random()*kinds.length)];
    const cy = currentLevel === 4
      ? 80 + Math.random() * (canvas.height - 200)
      : groundTop() - 60;
    collectibles.push(new exported.Collectible(x, cy, kind));
  }

  // Spawns a floating plank platform with two collectibles on top.
  function spawnPlank() {
    const w = 150 + Math.random() * 100;
    const x = canvas.width + scroll + 80;
    const y = groundTop() - 90 - Math.random() * 40;
    const p = new exported.Plank(x, y, w);
    planks.push(p);
    // double food on top of plank
    const kinds = ['donut','pizza','icecream','lollipop','hotdog','cupcake','candybar','milkshake'];
    const k1 = kinds[Math.floor(Math.random()*kinds.length)];
    const k2 = kinds[Math.floor(Math.random()*kinds.length)];
    collectibles.push(new exported.Collectible(x + w * 0.3, y - 32, k1));
    collectibles.push(new exported.Collectible(x + w * 0.7, y - 32, k2));
  }

  // Spawns a special candy cane collectible that progresses Bonkers Mode.
  function spawnCandyCane() {
    const x = canvas.width + scroll + 80;
    collectibles.push(new exported.Collectible(x, groundTop() - 68, 'candy-cane'));
  }

  // Kicks off the Bonkers Mode sequence starting with the flash phase.
  function startBonkers() {
    bonkersPhase = 'flash';
    bonkersTimer = 0;
    Assets.startBonkersAudio();
  }

  // Player name entered on the game-over screen (used when saving the score).
  let gameOverName = '';

  // Shows the game-over HTML overlay with a name input and score save button.
  function showGameOver() {
    state = 'gameover';
    // ask for name using a non-blocking overlay (HTML input)
    const existing = document.getElementById('gameover-box');
    if(existing) existing.remove();
    const box = document.createElement('div');
    box.id = 'gameover-box';
    box.innerHTML = `
      <h2>Game Over!</h2>
      <p>Your score: <strong>${score}</strong></p>
      <label>Your name:<br>
        <input id='go-name' maxlength='20' value='' placeholder='Enter your name' autocomplete='off'>
      </label>
      <div class='go-btns'>
        <button id='go-save'>Save &amp; Play Again</button>
        <button id='go-title'>Title Screen</button>
      </div>`;
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(255,255,255,0.97);padding:24px 32px;border-radius:16px;text-align:center;min-width:280px;box-shadow:0 8px 32px rgba(0,0,0,0.18);font-family:inherit';
    box.querySelector('h2').style.cssText='color:#ff5da2;font-size:32px;margin-bottom:8px';
    box.querySelector('input').style.cssText='margin-top:4px;padding:6px 10px;border-radius:6px;border:2px solid #ffb6d5;font-size:16px;width:100%;box-sizing:border-box';
    box.querySelector('.go-btns').style.cssText='margin-top:14px;display:flex;gap:10px;justify-content:center';
    ['go-save','go-title'].forEach(id=>{
      const btn = box.querySelector('#'+id);
      btn.style.cssText='padding:8px 18px;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;background:#ff5da2;color:#fff';
    });
    document.body.appendChild(box);
    setTimeout(()=>box.querySelector('#go-name').focus(), 50);
    box.querySelector('#go-name').addEventListener('keydown', e=>{
      if(e.code==='Enter') box.querySelector('#go-save').click();
    });
    box.querySelector('#go-save').addEventListener('click', ()=>{
      gameOverName = box.querySelector('#go-name').value.trim();
      if(gameOverName) { saveRecent(gameOverName, score); showRecent(); }
      box.remove();
      startGame();
    });
    box.querySelector('#go-title').addEventListener('click', ()=>{
      gameOverName = box.querySelector('#go-name').value.trim();
      if(gameOverName) { saveRecent(gameOverName, score); showRecent(); }
      box.remove();
      state = 'title'; setTitleVisible(true);
    });
  }

  // ---- Secret level picker ------------------------------------------
  // Type 'belly' on the title screen to open a hidden level-select menu.
  let secretBuffer   = '';
  const SECRET_CODE  = 'belly';

  // Shows the hidden level-picker overlay (unlocked by typing the secret code).
  function showLevelPicker() {
    const existing = document.getElementById('level-picker-box');
    if(existing) existing.remove();
    const box = document.createElement('div');
    box.id = 'level-picker-box';
    box.style.cssText = [
      'position:fixed','left:50%','top:50%','transform:translate(-50%,-50%)',
      'z-index:9999','background:rgba(255,255,255,0.97)','padding:28px 36px',
      'border-radius:20px','text-align:center','min-width:300px',
      'box-shadow:0 8px 40px rgba(0,0,0,0.22)','font-family:inherit',
    ].join(';');
    box.innerHTML = `
      <h2 style="color:#ff5da2;font-size:28px;margin:0 0 6px">🐣 Secret Menu</h2>
      <p style="color:#888;font-size:14px;margin:0 0 20px">Jump to any level</p>
      <div id="lp-btns" style="display:flex;flex-direction:column;gap:10px">
        <button data-level="2" style="background:#3a2a8a;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">🦇 Level 2 — Underground Cave</button>
        <button data-level="3" style="background:#1a5090;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">🌤️ Level 3 — Sky</button>
        <button data-level="4" style="background:#080820;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">🚀 Level 4 — Space</button>
        <button data-level="5" style="background:#3a1a08;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">👜 Level 5 — Mum's Handbag</button>
        <button data-level="6" style="background:#3d1455;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">🌀 Level 6 — Strange Portal World</button>
        <button id="lp-invincible" style="background:#ff5da2;color:#fff;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">🛡️ Invincible Mode: OFF</button>
        <button id="lp-accessories" style="background:#ffe200;color:#333;padding:12px 24px;border:none;border-radius:10px;font-size:17px;font-weight:700;cursor:pointer">✨ Unlock All Accessories</button>
        <button id="lp-cancel" style="background:#eee;color:#666;padding:10px 24px;border:none;border-radius:10px;font-size:15px;cursor:pointer">Cancel</button>
      </div>`;
    document.body.appendChild(box);
    box.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => { box.remove(); startGame(Number(btn.dataset.level)); });
      btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.85'; });
      btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; });
    });
    const invBtn = box.querySelector('#lp-invincible');
    function updateInvBtn(){ invBtn.textContent = '🛡️ Invincible Mode: ' + (cheatInvincible ? 'ON' : 'OFF'); invBtn.style.background = cheatInvincible ? '#cc2266' : '#ff5da2'; }
    updateInvBtn();
    invBtn.addEventListener('click', () => { cheatInvincible = !cheatInvincible; updateInvBtn(); });
    invBtn.addEventListener('mouseenter', () => { invBtn.style.opacity = '0.85'; });
    invBtn.addEventListener('mouseleave', () => { invBtn.style.opacity = '1'; });
    const accBtn = box.querySelector('#lp-accessories');
    accBtn.addEventListener('click', () => {
      equippedAccessories = ACCESSORIES.map(a => a.id);
      localStorage.setItem('belly_accessories', JSON.stringify(equippedAccessories));
      accBtn.textContent = '✅ All Accessories Unlocked!';
      accBtn.style.background = '#88cc44';
    });
    accBtn.addEventListener('mouseenter', () => { accBtn.style.opacity = '0.85'; });
    accBtn.addEventListener('mouseleave', () => { accBtn.style.opacity = '1'; });
    box.querySelector('#lp-cancel').addEventListener('click', () => box.remove());
    // close on Escape
    function onEsc(e){ if(e.code==='Escape'){ box.remove(); window.removeEventListener('keydown', onEsc); } }
    window.addEventListener('keydown', onEsc);
  }

  // Sets up all event listeners and starts the game loop.
  // Called once when the page finishes loading.
  function init() {
    Input.bind();
    Assets.loadAll(()=>{});
    initBonkersModePicker();
    showRecent();
    setTitleVisible(true);
    Input.onTap(()=>{ if(state==='title') startGame(); });
    document.getElementById('start-btn').addEventListener('click', ()=>{ if(state==='title') startGame(); });
    window.addEventListener('keydown', e=>{
      // accumulate secret code letters on title screen
      if(state==='title' && e.key && e.key.length===1){
        secretBuffer = (secretBuffer + e.key.toLowerCase()).slice(-SECRET_CODE.length);
        if(secretBuffer === SECRET_CODE){ secretBuffer = ''; showLevelPicker(); return; }
      }
      if((state==='title') && e.code==='Space'){ e.preventDefault(); startGame(); return; }
      if(state==='playing'){
        if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); if(currentLevel !== 4) belly.jump(); Assets.playJump(); }
        if(e.code==='Escape'){ state='title'; showRecent(); setTitleVisible(true); const box=document.getElementById('gameover-box'); if(box) box.remove(); }
      }
      if(state==='gameover' && e.code==='Escape'){
        const box=document.getElementById('gameover-box'); if(box) box.remove();
        state='title'; showRecent(); setTitleVisible(true);
      }
      if(state==='levelcomplete' && e.code==='Escape'){
        const box=document.getElementById('levelcomplete-box'); if(box) box.remove();
        state='title'; showRecent(); setTitleVisible(true);
      }
    });
    const soundToggle = document.getElementById('sound-toggle');
    function updateSoundButton(){ soundToggle.textContent = Assets.isMuted() ? '🔇' : '🔊'; soundToggle.setAttribute('aria-pressed', Assets.isMuted() ? 'true' : 'false'); }
    soundToggle.addEventListener('click', ()=>{ Assets.setMuted(!Assets.isMuted()); updateSoundButton(); });
    updateSoundButton();
    exitBtn().addEventListener('click', ()=>{ const box=document.getElementById('gameover-box'); if(box) box.remove(); state='title'; showRecent(); setTitleVisible(true); });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(loop);
  }

  /**
   * The main game loop — called by requestAnimationFrame ~60 times per second.
   * Creator Task 1: this is where the game loop chain starts!
   * Sequence each frame: calculate dt → update → render.
   * @param {number} t - Current timestamp in milliseconds (provided by the browser).
   * @returns {void}
   */
  function loop(t) {
    requestAnimationFrame(loop); // schedule the next frame immediately

    // dt = time since last frame in seconds. Capped at 50ms to prevent
    // huge jumps if the tab was hidden or the device paused.
    const dt = Math.min(50, t - last) / 1000;
    last = t;

    if (state === 'playing')       update(dt);
    if (state === 'levelcomplete') levelCompleteTimer += dt;

    render();
  }

  /**
   * Advances the game world by one frame.
   * Handles Bonkers phases, physics, spawning, movement, and collisions.
   * @param {number} dt - Seconds since last frame.
   * @returns {void}
   */
  function update(dt) {
    const bonkersCfg = getBonkersConfig();
    // cheat: keep invincible flag permanently on if enabled
    if(cheatInvincible) invincible = true;
    // --- bonkers intro phases: freeze scroll during flash/shake ---
    if(bonkersPhase === 'flash'){
      bonkersTimer += dt;
      if(bonkersTimer >= bonkersCfg.flashDuration){ bonkersPhase = 'shake'; bonkersTimer = 0; belly.bonkersScale = 2; }
      return;
    }
    if(bonkersPhase === 'shake'){
      bonkersTimer += dt;
      shakeX = 60 + Math.random() * (canvas.width - 180);
      shakeY = 40 + Math.random() * (canvas.height - 200);
      if(bonkersTimer >= bonkersCfg.shakeDuration){
        bonkersPhase = 'run'; bonkersTimer = 0;
        belly.x = 120;
        belly.y = currentLevel === 4 ? canvas.height / 2 - belly.height / 2 : groundTop() - belly.height;
        belly.vy = 0;
        belly.onGround = currentLevel !== 4;
        savedSpeed = speed; speed = speed * bonkersCfg.speedMultiplier;
        invincible = true; invincibleTimer = 0;
        belly.bonkersJump = true;
      }
      return;
    }
    if(bonkersPhase === 'run'){
      bonkersTimer += dt;
      if(!cheatInvincible && invincible){ invincibleTimer += dt; if(invincibleTimer >= bonkersCfg.invincibleDuration) invincible = false; }
      if(bonkersTimer >= bonkersCfg.runDuration){ bonkersPhase = null; belly.bonkersScale = 1; speed = savedSpeed; if(!cheatInvincible) invincible = false; belly.bonkersJump = false; showLevelComplete(); return; }
    }
    // Move the world forward and award distance-based score.
    const move = speed * dt;
    scroll += move;
    score  += Math.floor(move * CONFIG.SCORE_PER_PIXEL);

    // Gradually ramp up speed for progressive difficulty.
    speed += dt * CONFIG.SPEED_RAMP;
    // update belly physics
    if(currentLevel === 4){
      // === LEVEL 4: JETPACK PHYSICS ===
      belly.update(dt, 0.22, []);
      const thrustHeld = Input.isDown('ArrowUp') || Input.isDown('Space');
      if(thrustHeld) belly.vy -= 0.38;
      // clamp vertical velocity
      belly.vy = Math.max(-10, Math.min(8, belly.vy));
      // floor hit → damage + bounce
      if(belly.y + belly.height >= groundTop() - 10){
        belly.y = groundTop() - belly.height - 10;
        belly.vy = -4;
        if(!invincible){
          belly.lives--;
          lostLifeThisLevel = true;
          Assets.playHurt();
          if(belly.lives <= 0){ showGameOver(); return; }
        }
      }
      // ceiling hit → damage
      if(belly.y <= 4){
        belly.y = 4;
        belly.vy = 2;
        if(!invincible){
          belly.lives--;
          lostLifeThisLevel = true;
          Assets.playHurt();
          if(belly.lives <= 0){ showGameOver(); return; }
        }
      }
    } else {
      belly.update(dt, 0.6, planks);
      // apply jump boost while key held
      const jumpHeld = Input.isDown('ArrowUp') || Input.isDown('Space');
      if (jumpHeld) belly.boost(dt, CONFIG.MAX_BOOST_DURATION);
      else          belly.stopBoost();
    }
    // advance belly animation timer
    if(belly.animTime === undefined) belly.animTime = 0;
    belly.animTime += dt;
    // touch swipe jump
    if(Input.isDown('SwipeUp')){ belly.jump(); Assets.playJump(); }
    // Spawn obstacles, collectibles, planks and candy canes at regular intervals.
    if (scroll >= nextObstacleScroll) {
      spawnObstacle();
      nextObstacleScroll = scroll + CONFIG.OBSTACLE_SPAWN_MIN_GAP + Math.random() * CONFIG.OBSTACLE_SPAWN_RANGE;
    }
    if (scroll >= nextCollectibleScroll) {
      spawnCollectible();
      nextCollectibleScroll = scroll + CONFIG.COLLECTIBLE_SPAWN_MIN_GAP + Math.random() * CONFIG.COLLECTIBLE_SPAWN_RANGE;
    }
    if (scroll >= nextPlankScroll) {
      spawnPlank();
      nextPlankScroll = scroll + canvas.width * (CONFIG.PLANK_SPAWN_MIN_SCREENS + Math.random() * CONFIG.PLANK_SPAWN_SCREEN_RANGE);
    }
    // candy cane spawn (rare — every 700–1100px)
    if(scroll >= nextCandyCaneScroll){
      spawnCandyCane();
      nextCandyCaneScroll = scroll + bonkersCfg.candyCaneSpawnMin + Math.random() * bonkersCfg.candyCaneSpawnRange;
    }
    // move obstacles/collectibles/planks
    for(let o of obstacles){
      o.x -= move;
      // ants run toward belly at extra speed
      if((o.kind === 'ant' || o.kind === 'rat') && o.extraSpeed) o.x -= o.extraSpeed * dt;
      // tick wriggle animation for ants and worms
      if(o.wriggleTimer !== undefined) o.wriggleTimer += dt;
      // bird wing flap
      if(o.flapTimer !== undefined) o.flapTimer += dt;
      // meteorite spin
      if(o.kind === 'meteorite') o.spin = (o.spin || 0) + dt * 1.8;
      // L4 floating drift (sinusoidal vertical movement)
      if(o.floatTimer !== undefined){
        o.floatTimer += dt;
        o.y = o.baseY + Math.sin(o.floatTimer * o.floatSpeed) * o.floatAmp;
      }
      // L5 keys pendulum swing
      if(o.swing !== undefined) o.swing += dt * 2.5;
    }
    for(let c of collectibles){ c.x -= move; }
    for(let p of planks){ p.x -= move; }
    planks = planks.filter(p => p.x + p.w > -50);
    // collisions
    for(let i=obstacles.length-1;i>=0;i--){
      if(exported.aabb(belly.hitBox(), obstacles[i].hitBox())){
        if(invincible){ obstacles.splice(i,1); continue; }
        obstacles.splice(i,1);
        belly.lives--;
        lostLifeThisLevel = true;
        Assets.playHurt();
        if(belly.lives<=0){
          showGameOver();
        }
      }
    }
    for(let i=collectibles.length-1;i>=0;i--){
      if(exported.aabb(belly.hitBox(), collectibles[i].hitBox())){
        const cKind = collectibles[i].kind;
        collectibles.splice(i,1);
        Assets.playCollect();
        if (cKind === 'candy-cane') {
          score += CONFIG.CANDY_SCORE;
          candyCaneCount++;
          if (candyCaneCount >= bonkersCfg.candyCaneRequired) {
            candyCaneCount = 0;
            startBonkers();
          }
        } else {
          score += CONFIG.COLLECT_SCORE;
          belly.collect++;
        }
      }
    }
    // cleanup offscreen
    obstacles = obstacles.filter(o=>o.x+o.w > -100);
    collectibles = collectibles.filter(c=>c.x+c.r > -100);
  }

  /**
   * Draws the current frame — called every loop() tick regardless of state.
   * Creator Task 1: this is the 'draw' step at the end of the game loop chain.
   * @returns {void}
   */
  function render() {
    const bonkersCfg = getBonkersConfig();
    const inBonkers  = bonkersPhase === 'run';

    Renderer.clear();
    Renderer.drawBackground(scroll, currentLevel);

    // Draw floating platforms before Belly so she appears on top.
    for (const p of planks) Renderer.drawPlank(p);

    // On the title screen, dim the canvas so the HTML overlay reads clearly.
    if (state === 'title') {
      Renderer.ctx.fillStyle = 'rgba(255,255,255,0.6)';
      Renderer.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw Belly — teleported to a random shake position during the shake phase.
    if (belly && bonkersPhase === 'shake') {
      Renderer.drawBelly(belly, shakeX, shakeY, false, equippedAccessories);
    } else if (belly) {
      Renderer.drawBelly(belly, undefined, undefined, invincible, equippedAccessories);
    }

    // Draw all active obstacles and collectibles.
    for (const o of obstacles)    Renderer.drawObstacle(o, inBonkers);
    for (const c of collectibles) Renderer.drawCollectible(c, inBonkers);

    // Draw the HUD (score, lives, candy-cane bar).
    if (belly) {
      Renderer.drawHUD(
        score, belly.lives, candyCaneCount,
        bonkersCfg.candyCaneRequired, invincible,
        currentLevel, !lostLifeThisLevel
      );
    }

    // Draw Bonkers Mode visual effects on top of everything else.
    if      (bonkersPhase === 'flash')                  Renderer.drawBonkersFlash(bonkersTimer);
    else if (bonkersPhase === 'shake')                  Renderer.drawBonkersShake(bonkersTimer);
    else if (bonkersPhase === 'run' && state === 'playing') Renderer.drawBonkersRunLines();

    if (state === 'levelcomplete') Renderer.drawLevelComplete(levelCompleteTimer, currentLevel);
  }

  // Returns the current state of the accessory reward system for overlay rendering.
  function getAccessoryRewardState() {
    const available = ACCESSORIES.filter(a => !equippedAccessories.includes(a.id));
    const perfectRun = !lostLifeThisLevel;
    return {
      available,
      perfectRun,
      canChoose: perfectRun && available.length > 0,
    };
  }

  /**
   * Adds an accessory to the equipped list and persists it in localStorage.
   * @param {string} id - Accessory id to award (e.g. 'hat').
   * @returns {void}
   */
  function awardAccessory(id) {
    if(!id || equippedAccessories.includes(id)) return;
    equippedAccessories.push(id);
    localStorage.setItem('belly_accessories', JSON.stringify(equippedAccessories));
  }

  /**
   * Builds the HTML string for the accessory-selection grid.
   * @param {boolean} perfectRun - Whether the run was perfect (no lives lost).
   * @returns {string} HTML markup for the grid.
   */
  function buildAccessoryGridHtml(perfectRun) {
    let html = '<div class="accessory-grid">';
    ACCESSORIES.forEach(acc => {
      const eq = equippedAccessories.includes(acc.id);
      const blocked = !perfectRun;
      html += `<div class="accessory-card${eq || blocked ? ' equipped' : ''}" data-id="${acc.id}" tabindex="${eq || blocked ? '-1' : '0'}" role="button">` +
        `<div class="acc-emoji">${acc.emoji}</div>` +
        `<div class="acc-name">${acc.name}</div>` +
        `<div class="acc-desc">${acc.desc}</div>` +
        `${eq ? '<div class="acc-badge">✓ On!</div>' : (blocked ? '<div class="acc-badge">✕ Perfect run required</div>' : '')}` +
      `</div>`;
    });
    html += '</div>';
    return html;
  }

  /**
   * Shows the between-levels reward overlay for levels 1–4.
   * @param {Object} cfg - Configuration for this transition:
   *   title, subtitlePerfect, subtitleMissed, subtitleAllUnlocked,
   *   extraHint, nextLabel, onNext (callback to start next level).
   * @returns {void}
   */
  function openTransitionRewardBox(cfg) {
    const { available, perfectRun, canChoose } = getAccessoryRewardState();
    const existing = document.getElementById('levelcomplete-box');
    if(existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'levelcomplete-box';
    const subtitle = canChoose
      ? cfg.subtitlePerfect
      : (perfectRun ? cfg.subtitleAllUnlocked : cfg.subtitleMissed);
    let html = `
      <div class="lc-header">
        <h2 class="lc-title">${cfg.title}</h2>
        <p class="lc-subtitle">${subtitle}</p>
      </div>
      <p class="lc-score-line">Score so far: <strong>${score.toLocaleString()}</strong></p>
      ${cfg.extraHint ? `<p class="lc-hint">${cfg.extraHint}</p>` : ''}
      ${buildAccessoryGridHtml(perfectRun)}`;

    if(canChoose){
      html += `<p class="lc-hint">👆 Perfect run reward: pick one accessory to continue!</p>`;
    } else if(!perfectRun){
      html += `<p class="lc-hint">No life lost = accessory reward.</p>`;
      html += `<button class="lc-btn" id="lc-go-btn">${cfg.nextLabel}</button>`;
    } else {
      html += `<div class="lc-all-done">⭐ All accessories unlocked! ⭐</div>`;
      html += `<button class="lc-btn" id="lc-go-btn">${cfg.nextLabel}</button>`;
    }

    html += `<div class="lc-done-btns"><button id="lc-title-btn">🏠 Title Screen</button></div>`;
    box.innerHTML = html;
    document.body.appendChild(box);

    box.querySelectorAll('.accessory-card:not(.equipped)').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        awardAccessory(id);
        box.remove();
        cfg.onNext();
      });
      card.addEventListener('keydown', e => {
        if(e.code === 'Enter' || e.code === 'Space'){
          e.preventDefault();
          card.click();
        }
      });
    });

    const goBtn = box.querySelector('#lc-go-btn');
    if(goBtn) goBtn.addEventListener('click', () => { box.remove(); cfg.onNext(); });
    box.querySelector('#lc-title-btn').addEventListener('click', () => {
      box.remove();
      state = 'title';
      showRecent();
      setTitleVisible(true);
    });
  }

  // Shows the level-5 completion screen with portal-unlock mechanic.
  function openFinalLevelBox() {
    const { available, perfectRun, canChoose } = getAccessoryRewardState();
    const existing = document.getElementById('levelcomplete-box');
    if(existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'levelcomplete-box';
    const subtitle = canChoose
      ? 'Belly escaped Mum\'s handbag! Perfect run reward: pick one accessory!'
      : (perfectRun ? 'Belly escaped Mum\'s handbag! All accessory rewards already claimed!' : 'Belly escaped Mum\'s handbag! No accessory reward this time (perfect run needed).');

    box.innerHTML = `
      <div class="lc-header">
        <h2 class="lc-title">👜 MISSION COMPLETE! 👜</h2>
        <p class="lc-subtitle">${subtitle}</p>
      </div>
      <p class="lc-score-line">Final Score: <strong>${score.toLocaleString()}</strong></p>
      ${buildAccessoryGridHtml(perfectRun)}
      <p class="lc-hint" id="final-reward-hint">${canChoose ? '👆 Pick your final perfect-run accessory reward!' : (perfectRun ? 'Perfect run complete.' : 'No life lost = accessory reward.')}</p>
      <div id="portal-status"></div>
      <div class="lc-done-btns">
        <button id="lc-save-btn">🔄 Play Again</button>
        <button id="lc-title-btn">🏠 Title Screen</button>
      </div>`;
    document.body.appendChild(box);

    let rewardClaimed = false;

    function updatePortalStatus(){
      const portal = box.querySelector('#portal-status');
      const activated = equippedAccessories.length >= 5;
      if(activated){
        box.querySelector('.accessory-grid') && (box.querySelector('.accessory-grid').style.display = 'none');
        box.querySelector('#final-reward-hint') && (box.querySelector('#final-reward-hint').style.display = 'none');
        portal.innerHTML = `
          <div class="portal-banner">PORTAL ACTIVATED</div>
          <div class="minecraft-portal" aria-hidden="true"><div class="portal-ring" style="--rd:0s"></div><div class="portal-ring" style="--rd:0.5s"></div><div class="portal-ring" style="--rd:1s"></div><div class="portal-ring" style="--rd:1.5s"></div><div class="portal-core"></div></div>
          <p class="portal-hint">Collecting 5 perfect-run accessories has opened a mystery portal!</p>
          <button class="lc-btn" id="portal-enter-btn">🌀 Enter Portal (Level 6)</button>`;
        const portalBtn = portal.querySelector('#portal-enter-btn');
        if(portalBtn){
          portalBtn.addEventListener('click', () => {
            box.remove();
            startGame(6);
          });
        }
      } else {
        portal.innerHTML = `<p class="portal-hint">Portal progress: <strong>${Math.min(5, equippedAccessories.length)}/5</strong> accessories.</p>`;
      }
    }

    if(canChoose){
      box.querySelectorAll('.accessory-card:not(.equipped)').forEach(card => {
        card.addEventListener('click', () => {
          if(rewardClaimed) return;
          rewardClaimed = true;
          const id = card.getAttribute('data-id');
          awardAccessory(id);
          card.classList.add('equipped');
          const badge = document.createElement('div');
          badge.className = 'acc-badge';
          badge.textContent = '✓ Collected!';
          card.appendChild(badge);
          box.querySelectorAll('.accessory-card:not(.equipped)').forEach(other => {
            other.classList.add('equipped');
            other.setAttribute('tabindex', '-1');
          });
          const rewardHint = box.querySelector('#final-reward-hint');
          rewardHint.textContent = 'Perfect reward claimed!';
          updatePortalStatus();
        });
        card.addEventListener('keydown', e => {
          if(e.code === 'Enter' || e.code === 'Space'){
            e.preventDefault();
            card.click();
          }
        });
      });
    }

    updatePortalStatus();

    box.querySelector('#lc-save-btn').addEventListener('click', () => {
      box.remove();
      startGame(1);
    });
    box.querySelector('#lc-title-btn').addEventListener('click', () => {
      box.remove();
      state = 'title';
      showRecent();
      setTitleVisible(true);
    });
  }

  // Transitions the game to the 'levelcomplete' state and shows the correct overlay.
  function showLevelComplete() {
    state = 'levelcomplete';
    levelCompleteTimer = 0;
    Assets.stopMusic();
    Assets.playVictory();

    if(currentLevel === 6){
      setTimeout(() => {
        const existing = document.getElementById('levelcomplete-box');
        if(existing) existing.remove();
        const box = document.createElement('div');
        box.id = 'levelcomplete-box';
        box.innerHTML = `
          <div class="lc-header">
            <h2 class="lc-title">🌀 BONUS WORLD CLEARED! 🌀</h2>
            <p class="lc-subtitle">You survived the strange world beyond the portal!</p>
          </div>
          <p class="lc-score-line">Final Score: <strong>${score.toLocaleString()}</strong></p>
          <div class="lc-done-btns">
            <button id="lc-save-btn">🔄 Play Again</button>
            <button id="lc-title-btn">🏠 Title Screen</button>
          </div>`;
        document.body.appendChild(box);
        box.querySelector('#lc-save-btn').addEventListener('click', () => {
          box.remove();
          startGame(1);
        });
        box.querySelector('#lc-title-btn').addEventListener('click', () => {
          box.remove();
          state = 'title';
          showRecent();
          setTitleVisible(true);
        });
      }, 900);
      return;
    }

    if(currentLevel === 5){
      setTimeout(() => { openFinalLevelBox(); }, 900);
      return;
    }

    if(currentLevel === 4){
      setTimeout(() => {
        openTransitionRewardBox({
          title: '🚀 SPACE CLEARED! 🚀',
          subtitlePerfect: 'Perfect run! Pick an accessory, then dive into Mum\'s handbag!',
          subtitleMissed: 'Space cleared, but no accessory reward this time. Perfect run needed!',
          subtitleAllUnlocked: 'Perfect run! All accessory rewards already claimed. Into the bag!',
          extraHint: '👜 Dodge lipstick, gum, keys and more!',
          nextLabel: '👜 Into the Bag!',
          onNext: () => startGame(5),
        });
      }, 900);
      return;
    }

    if(currentLevel === 3){
      setTimeout(() => {
        openTransitionRewardBox({
          title: '🌙 SKY CLEARED! 🌙',
          subtitlePerfect: 'Perfect run! Pick an accessory, then blast off to SPACE!',
          subtitleMissed: 'Sky cleared, but no accessory reward this time. Perfect run needed!',
          subtitleAllUnlocked: 'Perfect run! All accessory rewards already claimed. Blast off!',
          extraHint: '🎒 Jetpack engaged in space — hold UP to thrust!',
          nextLabel: '🚀 BLAST OFF!',
          onNext: () => startGame(4),
        });
      }, 900);
      return;
    }

    if(currentLevel === 2){
      setTimeout(() => {
        openTransitionRewardBox({
          title: '🦇 CAVE CLEARED! 🦇',
          subtitlePerfect: 'Perfect run! Pick an accessory, then fly through the sky!',
          subtitleMissed: 'Cave cleared, but no accessory reward this time. Perfect run needed!',
          subtitleAllUnlocked: 'Perfect run! All accessory rewards already claimed. Into the sky!',
          extraHint: '',
          nextLabel: '🌤️ INTO THE SKY!',
          onNext: () => startGame(3),
        });
      }, 900);
      return;
    }

    setTimeout(() => {
      openTransitionRewardBox({
        title: '🎉 LEVEL 1 COMPLETE! 🎉',
        subtitlePerfect: 'Perfect run! Pick an accessory then head underground!',
        subtitleMissed: 'Level cleared, but no accessory reward this time. Perfect run needed!',
        subtitleAllUnlocked: 'Perfect run! All accessory rewards already claimed. Time for Level 2!',
        extraHint: '',
        nextLabel: '► INTO THE CAVE!',
        onNext: () => startGame(2),
      });
    }, 900);
  }

  // Start the game once all page resources (images, fonts) have loaded.
  window.addEventListener('load', init);

})(); // end of Game IIFE
