import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Clock, User, ArrowRight, BookOpen } from 'lucide-react';

const articles = [
  {
    id: 1,
    category: 'Carrière',
    title: 'Comment devenir développeur web au Burkina Faso en 2026 ?',
    excerpt: "Le développement web est l'une des compétences les plus demandées en Afrique de l'Ouest. Découvrez le parcours complet pour lancer votre carrière.",
    author: 'Moussa Traoré',
    date: '28 Fév 2026',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    featured: true,
  },
  {
    id: 2,
    category: 'Conseils',
    title: '10 conseils pour apprendre plus vite en ligne',
    excerpt: 'L\'apprentissage en ligne requiert de la discipline et des méthodes adaptées. Voici les stratégies qui font la différence.',
    author: 'Aminata Kaboré',
    date: '22 Fév 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    featured: false,
  },
  {
    id: 3,
    category: 'Tech',
    title: 'Intelligence artificielle : que savoir avant de se lancer ?',
    excerpt: 'L\'IA révolutionne tous les secteurs. Comprendre ses bases est aujourd\'hui indispensable pour rester compétitif sur le marché du travail.',
    author: 'Ibrahim Sawadogo',
    date: '15 Fév 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    featured: false,
  },
  {
    id: 4,
    category: 'Succès',
    title: 'De zéro à 500 000 CFA/mois : témoignage de Jean-Paul',
    excerpt: 'Jean-Paul a suivi nos formations en marketing digital et a bâti un business florissant en 8 mois. Il partage son parcours sans filtre.',
    author: 'Équipe FasoCademy',
    date: '10 Fév 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    featured: false,
  },
  {
    id: 5,
    category: 'Entrepreneuriat',
    title: 'Lancer une startup tech au Burkina : guide pratique',
    excerpt: 'L\'écosystème tech burkinabé est en pleine effervescence. Voici tout ce que vous devez savoir pour lancer votre projet innovant.',
    author: 'Fatimata Diallo',
    date: '5 Fév 2026',
    readTime: '10 min',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80',
    featured: false,
  },
  {
    id: 6,
    category: 'Cybersécurité',
    title: 'Protéger votre entreprise des cyberattaques : les bases',
    excerpt: 'Les PME africaines sont de plus en plus ciblées par les hackers. Quelques mesures simples peuvent vous protéger efficacement.',
    author: 'Adama Ouédraogo',
    date: '1 Fév 2026',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
    featured: false,
  },
];

const categoryColors = {
  'Carrière': 'bg-blue-100 text-blue-700',
  'Conseils': 'bg-green-100 text-green-700',
  'Tech': 'bg-purple-100 text-purple-700',
  'Succès': 'bg-yellow-100 text-yellow-700',
  'Entrepreneuriat': 'bg-orange-100 text-orange-700',
  'Cybersécurité': 'bg-red-100 text-red-700',
};

export default function Blog() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous');

  const categories = ['Tous', ...new Set(articles.map(a => a.category))];
  const featured = articles.find(a => a.featured);
  const others = articles.filter(a => !a.featured).filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Tous' || a.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B1F3B] to-[#2D3366] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Blog FasoCademy</h1>
          <p className="text-white/70 text-lg mb-8">Conseils, inspirations et tendances pour apprendre et progresser</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un article..." className="pl-10 bg-white text-gray-900 h-11" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Featured */}
        {featured && selectedCat === 'Tous' && !search && (
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-12 flex flex-col lg:flex-row">
            <img src={featured.image} alt={featured.title} className="w-full lg:w-1/2 h-64 lg:h-auto object-cover" />
            <div className="p-8 flex flex-col justify-center">
              <span className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit ${categoryColors[featured.category]}`}>{featured.category}</span>
              <h2 className="text-2xl font-extrabold text-[#1B1F3B] mb-3">{featured.title}</h2>
              <p className="text-gray-500 mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{featured.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime} de lecture</span>
                <span>{featured.date}</span>
              </div>
              <button className="flex items-center gap-2 text-[#FF6B00] font-semibold hover:gap-3 transition-all">
                Lire l'article <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCat === cat ? 'bg-[#FF6B00] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        {others.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map(article => (
              <div key={article.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${categoryColors[article.category]}`}>{article.category}</span>
                  <h3 className="font-bold text-[#1B1F3B] mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}