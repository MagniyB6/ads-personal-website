import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SLIDE_W = 1200;
const SLIDE_H = 675;

const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

type CropArea = { x: number; y: number; w: number; h: number };
type ImagePosition = "right" | "left" | "bg" | "full";
type ChartEntry = { label: string; value: number };
type ChartData = { type: "bar" | "pie" | "line" | "bubble"; entries: ChartEntry[] };

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

type EditBlock = Block & { _imageFile?: File; _imagePreview?: string };

// ── утилиты ──────────────────────────────────────────────────────────────────

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

function fileToBase64(file: File): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: (reader.result as string).split(",")[1], type: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Стиль изображения с кадрированием внутри контейнера с overflow:hidden
function cropImgStyle(crop?: CropArea): React.CSSProperties {
  if (!crop) return { width: "100%", height: "100%", objectFit: "cover", display: "block" };
  // Показываем только область crop через трансформацию масштабирования
  const scaleX = 1 / crop.w;
  const scaleY = 1 / crop.h;
  return {
    width: `${scaleX * 100}%`,
    height: `${scaleY * 100}%`,
    objectFit: "cover",
    display: "block",
    transform: `translate(-${crop.x * scaleX * 100}%, -${crop.y * scaleY * 100}%)`,
    flexShrink: 0,
  };
}

// ── Пузырьковый график (SVG, без осей) ───────────────────────────────────────

function BubbleChart({ entries, height = 240 }: { entries: ChartEntry[]; height: number }) {
  if (!entries.length) return null;
  const max = Math.max(...entries.map(e => e.value), 1);
  // Расставляем пузыри по кругу
  const W = 500;
  const H = height;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(W, H) * 0.22;
  const minR = maxR * 0.25;

  // Простая упаковка: размещаем по спирали
  const placed: { x: number; y: number; r: number; label: string; value: number; color: string }[] = [];
  const n = entries.length;

  entries.forEach((e, i) => {
    const r = minR + (maxR - minR) * (e.value / max);
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const dist = n === 1 ? 0 : Math.min(W, H) * 0.28;
    placed.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r,
      label: e.label,
      value: e.value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    });
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} aria-label="bubble chart">
      {placed.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity={0.85} />
          <text x={b.x} y={b.y - 4} textAnchor="middle" fontSize={Math.max(9, b.r * 0.38)} fill="#fff" fontWeight="600">
            {b.label.length > 10 ? b.label.slice(0, 9) + "…" : b.label}
          </text>
          <text x={b.x} y={b.y + b.r * 0.42 + 4} textAnchor="middle" fontSize={Math.max(8, b.r * 0.35)} fill="#fff" opacity={0.8}>
            {b.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Графики ───────────────────────────────────────────────────────────────────

function ReportChart({ data, isDark, height = 240 }: { data: ChartData; isDark: boolean; height?: number }) {
  const tc = isDark ? "#999" : "#555";

  if (data.type === "bubble") {
    return <BubbleChart entries={data.entries} height={height} />;
  }

  if (data.type === "pie") return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data.entries.map(e => ({ name: e.label, value: e.value }))}
          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={height * 0.34}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ color: tc, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  // Линейный: каждый показатель — отдельная линия (каждый entry как отдельный датасет)
  if (data.type === "line") {
    // Трактуем данные как серию точек с подписями по оси X
    // Каждый entry — отдельная «серия» на одном x-значении
    // Перегруппируем: строим массив [{name:"1"}, {name:"2"}...] с ключами серий
    const seriesData = data.entries.map((e, i) => ({ name: e.label, [`v${i}`]: e.value }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={seriesData}>
          <XAxis dataKey="name" tick={{ fill: tc, fontSize: 11 }} />
          <YAxis tick={{ fill: tc, fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ color: tc, fontSize: 11 }} />
          {data.entries.map((e, i) => (
            <Line key={i} type="monotone" dataKey={`v${i}`} name={e.label}
              stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
        <XAxis dataKey="name" tick={{ fill: tc, fontSize: 12 }} />
        <YAxis tick={{ fill: tc, fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Слайд-обёртка ──────────────────────────────────────────────────────────

function SlideShell({ isDark, children, minH = 280 }: { isDark: boolean; children: React.ReactNode; minH?: number }) {
  return (
    <div style={{
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      minHeight: minH,
    }}>
      {children}
    </div>
  );
}

// ── Обложка (экранная) ───────────────────────────────────────────────────────

function CoverSlideScreen({ report, editing, onUpdate }: {
  report: Report;
  editing?: boolean;
  onUpdate?: (patch: Partial<Report> & { _coverFile?: File }) => void;
}) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const line = isDark ? "#ffffff" : "#0a0a0a";

  return (
    <div style={{ background: bg, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ position: "relative", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "44px 52px" }}>
        {report.cover_image_url && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              src={report.cover_image_url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, display: "block" }}
            />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ width: 36, height: 3, background: line, marginBottom: 14 }} />
          {editing ? (
            <input value={report.title} onChange={e => onUpdate?.({ title: e.target.value })}
              style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit" }} />
          ) : (
            <p style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>{report.title}</p>
          )}
          {editing ? (
            <input value={report.project_name} onChange={e => onUpdate?.({ project_name: e.target.value })}
              style={{ color: fg, fontSize: "clamp(26px,4vw,52px)", fontWeight: 900, lineHeight: 1.1, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit" }} />
          ) : (
            <h1 style={{ color: fg, fontSize: "clamp(26px,4vw,52px)", fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{report.project_name}</h1>
          )}
          {(report.date_from || report.date_to) && (
            <p style={{ color: sub, fontSize: 15, marginTop: 14 }}>{formatDate(report.date_from)} — {formatDate(report.date_to)}</p>
          )}
        </div>
        {editing && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
            <label style={{ cursor: "pointer", fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#d1d5db"}`, color: isDark ? "#ccc" : "#555", background: isDark ? "rgba(255,255,255,0.06)" : "#f9fafb" }}>
              {report.cover_image_url ? "Сменить обложку" : "+ Обложка"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const f = e.target.files?.[0];
                if (!f || f.size > MAX_IMAGE_BYTES) return;
                onUpdate?.({ cover_image_url: URL.createObjectURL(f), _coverFile: f });
                e.target.value = "";
              }} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Контентный слайд (экранный) ───────────────────────────────────────────────

function ContentSlideScreen({ block, index, report, editing, onUpdateBlock }: {
  block: EditBlock; index: number; report: Report;
  editing?: boolean;
  onUpdateBlock?: (patch: Partial<EditBlock>) => void;
}) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#f0f0f0" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.58)";
  const badgeBg = isDark ? "#ffffff" : "#0a0a0a";
  const badgeFg = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  const hasImage = !!(block._imagePreview || block.image_url);
  const hasChart = block.block_type === "chart" && !!block.chart_data;
  const pos = block.image_position || "right";
  const displaySrc = block._imagePreview || block.image_url;

  const badge = (
    <span style={{ width: 30, height: 30, borderRadius: "50%", background: badgeBg, color: badgeFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </span>
  );

  const headingNode = editing ? (
    <input value={block.heading} onChange={e => onUpdateBlock?.({ heading: e.target.value })}
      style={{ color: fg, fontSize: "clamp(15px,2vw,20px)", fontWeight: 800, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit" }} />
  ) : (
    <h2 style={{ color: fg, fontSize: "clamp(15px,2vw,20px)", fontWeight: 800, margin: 0 }}>{block.heading}</h2>
  );

  const bodyNode = editing ? (
    <textarea value={block.body_text} onChange={e => onUpdateBlock?.({ body_text: e.target.value })} rows={3}
      style={{ color: sub, fontSize: 13, lineHeight: 1.7, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", resize: "vertical", fontFamily: "inherit" }} />
  ) : block.body_text ? (
    <p style={{ color: sub, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{block.body_text}</p>
  ) : null;

  // Компактный загрузчик в режиме редактирования
  const imgUploadNode = editing && (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
      {hasImage && (
        <div style={{ width: 80, height: 52, borderRadius: 6, overflow: "hidden", border: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      <label style={{ cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 8, border: `1px solid ${borderColor}`, color: isDark ? "#ccc" : "#555", background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb" }}>
        {hasImage ? "Сменить" : "+ Фото"}
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
          const f = e.target.files?.[0];
          if (!f || f.size > MAX_IMAGE_BYTES) return;
          onUpdateBlock?.({ _imageFile: f, _imagePreview: URL.createObjectURL(f), image_crop: undefined });
          e.target.value = "";
        }} />
      </label>
      {hasImage && (
        <button onClick={() => onUpdateBlock?.({ _imageFile: undefined, _imagePreview: "", image_url: "" })}
          style={{ fontSize: 11, padding: "4px 8px", borderRadius: 8, border: `1px solid ${borderColor}`, color: "#ef4444", background: "transparent", cursor: "pointer" }}>
          Удалить
        </button>
      )}
      {hasImage && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[{ v: "left" as const, l: "◀" }, { v: "right" as const, l: "▶" }, { v: "bg" as const, l: "Фон" }, { v: "full" as const, l: "Весь" }].map(p => (
            <button key={p.v} onClick={() => onUpdateBlock?.({ image_position: p.v })}
              style={{ fontSize: 10, padding: "3px 7px", borderRadius: 6, border: `1px solid ${block.image_position === p.v ? (isDark ? "#fff" : "#000") : borderColor}`, background: block.image_position === p.v ? (isDark ? "#fff" : "#000") : "transparent", color: block.image_position === p.v ? (isDark ? "#000" : "#fff") : sub, cursor: "pointer" }}>
              {p.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const commonShell: React.CSSProperties = {
    background: bg,
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  };

  // График
  if (hasChart && block.chart_data) {
    return (
      <div style={commonShell}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>{badge}{headingNode}</div>
          {bodyNode}
          {imgUploadNode}
          <div style={{ marginTop: 16 }}>
            <ReportChart data={block.chart_data} isDark={isDark} />
          </div>
        </div>
      </div>
    );
  }

  // Полный слайд / фон
  if ((pos === "full" || pos === "bg") && hasImage) {
    return (
      <div style={{ ...commonShell, position: "relative", minHeight: 280 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.78)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, padding: "28px 32px", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: pos === "full" ? "flex-end" : "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingNode}</div>
          {bodyNode}
          {imgUploadNode}
        </div>
      </div>
    );
  }

  // Слева / Справа
  const imgBox = hasImage ? (
    <div style={{ flex: "0 0 44%", overflow: "hidden", minHeight: 220 }}>
      <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  ) : null;

  const textBox = (
    <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingNode}</div>
      {bodyNode}
      {imgUploadNode}
    </div>
  );

  return (
    <div style={{ ...commonShell, display: "flex" }}>
      {pos === "left" && imgBox}
      {textBox}
      {pos !== "left" && imgBox}
    </div>
  );
}

// ── PDF-слайды (фиксированный SLIDE_W × SLIDE_H) ─────────────────────────────

function PdfCoverSlide({ report }: { report: Report }) {
  const isDark = report.theme === "dark";
  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: isDark ? "#0a0a0a" : "#ffffff", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "72px 96px" }}>
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt="" crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28 }} />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ width: 48, height: 4, background: isDark ? "#fff" : "#0a0a0a", marginBottom: 22 }} />
        <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)", fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 18px" }}>{report.title}</p>
        <h1 style={{ color: isDark ? "#fff" : "#0a0a0a", fontSize: 72, fontWeight: 900, lineHeight: 1.05, margin: "0 0 22px" }}>{report.project_name}</h1>
        {(report.date_from || report.date_to) && (
          <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)", fontSize: 22, margin: 0 }}>{formatDate(report.date_from)} — {formatDate(report.date_to)}</p>
        )}
      </div>
    </div>
  );
}

function PdfContentSlide({ block, index, report }: { block: Block; index: number; report: Report }) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#f0f0f0" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const badgeBg = isDark ? "#ffffff" : "#0a0a0a";
  const badgeFg = isDark ? "#0a0a0a" : "#ffffff";
  const hasImage = !!block.image_url;
  const hasChart = block.block_type === "chart" && !!block.chart_data;
  const pos = block.image_position || "right";

  const badge = (
    <span style={{ width: 44, height: 44, borderRadius: "50%", background: badgeBg, color: badgeFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </span>
  );
  const heading = <h2 style={{ color: fg, fontSize: 40, fontWeight: 800, margin: 0, lineHeight: 1.15 }}>{block.heading}</h2>;
  const body = block.body_text ? <p style={{ color: sub, fontSize: 22, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{block.body_text}</p> : null;

  if (hasChart && block.chart_data) {
    return (
      <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, display: "flex", flexDirection: "column", padding: "56px 80px", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{badge}{heading}</div>
        {body}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReportChart data={block.chart_data} isDark={isDark} height={360} />
        </div>
      </div>
    );
  }

  if ((pos === "full" || pos === "bg") && hasImage) {
    return (
      <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, position: "relative", overflow: "hidden" }}>
        <img src={block.image_url} alt="" crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.78)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: pos === "full" ? "flex-end" : "center", padding: "56px 80px", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{badge}{heading}</div>
          {body}
        </div>
      </div>
    );
  }

  const imgEl = hasImage ? (
    <div style={{ flex: "0 0 44%", overflow: "hidden", height: SLIDE_H }}>
      <img src={block.image_url} alt="" crossOrigin="anonymous"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  ) : null;

  const textEl = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 80px", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{badge}{heading}</div>
      {body}
    </div>
  );

  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, display: "flex", overflow: "hidden" }}>
      {pos === "left" && imgEl}
      {textEl}
      {pos !== "left" && imgEl}
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get("token") || (id ? localStorage.getItem(`report_token_${id}`) : null);

  const [report, setReport] = useState<Report | null>(null);
  const [editBlocks, setEditBlocks] = useState<EditBlock[]>([]);
  const [editCover, setEditCover] = useState<Partial<Report> & { _coverFile?: File }>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!id) return;
    const headers: Record<string, string> = {};
    if (rawToken) headers["X-Edit-Token"] = rawToken;
    fetch(`${REPORTS_URL}?id=${id}`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); return; }
        setReport(data);
        setEditBlocks(data.blocks.map((b: Block) => ({ ...b })));
        setEditCover({ title: data.title, project_name: data.project_name, cover_image_url: data.cover_image_url });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, rawToken]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/report/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!report || !rawToken) return;
    setSaving(true);
    try {
      let coverUrl = editCover.cover_image_url ?? report.cover_image_url;
      if (editCover._coverFile) {
        const { data, type } = await fileToBase64(editCover._coverFile);
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
          body: JSON.stringify({ report_id: id, image_data: data, content_type: type }),
        });
        coverUrl = (await res.json()).url;
      }

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
        body: JSON.stringify({
          action: "update_report",
          title: editCover.title ?? report.title,
          project_name: editCover.project_name ?? report.project_name,
          date_from: report.date_from, date_to: report.date_to,
          cover_image_url: coverUrl, theme: report.theme,
        }),
      });

      const savedBlocks = await Promise.all(editBlocks.map(async b => {
        let imgUrl = b.image_url;
        if (b._imageFile) {
          const { data, type } = await fileToBase64(b._imageFile);
          const res = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
            body: JSON.stringify({ report_id: id, image_data: data, content_type: type }),
          });
          imgUrl = (await res.json()).url;
        }
        return { block_type: b.block_type, heading: b.heading, body_text: b.body_text, image_url: imgUrl || null, image_position: b.image_position, image_crop: b.image_crop || null, chart_data: b.chart_data || null };
      }));

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
        body: JSON.stringify({ action: "upsert_blocks", blocks: savedBlocks }),
      });

      const fresh = await fetch(`${REPORTS_URL}?id=${id}`, { headers: { "X-Edit-Token": rawToken } }).then(r => r.json());
      setReport(fresh);
      setEditBlocks(fresh.blocks.map((b: Block) => ({ ...b })));
      setEditCover({ title: fresh.title, project_name: fresh.project_name, cover_image_url: fresh.cover_image_url });
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert("Ошибка сохранения. Попробуй снова.");
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (!report || !pdfContainerRef.current) return;
    setPdfLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const slides = pdfContainerRef.current.querySelectorAll<HTMLElement>(".pdf-sl");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [SLIDE_W, SLIDE_H], compress: true });
      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i], {
          scale: 1, useCORS: true, allowTaint: true,
          backgroundColor: report.theme === "dark" ? "#0a0a0a" : "#ffffff",
          width: SLIDE_W, height: SLIDE_H, logging: false,
        });
        if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], "landscape");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, SLIDE_W, SLIDE_H);
      }
      pdf.save(`Отчёт_${report.project_name || "клиент"}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Не удалось сгенерировать PDF. Попробуй снова.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <div className="font-golos min-h-screen bg-white flex items-center justify-center">
      <Icon name="Loader" size={32} className="animate-spin text-gray-400" />
    </div>
  );

  if (notFound || !report) return (
    <div className="font-golos min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-5xl">🛸</div>
      <h1 className="text-2xl font-bold">Отчёт не найден</h1>
      <p className="text-gray-500 max-w-xs">Отчёт мог быть удалён — данные хранятся 5 часов.</p>
      <Link to="/useful" className="text-sm font-semibold underline underline-offset-4">Полезное</Link>
    </div>
  );

  const isDark = report.theme === "dark";
  const pageBg = isDark ? "#0a0a0a" : "#f5f5f7";
  const headerBg = isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)";
  const headerBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const textColor = isDark ? "#fff" : "#0a0a0a";
  const mutedColor = isDark ? "rgba(255,255,255,0.45)" : "#9ca3af";
  const btnBg = isDark ? "#fff" : "#0a0a0a";
  const btnFg = isDark ? "#0a0a0a" : "#fff";

  const displayBlocks: EditBlock[] = editing ? editBlocks : report.blocks.map(b => ({ ...b }));
  const displayReport: Report = {
    ...report,
    title: editing ? (editCover.title ?? report.title) : report.title,
    project_name: editing ? (editCover.project_name ?? report.project_name) : report.project_name,
    cover_image_url: editing ? (editCover.cover_image_url ?? report.cover_image_url) : report.cover_image_url,
  };

  return (
    <div className="font-golos min-h-screen" style={{ background: pageBg }}>
      <header className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ background: headerBg, borderColor: headerBorder }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium shrink-0" style={{ color: mutedColor }}>
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">Полезное</span>
            </Link>
            <span className="hidden sm:inline shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.12)" : "#d1d5db" }}>|</span>
            <span className="font-bold text-sm truncate" style={{ color: textColor }}>{report.project_name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {report.can_edit && !editing && (
              <span className="text-xs hidden lg:block" style={{ color: mutedColor }}>{timeLeft(report.expires_at)}</span>
            )}
            {report.can_edit && !editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: textColor }}>
                <Icon name="Pencil" size={12} />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => { setEditing(false); setEditBlocks(report.blocks.map(b => ({ ...b }))); setEditCover({ title: report.title, project_name: report.project_name, cover_image_url: report.cover_image_url }); }}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: mutedColor }}>
                  Отмена
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                  style={{ background: btnBg, color: btnFg }}>
                  {saving ? <Icon name="Loader" size={12} className="animate-spin" /> : <Icon name="Check" size={12} />}
                  Сохранить
                </button>
              </>
            )}
            {!editing && (
              <>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb", color: isDark ? "rgba(255,255,255,0.7)" : "#374151" }}>
                  <Icon name={copied ? "Check" : "Link"} size={13} />
                  {copied ? "Скопировано" : "Ссылка"}
                </button>
                <button onClick={downloadPdf} disabled={pdfLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                  style={{ background: btnBg, color: btnFg }}>
                  {pdfLoading ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Download" size={13} />}
                  <span className="hidden sm:inline">{pdfLoading ? "Готовлю..." : "PDF"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {editing && (
        <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#fffbeb", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#fde68a"}` }}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-2 flex items-center gap-2">
            <Icon name="Pencil" size={12} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#92400e" } as React.CSSProperties} />
            <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#92400e" }}>
              Режим редактирования — редактируй текст прямо в слайдах
            </p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <CoverSlideScreen report={displayReport} editing={editing}
          onUpdate={patch => setEditCover(prev => ({ ...prev, ...patch }))} />
        {displayBlocks.map((block, i) => (
          <ContentSlideScreen key={block.id} block={block} index={i} report={displayReport} editing={editing}
            onUpdateBlock={patch => setEditBlocks(prev => prev.map((b, bi) => bi === i ? { ...b, ...patch } : b))} />
        ))}
        {report.can_edit && !editing && (
          <div className="mt-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}` }}>
            <Icon name="Clock" size={14} className="shrink-0 mt-0.5" style={{ color: mutedColor } as React.CSSProperties} />
            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280" }}>
              Отчёт удалится <b style={{ color: textColor }}>{new Date(report.expires_at).toLocaleString("ru-RU")}</b>
            </p>
          </div>
        )}
      </main>

      {/* Скрытые PDF-слайды */}
      <div ref={pdfContainerRef} aria-hidden="true"
        style={{ position: "fixed", left: -99999, top: 0, width: SLIDE_W, pointerEvents: "none", zIndex: -1 }}>
        <div className="pdf-sl" style={{ width: SLIDE_W, height: SLIDE_H, overflow: "hidden" }}>
          <PdfCoverSlide report={displayReport} />
        </div>
        {report.blocks.map((block, i) => (
          <div key={block.id} className="pdf-sl" style={{ width: SLIDE_W, height: SLIDE_H, overflow: "hidden" }}>
            <PdfContentSlide block={block} index={i} report={report} />
          </div>
        ))}
      </div>
    </div>
  );
}
