// Chat ARIA : appelle l'API DeepSeek via Vercel (/api/chat) ou Supabase Edge Function.
import { supabase } from './supabase';

/**
 * Envoie l'historique de messages à l'IA et retourne la réponse assistant.
 * Utilise VITE_API_URL/api/chat (Vercel) si défini, sinon l'Edge Function Supabase "chat".
 */
export async function getAriaReply(messages) {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    const res = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || res.statusText);
    return data?.content ?? "Désolée, je n'ai pas pu répondre.";
  }

  const { data, error } = await supabase.functions.invoke('chat', {
    body: { messages },
  });

  if (error) {
    console.error('ARIA chat error:', error);
    throw error;
  }

  if (data?.error) throw new Error(data.error);
  return data?.content ?? "Désolée, je n'ai pas pu répondre. Réessaie ou explore le catalogue.";
}
