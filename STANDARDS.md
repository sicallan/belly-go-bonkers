# Belly Go Bonkers — Code Standards & Learning Guide

This document does two things:

1. **Code Standards** — the rules every developer (or young coder!) should follow when working on this codebase.
2. **Learning Paths** — three fun adventure tiers for kids aged 6–11 who want to explore how the game is made.

---

## Part 1 — Code Standards

These rules keep the code easy to read, safe from sneaky bugs, and consistent no matter who is working on it.

### 1.1 Module Pattern

Every JavaScript file must export itself as a **named IIFE** (an Immediately Invoked Function Expression). This keeps all variables safely tucked inside the file and makes the module easy to find from other files.

```js
// CORRECT
const ModuleName = (function() {
  // private stuff here

  return {
    publicMethod,
  };
})();
```

- `Assets`, `Input`, and `Renderer` already follow this pattern — great!
- `game.js` currently uses an **anonymous** IIFE (`(function(){...})()`). It must be changed to `const Game = (function(){...})();`.
- `entities.js` currently uses `exported = {...}` (a bare assignment with no `const`). It must be changed to `const exported = {...}`.

### 1.2 Formatting

**One statement per line.** No packing multiple statements onto a single line.

```js
// WRONG
constructor(x, y) { this.x = x; this.y = y; this.vy = 0; this.width = 64; }

// CORRECT
constructor(x, y) {
  this.x = x;
  this.y = y;
  this.vy = 0;
  this.width = 64;
}
```

**Indentation:** 2 spaces. No tabs.

**Curly braces on the same line** as the statement that opens the block:

```js
// CORRECT
if (condition) {
  doSomething();
}

function greet(name) {
  return 'Hello ' + name;
}
```

### 1.3 Naming Conventions

| What it is | Style | Example |
|---|---|---|
| Variables and functions | camelCase | `spawnObstacle`, `candyCaneCount` |
| Classes | PascalCase | `Belly`, `Obstacle`, `Collectible` |
| Top-level configuration constants | UPPER_SNAKE_CASE | `MAX_BOOST_DURATION`, `BONKERS_CONFIGS` |

### 1.4 Comments

Every function must have a **one-line comment** directly above it explaining what it does. Keep it short and plain — one sentence is enough.

```js
// Saves the player's name and score to the recent-scores list.
function saveRecent(name, score) { ... }
```

Every top-level `const` configuration block must have an **inline label** comment on the opening line:

```js
const BONKERS_CONFIGS = { // difficulty settings for each bonkers mode
  easy: { ... },
  normal: { ... },
};
```

### 1.5 No Implicit Globals

Never assign to a variable that has not been declared with `const`, `let`, or `var`. Undeclared assignments create accidental global variables that can be overwritten by any other script.

```js
// WRONG — creates a global by accident
exported = { Belly, Obstacle };

// CORRECT
const exported = { Belly, Obstacle };
```

### 1.6 Magic Numbers

Any number that controls game behaviour (speeds, gravity, spawn distances, score values, durations, multipliers) must be given a **named constant**. Group all tunable constants at the top of the relevant file under a clearly-labelled `CONFIG` block or as individual `const` declarations.

```js
// WRONG
this.vy = -9;

// CORRECT — defined once at the top of the file
static NORMAL_JUMP_IMPULSE = -9;

// WRONG
speed = 160;

// CORRECT — in a CONFIG block at the top of game.js
const CONFIG = { // core gameplay constants
  INITIAL_SPEED: 160,       // px per second at game start
  CANDY_SCORE:   10,        // points for a regular collectible
  GRAVITY:       0.6,       // downward force per frame
};
```

### 1.7 JSDoc for Public API Functions

Any function that is part of a module's public API (i.e. included in the `return` statement of its IIFE, or a class method used outside its own file) must have a JSDoc comment with `@param` and `@returns` tags for every parameter and return value.

```js
/**
 * Applies the initial jump impulse to Belly if she is on the ground.
 * @returns {void}
 */
jump() { ... }

/**
 * Checks whether two axis-aligned bounding boxes overlap.
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @returns {boolean} true if the boxes intersect
 */
function aabb(a, b) { ... }
```

---

## Part 2 — Refactoring Checklist

These are the concrete changes needed to bring the current code up to the standards above. Work through them one at a time — each item is small and safe to do on its own.

### entities.js

- [ ] **Fix the implicit global.** Change the last line from `exported = {...}` to `const exported = {...}`.
- [ ] **Expand the `Belly` constructor.** The one-liner `constructor(x,y){ this.x = x; this.y = y; ... }` must be expanded so each property assignment sits on its own line.
- [ ] **Expand the `Obstacle` constructor.** Each `this.w = ...; this.h = ...;` pair inside the `if/else if` chain should be on separate lines.
- [ ] **Expand the `Collectible` constructor** in the same way.
- [ ] **Expand the `Plank` constructor** in the same way.
- [ ] **Extract the hitbox lookup table.** The `Obstacle.hitBox()` method is ~100 lines of repeated `if(this.kind === ...)` blocks. Replace it with a data-driven lookup object defined once at the top of the class (or at the top of the file):

  ```js
  // Hitbox insets per obstacle kind: [leftFrac, topFrac, widthFrac, heightFrac]
  const OBSTACLE_HITBOX = {
    'toy-ball':    [0.15, 0.15, 0.70, 0.70],
    'toy-large':   [0.18, 0.12, 0.64, 0.76],
    'bicycle':     [0.08, 0.20, 0.84, 0.72],
    // ... one entry per kind
  };
  ```

  Then `hitBox()` becomes a short general function that looks up the entry and computes the rectangle — no repeated code.

- [ ] **Add a one-line comment above every function** in the file (`jump`, `boost`, `stopBoost`, `update`, `rect`, `hitBox` — for all three classes, plus the standalone `aabb` function).
- [ ] **Add JSDoc** to `aabb`, and to any class methods used outside `entities.js` (at minimum: `jump`, `update`, `hitBox`, `rect` on `Belly`).

### game.js

- [ ] **Name the IIFE.** Change the opening `(function(){` to `const Game = (function(){` and close with `})();`.
- [ ] **Create a `CONFIG` block.** Gather all bare magic numbers into a clearly-labelled constant object near the top of the file. At minimum this should include:
  - `INITIAL_SPEED: 160` (currently `speed = 160`)
  - `MAX_BOOST_DURATION: 1` (already a named `const` — just move it into `CONFIG`)
  - `OBSTACLE_SPAWN_INITIAL: 200` (currently `nextObstacleScroll = 200`)
  - `COLLECTIBLE_SPAWN_INITIAL: 100`
  - `PLANK_SPAWN_INITIAL_FRACTION: 0.7` (currently `canvas.width * 0.7`)
  - Any score-per-collectible values once scoring logic is extracted
- [ ] **Add a one-line comment above every function** in the file (e.g. `loadRecent`, `saveRecent`, `showRecent`, `isValidBonkersMode`, `setBonkersMode`, `getBonkersConfig`, `initBonkersModePicker`, `startGame`, `setTitleVisible`, `resizeCanvas`, `spawnObstacle`, `spawnCollectible`, `spawnPlank`, and all others).
- [ ] **Add JSDoc** to all functions that take parameters (at minimum `saveRecent`, `setBonkersMode`, `startGame`).
- [ ] **Expand `saveRecent`** — the body is currently a one-liner; expand it to one statement per line.

### renderer.js

- [ ] **Add a one-line comment above every public function** (`clear`, `drawBackground`, `drawBelly`, `drawObstacle`, `drawCollectible`, `drawHUD`, and any others).
- [ ] **Add JSDoc** to all public API functions included in the `return` statement.
- [ ] Move any bare numeric constants that control appearance (ground height offset `80`, parallax multipliers `0.12`, `0.22`, `0.18`, etc.) into a named `CONFIG` block or individually named constants at the top of the file.

### assets.js

- [ ] **Add a one-line comment above every function** (`ensureAudio`, `playTone`, `playJump`, `playCollect`, `playHurt`, `playBonkers`, `playVictory`, and all others).
- [ ] **Add JSDoc** to `playTone` (it has four parameters — each should be documented).

### input.js

- [ ] **Add a one-line comment above every function** in the module.
- [ ] Confirm no magic numbers for key codes or touch thresholds exist without named constants — extract any that do.

---

## Part 3 — Three Learning Paths

These paths are for kids aged 6–11 who want to find out how Belly Go Bonkers is made. You do not need to be an expert — just curious! Each path builds on the one before it.

> A note for parents and teachers: these tasks work best when a grown-up is nearby to help read code and answer "what does this bit do?" questions. The tasks are designed to be short (10–20 minutes each) and to produce a visible, satisfying change in the game every time.

---

### Path 1 — Explorer (Ages 6–7)

**"You found the secret control room!"**

In this path you do not need to write any new code. You just find a number or a word, change it, reload the page, and see what happened. Every task tells you exactly which file to open and which line to look for.

*Concepts you will practise: what a variable is, how numbers control behaviour, how colours are written in code.*

---

**Task 1 — Change Belly's colour**

- Open `js/entities.js`.
- Find this line near the top of the `Belly` class constructor:
  ```
  this.color = '#ff79b4';
  ```
- Change `'#ff79b4'` to any colour you like. Try `'#00ccff'` for sky blue, `'#ffdd00'` for yellow, or `'#ff6600'` for orange.
- Save the file and refresh the game. Belly should be your new colour!

*What you learn: variables store information (like a colour). A string that starts with `#` followed by six letters/numbers is a colour code.*

---

**Task 2 — Change how high Belly jumps**

- Open `js/entities.js`.
- Find this line:
  ```
  static NORMAL_JUMP_IMPULSE = -9;
  ```
- The number `-9` controls how fast Belly shoots upward when you press jump. Make it bigger (more negative) to jump higher — try `-14`. Make it smaller (less negative) like `-5` to jump lower.
- Save and try jumping in the game.

*What you learn: negative numbers make Belly go up (because up is the minus direction on a canvas). Constants are numbers with names so you can find them easily.*

---

**Task 3 — Change how many candy canes trigger Bonkers Mode**

- Open `js/game.js`.
- Find the `BONKERS_CONFIGS` block near the top. Look at the `normal` section:
  ```
  normal: {
    candyCaneRequired: 3,
  ```
- Change `3` to `1` so Bonkers Mode triggers after just one candy cane. Then try `6` to make it much harder to unlock.
- Save and play. How quickly can you go Bonkers now?

*What you learn: objects store groups of settings together. Changing one number can make the game easier or harder.*

---

**Task 4 — Change the starting game speed**

- Open `js/game.js`.
- Find this line near the top of the file (inside `startGame`):
  ```
  speed = 160; // px per second
  ```
- Change `160` to `80` for a slow, relaxed game. Try `300` to make it very fast from the start!

*What you learn: speed is measured in pixels per second — the bigger the number, the faster everything moves across the screen.*

---

**Task 5 — Change the sky colour**

- Open `js/renderer.js`.
- Find the `drawBackgroundLevel1` function. Look for these lines:
  ```
  sky.addColorStop(0,    '#5bc8ff');
  sky.addColorStop(0.65, '#a8e4ff');
  sky.addColorStop(1,    '#d4f0ff');
  ```
- These three colour codes blend together from the top of the sky to the bottom. Try changing `'#5bc8ff'` to `'#ff9933'` for a sunset orange sky, or `'#220066'` for a night sky.

*What you learn: a gradient is a smooth blend between two or more colours. Each `addColorStop` adds one colour at a position between 0 (top) and 1 (bottom).*

---

### Path 2 — Builder (Ages 8–9)

**"You've got your hard hat on — time to build!"**

In this path you read a piece of code, understand the pattern it follows, then copy and adapt it to add something new to the game. You will write new lines, but you always have a clear example to follow right there in the same file.

*Concepts you will practise: arrays and objects, copy-and-modify, how functions are called, testing a change.*

---

**Task 1 — Add a new collectible type**

- Open `js/entities.js`.
- Find the `Collectible` constructor. You will see this line:
  ```
  const radii = {donut:16, pizza:16, icecream:18, lollipop:14, hotdog:18, cupcake:15, candybar:16, milkshake:16, 'candy-cane':30};
  ```
- Add your own collectible to this list. For example, to add a `'taco'` with a radius of `17`, add `, taco:17` inside the object.
- Now open `js/game.js` and find `spawnCollectible`. Look at this line:
  ```
  const kinds = ['donut','pizza','icecream','lollipop','hotdog','cupcake','candybar','milkshake'];
  ```
- Add `'taco'` to this array so it can be randomly spawned.
- The game will now spawn tacos in the level — they will appear as coloured circles until you draw a proper sprite for them.

*What you learn: arrays are lists of items. Objects store named values (like a dictionary). The game picks a random item from an array each time it spawns a collectible.*

---

**Task 2 — Add a new difficulty tier to `BONKERS_CONFIGS`**

- Open `js/game.js`.
- Find the `BONKERS_CONFIGS` block. You can see `easy`, `normal`, `hard`, and `chaos`. Copy the entire `hard` block, paste it just after, and rename it `'mega'`.
- Tweak the values — maybe `candyCaneRequired: 6` and `speedMultiplier: 5.0` for an extra-hard tier.
- Find the `<select>` element in `index.html` (look for `bonkers-mode-select`) and add a new `<option value="mega">Mega</option>` option.
- Now Mega difficulty appears in the difficulty picker on the title screen!

*What you learn: objects can hold other objects as values. Copying and adjusting an existing block is a safe way to add a new option without breaking what already works.*

---

**Task 3 — Change a hitbox inset**

A hitbox is the invisible rectangle the game uses to decide if Belly has hit an obstacle. Making it smaller means the player gets more room for error — useful for making the game kinder.

- Open `js/entities.js`.
- Find the `hitBox` method in the `Obstacle` class. Look for the `'bicycle'` entry:
  ```
  if(this.kind==='bicycle'){
    return {x:this.x+this.w*0.08, y:this.y+this.h*0.20, w:this.w*0.84, h:this.h*0.72};
  }
  ```
- The four fractions (`0.08`, `0.20`, `0.84`, `0.72`) control how far the hitbox is inset from the sprite edges. Larger insets = smaller hitbox = easier to dodge. Try changing `0.08` to `0.20` and `0.84` to `0.60` to shrink the hitbox significantly, then ride near a bicycle and see if it feels different.

*What you learn: hitboxes are rectangles described by position (x, y) and size (width, height). Fractions of the sprite size keep the hitbox proportional no matter how big or small the sprite is.*

---

**Task 4 — Add a new accessory**

- Open `js/game.js`.
- Find the `ACCESSORIES` array. It looks like this:
  ```
  const ACCESSORIES = [
    { id: 'hat',     emoji: '🎩', name: 'Magic Hat',   desc: 'Tips with style!' },
    { id: 'boots',   emoji: '👢', name: 'Power Boots', desc: 'Spring in every step!' },
    ...
  ];
  ```
- Add a new item to the array following the same pattern. Choose an `id`, an emoji, a `name`, and a short `desc`. For example:
  ```js
  { id: 'umbrella', emoji: '☂️', name: 'Lucky Umbrella', desc: 'Stays dry, plays hard!' },
  ```
- Save the file. Your new accessory will appear in the accessory picker on the title screen.

*What you learn: an array of objects is a very common way to store a list of things that each have several properties. Adding a new item only requires following the same shape as the existing items.*

---

**Task 5 — Spawn a new obstacle kind in a level**

- Open `js/game.js` and find `spawnObstacle`.
- Find the `kindsByLevel` object. Look at level 1:
  ```
  1: ['toy-small','toy-large','toy-ball','rattle','bicycle','blocks','toy-car','dinosaur'],
  ```
- Add `'clock'` to the level 1 list (it is normally a level 2 obstacle — `'clock'` is already defined in `entities.js`). Save and play level 1. Clocks should now appear!
- Try moving an item from one level to another, or duplicating a name (e.g. `'dinosaur','dinosaur'`) to make it spawn more often.

*What you learn: the game picks a random item from the list each time it spawns an obstacle. A longer list with more variety makes the game feel richer.*

---

### Path 3 — Creator (Ages 10–11)

**"You're writing the game, not just playing it!"**

In this path you write new logic from scratch, using the patterns in the code as your guide. You will read how something works, understand it, and then build something new that works the same way.

*Concepts you will practise: classes, if/else decisions, collision detection, how the game loop works.*

---

**Task 1 — Trace the game loop**

Before writing code it helps to understand how the game ticks every frame. Follow this chain:

1. Open `js/game.js` and search for `requestAnimationFrame`. This is the call that tells the browser "run this function again on the next screen refresh" — roughly 60 times per second.
2. Find the function it calls (likely called `loop` or `tick` or `frame`). Read through it: it calculates `dt` (the time since the last frame in seconds), calls an update function, then calls a draw function.
3. Find where `Belly.update(dt, gravity, planks)` is called. Look at the `update` method in `js/entities.js` and read how gravity is applied (`this.vy += gravity`) and how position changes (`this.y += this.vy`).
4. Find where `Renderer.drawBelly(...)` is called. Open `js/renderer.js` and read the drawing code for Belly.

Write down (on paper or in a comment) the chain: `requestAnimationFrame` → game loop function → `update` → `draw`. You now know how every frame of the game works.

*What you learn: a game loop is the heartbeat of a game. Every frame: check input, update positions, draw everything. Delta time (`dt`) makes the game run at the same speed even if the frame rate changes.*

---

**Task 2 — Add a new obstacle kind with its own size and hitbox**

- Open `js/entities.js`.
- Find the `Obstacle` constructor. Add a new `else if` block for a new kind — say, `'shopping-trolley'`:
  ```js
  else if (kind === 'shopping-trolley') {
    this.w = 90;
    this.h = 68;
  }
  ```
- Now find the `hitBox` method and add an entry for your new kind:
  ```js
  if (this.kind === 'shopping-trolley') {
    return {
      x: this.x + this.w * 0.06,
      y: this.y + this.h * 0.15,
      w: this.w * 0.88,
      h: this.h * 0.80,
    };
  }
  ```
- Open `js/game.js`, find `kindsByLevel`, and add `'shopping-trolley'` to the level 1 list.
- Open `js/renderer.js` and find the `drawObstacle` function. Add a drawing block for `'shopping-trolley'` following the same `if(kind === ...)` pattern used for other obstacles. Even a simple coloured rectangle is enough to start: `ctx.fillStyle = '#aaa'; ctx.fillRect(x, y, w, h);`

*What you learn: a class groups data (the size) and behaviour (the hitbox calculation) together. Each obstacle kind teaches the computer both what it looks like and how to collide with it.*

---

**Task 3 — Write a new helper function**

The codebase has a useful standalone function called `aabb` in `entities.js`. It takes two rectangles and returns `true` if they overlap. Here is how it works:

```js
function aabb(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
```

Now write a helper function called `rectContainsPoint(rect, px, py)` that returns `true` if the point `(px, py)` is inside the rectangle `rect`. This is useful for checking if the mouse or a tap is inside a button.

Add your function to `entities.js` just above the `aabb` function (so they are together), and add it to the `exported` object. Then test it by opening the browser console and typing:
```
exported.rectContainsPoint({x:10, y:10, w:50, h:50}, 30, 30)  // should be true
exported.rectContainsPoint({x:10, y:10, w:50, h:50}, 5,  5)   // should be false
```

*What you learn: helper functions do one small job and can be reused anywhere. Writing your own version of a function (rather than copying one) teaches you how the logic works from the inside.*

---

**Task 4 — Add a shield power-up that blocks one hit**

This is the biggest challenge in Path 3. Take it one step at a time.

**Step A — Add the shield state to Belly.**
In `js/entities.js`, in the `Belly` constructor, add:
```js
this.hasShield = false;
```

**Step B — Spawn a shield collectible.**
In `js/entities.js`, in the `Collectible` constructor's `radii` object, add `shield: 18`. In `js/game.js`, in `spawnCollectible`, add `'shield'` to the `kinds` array so it can be spawned randomly.

**Step C — Apply the shield when collected.**
In `js/game.js`, find the section that handles collectible collisions (look for `aabb` being called with a collectible). Add an `if (c.kind === 'shield')` branch that sets `belly.hasShield = true` instead of (or in addition to) adding to the score.

**Step D — Block a hit when shielded.**
Find the section that handles obstacle collisions and reduces `belly.lives`. Add a check: if `belly.hasShield` is `true`, set it to `false` instead of removing a life (the shield absorbs the hit).

**Step E — Draw the shield.**
In `js/renderer.js`, find the `drawBelly` function. After drawing Belly, add a check: if `belly.hasShield`, draw a coloured circle around her — something like:
```js
if (belly.hasShield) {
  ctx.save();
  ctx.strokeStyle = '#00eeff';
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(belly.x + belly.width / 2, belly.y + belly.height / 2, belly.width * 0.65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
```

Now test the game. Pick up the shield, then walk into an obstacle — Belly should survive the hit with the shield gone but her lives intact.

*What you learn: game mechanics are built up from small pieces — a state variable (`hasShield`), a check when collecting, a check when colliding, and a visual cue for the player. This is how almost every power-up in any game is made.*

---

*Well done for making it this far! Whether you changed a colour, added a new obstacle, or built a whole shield system — you are a game developer now. Keep experimenting, keep breaking things (you can always undo!), and most of all, keep having fun.*
