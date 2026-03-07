import React from 'react';
import { Smartphone, Award, Shield, Wifi, CreditCard, Users } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile-first',
    description: 'Optimisé pour apprendre sur ton téléphone, même avec une connexion lente.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: CreditCard,
    title: 'Paiement local',
    description: 'Paie facilement avec Orange Money, Moov Money ou Wave. Pas besoin de carte bancaire.',
    color: 'bg-orange-50 text-[#FF6B00]'
  },
  {
    icon: Award,
    title: 'Certificats reconnus',
    description: 'Obtiens un certificat vérifiable à la fin de chaque formation. Valorise ton profil.',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    icon: Wifi,
    title: 'Mode hors-ligne',
    description: 'Télécharge les leçons et apprends sans connexion internet.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Shield,
    title: 'Garantie 7 jours',
    description: 'Pas satisfait ? Remboursement sous 7 jours, sans question.',
    color: 'bg-red-50 text-red-500'
  },
  {
    icon: Users,
    title: 'Communauté active',
    description: 'Pose tes questions, échange avec les formateurs et les autres apprenants.',
    color: 'bg-cyan-50 text-cyan-600'
  }
];

export default function WhyFasocademy() {
  return (
    <section className="bg-gradient-to-b from-[#FAFBFC] to-white dark:from-gray-950 dark:to-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B1F3B] dark:text-gray-100">Pourquoi choisir FasoCademy ?</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">Une plateforme pensée pour l'Afrique francophone, avec des outils modernes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all group">
                <div className={`${feature.color} dark:opacity-90 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#1B1F3B] dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
