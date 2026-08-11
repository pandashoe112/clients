(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var announce = document.getElementById('announce');
  var announceClose = document.getElementById('announceClose');
  if (announceClose) announceClose.addEventListener('click', function(){ announce.classList.add('is-hidden'); });

  // The thank-you page has no header, so everything that touches it is guarded.
  var header = document.getElementById('siteheader');
  if (header){
    var onScroll = function(){ header.classList.toggle('is-stuck', window.scrollY > 12); };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // Mobile menu. The panel lives inside the header, so it closes on its own
  // once the viewport is wide enough for the real nav to come back.
  var burger = document.getElementById('burger');
  var mobilenav = document.getElementById('mobilenav');
  if (burger && mobilenav && header){
    // How far down the panel starts depends on whether the utility bar above
    // the header has scrolled away, so the height it can take is measured
    // rather than assumed. offsetTop is used because the open transition
    // animates a transform.
    // The panel fills the rest of the screen so no page content shows beneath
    // it — the hero's own call button used to sit directly under the panel's.
    // How far down it starts depends on whether the utility bar above the
    // header has scrolled away, so it is measured. offsetTop is used because
    // the open transition animates a transform.
    var fitNav = function(){
      var top = header.getBoundingClientRect().top + mobilenav.offsetTop;
      mobilenav.style.height = Math.max(200, window.innerHeight - top) + 'px';
    };
    var setNav = function(open){
      if (open) fitNav();
      header.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-locked', open);
    };
    window.addEventListener('resize', function(){
      if (header.classList.contains('nav-open')) fitNav();
    });
    burger.addEventListener('click', function(){
      setNav(!header.classList.contains('nav-open'));
    });
    mobilenav.addEventListener('click', function(ev){
      if (ev.target.closest('a')) setNav(false);
    });
    var scrim = document.getElementById('navscrim');
    if (scrim) scrim.addEventListener('click', function(){ setNav(false); });
    document.addEventListener('keydown', function(ev){
      if (ev.key === 'Escape' && header.classList.contains('nav-open')){ setNav(false); burger.focus(); }
    });
    var wide = window.matchMedia('(min-width:1081px)');
    var onWide = function(e){ if (e.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else wide.addListener(onWide);
  }

  var items = document.querySelectorAll('[data-dropdown]');
  var closeAll = function(except){
    items.forEach(function(it){
      if (it === except) return;
      it.classList.remove('is-open');
      var b = it.querySelector('.navlink');
      if (b && b.tagName === 'BUTTON') b.setAttribute('aria-expanded','false');
    });
  };
  // On a pointer device the menu opens on hover, so a click on an already open
  // menu used to close it again. Hover and click are bound separately now.
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  items.forEach(function(it){
    var btn = it.querySelector('.navlink');
    btn.addEventListener('click', function(){
      var open = canHover ? true : !it.classList.contains('is-open');
      closeAll(it); it.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    if (canHover) {
      it.addEventListener('mouseenter', function(){ closeAll(it); it.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); });
      it.addEventListener('mouseleave', function(){ it.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); });
    }
    it.addEventListener('focusout', function(ev){ if (!it.contains(ev.relatedTarget)) { it.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); } });
  });
  document.addEventListener('click', function(ev){ if (!ev.target.closest('[data-dropdown]')) closeAll(null); });
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') closeAll(null); });

  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function(el){ el.classList.add('is-in'); });
  else {
    var ro = new IntersectionObserver(function(en){
      en.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('is-in'); ro.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.1});
    reveals.forEach(function(el){ ro.observe(el); });
  }

  var track = document.getElementById('revTrack');
  var prev = document.getElementById('revPrev');
  var next = document.getElementById('revNext');
  if (track && prev && next){
    var step = function(){
      var c = track.querySelector('.revcard');
      return c ? c.getBoundingClientRect().width + 20 : 340;
    };
    var sync = function(){
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
    };
    prev.addEventListener('click', function(){ track.scrollBy({left:-step(), behavior: reduce ? 'auto' : 'smooth'}); });
    next.addEventListener('click', function(){ track.scrollBy({left:step(), behavior: reduce ? 'auto' : 'smooth'}); });
    track.addEventListener('scroll', sync, {passive:true});
    window.addEventListener('resize', sync);
    sync();
    track.querySelectorAll('.revcard__text').forEach(function(p){
      p.classList.add('is-clamped');
      if (p.scrollHeight - p.clientHeight > 4){
        var b = document.createElement('button');
        b.type='button'; b.className='revcard__more'; b.textContent='Read more';
        b.addEventListener('click', function(){
          var open = p.classList.toggle('is-clamped');
          b.textContent = open ? 'Read more' : 'Show less';
        });
        p.insertAdjacentElement('afterend', b);
      }
    });
  }

  var files = document.getElementById('f_files');
  var fileHint = document.getElementById('fileHint');
  if (files && fileHint){
    files.addEventListener('change', function(){
      var n = files.files.length;
      fileHint.textContent = n ? (n === 1 ? '1 file selected' : n + ' files selected') : 'Max file size 10MB';
    });
  }

  var trackEvent = function(name, extra){
    if (typeof window.gtag === 'function') window.gtag('event', name, extra || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({event:name}, extra||{}));
  };
  document.querySelectorAll('.js-call').forEach(function(a){
    a.addEventListener('click', function(){ trackEvent('click_to_call', {phone:'0432555826'}); });
  });

  var pageUrl = document.getElementById('f_page_url');
  if (pageUrl) pageUrl.value = window.location.href;

  var form = document.getElementById('quoteForm');
  var btn = document.getElementById('submitBtn');
  var showErr = function(id, errId, msg){
    var i = document.getElementById(id), e = document.getElementById(errId);
    if (i) i.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (e) e.textContent = msg || '';
  };
  var checks = {
    f_name: function(v){ return v.trim().length >= 2 ? '' : 'Enter your name so we know who to call.'; },
    f_email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
    f_phone: function(v){ return v.replace(/[^0-9]/g,'').length >= 8 ? '' : 'Enter a phone number we can reach you on.'; },
    f_suburb: function(v){ return v.trim().length >= 3 ? '' : 'Enter your suburb or postcode.'; },
    f_service: function(v){ return v ? '' : 'Choose the service you need.'; }
  };
  var errIds = {f_name:'err_name', f_email:'err_email', f_phone:'err_phone', f_suburb:'err_suburb', f_service:'err_service'};
  if (!form) return;
  Object.keys(checks).forEach(function(id){
    var i = document.getElementById(id);
    if (!i) return;
    i.addEventListener('blur', function(){ showErr(id, errIds[id], checks[id](i.value)); });
    i.addEventListener('input', function(){ if (i.getAttribute('aria-invalid') === 'true') showErr(id, errIds[id], checks[id](i.value)); });
    i.addEventListener('change', function(){ showErr(id, errIds[id], checks[id](i.value)); });
  });
  form.addEventListener('submit', function(ev){
    var firstBad = null;
    Object.keys(checks).forEach(function(id){
      var i = document.getElementById(id);
      var msg = checks[id](i.value);
      showErr(id, errIds[id], msg);
      if (msg && !firstBad) firstBad = i;
    });
    if (firstBad){
      ev.preventDefault(); firstBad.focus();
      firstBad.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
      return;
    }
    trackEvent('generate_lead', {form:'home-enquiry'});
    btn.textContent = 'Sending...';
    btn.disabled = true;
  });
})();
