import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Размер слайда PDF (фиксированный)
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

// ── утилиты ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

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

// Стиль кадрированного изображения (абсолютное позиционирование внутри overflow:hidden)
function cropImgStyle(crop?: CropArea): React.CSSProperties {
  if (!crop) return { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  return {
    position: "absolute",
    width: `${(1 / crop.w) * 100}%`,
    height: `${(1 / crop.h) * 100}%`,
    top: `${-(crop.y / crop.h) * 100}%`,
    left: `${-(crop.x / crop.w) * 100}%`,
    objectFit: "cover",
  };
}

// ── Графики ──────────────────────────────────────────────────────────────────

function ReportChart({ data, isDark, height = 240 }: { data: ChartData; isDark: boolean; height?: number }) {
  const tc = isDark ? "#aaa" : "#555";
  const colors = CHART_COLORS;

  if (data.type === "pie") return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data.entries.map(e => ({ name: e.label, value: e.value }))}
          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={height * 0.35}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.entries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip /><Legend wrapperStyle={{ color: tc, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  if (data.type === "line") return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.entries.map(e => ({ name: e.label, value: e.value }))}>
        <XAxis dataKey="name" tick={{ fill: tc, fontSize: 12 }} />
        <YAxis tick={{ fill: tc, fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} dot={{ r: 5, fill: colors[0] }} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (data.type === "bubble") {
    const max = Math.max(...data.entries.map(e => e.value || 1), 1);
    const pts = data.entries.map((e, i) => ({ x: i + 1, y: e.value, z: e.value, name: e.label }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" tick={{ fill: tc, fontSize: 11 }}
            tickFormatter={v => data.entries[v - 1]?.label || ""}
            domain={[0.5, data.entries.length + 0.5]}
            ticks={data.entries.map((_, i) => i + 1)} />
          <YAxis type="number" dataKey="y" tick={{ fill: tc, fontSize: 11 }} />
          <ZAxis type="number" dataKey="z" range={[300, Math.max(2000, max * 15)]} />
          <Tooltip formatter={(_v, _n, p) => [(p.payload as {y:number}).y, (p.payload as {name:string}).name]} />
          <Scatter data={pts}>
            {pts.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Scatter>
        </ScatterChart>
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
          {data.entries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Слайды (экранные — адаптивные) ──────────────────────────────────────────

function SlideShell({ isDark, children, minH = 320 }: { isDark: boolean; children: React.ReactNode; minH?: number }) {
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

type EditBlock = Block & { _imageFile?: File; _imagePreview?: string };

interface SlideProps {
  report: Report;
  blockIndex?: number;           // для контентных слайдов
  block?: EditBlock;
  editing?: boolean;
  onUpdateBlock?: (patch: Partial<EditBlock>) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

function CoverSlideScreen({ report, editing, onUpdate }: {
  report: Report;
  editing?: boolean;
  onUpdate?: (patch: Partial<Report>) => void;
}) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const line = isDark ? "#ffffff" : "#0a0a0a";

  return (
    <div style={{ background: bg, border: `1px solid ${isDark?"rgba(255,255,255,0.1)":"#e5e7eb"}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ position: "relative", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "44px 52px" }}>
        {report.cover_image_url && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img src={report.cover_image_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} crossOrigin="anonymous" />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ width: 36, height: 3, background: line, marginBottom: 14 }} />
          {editing ? (
            <input value={report.title} onChange={e => onUpdate?.({ title: e.target.value })}
              style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.4)", borderRadius: 4, padding: "2px 4px", width: "100%" }} />
          ) : (
            <p style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>{report.title}</p>
          )}
          {editing ? (
            <input value={report.project_name} onChange={e => onUpdate?.({ project_name: e.target.value })}
              style={{ color: fg, fontSize: "clamp(26px,4vw,54px)", fontWeight: 900, lineHeight: 1.1, margin: 0, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.4)", borderRadius: 4, padding: "2px 4px", width: "100%" }} />
          ) : (
            <h1 style={{ color: fg, fontSize: "clamp(26px,4vw,54px)", fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{report.project_name}</h1>
          )}
          {(report.date_from || report.date_to) && (
            <p style={{ color: sub, fontSize: 15, marginTop: 14 }}>
              {formatDate(report.date_from)} — {formatDate(report.date_to)}
            </p>
          )}
        </div>
        {editing && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
            <label style={{ cursor: "pointer", fontSize: 11, color: isDark ? "#ccc" : "#555", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", padding: "4px 10px", borderRadius: 8 }}>
              {report.cover_image_url ? "Сменить обложку" : "+ Обложка"}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f || f.size > MAX_IMAGE_BYTES) return;
                  onUpdate?.({ cover_image_url: URL.createObjectURL(f), _coverFile: f } as Partial<Report> & { _coverFile: File });
                  e.target.value = "";
                }} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentSlideScreen({ block, index, report, editing, onUpdateBlock, onUploadImage }: {
  block: EditBlock; index: number; report: Report;
  editing?: boolean;
  onUpdateBlock?: (patch: Partial<EditBlock>) => void;
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#f0f0f0" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const badgeBg = isDark ? "#ffffff" : "#0a0a0a";
  const badgeFg = isDark ? "#0a0a0a" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  const hasImage = !!(block._imagePreview || block.image_url);
  const hasChart = block.block_type === "chart" && !!block.chart_data;
  const pos = block.image_position || "right";
  const displaySrc = block._imagePreview || block.image_url;

  const badge = (
    <span style={{ width: 30, height: 30, borderRadius: "50%", background: badgeBg, color: badgeFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </span>
  );

  const headingNode = editing ? (
    <input value={block.heading} onChange={e => onUpdateBlock?.({ heading: e.target.value })}
      style={{ color: fg, fontSize: "clamp(15px,2vw,21px)", fontWeight: 800, margin: 0, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.4)", borderRadius: 4, padding: "2px 6px", width: "100%" }} />
  ) : (
    <h2 style={{ color: fg, fontSize: "clamp(15px,2vw,21px)", fontWeight: 800, margin: 0 }}>{block.heading}</h2>
  );

  const bodyNode = editing ? (
    <textarea value={block.body_text} onChange={e => onUpdateBlock?.({ body_text: e.target.value })} rows={4}
      style={{ color: sub, fontSize: "clamp(12px,1.4vw,14px)", lineHeight: 1.75, margin: 0, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.4)", borderRadius: 4, padding: "2px 6px", width: "100%", resize: "vertical" }} />
  ) : block.body_text ? (
    <p style={{ color: sub, fontSize: "clamp(12px,1.4vw,14px)", lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{block.body_text}</p>
  ) : null;

  // Загрузчик изображения в режиме редактирования (компактный)
  const imgUploadNode = editing && (
    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {hasImage && (
        <div style={{ position: "relative", width: 80, height: 56, borderRadius: 6, overflow: "hidden", border: `1px solid ${border}`, flexShrink: 0 }}>
          <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={() => onUpdateBlock?.({ _imageFile: undefined, _imagePreview: "", image_url: "" })}
            style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}
      <label style={{ cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: isDark ? "#ccc" : "#555" }}>
        {hasImage ? "Сменить фото" : "+ Добавить фото"}
        <input type="file" accept="image/*" style={{ display: "none" }}
          onChange={async e => {
            const f = e.target.files?.[0];
            if (!f || f.size > MAX_IMAGE_BYTES) return;
            onUpdateBlock?.({ _imageFile: f, _imagePreview: URL.createObjectURL(f), image_crop: undefined });
            e.target.value = "";
          }} />
      </label>
      {hasImage && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[
            { v: "left" as const, l: "◀ Слева" },
            { v: "right" as const, l: "Справа ▶" },
            { v: "bg" as const, l: "Фон" },
            { v: "full" as const, l: "Весь" },
          ].map(p => (
            <button key={p.v} onClick={() => onUpdateBlock?.({ image_position: p.v })}
              style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${block.image_position === p.v ? (isDark?"#fff":"#000") : border}`, background: block.image_position === p.v ? (isDark?"#fff":"#000") : "transparent", color: block.image_position === p.v ? (isDark?"#000":"#fff") : sub, cursor: "pointer" }}>
              {p.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Фон / полный слайд
  if ((pos === "bg" || pos === "full") && hasImage) {
    return (
      <SlideShell isDark={isDark} minH={280}>
        <div style={{ position: "relative", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: pos === "full" ? "flex-end" : "center" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img src={displaySrc} alt="" style={cropImgStyle(block.image_crop)} crossOrigin="anonymous" />
            <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.78)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 2, padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>{badge}{headingNode}</div>
            {bodyNode}
            {imgUploadNode}
          </div>
        </div>
      </SlideShell>
    );
  }

  // Для графика
  if (hasChart && block.chart_data) {
    return (
      <SlideShell isDark={isDark}>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>{badge}{headingNode}</div>
          {bodyNode}
          {imgUploadNode}
          <div style={{ marginTop: 16 }}>
            <ReportChart data={block.chart_data} isDark={isDark} />
          </div>
        </div>
      </SlideShell>
    );
  }

  // Слева / Справа
  const imgEl = hasImage ? (
    <div style={{ flex: "0 0 45%", position: "relative", minHeight: 220, overflow: "hidden" }}>
      <img src={displaySrc} alt="" style={cropImgStyle(block.image_crop)} crossOrigin="anonymous" />
    </div>
  ) : null;

  const textEl = (
    <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{badge}{headingNode}</div>
      {bodyNode}
      {imgUploadNode}
    </div>
  );

  return (
    <SlideShell isDark={isDark}>
      <div style={{ display: "flex" }}>
        {pos === "left" && imgEl}
        {textEl}
        {pos !== "left" && imgEl}
      </div>
    </SlideShell>
  );
}

// ── PDF-слайды (фиксированный размер SLIDE_W × SLIDE_H) ─────────────────────

function PdfCoverSlide({ report }: { report: Report }) {
  const isDark = report.theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const line = isDark ? "#ffffff" : "#0a0a0a";

  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "72px 96px" }}>
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt="" crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
      )}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ width: 48, height: 4, background: line, marginBottom: 22 }} />
        <p style={{ color: sub, fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>{report.title}</p>
        <h1 style={{ color: fg, fontSize: 72, fontWeight: 900, lineHeight: 1.05, margin: 0 }}>{report.project_name}</h1>
        {(report.date_from || report.date_to) && (
          <p style={{ color: sub, fontSize: 22, marginTop: 22 }}>{formatDate(report.date_from)} — {formatDate(report.date_to)}</p>
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
  const pad = "64px 96px";

  const badge = (
    <span style={{ width: 44, height: 44, borderRadius: "50%", background: badgeBg, color: badgeFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </span>
  );
  const heading = <h2 style={{ color: fg, fontSize: 40, fontWeight: 800, margin: 0 }}>{block.heading}</h2>;
  const body = block.body_text ? <p style={{ color: sub, fontSize: 22, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{block.body_text}</p> : null;

  if (hasChart && block.chart_data) {
    return (
      <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: pad, gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{badge}{heading}</div>
        {body}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReportChart data={block.chart_data} isDark={isDark} height={320} />
        </div>
      </div>
    );
  }

  if ((pos === "full" || pos === "bg") && hasImage) {
    return (
      <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, position: "relative", overflow: "hidden" }}>
        <img src={block.image_url} alt="" crossOrigin="anonymous" style={cropImgStyle(block.image_crop)} />
        <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.78)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: pos === "full" ? "flex-end" : "center", padding: pad, gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{badge}{heading}</div>
          {body}
        </div>
      </div>
    );
  }

  const imgEl = hasImage ? (
    <div style={{ flex: "0 0 45%", position: "relative", overflow: "hidden", height: SLIDE_H }}>
      <img src={block.image_url} alt="" crossOrigin="anonymous" style={cropImgStyle(block.image_crop)} />
    </div>
  ) : null;

  const textEl = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: pad, gap: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{badge}{heading}</div>
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

// ── Главный компонент ────────────────────────────────────────────────────────

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

  // Сохранить правки
  const handleSave = async () => {
    if (!report || !rawToken) return;
    setSaving(true);
    try {
      // Загружаем новую обложку, если есть
      let coverUrl = editCover.cover_image_url || report.cover_image_url;
      if ((editCover as { _coverFile?: File })._coverFile) {
        const { data, type } = await fileToBase64((editCover as { _coverFile: File })._coverFile);
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
          body: JSON.stringify({ report_id: id, image_data: data, content_type: type }),
        });
        const j = await res.json();
        coverUrl = j.url;
      }

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
        body: JSON.stringify({
          action: "update_report",
          title: editCover.title ?? report.title,
          project_name: editCover.project_name ?? report.project_name,
          date_from: report.date_from, date_to: report.date_to,
          cover_image_url: coverUrl,
          theme: report.theme,
        }),
      });

      // Загружаем новые изображения блоков
      const savedBlocks = await Promise.all(editBlocks.map(async b => {
        let imgUrl = b.image_url;
        if (b._imageFile) {
          const { data, type } = await fileToBase64(b._imageFile);
          const res = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
            body: JSON.stringify({ report_id: id, image_data: data, content_type: type }),
          });
          const j = await res.json();
          imgUrl = j.url;
        }
        return { block_type: b.block_type, heading: b.heading, body_text: b.body_text, image_url: imgUrl || null, image_position: b.image_position, image_crop: b.image_crop || null, chart_data: b.chart_data || null };
      }));

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": rawToken },
        body: JSON.stringify({ action: "upsert_blocks", blocks: savedBlocks }),
      });

      // Перезагружаем данные
      const headers: Record<string, string> = { "X-Edit-Token": rawToken };
      const fresh = await fetch(`${REPORTS_URL}?id=${id}`, { headers }).then(r => r.json());
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

  // PDF через html2canvas — рендерим скрытые фиксированные слайды
  const downloadPdf = async () => {
    if (!report || !pdfContainerRef.current) return;
    setPdfLoading(true);
    try {
      // Ждём отрисовку recharts + изображений
      await new Promise(r => setTimeout(r, 700));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const slides = pdfContainerRef.current.querySelectorAll<HTMLElement>(".pdf-sl");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [SLIDE_W, SLIDE_H], compress: true });

      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i], {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: report.theme === "dark" ? "#0a0a0a" : "#ffffff",
          width: SLIDE_W,
          height: SLIDE_H,
          logging: false,
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

  // Данные для отображения (с учётом редактирования)
  const displayBlocks = editing ? editBlocks : (report.blocks as EditBlock[]);
  const displayTitle = editing ? (editCover.title ?? report.title) : report.title;
  const displayProjectName = editing ? (editCover.project_name ?? report.project_name) : report.project_name;
  const displayCoverUrl = editing ? (editCover._coverFile ? editCover.cover_image_url : (editCover.cover_image_url ?? report.cover_image_url)) : report.cover_image_url;

  const reportForSlides: Report = {
    ...report,
    title: displayTitle,
    project_name: displayProjectName,
    cover_image_url: displayCoverUrl,
  };

  return (
    <div className="font-golos min-h-screen" style={{ background: pageBg }}>
      {/* Шапка */}
      <header className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ background: headerBg, borderColor: headerBorder }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/useful" className="flex items-center gap-1.5 text-sm font-medium shrink-0"
              style={{ color: mutedColor }}>
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">Полезное</span>
            </Link>
            <span className="hidden sm:inline shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }}>|</span>
            <span className="font-bold text-sm truncate" style={{ color: textColor }}>
              {report.project_name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {report.can_edit && (
              <span className="text-xs hidden lg:block" style={{ color: mutedColor }}>
                {timeLeft(report.expires_at)}
              </span>
            )}
            {report.can_edit && !editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: textColor }}>
                <Icon name="Pencil" size={13} />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => { setEditing(false); setEditBlocks(report.blocks.map(b => ({ ...b }))); setEditCover({ title: report.title, project_name: report.project_name, cover_image_url: report.cover_image_url }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: mutedColor }}>
                  Отмена
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                  style={{ background: btnBg, color: btnFg }}>
                  {saving ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Check" size={13} />}
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

      {/* Баннер редактирования */}
      {editing && (
        <div style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fffbeb", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#fde68a"}` }}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-2 flex items-center gap-2">
            <Icon name="Pencil" size={13} style={{ color: isDark ? "#fff" : "#92400e" } as React.CSSProperties} />
            <p className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#92400e" }}>
              Режим редактирования — нажимай на текст прямо в слайдах
            </p>
          </div>
        </div>
      )}

      {/* Контент */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <CoverSlideScreen
          report={reportForSlides}
          editing={editing}
          onUpdate={patch => setEditCover(prev => ({ ...prev, ...patch }))}
        />
        {displayBlocks.map((block, i) => (
          <ContentSlideScreen
            key={block.id}
            block={block}
            index={i}
            report={reportForSlides}
            editing={editing}
            onUpdateBlock={patch => setEditBlocks(prev => prev.map((b, bi) => bi === i ? { ...b, ...patch } : b))}
          />
        ))}

        {report.can_edit && !editing && (
          <div className="mt-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}` }}>
            <Icon name="Clock" size={15} className="shrink-0 mt-0.5" style={{ color: mutedColor } as React.CSSProperties} />
            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
              Отчёт удалится <b style={{ color: textColor }}>{new Date(report.expires_at).toLocaleString("ru-RU")}</b>
            </p>
          </div>
        )}
      </main>

      {/* Скрытый PDF-контейнер: фиксированные слайды SLIDE_W × SLIDE_H */}
      <div ref={pdfContainerRef} aria-hidden="true"
        style={{ position: "fixed", left: -99999, top: 0, width: SLIDE_W, pointerEvents: "none", zIndex: -1 }}>
        <div className="pdf-sl" style={{ width: SLIDE_W, height: SLIDE_H, overflow: "hidden" }}>
          <PdfCoverSlide report={reportForSlides} />
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
