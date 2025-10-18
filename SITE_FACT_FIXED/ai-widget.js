// ai-widget.js — Assistant IA 101 CONSEILS
(() => {
  const bubble = document.getElementById('ai-bubble');
  const panel  = document.getElementById('ai-panel');
  const form   = document.getElementById('ai-form');
  const input  = document.getElementById('ai-in');
  const log    = document.getElementById('ai-log');
  const fullBtn= document.getElementById('ai-full');

  if (!bubble || !panel) return;

  // --- OUVRIR / FERMER LE PANNEAU ---
  function isOpen() {
    return window.getComputedStyle(panel).display !== 'none';
  }
  bubble.addEventListener('click', () => {
    panel.style.display = isOpen() ? 'none' : 'flex';
  });

  // --- MODE PLEIN ÉCRAN ---
  if (fullBtn) {
    fullBtn.addEventListener('click', () => {
      panel.classList.toggle('full');
    });
  }

  // --- GESTION DES MESSAGES ---
  function add(role, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'me' : 'bot');
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // --- ENVOI DU MESSAGE ---
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;

      add('user', question);
      input.value = '';

      const thinking = add('bot', '…');

      try {
        const res = await fetch('/.netlify/functions/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        thinking.textContent = data.answer || "Je n'ai pas trouvé la réponse.";
      } catch (err) {
        thinking.textContent = "⚠️ Erreur : impossible d'obtenir une réponse.";
      }
    });
  }

  // --- ENVOI AVEC ENTER ---
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
