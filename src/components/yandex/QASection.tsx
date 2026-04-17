import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

type QAItem = {
  question: string;
  answer: string;
};

type QAGroup = {
  label: string;
  items: QAItem[];
};

const QA_GROUPS: QAGroup[] = [
  {
    label: "Для рекламодателей",
    items: [
      {
        question: "Что такое Яндекс Директ и как он работает?",
        answer:
          "Яндекс Директ — это сервис, который позволяет размещать ваши рекламные объявления на поиске Яндекса, а также на тысячах сайтов-партнёров (Рекламная сеть Яндекса, РСЯ). Система показывает объявление тем пользователям, которые вводят релевантные запросы или проявляют интерес к вашим товарам/услугам. Оплата обычно взимается только за переходы по объявлению (клики), что делает рекламу максимально гибкой и управляемой.",
      },
      {
        question: "Сколько стоит реклама в Яндекс Директе?",
        answer:
          "Яндекс Директ не устанавливает фиксированных цен. Бюджет формируется из стоимости каждого клика по объявлению, которая зависит от конкурентности тематики, региона, времени суток и качества ваших объявлений. Вы всегда можете установить дневной/недельный лимит расходов, чтобы не выйти за рамки бюджета.\n\nРекомендуется недельный бюджет по цене не менее 10 конверсий. То есть, если по ретроспективе данных вы знаете, что у вас заявка стоит 1000 рублей стабильно, то недельный бюджет вам нужен не менее 10 000 рублей, а лучше прибавлять ещё 20% для нивелирования ситуаций в рекламном аукционе.",
      },
      {
        question: "Можно ли эффективно рекламироваться с небольшим бюджетом?",
        answer:
          "Небольшой относительно чего? Условно, если вы знаете, что конкуренты тратят на рекламу 100 000 рублей в вашем регионе в неделю, а вы хотите зайти с бюджетом 10 000 рублей и ожидать таких же результатов — это нереалистично.\n\nЕсли же вопрос в том, можно ли с меньшим бюджетом делать результат не хуже конкурента, а то и лучше — да, такие кейсы есть. Но это работает, когда разница в бюджетах не десятикратная.",
      },
      {
        question: "Как быстро появятся первые заявки после запуска рекламы?",
        answer:
          "Зависит от многих факторов, но обычно первые результаты появляются в первые дни (зависит от ниши). Рекламные кампании обучаются постоянно, однако первые две недели можно назвать «активным обучением» — в этот период лучше не вносить критических изменений, кроме очистки площадок и поисковых запросов.\n\nЕсли за неделю после старта в кампании нет никаких результатов и по косвенным признакам видно, что она обучается неправильно — это повод предпринять действия.",
      },
    ],
  },
  {
    label: "Для специалистов",
    items: [],
  },
];

function QACard({ item, accent }: { item: QAItem; accent: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <p className="font-semibold text-black text-sm leading-snug">{item.question}</p>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform mt-0.5"
          style={{ background: accent, color: "#000", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <Icon name="ChevronDown" size={15} />
        </span>
      </div>
      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 pt-4">
            {item.answer.split("\n\n").map((para, i) => (
              <p key={i} className={`text-sm text-gray-600 leading-relaxed${i > 0 ? " mt-3" : ""}`}>
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QACarousel({ items, accent }: { items: QAItem[]; accent: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item, i) => (
        <div key={i} className="w-[85vw] max-w-sm shrink-0 snap-start">
          <QACard item={item} accent={accent} />
        </div>
      ))}
    </div>
  );
}

export default function QASection() {
  const accent = "#FEEB19";

  const nonEmpty = QA_GROUPS.filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">❓</span>
        <h2 className="text-xl font-bold text-black">Вопрос — ответ</h2>
      </div>

      {nonEmpty.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{group.label}</p>

          {/* Desktop: grid */}
          <div className="hidden md:flex flex-col gap-3">
            {group.items.map((item, i) => (
              <QACard key={i} item={item} accent={accent} />
            ))}
          </div>

          {/* Mobile: carousel */}
          <div className="md:hidden">
            <QACarousel items={group.items} accent={accent} />
          </div>
        </div>
      ))}
    </div>
  );
}
