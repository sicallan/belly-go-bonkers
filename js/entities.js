// ============================================================
// entities.js — game objects: Belly, Obstacle, Collectible, Plank
// ============================================================
// Each class holds the data (position, size) and behaviour
// (physics, hitbox) for one kind of thing in the game world.
// The standalone aabb() helper checks if two rectangles overlap.
//
// This module follows the simple object-export pattern rather
// than an IIFE because all items here are classes — they are
// accessed as exported.Belly, exported.Obstacle, etc.
// ============================================================

// ------------------------------------------------------------
// HITBOX LOOKUP TABLE
// Each entry is [leftFrac, topFrac, widthFrac, heightFrac].
// These fractions are multiplied by the sprite's w and h to
// produce an inset rectangle that matches the visual shape.
// A smaller rectangle means more forgiving (easier) collisions.
// ------------------------------------------------------------
const OBSTACLE_HITBOX = {
  // Level 1 — playground toys
  'toy-ball':          [0.15, 0.15, 0.70, 0.70],
  'toy-large':         [0.18, 0.12, 0.64, 0.76],
  'toy-small':         [0.10, 0.10, 0.80, 0.80],
  'bicycle':           [0.08, 0.20, 0.84, 0.72],
  'toy-car':           [0.05, 0.18, 0.90, 0.72],
  'dinosaur':          [0.20, 0.08, 0.65, 0.88],
  'blocks':            [0.10, 0.10, 0.80, 0.80],
  'rattle':            [0.18, 0.12, 0.64, 0.76],
  // Level 2 — garden / outdoor
  'ant':               [0.08, 0.25, 0.84, 0.70],
  'worm':              [0.08, 0.22, 0.84, 0.58],
  'roman-pot':         [0.15, 0.08, 0.70, 0.88],
  'boulder':           [0.10, 0.10, 0.80, 0.80],
  'clock':             [0.10, 0.06, 0.80, 0.90],
  // Level 3 — sky
  'bird':              [0.12, 0.20, 0.76, 0.62],
  'balloon':           [0.14, 0.14, 0.72, 0.72],
  'plane':             [0.04, 0.22, 0.92, 0.54],
  'hot-air-balloon':   [0.08, 0.04, 0.84, 0.92],
  'blimp':             [0.05, 0.18, 0.90, 0.64],
  // Level 4 — space
  'alien':             [0.18, 0.06, 0.64, 0.90],
  'alien-ship':        [0.07, 0.26, 0.86, 0.52],
  'comet':             [0.30, 0.08, 0.65, 0.84],
  'meteorite':         [0.12, 0.12, 0.76, 0.76],
  'rocket':            [0.20, 0.04, 0.60, 0.92],
  // Level 5 — handbag world
  'lipstick':          [0.18, 0.04, 0.64, 0.94],
  'receipt':           [0.10, 0.02, 0.80, 0.96],
  'chewing-gum':       [0.04, 0.08, 0.92, 0.84],
  'nail-varnish':      [0.14, 0.04, 0.72, 0.94],
  'bank-card':         [0.04, 0.06, 0.92, 0.88],
  'keys':              [0.10, 0.08, 0.80, 0.84],
  // Level 6 — portal world
  'zombie':            [0.16, 0.05, 0.68, 0.92],
  'dancing-skeleton':  [0.20, 0.04, 0.60, 0.94],
  'rat':               [0.06, 0.18, 0.90, 0.68],
  'white-ghost':       [0.12, 0.06, 0.76, 0.88],
  'angry-pumpkin':     [0.08, 0.10, 0.84, 0.82],
  'dragon':            [0.06, 0.12, 0.90, 0.76],
};

// ------------------------------------------------------------
// Belly — the player character
// ------------------------------------------------------------
class Belly {
  // Static constants control jump feel — change these to tune
  // how high and how long Belly can fly through the air.
  static NORMAL_JUMP_IMPULSE  = -9;
  static BONKERS_JUMP_IMPULSE = Belly.NORMAL_JUMP_IMPULSE * 2 * 0.75; // 25% lower than raw ×2
  static NORMAL_BOOST_FORCE   = 18;
  static BONKERS_BOOST_FORCE  = Belly.NORMAL_BOOST_FORCE * 2 * 0.75;  // keep hold-boost in proportion

  /**
   * Creates a new Belly at the given canvas position.
   * @param {number} x - Horizontal start position in pixels.
   * @param {number} y - Vertical start position in pixels.
   */
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.vy     = 0;         // vertical velocity (positive = falling)
    this.width  = 64;
    this.height = 64;
    this.onGround  = false;
    this.lives     = 3;
    this.color     = '#ff79b4'; // Explorer Task 1: change this colour!
    this.collect   = 0;         // number of collectibles gathered this run
    this.boostTime = 0;         // seconds the jump-boost has been active
    this.boosting  = false;     // true while the jump key is held after a jump
    this.animTime  = 0;         // accumulates each frame for sprite animation
    this.groundY   = 400;       // top-of-Belly Y when standing on the ground
    this.bonkersJump = false;   // set true during Bonkers Mode for a bigger jump
  }

  /**
   * Applies the initial jump impulse if Belly is standing on the ground.
   * @returns {void}
   */
  jump() {
    if (this.onGround) {
      this.vy = this.bonkersJump
        ? Belly.BONKERS_JUMP_IMPULSE
        : Belly.NORMAL_JUMP_IMPULSE; // Explorer Task 2: find NORMAL_JUMP_IMPULSE above!
      this.onGround  = false;
      this.boostTime = 0;
      this.boosting  = true;
    }
  }

  /**
   * Applies a gentle upward push each frame while the jump key is held.
   * This extends the jump height — releasing the key early gives a shorter jump.
   * @param {number} dt          - Seconds since last frame.
   * @param {number} maxDuration - Maximum seconds the boost can last.
   * @returns {void}
   */
  boost(dt, maxDuration = 0.5) {
    if (!this.boosting) return;
    if (this.onGround) { this.boosting = false; return; }      // landed — stop boosting
    if (this.boostTime >= maxDuration) { this.boosting = false; return; } // time cap reached
    this.vy -= (this.bonkersJump
      ? Belly.BONKERS_BOOST_FORCE
      : Belly.NORMAL_BOOST_FORCE) * dt;
    this.boostTime += dt;
  }

  // Cancels the jump boost early — called when the jump key is released.
  stopBoost() {
    this.boosting = false;
  }

  /**
   * Moves Belly one frame forward: applies gravity, moves vertically,
   * then checks for landing on planks or the main ground.
   * @param {number}   dt      - Seconds since last frame.
   * @param {number}   gravity - Downward acceleration per frame.
   * @param {Plank[]}  planks  - Array of active floating platforms.
   * @returns {void}
   */
  update(dt, gravity = 0.6, planks = []) {
    const prevY = this.y;

    // Apply gravity then move
    this.vy += gravity;
    this.y  += this.vy;

    const groundLimit = (this.groundY !== undefined) ? this.groundY : 400;

    // Check plank landings only while falling (vy >= 0)
    if (this.vy >= 0) {
      const prevBottom = prevY + this.height;
      const curBottom  = this.y + this.height;
      const cx = this.x + this.width / 2; // horizontal centre of Belly

      for (const p of planks) {
        const feetCrossedTop = prevBottom <= p.y + 6 && curBottom >= p.y;
        const overPlank      = cx >= p.x && cx <= p.x + p.w;

        if (feetCrossedTop && overPlank) {
          this.y        = p.y - this.height;
          this.vy       = 0;
          this.onGround = true;
          this.boosting = false;
          return;
        }
      }
    }

    // Main ground
    if (this.y >= groundLimit) {
      this.y        = groundLimit;
      this.vy       = 0;
      this.onGround = true;
      this.boosting = false;
    }
  }

  /**
   * Returns the full bounding rectangle of Belly's sprite.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  rect() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  /**
   * Returns a smaller inset rectangle used for collision detection.
   * Inset from the sprite edges to match Belly's round blobby shape,
   * giving the player a little forgiveness on near-misses.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  hitBox() {
    const inset = this.width * 0.22;
    return {
      x: this.x + inset,
      y: this.y + inset,
      w: this.width  - inset * 2,
      h: this.height - inset * 2,
    };
  }
}

// ------------------------------------------------------------
// Obstacle — anything Belly must avoid
// ------------------------------------------------------------
class Obstacle {
  // Sprite sizes per obstacle kind.
  // These are the pixel dimensions used both for drawing and
  // for calculating the hitbox (via OBSTACLE_HITBOX above).
  static SIZES = {
    // Level 1 — playground toys
    'toy-small':         { w: 56,  h: 56 },
    'toy-large':         { w: 80,  h: 80 },
    'toy-ball':          { w: 48,  h: 48 },
    'bicycle':           { w: 88,  h: 60 },
    'toy-car':           { w: 80,  h: 52 },
    'dinosaur':          { w: 64,  h: 80 },
    'blocks':            { w: 64,  h: 64 },
    'rattle':            { w: 52,  h: 52 },
    // Level 2 — garden / outdoor
    'ant':               { w: 58,  h: 38 },
    'worm':              { w: 66,  h: 30 },
    'roman-pot':         { w: 54,  h: 70 },
    'boulder':           { w: 72,  h: 58 },
    'clock':             { w: 56,  h: 62 },
    // Level 3 — sky
    'bird':              { w: 64,  h: 40 },
    'balloon':           { w: 48,  h: 64 },
    'plane':             { w: 104, h: 44 },
    'hot-air-balloon':   { w: 76,  h: 96 },
    'blimp':             { w: 116, h: 54 },
    // Level 4 — space
    'alien':             { w: 64,  h: 64 },
    'alien-ship':        { w: 96,  h: 44 },
    'comet':             { w: 58,  h: 34 },
    'meteorite':         { w: 70,  h: 62 },
    'rocket':            { w: 48,  h: 84 },
    // Level 5 — handbag world
    'lipstick':          { w: 28,  h: 72 },
    'receipt':           { w: 38,  h: 96 },
    'chewing-gum':       { w: 86,  h: 30 },
    'nail-varnish':      { w: 30,  h: 82 },
    'bank-card':         { w: 92,  h: 58 },
    'keys':              { w: 74,  h: 66 },
    // Level 6 — portal world
    'zombie':            { w: 62,  h: 86 },
    'dancing-skeleton':  { w: 58,  h: 84 },
    'rat':               { w: 78,  h: 44 },
    'white-ghost':       { w: 66,  h: 76 },
    'angry-pumpkin':     { w: 70,  h: 58 },
    'dragon':            { w: 118, h: 66 },
  };

  /**
   * Creates a new Obstacle at the given position.
   * @param {number} x    - Horizontal spawn position.
   * @param {number} y    - Vertical spawn position.
   * @param {string} kind - Obstacle type key (e.g. 'bicycle', 'dragon').
   */
  constructor(x, y, kind = 'toy-small') {
    this.x    = x;
    this.y    = y;
    this.kind = kind;

    // Look up sprite size from the table; fall back to a default square
    const size = Obstacle.SIZES[kind] || { w: 56, h: 56 };
    this.w = size.w;
    this.h = size.h;

    // Per-kind dynamic state — only set on kinds that need it
    this._initDynamicState(kind);
  }

  // Sets up any extra animation/movement state specific to a kind.
  _initDynamicState(kind) {
    // Wriggly ground creatures
    if (kind === 'ant' || kind === 'worm' || kind === 'dancing-skeleton' || kind === 'rat') {
      this.wriggleTimer = 0;
    }
    // Fast-moving ground chasers
    if (kind === 'ant' || kind === 'rat') {
      this.extraSpeed = 22 + Math.random() * 20;
    }
    // Flapping flyers
    if (kind === 'bird' || kind === 'dragon') {
      this.flapTimer = 0;
    }
    // Smoothly floating obstacles
    if (['alien','alien-ship','comet','meteorite','rocket','white-ghost'].includes(kind)) {
      this.floatTimer = Math.random() * 6.28; // random start phase
      this.baseY      = 0;
      this.floatAmp   = 14 + Math.random() * 28;
      this.floatSpeed = 1.0 + Math.random() * 1.5;
    }
    // Extra state for individual kinds
    if (kind === 'meteorite') {
      this.spin = 0;
    }
    if (kind === 'keys') {
      this.swing = Math.random() * 6.28;
    }
    if (kind === 'receipt') {
      this.scrollOff = Math.random() * 40;
    }
  }

  /**
   * Returns the full bounding rectangle of this obstacle's sprite.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  /**
   * Returns the inset collision rectangle for this obstacle.
   * Uses OBSTACLE_HITBOX to look up the four inset fractions for
   * this kind, then computes the rectangle. Falls back to 10% inset.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  hitBox() {
    const entry = OBSTACLE_HITBOX[this.kind];
    const [lf, tf, wf, hf] = entry || [0.10, 0.10, 0.80, 0.80]; // default fallback
    return {
      x: this.x + this.w * lf,
      y: this.y + this.h * tf,
      w: this.w * wf,
      h: this.h * hf,
    };
  }
}

// ------------------------------------------------------------
// Collectible — treats Belly can pick up for points
// ------------------------------------------------------------

// Radii for each collectible kind (pixels).
// A larger radius means the sprite is drawn bigger AND the
// hitbox is bigger — easier to collect.
// Builder Task 1: add a new kind here to create a new collectible!
const COLLECTIBLE_RADII = {
  donut:       16,
  pizza:       16,
  icecream:    18,
  lollipop:    14,
  hotdog:      18,
  cupcake:     15,
  candybar:    16,
  milkshake:   16,
  'candy-cane': 30,
};

class Collectible {
  /**
   * Creates a new Collectible centred at (x, y).
   * @param {number} x    - Centre x position.
   * @param {number} y    - Centre y position.
   * @param {string} kind - Collectible type key (e.g. 'donut').
   */
  constructor(x, y, kind = 'donut') {
    this.x    = x;
    this.y    = y;
    this.kind = kind;
    this.r    = COLLECTIBLE_RADII[kind] || 14; // radius controls both draw size and hitbox
  }

  /**
   * Returns the bounding rectangle around this collectible.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  rect() {
    return {
      x: this.x - this.r,
      y: this.y - this.r,
      w: this.r * 2,
      h: this.r * 2,
    };
  }

  /**
   * Returns a slightly inset hitbox — gives a small amount of
   * forgiveness so Belly does not have to exactly overlap the centre.
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  hitBox() {
    const inset = this.r * 0.25;
    return {
      x: this.x - this.r + inset,
      y: this.y - this.r + inset,
      w: (this.r - inset) * 2,
      h: (this.r - inset) * 2,
    };
  }
}

// ------------------------------------------------------------
// Plank — a floating platform Belly can land on
// ------------------------------------------------------------
class Plank {
  /**
   * Creates a new Plank.
   * @param {number} x - Left edge x position.
   * @param {number} y - Top edge y position.
   * @param {number} w - Width in pixels.
   */
  constructor(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = 18; // fixed height for all planks
  }
}

// ------------------------------------------------------------
// Standalone helpers
// ------------------------------------------------------------

/**
 * Checks whether two axis-aligned bounding boxes overlap.
 * This is the core of all collision detection in the game.
 * Creator Task 3: try writing rectContainsPoint() in the same style!
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @returns {boolean} true if the two rectangles intersect
 */
function aabb(a, b) {
  return (
    a.x         < b.x + b.w &&
    a.x + a.w   > b.x       &&
    a.y         < b.y + b.h &&
    a.y + a.h   > b.y
  );
}

/**
 * Checks whether a point lies inside a rectangle.
 * Useful for hit-testing buttons and touch zones.
 * @param {{ x: number, y: number, w: number, h: number }} rect
 * @param {number} px - Point x coordinate.
 * @param {number} py - Point y coordinate.
 * @returns {boolean} true if (px, py) is inside rect
 */
function rectContainsPoint(rect, px, py) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.w &&
    py >= rect.y &&
    py <= rect.y + rect.h
  );
}

// Export all public classes and helpers under one object.
// game.js accesses them as exported.Belly, exported.Obstacle, etc.
const exported = { Belly, Obstacle, Collectible, Plank, aabb, rectContainsPoint };
