import Icon from "@/components/ui/icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TG_LINK, VK_LINK, ymGoal } from "./TopSections";

export function About() {
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
            <p className="text-white/60 text-lg leading-relaxed mb-10">Всё прозрачно: ежемесячные отчёты, постоянная оптимизация и контроль состояния рекламы. Не просто «трафик», осознанный подход к лидогенерации, а также -  помощь в построении нормальной сквозной аналитики</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-on-scroll" data-delay="150">
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
                <div className="font-bold mb-2 text-base leading-tight">{item.title}</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
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
    {
      icon: "PenTool",
      title: "Создание логотипа",
      price: "от 20 000 ₽",
      desc: "Разработка уникального визуального символа бренда, который формирует узнаваемость компании и усиливает доверие к бизнесу.",
      features: ["Анализ ниши и позиционирования", "Разработка концепции логотипа", "Создание нескольких вариантов дизайна"],
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
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" onClick={() => ymGoal("Переход в Телеграм")}>
            <Icon name="MessageCircle" size={18} />
            Обсудить проект
          </a>
        </div>
      </div>
    </section>
  );
}

export function Cases() {
  const cases = [
    {
      tag: "Недвижимость",
      title: "ЖК «Дюна» — риелтор",
      result: "122 заявки",
      budget: "Бюджет: 57 500 ₽",
      cpa: "CPA: 471 ₽",
      bg: "#FBEF64",
      accent: "#1a1a1a",
      resultColor: "#1a1a1a",
      desc: "Запустил VK рекламу, получили заявки по низкой цене и продажу, с которой риелтор получил 600 000 ₽ комиссии.",
    },
    {
      tag: "Образование",
      title: "Автошкола «Перекрёсток»",
      result: "124 заявки",
      budget: "Бюджет: 143 510 ₽",
      cpa: "CPA: 941 ₽",
      bg: "#111111",
      accent: "#ffffff",
      resultColor: "#FBEF64",
      desc: "Реклама в Яндекс Директ в низкий спрос. При тратах в 2 раза меньше конкурентов — результаты по CPA в 2,5 раза лучше.",
    },
    {
      tag: "Промышленность",
      title: "ИТЦ Сибирь",
      result: "27 заявок",
      budget: "Бюджет: 43 794 ₽",
      cpa: "CPA: 1 622 ₽",
      bg: "#64C1FB",
      accent: "#0a2a3d",
      resultColor: "#fff",
      desc: "Реклама в Яндекс Директ. Поисковая кампания на микроконверсиях принесла живые заявки по низкой стоимости для этой ниши.",
    },
    {
      tag: "Недвижимость",
      title: "Загородные дома",
      result: "82 заявки",
      budget: "Бюджет: 46 083 ₽",
      cpa: "CPA: 562 ₽",
      bg: "#91B584",
      accent: "#1a2e15",
      resultColor: "#fff",
      desc: "Генерация клиентов по загородной недвижимости в Красноярске через VK рекламу.",
    },
    {
      tag: "Элитная недвижимость",
      title: "Дома канадской рубки",
      result: "19 заявок",
      budget: "Бюджет: 75 306 ₽",
      cpa: "CPA: 3 963 ₽",
      bg: "#f7f4ee",
      accent: "#2a1f0e",
      resultColor: "#2a1f0e",
      desc: "Генерация клиентов через Яндекс Директ. Поиск и РСЯ. Красноярский край.",
    },
    {
      tag: "Агентство недвижимости",
      title: "Реклама новостроек",
      result: "47 заявок",
      budget: "Бюджет: 31 556 ₽",
      cpa: "CPA: 671 ₽",
      bg: "#111111",
      accent: "#ffffff",
      resultColor: "#64C1FB",
      desc: "Таргетированная реклама в VK. Лид-формы + клипы. Заявки значительно ниже бенчей без потери в конверсии в квал лид.",
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
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full animate-on-scroll"
        >
          <CarouselContent className="-ml-4">
            {cases.map((c) => (
              <CarouselItem key={c.title} className="pl-4 md:basis-1/3">
                <div
                  className="case-card h-full"
                  style={{
                    background: c.bg,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 60px rgba(0,0,0,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div className="p-8" style={{ color: c.accent }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">{c.tag}</div>
                    <h3 className="text-2xl font-black mb-2">{c.title}</h3>
                    <div className="text-5xl font-black mb-1" style={{ color: c.resultColor }}>
                      {c.result}
                    </div>
                    <p className="text-sm leading-relaxed mt-4 mb-6" style={{ opacity: 0.6 }}>{c.desc}</p>
                    <div
                      className="flex gap-3 text-xs font-semibold pt-4 flex-wrap"
                      style={{ borderTop: `1px solid ${c.accent === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`, opacity: 0.65 }}
                    >
                      <span>{c.budget}</span>
                      <span>·</span>
                      <span>{c.cpa}</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-3 mt-8">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
        <div className="mt-12 text-center animate-on-scroll">
          <a
            href={VK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
            onClick={() => ymGoal("Переход в VK")}
          >
            <Icon name="ExternalLink" size={16} />
            Смотреть все кейсы в VK
          </a>
        </div>
      </div>
    </section>
  );
}