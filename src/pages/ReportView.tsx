import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const ACCENT = "#6366f1";

type CropArea = { x: number; y: number; w: number; h: number };
type ImagePosition = "right" | "left" | "bg" | "full";

type ChartEntry = { label: string; value: number };
type ChartData = {
  type: "bar" | "pie" | "line";
  entries: ChartEntry[];
  colors?: string[];
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

const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

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

function ReportChart({ data, isDark }: { data: ChartData; isDark: boolean }) {
  const colors = data.colors?.length ? data.colors : CHART_COLORS;
  const textColor = isDark ? "#ccc" : "#555";

  if (data.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data.entries.map(e => ({ name: e.label, value: e.value }))}
            dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.entries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (data.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.entries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CoverSlide({ report }: { report: Report }) {
  const isDark = report.theme === "dark";
  return (
    <div className="report-slide cover-slide" style={{
      background: isDark ? "linear-gradient(135deg,#111 0%,#252525 100%)" : "linear-gradient(135deg,#f0f0f0 0%,#fff 100%)",
      borderLeft: `6px solid ${ACCENT}`,
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: "48px 56px", minHeight: 360,
      borderRadius: 16, marginBottom: 20,
    }}>
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        <p style={{ color: ACCENT, fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          {report.title}
        </p>
        <h1 style={{ color: isDark ? "#fff" : "#111", fontSize: "clamp(28px,5vw,60px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, margin: 0 }}>
          {report.project_name}
        </h1>
        {(report.date_from || report.date_to) && (
          <p style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)", fontSize: 16, marginTop: 14 }}>
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentSlide({ block, index, report }: { block: Block; index: number; report: Report }) {
  const isDark = report.theme === "dark";
  const hasImage = !!block.image_url;
  const hasChart = block.block_type === "chart" && !!block.chart_data;
  const pos = block.image_position || "right";

  const slideBg = isDark ? "#1c1c1e" : "#fff";
  const border = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb";
  const textColor = isDark ? "#f0f0f0" : "#111";
  const subColor = isDark ? "rgba(255,255,255,0.62)" : "#4b5563";
  const slideStyle: React.CSSProperties = { background: slideBg, border, borderRadius: 16, overflow: "hidden", marginBottom: 20 };

  const badge = (
    <span style={{
      width: 32, height: 32, borderRadius: "50%", background: ACCENT, color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, flexShrink: 0,
    }}>{index + 1}</span>
  );

  const headingEl = <h2 style={{ color: textColor, fontSize: "clamp(16px,2vw,22px)", fontWeight: 800, margin: 0 }}>{block.heading}</h2>;
  const bodyEl = block.body_text
    ? <p style={{ color: subColor, fontSize: "clamp(13px,1.4vw,15px)", lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{block.body_text}</p>
    : null;

  if (hasChart && block.chart_data) {
    return (
      <div className="report-slide" style={{ ...slideStyle, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>{badge}{headingEl}</div>
        {bodyEl && <div style={{ marginBottom: 16 }}>{bodyEl}</div>}
        <ReportChart data={block.chart_data} isDark={isDark} />
      </div>
    );
  }

  if (pos === "full" && hasImage) {
    return (
      <div className="report-slide" style={{ ...slideStyle, position: "relative", minHeight: 300 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.68)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, padding: "28px 32px", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingEl}</div>
          {bodyEl}
        </div>
      </div>
    );
  }

  if (pos === "bg" && hasImage) {
    return (
      <div className="report-slide" style={{ ...slideStyle, position: "relative", minHeight: 240 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.84)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingEl}</div>
          {bodyEl}
        </div>
      </div>
    );
  }

  // left = изображение слева, right = изображение справа
  const imgEl = hasImage ? (
    <div style={{ flex: "0 0 45%", position: "relative", minHeight: 220, overflow: "hidden" }}>
      <img src={block.image_url} alt="" style={cropImgStyle(block.image_crop)} />
    </div>
  ) : null;

  const textEl = (
    <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingEl}</div>
      {bodyEl}
    </div>
  );

  return (
    <div className="report-slide" style={slideStyle}>
      <div style={{ display: "flex" }}>
        {pos === "left" && imgEl}
        {textEl}
        {pos !== "left" && imgEl}
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

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          .no-print { display: none !important; }
          body { background: ${isDark ? "#111" : "#f5f5f5"} !important; }
          .report-slide {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
            margin-bottom: 0 !important;
            border-radius: 0 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="font-golos min-h-screen" style={{ background: isDark ? "#111" : "#f5f5f7" }}>
        <header className="no-print border-b sticky top-0 z-40 backdrop-blur-sm"
          style={{ background: isDark ? "rgba(17,17,17,0.95)" : "rgba(255,255,255,0.95)", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                <Icon name="ArrowLeft" size={16} />
                <span className="hidden sm:inline">Полезное</span>
              </Link>
              <span className="hidden sm:inline" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }}>|</span>
              <span className="font-bold text-sm truncate max-w-[160px] sm:max-w-xs"
                style={{ color: isDark ? "#fff" : "#111" }}>
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
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: ACCENT, color: "#fff" }}>
                <Icon name="Printer" size={13} />
                <span className="hidden sm:inline">Скачать PDF</span>
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
            <div className="no-print mt-6 p-4 rounded-2xl flex items-start gap-3"
              style={{ background: isDark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Icon name="Clock" size={16} className="shrink-0 mt-0.5" style={{ color: ACCENT } as React.CSSProperties} />
              <div>
                <p className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#3730a3" }}>
                  Данные хранятся до {new Date(report.expires_at).toLocaleString("ru-RU")}
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6366f1" }}>
                  После этого отчёт будет удалён автоматически.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
