import React, { useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { articles, Article } from "@/data/articles";

export default function Useful() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">Полезное</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-20">
        <div className="mb-12">
          <span className="tag mb-4 inline-block">полезные материалы</span>
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">Багаж знаний</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">Делюсь опытом и решениями, которые сам прошёл в работе. Ниже вы увидите полезные статьи и собранные материалы по рекламным системам.</p>
        </div>

        <div className="flex flex-col gap-3 mb-12">
          <Link
            to="/useful/yandex"
            className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 rounded-2xl border-2 hover:opacity-90 transition-opacity"
            style={{ borderColor: "#FEEB19", background: "#FEEB1910" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-bold text-black text-base">Яндекс</p>
                <p className="text-sm text-gray-500 mt-0.5">Площадки РСЯ, исключения и другие полезности</p>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400 shrink-0" />
          </Link>

          <Link
            to="/useful/vk"
            className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 rounded-2xl border-2 hover:opacity-90 transition-opacity"
            style={{ borderColor: "#2688EB", background: "#2688EB10" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔵</span>
              <div>
                <p className="font-bold text-black text-base">VK реклама</p>
                <p className="text-sm text-gray-500 mt-0.5">Инструменты для таргетированной рекламы ВКонтакте</p>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400 shrink-0" />
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Статьи</h2>
          <span className="text-sm text-gray-400">{articles.length} материал{articles.length !== 1 ? "а" : ""}</span>
        </div>

        <ArticleCarousel articles={articles} />
      </main>
    </div>
  );
}

function ArticleCarousel({ articles }: { articles: Article[] }) {
  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-4">
        {articles.map((article) => (
          <CarouselItem key={article.id} className="pl-4 basis-[80%] sm:basis-[55%] md:basis-1/3">
            <ArticleCard article={article} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-center gap-3 mt-6">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}

function getTagStyle(tag: string): React.CSSProperties {
  if (tag === "VK реклама") return { background: "#2688EB", color: "#fff" };
  return { background: "#FEEB19", color: "#000" };
}

function ArticleCard({ article }: { article: Article }) {
  const firstText = article.content.find((b) => b.type === "text");

  return (
    <Link
      to={`/useful/article/${article.slug}`}
      className="w-full rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 text-left group block"
    >
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full" style={getTagStyle(article.tag)}>
          {article.tag}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-400 mb-2">{article.date}</p>
        <h3 className="text-sm font-bold text-black leading-snug mb-2 line-clamp-2">{article.title}</h3>
        {firstText?.value && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{firstText.value}</p>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black">
          Читать статью <Icon name="ArrowRight" size={13} />
        </span>
      </div>
    </Link>
  );
}