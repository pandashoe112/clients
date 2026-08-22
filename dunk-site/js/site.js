(function(){
  var items = document.querySelectorAll('[data-dropdown]');
  items.forEach(function(item){
    var btn = item.querySelector('.nav__link');
    function open(state){
      item.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', state ? 'true' : 'false');
    }
    item.addEventListener('mouseenter', function(){ open(true); });
    item.addEventListener('mouseleave', function(){ open(false); });
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = item.classList.contains('is-open');
      items.forEach(function(other){
        other.classList.remove('is-open');
        other.querySelector('.nav__link').setAttribute('aria-expanded','false');
      });
      open(!isOpen);
    });
    item.addEventListener('focusout', function(e){
      if(!item.contains(e.relatedTarget)) open(false);
    });
  });

  document.addEventListener('click', function(){
    items.forEach(function(item){
      item.classList.remove('is-open');
      item.querySelector('.nav__link').setAttribute('aria-expanded','false');
    });
  });

  // ---- services rail -------------------------------------------------
  // Two modes. Wide viewports pin the section and let the page scroll drive
  // the rail sideways; narrow ones leave it a plain swipeable rail. The CSS
  // holds the swipeable version as its base state, so if this never runs the
  // section still works.
  var rail = document.getElementById('svc-rail');
  if(rail){
    var svc     = rail.closest('.svc');
    var thumbs  = [].slice.call(document.querySelectorAll('.svc__thumb'));
    var cards   = [].slice.call(rail.querySelectorAll('.scard'));
    var wide    = window.matchMedia('(min-width: 961px)');
    var travel  = 0, pinned = false, tick = 0;

    function mark(i){
      thumbs.forEach(function(t, n){ t.classList.toggle('is-active', n === i); });
      cards.forEach(function(c, n){ c.classList.toggle('is-focus', n === i); });
    }

    // How far the rail has to move, and how much page scroll that is worth.
    // The run is the travel plus a viewport, so the section holds still for a
    // beat at each end rather than snapping straight into and out of the pin.
    function measure(){
      if(!pinned){ travel = 0; svc.style.removeProperty('--svc-run'); return; }
      var last = cards[cards.length - 1];
      travel = Math.max(0, (last.offsetLeft + last.offsetWidth) - rail.clientWidth);
      // a card's width of slack at the end, so the last one clears the edge
      travel = travel ? travel + 24 : 0;
      svc.style.setProperty('--svc-travel', travel + 'px');
      svc.style.setProperty('--svc-run', (window.innerHeight + travel * 1.15) + 'px');
    }

    function frame(){
      var box = svc.getBoundingClientRect();
      var run = svc.offsetHeight - window.innerHeight;
      var p   = run > 0 ? Math.min(1, Math.max(0, -box.top / run)) : 0;
      svc.style.setProperty('--svc-p', p.toFixed(4));
      // straight off progress rather than off position: the rail can only
      // bring the last card to the right edge, never to a focus line, so a
      // positional test would never reach it
      mark(Math.round(p * (cards.length - 1)));
    }

    function onScroll(){
      if(!pinned) return;
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(frame);
    }

    // unpinned, the rail scrolls itself and the thumbs follow it
    function railScroll(){
      if(pinned) return;
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(function(){
        var best = 0, min = Infinity;
        cards.forEach(function(c, n){
          var d = Math.abs(c.offsetLeft - rail.offsetLeft - rail.scrollLeft);
          if(d < min){ min = d; best = n; }
        });
        mark(best);
      });
    }

    function setMode(){
      pinned = wide.matches;
      svc.classList.toggle('is-pinned', pinned);
      if(!pinned){
        svc.style.removeProperty('--svc-p');
        svc.style.removeProperty('--svc-travel');
      }
      measure();
      pinned ? frame() : railScroll();
    }

    thumbs.forEach(function(t){
      t.addEventListener('click', function(){
        var i = +t.dataset.svc, card = cards[i];
        if(!card) return;
        if(!pinned){
          rail.scrollTo({left: card.offsetLeft - rail.offsetLeft, behavior:'smooth'});
          return;
        }
        // scroll the page to the point whose progress brings this card up
        var target = travel ? Math.min(1, card.offsetLeft / travel) : 0;
        var top = svc.offsetTop + target * (svc.offsetHeight - window.innerHeight);
        window.scrollTo({top: top, behavior:'smooth'});
      });
    });

    rail.addEventListener('scroll', railScroll, {passive:true});
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', function(){ setMode(); onScroll(); });
    if(wide.addEventListener) wide.addEventListener('change', setMode);
    setMode();
  }

  var burger = document.querySelector('.burger');
  var panel  = document.getElementById('mobile-nav');
  var close  = document.querySelector('.mobile__close');
  function setMenu(state){
    panel.classList.toggle('is-open', state);
    burger.setAttribute('aria-expanded', state ? 'true' : 'false');
    document.body.style.overflow = state ? 'hidden' : '';
  }
  burger.addEventListener('click', function(){ setMenu(!panel.classList.contains('is-open')); });
  close.addEventListener('click', function(){ setMenu(false); });
  panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      setMenu(false);
      items.forEach(function(item){ item.classList.remove('is-open'); });
    }
  });
})();
