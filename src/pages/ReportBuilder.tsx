import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const REPORT_TITLES = [
  { value: "Яндекс Директ", emoji: "🟡" },
  { value: "VK Реклама", emoji: "🔵" },
  { value: "Авито Реклама", emoji: "🟢" },
];

const BLOCK_HEADING_TEMPLATES = [
  "Общая информация о проекте",
  "Основные результаты",
  "Ключевые выводы",
  "Рекомендации",
  "Интересные находки",
  "Динамика показателей",
  "Анализ аудитории",
  "Планы на следующий период",
];

const IMAGE_POSITIONS = [
  { value: "left" as const, label: "Слева", icon: "PanelLeft" as const },
  { value: "right" as const, label: "Справа", icon: "PanelRight" as const },
  { value: "bg" as const, label: "Фоном", icon: "Image" as const },
  { value: "full" as const, label: "Весь слайд", icon: "Maximize2" as const },
];

const CHART_TYPES = [
  { value: "bar" as const, label: "Столбчатый", icon: "BarChart2" as const },
  { value: "pie" as const, label: "Круговой", icon: "PieChart" as const },
  { value: "line" as const, label: "Линейный", icon: "TrendingUp" as const },
  { value: "bubble" as const, label: "Пузыри", icon: "Circle" as const },
];

const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

type ImagePosition = "right" | "left" | "bg" | "full";
type Theme = "dark" | "light";
type CropArea = { x: number; y: number; w: number; h: number };
type ChartEntry = { label: string; value: number };
type ChartData = { type: "bar" | "pie" | "line" | "bubble"; entries: ChartEntry[] };

type Block = {
  id: string;
  block_type: "content" | "chart";
  heading: string;
  body_text: string;
  image_url?: string;
  image_position: ImagePosition;
  image_crop?: CropArea;
  chart_data?: ChartData;
  _imageFile?: File;
  _imagePreview?: string;
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function fileToBase64(file: File): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: (reader.result as string).split(",")[1], type: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Кадрировщик ────────────────────────────────────────────────────────────
function ImageCropper({ src, crop, onChange, onClose }: {
  src: string; crop?: CropArea;
  onChange: (c: CropArea) => void; onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<CropArea>(crop ?? { x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const drag = useRef<null | "move" | "tl" | "tr" | "bl" | "br">(null);
  const start = useRef({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 });

  const relPos = (e: React.MouseEvent) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { rx: (e.clientX - r.left) / r.width, ry: (e.clientY - r.top) / r.height };
  };

  const onDown = (e: React.MouseEvent, type: typeof drag.current) => {
    e.stopPropagation(); e.preventDefault();
    drag.current = type;
    const { rx, ry } = relPos(e);
    start.current = { mx: rx, my: ry, bx: box.x, by: box.y, bw: box.w, bh: box.h };
  };

  const onMove = (e: React.MouseEvent) => {
    if (!drag.current) return;
    const { rx, ry } = relPos(e);
    const dx = rx - start.current.mx, dy = ry - start.current.my;
    const { bx, by, bw, bh } = start.current;
    const MIN = 0.05;
    let nb = { ...box };
    if (drag.current === "move") {
      nb = { x: Math.max(0, Math.min(1 - bw, bx + dx)), y: Math.max(0, Math.min(1 - bh, by + dy)), w: bw, h: bh };
    } else if (drag.current === "tl") {
      const nx = Math.max(0, Math.min(bx + bw - MIN, bx + dx));
      const ny = Math.max(0, Math.min(by + bh - MIN, by + dy));
      nb = { x: nx, y: ny, w: bx + bw - nx, h: by + bh - ny };
    } else if (drag.current === "tr") {
      const ny = Math.max(0, Math.min(by + bh - MIN, by + dy));
      nb = { x: bx, y: ny, w: Math.max(MIN, Math.min(1 - bx, bw + dx)), h: by + bh - ny };
    } else if (drag.current === "bl") {
      const nx = Math.max(0, Math.min(bx + bw - MIN, bx + dx));
      nb = { x: nx, y: by, w: bx + bw - nx, h: Math.max(MIN, Math.min(1 - by, bh + dy)) };
    } else if (drag.current === "br") {
      nb = { x: bx, y: by, w: Math.max(MIN, Math.min(1 - bx, bw + dx)), h: Math.max(MIN, Math.min(1 - by, bh + dy)) };
    }
    setBox(nb);
  };

  const H = 10;
  const corners = [
    { id: "tl" as const, style: { top: -H / 2, left: -H / 2, cursor: "nwse-resize" } },
    { id: "tr" as const, style: { top: -H / 2, right: -H / 2, cursor: "nesw-resize" } },
    { id: "bl" as const, style: { bottom: -H / 2, left: -H / 2, cursor: "nesw-resize" } },
    { id: "br" as const, style: { bottom: -H / 2, right: -H / 2, cursor: "nwse-resize" } },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <p className="font-bold text-sm">Кадрировать изображение</p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><Icon name="X" size={16} /></button>
        </div>
        <div className="p-4">
          <div ref={containerRef} className="relative select-none overflow-hidden rounded-xl bg-gray-100"
            onMouseMove={onMove} onMouseUp={() => { drag.current = null; }} onMouseLeave={() => { drag.current = null; }}>
            <img src={src} alt="" className="w-full block pointer-events-none" draggable={false} />
            {/* затемнение снаружи рамки */}
            {[
              { style: { top: 0, left: 0, width: `${box.x * 100}%`, height: "100%" } },
              { style: { top: 0, right: 0, width: `${(1 - box.x - box.w) * 100}%`, height: "100%" } },
              { style: { top: 0, left: `${box.x * 100}%`, width: `${box.w * 100}%`, height: `${box.y * 100}%` } },
              { style: { bottom: 0, left: `${box.x * 100}%`, width: `${box.w * 100}%`, height: `${(1 - box.y - box.h) * 100}%` } },
            ].map((s, i) => (
              <div key={i} className="absolute pointer-events-none" style={{ ...s.style as React.CSSProperties, background: "rgba(0,0,0,0.45)" }} />
            ))}
            {/* рамка */}
            <div className="absolute border-2 border-white"
              style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%`, cursor: "grab" }}
              onMouseDown={e => onDown(e, "move")}>
              {corners.map(c => (
                <div key={c.id} className="absolute bg-white border border-gray-400 rounded-sm"
                  style={{ width: H, height: H, position: "absolute", ...c.style }}
                  onMouseDown={e => onDown(e, c.id)} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => setBox({ x: 0, y: 0, w: 1, h: 1 })} className="text-xs text-gray-400 hover:text-black transition-colors">
              Сбросить
            </button>
            <div className="flex-1" />
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button
              onClick={() => { onChange(box); onClose(); }}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Загрузчик изображения ───────────────────────────────────────────────────
function BlockImageUploader({ value, preview, position, crop, onFileChange, onPositionChange, onCropChange }: {
  value?: string; preview?: string; position: ImagePosition; crop?: CropArea;
  onFileChange: (file: File | null, preview: string) => void;
  onPositionChange: (pos: ImagePosition) => void;
  onCropChange: (c: CropArea) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const displaySrc = preview || value;

  const handleFile = (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      setSizeError(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} MB). Максимум 5 MB.`);
      return;
    }
    setSizeError("");
    onFileChange(file, URL.createObjectURL(file));
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">Изображение / скриншот</p>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {IMAGE_POSITIONS.map(pos => (
          <button key={pos.value} onClick={() => onPositionChange(pos.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${position === pos.value ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"}`}>
            <Icon name={pos.icon} size={12} />{pos.label}
          </button>
        ))}
      </div>

      {sizeError && <p className="text-xs text-red-500 mb-2">{sizeError}</p>}

      {displaySrc ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 h-36">
          <img src={displaySrc} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button onClick={() => setShowCrop(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-gray-700 shadow hover:bg-white transition-colors">
              <Icon name="Crop" size={12} />Кадрировать
            </button>
            <button onClick={() => { onFileChange(null, ""); setSizeError(""); }}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/90 text-white shadow hover:bg-red-500 transition-colors">
              <Icon name="Trash2" size={12} />
            </button>
          </div>
          {crop && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              кадрировано
            </div>
          )}
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 h-20 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-all">
          <Icon name="ImagePlus" size={18} />
          <span className="text-xs">Загрузить (до 5 MB)</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {showCrop && displaySrc && (
        <ImageCropper src={displaySrc} crop={crop} onChange={onCropChange} onClose={() => setShowCrop(false)} />
      )}
    </div>
  );
}

// ─── Редактор графика ─────────────────────────────────────────────────────────
function ChartEditor({ data, onChange }: { data: ChartData; onChange: (d: ChartData) => void }) {
  const addEntry = () => onChange({ ...data, entries: [...data.entries, { label: `Строка ${data.entries.length + 1}`, value: 0 }] });
  const removeEntry = (i: number) => onChange({ ...data, entries: data.entries.filter((_, idx) => idx !== i) });
  const updateEntry = (i: number, patch: Partial<ChartEntry>) =>
    onChange({ ...data, entries: data.entries.map((e, idx) => idx === i ? { ...e, ...patch } : e) });

  const preview = data.entries.map(e => ({ name: e.label, value: e.value }));

  return (
    <div className="flex flex-col gap-4">
      {/* Тип графика */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Тип графика</p>
        <div className="flex gap-2 flex-wrap">
          {CHART_TYPES.map(t => (
            <button key={t.value} onClick={() => onChange({ ...data, type: t.value })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${data.type === t.value ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"}`}>
              <Icon name={t.icon} size={12} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Данные */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Данные</p>
        <div className="flex flex-col gap-2">
          {data.entries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <input value={entry.label} onChange={e => updateEntry(i, { label: e.target.value })}
                placeholder="Название" className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="number" value={entry.value} onChange={e => updateEntry(i, { value: Number(e.target.value) })}
                className="w-20 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
              <button onClick={() => removeEntry(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addEntry}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors">
          <Icon name="Plus" size={12} />Добавить строку
        </button>
      </div>

      {/* Мини-превью */}
      {data.entries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-400 mb-2">Предпросмотр</p>
          {data.type === "pie" ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={preview} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : data.type === "line" ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={preview}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : data.type === "bubble" ? (
            <ResponsiveContainer width="100%" height={140}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <XAxis type="number" dataKey="x"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) => data.entries[v - 1]?.label || ""}
                  domain={[0.5, data.entries.length + 0.5]}
                  ticks={data.entries.map((_, i) => i + 1)} />
                <YAxis type="number" dataKey="y" tick={{ fontSize: 9 }} />
                <ZAxis type="number" dataKey="z" range={[100, 800]} />
                <Tooltip />
                <Scatter data={data.entries.map((e, i) => ({ x: i + 1, y: e.value, z: e.value, name: e.label }))}>
                  {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={preview}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.entries.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Загрузчик обложки ────────────────────────────────────────────────────────
function CoverImageUploader({ preview, onChange }: { preview: string; onChange: (file: File | null, preview: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState("");
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">Обложка (необязательно)</p>
      {sizeError && <p className="text-xs text-red-500 mb-1">{sizeError}</p>}
      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 h-32">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange(null, "")}
            className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-semibold shadow">
            <Icon name="Trash2" size={12} />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 h-20 flex items-center justify-center gap-2 text-gray-400 transition-all">
          <Icon name="ImagePlus" size={18} />
          <span className="text-xs">Загрузить обложку (до 5 MB)</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          if (f.size > MAX_IMAGE_BYTES) { setSizeError(`Файл слишком большой. Максимум 5 MB.`); return; }
          setSizeError(""); onChange(f, URL.createObjectURL(f));
          e.target.value = "";
        }} />
    </div>
  );
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export default function ReportBuilder() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "saving">("form");
  const [titleObj, setTitleObj] = useState(REPORT_TITLES[0]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [projectName, setProjectName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), block_type: "content", heading: "Общая информация о проекте", body_text: "", image_position: "right" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addContentBlock = () => setBlocks(p => [...p, { id: uid(), block_type: "content", heading: "Основные результаты", body_text: "", image_position: "right" }]);
  const addChartBlock = () => setBlocks(p => [...p, {
    id: uid(), block_type: "chart", heading: "Ключевые показатели", body_text: "", image_position: "right",
    chart_data: { type: "bar", entries: [{ label: "Показатель 1", value: 100 }, { label: "Показатель 2", value: 75 }] },
  }]);

  const removeBlock = (id: string) => setBlocks(p => p.filter(b => b.id !== id));
  const updateBlock = (id: string, patch: Partial<Block>) => setBlocks(p => p.map(b => b.id === id ? { ...b, ...patch } : b));
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(p => {
      const idx = p.findIndex(b => b.id === id);
      if (idx + dir < 0 || idx + dir >= p.length) return p;
      const n = [...p]; [n[idx], n[idx + dir]] = [n[idx + dir], n[idx]]; return n;
    });
  };

  const uploadImage = useCallback(async (file: File, reportId: string, editToken: string): Promise<string> => {
    const { data, type } = await fileToBase64(file);
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Edit-Token": editToken },
      body: JSON.stringify({ report_id: reportId, image_data: data, content_type: type }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ошибка загрузки");
    return json.url;
  }, []);

  const handleSave = async () => {
    if (!projectName.trim()) { setError("Введи название проекта"); return; }
    setError(""); setSaving(true); setStep("saving");
    try {
      const cr = await fetch(REPORTS_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleObj.value, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null, theme }),
      });
      const created = await cr.json();
      if (!cr.ok) throw new Error(created.error);
      const { id, edit_token } = created;

      let coverImageUrl: string | undefined;
      if (coverFile) coverImageUrl = await uploadImage(coverFile, id, edit_token);

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "X-Edit-Token": edit_token },
        body: JSON.stringify({ action: "update_report", title: titleObj.value, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null, cover_image_url: coverImageUrl, theme }),
      });

      const uploadedBlocks = await Promise.all(blocks.map(async b => {
        let imgUrl = b.image_url;
        if (b._imageFile) imgUrl = await uploadImage(b._imageFile, id, edit_token);
        return {
          block_type: b.block_type, heading: b.heading, body_text: b.body_text,
          image_url: imgUrl || null, image_position: b.image_position, image_crop: b.image_crop || null,
          chart_data: b.chart_data || null,
        };
      }));

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "X-Edit-Token": edit_token },
        body: JSON.stringify({ action: "upsert_blocks", blocks: uploadedBlocks }),
      });

      localStorage.setItem(`report_token_${id}`, edit_token);
      navigate(`/report/${id}?token=${edit_token}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так");
      setStep("form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />Полезное
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">Отчёт для клиента</span>
        </div>
      </header>

      <main className="container-narrow py-10 md:py-14 max-w-2xl">
        {step === "saving" ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Icon name="Loader" size={40} className="animate-spin text-gray-400" />
            <p className="text-lg font-semibold text-black">Создаю отчёт...</p>
            <p className="text-sm text-gray-400">Загружаю изображения и сохраняю блоки</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="tag mb-4 inline-block">инструмент</span>
              <h1 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-2">Отчёт для клиента</h1>
              <p className="text-gray-500 text-sm">Заполни блоки — получишь красивую страницу-отчёт со ссылкой и PDF. Данные хранятся 5 часов.</p>
            </div>

            {/* Титульный слайд */}
            <section className="bg-gray-50 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <span className="font-bold text-black text-sm">Титульный слайд</span>
                <span className="text-xs text-gray-400">(обязательно)</span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Рекламная площадка</label>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_TITLES.map(t => (
                      <button key={t.value} onClick={() => setTitleObj(t)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${titleObj.value === t.value ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"}`}>
                        <span>{t.emoji}</span><span>{t.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Тема оформления</label>
                  <div className="flex gap-2">
                    {[{ v: "dark" as Theme, label: "Тёмная", icon: "Moon" as const }, { v: "light" as Theme, label: "Светлая", icon: "Sun" as const }].map(t => (
                      <button key={t.v} onClick={() => setTheme(t.v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${theme === t.v ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"}`}>
                        <Icon name={t.icon} size={14} />{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Название проекта</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)}
                    placeholder="Например: ООО «Окна Плюс»"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Дата с</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Дата по</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>

                <CoverImageUploader preview={coverPreview} onChange={(f, p) => { setCoverFile(f); setCoverPreview(p); }} />
              </div>
            </section>

            {/* Контентные блоки */}
            {blocks.map((block, idx) => (
              <section key={block.id} className="bg-gray-50 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gray-100 text-gray-600">
                      {idx + 2}
                    </div>
                    <span className="font-bold text-black text-sm">
                      {block.block_type === "chart" ? "📊 График" : "Блок"}
                    </span>
                    <span className="text-xs text-gray-400">(опционально)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <Icon name="ChevronUp" size={14} />
                    </button>
                    <button onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <Icon name="ChevronDown" size={14} />
                    </button>
                    <button onClick={() => removeBlock(block.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors ml-1">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Заголовок</label>
                    <input value={block.heading} onChange={e => updateBlock(block.id, { heading: e.target.value })}
                      placeholder="Заголовок блока"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {BLOCK_HEADING_TEMPLATES.map(t => (
                        <button key={t} onClick={() => updateBlock(block.id, { heading: t })}
                          className="text-xs px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black transition-all">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Текст</label>
                    <textarea value={block.body_text} onChange={e => updateBlock(block.id, { body_text: e.target.value })}
                      rows={3} placeholder="Основная информация, аналитика, выводы..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                  </div>

                  {block.block_type === "chart" && block.chart_data && (
                    <ChartEditor data={block.chart_data} onChange={d => updateBlock(block.id, { chart_data: d })} />
                  )}

                  {block.block_type === "content" && (
                    <BlockImageUploader
                      value={block.image_url} preview={block._imagePreview}
                      position={block.image_position} crop={block.image_crop}
                      onFileChange={(f, p) => updateBlock(block.id, { _imageFile: f || undefined, _imagePreview: p, image_crop: undefined })}
                      onPositionChange={pos => updateBlock(block.id, { image_position: pos })}
                      onCropChange={c => updateBlock(block.id, { image_crop: c })}
                    />
                  )}
                </div>
              </section>
            ))}

            {/* Кнопки добавления блоков */}
            <div className="flex gap-3 mb-8">
              <button onClick={addContentBlock}
                className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:border-gray-400 hover:text-black transition-all">
                <Icon name="Plus" size={15} />Текстовый блок
              </button>
              <button onClick={addChartBlock}
                className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:border-gray-400 hover:text-black transition-all">
                <Icon name="BarChart2" size={15} />График
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
                <Icon name="AlertCircle" size={16} />{error}
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base disabled:opacity-50 transition-all"
              style={{ background: "#FEEB19", color: "#000" }}>
              {saving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Sparkles" size={16} />}
              Создать отчёт
            </button>
          </>
        )}
      </main>
    </div>
  );
}