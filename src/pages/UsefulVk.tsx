import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function UsefulVk() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            Полезное
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">VK реклама</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-20">
        <div className="mb-12">
          <span className="tag mb-4 inline-block" style={{ background: "#2688EB20", color: "#2688EB" }}>vk реклама</span>
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">VK реклама</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">Полезные инструменты и материалы для работы с таргетированной рекламой ВКонтакте</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            to="/useful/vk-ad-generator"
            className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 rounded-2xl border-2 hover:opacity-90 transition-opacity"
            style={{ borderColor: "#2688EB", background: "#2688EB10" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-bold text-black text-base">Генератор объявлений</p>
                <p className="text-sm text-gray-500 mt-0.5">Опиши бизнес — ИИ составит все тексты для лид-формы VK Рекламы</p>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400 shrink-0" />
          </Link>
        </div>
      </main>
    </div>
  );
}