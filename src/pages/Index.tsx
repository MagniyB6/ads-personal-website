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

const TG_LINK = "http://t.me/Niggalotov";
const VK_LINK = "https://vk.com/niggalotovads";

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

function CookieBanner() {
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-fade-up">
      <div className="bg-black text-white rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <p className="text-sm text-white/70 flex-1 leading-relaxed">
          Используя сайт, вы соглашаетесь на{" "}
          <span className="underline cursor-pointer" style={{ color: "#FEEB19" }}>обработку персональных данных</span>.
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

function Navbar() {
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
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-3 px-6 w-fit">
            Консультация
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
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
              <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary">
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
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap"
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

function Certificates() {
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

function About() {
  return (
    <section id="about" className="section-padding bg-black text-white">
      <div className="container-narrow">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-on-scroll">
            <div className="tag mb-6">Обо мне</div>
            <h2 className="section-title mb-6">
              Помогаю бизнесу<br />
              <span style={{ color: "#FEEB19" }}>расти через рекламу</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">Специализируюсь на онлайн источниках трафика Яндекс Директ и VK Рекламе и других. Помимо рекламы закрываю и вопросы дизайна для проекта.</p>
            <p className="text-white/60 text-lg leading-relaxed mb-10">Всё прозрачно: ежемесячные отчёты, постоянная оптимизация и контроль состояния рекламы. Не просто «трафик», а помощь в построении нормальной сквозной аналитики

</p>
            <div className="flex flex-wrap gap-3">
              {["VK Реклама", "Яндекс Директ", "Реклама в Телеграм", "Аналитика", "Дизайн"].map((t) => (
                <span
                  key={t}
                  className="text-sm font-medium px-4 py-2 rounded-full"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 animate-on-scroll" data-delay="150">
            {[
              { icon: "Target", title: "Экспертный подход", text: "Нахожу эффективные связки, которые приводят к стабильным результатам KPI" },
              { icon: "TrendingUp", title: "Контроль", text: "Постоянный контроль рекламных кампаний и внесение корректировок для достижения планов" },
              { icon: "BarChart3", title: "Отчётность", text: "Понятные отчёты с реальными цифрами каждый месяц" },
              { icon: "Zap", title: "Быстрый старт", text: "Запуск первых кампаний в течение 3 рабочих дней" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="mb-3 p-2.5 rounded-lg w-fit" style={{ background: "#FEEB19" }}>
                  <Icon name={item.icon} size={18} color="#000" />
                </div>
                <div className="font-bold mb-2 text-xs sm:text-base leading-tight">{item.title}</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      icon: "Zap",
      title: "VK реклама",
      price: "от 30 000 ₽/мес",
      desc: "Реклама через новый кабинет под ключ. От создания креатива до построения аналитики.",
      features: ["Настройка рекламных кампаний", "Подготовка визуала для рекламы", "Создание аудиторий", "Оптимизация РК"],
    },
    {
      icon: "BarChart3",
      title: "Аудит рекламных кампаний",
      price: "от 5 000 ₽",
      desc: "Полная аналитика рекламного кабинета с отчетом и рекомендациями.",
      features: ["Анализ кампаний", "Полный отчет", "Рекомендации"],
    },
    {
      icon: "Users",
      title: "Стратегия и консалтинг",
      price: "от 100 000 ₽",
      desc: "Разработка стратегии продвижения: какие площадки выбрать, как выстроить воронку, как снизить стоимость заявки.",
      features: ["Анализ ниши", "Стратегия продвижения", "Структура воронки", "Медиаплан"],
    },
    {
      icon: "Search",
      title: "Реклама в Яндекс Директ",
      price: "от 30 000 ₽/мес",
      desc: "Реклама в одном из самых «горячих» онлайн источников входящего потока.",
      features: ["Построение структуры кампаний", "Сбор семантики", "Контроль и оптимизация", "Работа по обучению стратегий"],
    },
    {
      icon: "Palette",
      title: "Дизайн",
      price: "по договорённости",
      desc: "Решение по дизайну для вашей компании от логотипа до графических баннеров и ИИ видео.",
      features: ["Работа с ИИ", "Графический дизайн", "Полиграфия", "Логотип"],
    },
  ];

  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-narrow">
        <div className="mb-16 animate-on-scroll">
          <div className="tag mb-4">Услуги</div>
          <h2 className="section-title">Чем я могу быть полезен</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div key={s.title} className="card-service animate-on-scroll" data-delay={`${i * 100}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg" style={{ background: "#FEEB19" }}>
                  <Icon name={s.icon} size={22} />
                </div>
                <span className="font-bold text-sm text-gray-600">{s.price}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>
              <ul className="flex flex-col gap-2.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FEEB19" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center animate-on-scroll">
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Icon name="MessageCircle" size={18} />
            Обсудить проект
          </a>
        </div>
      </div>
    </section>
  );
}

function Cases() {
  const cases = [
    {
      tag: "Недвижимость",
      title: "ЖК «Дюна» — риелтор",
      result: "122 заявки",
      budget: "Бюджет: 57 500 ₽",
      cpa: "CPA: 471 ₽",
      bg: "#FEEB19",
      accent: "#000",
      desc: "Запустил VK рекламу, получили заявки по низкой цене и продажу, с которой риелтор получил 600 000 ₽ комиссии.",
    },
    {
      tag: "Образование",
      title: "Автошкола «Перекрёсток»",
      result: "124 заявки",
      budget: "Бюджет: 143 510 ₽",
      cpa: "CPA: 941 ₽",
      bg: "#000",
      accent: "#FEEB19",
      desc: "Реклама в Яндекс Директ в низкий спрос. При тратах в 2 раза меньше конкурентов — результаты по CPA в 2,5 раза лучше.",
    },
    {
      tag: "Промышленность",
      title: "ИТЦ Сибирь",
      result: "27 заявок",
      budget: "Бюджет: 43 794 ₽",
      cpa: "CPA: 1 622 ₽",
      bg: "#f5f5f5",
      accent: "#000",
      desc: "Реклама в Яндекс Директ. Поисковая кампания на микроконверсиях принесла живые заявки по низкой стоимости для этой ниши.",
    },
  ];

  return (
    <section id="cases" className="section-padding" style={{ background: "#fafafa" }}>
      <div className="container-narrow">
        <div className="mb-16 animate-on-scroll">
          <div className="tag mb-4">Кейсы</div>
          <h2 className="section-title">
            Результаты,<br />
            <span className="yellow-line">которые говорят сами за себя</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <div
              key={c.title}
              className="case-card animate-on-scroll"
              data-delay={`${i * 120}`}
              style={{
                background: c.bg,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = c.bg === "#000"
                  ? "0 24px 60px rgba(254,235,25,0.25)"
                  : "0 24px 60px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div className="p-8" style={{ color: c.accent }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">{c.tag}</div>
                <h3 className="text-2xl font-black mb-2">{c.title}</h3>
                <div className="text-5xl font-black mb-1" style={{ color: c.bg === "#FEEB19" ? "#000" : "#FEEB19" }}>
                  {c.result}
                </div>
                <p className="text-sm leading-relaxed mt-4 mb-6" style={{ opacity: 0.55 }}>{c.desc}</p>
                <div
                  className="flex gap-3 text-xs font-semibold pt-4 flex-wrap"
                  style={{ borderTop: `1px solid ${c.bg === "#000" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, opacity: 0.6 }}
                >
                  <span>{c.budget}</span>
                  <span>·</span>
                  <span>{c.cpa}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center animate-on-scroll">
          <a
            href={VK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
          >
            <Icon name="ExternalLink" size={16} />
            Смотреть все кейсы в VK
          </a>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const reviews = [
    {
      name: "Дмитрий Б.",
      role: "Директор автошколы «Перекрёсток»",
      text: "Понравилось сотрудничать с Алексеем, всегда на связи, помог настроить рекламу с 0 и уже в первый месяц мы получили первые сделки.",
    },
    {
      name: "Кристина А.",
      role: "Менеджер проекта по промышленным станкам",
      text: "Очень хорошая обратная связь по последнему запуску, было много звонков и запросов, спасибо тебе!",
    },
    {
      name: "Василий М.",
      role: "Руководитель агентства недвижимости",
      text: "Приятно говорить со специалистом, который говорит на языке цифр и приносит результаты.",
    },
    {
      name: "Олег С.",
      role: "Владелец интернет-магазина",
      text: "Работаем уже второй год. За это время выстроили нормальную аналитику, понимаем откуда приходят клиенты и сколько стоит каждый. Рекомендую.",
    },
  ];

  return (
    <section id="reviews" className="section-padding bg-white">
      <div className="container-narrow">
        <div className="mb-16 animate-on-scroll">
          <div className="tag mb-4">Отзывы</div>
          <h2 className="section-title">
            Что говорят<br />
            <span className="yellow-line">клиенты обо мне</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div key={r.name} className="review-card animate-on-scroll" data-delay={`${i * 100}`}>
              <div className="flex items-center gap-1 mb-5">
                {[1,2,3,4,5].map((j) => (
                  <Icon key={j} name="Star" size={16} style={{ color: "#FEEB19", fill: "#FEEB19" }} />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 text-base">«{r.text}»</p>
              <div>
                <div className="font-bold text-sm">{r.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Calculator() {
  const [cpa, setCpa] = useState("");
  const [source, setSource] = useState("vk");
  const [leads, setLeads] = useState("");
  const [showConsult, setShowConsult] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const SERVICE_FEE = 30000;
  const VAT = 0.22;

  const adBudget = cpa && leads ? Math.ceil(parseFloat(cpa) * parseInt(leads)) : 0;
  const adBudgetWithVat = Math.ceil(adBudget * (1 + VAT));
  const total = adBudgetWithVat + SERVICE_FEE;

  const handleCalc = () => {
    if (!cpa || !leads) {
      setShowConsult(true);
      return;
    }
    setCalculated(true);
  };

  const reset = () => {
    setCpa("");
    setLeads("");
    setCalculated(false);
    setShowConsult(false);
  };

  return (
    <section id="calculator" className="section-padding bg-black text-white">
      <div className="container-narrow">
        <div className="mb-16 animate-on-scroll">
          <div className="tag mb-4">Калькулятор бюджета</div>
          <h2 className="section-title text-white">
            Рассчитайте<br />
            <span style={{ color: "#FEEB19" }}>ваш бюджет</span>
          </h2>
          <p className="text-white/50 mt-4 text-lg max-w-lg">
            Укажите параметры — получите примерную стоимость рекламной кампании под вашу цель.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="animate-on-scroll flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-3">Рекламная площадка</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "vk", label: "VK реклама" },
                  { val: "yandex", label: "Яндекс Директ" },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setSource(s.val)}
                    className="py-4 px-4 rounded-lg font-semibold text-sm transition-all"
                    style={
                      source === s.val
                        ? { background: "#FEEB19", color: "#000" }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Стоимость CPA (целевого действия), ₽
              </label>
              <input
                type="number"
                placeholder="Например: 500"
                value={cpa}
                onChange={(e) => { setCpa(e.target.value); setCalculated(false); }}
                className="input-field"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
              />
              <p className="text-white/30 text-xs mt-2">Если не знаете — оставьте пустым и нажмите «Рассчитать»</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Желаемое количество заявок в месяц
              </label>
              <input
                type="number"
                placeholder="Например: 100"
                value={leads}
                onChange={(e) => { setLeads(e.target.value); setCalculated(false); }}
                className="input-field"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCalc}
                className="flex-1 py-4 font-bold text-black rounded-lg transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#FEEB19" }}
              >
                Рассчитать бюджет
              </button>
              {calculated && (
                <button
                  onClick={reset}
                  className="px-5 py-4 rounded-lg font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          <div className="animate-on-scroll" data-delay="150">
            {calculated ? (
              <div
                className="rounded-2xl p-8"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(254,235,25,0.25)" }}
              >
                <div className="text-xs font-bold text-white/40 mb-8 uppercase tracking-widest">Расчёт бюджета</div>
                <div className="flex flex-col gap-5">
                  {[
                    { label: "Площадка", value: source === "vk" ? "VK реклама" : "Яндекс Директ" },
                    { label: "CPA (1 заявка)", value: `${parseFloat(cpa).toLocaleString("ru")} ₽` },
                    { label: "Заявок в месяц", value: `${parseInt(leads).toLocaleString("ru")} шт` },
                    { label: "Рекламный бюджет (с НДС 22%)", value: `${adBudgetWithVat.toLocaleString("ru")} ₽` },
                    { label: "Стоимость ведения", value: `${SERVICE_FEE.toLocaleString("ru")} ₽` },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center pb-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <span className="text-white/50 text-sm">{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">Итого в месяц</span>
                    <span className="font-black text-3xl" style={{ color: "#FEEB19" }}>
                      {total.toLocaleString("ru")} ₽
                    </span>
                  </div>
                  <p className="text-white/25 text-xs mt-1">* Рекламный бюджет указан с учётом НДС 22%</p>
                </div>
                <a
                  href={TG_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full flex items-center justify-center gap-2 py-4 font-bold text-black rounded-lg transition-all hover:opacity-90"
                  style={{ background: "#FEEB19" }}
                >
                  <Icon name="MessageCircle" size={18} />
                  Обсудить в Telegram
                </a>
              </div>
            ) : (
              <div
                className="rounded-2xl p-8 min-h-64 flex flex-col justify-between"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)" }}
              >
                <div>
                  <div className="text-6xl font-black mb-4" style={{ color: "#FEEB19" }}>?</div>
                  <p className="text-white/40 text-lg leading-relaxed">
                    Заполните форму слева, чтобы увидеть расчёт рекламного бюджета под вашу задачу.
                  </p>
                </div>
                <p className="text-white/25 text-sm mt-8">
                  Не знаете CPA? Нажмите «Рассчитать» — я помогу определить его на бесплатной консультации.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConsult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowConsult(false)}
        >
          <div
            className="bg-white rounded-2xl p-10 max-w-md w-full text-black"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scale-in 0.3s ease-out forwards" }}
          >
            <div className="text-4xl mb-5">🤝</div>
            <h3 className="text-2xl font-black mb-3">Не знаете данные?</h3>
            <p className="text-gray-500 leading-relaxed mb-8">
              Это нормально — у большинства новых клиентов ещё нет статистики. На бесплатной консультации
              я помогу определить реалистичный CPA для вашей ниши и рассчитаю бюджет.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={TG_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary justify-center w-full"
              >
                <Icon name="MessageCircle" size={18} />
                Написать в Telegram
              </a>
              <button
                onClick={() => setShowConsult(false)}
                className="text-gray-400 text-sm py-2 hover:text-black transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Bonuses() {
  const tools = [
    {
      name: "BotFAQtor",
      desc: "Защищает от ботов и скликивания, помогает увеличить конверсию и снизить стоимость лида",
      economy: "Экономия 10 000 ₽/мес",
      bg: "#fff",
    },
    {
      name: "Марквиз",
      desc: "Онлайн-конструктор квизов, опросов, лендингов, форм контактов и не только",
      economy: "Экономия от 2 000 ₽/мес",
      bg: "#fff",
    },
    {
      name: "Callibri",
      desc: "Автоматизация работы с лидами на всех этапах: коллтрекинг, email-трекинг и попапы",
      economy: null,
      bg: "#fff",
    },
    {
      name: "LOKTAR",
      desc: "Автоматизация рутинных операций по таргетированной рекламе во ВКонтакте",
      economy: "Экономия 35 880 ₽/год",
      bg: "#fff",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-narrow">
        <div className="mb-12 animate-on-scroll">
          <div className="tag mb-4">Бонусы</div>
          <h2 className="section-title mb-4">Помогаю не только заработать,<br /><span className="yellow-line">но и сэкономить</span></h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mt-6">
            Работая со мной при тратах бюджета от 20 000 рублей вы получите бесплатно доступ к маркетплейсу инструментов, например:
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-2xl p-6 flex flex-col gap-3 animate-on-scroll"
              style={{
                border: "1px solid #e5e5e5",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(254,235,25,0.3)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#FEEB19";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e5e5";
              }}
            >
              <div className="font-black text-lg">{tool.name}</div>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{tool.desc}</p>
              {tool.economy && (
                <div
                  className="text-xs font-bold px-3 py-1.5 rounded-full w-fit"
                  style={{ background: "#FEEB19", color: "#000" }}
                >
                  {tool.economy}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-6 animate-on-scroll">И другие сервисы</p>
      </div>
    </section>
  );
}

function Contacts() {
  const socials = [
    { icon: "Send", label: "Telegram", handle: "@Niggalotov", href: TG_LINK },
    { icon: "Users", label: "ВКонтакте", handle: "vk.com/niggalotovads", href: VK_LINK },
  ];

  return (
    <section id="contacts" className="section-padding bg-white">
      <div className="container-narrow">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="animate-on-scroll">
            <div className="tag mb-4">Контакты</div>
            <h2 className="section-title mb-6">
              Готовы к<br />
              <span className="yellow-line">запуску?</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              Напишите мне — обсудим задачу, расскажу как могу помочь и сделаю расчёт бюджета.
            </p>
            <div className="flex flex-col gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-xl hover-lift group"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  <div className="p-3 rounded-xl" style={{ background: "#FEEB19" }}>
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-gray-400 text-sm">{s.handle}</div>
                  </div>
                  <Icon name="ArrowRight" size={16} className="ml-auto text-gray-300 group-hover:text-black transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-10 animate-on-scroll"
            data-delay="150"
            style={{ background: "#FEEB19" }}
          >
            <h3 className="text-2xl font-black mb-2">Бесплатная консультация</h3>
            <p className="text-black/60 mb-8 leading-relaxed">
              30 минут — разберём вашу задачу и я скажу, чего реально добиться с рекламой.
            </p>
            <div className="flex flex-col gap-4 mb-10">
              {[
                "Напишите в Telegram",
                "Расскажите о вашем проекте",
                "Получите план и расчёт бюджета",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: "#000", color: "#fff" }}
                  >
                    {i + 1}
                  </div>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
            <a
              href={TG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-black text-white font-bold py-4 px-8 rounded-lg transition-all w-full"
              style={{ transition: "all 0.25s ease" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#fff";
                (e.currentTarget as HTMLAnchorElement).style.color = "#000";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#000";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
            >
              <Icon name="MessageCircle" size={18} />
              Написать сейчас
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 bg-white" style={{ borderTop: "1px solid #f0f0f0" }}>
      <div className="container-narrow flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <img
          src="https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/dd45e3fd-28fc-47b2-985a-e7d2baded4ea.png"
          alt="NikolotovADS"
          className="h-8 w-auto object-contain"
        />
        <p className="text-gray-400">© 2025 · Алексей Николотов - Специалист по контекстной и таргетированной рекламе</p>
        <p className="text-gray-300 text-xs">Данные используются только для связи</p>
      </div>
    </footer>
  );
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