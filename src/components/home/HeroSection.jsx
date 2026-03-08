import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, CheckCircle, Award } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1B1F3B] via-[#252A4A] to-[#1B1F3B] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#00C9A7]/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-40 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-white/80">
              <span className="w-2 h-2 bg-[#00C9A7] rounded-full animate-pulse" />
              Plateforme #1 au Burkina Faso
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Apprends.<br />
              <span className="gradient-text">Progresse.</span><br />
              Certifie-toi.
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
              Des formations pratiques en développement web, data, cybersécurité et plus. 
              Paiement Orange Money. Certificats reconnus. 100% en français.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to={createPageUrl('Catalog')}>
                <Button size="lg" className="bg-[#FF6B00] hover:bg-[#E55D00] text-white cta-pulse px-8 h-12 text-base font-bold w-full sm:w-auto">
                  Explorer les formations
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Catalog')} onClick={handleDemoClick}>
                <Button variant="outline" size="lg" className="border-2 border-white/50 bg-transparent !text-white hover:!text-white hover:bg-white/15 hover:border-white/70 h-12 w-full sm:w-auto font-semibold shadow-none">
                  <Play className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00C9A7]" />
                Paiement Mobile Money
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00C9A7]" />
                Certificats vérifiables
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00C9A7]" />
                Accès à vie
              </span>
            </div>
          </div>

          {/* Right - Stats cards */}
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent rounded-3xl" />
            <div className="relative space-y-4 p-6">
              {/* Main image card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" 
                  alt="Étudiants" 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">500+</div>
                    <div className="text-xs text-gray-400 mt-1">Formations</div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="text-2xl font-extrabold text-[#FF6B00]">10K+</div>
                    <div className="text-xs text-gray-400 mt-1">Apprenants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-[#00C9A7]">95%</div>
                    <div className="text-xs text-gray-400 mt-1">Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-[#00C9A7]/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#00C9A7]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1B1F3B] dark:text-gray-100">Certificat obtenu !</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Développement Web</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}