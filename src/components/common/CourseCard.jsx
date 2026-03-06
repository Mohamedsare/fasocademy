import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Clock, Users, BookOpen, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CourseCard({ course }) {
  const discount = course.original_price_cfa && course.original_price_cfa > course.price_cfa
    ? Math.round((1 - course.price_cfa / course.original_price_cfa) * 100)
    : 0;

  return (
    <Link to={createPageUrl('CoursePage') + `?id=${course.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FF6B00]/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.is_free && (
              <Badge className="bg-[#00C9A7] text-white border-0 text-xs font-bold px-2.5 py-1">
                🎁 Gratuit
              </Badge>
            )}
            {!course.is_free && course.is_bestseller && (
              <Badge className="bg-[#FF6B00] text-white border-0 text-xs font-bold px-2.5 py-1">
                🔥 Top vente
              </Badge>
            )}
            {course.is_new && (
              <Badge className="bg-[#00C9A7] text-white border-0 text-xs font-bold px-2.5 py-1">
                Nouveau
              </Badge>
            )}
          </div>
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[#FF6B00] bg-[#FFF3E8] px-2 py-0.5 rounded-full capitalize">
              {course.category?.replace(/-/g, ' ') || 'Formation'}
            </span>
            <span className="text-xs text-gray-400 capitalize">{course.level || 'Débutant'}</span>
          </div>

          <h3 className="font-bold text-[#1B1F3B] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
            {course.title}
          </h3>

          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              {course.instructor_photo_url ? (
                <img src={course.instructor_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] text-xs font-bold">
                  {course.instructor_name?.[0] || 'F'}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 truncate">{course.instructor_name || 'Formateur'}</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            {course.duration_hours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />{course.duration_hours}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />{course.total_lessons || 0} leçons
            </span>
            {course.total_students > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />{course.total_students}
              </span>
            )}
          </div>

          {/* Rating */}
          {course.average_rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm font-bold text-[#F59E0B]">{course.average_rating.toFixed(1)}</span>
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(course.average_rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({course.total_reviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
            <div>
              {course.is_free ? (
                <span className="text-lg font-extrabold text-[#00C9A7]">Gratuit</span>
              ) : (
                <>
                  <span className="text-lg font-extrabold text-[#1B1F3B]">
                    {course.price_cfa?.toLocaleString('fr-FR')} CFA
                  </span>
                  {course.original_price_cfa && course.original_price_cfa > course.price_cfa && (
                    <span className="text-xs text-gray-400 line-through ml-2">
                      {course.original_price_cfa.toLocaleString('fr-FR')} CFA
                    </span>
                  )}
                </>
              )}
            </div>
            {course.has_certificate && (
              <Award className="w-4 h-4 text-[#00C9A7]" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}