import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';

const subjects = [
  'Question technique',
  'Problème de paiement',
  'Problème avec ma formation',
  'Devenir formateur',
  'Partenariat',
  'Autre',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'contact@fasocademy.cmm',
        subject: `[Contact] ${form.subject} - ${form.name}`,
        body: `Nom: ${form.name}\nEmail: ${form.email}\nSujet: ${form.subject}\n\nMessage:\n${form.message}`,
      });
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Une erreur est survenue. Réessaie ou contacte-nous par email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFC] dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B1F3B] to-[#2D3366] dark:from-gray-900 dark:to-gray-800 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Contactez-nous</h1>
          <p className="text-white/70 text-lg">Notre équipe répond sous 24h ouvrables</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-bold text-[#1B1F3B] dark:text-gray-100 mb-5">Informations de contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-[#1B1F3B] dark:text-gray-300">contact@fasocademy.cmm</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Téléphone</p>
                    <p className="text-sm font-medium text-[#1B1F3B] dark:text-gray-300">+226 64 71 20 44 ou +212 771 668 079</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Adresse</p>
                    <p className="text-sm font-medium text-[#1B1F3B] dark:text-gray-300">Ouagadougou, Burkina Faso</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">WhatsApp</p>
                    <p className="text-sm font-medium text-[#1B1F3B] dark:text-gray-300">+226 64 71 20 44</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-bold text-[#1B1F3B] dark:text-gray-100 mb-2">Support</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">La plateforme est accessible 24h/24, 7j/7.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Réponse garantie sous 24h ouvrables</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-[#1B1F3B] mb-2">Message envoyé !</h3>
                <p className="text-gray-500 dark:text-gray-400">Nous avons bien reçu votre message et vous répondrons dans les 24 heures ouvrables.</p>
                <Button onClick={() => setSent(false)} variant="outline" className="mt-6">Envoyer un autre message</Button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-[#1B1F3B] dark:text-gray-100 text-xl mb-6">Envoyez-nous un message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                      <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Votre nom" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                      <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votre@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
                    <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {submitError && <p className="text-sm text-red-500">{submitError}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      rows={6}
                      placeholder="Décrivez votre question ou problème en détail..."
                      required
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white h-11 gap-2">
                    {loading ? 'Envoi en cours...' : (<><Send className="w-4 h-4" /> Envoyer le message</>)}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}