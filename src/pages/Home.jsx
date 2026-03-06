import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import WhyFasocademy from '@/components/home/WhyFasocademy';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  const { data: featuredCourses, isLoading } = useQuery({
    queryKey: ['courses-featured'],
    queryFn: () => base44.entities.Course.filter({ status: 'published', is_featured: true }, '-created_date', 8),
    initialData: [],
  });

  const { data: popularCourses, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['courses-popular'],
    queryFn: () => base44.entities.Course.filter({ status: 'published', is_bestseller: true }, '-total_students', 4),
    initialData: [],
  });

  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses 
        courses={featuredCourses} 
        isLoading={isLoading} 
        title="Formations en vedette"
        subtitle="Sélectionnées par notre équipe pour toi"
      />
      {popularCourses.length > 0 && (
        <FeaturedCourses 
          courses={popularCourses} 
          isLoading={isLoadingPopular} 
          title="🔥 Top ventes"
          subtitle="Les formations les plus populaires"
        />
      )}
      <WhyFasocademy />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}