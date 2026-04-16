import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { articles } from "@/data/articles";

export default function UsefulArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!article) return <Navigate to="/useful" replace />;

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            Полезное
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base line-clamp-1">{article.title}</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-16 max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#FEEB19", color: "#000" }}>
            {article.tag}
          </span>
          <span className="text-sm text-gray-400">{article.date}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-black leading-tight mb-8">{article.title}</h1>

        <div className="rounded-2xl overflow-hidden mb-10 border border-gray-100">
          <img src={article.image} alt={article.title} className="w-full object-cover max-h-72" />
        </div>

        <div className="flex flex-col gap-5 text-gray-700 leading-relaxed">
          {article.content.map((block, i) => {
            if (block.type === "text") {
              return <p key={i} className="text-base">{block.value}</p>;
            }
            if (block.type === "list" && block.items) {
              return (
                <ul key={i} className="flex flex-col gap-3 pl-1">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3 items-start">
                      <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: "#FEEB19", color: "#000" }}>
                        {j + 1}
                      </span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === "code") {
              return (
                <pre key={i} className="bg-gray-900 text-green-400 rounded-xl p-5 text-sm overflow-x-auto whitespace-pre-wrap break-all">
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
                  className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity text-black"
                >
                  <Icon name="ExternalLink" size={15} />
                  {block.label}
                </a>
              );
            }
            return null;
          })}
        </div>
      </main>
    </div>
  );
}
