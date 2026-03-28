const Assets = (function(){
  const images = {};
  let muted = localStorage.getItem('belly_muted') === '1';
  let ctx = null;

  function ensureAudio(){ if(ctx) return; try{ ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ ctx = null } }

  function playTone(freq,duration=0.08, type='sine', gain=0.12){ if(muted) return; ensureAudio(); if(!ctx) return; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = gain; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + duration); }

  function playJump(){ playTone(820,0.06,'sine',0.08); }
  function playCollect(){ playTone(1200,0.06,'triangle',0.12); }
  function playHurt(){ playTone(220,0.12,'sawtooth',0.16); }

  function playBonkers(){
    if(muted) return; ensureAudio(); if(!ctx) return;
    // 3-second escalating engine rev sequence
    const now = ctx.currentTime;
    function rev(startF, endF, startT, dur, gainVal, waveType){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = waveType || 'sawtooth';
      o.frequency.setValueAtTime(startF, now + startT);
      o.frequency.exponentialRampToValueAtTime(endF, now + startT + dur);
      g.gain.setValueAtTime(0, now + startT);
      g.gain.linearRampToValueAtTime(gainVal, now + startT + 0.05);
      g.gain.linearRampToValueAtTime(gainVal * 0.5, now + startT + dur);
      g.gain.linearRampToValueAtTime(0, now + startT + dur + 0.06);
      o.connect(g); g.connect(ctx.destination);
      o.start(now + startT); o.stop(now + startT + dur + 0.08);
    }
    rev(40,   200,  0.00, 0.50, 0.18, 'sawtooth');
    rev(60,   400,  0.40, 0.50, 0.17, 'sawtooth');
    rev(80,   600,  0.80, 0.50, 0.16, 'sawtooth');
    rev(120,  800,  1.20, 0.55, 0.15, 'sawtooth');
    rev(200, 1100,  1.70, 0.55, 0.14, 'sawtooth');
    rev(350, 1500,  2.15, 0.50, 0.12, 'sawtooth');
    rev(500, 2400,  2.55, 0.45, 0.10, 'square');
  }

  function playVictory(){
    if(muted) return; ensureAudio(); if(!ctx) return;
    const now = ctx.currentTime;
    // Ascending arpeggio fanfare: C E G high-C then held chord
    const seq = [[523,0,0.18],[659,0.14,0.18],[784,0.28,0.18],[1047,0.42,0.32]];
    seq.forEach(([freq, delay, dur]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now+delay);
      g.gain.linearRampToValueAtTime(0.10, now+delay+0.03);
      g.gain.setValueAtTime(0.10, now+delay+dur*0.7);
      g.gain.linearRampToValueAtTime(0, now+delay+dur);
      o.connect(g); g.connect(ctx.destination); o.start(now+delay); o.stop(now+delay+dur+0.05);
    });
    // Sparkle high notes
    [1318,1568,2093].forEach((freq, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now+0.65+i*0.1);
      g.gain.linearRampToValueAtTime(0.07, now+0.68+i*0.1);
      g.gain.linearRampToValueAtTime(0, now+0.85+i*0.1);
      o.connect(g); g.connect(ctx.destination); o.start(now+0.65+i*0.1); o.stop(now+0.9+i*0.1);
    });
  }

  function playBonkersEnd(){
    if(muted) return; ensureAudio(); if(!ctx) return;
    // engine wind-down: sweep high to low, fading out
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(700, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.9);
    g.gain.setValueAtTime(0.16, now);
    g.gain.linearRampToValueAtTime(0, now + 0.9);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.95);
  }

  let musicGain = null;
  function getMusicGain(){
    if(!musicGain){ musicGain = ctx.createGain(); musicGain.connect(ctx.destination); }
    return musicGain;
  }

  function setMuted(v){
    muted = !!v;
    localStorage.setItem('belly_muted', muted ? '1' : '0');
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
  }

  // ---- 8-bit chiptune music engine ----
  const NF = {
    '_':0,
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77, C6:1046.50
  };
  let sixteenth = (60 / 160) / 4; // mutable so bonkers can double BPM

  // Lead melody — bouncy, looping 8-bar phrase
  const MELODY = [
    ['C5',1],['_',1],['E5',1],['_',1], ['G5',2],['E5',1],['_',1],
    ['A5',1],['_',1],['G5',1],['E5',1], ['D5',2],['_',2],
    ['C5',1],['_',1],['E5',1],['G5',1], ['A5',1],['G5',1],['F5',1],['E5',1],
    ['G5',2],['E5',1],['C5',1],         ['D5',4],
    ['G5',1],['E5',1],['C5',1],['E5',1],['G5',1],['A5',1],['G5',2],
    ['F5',1],['A5',1],['C6',2],          ['B5',1],['A5',1],['G5',2],
    ['E5',1],['G5',1],['A5',1],['G5',1],['F5',1],['E5',1],['D5',1],['E5',1],
    ['C5',4],['_',4],
  ];
  // Bass line
  const BASS = [
    ['C3',2],['G3',2], ['_',2],['G3',2],
    ['F3',2],['C3',2], ['G3',4],
    ['C3',2],['G3',2], ['A3',2],['E3',2],
    ['F3',2],['C3',2], ['G3',4],
    ['C3',2],['G3',2], ['_',2], ['G3',2],
    ['F3',2],['A3',2], ['G3',4],
    ['C3',2],['G3',2], ['F3',2],['G3',2],
    ['C3',4],['_',4],
  ];
  // Hi-hat pulse on every beat
  const HIHAT = [['x',1],['_',1],['x',1],['_',1]];

  let musicPlaying = false;
  let musicTimer = null;
  let blobTimer  = null;

  function schedNote(freq, t, dur, type, vol){
    if(!freq) return;
    const mg = getMusicGain();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.value = (Math.random()-0.5)*6;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + dur * 0.72);
    g.gain.linearRampToValueAtTime(0,   t + dur * 0.95);
    osc.connect(g); g.connect(mg);
    osc.start(t); osc.stop(t + dur);
  }

  function schedHat(t){
    const mg = getMusicGain();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.025, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    const src = ctx.createBufferSource();
    const g   = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(0.03, t);
    g.gain.linearRampToValueAtTime(0, t + 0.025);
    src.connect(g); g.connect(mg);
    src.start(t); src.stop(t + 0.03);
  }

  function startMusic(){
    if(musicPlaying) return;
    musicPlaying = true;
    ensureAudio(); if(!ctx) return;
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
    let mi=0, bi=0, hi=0;
    let mt=ctx.currentTime+0.1, bt=ctx.currentTime+0.1, ht=ctx.currentTime+0.1;
    const LOOK=0.18;
    function sched(){
      if(!musicPlaying) return;
      while(mt < ctx.currentTime+LOOK){
        const [n,l]=MELODY[mi%MELODY.length]; const d=l*sixteenth;
        schedNote(NF[n]||0, mt, d*0.82, 'square', 0.07);
        mt+=d; mi++;
      }
      while(bt < ctx.currentTime+LOOK){
        const [n,l]=BASS[bi%BASS.length]; const d=l*sixteenth;
        schedNote(NF[n]||0, bt, d*0.78, 'triangle', 0.11);
        bt+=d; bi++;
      }
      while(ht < ctx.currentTime+LOOK){
        const [n,l]=HIHAT[hi%HIHAT.length]; const d=l*sixteenth;
        if(n==='x') schedHat(ht);
        ht+=d; hi++;
      }
      musicTimer = setTimeout(sched, 40);
    }
    sched();
    // random blobby gurgle noises
    function blob(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const f0 = 80 + Math.random()*250;
      osc.frequency.setValueAtTime(f0, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f0*(0.3+Math.random()*0.7), ctx.currentTime+0.22);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime+0.22);
      osc.connect(gain); gain.connect(mg);
      osc.start(); osc.stop(ctx.currentTime+0.25);
      blobTimer = setTimeout(blob, 4000+Math.random()*7000);
    }
    blobTimer = setTimeout(blob, 2000+Math.random()*3000);
  }

  let bonkersAudioActive = false;

  function startBonkersAudio(){
    stopMusic(); // silence normal music immediately
    bonkersAudioActive = true;
    playBonkers(); // 3-second rev
    // after 3s kick in double-speed music
    setTimeout(() => {
      if(!bonkersAudioActive) return;
      sixteenth = (60 / 320) / 4; // 320 BPM
      startMusic();
    }, 3000);
  }

  function stopBonkersAudio(){
    bonkersAudioActive = false;
    stopMusic();
    sixteenth = (60 / 160) / 4; // back to 160 BPM
    startMusic();
  }

  function stopMusic(){
    musicPlaying = false;
    bonkersAudioActive = false;
    sixteenth = (60 / 160) / 4; // always restore normal tempo on stop
    if(musicTimer){ clearTimeout(musicTimer); musicTimer=null; }
    if(blobTimer) { clearTimeout(blobTimer);  blobTimer=null;  }
  }

  // Create a simple programmatic sprite-sheet for Belly with `frames` frames.
  function createBellySprite(color='#ff79b4', frames = 4, size = 96){
    const fw = size, fh = size;
    const sheet = document.createElement('canvas');
    sheet.width = fw * frames; sheet.height = fh;
    const sctx = sheet.getContext('2d');
    for(let f=0; f<frames; f++){
      const cx = fw*f + fw/2, cy = fh/2;
      // body
      sctx.fillStyle = color; sctx.beginPath(); sctx.ellipse(cx,cy,fw*0.42,fh*0.42,0,0,Math.PI*2); sctx.fill();
      // belly-button face background
      sctx.fillStyle = '#fff'; sctx.beginPath(); sctx.arc(cx, cy+6, 14, 0, Math.PI*2); sctx.fill();
      // eyes vary a bit per frame
      sctx.fillStyle = '#222';
      const eyeOffset = (f%2===0)? -4 : -6;
      sctx.beginPath(); sctx.arc(cx+eyeOffset, cy+4, 3, 0, Math.PI*2); sctx.arc(cx+6, cy+4, 3, 0, Math.PI*2); sctx.fill();
      // mouth: small smile that wiggles
      sctx.fillStyle = '#b33';
      sctx.save();
      sctx.translate(cx, cy+10);
      sctx.rotate((f-1.5)*0.06);
      sctx.fillRect(-5,0,10,3);
      sctx.restore();
    }
    const img = new Image(); img.src = sheet.toDataURL(); images.bellySprite = img; images.bellySprite.frames = frames; images.bellySprite.frameW = fw; images.bellySprite.frameH = fh;
  }

  function loadAll(callback){
    const list = [
      {key:'belly',     src:'assets/belly.svg'},
      {key:'toy-small', src:'assets/toy_small.svg'},
      {key:'toy-large', src:'assets/toy_large.svg'},
      {key:'toy-ball',  src:'assets/toy_ball.svg'},
      {key:'rattle',    src:'assets/rattle.svg'},
      {key:'bicycle',   src:'assets/bicycle.svg'},
      {key:'blocks',    src:'assets/blocks.svg'},
      {key:'toy-car',   src:'assets/toy_car.svg'},
      {key:'dinosaur',  src:'assets/dinosaur.svg'},
      {key:'donut',     src:'assets/donut.svg'},
      {key:'pizza',     src:'assets/pizza.svg'},
      {key:'icecream',  src:'assets/icecream.svg'},
      {key:'lollipop',  src:'assets/lollipop.svg'},
      {key:'hotdog',    src:'assets/hotdog.svg'},
      {key:'cupcake',   src:'assets/cupcake.svg'},
      {key:'candybar',  src:'assets/candybar.svg'},
      {key:'milkshake', src:'assets/milkshake.svg'},
      {key:'candy-cane',src:'assets/candy_cane.svg'},
    ];
    let remaining = list.length;
    list.forEach(item=>{
      const img = new Image();
      img.onload = ()=>{ images[item.key] = img; if(--remaining === 0){
        // set bellySprite for compatibility
        if(!images.bellySprite && images.belly){ images.bellySprite = images.belly; images.bellySprite.frames = 1; images.bellySprite.frameW = images.belly.width; images.bellySprite.frameH = images.belly.height; }
        callback && callback();
      }};
      img.onerror = ()=>{ if(--remaining === 0){ if(!images.bellySprite) createBellySprite(); if(!images.bellySprite.frames) images.bellySprite.frames = 1; callback && callback(); } };
      img.src = item.src;
    });
  }

  // ---- Breezy sky music — upbeat, windy ----
  const SKY_MELODY = [
    ['G5',2],['E5',1],['D5',1], ['B4',2],['A4',2],
    ['G5',2],['E5',2],          ['D5',2],['_',2],
    ['A5',2],['G5',1],['E5',1], ['D5',2],['B4',2],
    ['E5',2],['G5',2],          ['A5',4],
    ['G5',2],['D5',1],['E5',1], ['B4',2],['G4',2],
    ['A4',2],['B4',2],          ['D5',2],['E5',2],
    ['G5',2],['A5',1],['G5',1], ['E5',2],['D5',2],
    ['G4',4],['_',4],
  ];
  const SKY_BASS = [
    ['G3',4],['D3',4],
    ['E3',4],['D3',4],
    ['G3',4],['A3',4],
    ['D3',4],['_',4],
    ['G3',4],['D3',4],
    ['E3',4],['A3',4],
    ['D3',4],['G3',4],
    ['G3',4],['_',4],
  ];
  const skySixteenth = (60 / 135) / 4; // 135 BPM — breezy

  function startSkyMusic(){
    if(musicPlaying) return;
    musicPlaying = true;
    ensureAudio(); if(!ctx) return;
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
    let mi = 0, bi = 0;
    let mt = ctx.currentTime + 0.1, bt = ctx.currentTime + 0.1;
    const LOOK = 0.40;
    function sched(){
      if(!musicPlaying) return;
      while(mt < ctx.currentTime + LOOK){
        const [n, l] = SKY_MELODY[mi % SKY_MELODY.length];
        const d = l * skySixteenth;
        if(NF[n]) schedNote(NF[n], mt, d * 0.70, 'sine', 0.060);
        mt += d; mi++;
      }
      while(bt < ctx.currentTime + LOOK){
        const [n, l] = SKY_BASS[bi % SKY_BASS.length];
        const d = l * skySixteenth;
        if(NF[n]) schedNote(NF[n], bt, d * 0.85, 'triangle', 0.045);
        bt += d; bi++;
      }
      musicTimer = setTimeout(sched, 55);
    }
    sched();
    // wind gusts — filtered noise bursts
    function windGust(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const bufSize = Math.floor(ctx.sampleRate * 0.7);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 500 + Math.random() * 900;
      bpf.Q.value = 0.6;
      const g = ctx.createGain();
      const t0 = ctx.currentTime;
      const peak = 0.08 + Math.random() * 0.07;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.18);
      g.gain.linearRampToValueAtTime(peak * 0.6, t0 + 0.45);
      g.gain.linearRampToValueAtTime(0, t0 + 0.75);
      src.connect(bpf); bpf.connect(g); g.connect(mg);
      src.start(); src.stop(t0 + 0.80);
      blobTimer = setTimeout(windGust, 600 + Math.random() * 1600);
    }
    blobTimer = setTimeout(windGust, 300 + Math.random() * 800);
  }

  // ---- Interstellar space music — slow ambient arpeggio ----
  const SPACE_ARPEGGIO = [
    ['A4',4],['_',2],['E4',3],['_',1], ['C5',4],['_',2],['G4',3],['_',1],
    ['D5',4],['_',2],['A4',3],['E4',1],['G4',6],['_',2],
    ['F4',3],['_',1],['A4',4],['C5',3],['_',1],['G4',4],['_',4],
    ['E5',4],['_',2],['B4',3],['G4',1],['A4',4],['D5',4],
    ['C5',4],['_',2],['E4',3],['G4',1],['A4',6],['_',2],
    ['G4',3],['E4',3],['D4',2],['_',4],['C4',4],['_',4],
    ['A3',6],['_',10],
  ];
  const SPACE_PAD = [
    ['A3',16],['_',4],['E3',12],['G3',4],
    ['C3',16],['G3',8],['A3',8],
    ['D3',12],['A3',4],['E3',8],['G3',4],['_',4],
    ['A3',16],
  ];
  const spaceSixteenth = (60 / 72) / 4; // 72 BPM — slow, haunting

  function startSpaceMusic(){
    if(musicPlaying) return;
    musicPlaying = true;
    ensureAudio(); if(!ctx) return;
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
    let mi = 0, pi = 0;
    let mt = ctx.currentTime + 0.1, pt = ctx.currentTime + 0.1;
    const LOOK = 0.40;
    function sched(){
      if(!musicPlaying) return;
      while(mt < ctx.currentTime + LOOK){
        const [n, l] = SPACE_ARPEGGIO[mi % SPACE_ARPEGGIO.length];
        const d = l * spaceSixteenth;
        if(NF[n]) schedNote(NF[n], mt, d * 0.78, 'sine', 0.055);
        mt += d; mi++;
      }
      while(pt < ctx.currentTime + LOOK){
        const [n, l] = SPACE_PAD[pi % SPACE_PAD.length];
        const d = l * spaceSixteenth;
        if(NF[n]) schedNote(NF[n], pt, d * 0.92, 'triangle', 0.080);
        pt += d; pi++;
      }
      musicTimer = setTimeout(sched, 55);
    }
    sched();
    // cosmic high-frequency twinkles
    function twinkle(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1400 + Math.random() * 2600;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.038, ctx.currentTime + 0.012);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.14);
      osc.connect(g); g.connect(mg);
      osc.start(); osc.stop(ctx.currentTime + 0.16);
      blobTimer = setTimeout(twinkle, 500 + Math.random() * 2200);
    }
    blobTimer = setTimeout(twinkle, 600 + Math.random() * 1400);
  }

  // ---- Hectic handbag music — 185 BPM chaos ----
  const BAG_MELODY = [
    ['C5',1],['E5',1],['G5',1],['A5',1], ['G5',2],['E5',1],['C5',1],
    ['D5',1],['F5',1],['A5',1],['G5',1], ['E5',2],['D5',2],
    ['B4',1],['D5',1],['F5',1],['G5',1], ['A5',2],['G5',1],['F5',1],
    ['E5',1],['G5',1],['A5',1],['C6',1], ['B5',2],['G5',2],
    ['C6',1],['B5',1],['A5',1],['G5',1], ['F5',1],['E5',1],['D5',1],['C5',1],
    ['E5',2],['G5',2],                   ['A5',2],['G5',1],['E5',1],
    ['D5',1],['E5',1],['G5',1],['A5',1], ['B5',2],['_',2],
    ['C5',4],['_',4],
  ];
  const BAG_BASS = [
    ['C3',2],['G3',1],['_',1], ['C3',2],['E3',2],
    ['D3',2],['A3',1],['_',1], ['D3',2],['F3',2],
    ['G3',2],['D3',1],['B3',1],['G3',2],['F3',2],
    ['C3',2],['G3',2],          ['C3',4],
    ['F3',2],['C4',2],          ['G3',4],
    ['A3',2],['E3',2],          ['D3',4],
    ['G3',2],['D3',2],          ['C3',4],
    ['C3',4],['_',4],
  ];
  const bagSixteenth = (60 / 185) / 4; // 185 BPM — hectic

  function startHandbagMusic(){
    if(musicPlaying) return;
    musicPlaying = true;
    ensureAudio(); if(!ctx) return;
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
    let mi = 0, bi = 0, hi = 0;
    let mt = ctx.currentTime + 0.1, bt = ctx.currentTime + 0.1, ht = ctx.currentTime + 0.1;
    const LOOK = 0.25;
    function sched(){
      if(!musicPlaying) return;
      while(mt < ctx.currentTime + LOOK){
        const [n, l] = BAG_MELODY[mi % BAG_MELODY.length];
        const d = l * bagSixteenth;
        if(NF[n]) schedNote(NF[n], mt, d * 0.65, 'square', 0.065);
        mt += d; mi++;
      }
      while(bt < ctx.currentTime + LOOK){
        const [n, l] = BAG_BASS[bi % BAG_BASS.length];
        const d = l * bagSixteenth;
        if(NF[n]) schedNote(NF[n], bt, d * 0.80, 'triangle', 0.10);
        bt += d; bi++;
      }
      while(ht < ctx.currentTime + LOOK){
        const [n, l] = HIHAT[hi % HIHAT.length];
        const d = l * bagSixteenth;
        if(n === 'x') schedHat(ht);
        ht += d; hi++;
      }
      musicTimer = setTimeout(sched, 40);
    }
    sched();

    // car horn beeps
    function carHorn(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const now = ctx.currentTime;
      [0, 0.04].forEach(offset => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 350 + offset * 50;
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.12, now + 0.01);
        g.gain.setValueAtTime(0.12, now + 0.12); g.gain.linearRampToValueAtTime(0, now + 0.16);
        osc.connect(g); g.connect(mg); osc.start(now); osc.stop(now + 0.18);
      });
      blobTimer = setTimeout(carHorn, 1800 + Math.random() * 3200);
    }
    blobTimer = setTimeout(carHorn, 800 + Math.random() * 1500);

    // train toot
    function trainToot(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 180;
      osc.frequency.setValueAtTime(190, now); osc.frequency.linearRampToValueAtTime(175, now + 0.25);
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.09, now + 0.03);
      g.gain.setValueAtTime(0.09, now + 0.22); g.gain.linearRampToValueAtTime(0, now + 0.28);
      osc.connect(g); g.connect(mg); osc.start(now); osc.stop(now + 0.32);
      setTimeout(() => {
        if(!musicPlaying) return;
        const mg2 = getMusicGain();
        const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
        osc2.type = 'sawtooth'; osc2.frequency.value = 220;
        g2.gain.setValueAtTime(0, ctx.currentTime); g2.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.03);
        g2.gain.setValueAtTime(0.07, ctx.currentTime + 0.18); g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.24);
        osc2.connect(g2); g2.connect(mg2); osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.27);
      }, 320);
      setTimeout(trainToot, 4000 + Math.random() * 5000);
    }
    setTimeout(trainToot, 2000 + Math.random() * 2000);

    // people chattering — rapid staccato notes in speech-frequency band
    function chatter(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const count = 4 + Math.floor(Math.random() * 5);
      for(let i = 0; i < count; i++){
        const t0 = ctx.currentTime + i * 0.07;
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 220 + Math.random() * 420;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, t0 + 0.01);
        g.gain.linearRampToValueAtTime(0, t0 + 0.055);
        osc.connect(g); g.connect(mg); osc.start(t0); osc.stop(t0 + 0.07);
      }
      setTimeout(chatter, 300 + Math.random() * 900);
    }
    setTimeout(chatter, 400 + Math.random() * 600);
  }

  // ---- Strange portal / wormhole music — deep suspense chiptune, 75 BPM ----
  // Lead hook: F E F E F E F D — each note an eighth (dur 2) at 75 BPM = 400ms/note
  const PORTAL_MELODY = [
    // bars 1-2: signature hook ×2
    ['F5',2],['E5',2],['F5',2],['E5',2], ['F5',2],['E5',2],['F5',2],['D5',2],
    ['F5',2],['E5',2],['F5',2],['E5',2], ['F5',2],['E5',2],['F5',2],['D5',2],
    // bars 3-4: fall into the void — quarter notes
    ['C5',4],['_',2],['B4',2],            ['A4',4],['_',4],
    // bar 5: chromatic crawl back up
    ['A4',2],['B4',2],['C5',2],['Cs5',2],['D5',2],['Ds5',2],['E5',2],['_',2],
    // bar 6: hook once more
    ['F5',2],['E5',2],['F5',2],['E5',2], ['F5',2],['E5',2],['F5',2],['D5',2],
    // bars 7-8: answer phrase — wider, slower
    ['C5',4],['A4',4],                    ['G4',4],['_',4],
    // bar 9: eerie chromatic descent
    ['F4',2],['G4',2],['A4',2],['_',2],  ['Bf4',2],['A4',2],['G4',2],['F4',2],
    // bars 10+: long hold then silence before loop
    ['C5',6],['_',10],
  ];

  // Bass: sparse, haunting root/fifth movement
  const PORTAL_BASS = [
    ['F3',4],['C3',4], ['F3',4],['C3',4],
    ['F3',4],['C3',4], ['F3',4],['C3',4],
    ['C3',8],          ['_',8],
    ['Bf2',4],['F3',4],['C3',8],
    ['F3',4],['C3',4], ['F3',4],['C3',4],
    ['C3',4],['G3',4], ['F3',8],
    ['Bf2',4],['F2',4],['C3',4],['_',4],
    ['F3',8],['_',8],
  ];

  // Low suspense chords: 2-note power chords with slow swell attack
  // [lowNote, highNote, durationSixteenths] — 4 chords × 16 = 64 sixteenths = 4 bars
  const PORTAL_CHORDS = [
    ['F2',  'C3',   12], ['_','_', 4],   // Fm5 — hollow, dark
    ['Bf2', 'F3',   12], ['_','_', 4],   // Bb5 — ominous
    ['C3',  'G3',    8], ['_','_', 8],   // C5  — tension
    ['Ef3', 'Bf3',  12], ['_','_', 4],   // Eb5 — spooky tritone colour
  ];

  const PORTAL_NF = Object.assign({}, NF, {
    F2:87.31, Bf2:116.54, Ef3:155.56, Bf3:233.08,
    Bf4:466.16, Cs5:554.37, Ds5:622.25,
  });
  const portalSixteenth = (60 / 75) / 4; // 75 BPM — slow, creeping

  function startPortalMusic(){
    if(musicPlaying) return;
    musicPlaying = true;
    ensureAudio(); if(!ctx) return;
    if(musicGain) musicGain.gain.value = muted ? 0 : 1;
    let mi = 0, bi = 0, ci = 0;
    let mt = ctx.currentTime + 0.1, bt = ctx.currentTime + 0.1, ct = ctx.currentTime + 0.1;
    const LOOK = 0.50;
    function sched(){
      if(!musicPlaying) return;
      // lead melody — square wave, punchy staccato
      while(mt < ctx.currentTime + LOOK){
        const [n, l] = PORTAL_MELODY[mi % PORTAL_MELODY.length];
        const d = l * portalSixteenth;
        if(PORTAL_NF[n]) schedNote(PORTAL_NF[n], mt, d * 0.58, 'square', 0.068);
        mt += d; mi++;
      }
      // bass — triangle, longer notes
      while(bt < ctx.currentTime + LOOK){
        const [n, l] = PORTAL_BASS[bi % PORTAL_BASS.length];
        const d = l * portalSixteenth;
        if(PORTAL_NF[n]) schedNote(PORTAL_NF[n], bt, d * 0.85, 'triangle', 0.10);
        bt += d; bi++;
      }
      // low chords — pad-like slow swell
      while(ct < ctx.currentTime + LOOK){
        const [n1, n2, l] = PORTAL_CHORDS[ci % PORTAL_CHORDS.length];
        const d = l * portalSixteenth;
        const f1 = PORTAL_NF[n1] || 0;
        const f2 = PORTAL_NF[n2] || 0;
        [f1, f2].forEach(freq => {
          if(!freq) return;
          const mg = getMusicGain();
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const attack = Math.min(0.7, d * 0.30);
          g.gain.setValueAtTime(0, ct);
          g.gain.linearRampToValueAtTime(0.060, ct + attack);
          g.gain.setValueAtTime(0.060, ct + d * 0.78);
          g.gain.linearRampToValueAtTime(0, ct + d * 0.97);
          osc.connect(g); g.connect(mg);
          osc.start(ct); osc.stop(ct + d + 0.04);
        });
        ct += d; ci++;
      }
      musicTimer = setTimeout(sched, 55);
    }
    sched();

    // eerie void whispers — detuned sine drones slowly gliding
    function voidWhisper(){
      if(!musicPlaying) return;
      const mg = getMusicGain();
      const now = ctx.currentTime;
      const f0 = 45 + Math.random() * 85;
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f0 * (0.5 + Math.random() * 0.9), now + 1.8);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.042, now + 0.5);
      g.gain.linearRampToValueAtTime(0, now + 1.85);
      osc.connect(g); g.connect(mg);
      osc.start(now); osc.stop(now + 1.9);
      blobTimer = setTimeout(voidWhisper, 1200 + Math.random() * 2800);
    }
    blobTimer = setTimeout(voidWhisper, 600 + Math.random() * 1200);
  }

  return {images, loadAll, playJump, playCollect, playHurt, playBonkersEnd, playVictory, startBonkersAudio, stopBonkersAudio, setMuted, isMuted: ()=>muted, createBellySprite, startMusic, stopMusic, startSkyMusic, startSpaceMusic, startHandbagMusic, startPortalMusic};
})();
