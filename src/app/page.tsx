import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CaseSuccess from '@/components/CaseSucess';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Princing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <Hero />
      <CaseSuccess />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}