// netlify/functions/ai-chat.js — version éco (réponses courtes)
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Méthode non autorisée' };
    }

    const { question } = JSON.parse(event.body || '{}');
    if (!question) {
      return { statusCode: 400, body: 'Erreur : question manquante' };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: 'Erreur serveur : clé API manquante' };
    }

    const system = `
Tu es ROBOT 101. Réponds en français, clair et concis (3 à 6 phrases max).
Sujet : La réforme de la facturation électronique en France.
Utilise des puces si utile et des sauts à la ligne. Si la question est trop spécifique à un cas, propose le contact 101 CONSEILS, rappelle le numéro de téléphone 0756911011 et le mail : contact@101conseils.com.
Dates sûres : réception 01/09/2026 ; émission généralisée 01/09/2027.
`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question }
        ]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      let msg = "Je ne peux pas répondre pour le moment.";
      if (errText.includes("insufficient_quota")) {
        msg += " (Crédit API côté serveur épuisé.)";
      } else if (errText.includes("invalid_api_key")) {
        msg += " (Clé API serveur invalide.)";
      } else {
        msg += " (Incident technique.)";
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: msg + " Contactez 101 CONSEILS pour une aide immédiate." })
      };
    }

    const data = await resp.json();
    const answer = data.choices?.[0]?.message?.content?.trim()
      || "Je n'ai pas la réponse pour l’instant. Contactez 101 CONSEILS pour un conseil adapté.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    };
  } catch (e) {
    return { statusCode: 500, body: `Erreur fonction : ${e.message}` };
  }
};
