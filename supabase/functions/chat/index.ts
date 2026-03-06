// Supabase Edge Function: appelle l'API DeepSeek pour le chat ARIA.
// Déployer avec: supabase functions deploy chat
// Secret requis: DEEPSEEK_API_KEY (Supabase Dashboard > Project Settings > Edge Functions > Secrets)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const SYSTEM_PROMPT = `Tu es ARIA, la conseillère virtuelle de FasoCademy, plateforme de formation en ligne au Burkina Faso.
Tu aides les visiteurs à trouver des formations adaptées (développement web, data, cybersécurité, bureautique, business, design).
Réponds en français, de façon amicale et concise. Propose des pistes de formations quand c'est pertinent.`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface DeepSeekResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Chat non configuré (clé API manquante)" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Body JSON invalide" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const deepseekMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content ?? ""),
    })),
  ];

  const payload: DeepSeekRequest = {
    model: "deepseek-chat",
    messages: deepseekMessages,
    max_tokens: 1024,
    temperature: 0.7,
  };

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data: DeepSeekResponse = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message ?? res.statusText;
      console.error("DeepSeek API error:", res.status, errMsg);
      return new Response(
        JSON.stringify({ error: errMsg || "Erreur DeepSeek" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const content =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Désolée, je n'ai pas pu générer de réponse.";

    return new Response(JSON.stringify({ content }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Chat function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
