import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Quote, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import TestimonialSubmitForm from './TestimonialSubmitForm';

const FALLBACK = [
  {
    user_name: 'Aminata Ouédraogo', role: 'Développeuse Web', city: 'Ouagadougou',
    content: "Grâce à FasoCademy, j'ai appris Django en 3 mois et j'ai décroché mon premier job en freelance. Le paiement Orange Money m'a facilité la vie !",
    rating: 5
  },
  {
    user_name: 'Ibrahim Sawadogo', role: 'Data Analyst', city: 'Bobo-Dioulasso',
    content: "Les formations sont de qualité et le certificat m'a ouvert des portes. La communauté est super active et les formateurs répondent vite.",
    rating: 5
  },
  {
    user_name: 'Fatou Compaoré', role: 'Étudiante', city: 'Koudougou',
    content: "J'ai pu télécharger les vidéos et apprendre même sans connexion. C'est exactement ce qu'il nous faut ici au Burkina !",
    rating: 5
  }
];

export default function TestimonialsSection() {
  const [open, setOpen] = useState(false);

  const { data: approved = [] } = useQuery({
    queryKey: ['testimonials-approved'],
    queryFn: () => base44.entities.Testimonial.filter({ status: 'approved' }, '-created_date', 9),
  });

  const list = approved.length > 0 ? approved : FALLBACK;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B1F3B] dark:text-gray-100">Ils ont transformé leur carrière</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Témoignages de nos apprenants</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-5 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FFF3E8] dark:hover:bg-orange-950/30 dark:border-orange-500 dark:text-orange-400">
              <PenLine className="w-4 h-4 mr-2" />
              Partager mon expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Partage ton expérience</DialogTitle>
            </DialogHeader>
            <TestimonialSubmitForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {list.map((t, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all relative">
            <Quote className="w-8 h-8 text-[#FF6B00]/10 dark:text-orange-500/20 absolute top-4 right-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center text-white font-bold text-lg">
                {t.user_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <h4 className="font-bold text-[#1B1F3B] dark:text-gray-100 text-sm">{t.user_name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{[t.role, t.city].filter(Boolean).join(' • ')}</p>
              </div>
            </div>
            <div className="flex mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200 dark:text-gray-600'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}