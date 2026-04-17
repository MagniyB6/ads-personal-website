import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";

type Block = {
  id: string;
  position: number;
  block_type: string;
  heading: string;
  body_text: string;
  image_url?: string;
};

type Report = {
  id: string;
  title: string;
  project_name: string;
  date_from?: string;
  date_to?: string;
  cover_image_url?: string;
  created_at: string;
  expires_at: string;
  can_edit: boolean;
  blocks: Block[];
};

function formatDate(d?: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function timeLeft(expires: string): string {
  const diff = new Date(expires).getTime() - Date.now();
  if (diff <= 0) return "истёк";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

function CoverSlide({ report }: { report: Report }) {
  return (
    <div
      className="slide relative w-full rounded-2xl overflow-hidden flex flex-col justify-end mb-6"
      style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}
    >
      {report.cover_image_url && (
        <img
          src={report.cover_image_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}
      <div className="relative z-10 p-8 md:p-12">
        <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-3">{report.title}</p>
        <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight mb-4">{report.project_name}</h1>
        {(report.date_from || report.date_to) && (
          <p className="text-white/70 text-base font-medium">
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentSlide({ block, index }: { block: Block; index: number }) {
  const hasImage = !!block.image_url;
  return (
    <div className="slide bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold shrink-0">
            {index + 1}
          </span>
          <h2 className="text-lg md:text-xl font-bold text-black">{block.heading}</h2>
        </div>
        <div className={hasImage ? "grid md:grid-cols-2 gap-6 items-start" : ""}>
          {block.body_text && (
            <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {block.body_text}
            </div>
          )}
          {hasImage && (
            <img
              src={block.image_url}
              alt={block.heading}
              className="w-full rounded-xl border border-gray-100 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || (id ? localStorage.getItem(`report_token_${id}`) : null);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!id) return;
    const headers: Record<string, string> = {};
    if (token) headers["X-Edit-Token"] = token;
    fetch(`${REPORTS_URL}?id=${id}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); return; }
        setReport(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, token]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/report/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const slides = reportRef.current.querySelectorAll<HTMLElement>(".slide");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080] });
      let first = true;

      for (const slide of slides) {
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 1920,
          height: 1080,
          windowWidth: 1920,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (!first) pdf.addPage([1920, 1080], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
        first = false;
      }

      pdf.save(`Отчёт_${report?.project_name || "клиент"}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-golos min-h-screen bg-white flex items-center justify-center">
        <Icon name="Loader" size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="font-golos min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl mb-2">🛸</div>
        <h1 className="text-2xl font-bold text-black">Отчёт не найден</h1>
        <p className="text-gray-500 text-base max-w-xs">Отчёт мог быть удалён — данные хранятся 5 часов.</p>
        <Link to="/useful" className="mt-2 text-sm font-semibold text-black underline underline-offset-4">
          Перейти в Полезное
        </Link>
      </div>
    );
  }

  return (
    <div className="font-golos min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-black transition-colors">
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">Полезное</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="font-bold text-black text-sm truncate max-w-[160px] sm:max-w-none">{report.project_name}</span>
          </div>
          <div className="flex items-center gap-2">
            {report.can_edit && (
              <span className="text-xs text-gray-400 hidden md:block">
                Удалится через {timeLeft(report.expires_at)}
              </span>
            )}
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Icon name={copied ? "Check" : "Link"} size={13} />
              {copied ? "Скопировано" : "Ссылка"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: "#FEEB19", color: "#000" }}
            >
              {pdfLoading ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Download" size={13} />}
              <span className="hidden sm:inline">Скачать PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Для PDF рендера — скрытый контейнер 1920x1080 */}
        <div ref={reportRef}>
          <CoverSlide report={report} />
          {report.blocks.map((block, i) => (
            <ContentSlide key={block.id} block={block} index={i} />
          ))}
        </div>

        {report.can_edit && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Icon name="Clock" size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Данные хранятся до {new Date(report.expires_at).toLocaleString("ru-RU")}</p>
              <p className="text-xs text-amber-600 mt-0.5">После этого отчёт будет удалён автоматически.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
