import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Send, Sparkles, ExternalLink, ChevronRight, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const QUICK_STARTS = [
  { label: '🚀 Je veux changer de carrière', msg: 'Je veux changer de carrière et travailler dans le numérique' },
  { label: '💻 Apprendre le développement web', msg: 'Je veux apprendre le développement web' },
  { label: '📊 Data & Intelligence Artificielle', msg: 'Je suis intéressé par la data et l\'intelligence artificielle' },
  { label: '🔒 Cybersécurité', msg: 'Je veux me former en cybersécurité' },
  { label: '💰 Voir les formations gratuites', msg: 'Y a-t-il des formations gratuites disponibles ?' },
];

// Parse message content and extract course cards
function parseMessageContent(content) {
  if (!content) return { text: '', cards: [] };
  const cardRegex = /---CARD---([a-zA-Z0-9]+)---END---/g;
  const cards = [];
  let match;
  while ((match = cardRegex.exec(content)) !== null) {
    cards.push(match[1]);
  }
  const text = content.replace(/---CARD---[a-zA-Z0-9]+---END---/g, '').trim();
  return { text, cards };
}

function CourseCard({ courseId }) {
  const [course, setCourse] = useState(null);
  useEffect(() => {
    base44.entities.Course.filter({ id: courseId }).then(res => {
      if (res && res.length > 0) setCourse(res[0]);
    }).catch(() => {});
  }, [courseId]);

  if (!course) return null;

  const levelMap = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };

  return (
    <Link
      to={createPageUrl('CoursePage') + `?id=${course.id}`}
      className="block mt-2 bg-white border-2 border-[#FF6B00]/30 hover:border-[#FF6B00] rounded-2xl p-3 transition-all hover:shadow-md group"
    >
      {course.thumbnail_url && (
        <img src={course.thumbnail_url} alt={course.title} className="w-full h-24 object-cover rounded-xl mb-2" />
      )}
      <p className="font-bold text-[#1B1F3B] text-sm leading-snug group-hover:text-[#FF6B00] transition-colors">{course.title}</p>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {course.price_cfa > 0 ? (
          <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF3E8] px-2 py-0.5 rounded-full">
            {course.price_cfa?.toLocaleString()} FCFA
          </span>
        ) : (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Gratuit 🎉</span>
        )}
        {course.level && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {levelMap[course.level] || course.level}
          </span>
        )}
        {course.duration_hours && (
          <span className="text-xs text-gray-500">⏱️ {course.duration_hours}h</span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[#FF6B00] text-xs font-semibold">
        <span>Voir la formation</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  );
}

function MessageBubble({ msg }) {
  const { text, cards } = parseMessageContent(msg.content);
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        {text && (
          <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-[#1B1F3B] text-white rounded-br-sm'
              : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm'
          }`}>
            {isUser ? (
              <p>{text}</p>
            ) : (
              <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-a:text-[#FF6B00]">
                {text}
              </ReactMarkdown>
            )}
          </div>
        )}
        {cards.map(id => <CourseCard key={id} courseId={id} />)}
      </div>
    </div>
  );
}

export default function AriaChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const bottomRef = useRef(null);

  // Auto-open for first-time visitors after 3s
  useEffect(() => {
    const hasVisited = localStorage.getItem('fasocademy_visited');
    if (!hasVisited) {
      const t1 = setTimeout(() => setShowBubble(true), 2000);
      const t2 = setTimeout(() => {
        setOpen(true);
        localStorage.setItem('fasocademy_visited', '1');
      }, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  useEffect(() => {
    if (!open || conversation) return;
    const init = async () => {
      const conv = await base44.agents.createConversation({
        agent_name: 'aria',
        metadata: { name: 'Chat ARIA' },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    };
    init();
  }, [open]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending || !conversation) return;
    setSending(true);
    setInput('');
    try {
      const updated = await base44.agents.addMessage(conversation, { role: 'user', content: msg });
      if (updated?.messages) {
        setConversation(updated);
        setMessages(updated.messages);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  const lastMsg = messages[messages.length - 1];
  const isStreaming = lastMsg?.role === 'assistant' && lastMsg?.status === 'streaming';
  const showQuickStarts = conversation && visibleMessages.length === 0 && !sending;

  return (
    <>
      {/* Proactive bubble */}
      {showBubble && !open && (
        <div className="fixed bottom-24 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-[220px] animate-bounce-once">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1B1F3B]">Salut ! Je suis ARIA 👋</p>
              <p className="text-xs text-gray-500 mt-0.5">Je t'aide à trouver ta formation idéale 🎯</p>
            </div>
            <button onClick={() => setShowBubble(false)} className="text-gray-300 hover:text-gray-500 ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(o => !o); setShowBubble(false); localStorage.setItem('fasocademy_visited', '1'); }}
        className="fixed bottom-20 right-4 sm:bottom-5 sm:right-5 z-50 bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] hover:from-[#E55D00] hover:to-[#FF6B00] text-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 gap-0.5"
        title="Discuter avec ARIA"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-[8px] sm:text-[9px] font-bold leading-none">ARIA</span>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window — full screen on mobile, floating on desktop */}
      {open && (
        <div
          className="fixed z-50 bg-white flex flex-col overflow-hidden
            inset-0 rounded-none
            sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:w-[400px] sm:h-[600px] sm:min-h-[400px] sm:max-h-[85vh] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B1F3B] to-[#FF6B00] px-4 py-3 flex items-center justify-between shrink-0 sm:pt-3 pt-[max(env(safe-area-inset-top),12px)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">ARIA ✨</p>
                <p className="text-white/70 text-xs">Conseillère FasoCademy • En ligne</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Loading state */}
            {!conversation && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="flex gap-1 justify-center mb-3">
                    <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-sm">ARIA arrive…</p>
                </div>
              </div>
            )}

            {/* Welcome + quick starts */}
            {showQuickStarts && (
              <div className="space-y-3">
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-gray-800 max-w-[85%]">
                    <p className="font-semibold text-[#1B1F3B]">Salut ! Je suis ARIA 👋🌟</p>
                    <p className="mt-1 text-gray-600">Je suis ta conseillère personnelle FasoCademy. En quelques secondes, je trouve la formation parfaite pour toi !</p>
                    <p className="mt-1.5 text-[#FF6B00] font-medium">Qu'est-ce qui t'amène aujourd'hui ? 🎯</p>
                  </div>
                </div>
                <div className="space-y-2 pl-9">
                  {QUICK_STARTS.map((qs, i) => (
                    <button
                      key={i}
                      onClick={() => send(qs.msg)}
                      className="w-full text-left text-xs font-medium px-3 py-2 rounded-xl border-2 border-[#FF6B00]/30 hover:border-[#FF6B00] hover:bg-[#FFF3E8] text-[#1B1F3B] transition-all flex items-center justify-between group"
                    >
                      <span>{qs.label}</span>
                      <Zap className="w-3 h-3 text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {visibleMessages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex gap-2 shrink-0 bg-white">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écris ton message…"
              disabled={!conversation || sending}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00] disabled:opacity-50 max-h-24"
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={!input.trim() || sending || !conversation}
              className="bg-[#FF6B00] hover:bg-[#E55D00] text-white rounded-xl h-9 w-9 shrink-0 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}