(function(){
  'use strict';

  /* reveal on scroll */
  var rv = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    rv.forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function(e){ io.observe(e); });
  }

  /* 01 · goal selector — one open at a time, answer drops in below the row */
  var goals = [].slice.call(document.querySelectorAll('.goal'));
  var answers = [].slice.call(document.querySelectorAll('.answer'));
  function closeAll(){
    goals.forEach(function(g){ g.setAttribute('aria-expanded','false'); });
    answers.forEach(function(a){ a.classList.remove('on'); a.hidden = true; });
  }
  goals.forEach(function(g){
    g.addEventListener('click', function(){
      var open = g.getAttribute('aria-expanded') === 'true';
      var key = g.getAttribute('data-goal');
      closeAll();
      if (!open){
        g.setAttribute('aria-expanded','true');
        var panel = document.querySelector('.answer[data-answer="' + key + '"]');
        if (panel){ panel.hidden = false; panel.classList.add('on'); }
      }
    });
  });

  /* chapter rail — light the section you are in */
  var railLinks = [].slice.call(document.querySelectorAll('.rail a'));
  var chapters = railLinks.map(function(a){
    return document.getElementById(a.getAttribute('data-rail'));
  }).filter(Boolean);
  if (chapters.length && 'IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var link = document.querySelector('.rail a[data-rail="' + en.target.id + '"]');
        if (link && en.isIntersecting){
          railLinks.forEach(function(l){ l.classList.remove('on'); });
          link.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    chapters.forEach(function(c){ spy.observe(c); });
  }

  /* mobile sheet */
  var sheet = document.getElementById('sheet');
  var openBtn = document.querySelector('[data-sheet-open]');
  function setSheet(on){
    sheet.classList.toggle('on', on);
    openBtn.setAttribute('aria-expanded', String(on));
    document.documentElement.style.overflow = on ? 'hidden' : '';
  }
  if (openBtn && sheet){
    openBtn.addEventListener('click', function(){ setSheet(!sheet.classList.contains('on')); });
    sheet.addEventListener('click', function(e){
      if (e.target.closest('a') || e.target.closest('[data-sheet-close]')) setSheet(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && sheet.classList.contains('on')) setSheet(false);
    });
  }

  /* the form is a static demo until it is wired to a handler */
  var form = document.getElementById('enquiry');
  if (form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Thanks — we’ll be in touch';
  });
})();
