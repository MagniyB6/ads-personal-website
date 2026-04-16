import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import RsyBlock from "@/components/yandex/RsyBlock";
import { RSY_SECTIONS } from "@/components/yandex/rsySitesData";

export default function UsefulYandex() {
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
          <span className="font-bold text-black text-base">Яндекс</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-20">
        <div className="mb-12">
          <span className="tag mb-4 inline-block">яндекс</span>
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">Яндекс</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">Полезные инструменты и данные для работы с Яндекс Директ</p>
        </div>

        <div className="flex flex-col gap-6">
          <RsyBlock sections={RSY_SECTIONS} />
        </div>
      </main>
    </div>
  );
}
