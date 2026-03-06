import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, Zap, Users, ArrowRight, Timer } from 'lucide-react';

export default function PackCard({ pack, onBuy }) {
  const savings = pack.total_price_cfa - pack.pack_price_cfa;
  const daysLeft = pack.expires_at
    ? Math.max(0, Math.ceil((new Date(pack.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="relative bg-gradient-to-br from-[#1B1F3B] to-[#252A4A] rounded-2xl overflow-hidden border border-white/10 text-white flex flex-col">
      {/* Urgency banner */}
      {daysLeft !== null && daysLeft <= 7 && (
        <div className="bg-red-500 text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1.5">
          <Timer className="w-3.5 h-3.5" />
          Offre expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''} !
        </div>
      )}

      {/* Discount badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-[#FF6B00] text-white text-sm font-extrabold w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg">
          <span>-{pack.discount_percent}%</span>
        </div>
      </div>

      {/* Thumbnail */}
      {pack.thumbnail_url && (
        <div className="relative aspect-video">
          <img src={pack.thumbnail_url} alt={pack.title} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-[#1B1F3B]/50 to-transparent" />
          <div className="absolute bottom-3 left-4">
            {pack.badge_label && (
              <Badge className="bg-[#FF6B00] text-white border-0 text-xs font-bold">
                <Zap className="w-3 h-3 mr-1" />
                {pack.badge_label}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-extrabold mb-2 leading-tight">{pack.title}</h3>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{pack.description}</p>

        {/* Course list */}
        <div className="space-y-1.5 mb-4">
          {(pack.course_titles || []).slice(0, 4).map((title, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] shrink-0" />
              <span className="truncate">{title}</span>
            </div>
          ))}
          {(pack.course_titles?.length || 0) > 4 && (
            <p className="text-xs text-gray-400 pl-3.5">+{pack.course_titles.length - 4} autres cours</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{pack.course_ids?.length || 0} cours</span>
          {pack.total_hours > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pack.total_hours}h</span>}
          {pack.total_purchases > 0 && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{pack.total_purchases} achats</span>}
        </div>

        {/* Pricing */}
        <div className="mt-auto">
          <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-extrabold text-white">
                  {pack.pack_price_cfa?.toLocaleString('fr-FR')} CFA
                </div>
                {pack.total_price_cfa && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span className="line-through">{pack.total_price_cfa.toLocaleString('fr-FR')} CFA</span>
                    <span className="text-[#00C9A7] ml-2 font-semibold">
                      Économisez {savings.toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                )}
              </div>
              <Award className="w-6 h-6 text-[#00C9A7]" />
            </div>
          </div>

          <Button
            onClick={() => onBuy && onBuy(pack)}
            className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white font-bold h-11 cta-pulse"
          >
            Obtenir le pack
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}