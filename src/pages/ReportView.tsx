import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";

const ACCENT: Record<string, string> = {
  "Яндекс Директ": "#FEEB19",
  "VK Реклама": "#0077FF",
  "Авито Реклама": "#00AAFF",
};

type CropArea = { x: number; y: number; w: number; h: number };
type ImagePosition = "right" | "left" | "bg" | "full";

type Block = {
  id: string;
  position: number;
  block_type: string;
  heading: string;
  body_text: string;
  image_url?: string;
  image_position: ImagePosition;
  image_crop?: CropArea;
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
  theme: "dark" | "light";
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
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
}

// Возвращает CSS-стили для кадрированного изображения внутри контейнера
function cropStyle(crop?: CropArea): React.CSSProperties {
  if (!crop) return { objectFit: "cover", width: "100%", height: "100%" };
  return {
    position: "absolute",
    top: 0, left: 0,
    width: `${(1 / crop.w) * 100}%`,
    height: `${(1 / crop.h) * 100}%`,
    transform: `translate(-${(crop.x / crop.w) * 100}%, -${(crop.y / crop.h) * 100}%)`,
    objectFit: "cover",
  };
}

// ---- Слайды для экрана (адаптивные) ----

function CoverSlide({ report }: { report: Report }) {
  const accent = ACCENT[report.title] || "#FEEB19";
  const isDark = report.theme === "dark";

  return (
    <div
      className="slide-cover relative w-full rounded-2xl overflow-hidden flex flex-col justify-end mb-6"
      style={{
        aspectRatio: "16/9",
        background: isDark
          ? "linear-gradient(135deg, #111 0%, #252525 100%)"
          : "linear-gradient(135deg, #f5f5f5 0%, #fff 100%)",
        border: `3px solid ${accent}`,
      }}
    >
      {report.cover_image_url && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={report.cover_image_url} alt="" className="w-full h-full object-cover opacity-30" />
        </div>
      )}
      <div className="relative z-10 p-6 md:p-12">
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3" style={{ color: accent }}>
          {report.title}
        </p>
        <h1 className="text-2xl md:text-5xl font-black leading-tight mb-2 md:mb-4"
          style={{ color: isDark ? "#fff" : "#111" }}>
          {report.project_name}
        </h1>
        {(report.date_from || report.date_to) && (
          <p className="text-sm md:text-base font-medium" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)" }}>
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentSlide({ block, index, report }: { block: Block; index: number; report: Report }) {
  const accent = ACCENT[report.title] || "#FEEB19";
  const isDark = report.theme === "dark";
  const hasImage = !!block.image_url;
  const pos = block.image_position || "right";

  const bgStyle: React.CSSProperties = isDark
    ? { background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "#fff", border: "1px solid #e5e7eb" };

  const textColor = isDark ? "#f0f0f0" : "#111";
  const subColor = isDark ? "rgba(255,255,255,0.6)" : "#6b7280";

  if (pos === "full" && hasImage) {
    return (
      <div className="slide-content rounded-2xl overflow-hidden mb-5 shadow-sm" style={{ ...bgStyle, aspectRatio: "16/9", position: "relative" }}>
        <div className="absolute inset-0 overflow-hidden">
          <img src={block.image_url} alt="" style={cropStyle(block.image_crop)} />
        </div>
        <div className="absolute inset-0" style={{ background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)" }} />
        <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end h-full">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: accent, color: "#000" }}>
              {index + 1}
            </span>
            <h2 className="text-xl md:text-3xl font-bold" style={{ color: isDark ? "#fff" : "#111" }}>{block.heading}</h2>
          </div>
          {block.body_text && (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#333" }}>
              {block.body_text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (pos === "bg" && hasImage) {
    return (
      <div className="slide-content rounded-2xl overflow-hidden mb-5 shadow-sm" style={{ ...bgStyle, position: "relative", minHeight: 280 }}>
        <div className="absolute inset-0 overflow-hidden">
          <img src={block.image_url} alt="" style={cropStyle(block.image_crop)} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.78)" }} />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: accent, color: "#000" }}>
              {index + 1}
            </span>
            <h2 className="text-lg md:text-xl font-bold" style={{ color: textColor }}>{block.heading}</h2>
          </div>
          {block.body_text && (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: subColor }}>{block.body_text}</p>
          )}
        </div>
      </div>
    );
  }

  const textFirst = pos === "left";

  return (
    <div className="slide-content rounded-2xl overflow-hidden mb-5 shadow-sm" style={bgStyle}>
      <div className={`flex ${hasImage ? (textFirst ? "flex-col md:flex-row-reverse" : "flex-col md:flex-row") : "flex-col"} gap-0`}>
        {/* Текстовая часть */}
        <div className={`p-6 md:p-8 ${hasImage ? "md:w-1/2" : "w-full"}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: accent, color: "#000" }}>
              {index + 1}
            </span>
            <h2 className="text-lg md:text-xl font-bold" style={{ color: textColor }}>{block.heading}</h2>
          </div>
          {block.body_text && (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: subColor }}>{block.body_text}</p>
          )}
        </div>
        {/* Изображение */}
        {hasImage && (
          <div className="md:w-1/2 relative overflow-hidden" style={{ minHeight: 200 }}>
            <img src={block.image_url} alt="" style={cropStyle(block.image_crop)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---- PDF-слайды: фиксированный размер 1920×1080 ----

const W = 1920;
const H = 1080;

function PdfCoverSlide({ report }: { report: Report }) {
  const accent = ACCENT[report.title] || "#FEEB19";
  const isDark = report.theme === "dark";

  return (
    <div style={{
      width: W, height: H, position: "relative", overflow: "hidden",
      background: isDark ? "linear-gradient(135deg,#111 0%,#252525 100%)" : "linear-gradient(135deg,#f5f5f5 0%,#fff 100%)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: "80px 120px",
      borderLeft: `12px solid ${accent}`,
    }}>
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25,
        }} crossOrigin="anonymous" />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        <p style={{ color: accent, fontSize: 22, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>
          {report.title}
        </p>
        <h1 style={{ color: isDark ? "#fff" : "#111", fontSize: 88, fontWeight: 900, lineHeight: 1.05, marginBottom: 28 }}>
          {report.project_name}
        </h1>
        {(report.date_from || report.date_to) && (
          <p style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", fontSize: 30 }}>
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
    </div>
  );
}

function PdfContentSlide({ block, index, report }: { block: Block; index: number; report: Report }) {
  const accent = ACCENT[report.title] || "#FEEB19";
  const isDark = report.theme === "dark";
  const hasImage = !!block.image_url;
  const pos = block.image_position || "right";
  const bg = isDark ? "#1c1c1e" : "#fff";
  const textColor = isDark ? "#f0f0f0" : "#111";
  const subColor = isDark ? "rgba(255,255,255,0.65)" : "#555";
  const PAD = 80;

  const numBadge = (
    <div style={{
      width: 52, height: 52, borderRadius: "50%", background: accent, color: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, fontWeight: 800, flexShrink: 0,
    }}>{index + 1}</div>
  );

  const heading = (
    <h2 style={{ color: textColor, fontSize: 44, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
      {block.heading}
    </h2>
  );

  const body = block.body_text ? (
    <p style={{ color: subColor, fontSize: 28, lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>
      {block.body_text}
    </p>
  ) : null;

  const imgEl = hasImage ? (
    <div style={{ position: "relative", overflow: "hidden", flex: 1, minWidth: 0 }}>
      <img
        src={block.image_url}
        alt=""
        style={cropStyle(block.image_crop)}
        crossOrigin="anonymous"
      />
    </div>
  ) : null;

  if (pos === "full" && hasImage) {
    return (
      <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: bg }}>
        <img src={block.image_url} alt="" style={{ ...cropStyle(block.image_crop), position: "absolute" }} crossOrigin="anonymous" />
        <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)" }} />
        <div style={{ position: "relative", zIndex: 2, padding: PAD, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>{numBadge}{heading}</div>
          {body}
        </div>
      </div>
    );
  }

  if (pos === "bg" && hasImage) {
    return (
      <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: bg }}>
        <img src={block.image_url} alt="" style={{ ...cropStyle(block.image_crop), position: "absolute" }} crossOrigin="anonymous" />
        <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.68)" : "rgba(255,255,255,0.8)" }} />
        <div style={{ position: "relative", zIndex: 2, padding: PAD, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>{numBadge}{heading}</div>
          {body}
        </div>
      </div>
    );
  }

  const textSection = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, padding: PAD, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>{numBadge}{heading}</div>
      {body}
    </div>
  );

  const contentRow = pos === "left"
    ? <>{imgEl && <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>{imgEl}</div>}{textSection}</>
    : <>{textSection}{imgEl && <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>{imgEl}</div>}</>;

  return (
    <div style={{ width: W, height: H, background: bg, display: "flex", overflow: "hidden" }}>
      {hasImage ? contentRow : <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: PAD, gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>{numBadge}{heading}</div>
        {body}
      </div>}
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
  const pdfContainerRef = useRef<HTMLDivElement>(null);

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
    if (!report || !pdfContainerRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const slides = pdfContainerRef.current.querySelectorAll<HTMLElement>(".pdf-slide");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [W, H], compress: true });
      let first = true;

      for (const slide of slides) {
        const canvas = await html2canvas(slide, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: report.theme === "dark" ? "#1c1c1e" : "#ffffff",
          width: W,
          height: H,
          scrollX: 0,
          scrollY: 0,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.93);
        if (!first) pdf.addPage([W, H], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, W, H);
        first = false;
      }

      pdf.save(`Отчёт_${report.project_name || "клиент"}.pdf`);
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
        <p className="text-gray-500 max-w-xs">Отчёт мог быть удалён — данные хранятся 5 часов.</p>
        <Link to="/useful" className="mt-2 text-sm font-semibold text-black underline underline-offset-4">
          Перейти в Полезное
        </Link>
      </div>
    );
  }

  const accent = ACCENT[report.title] || "#FEEB19";
  const pageBg = report.theme === "dark" ? "#111" : "#f5f5f7";

  return (
    <div className="font-golos min-h-screen" style={{ background: pageBg }}>
      {/* Шапка */}
      <header className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ background: report.theme === "dark" ? "rgba(17,17,17,0.95)" : "rgba(255,255,255,0.95)", borderColor: report.theme === "dark" ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: report.theme === "dark" ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">Полезное</span>
            </Link>
            <span style={{ color: report.theme === "dark" ? "rgba(255,255,255,0.15)" : "#d1d5db" }} className="hidden sm:inline">|</span>
            <span className="font-bold text-sm truncate max-w-[160px] sm:max-w-none"
              style={{ color: report.theme === "dark" ? "#fff" : "#111" }}>
              {report.project_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {report.can_edit && (
              <span className="text-xs hidden md:block" style={{ color: report.theme === "dark" ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                Удалится через {timeLeft(report.expires_at)}
              </span>
            )}
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
              style={{
                borderColor: report.theme === "dark" ? "rgba(255,255,255,0.15)" : "#e5e7eb",
                color: report.theme === "dark" ? "rgba(255,255,255,0.7)" : "#374151",
              }}>
              <Icon name={copied ? "Check" : "Link"} size={13} />
              {copied ? "Скопировано" : "Ссылка"}
            </button>
            <button onClick={downloadPdf} disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: accent, color: accent === "#FEEB19" ? "#000" : "#fff" }}>
              {pdfLoading ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Download" size={13} />}
              <span className="hidden sm:inline">Скачать PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Визуальный просмотр */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <CoverSlide report={report} />
        {report.blocks.map((block, i) => (
          <ContentSlide key={block.id} block={block} index={i} report={report} />
        ))}

        {report.can_edit && (
          <div className="mt-8 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: report.theme === "dark" ? "rgba(255,235,25,0.1)" : "#fffbeb", border: `1px solid ${accent}40` }}>
            <Icon name="Clock" size={16} className="shrink-0 mt-0.5" style={{ color: accent } as React.CSSProperties} />
            <div>
              <p className="text-sm font-semibold" style={{ color: report.theme === "dark" ? "#fff" : "#92400e" }}>
                Данные хранятся до {new Date(report.expires_at).toLocaleString("ru-RU")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: report.theme === "dark" ? "rgba(255,255,255,0.5)" : "#b45309" }}>
                После этого отчёт будет удалён автоматически.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Скрытый PDF-контейнер с точными размерами 1920×1080 */}
      <div
        ref={pdfContainerRef}
        style={{
          position: "fixed", left: -99999, top: 0,
          width: W, height: "auto", overflow: "visible",
          pointerEvents: "none", zIndex: -1,
          fontFamily: "'Golos Text', Arial, sans-serif",
        }}
        aria-hidden="true"
      >
        <div className="pdf-slide">
          <PdfCoverSlide report={report} />
        </div>
        {report.blocks.map((block, i) => (
          <div key={block.id} className="pdf-slide">
            <PdfContentSlide block={block} index={i} report={report} />
          </div>
        ))}
      </div>
    </div>
  );
}
