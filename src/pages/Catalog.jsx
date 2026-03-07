import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CourseCard from '@/components/common/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'developpement-web', label: 'Développement Web' },
  { value: 'data-ia', label: 'Data & IA' },
  { value: 'cybersecurite', label: 'Cybersécurité' },
  { value: 'bureautique', label: 'Bureautique' },
  { value: 'business-entrepreneuriat', label: 'Business' },
  { value: 'design-creation', label: 'Design' },
];

const levels = [
  { value: 'all', label: 'Tous niveaux' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

const priceRanges = [
  { value: 'all', label: 'Tous les prix' },
  { value: 'free', label: 'Gratuit' },
  { value: '0-5000', label: 'Moins de 5 000 CFA' },
  { value: '5000-15000', label: '5 000 – 15 000 CFA' },
  { value: '15000-30000', label: '15 000 – 30 000 CFA' },
  { value: '30000+', label: 'Plus de 30 000 CFA' },
];

const durations = [
  { value: 'all', label: 'Toutes durées' },
  { value: '0-2', label: 'Moins de 2h' },
  { value: '2-5', label: '2h – 5h' },
  { value: '5-10', label: '5h – 10h' },
  { value: '10+', label: 'Plus de 10h' },
];

const languages = [
  { value: 'all', label: 'Toutes langues' },
  { value: 'Français', label: 'Français' },
  { value: 'Anglais', label: 'Anglais' },
  { value: 'Moore', label: 'Mooré' },
  { value: 'Dioula', label: 'Dioula' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(catParam);

  useEffect(() => {
    setCategory(catParam);
  }, [catParam]);
  const [level, setLevel] = useState('all');
  const [sort, setSort] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [duration, setDuration] = useState('all');
  const [language, setLanguage] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses-catalog'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }, '-created_date', 100),
    initialData: [],
  });

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.instructor_name?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category !== 'all') result = result.filter(c => c.category === category);
    if (level !== 'all') result = result.filter(c => c.level === level);
    if (language !== 'all') result = result.filter(c => c.language === language);

    if (priceRange !== 'all') {
      if (priceRange === 'free') result = result.filter(c => c.is_free || !c.price_cfa || c.price_cfa === 0);
      else if (priceRange === '0-5000') result = result.filter(c => !c.is_free && (c.price_cfa || 0) > 0 && (c.price_cfa || 0) <= 5000);
      else if (priceRange === '5000-15000') result = result.filter(c => (c.price_cfa || 0) > 5000 && (c.price_cfa || 0) <= 15000);
      else if (priceRange === '15000-30000') result = result.filter(c => (c.price_cfa || 0) > 15000 && (c.price_cfa || 0) <= 30000);
      else if (priceRange === '30000+') result = result.filter(c => (c.price_cfa || 0) > 30000);
    }

    if (duration !== 'all') {
      if (duration === '0-2') result = result.filter(c => (c.duration_hours || 0) <= 2);
      else if (duration === '2-5') result = result.filter(c => (c.duration_hours || 0) > 2 && (c.duration_hours || 0) <= 5);
      else if (duration === '5-10') result = result.filter(c => (c.duration_hours || 0) > 5 && (c.duration_hours || 0) <= 10);
      else if (duration === '10+') result = result.filter(c => (c.duration_hours || 0) > 10);
    }

    switch (sort) {
      case 'popular': result.sort((a, b) => (b.total_students || 0) - (a.total_students || 0)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
      case 'price_low': result.sort((a, b) => (a.price_cfa || 0) - (b.price_cfa || 0)); break;
      case 'price_high': result.sort((a, b) => (b.price_cfa || 0) - (a.price_cfa || 0)); break;
      case 'rating': result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)); break;
    }

    return result;
  }, [courses, search, category, level, sort, priceRange, duration, language]);

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => setSearch('') },
    category !== 'all' && { key: 'cat', label: categories.find(c => c.value === category)?.label, clear: () => setCategory('all') },
    level !== 'all' && { key: 'level', label: levels.find(l => l.value === level)?.label, clear: () => setLevel('all') },
    priceRange !== 'all' && { key: 'price', label: priceRanges.find(p => p.value === priceRange)?.label, clear: () => setPriceRange('all') },
    duration !== 'all' && { key: 'dur', label: durations.find(d => d.value === duration)?.label, clear: () => setDuration('all') },
    language !== 'all' && { key: 'lang', label: language, clear: () => setLanguage('all') },
  ].filter(Boolean);

  const resetAll = () => { setSearch(''); setCategory('all'); setLevel('all'); setPriceRange('all'); setDuration('all'); setLanguage('all'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1B1F3B] dark:text-gray-100">Catalogue des formations</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Explore nos formations et commence à apprendre aujourd'hui</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 space-y-3">
        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation, un sujet, un formateur..."
              className="pl-10 h-11"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Plus populaires</SelectItem>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="rating">Mieux notés</SelectItem>
              <SelectItem value="price_low">Prix croissant</SelectItem>
              <SelectItem value="price_high">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className={`h-11 gap-2 ${showAdvanced ? 'border-[#FF6B00] text-[#FF6B00] dark:border-orange-500 dark:text-orange-400' : ''}`}
            onClick={() => setShowAdvanced(v => !v)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {activeFilters.length > 0 && (
              <span className="bg-[#FF6B00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters.length}</span>
            )}
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Prix" /></SelectTrigger>
              <SelectContent>
                {priceRanges.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Durée" /></SelectTrigger>
              <SelectContent>
                {durations.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Langue" /></SelectTrigger>
              <SelectContent>
                {languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active filter tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredCourses.length} résultat(s)</span>
            {activeFilters.map(f => (
              <Badge key={f.key} variant="secondary" className="gap-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-500 dark:hover:text-red-400 transition-colors" onClick={f.clear}>
                {f.label} <X className="w-3 h-3" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={resetAll} className="text-[#FF6B00] dark:text-orange-400 text-xs h-6 px-2">
              Tout effacer
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">Aucune formation trouvée</h3>
          <p className="text-gray-400 dark:text-gray-500">Essaie de modifier tes filtres de recherche</p>
          <Button variant="outline" className="mt-4" onClick={resetAll}>Réinitialiser les filtres</Button>
        </div>
      )}
    </div>
  );
}