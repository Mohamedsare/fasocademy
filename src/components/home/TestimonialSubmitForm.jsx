import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Star, Send, CheckCircle } from 'lucide-react';

export default function TestimonialSubmitForm() {
  const [form, setForm] = useState({ role: '', city: '', content: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin();
        return;
      }
      const user = await base44.auth.me();
      await base44.entities.Testimonial.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        role: form.role,
        city: form.city,
        content: form.content,
        rating: form.rating,
        status: 'pending',
      });
      setDone(true);
    } catch (err) {
      console.error('Testimonial submit error:', err);
      setError(err?.message || 'Erreur lors de l\'envoi. Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <CheckCircle className="w-12 h-12 text-[#00C9A7]" />
        <p className="font-bold text-[#1B1F3B] dark:text-gray-100">Merci pour ton témoignage !</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Il sera visible après validation par notre équipe.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="text-sm font-semibold text-[#1B1F3B] dark:text-gray-200 block mb-1">Note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setForm(f => ({ ...f, rating: s }))}
            >
              <Star className={`w-7 h-7 transition-colors ${s <= (hovered || form.rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200 dark:text-gray-600'}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-[#1B1F3B] dark:text-gray-200 block mb-1">Métier / Rôle</label>
          <input
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FF6B00] dark:focus:border-orange-500"
            placeholder="Ex: Développeur Web"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#1B1F3B] dark:text-gray-200 block mb-1">Ville</label>
          <input
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FF6B00] dark:focus:border-orange-500"
            placeholder="Ex: Ouagadougou"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-[#1B1F3B] dark:text-gray-200 block mb-1">Ton témoignage *</label>
        <textarea
          required
          rows={4}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FF6B00] dark:focus:border-orange-500 resize-none"
          placeholder="Raconte comment FasoCademy a changé ton parcours…"
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading || !form.content} className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white h-11">
        <Send className="w-4 h-4 mr-2" />
        {loading ? 'Envoi…' : 'Envoyer mon témoignage'}
      </Button>
    </form>
  );
}