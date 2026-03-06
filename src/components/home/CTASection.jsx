import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B00] to-[#FF9A44] rounded-3xl p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center max-w-2xl mx-auto">
          <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Prêt à transformer ta carrière ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Rejoins +10 000 apprenants burkinabè qui développent leurs compétences avec FasoCademy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl('Catalog')}>
              <Button size="lg" className="bg-white text-[#FF6B00] hover:bg-gray-100 font-bold px-8 h-12 text-base w-full sm:w-auto">
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}