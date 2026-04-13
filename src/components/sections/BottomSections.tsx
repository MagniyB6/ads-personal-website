import { useState } from "react";
import Icon from "@/components/ui/icon";
import { TG_LINK, VK_LINK, ymGoal } from "./TopSections";

export function Reviews() {
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

export function Calculator() {
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
                onClick={() => { handleCalc(); ymGoal("Посчитал бюджет"); }}
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
                  onClick={() => ymGoal("Переход в Телеграм")}
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
                  <p className="text-white/40 text-lg leading-relaxed">Заполните форму, чтобы увидеть расчёт рекламного бюджета под вашу задачу.</p>
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
                onClick={() => ymGoal("Переход в Телеграм")}
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

export function Bonuses() {
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

export function Contacts() {
  const socials = [
    { icon: "Phone", label: "Телефон", handle: "+8 (999) 446-25-39", href: "tel:+89994462539" },
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
                  onClick={() => ymGoal(s.label === "Telegram" ? "Переход в Телеграм" : "Переход в VK")}
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

export function Footer() {
  return (
    <footer className="py-8 bg-white" style={{ borderTop: "1px solid #f0f0f0" }}>
      <div className="container-narrow flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <img
          src="https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/8e5fadfb-a0c9-4ba6-a4dd-0c37e4ef586a.jpg"
          alt="NikolotovADS"
          className="h-12 w-auto object-contain"
        />
        <p className="text-gray-400">© 2026 · Алексей Николотов - Специалист по контекстной и таргетированной рекламе</p>
        <p className="text-gray-300 text-xs">Данные используются только для связи</p>
      </div>
    </footer>
  );
}