// Chargement des annonces AdSense — inclus dans les pages UNIQUEMENT si ADSENSE_PUBLISHER_ID est défini au build.
// Aucune annonce n'est chargée sans consentement : ce fichier attend un signal d'une plateforme de gestion du consentement (CMP).
// Contrat attendu de la future CMP (certifiée Google / IAB TCF) :
//   window.PortailConsent = { ads: () => boolean }  et  document.dispatchEvent(new Event('portail:consent')) à chaque changement.
// Tant que ce contrat n'est pas fourni, rien n'est chargé.
(function () {
  var cfg = window.__ADS__;
  if (!cfg || !cfg.client) return;
  var started = false;
  function allowed() { return !!(window.PortailConsent && typeof window.PortailConsent.ads === 'function' && window.PortailConsent.ads()); }
  function start() {
    if (started || !allowed()) return;
    started = true;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cfg.client);
    document.head.appendChild(s);
    document.querySelectorAll('.ad-slot[data-slot]').forEach(function (slot) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.setAttribute('data-ad-client', cfg.client);
      var id = cfg.slots && cfg.slots[slot.getAttribute('data-slot')];
      if (id) ins.setAttribute('data-ad-slot', id);
      ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'true');
      slot.appendChild(ins); slot.hidden = false;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }
  document.addEventListener('portail:consent', start);
  start();
})();
