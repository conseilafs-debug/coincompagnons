// Script commun (léger) : menu mobile et filtres de listes.
(function () {
  document.documentElement.classList.add('js');
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('menu');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  // Filtre de liste : <input data-filter="#id"> filtre les enfants [data-search]
  document.querySelectorAll('input[data-filter]').forEach(function (inp) {
    var target = document.querySelector(inp.getAttribute('data-filter'));
    if (!target) return;
    var items = target.querySelectorAll('[data-search]');
    var empty = document.querySelector(inp.getAttribute('data-empty'));
    inp.addEventListener('input', function () {
      var q = norm(inp.value).trim(), shown = 0;
      items.forEach(function (it) {
        var hit = !q || norm(it.getAttribute('data-search')).indexOf(q) !== -1;
        it.classList.toggle('hidden', !hit);
        if (hit) shown++;
      });
      if (empty) empty.classList.toggle('hidden', shown > 0);
    });
  });
  // Filtre par verdict (tableaux « peut-on donner »)
  document.querySelectorAll('select[data-filter-verdict]').forEach(function (sel) {
    var rows = document.querySelectorAll(sel.getAttribute('data-filter-verdict') + ' tbody tr');
    sel.addEventListener('change', function () {
      rows.forEach(function (r) { r.classList.toggle('hidden', sel.value && r.getAttribute('data-verdict') !== sel.value); });
    });
  });
})();
