/**
 * Titres et descriptions SEO par page — ciblage Burkina Faso
 */
export const PAGE_SEO = {
  Home: {
    title: 'FasoCademy — Formations en ligne au Burkina Faso | Développement web, Data, Cybersécurité',
    description: 'Plateforme de formation en ligne #1 au Burkina Faso. Cours en développement web, data, cybersécurité. Paiement Orange Money, Moov Money. Certificats reconnus. 100% en français.',
  },
  Catalog: {
    title: 'Catalogue des formations — FasoCademy Burkina Faso',
    description: 'Explore toutes les formations en ligne : développement web, data, cybersécurité, bureautique. Formations en français pour le Burkina Faso.',
  },
  CoursePage: {
    title: '%s — Formation en ligne | FasoCademy BF',
    description: 'Formation en ligne au Burkina Faso. Paiement Mobile Money, certificat inclus. Inscris-toi sur FasoCademy.',
  },
  Profile: {
    title: 'Mon profil — FasoCademy',
    description: 'Gère ton compte et tes formations sur FasoCademy, plateforme e-learning Burkina Faso.',
  },
  MyLearning: {
    title: 'Mon apprentissage — FasoCademy Burkina Faso',
    description: 'Mes formations en cours et certificats. Continue tes cours en ligne sur FasoCademy.',
  },
  Contact: {
    title: 'Contact — FasoCademy Burkina Faso',
    description: 'Contacte l\'équipe FasoCademy. Support formation en ligne au Burkina Faso.',
  },
  BecomeInstructor: {
    title: 'Devenir formateur — FasoCademy',
    description: 'Propose tes formations en ligne sur FasoCademy, la plateforme e-learning du Burkina Faso.',
  },
  VerifyCertificate: {
    title: 'Vérifier un certificat — FasoCademy',
    description: 'Vérifie l\'authenticité d\'un certificat FasoCademy délivré au Burkina Faso.',
  },
  Help: {
    title: 'Aide — FasoCademy Burkina Faso',
    description: 'FAQ et aide pour les formations en ligne FasoCademy.',
  },
  Terms: {
    title: 'Conditions d\'utilisation — FasoCademy',
    description: 'Conditions générales d\'utilisation de la plateforme FasoCademy Burkina Faso.',
  },
  Blog: {
    title: 'Blog — FasoCademy Burkina Faso',
    description: 'Actualités et conseils formation, numérique et emploi au Burkina Faso.',
  },
  InstructorDashboard: {
    title: 'Espace formateur — FasoCademy',
    description: 'Gère tes formations et apprenants sur FasoCademy.',
  },
  AdminDashboard: {
    title: 'Administration — FasoCademy',
    description: 'Tableau de bord administration FasoCademy.',
  },
};

const DEFAULT_TITLE = 'FasoCademy — Formations en ligne au Burkina Faso';
const DEFAULT_DESCRIPTION = 'Plateforme de formation en ligne #1 au Burkina Faso. Développement web, data, cybersécurité. Paiement Orange Money. Certificats reconnus.';

/**
 * Applique le titre et la meta description pour la page courante.
 * À appeler depuis le Layout avec currentPageName (et optionnellement courseTitle pour CoursePage).
 */
export function applyPageSEO(pageName, extra = {}) {
  const seo = PAGE_SEO[pageName] || { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  let title = seo.title || DEFAULT_TITLE;
  const description = seo.description || DEFAULT_DESCRIPTION;

  if (extra.courseTitle && title.includes('%s')) {
    title = title.replace('%s', extra.courseTitle);
  } else if (title.includes('%s')) {
    title = title.replace('%s', 'Formation');
  }

  document.title = title;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // OG title/description pour le partage
  let ogTitle = document.querySelector('meta[property="og:title"]');
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDesc) ogDesc.setAttribute('content', description);
}
