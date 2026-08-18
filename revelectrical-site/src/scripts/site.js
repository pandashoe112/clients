import { attribution, leadType, fillAttribution } from './attribution.js';

(function(){
  "use strict";

  // Stamp the campaign fields into every form on the page as soon as the page
  // loads, rather than at submit time - a lead that never submits is not worth
  // the work, but a value sitting in the DOM can be checked in devtools when
  // someone disputes which ad a job came from.
  fillAttribution();
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

  // Every form carries an upload row now, so the count is bound per input
  // rather than to one id that only existed on the homepage.
  document.querySelectorAll('[data-filehint]').forEach(function(files){
    var hint = files.parentElement.querySelector('.filehint');
    if (!hint) return;
    var idle = hint.textContent;
    files.addEventListener('change', function(){
      var n = files.files.length;
      hint.textContent = n ? (n === 1 ? '1 photo added' : n + ' photos added') : idle;
      hint.classList.toggle('is-on', n > 0);
    });
  });

  var trackEvent = function(name, extra){
    if (typeof window.gtag === 'function') window.gtag('event', name, extra || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({event:name}, extra||{}));
  };
  document.querySelectorAll('.js-call').forEach(function(a){
    a.addEventListener('click', function(){ trackEvent('click_to_call', {phone:'0432555826'}); });
  });

  // Every enquiry form on the site is validated by the same code, keyed off the
  // field's name rather than its id: the four forms use different id prefixes,
  // and not all of them carry every field.
  var CHECKS = {
    name:    function(v){ return v.trim().length >= 2 ? '' : 'Enter your name so we know who to call.'; },
    email:   function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
    phone:   function(v){ return v.replace(/[^0-9]/g,'').length >= 8 ? '' : 'Enter a phone number we can reach you on.'; },
    // A street number and name is what makes the address usable for sizing a
    // job from the map, so a bare suburb is not enough to pass.
    address: function(v){
      var s = v.trim();
      if (s.length < 8 || !/\d/.test(s)) return 'Enter your full street address so we can size the job.';
      return '';
    },
    services_selected: function(v){ return v ? '' : 'Pick at least one job type so we can send the right person.'; }
  };

  // The error line is created when a form doesn't already carry one, so the
  // forms that were written without them still report properly.
  // A field that already points at an error line gets that one. This has to be
  // checked before falling through to creating one: the created element is
  // inserted directly after the field, and on a tile that puts a <p> between
  // the input and its label, which silently kills `input:checked + label` and
  // leaves a ticked tile looking untouched.
  var errorFor = function(field){
    var described = field.getAttribute('aria-describedby');
    if (described){
      var existing = document.getElementById(described);
      if (existing) return existing;
    }
    var id = (field.id || field.name) + '__err';
    var el = document.getElementById(id);
    if (!el){
      el = document.createElement('p');
      el.className = 'err'; el.id = id; el.setAttribute('role','alert');
      field.insertAdjacentElement('afterend', el);
    }
    if (!described) field.setAttribute('aria-describedby', id);
    return el;
  };

  // A checkbox or radio group has one answer spread across many elements, and
  // every one of them reports its own .value whether or not it is ticked.
  // Reading the whole group is what stops "EV charging" being submitted by
  // someone who never picked anything.
  var groupOf = function(field){
    return [].slice.call((field.form || document).querySelectorAll(
      '[name="' + field.name + '"]'));
  };
  var valueOf = function(field){
    if (field.type !== 'radio' && field.type !== 'checkbox') return field.value;
    return groupOf(field)
      .filter(function(el){ return el.checked; })
      .map(function(el){ return el.value; })
      .join(', ');
  };

  var validate = function(field){
    var check = CHECKS[field.name];
    if (!check || field.disabled) return '';
    var msg = check(valueOf(field));
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errorFor(field).textContent = msg;
    return msg;
  };

  // Tile-driven extras: the running count in the legend, and the follow-up
  // panel that only applies to one job type. Both are derived from the same
  // tick, so they are updated together rather than by two listeners racing.
  var syncTiles = function(set){
    var boxes = [].slice.call(set.querySelectorAll('input[name="services_selected"]'));
    var picked = boxes.filter(function(b){ return b.checked; });

    var count = set.querySelector('[data-tilecount]');
    if (count){
      count.textContent = picked.length ? picked.length + ' selected' : '';
      count.hidden = picked.length === 0;
    }

    // The panel is the fieldset's next sibling. Clearing the input when the
    // panel closes stops a car model being submitted by someone who ticked EV
    // charging, typed it in, then changed their mind.
    var panel = set.nextElementSibling;
    if (panel && panel.getAttribute('data-cond') === 'ev'){
      // Solar and battery owners get the same panel: the car question is still
      // relevant, and the solar question is the whole point of it.
      var wanted = picked.some(function(b){
        return b.value === 'EV charging' || b.value === 'Solar & battery';
      });
      if (!wanted && !panel.hidden){
        panel.querySelectorAll('input').forEach(function(input){
          if (input.type === 'radio') input.checked = false;
          else input.value = '';
        });
      }
      panel.hidden = !wanted;
    }
  };

  document.querySelectorAll('.tileset').forEach(function(set){
    syncTiles(set);
    set.addEventListener('change', function(){ syncTiles(set); });
  });

  document.querySelectorAll('form[data-netlify]').forEach(function(form){
    // A checkbox cannot carry `required` - on a checkbox that attribute means
    // "this exact box must be ticked", not "tick one of these". The tile group
    // is marked with data-required-group instead, and only the first box of a
    // group is validated, since they all read the same group value.
    var seenGroup = {};
    var fields = [].slice.call(form.querySelectorAll('[name]')).filter(function(f){
      if (!CHECKS[f.name]) return false;
      if (f.hasAttribute('data-required-group')){
        if (seenGroup[f.name]) return false;
        seenGroup[f.name] = true;
        return true;
      }
      return f.hasAttribute('required');
    });
    var btn = form.querySelector('button[type="submit"]');

    fields.forEach(function(f){
      // Only the first tile of a group is in `fields`, but any of its siblings
      // can be the one clicked. Listening on the whole group is what clears the
      // error when a tile is chosen.
      var group = (f.type === 'radio' || f.type === 'checkbox') ? groupOf(f) : [f];
      group.forEach(function(el){
        el.addEventListener('blur', function(){ validate(f); });
        el.addEventListener('change', function(){ validate(f); });
        el.addEventListener('input', function(){
          if (f.getAttribute('aria-invalid') === 'true') validate(f);
        });
      });
    });

    form.addEventListener('submit', function(ev){
      var firstBad = null;
      fields.forEach(function(f){ if (validate(f) && !firstBad) firstBad = f; });
      if (firstBad){
        ev.preventDefault();
        firstBad.focus();
        firstBad.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
        return;
      }
      // Which page the enquiry came from, for whoever reads the submission.
      var src = form.querySelector('input[name="page_url"]');
      if (src) src.value = window.location.href;

      // Netlify titles both the submission row and the notification email from
      // a field called "subject". Without it both fall back to the message,
      // so a list of leads reads as a column of half-sentences.
      //
      // The markup already carries a complete subject - "New Lead on
      // Revelectrical" - so a submission that arrives with the script broken
      // is still titled properly. All this does is name the lead type, which
      // is the one thing only the browser knows.
      var subject = form.querySelector('input[name="subject"]');
      if (subject && leadType && leadType !== 'Direct'){
        subject.value = subject.value.replace('New Lead', 'New ' + leadType + ' Lead');
      }

      // Anything left empty is disabled rather than sent. A disabled input is
      // not serialised, so the notification lists the questions that got an
      // answer instead of padding the email with blank lines - which is what
      // ten tracking fields and four optional ones would otherwise do.
      //
      // form-name and bot-field are how Netlify routes and filters the
      // submission, and subject titles it, so those three always go.
      var KEEP = { 'form-name': 1, 'bot-field': 1, subject: 1 };
      form.querySelectorAll('input, textarea, select').forEach(function(el){
        if (KEEP[el.name] || el.type === 'radio' || el.type === 'checkbox') return;
        if (el.type === 'file' ? el.files.length === 0 : !el.value) el.disabled = true;
      });
      trackEvent('generate_lead', {form: form.getAttribute('name') || 'enquiry'});
      if (btn){ btn.textContent = 'Sending...'; btn.disabled = true; }
    });
  });

})();
