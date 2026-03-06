import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { Code, BarChart3, Shield, FileSpreadsheet, Briefcase, Palette, ArrowRight } from 'lucide-react';

const categoryConfig = [
  { name: 'Développement Web', slug: 'developpement-web', icon: Code, color: 'bg-blue-500' },
  { name: 'Data & IA', slug: 'data-ia', icon: BarChart3, color: 'bg-purple-500' },
  { name: 'Cybersécurité', slug: 'cybersecurite', icon: Shield, color: 'bg-red-500' },
  { name: 'Bureautique', slug: 'bureautique', icon: FileSpreadsheet, color: 'bg-green-500' },
  { name: 'Business', slug: 'business-entrepreneuriat', icon: Briefcase, color: 'bg-amber-500' },
  { name: 'Design', slug: 'design-creation', icon: Palette, color: 'bg-pink-500' },
];

async function fetchCategoryCounts() {
  const { data, error } = await supabase
    .from('courses')
    .select('category')
    .eq('status', 'published');
  if (error) {
    console.error('CategoriesSection fetchCategoryCounts:', error);
    return {};
  }
  const counts = {};
  (data || []).forEach((row) => {
    const cat = row.category || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

export default function CategoriesSection() {
  const { data: countsBySlug = {} } = useQuery({
    queryKey: ['category-counts'],
    queryFn: fetchCategoryCounts,
  });

  const categories = useMemo(
    () =>
      categoryConfig.map((cat) => ({
        ...cat,
        count: countsBySlug[cat.slug] ?? 0,
      })),
    [countsBySlug]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B1F3B]">Explorer par catégorie</h2>
          <p className="text-gray-500 mt-2">Trouve la formation qui correspond à tes objectifs</p>
        </div>
        <Link to={createPageUrl('Catalog')} className="hidden md:flex items-center gap-1 text-[#FF6B00] font-semibold text-sm hover:underline">
          Tout voir <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              to={createPageUrl('Catalog') + `?cat=${cat.slug}`}
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF6B00]/30 hover:shadow-lg transition-all text-center"
            >
              <div className={`${cat.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-sm text-[#1B1F3B]">{cat.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{cat.count} formation{cat.count !== 1 ? 's' : ''}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}