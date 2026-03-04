import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const PHOTO_URL =
  "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/1d27eeac-7db6-458f-b2bf-43ffdf5d69a8.png";

export const TG_LINK = "http://t.me/Niggalotov";
export const VK_LINK = "https://vk.com/niggalotovads";

export const ymGoal = (goal: string) => {
  if (typeof window !== "undefined" && window.ym) window.ym(107132209, "reachGoal", goal);
};

const CERTIFICATES = [
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/2ac02c1f-1403-4bd3-83af-ebcc0cf7786d.jpg",
    title: "Диплом бакалавра",
    subtitle: "СибГУ им. Решетнёва · Реклама и связи с общественностью · 2019",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/d4ff8f48-d784-4e46-8d39-089654836694.jpg",
    title: "Диплом о профессиональной переподготовке",
    subtitle: "Московский Политех · Специалист по интернет-маркетингу · 2025",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/5ce99a05-bd8e-440f-8917-55e4741cf0c7.jpg",
    title: "Сертификат специалиста Яндекс Директ",
    subtitle: "Яндекс · Базовый уровень · Активен до 13.11.2025",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/7c95c396-e130-4cef-9a50-f6123fa67748.jpg",
    title: "Сертификат специалиста по медийной рекламе",
    subtitle: "Яндекс · Медийная реклама · До 12.11.2025",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/f53f9dd5-a74f-4064-8342-adc610be59b6.jpg",
    title: "Сертификат VK Реклама",
    subtitle: "VK Бизнес · Сертифицированный специалист · До 07.11.2025",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/2e517d86-65bb-4b0e-8214-cd1a0bd0ad9b.jpg",
    title: "Сертификат специалиста Яндекс Директ (Продвинутый)",
    subtitle: "Яндекс · Продвинутый уровень · Активен до 24.12.2025",
  },
  {
    url: "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/63dabb27-15ad-41be-bab8-3f4b7d27868e.jpg",
    title: "Сертификат Digit Education",
    subtitle: "Индивидуальное обучение контекстной рекламе в Яндекс · 2024",
  },
];

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_accepted");
    if (!accepted) {
      setTimeout(() => setVisible(true), 1200);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_accepted", "1");
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%] sm:max-w-xl animate-fade-up">
      <div className="bg-black text-white sm:rounded-xl px-6 py-5 flex flex-row items-center gap-4 shadow-2xl border-t border-white/10 sm:border-0">
        <p className="text-sm text-white/70 flex-1 leading-relaxed">
          Используя сайт, вы соглашаетесь на{" "}
          <a href="https://docs.google.com/document/d/1uFpCBLW2_61i4GgncqMK_nA8yw5xfg9Av4JGq9NZ1rY/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#FEEB19" }}>обработку персональных данных</a>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 font-bold text-sm px-5 py-3 rounded-lg transition-all active:scale-95 whitespace-nowrap"
          style={{ background: "#FEEB19", color: "#000" }}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Обо мне", href: "#about" },
    { label: "Услуги", href: "#services" },
    { label: "Кейсы", href: "#cases" },
    { label: "Сертификаты", href: "#certificates" },
    { label: "Отзывы", href: "#reviews" },
    { label: "Калькулятор", href: "#calculator" },
    { label: "Контакты", href: "#contacts" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #f0f0f0" : "none",
      }}
    >
      <div className="container-narrow flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center">
          <img
            src="https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/dd45e3fd-28fc-47b2-985a-e7d2baded4ea.png"
            alt="NikolotovADS"
            className="h-10 w-auto object-contain"
          />
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={TG_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex btn-primary text-sm py-3 px-6"
          onClick={() => ymGoal("Переход Консультация")}
        >
          Консультация
        </a>
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-base font-medium" onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-3 px-6 w-fit" onClick={() => ymGoal("Переход Консультация")}>
            Консультация
          </a>
        </div>
      )}
    </header>
  );
}

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center pt-20 bg-white">
      <div className="container-narrow w-full py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="tag mb-6"
              style={{ opacity: 0, animation: "fade-up 0.6s 0.1s ease-out forwards" }}
            >
              Специалист по рекламе
            </div>
            <h1
              className="hero-title text-left px-0 mx-0 my-0 py-0 text-6xl"
              style={{ opacity: 0, animation: "fade-up 0.7s 0.25s ease-out forwards" }}
            >Специалист по рекламе из Сибири</h1>
            <div
              className="text-gray-500 text-lg leading-relaxed max-w-md px-0 mx-0 my-[13px] py-4 text-left font-normal flex flex-col gap-3"
              style={{ opacity: 0, animation: "fade-up 0.7s 0.4s ease-out forwards" }}
            >
              <p>Привет! Меня зовут Алексей, я специалист по рекламе из Сибири.</p>
              <p>Привожу клиентов с онлайн-источников: Яндекс Директ, Телеграм, VK реклама и не только.</p>
              <p>Помогу настроить сквозную аналитику и опрозрачить входящий поток. Научу измерять результаты.</p>
              <p>Более 6 лет опыта и 50 000 000 ₽+ открученного бюджета.</p>
            </div>
            <div
              className="flex flex-wrap gap-4"
              style={{ opacity: 0, animation: "fade-up 0.7s 0.55s ease-out forwards" }}
            >
              <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" onClick={() => ymGoal("Переход в Телеграм")}>
                <Icon name="MessageCircle" size={18} />
                Написать в Telegram
              </a>
              <a href="#cases" className="btn-outline">
                Смотреть кейсы
              </a>
            </div>
          </div>

          <div
            className="flex justify-center md:justify-end"
            style={{ opacity: 0, animation: "fade-in 0.9s 0.4s ease-out forwards" }}
          >
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-3xl"
                style={{ background: "#FEEB19", zIndex: 0 }}
              />
              <img
                src={PHOTO_URL}
                alt="Алексей Николотов"
                className="relative w-72 md:w-[420px] object-cover object-top"
                style={{ borderRadius: "20px", zIndex: 1, height: "520px" }}
              />
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-base font-bold px-6 py-3 rounded-full whitespace-nowrap"
                style={{ zIndex: 2 }}
              >
                Алексей Николотов
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Certificates() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setLightbox(null);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <section id="certificates" className="section-padding bg-white overflow-hidden">
      <div className="container-narrow">
        <div className="text-center mb-10 animate-on-scroll">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3 block">Документы</span>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Сертификаты и дипломы</h2>
        </div>

        <div className="animate-on-scroll" data-delay="100" style={{ padding: "20px 0 30px" }}>
          <Carousel
            setApi={setApi}
            opts={{ align: "center", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4" style={{ overflow: "visible" }}>
              {CERTIFICATES.map((cert, i) => (
                <CarouselItem
                  key={i}
                  className="pl-4 basis-[80%] sm:basis-[55%] md:basis-[42%] lg:basis-[32%]"
                  style={{ overflow: "visible" }}
                >
                  <div
                    className="cursor-zoom-in group"
                    style={{
                      transition: "all 0.4s ease",
                      transform: i === current ? "scale(1)" : "scale(0.82)",
                      opacity: i === current ? 1 : 0.5,
                      transformOrigin: "center center",
                    }}
                    onClick={() => setLightbox(cert.url)}
                  >
                    <div
                      className="rounded-2xl bg-gray-50 transition-shadow duration-300"
                      style={{
                        boxShadow: i === current
                          ? "0 20px 60px rgba(0,0,0,0.18)"
                          : "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div className="overflow-hidden rounded-t-2xl" style={{ height: "380px" }}>
                        <img
                          src={cert.url}
                          alt={cert.title}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <div className="font-semibold text-sm text-black leading-tight">{cert.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{cert.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-6">
              <CarouselPrevious className="static translate-y-0 bg-black text-white hover:bg-black/80 border-none" />
              <div className="flex gap-2">
                {Array.from({ length: count }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ background: i === current ? "#FEEB19" : "rgba(0,0,0,0.2)" }}
                  />
                ))}
              </div>
              <CarouselNext className="static translate-y-0 bg-black text-white hover:bg-black/80 border-none" />
            </div>
          </Carousel>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <Icon name="X" size={32} />
          </button>
          <img
            src={lightbox}
            alt="Документ"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}