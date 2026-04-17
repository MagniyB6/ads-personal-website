import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";

type CropArea = { x: number; y: number; w: number; h: number };
type ImagePosition = "right" | "left" | "bg" | "full";

type ChartEntry = { label: string; value: number };
type ChartData = {
  type: "bar" | "pie" | "line" | "bubble";
  entries: ChartEntry[];
};

type Block = {
  id: string;
  position: number;
  block_type: string;
  heading: string;
  body_text: string;
  image_url?: string;
  image_position: ImagePosition;
  image_crop?: CropArea;
  chart_data?: ChartData;
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

const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function cropImgStyle(crop?: CropArea): React.CSSProperties {
  if (!crop) return { objectFit: "cover", width: "100%", height: "100%" };
  return {
    position: "absolute",
    width: `${(1 / crop.w) * 100}%`,
    height: `${(1 / crop.h) * 100}%`,
    top: 0, left: 0,
    transform: `translate(-${(crop.x / crop.w) * 100}%, -${(crop.y / crop.h) * 100}%)`,
    objectFit: "cover",
  };
}

function ReportChart({ data, isDark, height = 260 }: { data: ChartData; isDark: boolean; height?: number }) {
  const textColor = isDark ? "#ccc" : "#444";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  if (data.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data.entries.map(e => ({ name: e.label, value: e.value }))}
            dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={height * 0.38}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ color: textColor, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (data.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={3} dot={{ r: 5, fill: CHART_COLORS[0] }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (data.type === "bubble") {
    const max = Math.max(...data.entries.map(e => e.value || 1), 1);
    const points = data.entries.map((e, i) => ({
      x: i + 1,
      y: e.value,
      z: e.value,
      name: e.label,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number" dataKey="x"
            tick={{ fill: textColor, fontSize: 11 }}
            tickFormatter={(v) => data.entries[v - 1]?.label || ""}
            domain={[0.5, data.entries.length + 0.5]}
            ticks={data.entries.map((_, i) => i + 1)}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis type="number" dataKey="y" tick={{ fill: textColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} />
          <ZAxis type="number" dataKey="z" range={[400, Math.max(3000, max * 20)]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }}
            formatter={(_v, _n, p) => [(p.payload as { y: number }).y, (p.payload as { name: string }).name]} />
          <Scatter data={points}>
            {points.map((p, i) => <Cell key={i} fill={p.fill} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
        <Tooltip />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CoverSlide({ report, forPdf = false }: { report: Report; forPdf?: boolean }) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const textColor = isDark ? "#fff" : "#0a0a0a";
  const subColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const accent = isDark ? "#fff" : "#0a0a0a";

  return (
    <div
      className={forPdf ? undefined : "report-slide"}
      style={{
        background: bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: forPdf ? "80px 90px" : "48px 56px",
        minHeight: forPdf ? "100%" : 360,
        height: forPdf ? "100%" : "auto",
        borderRadius: forPdf ? 0 : 16,
        marginBottom: forPdf ? 0 : 20,
        border: forPdf ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
      }}
    >
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.3,
        }} crossOrigin="anonymous" />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ width: 40, height: 3, background: accent, marginBottom: forPdf ? 24 : 16 }} />
        <p style={{
          color: subColor, fontSize: forPdf ? 16 : 12, fontWeight: 700,
          letterSpacing: 4, textTransform: "uppercase", marginBottom: forPdf ? 20 : 12,
        }}>
          {report.title}
        </p>
        <h1 style={{
          color: textColor, fontSize: forPdf ? 76 : "clamp(28px,5vw,60px)",
          fontWeight: 900, lineHeight: 1.05, margin: 0,
        }}>
          {report.project_name}
        </h1>
        {(report.date_from || report.date_to) && (
          <p style={{ color: subColor, fontSize: forPdf ? 22 : 16, marginTop: forPdf ? 24 : 14 }}>
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentSlide({ block, index, report, forPdf = false }: { block: Block; index: number; report: Report; forPdf?: boolean }) {
  const isDark = report.theme === "dark";
  const hasImage = !!block.image_url;
  const hasChart = block.block_type === "chart" && !!block.chart_data;
  const pos = block.image_position || "right";

  const slideBg = isDark ? "#0a0a0a" : "#ffffff";
  const border = forPdf ? "none" : (isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb");
  const textColor = isDark ? "#f5f5f5" : "#0a0a0a";
  const subColor = isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.62)";
  const badgeBg = isDark ? "#fff" : "#0a0a0a";
  const badgeText = isDark ? "#0a0a0a" : "#fff";

  const pad = forPdf ? "70px 90px" : "28px 32px";
  const headingSize = forPdf ? 38 : "clamp(16px,2vw,22px)";
  const bodySize = forPdf ? 22 : "clamp(13px,1.4vw,15px)";
  const badgeSize = forPdf ? 44 : 32;
  const badgeFont = forPdf ? 18 : 13;

  const commonStyle: React.CSSProperties = {
    background: slideBg,
    border,
    borderRadius: forPdf ? 0 : 16,
    overflow: "hidden",
    marginBottom: forPdf ? 0 : 20,
    minHeight: forPdf ? "100%" : undefined,
    height: forPdf ? "100%" : undefined,
  };

  const badge = (
    <span style={{
      width: badgeSize, height: badgeSize, borderRadius: "50%",
      background: badgeBg, color: badgeText,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: badgeFont, fontWeight: 800, flexShrink: 0,
    }}>{index + 1}</span>
  );

  const headingEl = <h2 style={{
    color: textColor, fontSize: headingSize, fontWeight: 800, margin: 0, lineHeight: 1.2,
  }}>{block.heading}</h2>;

  const bodyEl = block.body_text ? (
    <p style={{
      color: subColor, fontSize: bodySize, lineHeight: 1.7,
      whiteSpace: "pre-wrap", margin: 0,
    }}>{block.body_text}</p>
  ) : null;

  if (hasChart && block.chart_data) {
    return (
      <div className={forPdf ? undefined : "report-slide"} style={{ ...commonStyle, padding: pad, display: forPdf ? "flex" : "block", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: forPdf ? 28 : 16 }}>{badge}{headingEl}</div>
        {bodyEl && <div style={{ marginBottom: forPdf ? 30 : 16 }}>{bodyEl}</div>}
        <div style={{ flex: forPdf ? 1 : undefined }}>
          <ReportChart data={block.chart_data} isDark={isDark} height={forPdf ? 500 : 260} />
        </div>
      </div>
    );
  }

  if (pos === "full" && hasImage) {
    return (
      <div className={forPdf ? undefined : "report-slide"} style={{ ...commonStyle, position: "relative", minHeight: forPdf ? "100%" : 300 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} crossOrigin="anonymous" />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)" }} />
        </div>
        <div style={{
          position: "relative", zIndex: 2, padding: pad,
          minHeight: forPdf ? "100%" : 300, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: forPdf ? 20 : 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>{badge}{headingEl}</div>
          {bodyEl}
        </div>
      </div>
    );
  }

  if (pos === "bg" && hasImage) {
    return (
      <div className={forPdf ? undefined : "report-slide"} style={{ ...commonStyle, position: "relative", minHeight: forPdf ? "100%" : 240 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} crossOrigin="anonymous" />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.85)" }} />
        </div>
        <div style={{
          position: "relative", zIndex: 2, padding: pad,
          height: forPdf ? "100%" : "auto",
          display: "flex", flexDirection: "column", gap: 16, justifyContent: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>{badge}{headingEl}</div>
          {bodyEl}
        </div>
      </div>
    );
  }

  const imgEl = hasImage ? (
    <div style={{ flex: "0 0 45%", position: "relative", minHeight: forPdf ? undefined : 220, overflow: "hidden" }}>
      <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} crossOrigin="anonymous" />
    </div>
  ) : null;

  const textEl = (
    <div style={{
      flex: 1, padding: pad,
      display: "flex", flexDirection: "column", gap: forPdf ? 24 : 14, justifyContent: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>{badge}{headingEl}</div>
      {bodyEl}
    </div>
  );

  return (
    <div className={forPdf ? undefined : "report-slide"} style={commonStyle}>
      <div style={{ display: "flex", height: forPdf ? "100%" : "auto" }}>
        {pos === "left" && imgEl}
        {textEl}
        {pos !== "left" && imgEl}
      </div>
    </div>
  );
}

const PDF_WIDTH = 1600;
const PDF_HEIGHT = 900;

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || (id ? localStorage.getItem(`report_token_${id}`) : null);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!id) return;
    const headers: Record<string, string> = {};
    if (token) headers["X-Edit-Token"] = token;
    fetch(`${REPORTS_URL}?id=${id}`, { headers })
      .then(r => r.json())
      .then(data => {
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
    if (!pdfRef.current || !report) return;
    setPdfLoading(true);
    try {
      // Ждём отрисовку recharts, шрифтов, изображений
      await new Promise(resolve => setTimeout(resolve, 800));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const slides = pdfRef.current.querySelectorAll<HTMLElement>(".pdf-slide-wrapper");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [PDF_WIDTH, PDF_HEIGHT], compress: true });

      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i], {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: report.theme === "dark" ? "#0a0a0a" : "#ffffff",
          width: PDF_WIDTH,
          height: PDF_HEIGHT,
          windowWidth: PDF_WIDTH,
          windowHeight: PDF_HEIGHT,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage([PDF_WIDTH, PDF_HEIGHT], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
      }

      pdf.save(`Отчёт_${report.project_name || "клиент"}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
      alert("Не получилось сгенерировать PDF. Попробуй ещё раз.");
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
        <Link to="/useful" className="mt-2 text-sm font-semibold text-black underline underline-offset-4">Перейти в Полезное</Link>
      </div>
    );
  }

  const isDark = report.theme === "dark";
  const btnBg = isDark ? "#fff" : "#0a0a0a";
  const btnText = isDark ? "#0a0a0a" : "#fff";

  return (
    <div className="font-golos min-h-screen" style={{ background: isDark ? "#0a0a0a" : "#f5f5f7" }}>
      <header className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ background: isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">Полезное</span>
            </Link>
            <span className="hidden sm:inline" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }}>|</span>
            <span className="font-bold text-sm truncate max-w-[160px] sm:max-w-xs"
              style={{ color: isDark ? "#fff" : "#0a0a0a" }}>
              {report.project_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {report.can_edit && (
              <span className="text-xs hidden md:block" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                Удалится через {timeLeft(report.expires_at)}
              </span>
            )}
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb", color: isDark ? "rgba(255,255,255,0.7)" : "#374151" }}>
              <Icon name={copied ? "Check" : "Link"} size={13} />
              {copied ? "Скопировано" : "Ссылка"}
            </button>
            <button onClick={downloadPdf} disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
              style={{ background: btnBg, color: btnText }}>
              {pdfLoading ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Download" size={13} />}
              <span className="hidden sm:inline">{pdfLoading ? "Готовлю..." : "Скачать PDF"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <CoverSlide report={report} />
        {report.blocks.map((block, i) => (
          <ContentSlide key={block.id} block={block} index={i} report={report} />
        ))}
        {report.can_edit && (
          <div className="mt-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }}>
            <Icon name="Clock" size={16} className="shrink-0 mt-0.5" style={{ color: isDark ? "#fff" : "#374151" } as React.CSSProperties} />
            <div>
              <p className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#111" }}>
                Данные хранятся до {new Date(report.expires_at).toLocaleString("ru-RU")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                После этого отчёт будет удалён автоматически.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Offscreen PDF контейнер */}
      <div
        ref={pdfRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          width: PDF_WIDTH,
          pointerEvents: "none",
          fontFamily: "'Golos Text', system-ui, sans-serif",
        }}
      >
        <div className="pdf-slide-wrapper" style={{ width: PDF_WIDTH, height: PDF_HEIGHT, background: isDark ? "#0a0a0a" : "#fff" }}>
          <CoverSlide report={report} forPdf />
        </div>
        {report.blocks.map((block, i) => (
          <div key={block.id} className="pdf-slide-wrapper" style={{ width: PDF_WIDTH, height: PDF_HEIGHT, background: isDark ? "#0a0a0a" : "#fff" }}>
            <ContentSlide block={block} index={i} report={report} forPdf />
          </div>
        ))}
      </div>
    </div>
  );
}
