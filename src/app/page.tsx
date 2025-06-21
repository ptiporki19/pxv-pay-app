'use client'

import Link from 'next/link'
import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Stats from '@/components/landing/Stats'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import BlogBlocks from '@/components/landing/BlogBlocks'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {/* Essential Background System - No Scroll Effects */}
      <AmbientLighting />
      <DepthLayers />
      <GradientOverlay />
      <BackgroundEffects />
      <PaymentShapes />
      <ParticleField />
      <GeometricAccents />
      
      <Header />
      <main>
        {/* 1. Hero - No background (shows animations) */}
        <Hero />
        
        {/* 2. Features - Light violet background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <Features />
        </div>
        
        {/* 3. Stats - No background (shows animations) */}
        <Stats />
        
        {/* 4. HowItWorks - Light violet background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <HowItWorks />
        </div>
        
        {/* 5. Testimonials - No background (shows animations) */}
        <Testimonials />
        
        {/* 6. BlogBlocks - Light violet background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <BlogBlocks />
        </div>
        
        {/* 7. CTA - No background (shows animations) */}
        <CTA />
      </main>
      
      {/* Footer - Always has light violet background */}
      <Footer />
    </div>
  );
} 