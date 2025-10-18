// cms-bind.js
(async function () {
  // Liste des zones éditables → id du conteneur dans index.html
  const TARGETS = {
    header:        '#cms-header',
    hero:          '#cms-hero',
    calendrier:    '#cms-calendrier',
    schema:        '#cms-schema',
    role_ec:       '#cms-role-ec',
    diagnostic_intro: '#cms-diagnostic-intro',
    faq:           '#cms-faq',
    glossaire:     '#cms-glossaire',
    contact:       '#cms-contact',
    footer:        '#cms-footer'
  };

  // Charge marked pour convertir le markdown (une seule fois)
  function ensureMarked() {
    return new Promise((resolve) => {
      if (window.marked) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  try {
    await ensureMarked();
    const res = await fetch('/content/home.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('home.json introuvable');
    const data = await res.json();

    Object.entries(TARGETS).forEach(([key, sel]) => {
      const el = document.querySelector(sel);
      if (!el || data[key] == null) return;
      el.innerHTML = window.marked.parse(data[key]);
    });
  } catch (e) {
    console.warn('CMS bind: fallback statique. Détail:', e.message);
  }
})();
