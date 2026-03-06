import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptation des conditions',
    content: `En accédant à la plateforme FasoCademy et en l'utilisant, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.

Ces conditions s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient apprenants, formateurs ou visiteurs.`,
  },
  {
    title: '2. Description du service',
    content: `FasoCademy est une plateforme d'apprentissage en ligne proposant des formations dans des domaines variés : développement web, data science, marketing digital, cybersécurité, et bien d'autres.

La plateforme permet aux apprenants d'accéder à des formations créées par des formateurs certifiés, d'obtenir des certificats de completion et de progresser dans leurs compétences professionnelles.`,
  },
  {
    title: '3. Création de compte',
    content: `Pour accéder à la majorité des services FasoCademy, vous devez créer un compte. Vous vous engagez à :

• Fournir des informations exactes et complètes lors de l'inscription
• Maintenir la confidentialité de vos identifiants de connexion
• Nous notifier immédiatement de toute utilisation non autorisée de votre compte
• Être responsable de toutes les activités effectuées via votre compte`,
  },
  {
    title: '4. Paiements et remboursements',
    content: `Les formations payantes sont accessibles après paiement via les méthodes proposées (Orange Money, Moov Money, Wave, carte bancaire).

Politique de remboursement : Vous pouvez demander un remboursement dans les 7 jours suivant votre achat, à condition d'avoir complété moins de 30% du contenu du cours. Les remboursements sont effectués sur le même moyen de paiement utilisé lors de l'achat, dans un délai de 5 à 10 jours ouvrables.`,
  },
  {
    title: '5. Propriété intellectuelle',
    content: `Tout le contenu disponible sur FasoCademy (vidéos, textes, images, logos, quiz) est protégé par les droits d'auteur et appartient à FasoCademy ou à ses formateurs partenaires.

Il est strictement interdit de reproduire, distribuer, modifier ou exploiter commercialement tout contenu sans autorisation écrite préalable. Toute violation pourra faire l'objet de poursuites judiciaires.`,
  },
  {
    title: '6. Règles de conduite',
    content: `En utilisant FasoCademy, vous vous engagez à ne pas :

• Partager vos identifiants de connexion ou permettre à d'autres personnes d'accéder à votre compte
• Télécharger, enregistrer ou distribuer le contenu des cours sans autorisation
• Publier des commentaires offensants, discriminatoires ou inappropriés
• Utiliser la plateforme à des fins illégales ou contraires aux présentes conditions
• Tenter de pirater, compromettre ou perturber le fonctionnement de la plateforme`,
  },
  {
    title: '7. Responsabilité',
    content: `FasoCademy s'efforce de fournir un service de qualité mais ne peut garantir l'absence d'erreurs ou d'interruptions. La plateforme décline toute responsabilité pour :

• Les dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service
• L'exactitude ou la complétude des informations fournies dans les cours
• Les interruptions temporaires du service pour maintenance`,
  },
  {
    title: '8. Modification des conditions',
    content: `FasoCademy se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés par email ou notification dans l'application. L'utilisation continue de la plateforme après modification constitue une acceptation des nouvelles conditions.`,
  },
  {
    title: '9. Contact',
    content: `Pour toute question relative aux présentes Conditions Générales d'Utilisation, vous pouvez nous contacter à :

Email : legal@fasocademy.bf
Adresse : Ouagadougou, Burkina Faso`,
  },
];

function Section({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-[#1B1F3B]">{title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#FF6B00] shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed whitespace-pre-line border-t border-gray-50">
          <div className="pt-4">{content}</div>
        </div>
      )}
    </div>
  );
}

export default function Terms() {
  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      <div className="bg-gradient-to-br from-[#1B1F3B] to-[#2D3366] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-white/70">Dernière mise à jour : 1er Mars 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-[#FFF3E8] border border-[#FF6B00]/20 rounded-2xl p-5 mb-8">
          <p className="text-sm text-[#1B1F3B]">
            <strong>Important :</strong> En utilisant FasoCademy, vous acceptez les présentes conditions. Veuillez les lire attentivement. Cliquez sur chaque section pour en voir le détail.
          </p>
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => <Section key={i} title={s.title} content={s.content} />)}
        </div>
      </div>
    </div>
  );
}