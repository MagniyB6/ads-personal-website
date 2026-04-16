import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const ARTICLE_IMAGE = "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/d1ccf348-9075-46f2-ad88-dc6de2e3e883.png";
const TRAFFIC_LIGHT_IMAGE = "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/d1ccf348-9075-46f2-ad88-dc6de2e3e883.png";

type ContentBlock =
  | { type: "text"; value: string; items?: never; href?: never; label?: never }
  | { type: "list"; items: string[]; value?: never; href?: never; label?: never }
  | { type: "code"; value: string; items?: never; href?: never; label?: never }
  | { type: "link"; label: string; href: string; value?: never; items?: never };

type Article = {
  id: number;
  title: string;
  image: string;
  date: string;
  tag: string;
  content: ContentBlock[];
};

const articles: Article[] = [
  {
    id: 1,
    title: "Как добавить HTML5 для Яндекс Директа через Google Web Designer",
    image: ARTICLE_IMAGE,
    date: "Апрель 2026",
    tag: "Яндекс Директ",
    content: [
      { type: "text", value: "На всякий случай тут оставлю, может кто столкнется с проблемой и будет решение 👇🏻" },
      { type: "text", value: "Когда +- разобрался, все кажется уже и не слишком сложно))" },
      {
        type: "list",
        items: [
          "Идем скачивать Google Web Designer",
          "Перед этим подготавливаем все в фигме (желательно в группировке) в формате JPG не PNG (так как помним про ограничение размера до 1мб). У меня макет состоял из 4 горизонтальных баннеров плавно сменяющих друг друга, но может кто еще чего придумает.",
          "Делаем минимальную анимацию и зацикливаем на повторение.",
        ],
      },
      { type: "text", value: "4) Теперь про правки в самом коде, нужно добавить информацию о размере в <Head>, выглядит вот так:" },
      { type: "code", value: `<meta name="ad.size" content="width=640,height=134">` },
      { type: "text", value: `Далее делаем баннер кликабельным, после <Body> добавляем:` },
      { type: "code", value: `<a id="click_area" href="#" target="_blank" style="display:block; width:640px; height:134px;">` },
      { type: "text", value: "И добавляем обработку клика яндекса:" },
      { type: "code", value: `<script>\n  document.getElementById('click_area').href =\n    yandexHTML5BannerApi.getClickURLNum(1);\n</script>` },
      { type: "text", value: "У меня был косяк в том, что я все это сделав — сталкивался с проблемой, мол не удалено из кода:" },
      { type: "code", value: `<script data-source="https://s0.2mdn.net/ads/studio/Enabler.js" data-exports-type="gwd-google-ad" src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>` },
      { type: "text", value: "Чтобы это решить — просто в GWD выбирайте при создании «внешнее объявление» и всё (см скрин). Если кому-то сэкономит время буду рад 🤝🔥" },
      { type: "link", label: "Урок по созданию HTML Баннера на YouTube", href: "https://www.youtube.com/watch?v=MoKGQIykurg" },
    ],
  },
  {
    id: 2,
    title: "Принцип светофора в Мастере кампаний🚦",
    image: TRAFFIC_LIGHT_IMAGE,
    date: "Апрель 2026",
    tag: "Яндекс Директ",
    content: [
      { type: "text", value: "Как-то уже отвечал про него. Однако давайте расскажу ещё раз про эти индикаторы подробнее." },
      { type: "text", value: "В Мастере кампаний у элементов объявлений со временем появляются цветовые индикаторы. Обычно это происходит в течение недели с момента добавления элемента, когда накоплено достаточно статистики." },
      { type: "text", value: "Основной принцип светофора — это сравнение показателей между собой внутри одной кампании:" },
      {
        type: "list",
        items: [
          "🟢 Зелёный — элемент объявлений работает хорошо, и он чаще всего отбирается для показов среди остальных",
          "🟡 Жёлтый — элемент отбирается чуть реже для показов или ещё не собрал достаточно данных",
          "🔴 Красный — показывает, что другие элементы одного типа внутри кампании работают эффективнее",
        ],
      },
      { type: "text", value: "При этом допустимо, что все элементы могут быть одного или двух цветов. В этом случае они работают с очень близкими друг к другу показателями." },
      { type: "text", value: "Сам светофор не влияет на показы, он нужен только для сравнения. Жёлтые и красные сигналы — относительная оценка. Если заменить менее эффективные элементы на другие, то, возможно, они также окрасятся в жёлтый и красный цвета через некоторое время. Ротировать элементы можно и даже полезно, особенно если показатели кампании перестали расти." },
      { type: "text", value: "Цветовая индикация рассчитывается алгоритмом на основании количества показов, кликов, конверсий и суммы потраченных средств внутри кампании." },
      { type: "text", value: "Пост взят с телеграм канала «Громов о контексте»" },
      { type: "link", label: "Источник: t.me/ya_gromov/618", href: "https://t.me/ya_gromov/618" },
    ],
  },
];

export default function Useful() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [vkToast, setVkToast] = useState(false);
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const handleVkClick = () => {
    setVkToast(true);
    setTimeout(() => setVkToast(false), 2500);
  };

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
            className="flex items-center justify-between px-6 py-5 rounded-2xl border-2 hover:opacity-90 transition-opacity"
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

          <button
            onClick={handleVkClick}
            className="flex items-center justify-between px-6 py-5 rounded-2xl border-2 hover:opacity-90 transition-opacity text-left w-full"
            style={{ borderColor: "#2688EB", background: "#2688EB10" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔵</span>
              <div>
                <p className="font-bold text-black text-base">VK реклама</p>
                <p className="text-sm text-gray-500 mt-0.5">Полезные материалы по таргетированной рекламе</p>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-gray-400 shrink-0" />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Статьи</h2>
          <span className="text-sm text-gray-400">{articles.length} материал{articles.length !== 1 ? "а" : ""}</span>
        </div>

        <ArticleCarousel
          articles={articles}
          openArticle={openArticle}
          onOpen={setOpenArticle}
          onClose={() => setOpenArticle(null)}
        />
      </main>

      {vkToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white"
          style={{ background: "#2688EB" }}>
          Скоро тут будут материалы
        </div>
      )}
    </div>
  );
}

function ArticleCarousel({
  articles,
  openArticle,
  onOpen,
  onClose,
}: {
  articles: Article[];
  openArticle: number | null;
  onOpen: (id: number) => void;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {articles.length > 1 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {articles.map((article) => (
          <ArticlePreviewCard
            key={article.id}
            article={article}
            isOpen={openArticle === article.id}
            onOpen={() => onOpen(article.id)}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}

function ArticlePreviewCard({
  article,
  isOpen,
  onOpen,
  onClose,
}: {
  article: Article;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  if (isOpen) {
    return (
      <div className="w-full shrink-0 snap-start rounded-2xl border border-gray-200 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#FEEB19", color: "#000" }}>{article.tag}</span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-black leading-snug mb-6">{article.title}</h2>
          <div className="flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
            {article.content.map((block, i) => {
              if (block.type === "text") return <p key={i}>{block.value}</p>;
              if (block.type === "list" && block.items) {
                return (
                  <ol key={i} className="flex flex-col gap-2 pl-1">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FEEB19", color: "#000" }}>{j + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              if (block.type === "code") {
                return (
                  <pre key={i} className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {block.value}
                  </pre>
                );
              }
              if (block.type === "link") {
                return (
                  <a key={i} href={block.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity" style={{ color: "#000" }}>
                    <Icon name="Youtube" size={16} />
                    {block.label}
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="w-72 md:w-80 shrink-0 snap-start rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left group"
    >
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#FEEB19", color: "#000" }}>
          {article.tag}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-400 mb-2">{article.date}</p>
        <h3 className="text-sm font-bold text-black leading-snug mb-4 line-clamp-3">{article.title}</h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black">
          Читать статью <Icon name="ArrowRight" size={13} />
        </span>
      </div>
    </button>
  );
}