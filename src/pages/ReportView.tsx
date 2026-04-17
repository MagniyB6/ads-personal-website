import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// PDF слайд 1920×1080
const PDF_W = 1920;
const PDF_H = 1080;

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

// Загрузка изображения в HTMLImageElement (с CORS)
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Попробовать без CORS
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = reject;
      img2.src = src;
    };
    img.src = src;
  });
}

// ── SVG-пузыри ───────────────────────────────────────────────────────────────

function BubbleChartSVG({ entries, isDark, height = 260 }: { entries: ChartEntry[]; isDark: boolean; height?: number }) {
  if (!entries.length) return null;
  const max = Math.max(...entries.map(e => e.value), 1);
  const W = 600;
  const H = height;
  const n = entries.length;
  const maxR = Math.min(W / (n + 1), H * 0.38);
  const minR = maxR * 0.3;

  // Расставляем по кругу или в ряд
  const placed = entries.map((e, i) => {
    const r = minR + (maxR - minR) * Math.sqrt(e.value / max);
    let x: number, y: number;
    if (n === 1) {
      x = W / 2; y = H / 2;
    } else if (n <= 4) {
      const cols = n;
      x = (W / (cols + 1)) * (i + 1);
      y = H / 2;
    } else {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const dist = Math.min(W, H) * 0.3;
      x = W / 2 + Math.cos(angle) * dist;
      y = H / 2 + Math.sin(angle) * dist;
    }
    return { x, y, r, label: e.label, value: e.value, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }}>
      {placed.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity={0.88} />
          <text x={b.x} y={b.y - (b.r > 24 ? 6 : 2)} textAnchor="middle"
            fontSize={Math.max(9, Math.min(b.r * 0.32, 16))} fill="#fff" fontWeight="700" fontFamily="inherit">
            {b.label.length > 12 ? b.label.slice(0, 11) + "…" : b.label}
          </text>
          <text x={b.x} y={b.y + (b.r > 24 ? b.r * 0.38 + 4 : 10)} textAnchor="middle"
            fontSize={Math.max(8, Math.min(b.r * 0.3, 14))} fill="rgba(255,255,255,0.85)" fontFamily="inherit">
            {b.value.toLocaleString("ru-RU")}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Графики (экран) ───────────────────────────────────────────────────────────

function ReportChart({ data, isDark, height = 260 }: { data: ChartData; isDark: boolean; height?: number }) {
  const tc = isDark ? "#888" : "#555";

  if (data.type === "bubble") {
    return <BubbleChartSVG entries={data.entries} isDark={isDark} height={height} />;
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

  // Линейный: каждый entry — отдельная линия (показатель), одна точка на оси X
  // Чтобы показать динамику — рисуем все серии на одном графике
  // Ось X = порядковые номера 1..N, каждая линия = один показатель
  if (data.type === "line") {
    // Строим данные: один набор точек по оси X [1,2,3...], каждая линия = entry
    const points = data.entries.map((_, idx) => idx + 1);
    const chartData = points.map(p => {
      const obj: Record<string, number | string> = { x: p };
      data.entries.forEach((e, i) => { obj[`s${i}`] = i === p - 1 ? e.value : null as unknown as number; });
      return obj;
    });
    // Правильная структура: делаем одну точку на каждый entry
    const singleData = data.entries.map((e, i) => {
      const obj: Record<string, number | string> = { name: e.label };
      // Каждый entry — точка для своей линии
      data.entries.forEach((_, j) => {
        obj[`v${j}`] = j === i ? e.value : undefined as unknown as number;
      });
      return obj;
    });
    // Лучше: просто одна линия но разные цвета через dot + gradient
    // На самом деле для динамики нужны временные ряды — покажем каждый entry как точку одной линии
    // но с цветными точками
    const simpleData = data.entries.map(e => ({ name: e.label, value: e.value }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={simpleData}>
          <XAxis dataKey="name" tick={{ fill: tc, fontSize: 11 }} />
          <YAxis tick={{ fill: tc, fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" strokeWidth={3}
            stroke={CHART_COLORS[0]}
            dot={(props) => {
              const { cx, cy, index } = props;
              const color = CHART_COLORS[index % CHART_COLORS.length];
              return <circle key={index} cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />;
            }}
            activeDot={{ r: 8 }}
          />
          <Legend wrapperStyle={{ color: tc, fontSize: 11 }} formatter={() => data.entries.map(e => e.label).join(", ")} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Bar
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

// ── Слайд 16:9 (предпросмотр) ─────────────────────────────────────────────────

function Slide16x9({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      paddingTop: "56.25%", // 16:9
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
    }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ── Обложка (предпросмотр) ────────────────────────────────────────────────────

function CoverSlideScreen({ report, editing, onUpdate }: {
  report: Report;
  editing?: boolean;
  onUpdate?: (patch: Partial<Report> & { _coverFile?: File }) => void;
}) {
  const isDark = report.theme === "dark";
  const fg = isDark ? "#ffffff" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const line = isDark ? "#ffffff" : "#0a0a0a";

  return (
    <Slide16x9 isDark={isDark}>
      {/* Фоновое изображение */}
      {report.cover_image_url && (
        <img src={report.cover_image_url} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28 }} />
      )}
      {/* Контент */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "6% 7%",
      }}>
        <div style={{ width: "5%", minWidth: 28, height: 3, background: line, marginBottom: "3%" }} />
        {editing ? (
          <input value={report.title} onChange={e => onUpdate?.({ title: e.target.value })}
            style={{ color: sub, fontSize: "clamp(9px,1.2vw,14px)", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "2%", background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "80%", fontFamily: "inherit" }} />
        ) : (
          <p style={{ color: sub, fontSize: "clamp(9px,1.2vw,14px)", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: "2%" }}>{report.title}</p>
        )}
        {editing ? (
          <input value={report.project_name} onChange={e => onUpdate?.({ project_name: e.target.value })}
            style={{ color: fg, fontSize: "clamp(20px,4.5vw,56px)", fontWeight: 900, lineHeight: 1.05, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "80%", fontFamily: "inherit" }} />
        ) : (
          <h1 style={{ color: fg, fontSize: "clamp(20px,4.5vw,56px)", fontWeight: 900, lineHeight: 1.05, margin: 0 }}>{report.project_name}</h1>
        )}
        {(report.date_from || report.date_to) && (
          <p style={{ color: sub, fontSize: "clamp(11px,1.5vw,18px)", marginTop: "2%" }}>
            {formatDate(report.date_from)} — {formatDate(report.date_to)}
          </p>
        )}
      </div>
      {/* Кнопка смены обложки */}
      {editing && (
        <label style={{ position: "absolute", top: 12, right: 12, cursor: "pointer", fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#d1d5db"}`, color: isDark ? "#ccc" : "#555", background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.85)" }}>
          {report.cover_image_url ? "Сменить обложку" : "+ Обложка"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const f = e.target.files?.[0];
            if (!f || f.size > MAX_IMAGE_BYTES) return;
            onUpdate?.({ cover_image_url: URL.createObjectURL(f), _coverFile: f });
            e.target.value = "";
          }} />
        </label>
      )}
    </Slide16x9>
  );
}

// ── Контентный слайд (предпросмотр) ──────────────────────────────────────────

function ContentSlideScreen({ block, index, report, editing, onUpdateBlock }: {
  block: EditBlock; index: number; report: Report;
  editing?: boolean;
  onUpdateBlock?: (patch: Partial<EditBlock>) => void;
}) {
  const isDark = report.theme === "dark";
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
    <span style={{ width: "clamp(22px,2.5vw,32px)", height: "clamp(22px,2.5vw,32px)", borderRadius: "50%", background: badgeBg, color: badgeFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(10px,1.2vw,14px)", fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </span>
  );

  const headingNode = editing ? (
    <input value={block.heading} onChange={e => onUpdateBlock?.({ heading: e.target.value })}
      style={{ color: fg, fontSize: "clamp(13px,2vw,22px)", fontWeight: 800, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit" }} />
  ) : (
    <h2 style={{ color: fg, fontSize: "clamp(13px,2vw,22px)", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{block.heading}</h2>
  );

  const bodyNode = editing ? (
    <textarea value={block.body_text} onChange={e => onUpdateBlock?.({ body_text: e.target.value })} rows={3}
      style={{ color: sub, fontSize: "clamp(10px,1.3vw,14px)", lineHeight: 1.6, background: "transparent", border: "none", outline: "1px dashed rgba(128,128,128,0.5)", borderRadius: 4, padding: "2px 6px", width: "100%", resize: "none", fontFamily: "inherit" }} />
  ) : block.body_text ? (
    <p style={{ color: sub, fontSize: "clamp(10px,1.3vw,14px)", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" }}>{block.body_text}</p>
  ) : null;

  // Компактный загрузчик
  const imgUploadNode = editing && (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
      {hasImage && (
        <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      <label style={{ cursor: "pointer", fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${borderColor}`, color: isDark ? "#ccc" : "#555", background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb" }}>
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
          style={{ fontSize: 10, padding: "3px 7px", borderRadius: 6, border: `1px solid ${borderColor}`, color: "#ef4444", background: "transparent", cursor: "pointer" }}>
          Удалить
        </button>
      )}
      {hasImage && (
        <div style={{ display: "flex", gap: 3 }}>
          {[{ v: "left" as const, l: "◀" }, { v: "right" as const, l: "▶" }, { v: "bg" as const, l: "Фон" }, { v: "full" as const, l: "Весь" }].map(p => (
            <button key={p.v} onClick={() => onUpdateBlock?.({ image_position: p.v })}
              style={{ fontSize: 9, padding: "2px 6px", borderRadius: 5, border: `1px solid ${block.image_position === p.v ? (isDark ? "#fff" : "#000") : borderColor}`, background: block.image_position === p.v ? (isDark ? "#fff" : "#000") : "transparent", color: block.image_position === p.v ? (isDark ? "#000" : "#fff") : sub, cursor: "pointer" }}>
              {p.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // График
  if (hasChart && block.chart_data) {
    return (
      <Slide16x9 isDark={isDark}>
        <div style={{ position: "absolute", inset: 0, padding: "4% 5%", display: "flex", flexDirection: "column", gap: "3%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>{badge}{headingNode}</div>
          {bodyNode}
          {imgUploadNode}
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReportChart data={block.chart_data} isDark={isDark} height={undefined} />
          </div>
        </div>
      </Slide16x9>
    );
  }

  // Полный / фон
  if ((pos === "full" || pos === "bg") && hasImage) {
    return (
      <Slide16x9 isDark={isDark}>
        <img src={displaySrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.78)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: pos === "full" ? "flex-end" : "center", padding: "5% 6%", gap: "3%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>{badge}{headingNode}</div>
          {bodyNode}
          {imgUploadNode}
        </div>
      </Slide16x9>
    );
  }

  // Слева / Справа
  const imgBox = hasImage ? (
    <div style={{ flex: "0 0 44%", overflow: "hidden" }}>
      <img src={displaySrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  ) : null;

  const textBox = (
    <div style={{ flex: 1, padding: "5% 6%", display: "flex", flexDirection: "column", gap: "3%", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>{badge}{headingNode}</div>
      {bodyNode}
      {imgUploadNode}
    </div>
  );

  return (
    <Slide16x9 isDark={isDark}>
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {pos === "left" && imgBox}
        {textBox}
        {pos !== "left" && imgBox}
      </div>
    </Slide16x9>
  );
}

// ── Рендер слайда на Canvas (для PDF) ────────────────────────────────────────

async function drawSlideOnCanvas(
  ctx: CanvasRenderingContext2D,
  slide: { type: "cover" | "content"; block?: Block; report: Report; index?: number },
  W: number,
  H: number
) {
  const { report } = slide;
  const isDark = report.theme === "dark";
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#0a0a0a";
  const sub = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  // Фон
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  const pad = W * 0.07;
  const padV = H * 0.1;

  if (slide.type === "cover") {
    // Фоновое изображение
    if (report.cover_image_url) {
      try {
        const img = await loadImage(report.cover_image_url);
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.restore();
      } catch { /* ignore */ }
    }

    const textY = H * 0.72;
    // Линия-акцент
    ctx.fillStyle = fg;
    ctx.fillRect(pad, textY - H * 0.12, W * 0.04, 4);

    // Заголовок (subtitle)
    ctx.fillStyle = sub;
    ctx.font = `700 ${Math.round(H * 0.022)}px Inter, sans-serif`;
    ctx.letterSpacing = "3px";
    ctx.fillText(report.title.toUpperCase(), pad, textY - H * 0.05);
    ctx.letterSpacing = "0px";

    // Название проекта
    ctx.fillStyle = fg;
    const titleSize = Math.round(H * 0.1);
    ctx.font = `900 ${titleSize}px Inter, sans-serif`;
    // Перенос по словам
    wrapText(ctx, report.project_name, pad, textY + titleSize * 0.8, W - pad * 2, titleSize * 1.1, 1);

    // Дата
    if (report.date_from || report.date_to) {
      ctx.fillStyle = sub;
      ctx.font = `400 ${Math.round(H * 0.028)}px Inter, sans-serif`;
      ctx.fillText(`${formatDate(report.date_from)} — ${formatDate(report.date_to)}`, pad, H * 0.88);
    }

  } else if (slide.type === "content" && slide.block) {
    const block = slide.block;
    const idx = slide.index ?? 0;
    const hasImage = !!block.image_url;
    const pos = block.image_position || "right";

    let textX = pad;
    let textW = W - pad * 2;

    // Изображение
    if (hasImage && block.image_url) {
      try {
        const img = await loadImage(block.image_url);

        if (pos === "bg" || pos === "full") {
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.drawImage(img, 0, 0, W, H);
          ctx.fillStyle = isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.8)";
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        } else {
          const imgW = W * 0.44;
          const imgX = pos === "left" ? 0 : W - imgW;
          ctx.drawImage(img, imgX, 0, imgW, H);
          if (pos === "left") { textX = imgW + pad; textW = W - imgW - pad * 1.5; }
          else { textW = W - imgW - pad * 1.5; }
        }
      } catch { /* ignore */ }
    }

    // Бейдж
    const badgeR = H * 0.045;
    const badgeX = textX + badgeR;
    const badgeY = padV + badgeR;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#ffffff" : "#0a0a0a";
    ctx.fill();
    ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
    ctx.font = `800 ${Math.round(badgeR * 1.1)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(String(idx + 1), badgeX, badgeY + badgeR * 0.38);
    ctx.textAlign = "left";

    // Заголовок
    const headingY = badgeY + badgeR + H * 0.06;
    const headingSize = Math.round(H * 0.065);
    ctx.fillStyle = fg;
    ctx.font = `800 ${headingSize}px Inter, sans-serif`;
    wrapText(ctx, block.heading, textX, headingY, textW, headingSize * 1.2, 2);

    // Текст
    if (block.body_text) {
      const bodySize = Math.round(H * 0.03);
      ctx.fillStyle = sub;
      ctx.font = `400 ${bodySize}px Inter, sans-serif`;
      wrapText(ctx, block.body_text, textX, headingY + headingSize * 2.6, textW, bodySize * 1.6, 5);
    }

    // График (рисуем placeholder с текстом — recharts не рендерится в canvas)
    if (block.block_type === "chart" && block.chart_data) {
      drawChartOnCanvas(ctx, block.chart_data, textX, H * 0.45, textW, H * 0.42, isDark);
    }
  }
}

// Перенос текста в canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, maxLines: number) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + lineCount * lineH);
      lineCount++;
      if (lineCount >= maxLines) { ctx.fillText("...", x, y + lineCount * lineH); return; }
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + lineCount * lineH);
}

// Рисуем упрощённый график на canvas
function drawChartOnCanvas(
  ctx: CanvasRenderingContext2D,
  data: ChartData,
  x: number, y: number, w: number, h: number,
  isDark: boolean
) {
  const entries = data.entries;
  if (!entries.length) return;
  const max = Math.max(...entries.map(e => e.value), 1);
  const tc = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

  if (data.type === "bar") {
    const barW = (w / entries.length) * 0.6;
    const gap = (w / entries.length) * 0.4;
    entries.forEach((e, i) => {
      const bh = (e.value / max) * h * 0.75;
      const bx = x + i * (barW + gap) + gap / 2;
      const by = y + h - bh;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, bh, 6);
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();
      // Подпись
      ctx.fillStyle = tc;
      ctx.font = `400 ${Math.round(h * 0.06)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      const labelX = bx + barW / 2;
      ctx.fillText(e.label.length > 8 ? e.label.slice(0, 7) + "…" : e.label, labelX, y + h + h * 0.06);
      ctx.fillStyle = isDark ? "#fff" : "#111";
      ctx.font = `700 ${Math.round(h * 0.065)}px Inter, sans-serif`;
      ctx.fillText(String(e.value), labelX, by - h * 0.03);
      ctx.textAlign = "left";
    });
  } else if (data.type === "pie") {
    const cx = x + w / 2;
    const cy = y + h * 0.45;
    const r = Math.min(w, h) * 0.32;
    let startAngle = -Math.PI / 2;
    const total = entries.reduce((s, e) => s + e.value, 0);
    entries.forEach((e, i) => {
      const sweep = (e.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();
      startAngle += sweep;
    });
    // Легенда
    entries.forEach((e, i) => {
      const lx = x + (i % 3) * (w / 3);
      const ly = y + h * 0.82 + Math.floor(i / 3) * h * 0.1;
      ctx.beginPath();
      ctx.arc(lx + h * 0.035, ly, h * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();
      ctx.fillStyle = tc;
      ctx.font = `400 ${Math.round(h * 0.055)}px Inter, sans-serif`;
      ctx.fillText(e.label.slice(0, 10), lx + h * 0.08, ly + h * 0.02);
    });
  } else if (data.type === "line") {
    // Линейный
    const pts = entries.map((e, i) => ({
      px: x + (i / (entries.length - 1 || 1)) * w,
      py: y + h * 0.8 - (e.value / max) * h * 0.7,
      e,
    }));
    ctx.beginPath();
    pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.px, p.py); else ctx.lineTo(p.px, p.py); });
    ctx.strokeStyle = CHART_COLORS[0];
    ctx.lineWidth = 3;
    ctx.stroke();
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.px, p.py, 6, 0, Math.PI * 2);
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = isDark ? "#0a0a0a" : "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = tc;
      ctx.font = `400 ${Math.round(h * 0.055)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(p.e.label.length > 6 ? p.e.label.slice(0, 5) + "…" : p.e.label, p.px, y + h * 0.88);
      ctx.textAlign = "left";
    });
  } else if (data.type === "bubble") {
    const cx = x + w / 2;
    const cy = y + h * 0.45;
    const n = entries.length;
    const maxR = Math.min(w / (n + 1), h * 0.35);
    const minR = maxR * 0.3;
    entries.forEach((e, i) => {
      const r = minR + (maxR - minR) * Math.sqrt(e.value / max);
      let bx: number, by: number;
      if (n === 1) { bx = cx; by = cy; }
      else if (n <= 4) { bx = x + w / (n + 1) * (i + 1); by = cy; }
      else {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        bx = cx + Math.cos(angle) * Math.min(w, h) * 0.28;
        by = cy + Math.sin(angle) * Math.min(w, h) * 0.28;
      }
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      const fs = Math.max(10, Math.min(r * 0.38, 18));
      ctx.font = `700 ${Math.round(fs)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(e.label.length > 10 ? e.label.slice(0, 9) + "…" : e.label, bx, by - r * 0.18);
      ctx.font = `400 ${Math.round(fs * 0.85)}px Inter, sans-serif`;
      ctx.fillText(String(e.value), bx, by + r * 0.38);
      ctx.textAlign = "left";
    });
  }
}

// ── PDF генерация через Canvas ─────────────────────────────────────────────────

async function generatePdfFromReport(report: Report): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const W = PDF_W;
  const H = PDF_H;

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [W, H], compress: true });
  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const ctx = offscreen.getContext("2d")!;

  // Обложка
  await drawSlideOnCanvas(ctx, { type: "cover", report }, W, H);
  pdf.addImage(offscreen.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, H);

  // Блоки
  for (let i = 0; i < report.blocks.length; i++) {
    ctx.clearRect(0, 0, W, H);
    await drawSlideOnCanvas(ctx, { type: "content", block: report.blocks[i], report, index: i }, W, H);
    pdf.addPage([W, H], "landscape");
    pdf.addImage(offscreen.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, H);
  }

  pdf.save(`Отчёт_${report.project_name || "клиент"}.pdf`);
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

  const handleSave = useCallback(async () => {
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
        return {
          block_type: b.block_type, heading: b.heading, body_text: b.body_text,
          image_url: imgUrl || null, image_position: b.image_position,
          image_crop: b.image_crop || null, chart_data: b.chart_data || null,
        };
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
  }, [report, rawToken, editCover, editBlocks, id]);

  const downloadPdf = useCallback(async () => {
    if (!report) return;
    setPdfLoading(true);
    try {
      await generatePdfFromReport(report);
    } catch (e) {
      console.error(e);
      alert("Не удалось сгенерировать PDF. Попробуй снова.");
    } finally {
      setPdfLoading(false);
    }
  }, [report]);

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
                style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: textColor, background: "transparent" }}>
                <Icon name="Pencil" size={12} />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => {
                  setEditing(false);
                  setEditBlocks(report.blocks.map(b => ({ ...b })));
                  setEditCover({ title: report.title, project_name: report.project_name, cover_image_url: report.cover_image_url });
                }}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: mutedColor, background: "transparent" }}>
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
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb", color: isDark ? "rgba(255,255,255,0.7)" : "#374151", background: "transparent" }}>
                  <Icon name={copied ? "Check" : "Link"} size={13} />
                  {copied ? "Скопировано" : "Ссылка"}
                </button>
                <button onClick={downloadPdf} disabled={pdfLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                  style={{ background: btnBg, color: btnFg }}>
                  {pdfLoading ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Download" size={13} />}
                  <span>{pdfLoading ? "Готовлю..." : "PDF"}</span>
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
              Режим редактирования — кликай на текст чтобы изменить
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
    </div>
  );
}
