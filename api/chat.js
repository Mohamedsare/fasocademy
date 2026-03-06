// Route API Vercel : appelle DeepSeek pour le chat ARIA.
// La clé API doit être dans les variables d'environnement (Vercel ou .env en local avec vercel dev).

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const SYSTEM_PROMPT = `Tu es ARIA, la conseillère virtuelle de FasoCademy, plateforme de formation en ligne au Burkina Faso.
Tu aides les visiteurs à trouver des formations adaptées (développement web, data, cybersécurité, bureautique, business, design).
Réponds en français, de façon amicale et concise. Propose des pistes de formations quand c'est pertinent.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not set');
    return res.status(500).json({ error: 'Chat non configuré (clé API manquante)' });
  }

  const { messages } = req.body || {};
  const list = Array.isArray(messages) ? messages : [];
  const deepseekMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...list.map((m) => ({ role: m.role, content: String(m.content ?? '') })),
  ];

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message ?? response.statusText;
      console.error('DeepSeek API error:', response.status, errMsg);
      return res.status(502).json({ error: errMsg || 'Erreur DeepSeek' });
    }

    const content =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Désolée, je n'ai pas pu générer de réponse.";

    return res.status(200).json({ content });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: String(err.message) });
  }
}
