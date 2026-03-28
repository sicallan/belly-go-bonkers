const Renderer = (function(){
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }
  function drawBackground(scroll, level){
    if(level === 2){ drawBackgroundLevel2(scroll); return; }
    if(level === 3){ drawBackgroundLevel3(scroll); return; }
    if(level === 4){ drawBackgroundLevel4(scroll); return; }
    if(level === 5){ drawBackgroundLevel5(scroll); return; }
    if(level === 6){ drawBackgroundLevel6(scroll); return; }
    drawBackgroundLevel1(scroll);
  }
  function drawBackgroundLevel1(scroll){
    const W = canvas.width, H = canvas.height;
    const groundY = H - 80;

    // --- SKY gradient ---
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0,    '#5bc8ff');
    sky.addColorStop(0.65, '#a8e4ff');
    sky.addColorStop(1,    '#d4f0ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, groundY);

    // --- CLOUDS (two parallax layers) ---
    function cloud(x, y, r, alpha){
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x,       y,     r*1.0, 0, Math.PI*2);
      ctx.arc(x+r*0.9, y-r*0.2, r*0.75, 0, Math.PI*2);
      ctx.arc(x+r*1.7, y,       r*0.85, 0, Math.PI*2);
      ctx.arc(x+r*0.8, y+r*0.3, r*0.60, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    // far clouds — slow
    const fc = scroll * 0.12;
    cloud(((80  - fc) % (W+300) + (W+300)) % (W+300) - 150, groundY*0.18, 48, 0.82);
    cloud(((420 - fc) % (W+300) + (W+300)) % (W+300) - 150, groundY*0.12, 36, 0.75);
    cloud(((730 - fc) % (W+300) + (W+300)) % (W+300) - 150, groundY*0.22, 52, 0.80);
    // near clouds — faster
    const nc = scroll * 0.22;
    cloud(((200 - nc) % (W+340) + (W+340)) % (W+340) - 170, groundY*0.32, 38, 0.65);
    cloud(((580 - nc) % (W+340) + (W+340)) % (W+340) - 170, groundY*0.28, 44, 0.60);

    // --- BACKGROUND HILLS (two layers) ---
    // far hills
    ctx.fillStyle = '#7ecb60';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    const fhOff = scroll * 0.18;
    for(let x=0; x<=W+120; x+=6){
      const hy = groundY - 55 - Math.sin((x + fhOff) * 0.009) * 38
                          - Math.sin((x + fhOff) * 0.017) * 22;
      x===0 ? ctx.moveTo(0, hy) : ctx.lineTo(x, hy);
    }
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // near hills
    ctx.fillStyle = '#5ab84a';
    ctx.beginPath();
    const nhOff = scroll * 0.32;
    for(let x=0; x<=W+80; x+=5){
      const hy = groundY - 28 - Math.sin((x + nhOff) * 0.013) * 20
                          - Math.sin((x + nhOff) * 0.031) * 12;
      x===0 ? ctx.moveTo(0, hy) : ctx.lineTo(x, hy);
    }
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // --- DIRT / SOIL (bottom band) ---
    const dirtGrad = ctx.createLinearGradient(0, groundY + 18, 0, H);
    dirtGrad.addColorStop(0,   '#a0622a');
    dirtGrad.addColorStop(0.4, '#8b4f1e');
    dirtGrad.addColorStop(1,   '#6b3812');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, groundY + 18, W, H - groundY - 18);

    // dirt pebbles
    ctx.fillStyle = 'rgba(60,30,10,0.22)';
    const ps = scroll * 0.95;
    for(let i=0; i<8; i++){
      const px = ((i*137 + 60 - ps) % (W+60) + (W+60)) % (W+60) - 30;
      const py = groundY + 30 + (i*53)%32;
      ctx.beginPath(); ctx.ellipse(px, py, 7+i%4, 3+i%2, i*0.4, 0, Math.PI*2); ctx.fill();
    }

    // --- GRASS TOP STRIP ---
    const grassGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 22);
    grassGrad.addColorStop(0,   '#6fe040');
    grassGrad.addColorStop(0.5, '#52c42e');
    grassGrad.addColorStop(1,   '#3d9e1e');
    ctx.fillStyle = grassGrad;
    // slightly wavy top edge
    ctx.beginPath();
    const gOff = scroll * 0.98;
    for(let x=0; x<=W; x+=4){
      const gy = groundY - 3 - Math.sin((x + gOff) * 0.05) * 2.5
                          - Math.abs(Math.sin((x + gOff) * 0.13)) * 2;
      x===0 ? ctx.moveTo(0, gy) : ctx.lineTo(x, gy);
    }
    ctx.lineTo(W, groundY + 22);
    ctx.lineTo(0, groundY + 22);
    ctx.closePath(); ctx.fill();

    // --- GRASS TUFTS ---
    ctx.strokeStyle = '#3aac18'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const tOff = scroll * 0.98;
    for(let i=0; i<28; i++){
      const tx = ((i*71 - tOff) % (W+50) + (W+50)) % (W+50) - 25;
      const ty = groundY - 4;
      const h2 = 6 + (i*37)%7;
      ctx.beginPath(); ctx.moveTo(tx,   ty); ctx.lineTo(tx-3, ty-h2);   ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx+3, ty); ctx.lineTo(tx+6, ty-h2-2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx+6, ty); ctx.lineTo(tx+9, ty-h2+1); ctx.stroke();
    }

    // --- tiny flowers ---
    const flOff = scroll * 0.98;
    const flColors = ['#ffee44','#ff88cc','#ffffff','#ff6655'];
    for(let i=0; i<10; i++){
      const fx = ((i*113 + 35 - flOff) % (W+40) + (W+40)) % (W+40) - 20;
      const fy = groundY - 2 - (i*23)%8;
      ctx.fillStyle = flColors[i%4];
      ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, Math.PI*2); ctx.fill();
    }
  }

  // ======= LEVEL 2 — UNDERGROUND CAVE BACKGROUND ==========================
  function drawBackgroundLevel2(scroll){
    const W = canvas.width, H = canvas.height;
    const groundY = H - 80;

    // --- Deep cave rock gradient (background fill) ---
    const caveBg = ctx.createLinearGradient(0, 0, 0, H);
    caveBg.addColorStop(0,    '#0a0618');
    caveBg.addColorStop(0.35, '#12082a');
    caveBg.addColorStop(0.75, '#1a0f38');
    caveBg.addColorStop(1,    '#100820');
    ctx.fillStyle = caveBg;
    ctx.fillRect(0, 0, W, H);

    // --- Far cave wall texture (barely visible, slow parallax) ---
    const fwOff = scroll * 0.06;
    ctx.fillStyle = 'rgba(40,20,80,0.45)';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    for(let x = 0; x <= W + 80; x += 5){
      const wy = groundY - 60 - Math.sin((x + fwOff) * 0.008) * 30
                            - Math.sin((x + fwOff) * 0.019) * 15;
      x === 0 ? ctx.moveTo(0, wy) : ctx.lineTo(x, wy);
    }
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // --- Near cave wall ---
    ctx.fillStyle = 'rgba(30,10,65,0.55)';
    ctx.beginPath();
    const nwOff = scroll * 0.18;
    for(let x = 0; x <= W + 60; x += 5){
      const wy = groundY - 30 - Math.sin((x + nwOff) * 0.014) * 16
                            - Math.sin((x + nwOff) * 0.033) * 10;
      x === 0 ? ctx.moveTo(0, wy) : ctx.lineTo(x, wy);
    }
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // --- Bioluminescent crystal clusters (ambient light) ---
    const crystOff = scroll * 0.18;
    const crystCols = ['rgba(80,20,180,0.35)','rgba(0,180,220,0.28)','rgba(120,0,200,0.30)'];
    for(let i = 0; i < 6; i++){
      const cx2 = ((i * 181 + 60 - crystOff) % (W + 200) + (W + 200)) % (W + 200) - 100;
      const cy2 = groundY * 0.55 + (i * 67) % 80;
      const cr  = 40 + (i * 37) % 30;
      const grd = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr);
      grd.addColorStop(0, crystCols[i % crystCols.length]);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx2, cy2, cr, 0, Math.PI * 2); ctx.fill();
    }

    // --- JAGGED CAVE CEILING with stalactites ---
    const ceilOff = scroll * 0.94;
    // Draw solid rock above the jagged ceiling line
    ctx.fillStyle = '#0d0422';
    ctx.beginPath(); ctx.moveTo(0, 0);
    // Build jagged ceiling path using a rough sine sum
    for(let x = 0; x <= W; x += 3){
      const jag = 18 + Math.sin((x + ceilOff) * 0.05) * 12
                     + Math.sin((x + ceilOff) * 0.13) * 7
                     + Math.abs(Math.sin((x + ceilOff) * 0.029)) * 18;
      const cy2  = jag;
      x === 0 ? ctx.moveTo(0, cy2) : ctx.lineTo(x, cy2);
    }
    ctx.lineTo(W, 0); ctx.closePath(); ctx.fill();

    // Ceiling rock edge highlight
    ctx.strokeStyle = 'rgba(80,40,160,0.6)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for(let x = 0; x <= W; x += 3){
      const jag = 18 + Math.sin((x + ceilOff) * 0.05) * 12
                     + Math.sin((x + ceilOff) * 0.13) * 7
                     + Math.abs(Math.sin((x + ceilOff) * 0.029)) * 18;
      x === 0 ? ctx.moveTo(0, jag) : ctx.lineTo(x, jag);
    }
    ctx.stroke();

    // Stalactites — hang from ceiling at fixed world-space intervals
    const stalOff = scroll * 0.94;
    for(let i = 0; i < 9; i++){
      const sx = ((i * 137 + 40 - stalOff) % (W + 180) + (W + 180)) % (W + 180) - 90;
      const baseY = 22 + Math.sin((sx + stalOff) * 0.05) * 12
                       + Math.sin((sx + stalOff) * 0.13) * 7
                       + Math.abs(Math.sin((sx + stalOff) * 0.029)) * 18;
      const len = 35 + (i * 53) % 55;
      const hw  = 6 + (i * 23) % 7;
      // stalactite body
      const sg = ctx.createLinearGradient(sx, baseY, sx, baseY + len);
      sg.addColorStop(0, '#2a1060');
      sg.addColorStop(0.6, '#3c1880');
      sg.addColorStop(1, '#5a2aaa');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(sx - hw, baseY);
      ctx.lineTo(sx + hw, baseY);
      ctx.lineTo(sx, baseY + len);
      ctx.closePath(); ctx.fill();
      // drip highlight
      ctx.strokeStyle = 'rgba(180,120,255,0.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx - hw * 0.3, baseY + 4); ctx.lineTo(sx, baseY + len - 5); ctx.stroke();
      // drip tip glow
      ctx.fillStyle = 'rgba(180,130,255,0.55)';
      ctx.beginPath(); ctx.arc(sx, baseY + len, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // --- CAVE FLOOR (dark stone / rubble) ---
    const floorGrad = ctx.createLinearGradient(0, groundY + 16, 0, H);
    floorGrad.addColorStop(0,   '#1c0e40');
    floorGrad.addColorStop(0.4, '#160c35');
    floorGrad.addColorStop(1,   '#0e081e');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY + 16, W, H - groundY - 16);

    // Rocky floor top edge (dark stone stripe)
    const stoneGrad = ctx.createLinearGradient(0, groundY - 4, 0, groundY + 20);
    stoneGrad.addColorStop(0,   '#3a2060');
    stoneGrad.addColorStop(0.5, '#2a1450');
    stoneGrad.addColorStop(1,   '#1c0e40');
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    const rOff = scroll * 0.96;
    for(let x = 0; x <= W; x += 4){
      const ry = groundY - 2 - Math.sin((x + rOff) * 0.06) * 2.5
                           - Math.abs(Math.sin((x + rOff) * 0.15)) * 2;
      x === 0 ? ctx.moveTo(0, ry) : ctx.lineTo(x, ry);
    }
    ctx.lineTo(W, groundY + 20); ctx.lineTo(0, groundY + 20); ctx.closePath(); ctx.fill();

    // Floor pebbles / rubble
    ctx.fillStyle = 'rgba(100,60,180,0.30)';
    const ps = scroll * 0.96;
    for(let i = 0; i < 10; i++){
      const px = ((i * 137 + 60 - ps) % (W + 60) + (W + 60)) % (W + 60) - 30;
      const py = groundY + 22 + (i * 47) % 28;
      ctx.beginPath(); ctx.ellipse(px, py, 7 + i % 5, 3 + i % 3, i * 0.5, 0, Math.PI * 2); ctx.fill();
    }

    // --- FOSSILS on the floor (occasional ammonite / trilobite shapes) ---
    const fosOff = scroll * 0.97;
    for(let i = 0; i < 5; i++){
      const fx2 = ((i * 223 + 80 - fosOff) % (W + 140) + (W + 140)) % (W + 140) - 70;
      const fy2 = groundY + 14 + (i * 31) % 20;
      const fr  = 9 + (i * 17) % 9;
      ctx.save();
      ctx.globalAlpha = 0.55;
      // ammonite spiral shape
      ctx.strokeStyle = i % 2 === 0 ? '#a080d0' : '#6040a0';
      ctx.lineWidth = 1.5;
      // outer circle
      ctx.beginPath(); ctx.arc(fx2, fy2, fr, 0, Math.PI * 2); ctx.stroke();
      // inner spiral lines
      for(let s = 1; s <= 3; s++){
        ctx.beginPath(); ctx.arc(fx2, fy2, fr * (s / 4), 0, Math.PI * 1.6); ctx.stroke();
      }
      // radial chamber lines
      for(let r2 = 0; r2 < 8; r2++){
        const ang = (r2 / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(fx2, fy2); ctx.lineTo(fx2 + Math.cos(ang) * fr, fy2 + Math.sin(ang) * fr); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.restore();
    }

    // --- Small glowing mushrooms near floor ---
    const mushOff = scroll * 0.96;
    const mushCols = ['#cc44ff','#44ddff','#ff44cc'];
    for(let i = 0; i < 7; i++){
      const mx = ((i * 109 + 25 - mushOff) % (W + 60) + (W + 60)) % (W + 60) - 30;
      const my = groundY - 4;
      const mh  = 8 + (i * 29) % 9;
      const mr  = 5 + (i * 17) % 5;
      const mc  = mushCols[i % mushCols.length];
      ctx.save();
      ctx.globalAlpha = 0.75;
      // stem
      ctx.fillStyle = 'rgba(200,180,255,0.6)';
      ctx.beginPath(); ctx.roundRect(mx - 2, my - mh, 4, mh, 1); ctx.fill();
      // cap
      const capGrd = ctx.createRadialGradient(mx - mr * 0.2, my - mh - mr * 0.3, 1, mx, my - mh, mr * 1.3);
      capGrd.addColorStop(0, 'rgba(255,255,255,0.85)');
      capGrd.addColorStop(0.4, mc);
      capGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = capGrd;
      ctx.beginPath(); ctx.ellipse(mx, my - mh, mr * 1.3, mr * 0.75, 0, Math.PI, 0); ctx.fill();
      // glow aura
      const aura2 = ctx.createRadialGradient(mx, my - mh, 0, mx, my - mh, mr * 2.5);
      aura2.addColorStop(0, mc.replace(')', ',0.25)').replace('rgb', 'rgba'));
      aura2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura2;
      ctx.beginPath(); ctx.arc(mx, my - mh, mr * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    }
  }
  // ======= END LEVEL 2 BACKGROUND ==========================================

  // ======= LEVEL 3 — SKY BACKGROUND ======================================
  function drawBackgroundLevel3(scroll){
    const W = canvas.width, H = canvas.height;
    const groundY = H - 80;

    // --- Deep twilight-blue sky gradient ---
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0,    '#071850');
    sky.addColorStop(0.30, '#0e2880');
    sky.addColorStop(0.65, '#1840a8');
    sky.addColorStop(1,    '#2260c0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, groundY);

    // --- Faint stars in upper sky ---
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const stOff = scroll * 0.04;
    for(let i = 0; i < 45; i++){
      const sx = ((i * 163 + 20 - stOff) % (W + 80) + (W + 80)) % (W + 80) - 40;
      const sy = (i * 47) % (groundY * 0.52);
      if(i % 7 < 5){
        ctx.beginPath(); ctx.arc(sx, sy, 0.6 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // --- Distant small planets (very slow parallax) ---
    const pOff = scroll * 0.025;
    // Reddish planet
    const p1x = ((W * 0.73 - pOff) % (W + 260) + (W + 260)) % (W + 260) - 60;
    const p1y = groundY * 0.14;
    {
      const g = ctx.createRadialGradient(p1x - 7, p1y - 7, 2, p1x, p1y, 22);
      g.addColorStop(0, '#e84840'); g.addColorStop(0.6, '#a02020'); g.addColorStop(1, '#501010');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p1x, p1y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(80,20,20,0.4)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(p1x, p1y + 2, 18, 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Icy blue planet
    const p2x = ((W * 0.22 - pOff * 0.6) % (W + 200) + (W + 200)) % (W + 200) - 40;
    const p2y = groundY * 0.20;
    {
      const g = ctx.createRadialGradient(p2x - 5, p2y - 5, 1, p2x, p2y, 14);
      g.addColorStop(0, '#90ccff'); g.addColorStop(0.6, '#3878c8'); g.addColorStop(1, '#08295a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p2x, p2y, 14, 0, Math.PI * 2); ctx.fill();
    }

    // --- Large glowing moon ---
    const mOff = scroll * 0.030;
    const moonX = ((W * 0.62 - mOff) % (W + 340) + (W + 340)) % (W + 340) - 60;
    const moonY = groundY * 0.17;
    const moonR = 42;
    // glow halo
    const mglow = ctx.createRadialGradient(moonX, moonY, moonR * 0.7, moonX, moonY, moonR * 2.4);
    mglow.addColorStop(0, 'rgba(230,225,180,0.20)'); mglow.addColorStop(1, 'rgba(220,210,120,0)');
    ctx.fillStyle = mglow; ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 2.4, 0, Math.PI * 2); ctx.fill();
    // body
    const mg2 = ctx.createRadialGradient(moonX - moonR * 0.2, moonY - moonR * 0.28, moonR * 0.08, moonX, moonY, moonR);
    mg2.addColorStop(0, '#fffff5'); mg2.addColorStop(0.5, '#f0e8c0'); mg2.addColorStop(1, '#c0a868');
    ctx.fillStyle = mg2; ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
    // craters
    ctx.fillStyle = 'rgba(150,128,80,0.32)';
    [[10, -9, 7], [-12, 11, 5], [4, 17, 4], [-6, -16, 3]].forEach(([dx, dy, r]) => {
      ctx.beginPath(); ctx.arc(moonX + dx, moonY + dy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,180,120,0.5)';
      ctx.beginPath(); ctx.arc(moonX + dx - 1, moonY + dy - 1, r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(150,128,80,0.32)';
    });

    // --- Cloud floor — thick fluffy cloud layer ---
    const cOff = scroll * 0.96;
    // solid base
    ctx.fillStyle = '#c0d0e8';
    ctx.fillRect(0, groundY - 14, W, H - groundY + 14);
    // fluffy cloud tops
    function cloudPuff(cx, cy, r, col){
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx,         cy,         r,         0, Math.PI * 2);
      ctx.arc(cx + r*0.9, cy - r*0.2, r * 0.78,  0, Math.PI * 2);
      ctx.arc(cx + r*1.7, cy,         r * 0.85,  0, Math.PI * 2);
      ctx.arc(cx + r*0.8, cy + r*0.3, r * 0.62,  0, Math.PI * 2);
      ctx.fill();
    }
    for(let i = 0; i < 14; i++){
      const cx2 = ((i * 131 + 18 - cOff) % (W + 300) + (W + 300)) % (W + 300) - 150;
      const cy2 = groundY - 12 + (i * 23) % 20;
      const cr  = 40 + (i * 17) % 30;
      cloudPuff(cx2, cy2, cr, i % 2 === 0 ? '#eef2fc' : '#f4f8ff');
    }
    // second, slightly higher cloud row
    for(let i = 0; i < 8; i++){
      const cx2 = ((i * 179 + 85 - cOff * 0.70) % (W + 220) + (W + 220)) % (W + 220) - 110;
      const cy2 = groundY - 55 + (i * 29) % 22;
      const cr  = 22 + (i * 19) % 20;
      cloudPuff(cx2, cy2, cr, '#d8e4f2');
    }
    // solid band below clouds (fills to bottom)
    ctx.fillStyle = '#a0b8d4'; ctx.fillRect(0, groundY + 20, W, H - groundY - 20);
  }
  // ======= END LEVEL 3 BACKGROUND ==========================================

  // ======= LEVEL 4 — DEEP SPACE BACKGROUND =================================
  function drawBackgroundLevel4(scroll){
    const W = canvas.width, H = canvas.height;

    // --- Black space fill ---
    ctx.fillStyle = '#000008'; ctx.fillRect(0, 0, W, H);

    // --- Deep parallax nebulae ---
    const nOff = scroll * 0.06;
    const nebCols = ['rgba(80,18,130,0.11)','rgba(0,55,140,0.09)','rgba(130,0,75,0.09)'];
    for(let i = 0; i < 4; i++){
      const nx = ((i * 241 + 50 - nOff) % (W + 480) + (W + 480)) % (W + 480) - 240;
      const ny = H * (0.14 + (i * 0.22) % 0.72);
      const nr = 110 + (i * 71) % 130;
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      ng.addColorStop(0, nebCols[i % 3]); ng.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.ellipse(nx, ny, nr * 1.7, nr, i * 0.45, 0, Math.PI * 2); ctx.fill();
    }

    // --- Far star field (tiny dots, very slow) ---
    const s1 = scroll * 0.04;
    for(let i = 0; i < 90; i++){
      const sx = ((i * 157 + 8 - s1) % (W + 60) + (W + 60)) % (W + 60) - 30;
      const sy = (i * 53) % H;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + (i % 7) * 0.08})`;
      ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.35, 0, Math.PI * 2); ctx.fill();
    }
    // --- Mid star field ---
    const s2 = scroll * 0.14;
    for(let i = 0; i < 50; i++){
      const sx = ((i * 211 + 70 - s2) % (W + 80) + (W + 80)) % (W + 80) - 40;
      const sy = (i * 79 + 18) % H;
      ctx.fillStyle = `rgba(255,255,255,${0.45 + (i % 5) * 0.09})`;
      ctx.beginPath(); ctx.arc(sx, sy, 0.8 + (i % 4) * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    // --- Foreground twinkling stars ---
    const s3 = scroll * 0.26;
    const tnow = performance.now() / 1000;
    for(let i = 0; i < 24; i++){
      const sx = ((i * 181 + 38 - s3) % (W + 60) + (W + 60)) % (W + 60) - 30;
      const sy = (i * 97 + 44) % H;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(tnow * 2.8 + i * 1.4));
      ctx.fillStyle = `rgba(255,255,210,${tw})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1.3, 0, Math.PI * 2); ctx.fill();
    }

    // --- Saturn (slow parallax, full rings) ---
    const satOff = scroll * 0.022;
    const satX = ((W * 0.76 - satOff) % (W + 340) + (W + 340)) % (W + 340) - 70;
    const satY = H * 0.21;
    const satR = 38;
    ctx.save();
    ctx.translate(satX, satY); ctx.rotate(-0.16);
    // rings behind globe
    ctx.strokeStyle = 'rgba(200,165,105,0.50)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(0, 0, satR * 2.3, satR * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(215,175,120,0.32)'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.ellipse(0, 0, satR * 2.8, satR * 0.56, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // globe
    const sg = ctx.createRadialGradient(satX - satR * 0.26, satY - satR * 0.3, satR * 0.05, satX, satY, satR);
    sg.addColorStop(0, '#ffe8bc'); sg.addColorStop(0.5, '#d4a048'); sg.addColorStop(1, '#7a4410');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(satX, satY, satR, 0, Math.PI * 2); ctx.fill();
    for(let bi = 0; bi < 4; bi++){
      ctx.save(); ctx.translate(satX, satY);
      ctx.strokeStyle = ['rgba(180,120,50,0.38)','rgba(160,100,38,0.28)','rgba(195,138,68,0.22)','rgba(140,78,28,0.18)'][bi];
      ctx.lineWidth = 3 + bi;
      ctx.beginPath(); ctx.ellipse(0, bi * 6 - 9, satR * (0.65 + bi*0.1), satR * (0.10 - bi*0.01), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // ring front (clip lower half)
    ctx.save(); ctx.translate(satX, satY); ctx.rotate(-0.16);
    ctx.save(); ctx.beginPath(); ctx.rect(-satR * 3.5, 0, satR * 7, satR * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(200,165,105,0.50)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(0, 0, satR * 2.3, satR * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(215,175,120,0.32)'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.ellipse(0, 0, satR * 2.8, satR * 0.56, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore(); ctx.restore();

    // --- Other distant planets ---
    const pOff2 = scroll * 0.031;
    // Ice-blue giant
    {
      const px = ((W * 0.17 - pOff2) % (W + 220) + (W + 220)) % (W + 220) - 40;
      const py = H * 0.74;
      const pr = 30;
      const g = ctx.createRadialGradient(px - pr*0.3, py - pr*0.3, pr*0.05, px, py, pr);
      g.addColorStop(0, '#a8e8ff'); g.addColorStop(0.5, '#2885c8'); g.addColorStop(1, '#082855');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,225,255,0.32)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py, pr*0.9, pr*0.22, 0.35, 0, Math.PI*2); ctx.stroke();
    }
    // Green-brown gas giant
    {
      const px = ((W * 0.50 - pOff2 * 0.55) % (W + 200) + (W + 200)) % (W + 200) - 40;
      const py = H * 0.87;
      const pr = 20;
      const g = ctx.createRadialGradient(px - pr*0.3, py - pr*0.3, pr*0.05, px, py, pr);
      g.addColorStop(0, '#b0ff90'); g.addColorStop(0.5, '#308840'); g.addColorStop(1, '#0a2e10');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    }
    // Purple planet far right
    {
      const px = ((W * 0.88 - pOff2 * 1.2) % (W + 180) + (W + 180)) % (W + 180) - 30;
      const py = H * 0.62;
      const pr = 16;
      const g = ctx.createRadialGradient(px - pr*0.3, py - pr*0.3, pr*0.05, px, py, pr);
      g.addColorStop(0, '#e090ff'); g.addColorStop(0.5, '#8030b0'); g.addColorStop(1, '#280840');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    }
  }
  // ======= END LEVEL 4 BACKGROUND ==========================================

  // ======= LEVEL 5 BACKGROUND — inside a luxury silk-lined handbag ==========
  function drawBackgroundLevel5(scroll){
    const W = canvas.width, H = canvas.height;
    const groundY = H - 80;
    const now = performance.now() / 1000;
    ctx.save();

    // --- Silk base gradient — deep rose/blush, lit from the bag opening above ---
    const silkBase = ctx.createLinearGradient(0, 0, 0, H);
    silkBase.addColorStop(0,    '#2e0520'); // darkest near zip
    silkBase.addColorStop(0.10, '#6a0e3a'); // rich rose-shadow
    silkBase.addColorStop(0.42, '#c03068'); // main blush-rose mid-body
    silkBase.addColorStop(0.70, '#9a2050'); // lower body shadow
    silkBase.addColorStop(1,    '#3e0828'); // floor depth
    ctx.fillStyle = silkBase;
    ctx.fillRect(0, 0, W, H);

    // --- Soft top-light from bag opening ---
    const openGlow = ctx.createRadialGradient(W*0.5, 0, 0, W*0.5, H*0.18, H*0.58);
    openGlow.addColorStop(0,   'rgba(255,210,230,0.32)');
    openGlow.addColorStop(0.45,'rgba(220,80,130,0.10)');
    openGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = openGlow; ctx.fillRect(0, 0, W, H);

    // --- Drape folds — vertical light/shadow columns simulating gathered silk ---
    const numFolds = 8;
    const foldW = W / numFolds;
    for(let f = 0; f < numFolds; f++){
      const peakX = W * (f + 0.5) / numFolds
                  + Math.sin(now * 0.35 + f * 1.7) * 5; // gentle breathing

      // shadow valley to the right of each peak
      const sG = ctx.createLinearGradient(peakX, 0, peakX + foldW * 0.65, 0);
      sG.addColorStop(0,   'rgba(50,0,25,0.00)');
      sG.addColorStop(0.30,'rgba(50,0,25,0.32)');
      sG.addColorStop(1,   'rgba(50,0,25,0.00)');
      ctx.fillStyle = sG;
      ctx.fillRect(peakX, 0, foldW * 0.65, groundY);

      // highlight ridge just to the left of each peak
      const hG = ctx.createLinearGradient(peakX - foldW * 0.30, 0, peakX, 0);
      hG.addColorStop(0,   'rgba(255,180,210,0.00)');
      hG.addColorStop(0.65,'rgba(255,190,218,0.20)');
      hG.addColorStop(1,   'rgba(255,190,218,0.00)');
      ctx.fillStyle = hG;
      ctx.fillRect(peakX - foldW * 0.30, 0, foldW * 0.30, groundY);

      // sharp crease line at peak
      const cG = ctx.createLinearGradient(peakX - 2.5, 0, peakX + 2.5, 0);
      cG.addColorStop(0,   'rgba(80,0,35,0.00)');
      cG.addColorStop(0.5, 'rgba(80,0,35,0.50)');
      cG.addColorStop(1,   'rgba(80,0,35,0.00)');
      ctx.fillStyle = cG;
      ctx.fillRect(peakX - 2.5, 0, 5, groundY);
    }

    // --- Quilted diamond pattern (Chanel-style) — slow parallax ---
    const qSize = 42;
    const qOff = (scroll * 0.20) % qSize;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,150,185,0.20)'; ctx.lineWidth = 1;
    // ↘ diagonals
    for(let qi = -qSize * 2; qi < W + groundY; qi += qSize){
      ctx.beginPath();
      ctx.moveTo(qi - qOff, 0);
      ctx.lineTo(qi - qOff + groundY, groundY);
      ctx.stroke();
    }
    // ↙ diagonals
    for(let qi = -qSize; qi < W + qSize; qi += qSize){
      ctx.beginPath();
      ctx.moveTo(qi - qOff, 0);
      ctx.lineTo(qi - qOff - groundY, groundY);
      ctx.stroke();
    }
    // tiny gold stud dots at each diamond intersection
    ctx.fillStyle = 'rgba(255,215,170,0.38)';
    for(let qxi = -qSize * 2; qxi < W + qSize; qxi += qSize){
      for(let qrow = 0; qrow <= groundY; qrow += qSize){
        const halfShift = (Math.round(qrow / qSize) % 2 === 0) ? 0 : qSize * 0.5;
        const dx = qxi - qOff + halfShift;
        const dy = qrow;
        // stud: tiny filled circle with a specular dot
        ctx.beginPath(); ctx.arc(dx, dy, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,220,0.55)';
        ctx.beginPath(); ctx.arc(dx - 0.8, dy - 0.8, 1.0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,215,170,0.38)';
      }
    }
    ctx.restore();

    // --- Animated silk sheen — a single diagonal highlight band that sweeps slowly ---
    const sheenX = ((scroll * 0.18 + now * 18) % (W * 2.2));
    const sheenG = ctx.createLinearGradient(sheenX - W*0.35, 0, sheenX + W*0.08, H*0.7);
    sheenG.addColorStop(0,   'rgba(255,230,242,0.00)');
    sheenG.addColorStop(0.42,'rgba(255,235,245,0.13)');
    sheenG.addColorStop(0.50,'rgba(255,248,252,0.24)');
    sheenG.addColorStop(0.58,'rgba(255,235,245,0.13)');
    sheenG.addColorStop(1,   'rgba(255,230,242,0.00)');
    ctx.fillStyle = sheenG; ctx.fillRect(0, 0, W, H);

    // --- Curved side-wall darkening — bag is rounded so edges recede ---
    const lwG = ctx.createLinearGradient(0, 0, W*0.20, 0);
    lwG.addColorStop(0, 'rgba(25,0,15,0.75)'); lwG.addColorStop(1, 'rgba(25,0,15,0.00)');
    ctx.fillStyle = lwG; ctx.fillRect(0, 0, W*0.20, H);
    const rwG = ctx.createLinearGradient(W*0.80, 0, W, 0);
    rwG.addColorStop(0, 'rgba(25,0,15,0.00)'); rwG.addColorStop(1, 'rgba(25,0,15,0.75)');
    ctx.fillStyle = rwG; ctx.fillRect(W*0.80, 0, W*0.20, H);

    // --- Gold zipper track along the top ---
    // tape backing
    const tapeG = ctx.createLinearGradient(0, 0, 0, 16);
    tapeG.addColorStop(0, '#e8c8d8'); tapeG.addColorStop(1, '#b89aac');
    ctx.fillStyle = tapeG; ctx.fillRect(0, 0, W, 16);
    // gold zipper teeth
    const teethOff = (scroll * 0.5) % 20;
    for(let tx = -20 + teethOff % 20; tx < W + 12; tx += 20){
      const tg = ctx.createLinearGradient(tx, 0, tx + 8, 15);
      tg.addColorStop(0, '#ffe898'); tg.addColorStop(0.5, '#d4a030'); tg.addColorStop(1, '#8a6010');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.roundRect(tx,      1, 8, 13, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(tx + 10, 1, 8, 13, 2); ctx.fill();
      // specular glint on each tooth
      ctx.fillStyle = 'rgba(255,255,200,0.45)';
      ctx.beginPath(); ctx.ellipse(tx + 2.5, 4, 2, 1.2, -0.3, 0, Math.PI * 2); ctx.fill();
    }
    // gold zipper pull with glint
    const zipX = ((W * 0.46 - scroll * 0.6) % (W + 80) + W + 80) % (W + 80);
    const zpG = ctx.createLinearGradient(zipX - 16, 0, zipX + 16, 20);
    zpG.addColorStop(0, '#ffe898'); zpG.addColorStop(0.5, '#c89020'); zpG.addColorStop(1, '#806010');
    ctx.fillStyle = zpG;
    ctx.beginPath(); ctx.roundRect(zipX - 18, -4, 36, 23, 7); ctx.fill();
    ctx.strokeStyle = '#7a5808'; ctx.lineWidth = 1.2; ctx.stroke();
    // engraved ring
    ctx.strokeStyle = 'rgba(255,240,160,0.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(zipX, 7, 6, 4, 0, 0, Math.PI * 2); ctx.stroke();
    // glint
    ctx.fillStyle = 'rgba(255,255,210,0.70)';
    ctx.beginPath(); ctx.ellipse(zipX - 6, 2, 4, 2, -0.5, 0, Math.PI * 2); ctx.fill();

    // --- Scattered clutter details (parallax, non-game-object) ---
    // coins (lying flat, ellipse foreshortening)
    const coinSeeds = [0.12, 0.31, 0.54, 0.71, 0.88];
    coinSeeds.forEach((seed, i) => {
      const cx2 = ((seed * W * 3.2 - scroll * (0.25 + i*0.06)) % (W + 140) + W + 140) % (W + 140) - 70;
      const cy2 = groundY - 18 - seed * 22;
      const cr = 7 + seed * 5;
      const cg = ctx.createRadialGradient(cx2 - cr*0.3, cy2 - cr*0.3, cr*0.1, cx2, cy2, cr);
      cg.addColorStop(0, '#fff0b0'); cg.addColorStop(0.5, '#d4a820'); cg.addColorStop(1, '#7a5c08');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.ellipse(cx2, cy2, cr, cr*0.38, 0.2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#7a5c08'; ctx.lineWidth = 0.8; ctx.stroke();
    });
    // crumpled tissues — tinted pink to match lining
    [0.22, 0.65, 0.85].forEach(seed => {
      const tx2 = ((seed * W * 2.7 - scroll * 0.18) % (W + 200) + W + 200) % (W + 200) - 100;
      const ty2 = groundY - 24 - seed * 18;
      ctx.fillStyle = 'rgba(255,230,240,0.28)';
      ctx.beginPath(); ctx.ellipse(tx2, ty2, 22 + seed*14, 10 + seed*6, seed * 0.8, 0, Math.PI*2); ctx.fill();
    });
    // rose-gold bobby pins
    [0.38, 0.72].forEach(seed => {
      const bpx = ((seed * W * 2.3 - scroll * 0.12) % (W + 120) + W + 120) % (W + 120) - 60;
      const bpy = groundY - 10;
      ctx.strokeStyle = 'rgba(210,145,155,0.65)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bpx, bpy);     ctx.lineTo(bpx + 30, bpy - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bpx + 2, bpy + 4); ctx.lineTo(bpx + 30, bpy + 2); ctx.stroke();
    });

    // --- Bag floor — same silk, slightly darker, compressed ---
    const floorG = ctx.createLinearGradient(0, groundY, 0, H);
    floorG.addColorStop(0,   '#8a1848');
    floorG.addColorStop(0.30,'#6a1035');
    floorG.addColorStop(1,   '#300618');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, W, H - groundY);
    // floor/wall junction fold highlight
    ctx.strokeStyle = 'rgba(220,110,160,0.38)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, groundY + 2); ctx.lineTo(W, groundY + 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,180,210,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY + 9); ctx.lineTo(W, groundY + 9); ctx.stroke();
    // floor crumbs and fluff — rose-toned
    for(let ci = 0; ci < 18; ci++){
      const csx = ((ci * 137 - scroll * 0.4) % (W + 60) + W + 60) % (W + 60) - 30;
      const csy = groundY + 10 + (ci % 5) * 6;
      ctx.fillStyle = `rgba(${180+ci*3},${70+ci*4},${110+ci*2},0.45)`;
      ctx.beginPath(); ctx.arc(csx, csy, 1.5 + (ci%3)*0.8, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  // ======= END LEVEL 5 BACKGROUND ==========================================

  // ======= LEVEL 6 BACKGROUND — STRANGE PORTAL WORLD =======================
  function drawBackgroundLevel6(scroll){
    const W = canvas.width, H = canvas.height;
    const groundY = H - 80;
    const now = performance.now() / 1000;

    // === Deep void sky ===
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#03000e');
    sky.addColorStop(0.45, '#0c0022');
    sky.addColorStop(1, '#180040');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, groundY);

    // === WORMHOLE ===
    const wx = W * 0.5;
    const wy = groundY * 0.42;
    const maxR = Math.min(W, groundY) * 0.30;

    // Ambient outer bloom
    for(let g = 4; g >= 1; g--){
      const gr = maxR * (1.1 + g * 0.22);
      const ag = ctx.createRadialGradient(wx, wy, maxR * 0.7, wx, wy, gr);
      ag.addColorStop(0, `rgba(130,55,255,${0.14 - g*0.02})`);
      ag.addColorStop(1, 'rgba(40,0,110,0)');
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.arc(wx, wy, gr, 0, Math.PI*2); ctx.fill();
    }

    // Concentric rings converging into the void centre
    const ringCount = 18;
    for(let i = 0; i < ringCount; i++){
      const t = ((i/ringCount + now * 0.22) % 1);
      const r = maxR * Math.pow(1 - t, 0.65);  // perspective acceleration
      if(r < 1.5) continue;
      const fade = t < 0.07 ? t/0.07 : (t > 0.88 ? (1-t)/0.12 : 1);
      const hue  = 262 + t * 60;  // purple → magenta
      const lum  = 45  + t * 42;
      ctx.save();
      ctx.strokeStyle = `hsla(${hue},100%,${lum}%,${fade*(0.2+t*0.65)})`;
      ctx.lineWidth   = 1 + t * 2.8;
      ctx.shadowBlur  = 5 + t * 22;
      ctx.shadowColor = `hsla(${hue},100%,78%,0.9)`;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // Spiral tendrils — 3 arms rotating inward
    ctx.save();
    ctx.translate(wx, wy);
    for(let arm = 0; arm < 3; arm++){
      const offset = (arm * Math.PI*2/3) + now * 0.35;
      ctx.beginPath();
      for(let s = 0; s <= 90; s++){
        const frac  = s / 90;
        const angle = offset + frac * Math.PI * 3.5;
        const r     = maxR * (1 - frac * 0.94);
        s === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
                : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
      }
      ctx.strokeStyle = `rgba(175,75,255,${0.10 + arm*0.04})`;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Stars / particles spiraling inward
    for(let i = 0; i < 55; i++){
      const speed = 0.055 + (i%7)*0.012;
      const t     = ((i*0.618 + now*speed) % 1);
      const angle = i*137.508*(Math.PI/180) + t*Math.PI*6;  // 3 full rotations in
      const r     = maxR * Math.pow(1-t, 0.6);
      const sx    = wx + Math.cos(angle)*r;
      const sy    = wy + Math.sin(angle)*r;
      const fade  = t < 0.1 ? t*10 : (t > 0.82 ? (1-t)/0.18 : 1);
      const size  = 0.7 + (1-t)*2.8;
      ctx.fillStyle = `rgba(${210+Math.round(t*45)},${150+Math.round(t*40)},255,${fade*0.85})`;
      ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI*2); ctx.fill();
    }

    // Void — opaque dark centre drawn over rings so they vanish into it
    const voidG = ctx.createRadialGradient(wx, wy, 0, wx, wy, maxR*0.44);
    voidG.addColorStop(0,   '#000004');
    voidG.addColorStop(0.65,'#050014');
    voidG.addColorStop(1,   'rgba(4,0,16,0)');
    ctx.fillStyle = voidG;
    ctx.beginPath(); ctx.arc(wx, wy, maxR*0.44, 0, Math.PI*2); ctx.fill();

    // Event horizon — pulsing bright rim
    const pulse = 0.38 + Math.sin(now*2.3)*0.12;
    const rimG  = ctx.createRadialGradient(wx, wy, maxR*0.84, wx, wy, maxR*1.01);
    rimG.addColorStop(0,   'rgba(240,175,255,0)');
    rimG.addColorStop(0.5, `rgba(240,175,255,${pulse})`);
    rimG.addColorStop(1,   'rgba(140,50,240,0)');
    ctx.fillStyle = rimG;
    ctx.beginPath(); ctx.arc(wx, wy, maxR*1.01, 0, Math.PI*2); ctx.fill();

    // Twisted horizon
    ctx.fillStyle = '#2e155a';
    ctx.beginPath();
    for(let x = 0; x <= W; x += 4){
      const y = groundY - 34 - Math.sin((x+scroll*0.26)*0.018)*18 - Math.sin((x+scroll*0.12)*0.051)*8;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(W, groundY+30); ctx.lineTo(0, groundY+30); ctx.closePath(); ctx.fill();

    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0,   '#3a1a58');
    floor.addColorStop(0.4, '#241240');
    floor.addColorStop(1,   '#110820');
    ctx.fillStyle = floor;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Glowing cracks on floor — portal energy leaking through
    ctx.shadowBlur  = 10;
    ctx.shadowColor = 'rgba(175,100,255,0.9)';
    ctx.strokeStyle = 'rgba(205,130,255,0.72)';
    ctx.lineWidth   = 1.5;
    for(let i = 0; i < 14; i++){
      const sx = ((i*128 - scroll*0.55)%(W+60)+(W+60))%(W+60) - 30;
      const sy = groundY + 8 + (i%3)*8;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+12,sy+4); ctx.lineTo(sx+20,sy+2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
  // ======= END LEVEL 6 BACKGROUND ==========================================

  function drawBelly(belly, overrideX, overrideY, invincible=false, accessories=[]){
    const scale = belly.bonkersScale || 1;
    const drawX = overrideX !== undefined ? overrideX : belly.x;
    const drawY = overrideY !== undefined ? overrideY : belly.y;
    const cx  = drawX + belly.width / 2;
    const bcy = drawY + 24;   // body centre y
    const bw  = 28;             // body semi-width
    const bh  = 24;             // body semi-height

    // walking: 4 frames at 8 fps; freeze frame when airborne
    const frame     = belly.onGround ? Math.floor(belly.animTime * 8) % 4 : 0;
    const midStride = (frame === 1 || frame === 3) && belly.onGround;
    const airborne  = !belly.onGround;

    // Per-frame leg offsets [leftRaise, rightRaise, leftFootSwing, rightFootSwing]
    const LEG = [
      [-6,  2, -5,  3],   // left leg up & forward
      [ 0,  0,  0,  0],   // neutral (landing)
      [ 2, -6,  3, -5],   // right leg up & forward
      [ 0,  0,  0,  0],   // neutral (landing)
    ];
    const [llr, rlr, lfs, rfs] = LEG[frame];
    const legBaseY = bcy + bh - 2;
    const legW = 11, legH = 12;

    ctx.save();  // scale wrapper
    if(scale !== 1){
      const px = cx, py = drawY + belly.height / 2;
      ctx.translate(px, py); ctx.scale(scale, scale); ctx.translate(-px, -py);
    }
    ctx.save();

    // ---- LEGS (behind body) ----
    ctx.fillStyle = '#e05599';

    // left leg + foot
    ctx.beginPath(); ctx.roundRect(cx - 20, legBaseY + llr, legW, legH, 5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 20 + legW/2 + lfs, legBaseY + llr + legH + 5, 13, 6, 0, 0, Math.PI*2); ctx.fill();

    // right leg + foot
    ctx.beginPath(); ctx.roundRect(cx + 8, legBaseY + rlr, legW, legH, 5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 8 + legW/2 + rfs, legBaseY + rlr + legH + 5, 13, 6, 0, 0, Math.PI*2); ctx.fill();

    // ---- JETPACK (level 4 — drawn behind body) ----
    if(belly.hasJetpack){
      const jpNow = performance.now() / 1000;
      const thrusting = belly.vy < -0.4;
      // Pack body — two side cylinders
      const packY = bcy - bh * 0.15;
      [[cx - bw*1.22, -1],[cx + bw*0.85, 1]].forEach(([px, side]) => {
        const pg = ctx.createLinearGradient(px - 7, packY - 14, px + 7, packY + 14);
        pg.addColorStop(0, '#aabbcc'); pg.addColorStop(0.5, '#5577aa'); pg.addColorStop(1, '#233355');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.roundRect(px - 7, packY - 14, 14, 28, 4); ctx.fill();
        ctx.strokeStyle = '#1a2840'; ctx.lineWidth = 1.2; ctx.stroke();
        // nozzle
        ctx.fillStyle = '#334466';
        ctx.beginPath(); ctx.roundRect(px - 5, packY + 12, 10, 7, [0,0,3,3]); ctx.fill();
        // fuel stripe
        ctx.fillStyle = '#ff5da2';
        ctx.beginPath(); ctx.roundRect(px - 7, packY - 2, 14, 4, 1); ctx.fill();
        // FLAME when thrusting
        if(thrusting){
          const flicker = 0.65 + 0.35 * Math.sin(jpNow * 28 + side * 2.1);
          const fLen = 18 * flicker;
          const fGrad = ctx.createLinearGradient(px, packY + 19, px, packY + 19 + fLen);
          fGrad.addColorStop(0,   `rgba(255,240,80,0.95)`);
          fGrad.addColorStop(0.4, `rgba(255,140,20,0.80)`);
          fGrad.addColorStop(1,   `rgba(255,60,0,0)`);
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(px - 5, packY + 19);
          ctx.quadraticCurveTo(px + side * 3 * flicker, packY + 19 + fLen * 0.5, px, packY + 19 + fLen);
          ctx.quadraticCurveTo(px - side * 3 * flicker, packY + 19 + fLen * 0.5, px + 5, packY + 19);
          ctx.closePath(); ctx.fill();
          // inner bright core
          ctx.fillStyle = `rgba(255,255,200,${0.6 * flicker})`;
          ctx.beginPath(); ctx.ellipse(px, packY + 21, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
        }
      });
    }

    // ---- BODY ----
    ctx.save();
    ctx.translate(cx, bcy);
    if      (midStride) { ctx.scale(1.10, 0.91); }
    else if (airborne)  { ctx.scale(0.93, 1.10); }

    // radial gradient — highlight top-left
    const grad = ctx.createRadialGradient(-bw*0.25, -bh*0.35, bh*0.08, 0, 0, bh*1.3);
    grad.addColorStop(0,    '#ffdcee');
    grad.addColorStop(0.55, '#ff79b4');
    grad.addColorStop(1,    '#c8357a');
    ctx.fillStyle = grad;

    // blobby bezier body (not a plain ellipse)
    ctx.beginPath();
    ctx.moveTo(0, -bh);
    ctx.bezierCurveTo( bw*0.55, -bh*1.1,   bw*1.18, -bh*0.3,   bw*1.1,  bh*0.3);
    ctx.bezierCurveTo( bw*1.05,  bh*0.88,  bw*0.55,  bh*1.02,  0,       bh);
    ctx.bezierCurveTo(-bw*0.55,  bh*1.02, -bw*1.05,  bh*0.88, -bw*1.1,  bh*0.3);
    ctx.bezierCurveTo(-bw*1.18, -bh*0.3,  -bw*0.55, -bh*1.1,   0,      -bh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b02870'; ctx.lineWidth = 1.8; ctx.stroke();

    // jelly nubs on top
    ctx.fillStyle = '#ff90be';
    ctx.beginPath(); ctx.ellipse(-bw*0.40, -bh*1.00, 7, 9, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( bw*0.05, -bh*1.08, 6, 8,  0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( bw*0.42, -bh*0.92, 5, 7,  0.5, 0, Math.PI*2); ctx.fill();

    // ---- BELLY FACE (lower body) ----
    ctx.fillStyle = '#fff8fc';
    ctx.beginPath(); ctx.ellipse(0, bh*0.30, bw*0.65, bh*0.50, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#f0b0d0'; ctx.lineWidth = 1.5; ctx.stroke();

    // eyes
    const ey = bh * 0.12;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-bw*0.23, ey, 4.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( bw*0.23, ey, 4.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-bw*0.23 + 1.5, ey - 1.5, 1.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( bw*0.23 + 1.5, ey - 1.5, 1.8, 0, Math.PI*2); ctx.fill();

    // cheeky eyebrows
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-bw*0.34, ey-9); ctx.quadraticCurveTo(-bw*0.22, ey-15, -bw*0.10, ey-10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( bw*0.10, ey-13); ctx.quadraticCurveTo( bw*0.22, ey-16,  bw*0.32, ey- 9); ctx.stroke();

    // big cheeky grin + teeth
    const my = bh * 0.42;
    ctx.beginPath();
    ctx.moveTo(-bw*0.34, my);
    ctx.bezierCurveTo(-bw*0.25, my + bh*0.26, bw*0.25, my + bh*0.26, bw*0.34, my);
    ctx.closePath();
    ctx.fillStyle = '#b02060'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-bw*0.22, my + 1, bw*0.44, bh*0.13);
    ctx.strokeStyle = '#b02060'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, my + 1); ctx.lineTo(0, my + bh*0.14); ctx.stroke();

    // rosy cheeks
    ctx.fillStyle = 'rgba(255,100,160,0.28)';
    ctx.beginPath(); ctx.ellipse(-bw*0.52, bh*0.18, bw*0.20, bh*0.10, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( bw*0.52, bh*0.18, bw*0.20, bh*0.10, 0, 0, Math.PI*2); ctx.fill();

    ctx.restore(); // undo squash/stretch

    // ---- ACCESSORIES ----
    if(accessories && accessories.length){
      const now = performance.now() / 1000;
      const accFrame = belly.onGround ? Math.floor((belly.animTime||0) * 8) % 4 : 0;
      const LEG_ACC = [[-6,2,-5,3],[0,0,0,0],[2,-6,3,-5],[0,0,0,0]];
      const [llrA, rlrA, lfsA, rfsA] = LEG_ACC[accFrame];

      for(const acc of accessories){
        if(acc === 'hat'){
          // === TOP HAT ===
          ctx.save();
          const hatY = bcy - bh * 1.38;
          const tilt = Math.sin(now * 7) * 0.07 + (belly.onGround ? Math.sin((belly.animTime||0)*8)*0.04 : 0.05);
          ctx.translate(cx, hatY); ctx.rotate(tilt);
          // brim
          ctx.fillStyle = '#1a0a2e';
          ctx.beginPath(); ctx.ellipse(0, 7, 24, 7, 0, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#3a1a5e'; ctx.lineWidth = 1.5; ctx.stroke();
          // hat body
          const hg = ctx.createLinearGradient(-13, -28, 13, 4);
          hg.addColorStop(0, '#2a0a50'); hg.addColorStop(1, '#180630');
          ctx.fillStyle = hg;
          ctx.beginPath(); ctx.roundRect(-13, -30, 26, 33, [3,3,0,0]); ctx.fill();
          ctx.strokeStyle = '#4a1a8e'; ctx.lineWidth = 1.5; ctx.stroke();
          // pink band
          ctx.fillStyle = '#ff5da2';
          ctx.fillRect(-13, -1, 26, 7);
          // star on band
          ctx.fillStyle = '#ffe200';
          ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('\u2605', 0, 2.5);
          ctx.restore();
        }

        if(acc === 'boots'){
          // === BOOTS ===
          const legBaseY = bcy + bh - 2;
          const legH = 12, legW = 11;
          const lfx = cx - 20 + legW/2 + lfsA;
          const lfy = legBaseY + llrA + legH + 5;
          const rfx = cx + 8  + legW/2 + rfsA;
          const rfy = legBaseY + rlrA + legH + 5;
          function drawBoot(fx, fy, flip){
            ctx.save();
            ctx.translate(fx, fy); if(flip) ctx.scale(-1, 1);
            // sole
            ctx.fillStyle = '#7a3a00';
            ctx.beginPath(); ctx.ellipse(0, 5, 16, 5, 0, 0, Math.PI*2); ctx.fill();
            // upper
            const bg = ctx.createLinearGradient(-12, -9, 12, 3);
            bg.addColorStop(0, '#e03070'); bg.addColorStop(1, '#aa104a');
            ctx.fillStyle = bg;
            ctx.beginPath(); ctx.roundRect(-12, -9, 24, 12, [5,5,0,0]); ctx.fill();
            ctx.strokeStyle = '#80003a'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(-12, -9, 24, 12, [5,5,0,0]); ctx.stroke();
            // cuff
            ctx.fillStyle = '#ffb6d5';
            ctx.beginPath(); ctx.roundRect(-12, -11, 24, 5, [4,4,0,0]); ctx.fill();
            // heart
            ctx.fillStyle = '#fff'; ctx.font = '7px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('\u2665', 0, -4);
            ctx.restore();
          }
          drawBoot(lfx, lfy, false); drawBoot(rfx, rfy, true);
        }

        if(acc === 'glasses'){
          // === STAR SHADES ===
          const eyeY = bcy + bh * 0.12;
          const ex1  = cx - bw * 0.23;
          const ex2  = cx + bw * 0.23;
          ctx.save();
          // tinted lenses
          ctx.fillStyle = 'rgba(255,220,0,0.55)';
          ctx.beginPath(); ctx.ellipse(ex1, eyeY, 9, 7, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(ex2, eyeY, 9, 7, 0, 0, Math.PI*2); ctx.fill();
          // thick frames
          ctx.strokeStyle = '#222'; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.ellipse(ex1, eyeY, 9, 7, 0, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(ex2, eyeY, 9, 7, 0, 0, Math.PI*2); ctx.stroke();
          // bridge & arms
          ctx.beginPath(); ctx.moveTo(ex1+9, eyeY-1); ctx.lineTo(ex2-9, eyeY-1); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ex1-9, eyeY-1); ctx.lineTo(ex1-20, eyeY+2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ex2+9, eyeY-1); ctx.lineTo(ex2+20, eyeY+2); ctx.stroke();
          // glare sparkle
          ctx.fillStyle = 'rgba(255,255,255,0.82)';
          ctx.beginPath(); ctx.arc(ex1-2, eyeY-3, 2.5, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }

        if(acc === 'pogo-stick'){
          // === POGO STICK ===
          const legBaseY = bcy + bh - 2;
          const stickTop  = legBaseY + 2;
          const compress  = !belly.onGround ? Math.max(0, Math.min(10, -belly.vy * 1.2)) : 0;
          const psx = cx - 2;
          const rodLen    = Math.max(2, 14 - compress);
          const coilTotalH = Math.max(4, 12 - compress * 0.8);
          ctx.save();
          // rod
          const rg = ctx.createLinearGradient(psx-3, 0, psx+3, 0);
          rg.addColorStop(0, '#ddd'); rg.addColorStop(1, '#888');
          ctx.fillStyle = rg; ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(psx-3, stickTop, 6, rodLen, 2); ctx.fill(); ctx.stroke();
          // spring coils
          ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
          const coilStartY = stickTop + rodLen;
          const coils = 5;
          ctx.beginPath();
          for(let ci = 0; ci <= coils; ci++){
            const cy2 = coilStartY + (ci / coils) * coilTotalH;
            const cxo = psx + (ci % 2 === 0 ? 6 : -6);
            ci === 0 ? ctx.moveTo(cxo, cy2) : ctx.lineTo(cxo, cy2);
          }
          ctx.stroke();
          // tip ball
          const tipY = coilStartY + coilTotalH + 5;
          const tg = ctx.createRadialGradient(psx-1, tipY-1, 1, psx, tipY, 5.5);
          tg.addColorStop(0, '#ff90cc'); tg.addColorStop(1, '#cc2266');
          ctx.fillStyle = tg;
          ctx.beginPath(); ctx.arc(psx, tipY, 5.5, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#880033'; ctx.lineWidth = 1; ctx.stroke();
          // handle grips
          ctx.fillStyle = '#ff5da2';
          ctx.beginPath(); ctx.roundRect(psx-11, stickTop-5, 9, 5, [3,3,0,0]); ctx.fill();
          ctx.beginPath(); ctx.roundRect(psx+2,  stickTop-5, 9, 5, [3,3,0,0]); ctx.fill();
          ctx.restore();
        }

        if(acc === 'coat'){
          // === FANCY COAT ===
          const sway = Math.sin(now * 6) * 2.5;
          const bob  = belly.onGround ? Math.sin((belly.animTime||0)*8) * 1.5 : 0;
          ctx.save();
          // left flap
          ctx.fillStyle = '#1a4fa8';
          ctx.beginPath();
          ctx.moveTo(cx-2, bcy - bh*0.65 + bob);
          ctx.bezierCurveTo(cx - bw*0.9 + sway, bcy - bh*0.3 + bob, cx - bw*1.15 + sway, bcy + bh*0.2, cx - bw*0.45 + sway*0.5, bcy + bh*0.98);
          ctx.lineTo(cx-2, bcy + bh*0.5); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#0d3070'; ctx.lineWidth = 1.5; ctx.stroke();
          // right flap
          ctx.fillStyle = '#2255b8';
          ctx.beginPath();
          ctx.moveTo(cx+2, bcy - bh*0.65 + bob);
          ctx.bezierCurveTo(cx + bw*0.9 - sway, bcy - bh*0.3 + bob, cx + bw*1.15 - sway, bcy + bh*0.2, cx + bw*0.45 - sway*0.5, bcy + bh*0.98);
          ctx.lineTo(cx+2, bcy + bh*0.5); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#0d3070'; ctx.lineWidth = 1.5; ctx.stroke();
          // lapels
          ctx.fillStyle = '#eef0ff';
          ctx.beginPath(); ctx.moveTo(cx, bcy - bh*0.55 + bob); ctx.lineTo(cx-9, bcy - bh*0.75 + bob); ctx.lineTo(cx-6, bcy - bh*0.25 + bob); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx, bcy - bh*0.55 + bob); ctx.lineTo(cx+9, bcy - bh*0.75 + bob); ctx.lineTo(cx+6, bcy - bh*0.25 + bob); ctx.closePath(); ctx.fill();
          // buttons
          ctx.fillStyle = '#ffe200';
          for(let bi2 = 0; bi2 < 3; bi2++){
            const bY = bcy - bh*0.1 + bi2 * bh*0.38 + bob;
            ctx.beginPath(); ctx.arc(cx, bY, 3, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.restore();
        }

        if(acc === 'necklace'){
          // === JEWEL NECKLACE ===
          const swing    = Math.sin(now * 7) * 1.8;
          const neckY    = bcy - bh * 0.62;
          const spread   = bw * 1.3;
          const beadCols = ['#ff0044','#ff8800','#ffe200','#00bb44','#0066ff','#9900cc','#ff5da2','#00cccc','#ff4400'];
          const beads    = 9;
          ctx.save();
          // string
          ctx.strokeStyle = 'rgba(160,100,0,0.55)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
          ctx.beginPath();
          for(let ni = 0; ni < beads; ni++){
            const t  = (ni / (beads - 1)) - 0.5;
            const bx = cx + t * spread + swing * t;
            const by = neckY + t * t * 14 + swing * Math.abs(t) * 0.5;
            ni === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
          }
          ctx.stroke();
          // beads
          for(let ni = 0; ni < beads; ni++){
            const t  = (ni / (beads - 1)) - 0.5;
            const bx = cx + t * spread + swing * t;
            const by = neckY + t * t * 14 + swing * Math.abs(t) * 0.5;
            ctx.fillStyle = beadCols[ni % beadCols.length];
            ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1; ctx.stroke();
            // shine
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.beginPath(); ctx.arc(bx-1.2, by-1.5, 1.8, 0, Math.PI*2); ctx.fill();
          }
          // diamond pendant
          const pndX = cx + swing * 0.6;
          const pndY = neckY + 18;
          ctx.fillStyle = '#ff2288';
          ctx.beginPath(); ctx.moveTo(pndX, pndY+9); ctx.lineTo(pndX-7, pndY); ctx.lineTo(pndX, pndY-7); ctx.lineTo(pndX+7, pndY); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#cc0066'; ctx.lineWidth = 1.5; ctx.stroke();
          // pendant shine
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.beginPath(); ctx.arc(pndX-2, pndY-1, 2.5, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();
    ctx.restore(); // scale wrapper
  }

  function drawBonkersFlash(t){
    // white strobe
    ctx.fillStyle = `rgba(255,255,200,${Math.abs(Math.sin(t * 10)) * 0.65})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // lightning bolts
    ctx.save();
    for(let b = 0; b < 3; b++){
      if(Math.random() > 0.55) continue;
      ctx.strokeStyle = b === 0 ? '#ffffa0' : 'rgba(255,255,160,0.85)';
      ctx.lineWidth = 4 - b * 1.2;
      ctx.shadowBlur = 24; ctx.shadowColor = '#ffff50';
      ctx.beginPath();
      let lx = 80 + b * (canvas.width * 0.35) + (Math.random()-0.5)*120, ly = 0;
      ctx.moveTo(lx, ly);
      while(ly < canvas.height){
        lx = Math.max(10, Math.min(canvas.width-10, lx + (Math.random()-0.5)*90));
        ly += 18 + Math.random()*38;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0; ctx.restore();
    // BONKERS MODE! rainbow flashing text
    const cols = ['#ffe200','#ff5da2','#00ffee','#ff6a00','#ffffff'];
    const col  = cols[Math.floor(t * 7) % cols.length];
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 6));
    const fs    = Math.max(26, Math.min(68, canvas.width * 0.08));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${fs}px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40; ctx.shadowColor = col;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('BONKERS MODE!', canvas.width/2 + 4, canvas.height/2 + 6);
    ctx.fillStyle = col;
    ctx.fillText('BONKERS MODE!', canvas.width/2, canvas.height/2);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  function drawBonkersShake(t){
    ctx.fillStyle = 'rgba(20,0,50,0.42)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBonkersFlash(t);
  }

  function drawBonkersRunLines(){
    ctx.save();
    // BONKERS banner
    ctx.globalAlpha = 0.85;
    ctx.font = `bold 13px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe200';
    ctx.shadowBlur = 14; ctx.shadowColor = '#ff8800';
    ctx.fillText('\u26A1 BONKERS \u26A1', canvas.width / 2, 54);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawLevelComplete(timer, level){
    const W = canvas.width, H = canvas.height;
    // Soft golden wash
    ctx.fillStyle = `rgba(255,240,100,${0.10 + 0.05 * Math.sin(timer * 10)})`;
    ctx.fillRect(0, 0, W, H);
    // Confetti stars orbiting the centre
    ctx.save();
    const confettiCols = ['#ffe200','#ff5da2','#00ffee','#ff6a00','#aaffaa','#ff88ff','#ffffff'];
    for(let i = 0; i < 30; i++){
      const angle = (i / 30) * Math.PI * 2 + timer * (i % 2 === 0 ? 1.8 : -1.4);
      const dist  = 100 + Math.sin(timer * 3 + i * 0.8) * 60;
      const px    = W / 2 + Math.cos(angle) * dist * 2.4;
      const py    = H / 2 + Math.sin(angle) * dist * 0.85 - 50;
      const r     = 4 + Math.abs(Math.sin(timer * 5 + i)) * 5;
      ctx.fillStyle   = confettiCols[i % confettiCols.length];
      ctx.globalAlpha = 0.65 + 0.35 * Math.abs(Math.sin(timer * 4 + i));
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Bouncing LEVEL COMPLETE text
    const fs  = Math.max(18, Math.min(50, W * 0.062));
    const col = ['#ffe200','#ff5da2','#ffffff','#ff6a00'][Math.floor(timer * 5) % 4];
    const bob = Math.abs(Math.sin(timer * 8)) * 10;
    const completeTxt = level >= 6 ? 'LEVEL 6 DONE!' :
              level >= 5 ? 'LEVEL 5 DONE!' :
                        level === 4 ? 'LEVEL 4 DONE!' :
                        level === 3 ? 'LEVEL 3 DONE!' :
                        level === 2 ? 'LEVEL 2 DONE!' : 'LEVEL 1 DONE!';
    ctx.save();
    ctx.font = `bold ${fs}px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 38; ctx.shadowColor = col;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(completeTxt, W/2 + 4, H/2 - fs - bob + 5);
    ctx.fillStyle = col;
    ctx.fillText(completeTxt, W/2, H/2 - fs - bob);
    ctx.shadowBlur = 0;
    // big star emoji below
    ctx.font = `${fs * 1.15}px sans-serif`;
    ctx.fillText('\u2b50', W/2, H/2 + 6 - bob * 0.5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  function drawObstacle(o, bonkers){
    ctx.save();
    if(bonkers){
      ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
      ctx.scale(2, 2);
      ctx.translate(-(o.x + o.w / 2), -(o.y + o.h / 2));
    }
    // prefer image assets when available
    const img = Assets.images[o.kind];
    if(img && img.complete){ ctx.drawImage(img, o.x, o.y, o.w, o.h); ctx.restore(); return; }
    if(o.kind==='toy-large'){
      ctx.fillStyle = '#f4b1b1'; ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h/2,o.w/2,o.h/2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7a4a31'; ctx.fillRect(o.x+o.w*0.25,o.y+o.h*0.55,o.w*0.5,o.h*0.18);
    } else if(o.kind==='toy-ball'){
      ctx.fillStyle='#ffd24d'; ctx.beginPath(); ctx.arc(o.x+o.w/2,o.y+o.h/2,o.w/2,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#d18d2b'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(o.x+o.w/2,o.y+o.h/2,o.w/4,0,Math.PI*2); ctx.stroke();
    } else if(o.kind==='ant'){
      // === MOVING ANT ===
      const at = (o.wriggleTimer || 0);
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const legSwing = Math.sin(at * 14) * 8;
      ctx.save();
      // Legs (three pairs)
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for(let li = 0; li < 3; li++){
        const phase = li * (Math.PI * 2 / 3);
        const lx = o.x + o.w * 0.25 + li * o.w * 0.22;
        const swing = Math.sin(at * 14 + phase) * 8;
        // left leg
        ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(lx - 10, cy + 12 + swing); ctx.stroke();
        // right leg  
        ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(lx + 2, cy + 12 - swing); ctx.stroke();
      }
      // Antennae
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(o.x + o.w*0.78, o.y + o.h*0.22); ctx.lineTo(o.x + o.w*0.95, o.y - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(o.x + o.w*0.78, o.y + o.h*0.22); ctx.lineTo(o.x + o.w*1.05, o.y + 2); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(o.x + o.w*0.95, o.y - 6, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(o.x + o.w*1.05, o.y + 2, 2.5, 0, Math.PI*2); ctx.fill();
      // Three body segments
      const segCols = ['#0a0a0a','#1a1a1a','#0d0d0d'];
      const segX    = [o.x + o.w*0.72, o.x + o.w*0.45, o.x + o.w*0.15];
      const segRX   = [o.w * 0.16, o.w * 0.18, o.w * 0.22];
      const segRY   = [o.h * 0.28, o.h * 0.35, o.h * 0.42];
      for(let si = 0; si < 3; si++){
        const sg = ctx.createRadialGradient(segX[si]-segRX[si]*0.25, o.y+o.h*0.3-segRY[si]*0.2, 1, segX[si], o.y+o.h*0.35, segRX[si]);
        sg.addColorStop(0, '#404040'); sg.addColorStop(1, segCols[si]);
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.ellipse(segX[si], o.y + o.h * 0.38, segRX[si], segRY[si], 0, 0, Math.PI*2); ctx.fill();
        // segment shine
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.ellipse(segX[si]-segRX[si]*0.2, o.y+o.h*0.28, segRX[si]*0.35, segRY[si]*0.25, -0.3, 0, Math.PI*2); ctx.fill();
      }
      // Eyes on head
      ctx.fillStyle = '#ff2200';
      ctx.beginPath(); ctx.arc(o.x + o.w*0.68, o.y + o.h*0.28, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(o.x + o.w*0.82, o.y + o.h*0.28, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='worm'){
      // === WRIGGLING WORM ===
      const wt = (o.wriggleTimer || 0);
      ctx.save();
      const segs = 7;
      const segW = o.w / segs;
      for(let wi = 0; wi < segs; wi++){
        const phase = wi * 0.7;
        const wigY  = o.y + o.h * 0.5 + Math.sin(wt * 8 + phase) * (o.h * 0.28);
        const t     = wi / (segs - 1);
        const r     = o.h * (0.42 - 0.12 * t); // taper toward tail
        const seg_x = o.x + segW * wi + segW * 0.5;
        // worm body segment
        const wg = ctx.createRadialGradient(seg_x - r*0.25, wigY - r*0.25, 1, seg_x, wigY, r);
        wg.addColorStop(0, '#d46a80'); wg.addColorStop(0.6, '#c0405a'); wg.addColorStop(1, '#8a2230');
        ctx.fillStyle = wg;
        ctx.beginPath(); ctx.ellipse(seg_x, wigY, r, r * 0.78, 0, 0, Math.PI*2); ctx.fill();
        // segment ring line
        if(wi < segs - 1){
          ctx.strokeStyle = 'rgba(120,30,50,0.45)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(seg_x + segW*0.45, wigY, 1.5, r * 0.65, 0, 0, Math.PI*2); ctx.stroke();
        }
      }
      // worm head
      const headX = o.x + segW * 0.5;
      const headY = o.y + o.h * 0.5 + Math.sin(wt * 8) * (o.h * 0.28);
      ctx.fillStyle = '#e87090';
      ctx.beginPath(); ctx.ellipse(headX, headY, o.h * 0.48, o.h * 0.42, 0, 0, Math.PI*2); ctx.fill();
      // eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(headX - 4, headY - 3, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(headX + 4, headY - 3, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(headX - 3, headY - 4, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(headX + 5, headY - 4, 1.2, 0, Math.PI*2); ctx.fill();
      // smile
      ctx.strokeStyle = '#7a1830'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(headX, headY + 2, 4, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='roman-pot'){
      // === ANCIENT ROMAN AMPHORA ===
      const cx = o.x + o.w / 2;
      ctx.save();
      // base shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(cx, o.y + o.h, o.w*0.35, o.h*0.05, 0, 0, Math.PI*2); ctx.fill();
      // pot body gradient
      const potG = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
      potG.addColorStop(0,   '#d4673a');
      potG.addColorStop(0.35,'#c85828');
      potG.addColorStop(0.7, '#a8401a');
      potG.addColorStop(1,   '#7a2c10');
      ctx.fillStyle = potG;
      // amphora silhouette: narrow neck → wide belly → narrow base → foot
      ctx.beginPath();
      ctx.moveTo(cx - o.w*0.12, o.y);                                   // neck left
      ctx.bezierCurveTo(cx - o.w*0.30, o.y + o.h*0.18, cx - o.w*0.50, o.y + o.h*0.30, cx - o.w*0.48, o.y + o.h*0.62);
      ctx.bezierCurveTo(cx - o.w*0.46, o.y + o.h*0.82, cx - o.w*0.22, o.y + o.h*0.95, cx, o.y + o.h);
      ctx.bezierCurveTo(cx + o.w*0.22, o.y + o.h*0.95, cx + o.w*0.46, o.y + o.h*0.82, cx + o.w*0.48, o.y + o.h*0.62);
      ctx.bezierCurveTo(cx + o.w*0.50, o.y + o.h*0.30, cx + o.w*0.30, o.y + o.h*0.18, cx + o.w*0.12, o.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6a2008'; ctx.lineWidth = 1.8; ctx.stroke();
      // rim at top
      ctx.fillStyle = '#e07848';
      ctx.beginPath(); ctx.ellipse(cx, o.y, o.w*0.14, o.h*0.04, 0, 0, Math.PI*2); ctx.fill();
      // handles (two arcs)
      ctx.strokeStyle = '#a04020'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx - o.w*0.44, o.y + o.h*0.28, o.w*0.18, -1.0, 0.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + o.w*0.44, o.y + o.h*0.28, o.w*0.18, Math.PI - 0.4, Math.PI + 1.0, true); ctx.stroke();
      // decorative band
      ctx.strokeStyle = '#8a3010'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, o.y + o.h*0.38, o.w*0.43, o.h*0.04, 0, 0, Math.PI*2); ctx.stroke();
      // crack detail
      ctx.strokeStyle = 'rgba(80,20,0,0.5)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - o.w*0.1, o.y + o.h*0.45);
      ctx.lineTo(cx - o.w*0.05, o.y + o.h*0.52); ctx.lineTo(cx, o.y + o.h*0.61); ctx.stroke();
      // highlight
      const hlG = ctx.createLinearGradient(cx - o.w*0.35, o.y + o.h*0.2, cx - o.w*0.1, o.y + o.h*0.55);
      hlG.addColorStop(0, 'rgba(255,200,160,0.38)'); hlG.addColorStop(1, 'rgba(255,180,120,0)');
      ctx.fillStyle = hlG;
      ctx.beginPath();
      ctx.bezierCurveTo(cx - o.w*0.30, o.y + o.h*0.18, cx - o.w*0.50, o.y + o.h*0.30, cx - o.w*0.48, o.y + o.h*0.62);
      ctx.bezierCurveTo(cx - o.w*0.22, o.y + o.h*0.40, cx - o.w*0.22, o.y + o.h*0.18, cx - o.w*0.12, o.y);
      ctx.fill();
      ctx.restore();
    } else if(o.kind==='boulder'){
      // === BOULDER ===
      const cx = o.x + o.w / 2, cy = o.y + o.h * 0.52;
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(cx, o.y + o.h, o.w*0.42, o.h*0.06, 0, 0, Math.PI*2); ctx.fill();
      // boulder body — slightly irregular ellipse drawn as bezier
      const boulderG = ctx.createRadialGradient(cx - o.w*0.18, cy - o.h*0.15, o.w*0.05, cx, cy, o.w*0.56);
      boulderG.addColorStop(0,   '#9a8888');
      boulderG.addColorStop(0.4, '#5c5058');
      boulderG.addColorStop(0.8, '#3c3038');
      boulderG.addColorStop(1,   '#2a2025');
      ctx.fillStyle = boulderG;
      ctx.beginPath();
      ctx.moveTo(cx,              o.y);
      ctx.bezierCurveTo(cx + o.w*0.44, o.y + o.h*0.05, cx + o.w*0.52, o.y + o.h*0.42, cx + o.w*0.44, o.y + o.h*0.75);
      ctx.bezierCurveTo(cx + o.w*0.38, o.y + o.h*0.96, cx - o.w*0.38, o.y + o.h*0.96, cx - o.w*0.44, o.y + o.h*0.75);
      ctx.bezierCurveTo(cx - o.w*0.52, o.y + o.h*0.42, cx - o.w*0.44, o.y + o.h*0.05, cx, o.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a1518'; ctx.lineWidth = 2; ctx.stroke();
      // cracks / surface details
      ctx.strokeStyle = 'rgba(30,20,25,0.55)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + o.w*0.08, o.y + o.h*0.22); ctx.lineTo(cx + o.w*0.28, o.y + o.h*0.44); ctx.lineTo(cx + o.w*0.18, o.y + o.h*0.65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - o.w*0.20, o.y + o.h*0.30); ctx.lineTo(cx - o.w*0.08, o.y + o.h*0.52); ctx.stroke();
      // highlight
      ctx.fillStyle = 'rgba(180,160,165,0.30)';
      ctx.beginPath(); ctx.ellipse(cx - o.w*0.14, cy - o.h*0.18, o.w*0.22, o.h*0.15, -0.4, 0, Math.PI*2); ctx.fill();
      // moss patch
      ctx.fillStyle = 'rgba(40,100,40,0.45)';
      ctx.beginPath(); ctx.ellipse(cx + o.w*0.18, o.y + o.h*0.60, o.w*0.14, o.h*0.09, 0.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='clock'){
      // === ANCIENT ROMAN / GRANDFATHER CLOCK ===
      const cx = o.x + o.w / 2;
      const now2 = performance.now() / 1000;
      ctx.save();
      // base shadow
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.beginPath(); ctx.ellipse(cx, o.y + o.h, o.w*0.38, o.h*0.05, 0, 0, Math.PI*2); ctx.fill();
      // clock case body
      const caseG = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
      caseG.addColorStop(0,   '#8B6914');
      caseG.addColorStop(0.4, '#6B4F0A');
      caseG.addColorStop(1,   '#3d2c06');
      ctx.fillStyle = caseG;
      // body rounded rect
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.12, o.y + o.h*0.25, o.w*0.76, o.h*0.72, 6); ctx.fill();
      ctx.strokeStyle = '#2a1d04'; ctx.lineWidth = 2; ctx.stroke();
      // pediment (triangular top)
      ctx.fillStyle = '#7a5c10';
      ctx.beginPath(); ctx.moveTo(cx, o.y + o.h*0.02);
      ctx.lineTo(o.x + o.w*0.10, o.y + o.h*0.30);
      ctx.lineTo(o.x + o.w*0.90, o.y + o.h*0.30);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a1d04'; ctx.lineWidth = 1.8; ctx.stroke();
      // clock face
      ctx.fillStyle = '#f5e8c0';
      ctx.beginPath(); ctx.arc(cx, o.y + o.h*0.44, o.w*0.28, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 2; ctx.stroke();
      // Roman numeral markers (dots at 12 positions)
      ctx.fillStyle = '#4a3008';
      for(let ni = 0; ni < 12; ni++){
        const ang = (ni / 12) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(ang) * o.w * 0.22;
        const ny = (o.y + o.h*0.44) + Math.sin(ang) * o.w * 0.22;
        ctx.beginPath(); ctx.arc(nx, ny, 1.8, 0, Math.PI*2); ctx.fill();
      }
      // hour hand – slowly rotating
      const hAng = now2 * 0.2 - Math.PI / 2;
      ctx.strokeStyle = '#2a1d04'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, o.y + o.h*0.44);
      ctx.lineTo(cx + Math.cos(hAng) * o.w*0.17, (o.y + o.h*0.44) + Math.sin(hAng) * o.w*0.17);
      ctx.stroke();
      // minute hand – faster
      const mAng = now2 * 1.2 - Math.PI / 2;
      ctx.strokeStyle = '#4a3008'; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, o.y + o.h*0.44);
      ctx.lineTo(cx + Math.cos(mAng) * o.w*0.24, (o.y + o.h*0.44) + Math.sin(mAng) * o.w*0.24);
      ctx.stroke();
      // centre pin
      ctx.fillStyle = '#8B6914';
      ctx.beginPath(); ctx.arc(cx, o.y + o.h*0.44, 3, 0, Math.PI*2); ctx.fill();
      // pendulum window
      ctx.fillStyle = 'rgba(80,50,10,0.35)';
      ctx.beginPath(); ctx.roundRect(cx - o.w*0.15, o.y + o.h*0.64, o.w*0.30, o.h*0.26, 4); ctx.fill();
      ctx.strokeStyle = '#4a3008'; ctx.lineWidth = 1.5; ctx.stroke();
      // pendulum bob
      const pendSwing = Math.sin(now2 * 3.5) * o.w * 0.08;
      ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, o.y + o.h*0.65); ctx.lineTo(cx + pendSwing, o.y + o.h*0.83); ctx.stroke();
      const pG = ctx.createRadialGradient(cx + pendSwing - 2, o.y + o.h*0.84, 1, cx + pendSwing, o.y + o.h*0.85, 5);
      pG.addColorStop(0, '#ffe060'); pG.addColorStop(1, '#a06010');
      ctx.fillStyle = pG;
      ctx.beginPath(); ctx.arc(cx + pendSwing, o.y + o.h*0.85, 5, 0, Math.PI*2); ctx.fill();
      // case side moulding lines
      ctx.strokeStyle = 'rgba(200,160,40,0.30)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(o.x + o.w*0.18, o.y + o.h*0.30); ctx.lineTo(o.x + o.w*0.18, o.y + o.h*0.95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(o.x + o.w*0.82, o.y + o.h*0.30); ctx.lineTo(o.x + o.w*0.82, o.y + o.h*0.95); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='bird'){
      // === SKY BIRD ===
      const ft = (o.flapTimer || 0);
      const flap = Math.sin(ft * 14) * 0.52;
      const bx = o.x + o.w * 0.52, by = o.y + o.h * 0.46;
      ctx.save();
      // wings
      ctx.fillStyle = '#3888d8';
      ctx.save(); ctx.translate(bx, by - 4);
      ctx.save(); ctx.rotate(-flap - 0.25);
      ctx.beginPath(); ctx.ellipse(-o.w*0.30, 0, o.w*0.32, o.h*0.14, 0.18, 0, Math.PI*2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.rotate(flap + 0.25);
      ctx.beginPath(); ctx.ellipse(o.w*0.22, 0, o.w*0.32, o.h*0.14, -0.18, 0, Math.PI*2); ctx.fill(); ctx.restore();
      ctx.restore();
      // body
      const bg = ctx.createRadialGradient(bx - 7, by - 5, 2, bx, by, o.h * 0.30);
      bg.addColorStop(0, '#a8d8ff'); bg.addColorStop(0.6, '#2868c8'); bg.addColorStop(1, '#103870');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(bx, by, o.w*0.24, o.h*0.30, -0.18, 0, Math.PI*2); ctx.fill();
      // head
      ctx.fillStyle = '#1858b0'; ctx.beginPath(); ctx.arc(bx + o.w*0.24, by - o.h*0.24, o.h*0.22, 0, Math.PI*2); ctx.fill();
      // beak
      ctx.fillStyle = '#ff9828'; ctx.beginPath();
      ctx.moveTo(bx + o.w*0.42, by - o.h*0.22); ctx.lineTo(bx + o.w*0.60, by - o.h*0.16);
      ctx.lineTo(bx + o.w*0.42, by - o.h*0.10); ctx.closePath(); ctx.fill();
      // eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx + o.w*0.30, by - o.h*0.28, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(bx + o.w*0.31, by - o.h*0.28, 2.0, 0, Math.PI*2); ctx.fill();
      // tail
      ctx.fillStyle = '#2060c8'; ctx.beginPath();
      ctx.moveTo(bx - o.w*0.24, by); ctx.lineTo(bx - o.w*0.48, by - o.h*0.08); ctx.lineTo(bx - o.w*0.48, by + o.h*0.14); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if(o.kind==='balloon'){
      // === BALLOON ===
      const cx2 = o.x + o.w / 2;
      const r = o.w * 0.46;
      ctx.save();
      // balloon globe
      const colIdx = Math.floor((o.x * 0.01) % 5);
      const ballCols = [['#ff4488','#cc1155'],['#ffcc00','#cc9900'],['#44ddff','#0099cc'],['#88ff44','#44cc00'],['#ff8822','#cc5500']];
      const [bc1, bc2] = ballCols[Math.abs(colIdx) % ballCols.length];
      const bg2 = ctx.createRadialGradient(cx2 - r*0.28, o.y + r*0.28, r*0.06, cx2, o.y + r*0.72, r);
      bg2.addColorStop(0, '#ffffff'); bg2.addColorStop(0.25, bc1); bg2.addColorStop(1, bc2);
      ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(cx2, o.y + r, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = bc2; ctx.lineWidth = 1.5; ctx.stroke();
      // glare
      ctx.fillStyle = 'rgba(255,255,255,0.40)';
      ctx.beginPath(); ctx.ellipse(cx2 - r*0.22, o.y + r*0.38, r*0.26, r*0.18, -0.4, 0, Math.PI*2); ctx.fill();
      // knot
      ctx.fillStyle = bc2; ctx.beginPath(); ctx.arc(cx2, o.y + r * 2 - 3, 4, 0, Math.PI*2); ctx.fill();
      // string
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx2, o.y + r * 2 + 1);
      ctx.bezierCurveTo(cx2 + 5, o.y + r*2.2, cx2 - 4, o.y + r*2.55, cx2, o.y + o.h); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='plane'){
      // === SMALL PLANE ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.save();
      // fuselage
      const fg = ctx.createLinearGradient(o.x, cy - o.h*0.18, o.x, cy + o.h*0.18);
      fg.addColorStop(0, '#f0f0f8'); fg.addColorStop(0.5, '#d0d8e8'); fg.addColorStop(1, '#9098b0');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.05, cy - o.h*0.18, o.w*0.88, o.h*0.36, [o.h*0.18, o.h*0.06, o.h*0.06, o.h*0.18]); ctx.fill();
      ctx.strokeStyle = '#7080a0'; ctx.lineWidth = 1.5; ctx.stroke();
      // main wings
      ctx.fillStyle = '#b8c8e8';
      ctx.beginPath();
      ctx.moveTo(cx2 - o.w*0.12, cy - o.h*0.18);
      ctx.lineTo(cx2 - o.w*0.42, cy + o.h*0.44);
      ctx.lineTo(cx2 + o.w*0.30, cy + o.h*0.44);
      ctx.lineTo(cx2 + o.w*0.20, cy - o.h*0.18);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8898b8'; ctx.lineWidth = 1.2; ctx.stroke();
      // tail fin
      ctx.fillStyle = '#c8d8f0';
      ctx.beginPath();
      ctx.moveTo(o.x + o.w*0.14, cy - o.h*0.18);
      ctx.lineTo(o.x + o.w*0.06, cy - o.h*0.52);
      ctx.lineTo(o.x + o.w*0.32, cy - o.h*0.18);
      ctx.closePath(); ctx.fill();
      // engine
      ctx.fillStyle = '#9098b8';
      ctx.beginPath(); ctx.roundRect(cx2 + o.w*0.08, cy + o.h*0.26, o.w*0.26, o.h*0.22, 4); ctx.fill();
      // windows
      ctx.fillStyle = '#88d8ff';
      for(let wi = 0; wi < 4; wi++){
        ctx.beginPath(); ctx.arc(cx2 - o.w*0.10 + wi * o.w*0.12, cy - o.h*0.02, 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#5098c8'; ctx.lineWidth = 1; ctx.stroke();
      }
      // propeller
      const pt = performance.now() / 1000;
      ctx.save(); ctx.translate(o.x + o.w*0.95, cy);
      ctx.rotate(pt * 18);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for(let b = 0; b < 3; b++){
        ctx.save(); ctx.rotate(b * Math.PI * 2 / 3);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -12); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
    } else if(o.kind==='hot-air-balloon'){
      // === HOT AIR BALLOON ===
      const cx2 = o.x + o.w / 2;
      ctx.save();
      // envelope (large tear-drop balloon)
      const envR = o.w * 0.46;
      const envY = o.y + envR * 1.06;
      const panelCols = ['#ff3366','#ffcc00','#3399ff','#ff8800','#cc44ff','#44dd88'];
      // draw panels using clip
      for(let p = 0; p < 6; p++){
        const ang1 = (p / 6) * Math.PI * 2 - Math.PI / 2;
        const ang2 = ((p + 1) / 6) * Math.PI * 2 - Math.PI / 2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx2, envY);
        ctx.arc(cx2, envY, envR * 1.02, ang1, ang2);
        ctx.closePath();
        ctx.clip();
        const pg3 = ctx.createRadialGradient(cx2 - envR * 0.15, envY - envR * 0.20, envR * 0.05, cx2, envY, envR * 1.1);
        pg3.addColorStop(0, '#ffffff');
        pg3.addColorStop(0.3, panelCols[p]);
        pg3.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = pg3;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.restore();
      }
      // envelope outline
      ctx.strokeStyle = 'rgba(80,40,0,0.35)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx2, envY, envR, 0, Math.PI*2); ctx.stroke();
      // bottom gathering
      ctx.fillStyle = '#8B5A14';
      ctx.beginPath(); ctx.ellipse(cx2, envY + envR * 0.95, envR * 0.15, envR * 0.07, 0, 0, Math.PI*2); ctx.fill();
      // ropes
      ctx.strokeStyle = '#5a3a08'; ctx.lineWidth = 1.5;
      const basketTop = o.y + o.h * 0.82;
      [[-0.30, -0.28], [-0.12, -0.15], [0.10, -0.15], [0.28, -0.28]].forEach(([rx, ry]) => {
        ctx.beginPath(); ctx.moveTo(cx2 + envR * rx, envY + envR * 0.90); ctx.lineTo(cx2 + rx * o.w * 0.38, basketTop); ctx.stroke();
      });
      // basket
      const bkG = ctx.createLinearGradient(0, basketTop, 0, o.y + o.h);
      bkG.addColorStop(0, '#d4882a'); bkG.addColorStop(1, '#7a4010');
      ctx.fillStyle = bkG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.22, basketTop, o.w*0.44, o.h*0.18, 4); ctx.fill();
      ctx.strokeStyle = '#5a3008'; ctx.lineWidth = 1.5; ctx.stroke();
      // basket weave lines
      ctx.strokeStyle = 'rgba(90,48,12,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx2, basketTop); ctx.lineTo(cx2, o.y + o.h); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='blimp'){
      // === BLIMP ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h * 0.44;
      ctx.save();
      // envelope body
      const blG = ctx.createLinearGradient(o.x, cy - o.h*0.38, o.x, cy + o.h*0.38);
      blG.addColorStop(0, '#ffe060'); blG.addColorStop(0.4, '#f0c020'); blG.addColorStop(1, '#a07008');
      ctx.fillStyle = blG;
      ctx.beginPath(); ctx.ellipse(cx2, cy, o.w * 0.48, o.h * 0.38, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#806010'; ctx.lineWidth = 1.8; ctx.stroke();
      // colour band
      ctx.fillStyle = '#ff3300'; ctx.fillRect(cx2 - o.w*0.38, cy - o.h*0.06, o.w*0.76, o.h*0.12);
      ctx.strokeStyle = '#cc2200'; ctx.lineWidth = 1; ctx.strokeRect(cx2 - o.w*0.38, cy - o.h*0.06, o.w*0.76, o.h*0.12);
      // tail fins
      const finCols = ['#e8b818', '#e8b818', '#e8b818'];
      [[o.x + o.w*0.08, -0.3], [o.x + o.w*0.08, 0.3], [o.x + o.w*0.06, 0]].forEach(([fx, fy], i) => {
        ctx.fillStyle = finCols[i];
        ctx.beginPath(); ctx.moveTo(fx, cy + o.h*fy); ctx.lineTo(o.x, cy + o.h*(fy*2.2)); ctx.lineTo(o.x, cy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#a07808'; ctx.lineWidth = 1; ctx.stroke();
      });
      // gondola beneath
      ctx.fillStyle = '#555566';
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.16, cy + o.h*0.36, o.w*0.32, o.h*0.22, 5); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2; ctx.stroke();
      // gondola windows
      ctx.fillStyle = '#88ddff';
      for(let wi = 0; wi < 3; wi++){
        ctx.beginPath(); ctx.arc(cx2 - o.w*0.08 + wi*o.w*0.08, cy + o.h*0.47, 3.5, 0, Math.PI*2); ctx.fill();
      }
      // nose cone
      const nG = ctx.createLinearGradient(o.x + o.w*0.94, cy, o.x + o.w, cy);
      nG.addColorStop(0, '#f0c820'); nG.addColorStop(1, '#806010');
      ctx.fillStyle = nG;
      ctx.beginPath(); ctx.ellipse(o.x + o.w*0.94, cy, o.w*0.07, o.h*0.16, 0, 0, Math.PI*2); ctx.fill();
      // highlight
      ctx.fillStyle = 'rgba(255,255,200,0.28)';
      ctx.beginPath(); ctx.ellipse(cx2 + o.w*0.05, cy - o.h*0.18, o.w*0.22, o.h*0.10, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='alien'){
      // === ALIEN ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      const anow = performance.now() / 1000;
      ctx.save();
      // body — green blob
      const ag = ctx.createRadialGradient(cx2 - o.w*0.18, cy - o.h*0.2, o.w*0.05, cx2, cy, o.w*0.44);
      ag.addColorStop(0, '#a0ff80'); ag.addColorStop(0.55, '#30c840'); ag.addColorStop(1, '#0a5010');
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.ellipse(cx2, cy + o.h*0.05, o.w*0.36, o.h*0.42, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#0a500e'; ctx.lineWidth = 1.8; ctx.stroke();
      // head — large domed
      const hg = ctx.createRadialGradient(cx2 - o.w*0.15, cy - o.h*0.48, o.w*0.04, cx2, cy - o.h*0.28, o.w*0.38);
      hg.addColorStop(0, '#c8ffb0'); hg.addColorStop(0.6, '#28c838'); hg.addColorStop(1, '#0a4010');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(cx2, cy - o.h*0.28, o.w*0.40, o.h*0.34, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#0a5010'; ctx.lineWidth = 1.5; ctx.stroke();
      // big oval eyes
      const eyeY = cy - o.h*0.32;
      [[-0.16, 0], [0.16, 0]].forEach(([ex, ey]) => {
        ctx.fillStyle = '#000818';
        ctx.beginPath(); ctx.ellipse(cx2 + o.w*ex, eyeY + o.h*ey, o.w*0.12, o.h*0.095, 0, 0, Math.PI*2); ctx.fill();
        // iris glow
        ctx.fillStyle = `rgba(80,200,255,${0.7 + 0.3*Math.sin(anow*4 + ex*10)})`;
        ctx.beginPath(); ctx.ellipse(cx2 + o.w*ex, eyeY + o.h*ey, o.w*0.075, o.h*0.06, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx2 + o.w*(ex+0.03), eyeY - o.h*0.02, 2.5, 0, Math.PI*2); ctx.fill();
      });
      // antennae
      ctx.strokeStyle = '#20a830'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      [[-0.22, 0.18], [0.22, -0.18]].forEach(([ax, ay]) => {
        const tx = cx2 + o.w * ax, ty = cy - o.h * 0.62;
        ctx.beginPath(); ctx.moveTo(cx2 + o.w*ax*0.3, cy - o.h*0.56); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = '#88ff44'; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI*2); ctx.fill();
      });
      // tentacle arms
      ctx.strokeStyle = '#20a830'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      [[-1, 0.8], [1, 0.8]].forEach(([side, t]) => {
        const waveY = Math.sin(anow * 4 + side) * 6;
        ctx.beginPath();
        ctx.moveTo(cx2 + o.w * 0.30 * side, cy + o.h * 0.05);
        ctx.quadraticCurveTo(cx2 + o.w * 0.55 * side, cy + waveY, cx2 + o.w * 0.52 * side, cy + o.h * 0.38);
        ctx.stroke();
      });
      // smile
      ctx.strokeStyle = '#085818'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx2, cy - o.h*0.08, o.w*0.18, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='alien-ship'){
      // === FLYING SAUCER ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      const snow = performance.now() / 1000;
      ctx.save();
      // underside glow / tractor beam
      const tg = ctx.createRadialGradient(cx2, cy + o.h*0.18, 2, cx2, cy + o.h*0.60, o.w*0.36);
      tg.addColorStop(0, `rgba(80,255,180,${0.18+0.12*Math.sin(snow*5)})`);
      tg.addColorStop(1, 'rgba(40,200,120,0)');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(cx2, cy + o.h*0.50, o.w*0.36, o.h*0.60, 0, 0, Math.PI*2); ctx.fill();
      // main disc body
      const dg = ctx.createLinearGradient(o.x, cy - o.h*0.08, o.x, cy + o.h*0.22);
      dg.addColorStop(0, '#d8e8f0'); dg.addColorStop(0.5, '#8898b8'); dg.addColorStop(1, '#3a4860');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.ellipse(cx2, cy + o.h*0.06, o.w*0.46, o.h*0.22, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#5568a0'; ctx.lineWidth = 1.8; ctx.stroke();
      // dome
      const domG = ctx.createRadialGradient(cx2 - o.w*0.08, cy - o.h*0.22, o.w*0.02, cx2, cy - o.h*0.06, o.w*0.22);
      domG.addColorStop(0, '#eeffcc'); domG.addColorStop(0.5, '#88cc44'); domG.addColorStop(1, '#2a6010');
      ctx.fillStyle = domG;
      ctx.beginPath(); ctx.ellipse(cx2, cy - o.h*0.06, o.w*0.22, o.h*0.22, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#3a7020'; ctx.lineWidth = 1.5; ctx.stroke();
      // porthole lights around rim
      const lightCols = ['#ff4444','#ffaa00','#44aaff','#44ff88'];
      for(let li = 0; li < 6; li++){
        const lAng = (li / 6) * Math.PI * 2 + snow * 1.5;
        const lx = cx2 + Math.cos(lAng) * o.w * 0.36;
        const ly = cy + o.h * 0.04 + Math.sin(lAng) * o.h * 0.10;
        const lc = lightCols[li % 4];
        ctx.fillStyle = lc; ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(lx - 1, ly - 1, 1.5, 0, Math.PI*2); ctx.fill();
      }
      // bottom hatch
      ctx.fillStyle = '#4a5878';
      ctx.beginPath(); ctx.ellipse(cx2, cy + o.h*0.24, o.w*0.12, o.h*0.06, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='comet'){
      // === COMET ===
      const cx2 = o.x + o.w * 0.72, cy = o.y + o.h / 2;
      ctx.save();
      // tail (gradient streak)
      const tl = ctx.createLinearGradient(o.x, cy, cx2, cy);
      tl.addColorStop(0, 'rgba(180,220,255,0)');
      tl.addColorStop(0.4, 'rgba(200,240,255,0.25)');
      tl.addColorStop(1, 'rgba(255,255,200,0.65)');
      ctx.fillStyle = tl;
      ctx.beginPath();
      ctx.moveTo(o.x, cy);
      ctx.quadraticCurveTo(o.x + o.w*0.35, cy - o.h*0.55, cx2, cy - o.h*0.18);
      ctx.lineTo(cx2, cy + o.h*0.18);
      ctx.quadraticCurveTo(o.x + o.w*0.35, cy + o.h*0.55, o.x, cy);
      ctx.fill();
      // nucleus
      const cnow = performance.now() / 1000;
      const cr2 = o.h * 0.42;
      const cg = ctx.createRadialGradient(cx2 - cr2*0.22, cy - cr2*0.22, cr2*0.05, cx2, cy, cr2);
      cg.addColorStop(0, '#ffffcc'); cg.addColorStop(0.45, '#88aaff'); cg.addColorStop(1, '#2233aa');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx2, cy, cr2, 0, Math.PI*2); ctx.fill();
      // glow halo
      const ghalo = ctx.createRadialGradient(cx2, cy, cr2*0.8, cx2, cy, cr2*1.8);
      ghalo.addColorStop(0, `rgba(120,180,255,${0.30+0.20*Math.sin(cnow*6)})`);
      ghalo.addColorStop(1, 'rgba(60,80,255,0)');
      ctx.fillStyle = ghalo; ctx.beginPath(); ctx.arc(cx2, cy, cr2*1.8, 0, Math.PI*2); ctx.fill();
      // surface cracks/detail
      ctx.strokeStyle = 'rgba(40,60,180,0.45)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx2 + 3, cy - 6); ctx.lineTo(cx2 + 8, cy + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2 - 5, cy - 3); ctx.lineTo(cx2 - 2, cy + 6); ctx.stroke();
      ctx.restore();
    } else if(o.kind==='meteorite'){
      // === METEORITE ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      const spin = o.spin || 0;
      ctx.save();
      ctx.translate(cx2, cy); ctx.rotate(spin);
      // motion glow
      const mhalo = ctx.createRadialGradient(-o.w*0.12, o.h*0.12, 2, 0, 0, o.w*0.55);
      mhalo.addColorStop(0, 'rgba(255,160,60,0.32)'); mhalo.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = mhalo; ctx.beginPath(); ctx.arc(0, 0, o.w*0.55, 0, Math.PI*2); ctx.fill();
      // irregular rock shape
      const rg = ctx.createRadialGradient(-o.w*0.18, -o.h*0.18, o.w*0.05, 0, 0, o.w*0.44);
      rg.addColorStop(0, '#888080'); rg.addColorStop(0.5, '#504848'); rg.addColorStop(1, '#282020');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(0, -o.h*0.45);
      ctx.bezierCurveTo( o.w*0.38, -o.h*0.40,  o.w*0.46,  o.h*0.10,  o.w*0.40,  o.h*0.38);
      ctx.bezierCurveTo( o.w*0.22,  o.h*0.46, -o.w*0.22,  o.h*0.48, -o.w*0.42,  o.h*0.30);
      ctx.bezierCurveTo(-o.w*0.50,  o.h*0.05, -o.w*0.44, -o.h*0.32,  0,        -o.h*0.45);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#181010'; ctx.lineWidth = 1.8; ctx.stroke();
      // craters / pits
      ctx.fillStyle = 'rgba(30,20,20,0.45)';
      [[8, -8, 7], [-10, 6, 5], [4, 12, 4]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(120,100,100,0.40)';
        ctx.beginPath(); ctx.arc(dx - 2, dy - 2, r * 0.65, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(30,20,20,0.45)';
      });
      // highlight
      ctx.fillStyle = 'rgba(180,160,155,0.28)';
      ctx.beginPath(); ctx.ellipse(-o.w*0.15, -o.h*0.18, o.w*0.20, o.h*0.14, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='rocket'){
      // === ROCKET ===
      const cx2 = o.x + o.w / 2, rnow = performance.now() / 1000;
      ctx.save();
      // exhaust flame at bottom
      const flicker = 0.6 + 0.4 * Math.sin(rnow * 22);
      const fLen = o.h * 0.38 * flicker;
      const fGrad = ctx.createLinearGradient(cx2, o.y + o.h, cx2, o.y + o.h + fLen);
      fGrad.addColorStop(0,   'rgba(255,240,80,0.95)');
      fGrad.addColorStop(0.4, 'rgba(255,120,20,0.80)');
      fGrad.addColorStop(1,   'rgba(255,40,0,0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(cx2 - o.w*0.14, o.y + o.h);
      ctx.quadraticCurveTo(cx2 + 5 * flicker, o.y + o.h + fLen*0.55, cx2, o.y + o.h + fLen);
      ctx.quadraticCurveTo(cx2 - 5 * flicker, o.y + o.h + fLen*0.55, cx2 + o.w*0.14, o.y + o.h);
      ctx.closePath(); ctx.fill();
      // body
      const rg = ctx.createLinearGradient(o.x, o.y + o.h*0.12, o.x + o.w, o.y + o.h*0.12);
      rg.addColorStop(0, '#e0e8f4'); rg.addColorStop(0.5, '#b0c0d8'); rg.addColorStop(1, '#6878a0');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.22, o.y + o.h*0.16, o.w*0.44, o.h*0.72, 6); ctx.fill();
      ctx.strokeStyle = '#5060a0'; ctx.lineWidth = 1.5; ctx.stroke();
      // nose cone
      const ncG = ctx.createLinearGradient(cx2, o.y, cx2, o.y + o.h*0.22);
      ncG.addColorStop(0, '#ff5da2'); ncG.addColorStop(1, '#cc1060');
      ctx.fillStyle = ncG;
      ctx.beginPath();
      ctx.moveTo(cx2, o.y);
      ctx.bezierCurveTo(cx2 + o.w*0.24, o.y + o.h*0.08, cx2 + o.w*0.22, o.y + o.h*0.16, cx2 + o.w*0.22, o.y + o.h*0.16);
      ctx.lineTo(cx2 - o.w*0.22, o.y + o.h*0.16);
      ctx.bezierCurveTo(cx2 - o.w*0.22, o.y + o.h*0.16, cx2 - o.w*0.24, o.y + o.h*0.08, cx2, o.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#880040'; ctx.lineWidth = 1.2; ctx.stroke();
      // fins
      ctx.fillStyle = '#ff8844';
      ctx.beginPath(); ctx.moveTo(cx2 - o.w*0.22, o.y + o.h*0.72); ctx.lineTo(o.x, o.y + o.h); ctx.lineTo(cx2 - o.w*0.22, o.y + o.h); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx2 + o.w*0.22, o.y + o.h*0.72); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.lineTo(cx2 + o.w*0.22, o.y + o.h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#cc5520'; ctx.lineWidth = 1; ctx.stroke();
      // porthole window
      ctx.fillStyle = '#88ddff';
      ctx.beginPath(); ctx.arc(cx2, o.y + o.h*0.38, o.w*0.12, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3388aa'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(cx2 - 2, o.y + o.h*0.37, o.w*0.055, 0, Math.PI*2); ctx.fill();
      // colour band
      ctx.fillStyle = '#ff4080'; ctx.fillRect(cx2 - o.w*0.22, o.y + o.h*0.54, o.w*0.44, o.h*0.07);
      ctx.restore();
    } else if(o.kind==='lipstick'){
      // === LIPSTICK ===
      const cx2 = o.x + o.w / 2;
      ctx.save();
      // outer case (gold/silver barrel)
      const barG = ctx.createLinearGradient(o.x, o.y + o.h*0.38, o.x + o.w, o.y + o.h*0.38);
      barG.addColorStop(0, '#c8b060'); barG.addColorStop(0.35, '#f0e090'); barG.addColorStop(0.65, '#d4b848'); barG.addColorStop(1, '#806020');
      ctx.fillStyle = barG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.38, o.y + o.h*0.38, o.w*0.76, o.h*0.62, [3,3,6,6]); ctx.fill();
      ctx.strokeStyle = '#806020'; ctx.lineWidth = 1.3; ctx.stroke();
      // barrel ring / seam
      ctx.strokeStyle = '#a08030'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx2 - o.w*0.38, o.y + o.h*0.52); ctx.lineTo(cx2 + o.w*0.38, o.y + o.h*0.52); ctx.stroke();
      // cap (darker gold)
      const capG = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      capG.addColorStop(0, '#b09040'); capG.addColorStop(0.4, '#e0d080'); capG.addColorStop(1, '#706018');
      ctx.fillStyle = capG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.40, o.y + o.h*0.24, o.w*0.80, o.h*0.17, [2,2,0,0]); ctx.fill();
      ctx.strokeStyle = '#806020'; ctx.lineWidth = 1; ctx.stroke();
      // bullet (the actual lipstick colour)
      const lipG = ctx.createLinearGradient(cx2 - o.w*0.28, 0, cx2 + o.w*0.28, 0);
      lipG.addColorStop(0, '#cc2244'); lipG.addColorStop(0.45, '#ff5588'); lipG.addColorStop(1, '#991833');
      ctx.fillStyle = lipG;
      ctx.beginPath();
      ctx.moveTo(cx2 - o.w*0.28, o.y + o.h*0.24);
      ctx.lineTo(cx2 + o.w*0.28, o.y + o.h*0.24);
      ctx.lineTo(cx2 + o.w*0.22, o.y);
      ctx.bezierCurveTo(cx2 + o.w*0.10, o.y + o.h*0.04, cx2 - o.w*0.10, o.y + o.h*0.04, cx2 - o.w*0.22, o.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#880030'; ctx.lineWidth = 1; ctx.stroke();
      // glare on bullet
      ctx.fillStyle = 'rgba(255,200,200,0.38)';
      ctx.beginPath(); ctx.ellipse(cx2 - o.w*0.07, o.y + o.h*0.10, o.w*0.08, o.h*0.05, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='receipt'){
      // === RECEIPT ===
      const cx2 = o.x + o.w / 2;
      const scrollOff = o.scrollOff || 0;
      ctx.save();
      // slight scrunch angle for character
      ctx.translate(cx2, o.y + o.h/2); ctx.rotate(0.06); ctx.translate(-cx2, -(o.y + o.h/2));
      // paper body
      const rg = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
      rg.addColorStop(0, '#f4f0e8'); rg.addColorStop(0.5, '#faf8f2'); rg.addColorStop(1, '#ece8de');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.10, o.y, o.w*0.80, o.h, [2,2,4,4]); ctx.fill();
      ctx.strokeStyle = '#c8c0a8'; ctx.lineWidth = 1; ctx.stroke();
      // torn top edge
      ctx.fillStyle = '#faf8f2';
      ctx.beginPath(); ctx.moveTo(o.x + o.w*0.10, o.y);
      for(let tx2 = 0; tx2 < 7; tx2++){
        ctx.lineTo(o.x + o.w*0.10 + (o.w*0.80/6)*tx2 + (tx2%2===0 ? 2 : -2), o.y - 2 + (tx2%3)*2);
      }
      ctx.lineTo(o.x + o.w*0.90, o.y); ctx.closePath(); ctx.fill();
      // printed lines
      ctx.fillStyle = '#606055'; ctx.font = `bold ${Math.max(6, o.w*0.18)}px monospace`;
      ctx.textAlign = 'center'; ctx.fillText('SHOP', cx2, o.y + o.h*0.10);
      const lineYs = [0.18, 0.27, 0.36, 0.44, 0.52, 0.60, 0.68, 0.76, 0.84];
      lineYs.forEach((ly, i) => {
        const alpha = i < 7 ? 0.55 : 0.30;
        ctx.fillStyle = `rgba(40,38,34,${alpha})`;
        const lw = o.w * (0.35 + ((i * 0.07 + scrollOff * 0.01) % 0.38));
        ctx.fillRect(cx2 - lw/2, o.y + o.h*ly, lw, 1.8);
      });
      // total line
      ctx.fillStyle = '#222'; ctx.fillRect(cx2 - o.w*0.34, o.y + o.h*0.90, o.w*0.68, 2);
      ctx.restore();
    } else if(o.kind==='chewing-gum'){
      // === CHEWING GUM PACK ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.save();
      // outer wrapper
      const wG = ctx.createLinearGradient(o.x, cy - o.h*0.45, o.x, cy + o.h*0.45);
      wG.addColorStop(0, '#d8f0e8'); wG.addColorStop(0.4, '#88d8b0'); wG.addColorStop(1, '#3a9068');
      ctx.fillStyle = wG;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.02, o.y + o.h*0.05, o.w*0.96, o.h*0.90, 5); ctx.fill();
      ctx.strokeStyle = '#2a7050'; ctx.lineWidth = 1.5; ctx.stroke();
      // silver foil stripe in middle
      const fg2 = ctx.createLinearGradient(o.x, cy, o.x + o.w, cy);
      fg2.addColorStop(0, '#b0c8c0'); fg2.addColorStop(0.3, '#e8f4f0'); fg2.addColorStop(0.7, '#d0e8e0'); fg2.addColorStop(1, '#a0b8b0');
      ctx.fillStyle = fg2;
      ctx.fillRect(o.x + o.w*0.02, cy - o.h*0.14, o.w*0.96, o.h*0.28);
      // brand accent
      ctx.fillStyle = '#1a6040';
      ctx.font = `bold ${Math.max(7, o.h*0.30)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('GUM', cx2, cy);
      // individual stick lines
      ctx.strokeStyle = 'rgba(30,90,60,0.35)'; ctx.lineWidth = 1;
      [-0.28, -0.08, 0.12, 0.32].forEach(lx => {
        ctx.beginPath(); ctx.moveTo(cx2 + o.w*lx, o.y + o.h*0.1); ctx.lineTo(cx2 + o.w*lx, o.y + o.h*0.9); ctx.stroke();
      });
      ctx.restore();
    } else if(o.kind==='nail-varnish'){
      // === NAIL VARNISH BOTTLE ===
      const cx2 = o.x + o.w / 2;
      ctx.save();
      const nCols = [['#ff2255','#cc0033'],['#8822ee','#5500aa'],['#ff6600','#cc3300'],['#222299','#000066'],['#229944','#006622']];
      const nc = nCols[((Math.floor(Math.abs(o.x) * 0.008)) % nCols.length + nCols.length) % nCols.length];
      const nbG = ctx.createLinearGradient(o.x + o.w*0.12, 0, o.x + o.w*0.88, 0);
      nbG.addColorStop(0, nc[1]); nbG.addColorStop(0.3, nc[0]); nbG.addColorStop(0.7, nc[0]); nbG.addColorStop(1, nc[1]);
      ctx.fillStyle = nbG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.36, o.y + o.h*0.26, o.w*0.72, o.h*0.56, [4,4,8,8]); ctx.fill();
      ctx.strokeStyle = nc[1]; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = nc[1];
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.16, o.y + o.h*0.14, o.w*0.32, o.h*0.14, 2); ctx.fill();
      const capCG = ctx.createLinearGradient(cx2 - o.w*0.22, 0, cx2 + o.w*0.22, 0);
      capCG.addColorStop(0, '#888'); capCG.addColorStop(0.4, '#eee'); capCG.addColorStop(1, '#666');
      ctx.fillStyle = capCG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.22, o.y, o.w*0.44, o.h*0.16, [5,5,2,2]); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath(); ctx.ellipse(cx2 - o.w*0.12, o.y + o.h*0.36, o.w*0.10, o.h*0.14, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.22, o.y + o.h*0.44, o.w*0.44, o.h*0.18, 2); ctx.fill();
      ctx.fillStyle = nc[1]; ctx.font = `bold ${Math.max(6,o.h*0.12)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NAIL', cx2, o.y + o.h*0.53);
      ctx.restore();
    } else if(o.kind==='bank-card'){
      // === BANK CARD ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.save();
      const cardCols = ['#1a2a8a','#8a1a2a','#1a6a3a','#6a1a8a'];
      const cc = cardCols[((Math.floor(Math.abs(o.x) * 0.006)) % cardCols.length + cardCols.length) % cardCols.length];
      const cardG = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
      cardG.addColorStop(0, cc + 'cc'); cardG.addColorStop(0.5, cc); cardG.addColorStop(1, '#000');
      ctx.fillStyle = cardG;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.02, o.y + o.h*0.04, o.w*0.96, o.h*0.92, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1.5; ctx.stroke();
      const holoG = ctx.createLinearGradient(o.x + o.w*0.02, 0, o.x + o.w*0.98, 0);
      holoG.addColorStop(0,   'rgba(255,180,80,0.12)');
      holoG.addColorStop(0.25,'rgba(100,230,200,0.22)');
      holoG.addColorStop(0.50,'rgba(220,100,255,0.22)');
      holoG.addColorStop(0.75,'rgba(80,180,255,0.22)');
      holoG.addColorStop(1,   'rgba(255,220,80,0.12)');
      ctx.fillStyle = holoG;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.02, o.y + o.h*0.04, o.w*0.96, o.h*0.92, 8); ctx.fill();
      const chipG = ctx.createLinearGradient(o.x + o.w*0.10, cy - o.h*0.18, o.x + o.w*0.10, cy + o.h*0.06);
      chipG.addColorStop(0, '#d4b840'); chipG.addColorStop(0.5, '#f0e080'); chipG.addColorStop(1, '#a08020');
      ctx.fillStyle = chipG;
      ctx.beginPath(); ctx.roundRect(o.x + o.w*0.10, cy - o.h*0.18, o.w*0.22, o.h*0.30, 3); ctx.fill();
      ctx.strokeStyle = '#806010'; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = 'rgba(120,90,10,0.55)'; ctx.lineWidth = 0.8;
      [[0.0,0],[0.0,0.10],[0.0,0.20],[0.14,0.05],[0.14,0.15]].forEach(([dx,dy])=>{
        ctx.beginPath(); ctx.rect(o.x + o.w*(0.12+dx), cy - o.h*(0.16-dy), o.w*0.08, o.h*0.07); ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      const wsx = o.x + o.w*0.72, wsy = cy;
      [8,13,18].forEach(r => { ctx.beginPath(); ctx.arc(wsx, wsy, r, -Math.PI*0.55, Math.PI*0.55); ctx.stroke(); });
      ctx.fillStyle = 'rgba(255,255,255,0.60)';
      let dnx = o.x + o.w*0.10;
      for(let gi = 0; gi < 16; gi++){
        if(gi > 0 && gi % 4 === 0) dnx += o.w*0.04;
        ctx.beginPath(); ctx.arc(dnx, cy + o.h*0.22, 2, 0, Math.PI*2); ctx.fill();
        dnx += o.w*0.048;
      }
      ctx.restore();
    } else if(o.kind==='keys'){
      // === KEYS ON A KEYRING ===
      const cx2 = o.x + o.w / 2, cy = o.y + o.h / 2;
      const swing = (o.swing || 0);
      ctx.save(); ctx.translate(cx2, cy - o.h*0.30);
      ctx.strokeStyle = '#c0b060'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, o.h*0.16, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,180,80,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, o.h*0.12, 0, Math.PI*2); ctx.stroke();
      ctx.save(); ctx.rotate(swing - 0.25); ctx.translate(0, o.h*0.20);
      const kbG = ctx.createRadialGradient(-3,-3,2, 0,0, o.h*0.14);
      kbG.addColorStop(0,'#e8d878'); kbG.addColorStop(0.5,'#c0a838'); kbG.addColorStop(1,'#806010');
      ctx.fillStyle = kbG;
      ctx.beginPath(); ctx.arc(0, 0, o.h*0.14, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#806010'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#4a3010'; ctx.beginPath(); ctx.arc(0, 0, o.h*0.062, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c8b840';
      ctx.beginPath(); ctx.roundRect(-o.w*0.06, o.h*0.13, o.w*0.12, o.h*0.34, 2); ctx.fill();
      ctx.fillStyle = '#a09030';
      [[o.h*0.20,5],[o.h*0.28,8],[o.h*0.36,4],[o.h*0.42,7]].forEach(([ty,th])=>{
        ctx.beginPath(); ctx.rect(o.w*0.06, ty, o.w*0.06, th); ctx.fill();
      });
      ctx.restore();
      ctx.save(); ctx.rotate(swing + 0.65); ctx.translate(0, o.h*0.22);
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.roundRect(-o.w*0.12, -o.h*0.09, o.w*0.24, o.h*0.21, 5); ctx.fill();
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.roundRect(-o.w*0.10, -o.h*0.07, o.w*0.20, o.h*0.17, 4); ctx.fill();
      ['#e02020','#2040e0'].forEach((bc,i)=>{
        ctx.fillStyle = bc;
        ctx.beginPath(); ctx.arc(-o.w*0.04 + i*o.w*0.08, 0, 3, 0, Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.roundRect(-o.w*0.04, o.h*0.12, o.w*0.08, o.h*0.20, 1); ctx.fill();
      ctx.restore();
      ctx.restore();
    } else if(o.kind==='zombie'){
      const t = o.wriggleTimer || 0;
      const cx2 = o.x + o.w / 2;
      ctx.save();
      // ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(cx2, o.y + o.h, o.w*0.32, o.h*0.048, 0, 0, Math.PI*2); ctx.fill();
      // LEGS & FEET
      ctx.fillStyle = '#2e2e3a'; // dark trousers
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.22, o.y + o.h*0.60, o.w*0.16, o.h*0.28, 4); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx2 + o.w*0.06, o.y + o.h*0.60, o.w*0.16, o.h*0.28, 4); ctx.fill();
      ctx.fillStyle = '#5a8a48'; // green dead feet
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.26, o.y + o.h*0.84, o.w*0.22, o.h*0.10, [2,2,5,5]); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx2 + o.w*0.04, o.y + o.h*0.84, o.w*0.22, o.h*0.10, [2,2,5,5]); ctx.fill();
      // BODY (torn shirt)
      const bodyG = ctx.createLinearGradient(o.x, o.y + o.h*0.36, o.x + o.w, o.y + o.h*0.62);
      bodyG.addColorStop(0, '#3a5a80'); bodyG.addColorStop(1, '#243a58');
      ctx.fillStyle = bodyG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.26, o.y + o.h*0.36, o.w*0.52, o.h*0.26, [5,5,2,2]); ctx.fill();
      // torn shirt jagged hem
      ctx.beginPath();
      ctx.moveTo(cx2 - o.w*0.26, o.y + o.h*0.62);
      for(let ti = 0; ti <= 5; ti++){
        const tx3 = cx2 - o.w*0.26 + ti * o.w*0.104;
        ctx.lineTo(tx3 + o.w*0.052, o.y + o.h*(0.62 + (ti%2===0 ? 0.04 : -0.01)));
      }
      ctx.lineTo(cx2 + o.w*0.26, o.y + o.h*0.62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1c2e46'; ctx.lineWidth = 1.2; ctx.stroke();
      // shirt detail lines
      ctx.strokeStyle = 'rgba(80,130,180,0.30)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx2, o.y + o.h*0.37); ctx.lineTo(cx2, o.y + o.h*0.60); ctx.stroke();
      // ARMS (outstretched — zombie lurch)
      const armSway = Math.sin(t * 6) * 0.08;
      ctx.fillStyle = '#6a9e52';
      // left arm (straight forward with slight bob)
      ctx.save(); ctx.translate(cx2 - o.w*0.22, o.y + o.h*0.42); ctx.rotate(-0.22 + armSway);
      ctx.beginPath(); ctx.roundRect(-o.w*0.22, -o.h*0.06, o.w*0.22, o.h*0.10, 5); ctx.fill();
      // left claw hand
      ctx.fillStyle = '#548844';
      ctx.beginPath(); ctx.arc(-o.w*0.22, o.h*0.0, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1e1208';
      [-5,-2,1].forEach(fo => {
        ctx.beginPath(); ctx.moveTo(-o.w*0.22+fo-1, -4); ctx.lineTo(-o.w*0.22+fo, -10); ctx.lineTo(-o.w*0.22+fo+2, -4); ctx.fill();
      });
      ctx.restore();
      // right arm
      ctx.fillStyle = '#6a9e52';
      ctx.save(); ctx.translate(cx2 + o.w*0.22, o.y + o.h*0.40); ctx.rotate(-0.18 - armSway);
      ctx.beginPath(); ctx.roundRect(0, -o.h*0.06, o.w*0.22, o.h*0.10, 5); ctx.fill();
      ctx.fillStyle = '#548844';
      ctx.beginPath(); ctx.arc(o.w*0.22, 0.0, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1e1208';
      [o.w*0.22-4, o.w*0.22-1, o.w*0.22+2].forEach(fo => {
        ctx.beginPath(); ctx.moveTo(fo-1, -4); ctx.lineTo(fo, -10); ctx.lineTo(fo+2, -4); ctx.fill();
      });
      ctx.restore();
      // HEAD
      const headG = ctx.createRadialGradient(cx2 - o.w*0.08, o.y + o.h*0.12, 2, cx2, o.y + o.h*0.18, o.w*0.25);
      headG.addColorStop(0, '#9ed88a'); headG.addColorStop(0.65, '#72b860'); headG.addColorStop(1, '#4a8838');
      ctx.fillStyle = headG;
      ctx.beginPath(); ctx.roundRect(cx2 - o.w*0.24, o.y + o.h*0.04, o.w*0.48, o.h*0.34, [12,12,8,8]); ctx.fill();
      ctx.strokeStyle = '#327828'; ctx.lineWidth = 1.5; ctx.stroke();
      // decay scars
      ctx.strokeStyle = 'rgba(30,80,15,0.50)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx2 + o.w*0.08, o.y + o.h*0.08); ctx.lineTo(cx2 + o.w*0.16, o.y + o.h*0.16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2 - o.w*0.14, o.y + o.h*0.22); ctx.lineTo(cx2 - o.w*0.06, o.y + o.h*0.17); ctx.stroke();
      // WILD HAIR
      ctx.fillStyle = '#141408';
      ctx.beginPath(); ctx.moveTo(cx2 - o.w*0.20, o.y + o.h*0.06); ctx.lineTo(cx2 - o.w*0.24, o.y); ctx.lineTo(cx2 - o.w*0.08, o.y + o.h*0.04); ctx.lineTo(cx2 - o.w*0.06, o.y - o.h*0.02); ctx.lineTo(cx2 + o.w*0.04, o.y + o.h*0.03); ctx.lineTo(cx2 + o.w*0.06, o.y); ctx.lineTo(cx2 + o.w*0.18, o.y + o.h*0.06); ctx.closePath(); ctx.fill();
      // EYES — dead pale with X pupils
      ctx.fillStyle = '#d8ffcc';
      ctx.beginPath(); ctx.ellipse(cx2 - o.w*0.10, o.y + o.h*0.17, o.w*0.075, o.h*0.058, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx2 + o.w*0.10, o.y + o.h*0.17, o.w*0.075, o.h*0.058, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#257020'; ctx.lineWidth = 1.5;
      [[-0.10],[ 0.10]].forEach(([ex]) => {
        ctx.beginPath(); ctx.moveTo(cx2+o.w*(ex-0.06), o.y+o.h*0.13); ctx.lineTo(cx2+o.w*(ex+0.06), o.y+o.h*0.21); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx2+o.w*(ex+0.06), o.y+o.h*0.13); ctx.lineTo(cx2+o.w*(ex-0.06), o.y+o.h*0.21); ctx.stroke();
      });
      // STITCHED MOUTH
      ctx.strokeStyle = '#1a4810'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx2 - o.w*0.14, o.y + o.h*0.29); ctx.lineTo(cx2 + o.w*0.14, o.y + o.h*0.29); ctx.stroke();
      ctx.lineWidth = 1.5;
      [-0.09,-0.03,0.03,0.09].forEach(sx => {
        ctx.beginPath(); ctx.moveTo(cx2+o.w*sx, o.y+o.h*0.26); ctx.lineTo(cx2+o.w*sx, o.y+o.h*0.32); ctx.stroke();
      });
      ctx.restore();
    } else if(o.kind==='dancing-skeleton'){
      const t = o.wriggleTimer || 0;
      const cx2 = o.x + o.w / 2;
      const dance = Math.sin(t * 8);
      const bonW = '#f0ece0', bonS = '#c4c0a8';
      ctx.save();
      // body rock
      ctx.translate(cx2, o.y + o.h*0.52); ctx.rotate(dance * 0.07); ctx.translate(-cx2, -(o.y + o.h*0.52));
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.beginPath(); ctx.ellipse(cx2 + dance*3, o.y + o.h*0.99, o.w*0.26, o.h*0.022, 0, 0, Math.PI*2); ctx.fill();
      // LEGS — animated thighs + shins
      const lg = dance * 14 * Math.PI / 180;
      const thY = o.y + o.h*0.64;
      [-1,1].forEach((side, si) => {
        const legX = cx2 + side * o.w*0.11;
        ctx.save(); ctx.translate(legX, thY); ctx.rotate(side * lg);
        ctx.fillStyle = bonW;
        ctx.beginPath(); ctx.roundRect(-4, 0, 8, o.h*0.17, [4,4,3,3]); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 1; ctx.stroke();
        // knee joint
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.arc(0, o.h*0.17, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 1; ctx.stroke();
        // shin + foot
        ctx.save(); ctx.translate(0, o.h*0.17); ctx.rotate(-side * lg * 0.6 - side * 0.12);
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.roundRect(-3, 0, 6, o.h*0.14, 3); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.roundRect(side > 0 ? -o.w*0.13 : -1, o.h*0.14, o.w*0.14, 5, 3); ctx.fill();
        ctx.restore(); ctx.restore();
      });
      // PELVIS
      ctx.fillStyle = bonW;
      ctx.beginPath(); ctx.ellipse(cx2, o.y + o.h*0.63, o.w*0.18, o.h*0.046, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = bonS; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = 'rgba(15,10,20,0.55)';
      ctx.beginPath(); ctx.ellipse(cx2, o.y + o.h*0.63, o.w*0.08, o.h*0.022, 0, 0, Math.PI*2); ctx.fill();
      // SPINE segments
      for(let si = 0; si < 5; si++){
        const sy = o.y + o.h*(0.36 + si*0.055);
        const sw2 = Math.sin(t*8 + si*0.7) * 1.5;
        ctx.fillStyle = bonW;
        ctx.beginPath(); ctx.roundRect(cx2 - 4 + sw2, sy, 8, o.h*0.038, 3); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 0.8; ctx.stroke();
      }
      // RIBCAGE
      const ribY = o.y + o.h*0.37;
      ctx.strokeStyle = bonW; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for(let ri = 0; ri < 3; ri++){
        const ry = ribY + ri * o.h*0.062;
        const rw2 = o.w*(0.28 - ri*0.04);
        ctx.beginPath(); ctx.moveTo(cx2 - 3, ry); ctx.bezierCurveTo(cx2 - rw2, ry, cx2 - rw2 - 2, ry + o.h*0.04, cx2 - 3, ry + o.h*0.055); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx2 + 3, ry); ctx.bezierCurveTo(cx2 + rw2, ry, cx2 + rw2 + 2, ry + o.h*0.04, cx2 + 3, ry + o.h*0.055); ctx.stroke();
      }
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx2, ribY); ctx.lineTo(cx2, ribY + o.h*0.20); ctx.stroke();
      // ARMS — waving
      const ag = dance * 22 * Math.PI / 180;
      [-1,1].forEach(side => {
        const armX = cx2 + side * o.w*0.20;
        ctx.save(); ctx.translate(armX, o.y + o.h*0.36); ctx.rotate(side * (-0.55 + ag));
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.roundRect(-3.5, 0, 7, o.h*0.16, 3); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.arc(0, o.h*0.16, 4.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = bonS; ctx.stroke();
        ctx.save(); ctx.translate(0, o.h*0.16); ctx.rotate(side * ag * 1.1 - side * 0.28);
        ctx.fillStyle = bonW; ctx.beginPath(); ctx.roundRect(-3, 0, 6, o.h*0.13, 3); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = bonW;
        [-4,-1,3,6].forEach(fx => { ctx.beginPath(); ctx.roundRect(fx-1.2, o.h*0.13, 2.5, 7, 1); ctx.fill(); });
        ctx.restore(); ctx.restore();
      });
      // SKULL
      const skullG = ctx.createRadialGradient(cx2 - o.w*0.07, o.y + o.h*0.08, 2, cx2, o.y + o.h*0.14, o.w*0.22);
      skullG.addColorStop(0, '#fffff5'); skullG.addColorStop(0.7, bonW); skullG.addColorStop(1, bonS);
      ctx.fillStyle = skullG;
      ctx.beginPath(); ctx.ellipse(cx2, o.y + o.h*0.14, o.w*0.21, o.h*0.16, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = bonS; ctx.lineWidth = 1.5; ctx.stroke();
      // jawbone
      ctx.fillStyle = bonW;
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.16, o.y+o.h*0.22); ctx.lineTo(cx2+o.w*0.16, o.y+o.h*0.22); ctx.lineTo(cx2+o.w*0.13, o.y+o.h*0.31); ctx.lineTo(cx2-o.w*0.13, o.y+o.h*0.31); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = bonS; ctx.lineWidth = 1.2; ctx.stroke();
      // EYE SOCKETS
      ctx.fillStyle = 'rgba(8,6,16,0.90)';
      ctx.beginPath(); ctx.ellipse(cx2-o.w*0.09, o.y+o.h*0.13, o.w*0.07, o.h*0.055, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx2+o.w*0.09, o.y+o.h*0.13, o.w*0.07, o.h*0.055, 0, 0, Math.PI*2); ctx.fill();
      // glowing purple pupils
      ctx.fillStyle = `rgba(180,60,255,${0.6+0.35*Math.sin(t*8)})`;
      ctx.beginPath(); ctx.arc(cx2-o.w*0.09, o.y+o.h*0.13, o.w*0.030, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx2+o.w*0.09, o.y+o.h*0.13, o.w*0.030, 0, Math.PI*2); ctx.fill();
      // nose socket
      ctx.fillStyle = 'rgba(8,6,16,0.58)';
      ctx.beginPath(); ctx.moveTo(cx2-3, o.y+o.h*0.20); ctx.lineTo(cx2, o.y+o.h*0.17); ctx.lineTo(cx2+3, o.y+o.h*0.20); ctx.closePath(); ctx.fill();
      // TEETH
      ctx.fillStyle = bonW;
      [-0.10,-0.04,0.04,0.10].forEach(tx => {
        ctx.beginPath(); ctx.rect(cx2+o.w*tx-2.4, o.y+o.h*0.24, 4.8, 6); ctx.fill();
        ctx.strokeStyle = bonS; ctx.lineWidth = 0.8; ctx.stroke();
      });
      ctx.restore();
    } else if(o.kind==='rat'){
      const t = o.wriggleTimer || 0;
      // body right of centre, head pointing right (toward Belly)
      const cx2 = o.x + o.w*0.45;
      const cy = o.y + o.h*0.58;
      ctx.save();
      // TAIL — animated bezier (left / trailing side)
      const tailWave = Math.sin(t * 9) * 9;
      ctx.strokeStyle = '#b89898'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(o.x + o.w*0.18, cy + o.h*0.04);
      ctx.bezierCurveTo(o.x + o.w*0.04, cy + tailWave, o.x - o.w*0.05, cy - tailWave*0.6, o.x - o.w*0.01, cy - 14);
      ctx.stroke();
      ctx.strokeStyle = '#ceb0b0'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(o.x + o.w*0.18, cy + o.h*0.04);
      ctx.bezierCurveTo(o.x + o.w*0.04, cy + tailWave, o.x - o.w*0.05, cy - tailWave*0.6, o.x - o.w*0.01, cy - 14);
      ctx.stroke();
      // LEGS (four short legs)
      const legBob = Math.sin(t * 10);
      ctx.fillStyle = '#3e3644';
      [[o.x+o.w*0.20, cy], [o.x+o.w*0.28, cy+legBob*3], [cx2+o.w*0.10, cy-legBob*3], [cx2+o.w*0.18, cy]].forEach(([lx, ly]) => {
        ctx.beginPath(); ctx.roundRect(lx - 4, ly + o.h*0.12, 8, o.h*0.26, 3); ctx.fill();
      });
      // small clawed feet
      ctx.fillStyle = '#d0c0c4';
      [[o.x+o.w*0.20, cy+o.h*0.38], [o.x+o.w*0.28, cy+legBob*3+o.h*0.38], [cx2+o.w*0.10, cy-legBob*3+o.h*0.38], [cx2+o.w*0.18, cy+o.h*0.38]].forEach(([lx, ly]) => {
        [-3,0,3].forEach(toe => {
          ctx.beginPath(); ctx.moveTo(lx+toe, ly); ctx.lineTo(lx+toe-1.5, ly+5); ctx.lineTo(lx+toe+1.5, ly+5); ctx.fill();
        });
      });
      // BODY
      const bodyG = ctx.createRadialGradient(cx2 - o.w*0.10, cy - o.h*0.12, 2, cx2, cy, o.w*0.36);
      bodyG.addColorStop(0, '#9a8898'); bodyG.addColorStop(0.5, '#68606a'); bodyG.addColorStop(1, '#3a3240');
      ctx.fillStyle = bodyG;
      ctx.beginPath(); ctx.ellipse(cx2, cy, o.w*0.36, o.h*0.32, -0.08, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#2e2636'; ctx.lineWidth = 1.2; ctx.stroke();
      // fur strokes
      ctx.strokeStyle = 'rgba(110,95,115,0.38)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      [[-0.14,-0.16],[-0.24,-0.07],[0.02,-0.20],[0.12,-0.12],[0.20,-0.18],[-0.07,0.07],[0.16,0.04]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(cx2+o.w*dx, cy+o.h*dy); ctx.lineTo(cx2+o.w*(dx+0.05), cy+o.h*(dy-0.07)); ctx.stroke();
      });
      // HEAD
      const headX = o.x + o.w*0.82;
      const headY = o.y + o.h*0.44;
      const hG = ctx.createRadialGradient(headX-5, headY-4, 2, headX, headY, o.w*0.20);
      hG.addColorStop(0, '#b0a0ac'); hG.addColorStop(0.6, '#786068'); hG.addColorStop(1, '#4a3846');
      ctx.fillStyle = hG;
      ctx.beginPath(); ctx.ellipse(headX, headY, o.w*0.20, o.h*0.26, 0.10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#362830'; ctx.lineWidth = 1.2; ctx.stroke();
      // EAR
      ctx.fillStyle = '#e880a8';
      ctx.beginPath(); ctx.ellipse(headX - o.w*0.05, headY - o.h*0.22, o.w*0.10, o.h*0.14, -0.35, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c05080';
      ctx.beginPath(); ctx.ellipse(headX - o.w*0.05, headY - o.h*0.22, o.w*0.06, o.h*0.08, -0.35, 0, Math.PI*2); ctx.fill();
      // SNOUT
      ctx.fillStyle = '#9a8494';
      ctx.beginPath(); ctx.ellipse(headX + o.w*0.12, headY + o.h*0.04, o.w*0.11, o.h*0.09, 0.18, 0, Math.PI*2); ctx.fill();
      // NOSE (wet/shiny)
      const noseG = ctx.createRadialGradient(headX+o.w*0.22-2, headY+o.h*0.04-2, 1, headX+o.w*0.22, headY+o.h*0.04, 5);
      noseG.addColorStop(0, '#ff9aaa'); noseG.addColorStop(1, '#d04060');
      ctx.fillStyle = noseG;
      ctx.beginPath(); ctx.arc(headX + o.w*0.22, headY + o.h*0.04, 4.5, 0, Math.PI*2); ctx.fill();
      // nostrils
      ctx.fillStyle = '#8a2040';
      ctx.beginPath(); ctx.arc(headX+o.w*0.205, headY+o.h*0.016, 1.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(headX+o.w*0.225, headY+o.h*0.06, 1.5, 0, Math.PI*2); ctx.fill();
      // SHARP TEETH (prominent incisors)
      ctx.fillStyle = '#f2f0e0';
      ctx.beginPath(); ctx.moveTo(headX+o.w*0.162, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.190, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.180, headY+o.h*0.20); ctx.lineTo(headX+o.w*0.162, headY+o.h*0.07); ctx.fill();
      ctx.beginPath(); ctx.moveTo(headX+o.w*0.196, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.224, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.210, headY+o.h*0.18); ctx.lineTo(headX+o.w*0.196, headY+o.h*0.07); ctx.fill();
      ctx.strokeStyle = '#c0b880'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(headX+o.w*0.180, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.180, headY+o.h*0.20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(headX+o.w*0.210, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.210, headY+o.h*0.18); ctx.stroke();
      // WHISKERS
      ctx.strokeStyle = 'rgba(230,225,210,0.88)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
      [[-0.14,0.04],[-0.10,-0.04],[-0.12,0.10]].forEach(([wx,wy]) => {
        ctx.beginPath(); ctx.moveTo(headX+o.w*0.12, headY+o.h*0.04); ctx.lineTo(headX+o.w*(0.12+wx), headY+o.h*(0.04+wy)); ctx.stroke();
      });
      [[0.14,0.04],[0.10,-0.04],[0.12,0.10]].forEach(([wx,wy]) => {
        ctx.beginPath(); ctx.moveTo(headX+o.w*0.12, headY+o.h*0.04); ctx.lineTo(headX+o.w*(0.12+wx), headY+o.h*(0.04+wy)); ctx.stroke();
      });
      // RED EYE
      ctx.fillStyle = '#0a0810';
      ctx.beginPath(); ctx.arc(headX - o.w*0.02, headY - o.h*0.08, 5.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#cc0818';
      ctx.beginPath(); ctx.arc(headX - o.w*0.02, headY - o.h*0.08, 3.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(headX - o.w*0.02 + 1.5, headY - o.h*0.08 - 1.5, 1.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='white-ghost'){
      const t = performance.now() / 1000;
      const cx2 = o.x + o.w / 2;
      ctx.save();
      // outer glow halo
      const glow = ctx.createRadialGradient(cx2, o.y+o.h*0.38, o.h*0.08, cx2, o.y+o.h*0.38, o.h*0.58);
      glow.addColorStop(0, 'rgba(200,215,255,0.30)'); glow.addColorStop(1, 'rgba(160,185,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h*0.38, o.w*0.55, o.h*0.58, 0, 0, Math.PI*2); ctx.fill();
      // faint ground shadow
      ctx.fillStyle = `rgba(70,50,110,${0.09+0.04*Math.sin(t*3)})`;
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h, o.w*0.28, o.h*0.035, 0, 0, Math.PI*2); ctx.fill();
      // ghost body path helper
      const gPath = () => {
        ctx.beginPath();
        ctx.moveTo(cx2-o.w*0.34, o.y+o.h*0.30);
        ctx.bezierCurveTo(cx2-o.w*0.30, o.y+o.h*0.02, cx2+o.w*0.30, o.y+o.h*0.02, cx2+o.w*0.34, o.y+o.h*0.30);
        ctx.lineTo(cx2+o.w*0.34, o.y+o.h*0.80);
        for(let i=0; i<4; i++){
          const px = cx2+o.w*0.34 - i*o.w*0.225;
          ctx.quadraticCurveTo(px-o.w*0.11, o.y+o.h*0.97, px-o.w*0.225, o.y+o.h*0.80);
        }
        ctx.closePath();
      };
      // wider soft outer layer
      ctx.save();
      ctx.translate(cx2, o.y+o.h*0.44); ctx.scale(1.09, 1.05); ctx.translate(-cx2, -(o.y+o.h*0.44));
      ctx.fillStyle = 'rgba(215,230,255,0.22)'; gPath(); ctx.fill();
      ctx.restore();
      // main body
      ctx.fillStyle = 'rgba(246,250,255,0.93)'; gPath(); ctx.fill();
      // inner dome shimmer
      const shimG = ctx.createRadialGradient(cx2-o.w*0.08, o.y+o.h*0.08, 2, cx2, o.y+o.h*0.22, o.w*0.30);
      shimG.addColorStop(0, 'rgba(255,255,255,0.88)'); shimG.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = shimG; gPath(); ctx.fill();
      // edge outline
      ctx.strokeStyle = 'rgba(140,165,225,0.50)'; ctx.lineWidth = 2; gPath(); ctx.stroke();
      // EVIL EYES — glowing red
      const blink = Math.sin(t*2.2) > 0.85 ? 0 : 1; // occasional blink
      const eyePulse = 0.65 + 0.30*Math.sin(t*4.8);
      ctx.fillStyle = 'rgba(22,4,48,0.82)';
      ctx.beginPath(); ctx.ellipse(cx2-o.w*0.12, o.y+o.h*0.30, o.w*0.080, o.h*0.072*blink+0.5*(1-blink), 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx2+o.w*0.12, o.y+o.h*0.30, o.w*0.080, o.h*0.072*blink+0.5*(1-blink), 0, 0, Math.PI*2); ctx.fill();
      if(blink){
        ctx.fillStyle = `rgba(255,18,18,${eyePulse})`;
        ctx.beginPath(); ctx.arc(cx2-o.w*0.12, o.y+o.h*0.30, o.w*0.040, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx2+o.w*0.12, o.y+o.h*0.30, o.w*0.040, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,200,0.75)';
        ctx.beginPath(); ctx.arc(cx2-o.w*0.105, o.y+o.h*0.285, o.w*0.018, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx2+o.w*0.136, o.y+o.h*0.285, o.w*0.018, 0, Math.PI*2); ctx.fill();
      }
      // OPEN SCARY MOUTH
      ctx.fillStyle = 'rgba(18,2,42,0.80)';
      ctx.beginPath(); ctx.arc(cx2, o.y+o.h*0.48, o.w*0.095, 0.15, Math.PI-0.15); ctx.fill();
      // jagged lower teeth
      ctx.fillStyle = 'rgba(248,252,255,0.96)';
      [[-0.06,-0.01],[0.0,-0.012],[0.06,-0.01]].forEach(([tx,ty]) => {
        ctx.beginPath();
        ctx.moveTo(cx2+o.w*(tx-0.046), o.y+o.h*0.478);
        ctx.lineTo(cx2+o.w*tx, o.y+o.h*(0.536+ty));
        ctx.lineTo(cx2+o.w*(tx+0.046), o.y+o.h*0.478);
        ctx.fill();
      });
      // ethereal wispy trail at bottom (optional subtle chains)
      ctx.strokeStyle = 'rgba(170,190,235,0.22)'; ctx.lineWidth = 1.5; ctx.setLineDash([3,5]);
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.18, o.y+o.h*0.68); ctx.lineTo(cx2-o.w*0.22, o.y+o.h*0.96); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2+o.w*0.18, o.y+o.h*0.68); ctx.lineTo(cx2+o.w*0.22, o.y+o.h*0.96); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    } else if(o.kind==='angry-pumpkin'){
      const cx2 = o.x + o.w / 2;
      const now = performance.now() / 1000;
      const flicker = 0.72 + 0.28*Math.sin(now * 17 + o.x * 0.01);
      ctx.save();
      // ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h, o.w*0.38, o.h*0.055, 0, 0, Math.PI*2); ctx.fill();
      // inner candle glow (spills out of face cuts below body)
      const igG = ctx.createRadialGradient(cx2, o.y+o.h*0.64, o.w*0.04, cx2, o.y+o.h*0.64, o.w*0.46);
      igG.addColorStop(0, `rgba(255,185,20,${0.82*flicker})`);
      igG.addColorStop(0.55, `rgba(255,90,0,${0.40*flicker})`);
      igG.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = igG;
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h*0.64, o.w*0.46, o.h*0.42, 0, 0, Math.PI*2); ctx.fill();
      // PUMPKIN RIBS — 5 overlapping vertical ellipses
      const ribCols = ['#e06818','#f8901c','#e87814','#f89820','#de6010'];
      for(let r = 0; r < 5; r++){
        const rx = cx2 + (r-2)*o.w*0.110;
        const rw2 = o.w*0.170;
        const rh = o.h*0.440;
        const rG = ctx.createLinearGradient(rx-rw2, o.y+o.h*0.20, rx+rw2, o.y+o.h*0.20);
        rG.addColorStop(0, '#c04c08'); rG.addColorStop(0.35, ribCols[r]); rG.addColorStop(0.65, ribCols[(r+1)%5]); rG.addColorStop(1, '#b84408');
        ctx.fillStyle = rG;
        ctx.beginPath(); ctx.ellipse(rx, o.y+o.h*0.62, rw2, rh, 0, 0, Math.PI*2); ctx.fill();
      }
      // overall body stroke
      ctx.strokeStyle = '#7a2e02'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h*0.62, o.w*0.46, o.h*0.44, 0, 0, Math.PI*2); ctx.stroke();
      // rib groove lines
      ctx.strokeStyle = 'rgba(110,38,4,0.38)'; ctx.lineWidth = 1.5;
      [-0.22,-0.11,0.11,0.22].forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(cx2+o.w*rx, o.y+o.h*0.22);
        ctx.bezierCurveTo(cx2+o.w*rx*1.14, o.y+o.h*0.42, cx2+o.w*rx*1.10, o.y+o.h*0.70, cx2+o.w*rx*0.78, o.y+o.h*0.97);
        ctx.stroke();
      });
      // pumpkin cap ridge
      ctx.fillStyle = '#c05410';
      ctx.beginPath(); ctx.ellipse(cx2, o.y+o.h*0.22, o.w*0.28, o.h*0.055, 0, 0, Math.PI*2); ctx.fill();
      // STEM (chunky, curved)
      ctx.fillStyle = '#3e6e14';
      ctx.beginPath();
      ctx.moveTo(cx2-o.w*0.06, o.y+o.h*0.17);
      ctx.bezierCurveTo(cx2-o.w*0.09, o.y, cx2+o.w*0.08, o.y-o.h*0.05, cx2+o.w*0.06, o.y+o.h*0.17);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#285010'; ctx.lineWidth = 1; ctx.stroke();
      // leaf curl
      ctx.strokeStyle = '#56921e'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx2+o.w*0.05, o.y+o.h*0.10); ctx.bezierCurveTo(cx2+o.w*0.18, o.y-o.h*0.02, cx2+o.w*0.24, o.y+o.h*0.07, cx2+o.w*0.12, o.y+o.h*0.04); ctx.stroke();
      // FACE CUT-OUTS — angry slanted eyes (glowing from inside)
      const eyeGlo = `rgba(255,156,0,${flicker})`;
      // left eye (angry: inner corner raised)
      ctx.fillStyle = eyeGlo;
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.28, o.y+o.h*0.52); ctx.lineTo(cx2-o.w*0.15, o.y+o.h*0.41); ctx.lineTo(cx2-o.w*0.06, o.y+o.h*0.54); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0e0400';
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.26, o.y+o.h*0.52); ctx.lineTo(cx2-o.w*0.16, o.y+o.h*0.43); ctx.lineTo(cx2-o.w*0.08, o.y+o.h*0.52); ctx.closePath(); ctx.fill();
      // right eye
      ctx.fillStyle = eyeGlo;
      ctx.beginPath(); ctx.moveTo(cx2+o.w*0.06, o.y+o.h*0.54); ctx.lineTo(cx2+o.w*0.15, o.y+o.h*0.41); ctx.lineTo(cx2+o.w*0.28, o.y+o.h*0.52); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0e0400';
      ctx.beginPath(); ctx.moveTo(cx2+o.w*0.08, o.y+o.h*0.52); ctx.lineTo(cx2+o.w*0.16, o.y+o.h*0.43); ctx.lineTo(cx2+o.w*0.26, o.y+o.h*0.52); ctx.closePath(); ctx.fill();
      // triangle nose hole
      ctx.fillStyle = eyeGlo;
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.046, o.y+o.h*0.60); ctx.lineTo(cx2, o.y+o.h*0.52); ctx.lineTo(cx2+o.w*0.046, o.y+o.h*0.60); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0e0400';
      ctx.beginPath(); ctx.moveTo(cx2-o.w*0.032, o.y+o.h*0.595); ctx.lineTo(cx2, o.y+o.h*0.534); ctx.lineTo(cx2+o.w*0.032, o.y+o.h*0.595); ctx.closePath(); ctx.fill();
      // JAGGED MOUTH
      ctx.fillStyle = eyeGlo;
      ctx.beginPath(); ctx.rect(cx2-o.w*0.29, o.y+o.h*0.70, o.w*0.58, o.h*0.14); ctx.fill();
      ctx.fillStyle = '#060200';
      ctx.beginPath(); ctx.rect(cx2-o.w*0.27, o.y+o.h*0.71, o.w*0.54, o.h*0.12); ctx.fill();
      // top teeth
      ctx.fillStyle = '#f2e8c0';
      [cx2-o.w*0.24, cx2-o.w*0.12, cx2, cx2+o.w*0.12].forEach((tx, i) => {
        const th = (i%2===0) ? o.h*0.095 : o.h*0.065;
        ctx.beginPath(); ctx.roundRect(tx, o.y+o.h*0.71, o.w*0.08, th, [0,0,2,2]); ctx.fill();
      });
      // bottom teeth (upward pointing)
      ctx.fillStyle = '#e8dec8';
      [cx2-o.w*0.22, cx2-o.w*0.08, cx2+o.w*0.06, cx2+o.w*0.18].forEach((tx, i) => {
        const th = (i%2===0) ? o.h*0.075 : o.h*0.050;
        ctx.beginPath(); ctx.roundRect(tx, o.y+o.h*0.83-th, o.w*0.08, th, [2,2,0,0]); ctx.fill();
      });
      // highlight on body
      ctx.fillStyle = 'rgba(255,220,150,0.18)';
      ctx.beginPath(); ctx.ellipse(cx2-o.w*0.16, o.y+o.h*0.32, o.w*0.12, o.h*0.10, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(o.kind==='dragon'){
      const t = o.flapTimer || 0;
      const now = performance.now() / 1000;
      const wing = Math.sin(t * 10) * 0.48;
      const cx2 = o.x + o.w*0.42;  // body centre
      const cy = o.y + o.h*0.60;
      ctx.save();
      // FIRE BREATH (toward right — toward Belly)
      const fFlicker = 0.60 + 0.40*Math.sin(now * 24);
      const fLen = o.w*0.24*fFlicker;
      const fX = o.x + o.w*0.96, fY = cy - o.h*0.12;
      const fG = ctx.createLinearGradient(fX, fY, fX+fLen, fY);
      fG.addColorStop(0, `rgba(255,248,70,${0.95*fFlicker})`);
      fG.addColorStop(0.5, `rgba(255,105,0,${0.72*fFlicker})`);
      fG.addColorStop(1, 'rgba(255,20,0,0)');
      ctx.fillStyle = fG;
      ctx.beginPath();
      ctx.moveTo(fX, fY-6);
      ctx.quadraticCurveTo(fX+fLen*0.5+5*fFlicker, fY, fX+fLen, fY);
      ctx.quadraticCurveTo(fX+fLen*0.5-5*fFlicker, fY, fX, fY+6);
      ctx.closePath(); ctx.fill();
      // TAIL (arrow-tipped, left/trailing side)
      const tailX = o.x + o.w*0.06;
      ctx.fillStyle = '#6e1414';
      ctx.beginPath();
      ctx.moveTo(tailX+o.w*0.04, cy-o.h*0.08); ctx.lineTo(o.x, cy+o.h*0.05); ctx.lineTo(tailX+o.w*0.04, cy+o.h*0.13); ctx.lineTo(tailX+o.w*0.11, cy); ctx.closePath(); ctx.fill();
      // arrow tip spikes on tail
      ctx.fillStyle = '#450a0a';
      [[0.08,-0.20],[0.14,-0.24],[0.08,-0.09]].forEach(([dx,dy]) => {
        ctx.beginPath(); ctx.moveTo(tailX+o.w*dx, cy+o.h*dy); ctx.lineTo(tailX+o.w*(dx+0.04), cy+o.h*(dy-0.10)); ctx.lineTo(tailX+o.w*(dx+0.07), cy+o.h*dy); ctx.fill();
      });
      // WINGS (bat membrane style — behind body)
      // left/upper wing
      ctx.save(); ctx.translate(cx2-o.w*0.10, cy-o.h*0.26); ctx.rotate(-0.55 - wing*0.55);
      const wG1 = ctx.createLinearGradient(0, 0, -o.w*0.36, -o.h*0.52);
      wG1.addColorStop(0,'#7a0e0e'); wG1.addColorStop(1,'#280404');
      ctx.fillStyle = wG1;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(-o.w*0.07,-o.h*0.14,-o.w*0.28,-o.h*0.44,-o.w*0.34,-o.h*0.52); ctx.bezierCurveTo(-o.w*0.24,-o.h*0.36,-o.w*0.11,-o.h*0.26,0,-o.h*0.14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(130,20,20,0.45)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-o.w*0.34,-o.h*0.52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-o.h*0.10); ctx.lineTo(-o.w*0.19,-o.h*0.46); ctx.stroke();
      ctx.restore();
      // right/lower wing
      ctx.save(); ctx.translate(cx2+o.w*0.06, cy-o.h*0.22); ctx.rotate(0.42 + wing*0.55);
      const wG2 = ctx.createLinearGradient(0, 0, o.w*0.38, -o.h*0.48);
      wG2.addColorStop(0,'#921616'); wG2.addColorStop(1,'#330606');
      ctx.fillStyle = wG2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(o.w*0.08,-o.h*0.12,o.w*0.28,-o.h*0.38,o.w*0.38,-o.h*0.48); ctx.bezierCurveTo(o.w*0.24,-o.h*0.30,o.w*0.12,-o.h*0.20,0,-o.h*0.12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(160,28,28,0.45)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(o.w*0.38,-o.h*0.48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-o.h*0.08); ctx.lineTo(o.w*0.22,-o.h*0.42); ctx.stroke();
      ctx.restore();
      // BODY
      const bG = ctx.createLinearGradient(o.x+o.w*0.12, o.y, o.x+o.w*0.78, o.y+o.h);
      bG.addColorStop(0,'#d43232'); bG.addColorStop(0.45,'#8e1e1e'); bG.addColorStop(1,'#480808');
      ctx.fillStyle = bG;
      ctx.beginPath(); ctx.ellipse(cx2, cy, o.w*0.35, o.h*0.28, -0.08, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#360808'; ctx.lineWidth = 1.5; ctx.stroke();
      // BELLY PLATE (lighter underbelly)
      const belG = ctx.createLinearGradient(cx2, cy-o.h*0.14, cx2, cy+o.h*0.16);
      belG.addColorStop(0,'#f0b080'); belG.addColorStop(1,'#c07040');
      ctx.fillStyle = belG;
      ctx.beginPath(); ctx.ellipse(cx2, cy+o.h*0.08, o.w*0.16, o.h*0.17, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(150,76,36,0.45)'; ctx.lineWidth=1;
      for(let bi=0; bi<4; bi++){
        ctx.beginPath(); ctx.ellipse(cx2, cy+o.h*(0.00+bi*0.06), o.w*(0.14-bi*0.01), o.h*0.026, 0, 0, Math.PI*2); ctx.stroke();
      }
      // BACK SPIKES
      ctx.fillStyle = '#5e0e0e';
      [0.14,0.22,0.30,0.38,0.46].forEach((sx, i) => {
        const sH = o.h*(0.22-i*0.02);
        ctx.beginPath(); ctx.moveTo(o.x+o.w*sx, cy-o.h*0.20); ctx.lineTo(o.x+o.w*(sx+0.04), cy-o.h*0.20-sH); ctx.lineTo(o.x+o.w*(sx+0.08), cy-o.h*0.20); ctx.fill();
      });
      // NECK
      const nG = ctx.createLinearGradient(cx2+o.w*0.18, o.y, cx2+o.w*0.32, cy);
      nG.addColorStop(0,'#b82020'); nG.addColorStop(1,'#7a1010');
      ctx.fillStyle = nG;
      ctx.beginPath();
      ctx.moveTo(cx2+o.w*0.20, cy-o.h*0.20);
      ctx.bezierCurveTo(cx2+o.w*0.28, cy-o.h*0.32, cx2+o.w*0.38, cy-o.h*0.30, cx2+o.w*0.44, cy-o.h*0.18);
      ctx.bezierCurveTo(cx2+o.w*0.36, cy-o.h*0.08, cx2+o.w*0.27, cy-o.h*0.06, cx2+o.w*0.20, cy-o.h*0.02);
      ctx.fill();
      // HEAD
      const headX = cx2+o.w*0.48, headY = cy-o.h*0.26;
      const hG2 = ctx.createRadialGradient(headX-4, headY-4, 2, headX, headY, o.h*0.24);
      hG2.addColorStop(0,'#d84040'); hG2.addColorStop(1,'#7a1010');
      ctx.fillStyle = hG2;
      ctx.beginPath(); ctx.ellipse(headX, headY, o.w*0.158, o.h*0.220, 0.18, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#360808'; ctx.lineWidth=1.5; ctx.stroke();
      // HORNS
      ctx.fillStyle = '#280606';
      ctx.beginPath(); ctx.moveTo(headX-o.w*0.06, headY-o.h*0.19); ctx.lineTo(headX-o.w*0.13, headY-o.h*0.38); ctx.lineTo(headX+o.w*0.01, headY-o.h*0.15); ctx.fill();
      ctx.beginPath(); ctx.moveTo(headX+o.w*0.02, headY-o.h*0.17); ctx.lineTo(headX+o.w*0.06, headY-o.h*0.34); ctx.lineTo(headX+o.w*0.10, headY-o.h*0.13); ctx.fill();
      // SCALES on head
      ctx.fillStyle = 'rgba(210,38,38,0.30)';
      [[0,-.04],[-.06,.04],[.04,.04]].forEach(([sx,sy]) => {
        ctx.beginPath(); ctx.ellipse(headX+o.w*sx, headY+o.h*sy, o.w*0.044, o.h*0.036, 0, 0, Math.PI*2); ctx.fill();
      });
      // SNOUT / JAW
      ctx.fillStyle = '#c02828';
      ctx.beginPath(); ctx.ellipse(headX+o.w*0.10, headY+o.h*0.09, o.w*0.14, o.h*0.095, 0.22, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#360808'; ctx.lineWidth=1; ctx.stroke();
      // TEETH (three fangs)
      ctx.fillStyle = '#f0e0c0';
      [-3,2,7].forEach(tx => {
        ctx.beginPath(); ctx.moveTo(headX+o.w*0.158+tx, headY+o.h*0.07); ctx.lineTo(headX+o.w*0.158+tx+2.5, headY+o.h*0.16); ctx.lineTo(headX+o.w*0.158+tx+5, headY+o.h*0.07); ctx.fill();
      });
      // SLIT EYE
      const eyeX = headX-o.w*0.022, eyeY = headY-o.h*0.064;
      ctx.fillStyle = '#ffaa10';
      ctx.beginPath(); ctx.ellipse(eyeX, eyeY, o.w*0.060, o.h*0.072, 0, 0, Math.PI*2); ctx.fill();
      // vertical slit pupil
      ctx.fillStyle = '#100000';
      ctx.beginPath(); ctx.ellipse(eyeX, eyeY, o.w*0.020, o.h*0.066, 0, 0, Math.PI*2); ctx.fill();
      // eye sparkle
      ctx.fillStyle = 'rgba(255,220,80,0.70)';
      ctx.beginPath(); ctx.arc(eyeX+1.5, eyeY-3, 2.5, 0, Math.PI*2); ctx.fill();
      // eye glow
      const eGlo = ctx.createRadialGradient(eyeX, eyeY, 2, eyeX, eyeY, o.h*0.18);
      eGlo.addColorStop(0, `rgba(255,190,0,${0.30+0.14*Math.sin(now*4)})`);
      eGlo.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = eGlo; ctx.beginPath(); ctx.arc(eyeX, eyeY, o.h*0.18, 0, Math.PI*2); ctx.fill();
      // LEGS
      ctx.fillStyle = '#7e1a1a';
      [o.x+o.w*0.18, o.x+o.w*0.30, o.x+o.w*0.42, o.x+o.w*0.54].forEach(lx => {
        ctx.beginPath(); ctx.roundRect(lx-5, cy+o.h*0.06, 10, o.h*0.28, 3); ctx.fill();
      });
      ctx.fillStyle = '#f0dc80';
      [o.x+o.w*0.18, o.x+o.w*0.30, o.x+o.w*0.42, o.x+o.w*0.54].forEach(lx => {
        [-4,-1,2].forEach(cx3 => {
          ctx.beginPath(); ctx.moveTo(lx+cx3, cy+o.h*0.34); ctx.lineTo(lx+cx3-1.5, cy+o.h*0.42); ctx.lineTo(lx+cx3+2.5, cy+o.h*0.42); ctx.fill();
        });
      });
      ctx.restore();
    } else {
      ctx.fillStyle='#9fd3ff'; ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle='#334'; ctx.fillRect(o.x+o.w*0.15,o.y+o.h*0.2,o.w*0.2,o.h*0.18);
      ctx.fillStyle='#fff'; ctx.fillRect(o.x+o.w*0.6,o.y+o.h*0.25,o.w*0.2,o.h*0.12);
    }
    ctx.restore();
  }
  function drawCollectible(c, bonkers){
    const s = bonkers ? 2 : 1;
    // golden aura for candy canes
    if(c.kind === 'candy-cane'){
      const now = performance.now() / 1000;
      const pulse = 0.45 + 0.25 * Math.abs(Math.sin(now * 3.5 + c.x * 0.01));
      const ar = c.r * 2.1 * s;
      const aura = ctx.createRadialGradient(c.x, c.y, c.r * 0.4 * s, c.x, c.y, ar);
      aura.addColorStop(0, `rgba(255,230,0,${pulse})`);
      aura.addColorStop(0.55, `rgba(255,160,0,${pulse * 0.55})`);
      aura.addColorStop(1, 'rgba(255,120,0,0)');
      ctx.save();
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(c.x, c.y, ar, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.save();
    if(bonkers){ ctx.translate(c.x, c.y); ctx.scale(2, 2); ctx.translate(-c.x, -c.y); }
    const img = Assets.images[c.kind];
    if(img && img.complete){ ctx.drawImage(img, c.x-c.r, c.y-c.r, c.r*2, c.r*2); ctx.restore(); return; }
    // fallback: coloured circle with a letter so each kind is distinguishable
    const colours = {donut:'#c01060',pizza:'#e03c2d',icecream:'#ffadd2',lollipop:'#d40060',
                     hotdog:'#9e3010',cupcake:'#ff5da2',candybar:'#7b3fa0',milkshake:'#ff6eb4'};
    const labels  = {donut:'🍩',pizza:'🍕',icecream:'🍦',lollipop:'🍭',
                     hotdog:'🌭',cupcake:'🧁',candybar:'🍫',milkshake:'🥤'};
    ctx.fillStyle = colours[c.kind] || '#ffd24d';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
    ctx.font = `${c.r}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(labels[c.kind]||'?', c.x, c.y);
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.restore();
  }
  function drawPlank(p){
    const x = p.x, y = p.y, w = p.w, h = p.h;
    // main plank body
    ctx.fillStyle = '#a0682a';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
    // top lighter edge (3-D feel)
    ctx.fillStyle = '#c8883c';
    ctx.beginPath(); ctx.roundRect(x, y, w, 5, [4,4,0,0]); ctx.fill();
    // wood grain lines
    ctx.save();
    ctx.strokeStyle = 'rgba(80,40,10,0.35)';
    ctx.lineWidth = 1.5;
    const grainCount = Math.floor(w / 28);
    for(let i = 1; i <= grainCount; i++){
      const gx = x + (w / (grainCount + 1)) * i;
      ctx.beginPath(); ctx.moveTo(gx, y + 4); ctx.lineTo(gx - 4, y + h); ctx.stroke();
    }
    // plank dividing line across middle
    ctx.strokeStyle = 'rgba(80,40,10,0.2)';
    ctx.beginPath(); ctx.moveTo(x + 6, y + h * 0.5); ctx.lineTo(x + w - 6, y + h * 0.5); ctx.stroke();
    // nail dots at each end
    ctx.fillStyle = 'rgba(60,30,10,0.5)';
    ctx.beginPath(); ctx.arc(x + 10, y + h/2, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w - 10, y + h/2, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // draws a mini candy-cane shape centred at (cx, cy) with given size
  function drawMiniCandyCane(cx, cy, size, filled){
    ctx.save();
    const sw = size * 0.28;
    ctx.lineWidth = sw;
    ctx.lineCap = 'round';
    // white base
    ctx.strokeStyle = filled ? '#ffffff' : 'rgba(200,200,200,0.4)';
    ctx.beginPath();
    // stem: bottom to hook top
    ctx.moveTo(cx, cy + size * 0.55);
    ctx.lineTo(cx, cy - size * 0.15);
    // J-hook
    ctx.arc(cx + size * 0.25, cy - size * 0.15, size * 0.25, Math.PI, 0, false);
    ctx.stroke();
    // red stripes (3 dashes)
    ctx.strokeStyle = filled ? '#e82020' : 'rgba(200,50,50,0.3)';
    ctx.setLineDash([size * 0.22, size * 0.22]);
    ctx.lineDashOffset = 0;
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.55);
    ctx.lineTo(cx, cy - size * 0.15);
    ctx.arc(cx + size * 0.25, cy - size * 0.15, size * 0.25, Math.PI, 0, false);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawHUD(score, lives, candyCanes=0, caneGoal=3, invincible=false, level=1, perfectRewardEligible=true){
    // pill behind score
    ctx.save();
    const pillH = 78;
    const pillW = 244;
    ctx.fillStyle='rgba(255,255,255,0.80)';
    ctx.beginPath(); ctx.roundRect(8, 8, pillW, pillH, 8); ctx.fill();
    ctx.fillStyle='#123'; ctx.font='bold 18px sans-serif';
    ctx.fillText('Score: '+score, 16, 30);
    ctx.fillText('Lives: '+'❤️'.repeat(Math.max(0,lives)), 16, 52);
    ctx.fillStyle = level === 2 ? '#9040e0' : '#223';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LEVEL '+level, pillW - 8, 22);
    const rewardIcon = perfectRewardEligible ? '⭐' : '☆';
    const rewardText = perfectRewardEligible ? 'PERFECT' : 'MISSED';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = perfectRewardEligible ? '#0f7d2c' : '#b02a2a';
    ctx.fillText(rewardIcon + ' ' + rewardText, pillW - 8, 36);
    ctx.textAlign = 'left';

    ctx.font='bold 18px sans-serif'; ctx.fillStyle='#123';

    const goal = Math.max(1, Math.floor(caneGoal || 3));
    const collected = Math.max(0, Math.min(goal, candyCanes || 0));

    // candy cane counter — drawn as mini cane shapes
    const caneSize = 14;
    const startX = 16;
    const rowY = 70;
    const caneStep = caneSize * 1.5 + 4;
    for(let i = 0; i < goal; i++){
      drawMiniCandyCane(startX + i * caneStep + caneSize * 0.5, rowY, caneSize, i < collected);
    }

    // progress text for current mode target
    ctx.fillStyle = '#5a1a38';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${collected}/${goal}`, startX + goal * caneStep + 4, rowY + 4);

    // label
    ctx.fillStyle = invincible ? '#ff9900' : (collected > 0 ? '#cc0033' : '#666');
    ctx.font = invincible ? 'bold 11px sans-serif' : 'bold 11px sans-serif';
    const label = invincible ? '⚡ INVINCIBLE!' : '→ BONKERS!';
    ctx.fillText(label, startX + goal * caneStep + 40, rowY + 4);
    ctx.restore();
  }
  return {clear,drawBackground,drawBelly,drawObstacle,drawCollectible,drawPlank,drawHUD,drawBonkersFlash,drawBonkersShake,drawBonkersRunLines,drawLevelComplete,ctx};
})();
