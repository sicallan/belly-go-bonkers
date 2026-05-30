// ============================================================
// input.js — keyboard and touch/swipe input handling
// ============================================================
// Listens for keyboard and touch events and exposes a simple
// API so game.js can ask "is this key currently held down?"
// without caring about how the browser delivers the events.
//
// Touch swipes are translated into virtual key codes
// ('SwipeUp', 'SwipeDown') so the game loop can treat them
// exactly like arrow keys.
// ============================================================

// Minimum swipe distance in pixels before a touch is treated
// as a directional swipe rather than a tap.
const SWIPE_THRESHOLD = 40;

// A swipe this many pixels *beyond* the threshold counts as a
// full-power jump. Shorter swipes give a proportionally lower jump.
const SWIPE_FULL_RANGE = 130;

// How long (ms) the synthetic 'SwipeUp' key stays "pressed".
// The game treats this key like holding the jump button, so the
// longer it is held the higher Belly jumps. A tiny flick holds it
// for SWIPE_MIN_HOLD; a big swipe holds it for SWIPE_MAX_HOLD.
// This is what "multiplies" the strength of the swipe.
const SWIPE_MIN_HOLD = 320;
const SWIPE_MAX_HOLD = 1150;

// How long (ms) a downward swipe key stays pressed (fixed — duck/down
// is not boosted like the jump).
const SWIPE_DOWN_HOLD = 150;

const Input = (function () {

  // Set of currently-held key codes (e.g. 'ArrowUp', 'Space').
  // Touch swipes add synthetic codes like 'SwipeUp' temporarily.
  const keys = new Set();

  // Single registered callback for tap events (used on the
  // title screen to start the game).
  let tapCallback  = null;

  // The starting touch point of the current touch gesture.
  let startTouch   = null;

  // True while at least one finger is touching the screen. Used by
  // game.js for "hold to thrust" controls (e.g. the Level 4 jetpack).
  let pointerDown  = false;

  /**
   * Registers all keyboard and touch event listeners.
   * Must be called once before the game loop starts.
   * @returns {void}
   */
  function bind() {
    // Keyboard — add the code when pressed, remove when released.
    window.addEventListener('keydown', e => { keys.add(e.code); });
    window.addEventListener('keyup',   e => { keys.delete(e.code); });

    const canvas = document.getElementById('game-canvas');

    // Record where the finger first touched the screen.
    canvas.addEventListener('touchstart', e => {
      startTouch  = e.touches[0];
      pointerDown = true;
    }, { passive: true });

    // On lift: decide if it was a swipe or a tap.
    canvas.addEventListener('touchend', e => {
      pointerDown = false;

      if (!startTouch) {
        // No start recorded — treat as a simple tap.
        if (tapCallback) tapCallback();
        return;
      }

      const end = e.changedTouches[0];
      const dy  = startTouch.clientY - end.clientY; // positive = swipe up
      const dx  = startTouch.clientX - end.clientX;

      const isVerticalSwipe =
        Math.abs(dy) > SWIPE_THRESHOLD &&
        Math.abs(dy) > Math.abs(dx);     // more vertical than horizontal

      if (isVerticalSwipe) {
        if (dy > 0) {
          // Swipe UP → jump. The further the swipe, the longer we hold
          // the synthetic key, so a bigger swipe boosts a higher jump.
          const extra    = Math.abs(dy) - SWIPE_THRESHOLD;       // px past the threshold
          const strength = Math.min(1, extra / SWIPE_FULL_RANGE); // 0 (flick) .. 1 (big swipe)
          const holdMs   = SWIPE_MIN_HOLD + strength * (SWIPE_MAX_HOLD - SWIPE_MIN_HOLD);
          keys.add('SwipeUp');
          setTimeout(() => { keys.delete('SwipeUp'); }, holdMs);
        } else {
          // Swipe DOWN → duck/dive (fixed short press).
          keys.add('SwipeDown');
          setTimeout(() => { keys.delete('SwipeDown'); }, SWIPE_DOWN_HOLD);
        }
      } else {
        // Short or horizontal movement — treat as a tap.
        if (tapCallback) tapCallback();
      }

      startTouch = null;
    });

    // If the browser cancels the touch (e.g. a system gesture), clear state.
    canvas.addEventListener('touchcancel', () => {
      pointerDown = false;
      startTouch  = null;
    });

    // Mouse click also counts as a tap (for desktop testing).
    canvas.addEventListener('mousedown', () => {
      if (tapCallback) tapCallback();
    });
  }

  /**
   * Returns true if the given key or virtual code is currently active.
   * @param {string} code - A KeyboardEvent.code string or 'SwipeUp'/'SwipeDown'.
   * @returns {boolean}
   */
  function isDown(code) {
    return keys.has(code);
  }

  /**
   * Returns true while a finger is currently touching the screen.
   * Used for "hold to thrust" controls such as the Level 4 jetpack.
   * @returns {boolean}
   */
  function isPointerDown() {
    return pointerDown;
  }

  /**
   * Registers a callback to run whenever the player taps or clicks.
   * Only one callback can be registered at a time; calling this again
   * replaces the previous one.
   * @param {Function} cb - Function to call on tap/click.
   * @returns {void}
   */
  function onTap(cb) {
    tapCallback = cb;
  }

  // Public API
  return { bind, isDown, isPointerDown, onTap };

})();
