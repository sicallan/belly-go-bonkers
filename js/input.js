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

// How long (ms) a synthetic swipe key stays "pressed" after
// a swipe is detected — long enough for game.js to read it.
const SWIPE_KEY_DURATION = 150;

const Input = (function () {

  // Set of currently-held key codes (e.g. 'ArrowUp', 'Space').
  // Touch swipes add synthetic codes like 'SwipeUp' temporarily.
  const keys = new Set();

  // Single registered callback for tap events (used on the
  // title screen to start the game).
  let tapCallback  = null;

  // The starting touch point of the current touch gesture.
  let startTouch   = null;

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
      startTouch = e.touches[0];
    }, { passive: true });

    // On lift: decide if it was a swipe or a tap.
    canvas.addEventListener('touchend', e => {
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
        // Add a synthetic key and remove it after a short delay.
        const code = dy > 0 ? 'SwipeUp' : 'SwipeDown';
        keys.add(code);
        setTimeout(() => { keys.delete(code); }, SWIPE_KEY_DURATION);
      } else {
        // Short or horizontal movement — treat as a tap.
        if (tapCallback) tapCallback();
      }

      startTouch = null;
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
  return { bind, isDown, onTap };

})();
