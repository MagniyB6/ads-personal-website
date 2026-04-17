import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { QA_GROUPS, QAItem } from "@/data/qaData";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

function QAAccordion({ item }: { item: QAItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-5">
        <p className="font-semibold text-black text-sm leading-snug">{item.question}</p>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform"
          style={{
            background: "#FEEB19",
            color: "#000",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <Icon name="ChevronDown" size={15} />
        </span>
      </div>
      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {item.answer.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QAMobileCard({ item }: { item: QAItem }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FEEB19" }}>
          <Icon name="MessageCircleQuestion" size={14} />
        </div>
        <p className="font-semibold text-black text-sm leading-snug">{item.question}</p>
        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
          {item.answer.split("\n\n").map((para, i) => (
            <p key={i} className="text-xs text-gray-500 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UsefulYandexQA() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const available = QA_GROUPS.filter((g) => g.items.length > 0);
  const [activeGroup, setActiveGroup] = useState(available[0]?.id ?? "");

  const currentGroup = QA_GROUPS.find((g) => g.id === activeGroup);

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link
            to="/useful/yandex"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            Яндекс
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">Вопрос — ответ</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-16">
        <div className="mb-10">
          <span className="tag mb-4 inline-block">яндекс директ</span>
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">Вопрос — ответ</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">Отвечаю на частые вопросы по Яндекс Директу</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {available.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                activeGroup === group.id
                  ? { background: "#FEEB19", color: "#000" }
                  : { background: "#f3f4f6", color: "#6b7280" }
              }
            >
              {group.label}
            </button>
          ))}
        </div>

        {currentGroup && currentGroup.items.length > 0 && (
          <>
            {/* Desktop: accordion list */}
            <div className="hidden md:flex flex-col gap-3">
              {currentGroup.items.map((item, i) => (
                <QAAccordion key={i} item={item} />
              ))}
            </div>

            {/* Mobile: looping carousel */}
            <div className="md:hidden">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {currentGroup.items.map((item, i) => (
                    <CarouselItem key={i} className="pl-4 basis-[80%]">
                      <QAMobileCard item={item} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </Carousel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}