// Mobile navigation toggle.
//
// This lives in public/ rather than as a <script> in Base.astro on purpose:
// Astro inlines small scripts into the HTML, and an inline script would need
// either 'unsafe-inline' or a per-build hash in the Content-Security-Policy.
// Serving it as a file keeps script-src at 'self'.
(function () {
  var burger = document.querySelector('.burger');
  var mob = document.getElementById('mobnav');
  if (!burger || !mob) return;

  burger.addEventListener('click', function () {
    var open = mob.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('#mobnav a').forEach(function (a) {
    a.addEventListener('click', function () {
      mob.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();
