import { useEffect } from "react";
import { CookieBanner, Navbar, Hero, Certificates } from "@/components/sections/TopSections";
import { About, Services, Cases } from "@/components/sections/AboutSections";
import { Reviews, Calculator, Bonuses, Contacts, Footer } from "@/components/sections/BottomSections";

declare global { interface Window { ym?: (id: number, action: string, goal: string) => void; } }

function useScrollAnimation() {
  useEffect(() => {
    const els = document.querySelectorAll(".animate-on-scroll, .animate-on-scroll-left");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
            setTimeout(() => el.classList.add("visible"), delay);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Index() {
  useScrollAnimation();

  return (
    <div className="font-golos">
      <CookieBanner />
      <Navbar />
      <Hero />
      <Certificates />
      <About />
      <Services />
      <Cases />
      <Reviews />
      <Calculator />
      <Bonuses />
      <Contacts />
      <Footer />
    </div>
  );
}
