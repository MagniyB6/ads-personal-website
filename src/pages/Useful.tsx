import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const ARTICLE_IMAGE = "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/d1ccf348-9075-46f2-ad88-dc6de2e3e883.png";

const articles = [
  {
    id: 1,
    title: "Как добавить HTML5 для Яндекс Директа через Google Web Designer",
    image: ARTICLE_IMAGE,
    date: "Апрель 2026",
    tag: "Яндекс Директ",
    content: [
      {
        type: "text",
        value:
          "На всякий случай тут оставлю, может кто столкнется с проблемой и будет решение 👇🏻",
      },
      {
        type: "text",
        value:
          "Когда +- разобрался, все кажется уже и не слишком сложно))",
      },
      {
        type: "list",
        items: [
          "Идем скачивать Google Web Designer",
          "Перед этим подготавливаем все в фигме (желательно в группировке) в формате JPG не PNG (так как помним про ограничение размера до 1мб). У меня макет состоял из 4 горизонтальных баннеров плавно сменяющих друг друга, но может кто еще чего придумает.",
          "Делаем минимальную анимацию и зацикливаем на повторение.",
        ],
      },
      {
        type: "text",
        value:
          "4) Теперь про правки в самом коде, нужно добавить информацию о размере в <Head>, выглядит вот так:",
      },
      {
        type: "code",
        value: `<meta name="ad.size" content="width=640,height=134">`,
      },
      {
        type: "text",
        value: `Далее делаем баннер кликабельным, после <Body> добавляем:`,
      },
      {
        type: "code",
        value: `<a id="click_area" href="#" target="_blank" style="display:block; width:640px; height:134px;">`,
      },
      {
        type: "text",
        value: "И добавляем обработку клика яндекса:",
      },
      {
        type: "code",
        value: `<script>\n  document.getElementById('click_area').href =\n    yandexHTML5BannerApi.getClickURLNum(1);\n</script>`,
      },
      {
        type: "text",
        value:
          "У меня был косяк в том, что я все это сделав — сталкивался с проблемой, мол не удалено из кода:",
      },
      {
        type: "code",
        value: `<script data-source="https://s0.2mdn.net/ads/studio/Enabler.js" data-exports-type="gwd-google-ad" src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>`,
      },
      {
        type: "text",
        value:
          "Чтобы это решить — просто в GWD выбирайте при создании «внешнее объявление» и всё (см скрин). Если кому-то сэкономит время буду рад 🤝🔥",
      },
      {
        type: "link",
        label: "Урок по созданию HTML Баннера на YouTube",
        href: "https://www.youtube.com/watch?v=MoKGQIykurg",
      },
    ],
  },
];

export default function Useful() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
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
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">
            Полезные статьи
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">
            Делюсь опытом и решениями, которые сам прошёл в работе
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </main>
    </div>
  );
}

function ArticleCard({ article }: { article: (typeof articles)[0] }) {
  return (
    <article className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-52 overflow-hidden bg-gray-50">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "#FEEB19", color: "#000" }}
        >
          {article.tag}
        </span>
      </div>

      <div className="p-6 md:p-8">
        <p className="text-xs text-gray-400 mb-3">{article.date}</p>
        <h2 className="text-xl font-bold text-black leading-snug mb-5">
          {article.title}
        </h2>

        <div className="flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
          {article.content.map((block, i) => {
            if (block.type === "text") {
              return <p key={i}>{block.value}</p>;
            }
            if (block.type === "list" && block.items) {
              return (
                <ol key={i} className="flex flex-col gap-2 pl-1">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#FEEB19", color: "#000" }}
                      >
                        {j + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            if (block.type === "code") {
              return (
                <pre
                  key={i}
                  className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all"
                >
                  {block.value}
                </pre>
              );
            }
            if (block.type === "link") {
              return (
                <a
                  key={i}
                  href={block.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                  style={{ color: "#000" }}
                >
                  <Icon name="Youtube" size={16} />
                  {block.label}
                </a>
              );
            }
            return null;
          })}
        </div>
      </div>
    </article>
  );
}