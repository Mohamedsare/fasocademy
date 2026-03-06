import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import CourseCard from '@/components/common/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedCourses({ courses, isLoading, title = "Formations populaires", subtitle = "Les cours les plus suivis par notre communauté" }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B1F3B]">{title}</h2>
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </div>
        <Link to={createPageUrl('Catalog')} className="hidden md:flex items-center gap-1 text-[#FF6B00] font-semibold text-sm hover:underline">
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}