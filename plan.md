# Belly Go Bonkers — Game Plan

A bright, goofy, kid-friendly 2D side-scrolling game where a round, happy character (the "Belly") runs from left to right while the background scrolls. Simple controls (keyboard + touch/swipe) and short, replayable runs with collectible items and funny obstacles.

## Hook / Title Screen
- Big, playful title: Belly Go Bonkers!
- Quirky animation: the Belly bounces in place, eyes wobble, stars pop around the letters.
- Recent scores panel under the title showing recent player name + score (persisted in `localStorage`).
- Clear prompt: "Press Space to Start" (desktop) and a touch-friendly "Tap to Start" on tablets.
- Small buttons: sound on/off, help, and view high scores.

## Primary Goal
- Travel as far as possible while collecting treats and avoiding obstacles.
- Score is a combination of distance traveled + collectibles gathered + small bonuses for combos.

## Controls
- Desktop / Keyboard:
  - Left / Right arrows: move left / right (small control to dodge, but auto-run keeps forward momentum)
  - Up arrow or Space: jump
  - Down arrow: duck/slide (short-duration)
  - Space (on title screen): start game
- Touch / Tablet:
  - Swipe up: jump
  - Swipe down: duck/slide
  - Tap left side of screen: move/slow left
  - Tap right side of screen: move right / dash
  - On title screen: tap to start

Notes: Aim for forgiving input for kids: larger hitboxes for touch areas and forgiving jump timings.

## Core Gameplay Mechanics
- The Belly automatically moves forward; player mainly times jumps and slides and occasional left/right nudges.
- Parallax scrolling background with multiple layers to imply depth.
- Simple physics for jump: velocity + gravity, short/long jump based on press duration (optional; may keep fixed height for simplicity).
- Collectibles (e.g., candies, stars) placed in the level that add to score.
- Combo mechanic: collecting several items without hitting obstacles gives a temporary multiplier.
- Progressive difficulty: as distance increases, game speed slowly ramps up and obstacle density increases.

## Scoring
- Distance: continuous +1 point per X pixels (or per second, scaled).
- Collectibles: +10 for candy, +25 for star (example values).
- Combo multiplier: increases with consecutive collectible pickups.
- Bonus for near-miss: narrowly avoiding obstacles grants small bonus points.

## Obstacles & Hazards
- Stationary obstacles: rocks, crates, spikes.
- Moving obstacles: bouncing enemies, rolling barrels.
- Gaps/holes: must jump over.
- Overhead obstacles: low-hanging branches / signs (duck to avoid).
- Surprise hazards: falling objects from above (telegraphed briefly).

## Death / Game Over / Run Completion
- The Belly has 3 lives by default (adjustable for difficulty). Each collision with a damaging obstacle removes a life.
- After a hit: brief invincibility flash and small knockback.
- Game over when lives reach 0. Show a joyful "Game Over" screen with final score and options: retry, share score, return to title.
- On Game Over: record name+score into the recent scores list (keeps last N entries in `localStorage`).

## Character Design (The Belly)
- Pink blobby character named the Belly with a cheeky face where a belly button would normally be.
- Simple, round, friendly silhouette with big googly eyes and a mischievous grin centered on the belly-button-face.
- Distinctive features: little stubby arms, tiny legs, a colorful belly patch or bow, and a visible belly-button-face that expresses emotion.
- Animations: idle bounce (playful wobble), running cycle, jump, slide/duck, hurt/flinch, and victory/cheer (the belly-button-face can wink or stick out its tongue).
- Multiple skins (unlockable color variants and accessories) for replayability.

## World / Theme
- Bright cartoon palette; rounded shapes; soft shadows.
- Biomes (switch every X distance or via levels): Playground, Candy Land, Park, Cloudscape.
- Each biome brings unique obstacles and matching background props.
- Daytime and night variants for visual variety.

## Audio / FX
- Bouncy, cheerful music loop that speeds up slightly with game speed.
- Fun SFX: jump, land, collect, hurt, game over.
- Optional voice lines / small exclamations (kid-friendly, short).

## UX / HUD
- Top-left: current score (distance + collectibles)
- Top-right: lives and sound toggle
- Middle (during title): recent scores and start prompt
- Pause overlay when the user taps a pause button or presses Esc

## Accessibility / Kid-Friendly Considerations
- Big, clear UI elements and buttons
- High-contrast mode toggle
- Simple and forgiving collision detection
- Adjustable difficulty (Easy / Normal / Hard) — Easy gives more lives and slower speed
- No ads; do not include unexpected popups during play

## Assets Needed
- Sprite(s) for Belly (running frames, jump frame, slide/hurt)
- Background layers for parallax (3 layers: far, mid, near)
- Tiles / obstacle sprites: rocks, spikes, crates, enemies
- Collectible icons: candy, star
- UI art: buttons, panels, title art
- SFX and background music loop (short, kid-friendly)

## Technical Implementation Notes
- Stack: plain HTML, CSS, JavaScript (no build step required).
- Rendering: HTML5 Canvas (2D) for main game view for smooth animations and parallax.
- Structure:
  - `index.html` — root page and title screen
  - `css/styles.css` — layout + title animations + responsive UI
  - `js/game.js` — main game loop, state management (title, playing, paused, gameover)
  - `js/renderer.js` — drawing code and parallax background
  - `js/input.js` — keyboard and touch/swipe handling
  - `js/entities.js` — Belly, obstacles, collectibles logic
  - `js/assets.js` — asset preloader (images + audio)
  - `assets/` — images, sprite-sheets, audio
- Game loop: use `requestAnimationFrame`; delta-time based movement for consistent speed.
- Collision detection: simple AABB box checks; tune for forgiving feel.
- Persistence: `localStorage` for recent scores and settings (sound on/off, last skin).
- Touch input: implement swipe detection and large touch zones (left/right halves).
- Responsive: scale canvas to fit available width while preserving aspect ratio; use CSS for UI layout above/below canvas.

## Development & Testing
- Start with a minimal playable prototype:
  1. Title screen + press space/tap to start
  2. Auto-forward Belly with basic run animation
  3. Jump and 1 obstacle type + collectible
  4. Scoring and Game Over
- Test on desktop and mobile browsers (Chrome, Firefox, Safari on iOS if possible).
- Performance goals: 60fps on mid-range devices; fall back gracefully to 30fps.

## Nice-to-Have / Future Features
- Daily challenges or short missions (collect X candies)
- Unlockable skins and small cosmetic rewards
- Simple achievements and sharing (optional)
- Level editor or sequence designer for hand-placing obstacles

## Checklist Before First Release
- [ ] Playable core loop implemented
- [ ] Title screen with recent scores
- [ ] Touch and keyboard input working
- [ ] Asset placeholders replaced with polished art
- [ ] Sound and mute toggle
- [ ] Local high-score/recent scores persistence
- [ ] Basic accessibility checks

---

If you'd like, I can now scaffold the project files (`index.html`, `css/styles.css`, `js/` files) with a minimal working prototype to get started. What should I create next?