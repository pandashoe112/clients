(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* reveal */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (!('IntersectionObserver' in window) || reduce){
    rv.forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){ if (x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin:'0px 0px -6% 0px', threshold:.06 });
    rv.forEach(function(e){ io.observe(e); });
  }

  /* hero starfield */
  var cv = document.querySelector('.hero__stars');
  if (cv){
    var ctx = cv.getContext('2d'), stars = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    function seed(){
      var w = cv.clientWidth, h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      var n = Math.round(w * h / 5200);
      for (var i = 0; i < n; i++){
        stars.push({ x: Math.random() * w, y: Math.random() * h,
                     r: Math.random() * 1.15 + .25,
                     a: Math.random() * .6 + .18,
                     s: Math.random() * .012 + .004,
                     p: Math.random() * Math.PI * 2 });
      }
    }
    function draw(t){
      var w = cv.clientWidth, h = cv.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++){
        var s = stars[i];
        var a = reduce ? s.a : s.a * (0.62 + 0.38 * Math.sin(t * s.s + s.p));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    var raf;
    seed(); draw(0);
    var rt;
    addEventListener('resize', function(){
      clearTimeout(rt);
      rt = setTimeout(function(){ cancelAnimationFrame(raf); seed(); draw(0); }, 180);
    });
  }

  /* faq accordion — one open at a time */
  var qs = [].slice.call(document.querySelectorAll('.faq__q'));
  qs.forEach(function(q){
    q.addEventListener('click', function(){
      var open = q.getAttribute('aria-expanded') === 'true';
      qs.forEach(function(o){
        o.setAttribute('aria-expanded','false');
        document.getElementById(o.getAttribute('aria-controls')).hidden = true;
      });
      if (!open){
        q.setAttribute('aria-expanded','true');
        document.getElementById(q.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  /* pricing period toggle — quarterly takes 8% off */
  var tg = document.querySelector('[data-toggle]');
  if (tg) tg.addEventListener('click', function(){
    var on = tg.getAttribute('aria-pressed') !== 'true';
    tg.setAttribute('aria-pressed', String(on));
    document.querySelectorAll('.plan__price b').forEach(function(b){
      var base = b.getAttribute('data-price');
      if (!on){ b.textContent = base; return; }
      var n = parseInt(base.replace(/[^0-9]/g, ''), 10);
      b.textContent = 'from $' + (Math.round(n * 0.92 / 50) * 50).toLocaleString('en-AU');
    });
    document.querySelectorAll('.plan__price span').forEach(function(s){
      s.textContent = on ? '/ month, billed quarterly' : '/ month';
    });
  });

  /* mobile sheet */
  var sheet = document.getElementById('sheet'), open = document.querySelector('[data-sheet]');
  function set(on){
    sheet.classList.toggle('on', on);
    open.setAttribute('aria-expanded', String(on));
    document.documentElement.style.overflow = on ? 'hidden' : '';
  }
  if (open && sheet){
    open.addEventListener('click', function(){ set(!sheet.classList.contains('on')); });
    sheet.addEventListener('click', function(e){
      if (e.target.closest('a') || e.target.closest('[data-sheet-close]')) set(false);
    });
    addEventListener('keydown', function(e){ if (e.key === 'Escape') set(false); });
  }
})();
