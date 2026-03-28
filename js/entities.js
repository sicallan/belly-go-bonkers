class Belly {
  constructor(x,y){ this.x = x; this.y = y; this.vy = 0; this.width = 64; this.height = 64; this.onGround = false; this.lives = 3; this.color = '#ff79b4'; this.collect = 0; this.boostTime = 0; this.boosting = false; }
  static NORMAL_JUMP_IMPULSE = -9;
  static BONKERS_JUMP_IMPULSE = Belly.NORMAL_JUMP_IMPULSE * 2 * 0.75; // 25% lower than previous bonkers jump
  static NORMAL_BOOST_FORCE = 18;
  static BONKERS_BOOST_FORCE = Belly.NORMAL_BOOST_FORCE * 2 * 0.75;   // keep hold-boost in proportion
  
  // animate time for sprite frames
  animTime = 0;
  // ground y (top of belly when on ground) - set externally per canvas size
  groundY = 400;
  // set true during bonkers run for 2x jump height
  bonkersJump = false;
  
  // Initial jump — smaller impulse than before; holding extends it via boost()
  jump(){ if(this.onGround){ this.vy = this.bonkersJump ? Belly.BONKERS_JUMP_IMPULSE : Belly.NORMAL_JUMP_IMPULSE; this.onGround = false; this.boostTime = 0; this.boosting = true; } }
  
  // Called each frame while jump key is held — applies gentle upward force up to MAX_BOOST_DURATION
  boost(dt, maxDuration = 0.5){
    if(!this.boosting) return;
    if(this.onGround){ this.boosting = false; return; }  // landed
    if(this.boostTime >= maxDuration){ this.boosting = false; return; }  // cap reached
    this.vy -= (this.bonkersJump ? Belly.BONKERS_BOOST_FORCE : Belly.NORMAL_BOOST_FORCE) * dt;   // gentle upward push each frame
    this.boostTime += dt;
  }
  
  stopBoost(){ this.boosting = false; }
  
  update(dt, gravity=0.6, planks=[]){
    const prevY = this.y;
    this.vy += gravity;
    this.y += this.vy;
    const g = (this.groundY !== undefined) ? this.groundY : 400;
    // plank landing: check if feet crossed the top of a plank this frame while falling
    if(this.vy >= 0){
      const prevBottom = prevY + this.height;
      const curBottom  = this.y + this.height;
      const cx = this.x + this.width / 2;
      for(const p of planks){
        if(prevBottom <= p.y + 6 && curBottom >= p.y && cx >= p.x && cx <= p.x + p.w){
          this.y = p.y - this.height;
          this.vy = 0; this.onGround = true; this.boosting = false;
          return;
        }
      }
    }
    // ground
    if(this.y >= g){ this.y = g; this.vy = 0; this.onGround = true; this.boosting = false; }
  }
  rect(){ return {x:this.x, y:this.y, w:this.width, h:this.height} }
  // Tight circular hitbox — inset from sprite bounds to match the blobby shape
  hitBox(){
    const inset = this.width * 0.22;
    return {x: this.x + inset, y: this.y + inset, w: this.width - inset*2, h: this.height - inset*2};
  }
}

class Obstacle{
  constructor(x,y,kind='toy-small'){
    this.x = x; this.y = y; this.kind = kind;
    // Level 1 obstacles
    if(kind==='toy-large')  { this.w = 80; this.h = 80; }
    else if(kind==='toy-ball')  { this.w = 48; this.h = 48; }
    else if(kind==='bicycle')   { this.w = 88; this.h = 60; }
    else if(kind==='toy-car')   { this.w = 80; this.h = 52; }
    else if(kind==='dinosaur')  { this.w = 64; this.h = 80; }
    else if(kind==='blocks')    { this.w = 64; this.h = 64; }
    else if(kind==='rattle')    { this.w = 52; this.h = 52; }
    // Level 2 obstacles
    else if(kind==='ant')       { this.w = 58; this.h = 38; this.wriggleTimer = 0; this.extraSpeed = 25 + Math.random()*20; }
    else if(kind==='worm')      { this.w = 66; this.h = 30; this.wriggleTimer = 0; }
    else if(kind==='roman-pot') { this.w = 54; this.h = 70; }
    else if(kind==='boulder')   { this.w = 72; this.h = 58; }
    else if(kind==='clock')     { this.w = 56; this.h = 62; }
    // Level 3 (sky) obstacles
    else if(kind==='bird')           { this.w = 64; this.h = 40; this.flapTimer = 0; }
    else if(kind==='balloon')        { this.w = 48; this.h = 64; }
    else if(kind==='plane')          { this.w = 104; this.h = 44; }
    else if(kind==='hot-air-balloon'){ this.w = 76; this.h = 96; }
    else if(kind==='blimp')          { this.w = 116; this.h = 54; }
    // Level 4 (space) obstacles
    else if(kind==='alien')          { this.w = 64; this.h = 64; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 22+Math.random()*28; this.floatSpeed = 1.2+Math.random()*1.5; }
    else if(kind==='alien-ship')     { this.w = 96; this.h = 44; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 18+Math.random()*30; this.floatSpeed = 0.8+Math.random()*1.2; }
    else if(kind==='comet')          { this.w = 58; this.h = 34; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 14+Math.random()*22; this.floatSpeed = 2.2+Math.random()*2.0; }
    else if(kind==='meteorite')      { this.w = 70; this.h = 62; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 10+Math.random()*20; this.floatSpeed = 1.0+Math.random()*1.0; this.spin = 0; }
    else if(kind==='rocket')         { this.w = 48; this.h = 84; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 16+Math.random()*24; this.floatSpeed = 1.5+Math.random()*1.5; }
    // level 5 — handbag
    else if(kind==='lipstick')        { this.w = 28; this.h = 72; }
    else if(kind==='receipt')         { this.w = 38; this.h = 96; this.scrollOff = Math.random()*40; }
    else if(kind==='chewing-gum')     { this.w = 86; this.h = 30; }
    else if(kind==='nail-varnish')    { this.w = 30; this.h = 82; }
    else if(kind==='bank-card')       { this.w = 92; this.h = 58; }
    else if(kind==='keys')            { this.w = 74; this.h = 66; this.swing = Math.random()*6.28; }
    // level 6 — portal world
    else if(kind==='zombie')          { this.w = 62; this.h = 86; }
    else if(kind==='dancing-skeleton'){ this.w = 58; this.h = 84; this.wriggleTimer = 0; }
    else if(kind==='rat')             { this.w = 78; this.h = 44; this.wriggleTimer = 0; this.extraSpeed = 22 + Math.random()*20; }
    else if(kind==='white-ghost')     { this.w = 66; this.h = 76; this.floatTimer = Math.random()*6.28; this.baseY = 0; this.floatAmp = 14+Math.random()*22; this.floatSpeed = 1.1+Math.random()*0.9; }
    else if(kind==='angry-pumpkin')   { this.w = 70; this.h = 58; }
    else if(kind==='dragon')          { this.w = 118; this.h = 66; this.flapTimer = 0; }
    else { this.w = 56; this.h = 56; }
  }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h} }
  // Inset hitbox per toy kind to match visual bounds
  hitBox(){
    if(this.kind==='toy-ball'){
      const inset = this.w * 0.15;
      return {x:this.x+inset, y:this.y+inset, w:this.w-inset*2, h:this.h-inset*2};
    }
    if(this.kind==='toy-large' || this.kind==='rattle'){
      return {x:this.x+this.w*0.18, y:this.y+this.h*0.12, w:this.w*0.64, h:this.h*0.76};
    }
    if(this.kind==='bicycle'){
      return {x:this.x+this.w*0.08, y:this.y+this.h*0.20, w:this.w*0.84, h:this.h*0.72};
    }
    if(this.kind==='toy-car'){
      return {x:this.x+this.w*0.05, y:this.y+this.h*0.18, w:this.w*0.90, h:this.h*0.72};
    }
    if(this.kind==='dinosaur'){
      return {x:this.x+this.w*0.20, y:this.y+this.h*0.08, w:this.w*0.65, h:this.h*0.88};
    }
    if(this.kind==='ant'){
      return {x:this.x+this.w*0.08, y:this.y+this.h*0.25, w:this.w*0.84, h:this.h*0.70};
    }
    if(this.kind==='worm'){
      return {x:this.x+this.w*0.08, y:this.y+this.h*0.22, w:this.w*0.84, h:this.h*0.58};
    }
    if(this.kind==='roman-pot'){
      return {x:this.x+this.w*0.15, y:this.y+this.h*0.08, w:this.w*0.70, h:this.h*0.88};
    }
    if(this.kind==='boulder'){
      const inset = this.w * 0.10;
      return {x:this.x+inset, y:this.y+inset, w:this.w-inset*2, h:this.h-inset*2};
    }
    if(this.kind==='clock'){
      return {x:this.x+this.w*0.10, y:this.y+this.h*0.06, w:this.w*0.80, h:this.h*0.90};
    }
    if(this.kind==='bird'){
      return {x:this.x+this.w*0.12, y:this.y+this.h*0.20, w:this.w*0.76, h:this.h*0.62};
    }
    if(this.kind==='balloon'){
      const inset = this.w * 0.14;
      return {x:this.x+inset, y:this.y+inset, w:this.w-inset*2, h:this.h*0.72};
    }
    if(this.kind==='plane'){
      return {x:this.x+this.w*0.04, y:this.y+this.h*0.22, w:this.w*0.92, h:this.h*0.54};
    }
    if(this.kind==='hot-air-balloon'){
      return {x:this.x+this.w*0.08, y:this.y+this.h*0.04, w:this.w*0.84, h:this.h*0.92};
    }
    if(this.kind==='blimp'){
      return {x:this.x+this.w*0.05, y:this.y+this.h*0.18, w:this.w*0.90, h:this.h*0.64};
    }
    if(this.kind==='alien'){
      return {x:this.x+this.w*0.18, y:this.y+this.h*0.06, w:this.w*0.64, h:this.h*0.90};
    }
    if(this.kind==='alien-ship'){
      return {x:this.x+this.w*0.07, y:this.y+this.h*0.26, w:this.w*0.86, h:this.h*0.52};
    }
    if(this.kind==='comet'){
      return {x:this.x+this.w*0.30, y:this.y+this.h*0.08, w:this.w*0.65, h:this.h*0.84};
    }
    if(this.kind==='meteorite'){
      const inset = this.w * 0.12;
      return {x:this.x+inset, y:this.y+inset, w:this.w-inset*2, h:this.h-inset*2};
    }
    if(this.kind==='rocket'){
      return {x:this.x+this.w*0.20, y:this.y+this.h*0.04, w:this.w*0.60, h:this.h*0.92};
    }
    if(this.kind==='lipstick'){
      return {x:this.x+this.w*0.18, y:this.y+this.h*0.04, w:this.w*0.64, h:this.h*0.94};
    }
    if(this.kind==='receipt'){
      return {x:this.x+this.w*0.10, y:this.y+this.h*0.02, w:this.w*0.80, h:this.h*0.96};
    }
    if(this.kind==='chewing-gum'){
      return {x:this.x+this.w*0.04, y:this.y+this.h*0.08, w:this.w*0.92, h:this.h*0.84};
    }
    if(this.kind==='nail-varnish'){
      return {x:this.x+this.w*0.14, y:this.y+this.h*0.04, w:this.w*0.72, h:this.h*0.94};
    }
    if(this.kind==='bank-card'){
      return {x:this.x+this.w*0.04, y:this.y+this.h*0.06, w:this.w*0.92, h:this.h*0.88};
    }
    if(this.kind==='keys'){
      return {x:this.x+this.w*0.10, y:this.y+this.h*0.08, w:this.w*0.80, h:this.h*0.84};
    }
    if(this.kind==='zombie'){
      return {x:this.x+this.w*0.16, y:this.y+this.h*0.05, w:this.w*0.68, h:this.h*0.92};
    }
    if(this.kind==='dancing-skeleton'){
      return {x:this.x+this.w*0.20, y:this.y+this.h*0.04, w:this.w*0.60, h:this.h*0.94};
    }
    if(this.kind==='rat'){
      return {x:this.x+this.w*0.06, y:this.y+this.h*0.18, w:this.w*0.90, h:this.h*0.68};
    }
    if(this.kind==='white-ghost'){
      return {x:this.x+this.w*0.12, y:this.y+this.h*0.06, w:this.w*0.76, h:this.h*0.88};
    }
    if(this.kind==='angry-pumpkin'){
      return {x:this.x+this.w*0.08, y:this.y+this.h*0.10, w:this.w*0.84, h:this.h*0.82};
    }
    if(this.kind==='dragon'){
      return {x:this.x+this.w*0.06, y:this.y+this.h*0.12, w:this.w*0.90, h:this.h*0.76};
    }
    // toy-small, blocks
    return {x:this.x+this.w*0.1, y:this.y+this.h*0.1, w:this.w*0.8, h:this.h*0.8};
  }
}

class Collectible{
  constructor(x,y,kind='donut'){
    this.x = x; this.y = y; this.kind = kind;
    // radius controls both draw size and hitbox
    const radii = {donut:16, pizza:16, icecream:18, lollipop:14, hotdog:18, cupcake:15, candybar:16, milkshake:16, 'candy-cane':30};
    this.r = radii[kind] || 14;
  }
  rect(){ return {x:this.x-this.r,y:this.y-this.r,w:this.r*2,h:this.r*2} }
  // collectibles are small — use full rect as hitbox but shrink slightly
  hitBox(){
    const inset = this.r * 0.25;
    return {x:this.x-this.r+inset, y:this.y-this.r+inset, w:(this.r-inset)*2, h:(this.r-inset)*2};
  }
}

function aabb(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y }

class Plank{
  constructor(x, y, w){
    this.x = x; this.y = y; this.w = w; this.h = 18;
  }
}

exported = {Belly,Obstacle,Collectible,Plank,aabb};
