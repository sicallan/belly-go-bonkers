(function(){
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let state = 'title';
  let belly = null;
  let scroll = 0;
  let speed = 160; // px per second
  let last = performance.now();
  let obstacles = [];
  let collectibles = [];
  let planks = [];
  let nextPlankScroll = 0;
  let nextObstacleScroll = 0;
  let nextCollectibleScroll = 0;
  let score = 0;
  let candyCaneCount = 0;
  let bonkersPhase = null; // null | 'flash' | 'shake' | 'run'
  let bonkersTimer = 0;
  let savedSpeed = 0;
  let nextCandyCaneScroll = 0;
  let shakeX = 0, shakeY = 0;
  let invincible = false;
  let invincibleTimer = 0;
  let cheatInvincible = false;
  let levelCompleteTimer = 0;
  let lostLifeThisLevel = false;
  let currentLevel = 1;
  let equippedAccessories = JSON.parse(localStorage.getItem('belly_accessories') || '[]');

  function loadRecent(){
    const raw = localStorage.getItem('belly_recent') || '[]';
    try{ return JSON.parse(raw); }catch(e){ return [] }
  }
  function saveRecent(name,score){ const arr = loadRecent(); arr.push({name,score}); arr.sort((a,b)=>b.score-a.score); while(arr.length>6) arr.pop(); localStorage.setItem('belly_recent',JSON.stringify(arr)); }

  function showRecent(){
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

  // Max duration (seconds) the jump key can boost Belly upward
  const MAX_BOOST_DURATION = 1;

  // BONKERS MODE SETTINGS
  // Title screen difficulty picker writes to localStorage and controls this mode.
  const BONKERS_MODE_STORAGE_KEY = 'belly_bonkers_mode';
  let bonkersMode = localStorage.getItem(BONKERS_MODE_STORAGE_KEY) || 'normal';
  const BONKERS_CONFIGS = {
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

  function isValidBonkersMode(mode){
    return Object.prototype.hasOwnProperty.call(BONKERS_CONFIGS, mode);
  }

  function setBonkersMode(mode){
    if(!isValidBonkersMode(mode)) return;
    bonkersMode = mode;
    localStorage.setItem(BONKERS_MODE_STORAGE_KEY, mode);
  }

  function getBonkersConfig(){
    if(!isValidBonkersMode(bonkersMode)) bonkersMode = 'normal';
    return BONKERS_CONFIGS[bonkersMode] || BONKERS_CONFIGS.normal;
  }

  function initBonkersModePicker(){
    const select = document.getElementById('bonkers-mode-select');
    if(!select) return;
    if(!isValidBonkersMode(bonkersMode)) bonkersMode = 'normal';
    select.value = bonkersMode;
    select.addEventListener('change', () => {
      setBonkersMode(select.value);
    });
  }

  const ACCESSORIES = [
    { id: 'hat',        emoji: '🎩', name: 'Magic Hat',      desc: 'Tips with style!' },
    { id: 'boots',      emoji: '👢', name: 'Power Boots',    desc: 'Spring in every step!' },
    { id: 'glasses',    emoji: '🕶️',  name: 'Cool Shades',   desc: 'Looking so groovy!' },
    { id: 'pogo-stick', emoji: '🎯', name: 'Pogo Stick',     desc: 'Boing boing boing!' },
    { id: 'coat',       emoji: '🧥', name: 'Fancy Coat',     desc: 'So fashionable!' },
    { id: 'necklace',   emoji: '📿', name: 'Jewel Necklace', desc: 'Bling bling bling!' },
  ];

  function startGame(level){
    const bonkersCfg = getBonkersConfig();
    currentLevel = level || 1;
    state='playing';
    levelCompleteTimer = 0;
    lostLifeThisLevel = false;
    const lcBox = document.getElementById('levelcomplete-box'); if(lcBox) lcBox.remove();
    belly = new exported.Belly(120, 400);
    obstacles = []; collectibles = []; planks = []; score=0; scroll=0; speed=160;
    // levels 3+ have no planks (open sky / space)
    nextPlankScroll = currentLevel >= 3 ? Infinity : canvas.width * 0.7;
    nextObstacleScroll = 200;
    nextCollectibleScroll = 100;
    candyCaneCount = 0; bonkersPhase = null; bonkersTimer = 0;
    invincible = false; invincibleTimer = 0;
    nextCandyCaneScroll = bonkersCfg.candyCaneSpawnMin + Math.random() * bonkersCfg.candyCaneSpawnRange;
    // jetpack physics for level 4
    belly.hasJetpack = currentLevel === 4;
    // hide title, show exit button
    setTitleVisible(false);
    Assets.stopMusic(); // reset tempo if bonkers was active, clears any running music
    if(currentLevel === 6) Assets.startPortalMusic();
    else if(currentLevel === 5) Assets.startHandbagMusic();
    else if(currentLevel === 4) Assets.startSpaceMusic();
    else if(currentLevel === 3) Assets.startSkyMusic();
    else Assets.startMusic();
    // place belly at correct position for current canvas size
    const groundTopY = canvas.height - 80;
    if(currentLevel === 4){
      belly.y = canvas.height / 2 - belly.height / 2;
      belly.groundY = canvas.height + 1000; // no ground snap in space
    } else {
      belly.y = groundTopY - belly.height;
      belly.groundY = groundTopY - belly.height;
    }
  }

  const ui = ()=>document.getElementById('ui');
  const exitBtn = ()=>document.getElementById('exit-button');

  function setTitleVisible(visible){
    const el = ui(); if(!el) return;
    el.style.display = visible ? 'flex' : 'none';
    const eb = exitBtn(); if(eb) eb.style.display = visible ? 'none' : 'block';
    const lcBox = document.getElementById('levelcomplete-box'); if(lcBox) lcBox.remove();
    if(visible){
      Assets.stopMusic();
      // reset accessories so each run starts fresh
      equippedAccessories = [];
      localStorage.removeItem('belly_accessories');
    }
  }
  
  function resizeCanvas(){
    // set canvas to window size (CSS handles display scaling)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // compute ground top y
    const groundTop = canvas.height - 80;
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
    // reposition existing obstacles/collectibles vertically relative to new ground
    for(let o of obstacles){ o.y = (groundTop - o.h); }
    for(let c of collectibles){ c.y = (groundTop - 40); }
  }

  function groundTop(){ return canvas.height - 80; }

  function spawnObstacle(){
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
  function spawnCollectible(){
    const x = canvas.width + scroll + 100 + Math.random()*300;
    const kinds = ['donut','pizza','icecream','lollipop','hotdog','cupcake','candybar','milkshake'];
    const kind = kinds[Math.floor(Math.random()*kinds.length)];
    const cy = currentLevel === 4
      ? 80 + Math.random() * (canvas.height - 200)
      : groundTop() - 60;
    collectibles.push(new exported.Collectible(x, cy, kind));
  }

  function spawnPlank(){
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

  function spawnCandyCane(){
    const x = canvas.width + scroll + 80;
    collectibles.push(new exported.Collectible(x, groundTop() - 68, 'candy-cane'));
  }

  function startBonkers(){
    bonkersPhase = 'flash';
    bonkersTimer = 0;
    Assets.startBonkersAudio();
  }

  // game-over overlay: ask for name then show scores
  let gameOverName = '';

  function showGameOver(){
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

  // ── SECRET LEVEL PICKER ─ type 'belly' on the title screen ────────────
  let secretBuffer = '';
  const SECRET_CODE = 'belly';

  function showLevelPicker(){
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

  function init(){
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

  function loop(t){
    requestAnimationFrame(loop);
    const dt = Math.min(50, t-last)/1000; last=t;
    if(state==='playing') update(dt);
    if(state==='levelcomplete') levelCompleteTimer += dt;
    render();
  }

  function update(dt){
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
    // move world
    const move = speed * dt; scroll += move; score += Math.floor(move*0.1);
    // increase difficulty slowly
    speed += dt*2;
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
      if(jumpHeld) belly.boost(dt, MAX_BOOST_DURATION);
      else belly.stopBoost();
    }
    // advance belly animation timer
    if(belly.animTime === undefined) belly.animTime = 0;
    belly.animTime += dt;
    // touch swipe jump
    if(Input.isDown('SwipeUp')){ belly.jump(); Assets.playJump(); }
    // spawn obstacles at a guaranteed minimum gap (400–700px world-space)
    if(scroll >= nextObstacleScroll){
      spawnObstacle();
      nextObstacleScroll = scroll + 200 + Math.random() * 150;
    }
    // spawn collectibles between obstacles (250–450px gap)
    if(scroll >= nextCollectibleScroll){
      spawnCollectible();
      nextCollectibleScroll = scroll + 150 + Math.random() * 150;
    }
    // plank spawning every ~1.5–2 screens, guaranteed
    if(scroll >= nextPlankScroll){
      spawnPlank();
      nextPlankScroll = scroll + canvas.width * (1.5 + Math.random() * 0.5);
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
        if(cKind === 'candy-cane'){
          score += 150;
          candyCaneCount++;
          if(candyCaneCount >= bonkersCfg.candyCaneRequired){ candyCaneCount = 0; startBonkers(); }
        } else {
          score += 50; belly.collect++;
        }
      }
    }
    // cleanup offscreen
    obstacles = obstacles.filter(o=>o.x+o.w > -100);
    collectibles = collectibles.filter(c=>c.x+c.r > -100);
  }

  function render(){ Renderer.clear(); Renderer.drawBackground(scroll, currentLevel);
    const bonkersCfg = getBonkersConfig();
    for(let p of planks) Renderer.drawPlank(p);
    if(state==='title'){
      // dim canvas behind HTML title overlay
      Renderer.ctx.fillStyle='rgba(255,255,255,0.6)'; Renderer.ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    if(belly && bonkersPhase === 'shake'){
      Renderer.drawBelly(belly, shakeX, shakeY, false, equippedAccessories);
    } else if(belly){
      Renderer.drawBelly(belly, undefined, undefined, invincible, equippedAccessories);
    }
    const inBonkers = bonkersPhase === 'run';
    for(let o of obstacles) Renderer.drawObstacle(o, inBonkers);
    for(let c of collectibles) Renderer.drawCollectible(c, inBonkers);
    if(belly) Renderer.drawHUD(score, belly.lives, candyCaneCount, bonkersCfg.candyCaneRequired, invincible, currentLevel, !lostLifeThisLevel);
    if(bonkersPhase === 'flash') Renderer.drawBonkersFlash(bonkersTimer);
    else if(bonkersPhase === 'shake') Renderer.drawBonkersShake(bonkersTimer);
    else if(bonkersPhase === 'run' && state === 'playing') Renderer.drawBonkersRunLines();
    if(state === 'levelcomplete') Renderer.drawLevelComplete(levelCompleteTimer, currentLevel);
  }

  function getAccessoryRewardState(){
    const available = ACCESSORIES.filter(a => !equippedAccessories.includes(a.id));
    const perfectRun = !lostLifeThisLevel;
    return {
      available,
      perfectRun,
      canChoose: perfectRun && available.length > 0,
    };
  }

  function awardAccessory(id){
    if(!id || equippedAccessories.includes(id)) return;
    equippedAccessories.push(id);
    localStorage.setItem('belly_accessories', JSON.stringify(equippedAccessories));
  }

  function buildAccessoryGridHtml(perfectRun){
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

  function openTransitionRewardBox(cfg){
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

  function openFinalLevelBox(){
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

  function showLevelComplete(){
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

  window.addEventListener('load', init);
})();
