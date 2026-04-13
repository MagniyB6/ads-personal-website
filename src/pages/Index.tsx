import { useEffect, useState } from "react";
import { CookieBanner, Navbar, Hero, Certificates } from "@/components/sections/TopSections";
import { About, Services, Cases } from "@/components/sections/AboutSections";
import { Reviews, Calculator, Bonuses, Contacts, Footer } from "@/components/sections/BottomSections";
import ChatBot from "@/components/ChatBot";
import Icon from "@/components/ui/icon";

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
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="font-golos">
      <CookieBanner />
      <Navbar onOpenChat={() => setChatOpen(true)} />
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

      {/* Кнопка-пузырь */}
      {!chatOpen && (
        <button
          onClick={() => { setChatOpen(true); window.ym?.(97865261, "reachGoal", "Chat_Bot_Open"); }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ background: "#FEEB19" }}
          aria-label="Открыть чат"
        >
          <Icon name="MessageCircle" size={26} />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"
          />
        </button>
      )}

      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}