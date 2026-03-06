import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, DollarSign, Users, Star, CheckCircle, ArrowRight, BookOpen, Award, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';

const steps = [
  { step: '01', title: 'Créez votre profil formateur', desc: 'Inscrivez-vous et complétez votre profil avec vos expertises et votre bio.' },
  { step: '02', title: 'Demandez l\'accès formateur', desc: 'Cliquez sur "Demander l\'accès formateur". Notre équipe valide votre demande sous 48h.' },
  { step: '03', title: 'Créez votre formation', desc: 'Une fois accepté, utilisez l\'éditeur pour créer vidéos, quiz, exercices et ressources.' },
  { step: '04', title: 'Publiez et gagnez', desc: 'Votre formation est mise en ligne et vous percevez 80% des revenus générés.' },
];

const benefits = [
  { icon: DollarSign, title: '80% des revenus', desc: 'Percevez 80% du prix de chaque vente, directement sur votre mobile money.' },
  { icon: Users, title: 'Audience qualifiée', desc: "Accédez à une communauté de milliers d'apprenants motivés au Burkina Faso." },
  { icon: BookOpen, title: 'Outils puissants', desc: 'Éditeur de cours, quiz interactifs, certificats automatiques et tableau de bord.' },
  { icon: TrendingUp, title: 'Statistiques en temps réel', desc: 'Suivez vos ventes, progrès des étudiants et revenus à tout moment.' },
  { icon: Award, title: 'Badge formateur certifié', desc: "Obtenez le badge officiel FasoCademy et renforcez votre crédibilité d'expert." },
  { icon: Star, title: 'Support dédié', desc: "Une équipe dédiée vous accompagne à chaque étape de la création de votre cours." },
];

const faqs = [
  { q: "Faut-il une expérience en enseignement ?", a: "Non, pas nécessairement. Vous avez besoin d'une expertise dans votre domaine et d'une volonté de partager vos connaissances. Nous vous accompagnons pour la pédagogie." },
  { q: "Quels équipements sont nécessaires ?", a: "Un smartphone ou ordinateur avec un micro correct suffit pour commencer. La qualité audio est plus importante que la qualité vidéo." },
  { q: "Comment sont calculés mes revenus ?", a: "Vous percevez 80% du prix de vente de chaque formation. Les paiements sont effectués chaque mois via Orange Money, Moov Money ou Wave." },
  { q: "Combien de temps prend la validation ?", a: "Nous examinons votre demande d'accès formateur sous 48 heures ouvrables. Une fois accepté, vous pouvez créer et soumettre vos formations." },
];

export default function BecomeInstructor() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const hasRequested = !!user?.instructor_requested_at;

  const handleRequestAccess = async () => {
    setRequestError('');
    setRequesting(true);
    try {
      await base44.auth.requestInstructorAccess();
      await refreshUser();
    } catch (err) {
      setRequestError(err?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setRequesting(false);
    }
  };

  const HeroCTA = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Profile')}>
            <Button size="lg" className="bg-[#FF6B00] hover:bg-[#E55D00] text-white px-8 gap-2">
              Se connecter pour demander l'accès <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-white/70 text-sm self-center">Déjà inscrit ? Connecte-toi puis reviens sur cette page.</p>
        </div>
      );
    }
    if (isInstructor) {
      return (
        <div className="flex flex-col gap-4 justify-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Vous êtes formateur
          </div>
          <Link to={createPageUrl('InstructorDashboard')}>
            <Button size="lg" className="bg-[#FF6B00] hover:bg-[#E55D00] text-white px-8 gap-2">
              Accéder à l'espace formateur <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      );
    }
    if (hasRequested) {
      return (
        <div className="rounded-2xl bg-white/10 border border-white/20 px-6 py-4 max-w-lg mx-auto">
          <p className="text-white font-semibold mb-1">Demande envoyée</p>
          <p className="text-white/80 text-sm">
            Votre demande d'accès formateur est en cours d'examen. Nous vous recontacterons sous 48h par email. En attendant, explorez le catalogue.
          </p>
          <Link to={createPageUrl('Catalog')} className="inline-block mt-3 text-[#FF9A44] font-medium text-sm hover:underline">
            Voir le catalogue →
          </Link>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 justify-center">
        <Button
          size="lg"
          className="bg-[#FF6B00] hover:bg-[#E55D00] text-white px-8 gap-2"
          onClick={handleRequestAccess}
          disabled={requesting}
        >
          {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
          {requesting ? 'Envoi en cours...' : 'Demander l\'accès formateur'}
        </Button>
        {requestError && <p className="text-red-300 text-sm">{requestError}</p>}
        <p className="text-white/60 text-sm">Gratuit. Vous recevrez une réponse sous 48h.</p>
      </div>
    );
  };

  return (
    <div className="bg-[#FAFBFC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B1F3B] to-[#2D3366] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF6B00]/20 text-[#FF9A44] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <GraduationCap className="w-4 h-4" /> Devenez formateur FasoCademy
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Partagez votre expertise,<br />
            <span className="text-[#FF6B00]">générez des revenus</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de formateurs et transformez vos compétences en revenus durables. Demandez l'accès en un clic.
          </p>
          {HeroCTA()}
          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-white/60">
            <span>✅ Gratuit</span>
            <span>✅ 80% des revenus</span>
            <span>✅ Validation sous 48h</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-[#1B1F3B] text-center mb-3">Pourquoi enseigner sur FasoCademy ?</h2>
        <p className="text-gray-500 text-center mb-12">Tout ce dont vous avez besoin pour réussir en tant que formateur</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#FFF3E8] flex items-center justify-center mb-4">
                <b.icon className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <h3 className="font-bold text-[#1B1F3B] mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#1B1F3B] text-center mb-3">Comment ça marche ?</h2>
          <p className="text-gray-500 text-center mb-12">4 étapes pour lancer votre formation</p>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-xl font-extrabold shrink-0">
                  {s.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-[#1B1F3B] text-lg mb-1">{s.title}</h3>
                  <p className="text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-[#1B1F3B] text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1B1F3B] mb-2">{f.q}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FF6B00] py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Prêt à partager votre savoir ?</h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto">Demandez l'accès formateur et rejoignez les formateurs FasoCademy.</p>
        {!isAuthenticated ? (
          <Link to={createPageUrl('Profile')}>
            <Button size="lg" className="bg-white text-[#FF6B00] hover:bg-gray-100 font-bold px-8">
              Se connecter pour demander l'accès
            </Button>
          </Link>
        ) : isInstructor ? (
          <Link to={createPageUrl('InstructorDashboard')}>
            <Button size="lg" className="bg-white text-[#FF6B00] hover:bg-gray-100 font-bold px-8">
              Accéder à l'espace formateur
            </Button>
          </Link>
        ) : hasRequested ? (
          <p className="text-white/90 font-medium">Votre demande a bien été enregistrée. Vous serez notifié par email.</p>
        ) : (
          <Button
            size="lg"
            className="bg-white text-[#FF6B00] hover:bg-gray-100 font-bold px-8"
            onClick={handleRequestAccess}
            disabled={requesting}
          >
            {requesting ? 'Envoi...' : 'Demander l\'accès formateur'}
          </Button>
        )}
      </div>
    </div>
  );
}
