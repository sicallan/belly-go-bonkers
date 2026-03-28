const Input = (function(){
  const keys = new Set();
  let tapCallback = null;
  let startTouch = null;

  function bind() {
    window.addEventListener('keydown', e=>{ keys.add(e.code); });
    window.addEventListener('keyup', e=>{ keys.delete(e.code); });

    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('touchstart', e=>{
      startTouch = e.touches[0];
    },{passive:true});
    canvas.addEventListener('touchend', e=>{
      if(!startTouch){ if(tapCallback) tapCallback(); return; }
      const end = e.changedTouches[0];
      const dy = startTouch.clientY - end.clientY;
      const dx = startTouch.clientX - end.clientX;
      if(Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)){
        if(dy>0) keys.add('SwipeUp'); else keys.add('SwipeDown');
        setTimeout(()=>{ keys.delete('SwipeUp'); keys.delete('SwipeDown'); }, 150);
      } else {
        if(tapCallback) tapCallback();
      }
      startTouch = null;
    });

    canvas.addEventListener('mousedown', ()=>{ if(tapCallback) tapCallback(); });
  }

  function isDown(code){
    return keys.has(code);
  }

  function onTap(cb){ tapCallback = cb; }

  return {bind, isDown, onTap};
})();
