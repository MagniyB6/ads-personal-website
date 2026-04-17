import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";

const REPORT_TITLES = [
  { value: "Яндекс Директ", label: "Яндекс Директ", accent: "#FEEB19", emoji: "🟡" },
  { value: "VK Реклама", label: "VK Реклама", accent: "#0077FF", emoji: "🔵" },
  { value: "Авито Реклама", label: "Авито Реклама", accent: "#00AAFF", emoji: "🟢" },
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
  { value: "right", label: "Справа", icon: "PanelRight" },
  { value: "left", label: "Слева", icon: "PanelLeft" },
  { value: "bg", label: "Фон", icon: "Image" },
  { value: "full", label: "На весь слайд", icon: "Maximize2" },
] as const;

type ImagePosition = "right" | "left" | "bg" | "full";
type Theme = "dark" | "light";

type CropArea = { x: number; y: number; w: number; h: number };

type Block = {
  id: string;
  block_type: string;
  heading: string;
  body_text: string;
  image_url?: string;
  image_position: ImagePosition;
  image_crop?: CropArea;
  _imageFile?: File;
  _imagePreview?: string;
  _showCrop?: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fileToBase64(file: File): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ data: result.split(",")[1], type: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Кадрировщик ---
function ImageCropper({
  src,
  crop,
  onChange,
  onClose,
}: {
  src: string;
  crop?: CropArea;
  onChange: (c: CropArea) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<CropArea>(crop || { x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const dragging = useRef<null | "move" | "tl" | "tr" | "bl" | "br">(null);
  const startPos = useRef({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 });

  const getRelPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { rx: (clientX - rect.left) / rect.width, ry: (clientY - rect.top) / rect.height };
  };

  const onMouseDown = (e: React.MouseEvent, type: typeof dragging.current) => {
    e.stopPropagation();
    dragging.current = type;
    const { rx, ry } = getRelPos(e);
    startPos.current = { mx: rx, my: ry, bx: box.x, by: box.y, bw: box.w, bh: box.h };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const { rx, ry } = getRelPos(e);
    const dx = rx - startPos.current.mx;
    const dy = ry - startPos.current.my;
    const { bx, by, bw, bh } = startPos.current;
    const minSize = 0.05;
    let nb = { ...box };
    if (dragging.current === "move") {
      nb = { x: Math.max(0, Math.min(1 - bw, bx + dx)), y: Math.max(0, Math.min(1 - bh, by + dy)), w: bw, h: bh };
    } else if (dragging.current === "tl") {
      const nx = Math.max(0, Math.min(bx + bw - minSize, bx + dx));
      const ny = Math.max(0, Math.min(by + bh - minSize, by + dy));
      nb = { x: nx, y: ny, w: bx + bw - nx, h: by + bh - ny };
    } else if (dragging.current === "tr") {
      const ny = Math.max(0, Math.min(by + bh - minSize, by + dy));
      nb = { x: bx, y: ny, w: Math.max(minSize, Math.min(1 - bx, bw + dx)), h: by + bh - ny };
    } else if (dragging.current === "bl") {
      const nx = Math.max(0, Math.min(bx + bw - minSize, bx + dx));
      nb = { x: nx, y: by, w: bx + bw - nx, h: Math.max(minSize, Math.min(1 - by, bh + dy)) };
    } else if (dragging.current === "br") {
      nb = { x: bx, y: by, w: Math.max(minSize, Math.min(1 - bx, bw + dx)), h: Math.max(minSize, Math.min(1 - by, bh + dy)) };
    }
    setBox(nb);
  };

  const handleSize = 12;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="font-bold text-sm text-black">Кадрировать изображение</p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden rounded-xl bg-gray-100"
            style={{ cursor: dragging.current ? "grabbing" : "default" }}
            onMouseMove={onMouseMove}
            onMouseUp={() => { dragging.current = null; }}
            onMouseLeave={() => { dragging.current = null; }}
          >
            <img src={src} alt="" className="w-full block" draggable={false} />
            {/* Затемнение снаружи */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.5) ${box.x * 100}%, transparent ${box.x * 100}%)`,
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.5) ${(1 - box.x - box.w) * 100}%, transparent ${(1 - box.x - box.w) * 100}%)`,
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.5) ${box.y * 100}%, transparent ${box.y * 100}%)`,
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.5) ${(1 - box.y - box.h) * 100}%, transparent ${(1 - box.y - box.h) * 100}%)`,
            }} />
            {/* Рамка */}
            <div
              className="absolute border-2 border-white cursor-grab"
              style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
              onMouseDown={(e) => onMouseDown(e, "move")}
            >
              {/* Угловые ручки */}
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <div
                  key={corner}
                  className="absolute bg-white rounded-sm border border-gray-400"
                  style={{
                    width: handleSize, height: handleSize,
                    top: corner.startsWith("t") ? -handleSize / 2 : undefined,
                    bottom: corner.startsWith("b") ? -handleSize / 2 : undefined,
                    left: corner.endsWith("l") ? -handleSize / 2 : undefined,
                    right: corner.endsWith("r") ? -handleSize / 2 : undefined,
                    cursor: corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize",
                  }}
                  onMouseDown={(e) => onMouseDown(e, corner)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setBox({ x: 0, y: 0, w: 1, h: 1 })} className="text-xs text-gray-500 hover:text-black transition-colors">
              Сбросить
            </button>
            <div className="flex-1" />
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button
              onClick={() => { onChange(box); onClose(); }}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: "#FEEB19", color: "#000" }}
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Загрузчик с позицией и кадрированием ---
function BlockImageUploader({
  value,
  preview,
  position,
  crop,
  onFileChange,
  onPositionChange,
  onCropChange,
}: {
  value?: string;
  preview?: string;
  position: ImagePosition;
  crop?: CropArea;
  onFileChange: (file: File | null, preview: string) => void;
  onPositionChange: (pos: ImagePosition) => void;
  onCropChange: (c: CropArea) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCrop, setShowCrop] = useState(false);
  const displaySrc = preview || value;

  const cropStyle = displaySrc && crop
    ? {
        objectFit: "none" as const,
        objectPosition: `-${crop.x * 100}% -${crop.y * 100}%`,
        transform: `scale(${1 / crop.w})`,
        transformOrigin: "top left",
        width: `${crop.w * 100}%`,
        height: `${crop.h * 100}%`,
      }
    : { objectFit: "cover" as const, width: "100%", height: "100%" };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">Изображение / скриншот</p>

      {/* Позиция */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {IMAGE_POSITIONS.map((pos) => (
          <button
            key={pos.value}
            onClick={() => onPositionChange(pos.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              position === pos.value
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
            }`}
          >
            <Icon name={pos.icon} size={12} />
            {pos.label}
          </button>
        ))}
      </div>

      {/* Превью и кнопки */}
      {displaySrc ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 h-36">
          <img
            src={displaySrc}
            alt=""
            style={cropStyle}
          />
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button
              onClick={() => setShowCrop(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-gray-700 shadow hover:bg-white transition-colors"
            >
              <Icon name="Crop" size={12} />
              Кадрировать
            </button>
            <button
              onClick={() => onFileChange(null, "")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/90 text-xs font-semibold text-white shadow hover:bg-red-500 transition-colors"
            >
              <Icon name="Trash2" size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 h-20 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-all"
        >
          <Icon name="ImagePlus" size={18} />
          <span className="text-xs">Загрузить изображение</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFileChange(file, URL.createObjectURL(file));
        }}
      />

      {showCrop && displaySrc && (
        <ImageCropper
          src={displaySrc}
          crop={crop}
          onChange={onCropChange}
          onClose={() => setShowCrop(false)}
        />
      )}
    </div>
  );
}

// --- Загрузчик обложки ---
function CoverImageUploader({
  preview,
  onChange,
}: {
  preview: string;
  onChange: (file: File | null, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">Обложка (необязательно)</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 h-32">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null, "")}
            className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/90 text-xs font-semibold text-white shadow"
          >
            <Icon name="Trash2" size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 h-20 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-all"
        >
          <Icon name="ImagePlus" size={18} />
          <span className="text-xs">Загрузить обложку</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onChange(file, URL.createObjectURL(file));
        }}
      />
    </div>
  );
}

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

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: uid(), block_type: "content", heading: "Основные результаты", body_text: "", image_position: "right" },
    ]);
  };

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
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
    setError("");
    setSaving(true);
    setStep("saving");
    try {
      const createRes = await fetch(REPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleObj.value, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null, theme }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Ошибка создания");
      const { id, edit_token } = created;

      let coverImageUrl: string | undefined;
      if (coverFile) coverImageUrl = await uploadImage(coverFile, id, edit_token);

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": edit_token },
        body: JSON.stringify({ action: "update_report", title: titleObj.value, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null, cover_image_url: coverImageUrl, theme }),
      });

      const uploadedBlocks = await Promise.all(
        blocks.map(async (b) => {
          let imgUrl = b.image_url;
          if (b._imageFile) imgUrl = await uploadImage(b._imageFile, id, edit_token);
          return { block_type: b.block_type, heading: b.heading, body_text: b.body_text, image_url: imgUrl || null, image_position: b.image_position, image_crop: b.image_crop || null };
        })
      );

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": edit_token },
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

  const accentColor = titleObj.accent;

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            Полезное
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
                {/* Площадка */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Рекламная площадка</label>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_TITLES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTitleObj(t)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          titleObj.value === t.value ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Тема */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Тема оформления</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        theme === "dark" ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <Icon name="Moon" size={14} />
                      Тёмная
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        theme === "light" ? "border-black bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <Icon name="Sun" size={14} />
                      Светлая
                    </button>
                  </div>
                </div>

                {/* Превью титула */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: theme === "dark"
                      ? `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`
                      : `linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)`,
                    border: `2px solid ${accentColor}`,
                    padding: "20px 24px",
                    minHeight: 90,
                  }}
                >
                  <p style={{ color: accentColor, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                    {titleObj.value}
                  </p>
                  <p style={{ color: theme === "dark" ? "#fff" : "#111", fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                    {projectName || "Название проекта"}
                  </p>
                  {(dateFrom || dateTo) && (
                    <p style={{ color: theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", fontSize: 11, marginTop: 6 }}>
                      {dateFrom ? dateFrom.split("-").reverse().join(".") : "–"} — {dateTo ? dateTo.split("-").reverse().join(".") : "–"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Название проекта</label>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Например: ООО «Окна Плюс»"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Дата с</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Дата по</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                  </div>
                </div>

                <CoverImageUploader
                  preview={coverPreview}
                  onChange={(file, prev) => { setCoverFile(file); setCoverPreview(prev); }}
                />
              </div>
            </section>

            {/* Контентные блоки */}
            {blocks.map((block, idx) => (
              <section key={block.id} className="bg-gray-50 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 2}</div>
                    <span className="font-bold text-black text-sm">Блок</span>
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
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Заголовок блока</label>
                    <input
                      value={block.heading}
                      onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                      placeholder="Заголовок"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {BLOCK_HEADING_TEMPLATES.map((t) => (
                        <button key={t} onClick={() => updateBlock(block.id, { heading: t })}
                          className="text-xs px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black transition-all">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Текст</label>
                    <textarea
                      value={block.body_text}
                      onChange={(e) => updateBlock(block.id, { body_text: e.target.value })}
                      rows={4}
                      placeholder="Основная информация, аналитика, выводы..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    />
                  </div>

                  <BlockImageUploader
                    value={block.image_url}
                    preview={block._imagePreview}
                    position={block.image_position}
                    crop={block.image_crop}
                    onFileChange={(file, prev) => updateBlock(block.id, { _imageFile: file || undefined, _imagePreview: prev, image_crop: undefined })}
                    onPositionChange={(pos) => updateBlock(block.id, { image_position: pos })}
                    onCropChange={(c) => updateBlock(block.id, { image_crop: c })}
                  />
                </div>
              </section>
            ))}

            <button
              onClick={addBlock}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:border-gray-400 hover:text-black transition-all mb-8"
            >
              <Icon name="Plus" size={16} />
              Добавить блок
            </button>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base disabled:opacity-50 transition-all"
              style={{ background: "#FEEB19", color: "#000" }}
            >
              {saving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Sparkles" size={16} />}
              Создать отчёт
            </button>
          </>
        )}
      </main>
    </div>
  );
}
