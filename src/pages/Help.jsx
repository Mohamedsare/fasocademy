import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, BookOpen, CreditCard, GraduationCap, Award, MessageCircle, Settings } from 'lucide-react';

const categories = [
  {
    icon: GraduationCap,
    title: 'Commencer',
    faqs: [
      { q: "Comment créer un compte sur FasoCademy ?", a: "Cliquez sur 'S'inscrire gratuitement' en haut de la page. Vous pouvez vous connecter avec votre email. L'inscription est entièrement gratuite." },
      { q: "Comment accéder à une formation ?", a: "Après votre inscription, recherchez une formation dans le catalogue, cliquez dessus et inscrivez-vous (gratuite) ou procédez au paiement pour les formations payantes." },
      { q: "Puis-je apprendre depuis mon téléphone ?", a: "Oui ! FasoCademy est entièrement optimisé pour mobile. Vous pouvez suivre vos cours depuis n'importe quel smartphone ou tablette." },
    ]
  },
  {
    icon: CreditCard,
    title: 'Paiement',
    faqs: [
      { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons Orange Money, Moov Money, Wave et les cartes bancaires. Choisissez votre méthode lors du paiement." },
      { q: "Mon paiement a échoué, que faire ?", a: "Vérifiez votre solde et réessayez. Si le problème persiste, contactez-nous via le formulaire de contact avec une capture d'écran de l'erreur." },
      { q: "Puis-je obtenir un remboursement ?", a: "Oui, dans les 7 jours suivant l'achat si vous avez complété moins de 30% du cours. Contactez notre support pour traiter votre demande." },
    ]
  },
  {
    icon: BookOpen,
    title: 'Formations',
    faqs: [
      { q: "Les formations ont-elles une date d'expiration ?", a: "Non, une fois achetée, vous avez un accès à vie à la formation, y compris toutes les mises à jour futures." },
      { q: "Comment signaler un problème avec une vidéo ?", a: "Sous chaque vidéo, il y a un bouton 'Signaler un problème'. Vous pouvez également nous contacter directement via le formulaire de contact." },
      { q: "Puis-je télécharger les ressources du cours ?", a: "Oui, les ressources attachées aux leçons (PDF, fichiers) sont téléchargeables directement depuis la page de la leçon." },
    ]
  },
  {
    icon: Award,
    title: 'Certificats',
    faqs: [
      { q: "Comment obtenir mon certificat ?", a: "Complétez 100% des leçons du cours. Votre certificat est généré automatiquement et accessible dans 'Mon apprentissage > Certificats'." },
      { q: "Mon certificat est-il reconnu par les employeurs ?", a: "Nos certificats sont de plus en plus reconnus au Burkina Faso et en Afrique de l'Ouest. Nous travaillons avec des partenaires entreprises pour leur valorisation." },
      { q: "J'ai perdu mon certificat, comment le récupérer ?", a: "Tous vos certificats sont sauvegardés dans votre espace personnel. Connectez-vous et allez dans 'Mon apprentissage > Certificats'." },
    ]
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors">
        <span className="font-medium text-[#1B1F3B] text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#FF6B00] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0 text-sm text-gray-500 leading-relaxed bg-white">{a}</div>}
    </div>
  );
}

export default function Help() {
  const [search, setSearch] = useState('');

  const filtered = categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.faqs.length > 0);

  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B1F3B] to-[#2D3366] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Centre d'aide</h1>
          <p className="text-white/70 text-lg mb-8">Trouvez rapidement des réponses à vos questions</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une question..." className="pl-11 h-12 bg-white text-gray-900 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {filtered.length > 0 ? (
          <div className="space-y-10">
            {filtered.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#1B1F3B]">{cat.title}</h2>
                </div>
                <div className="space-y-2">
                  {cat.faqs.map((faq, j) => <FAQItem key={j} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">Aucun résultat pour "{search}"</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <MessageCircle className="w-10 h-10 text-[#FF6B00] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1B1F3B] mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-500 mb-6">Notre équipe est disponible pour vous aider du lundi au vendredi, de 8h à 18h.</p>
          <Link to={createPageUrl('Contact')} className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55D00] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}