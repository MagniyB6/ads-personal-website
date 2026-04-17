import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const REPORTS_URL = "https://functions.poehali.dev/f2a35ab0-9bed-49b0-9d37-c7166a3af5d8";
const UPLOAD_URL = "https://functions.poehali.dev/8bcfffb0-13a1-4623-b29b-d28de29b3d36";

const REPORT_TITLES = ["Яндекс Директ", "VK Реклама", "Яндекс + VK", "SEO", "Другое"];
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

type Block = {
  id: string;
  block_type: string;
  heading: string;
  body_text: string;
  image_url?: string;
  _imageFile?: File;
  _imagePreview?: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fileToBase64(file: File): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ data: base64, type: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploader({
  value,
  preview,
  onChange,
  label,
}: {
  value?: string;
  preview?: string;
  onChange: (file: File, preview: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = preview || value;
  return (
    <div>
      {label && <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden ${
          displaySrc ? "border-gray-200 h-40" : "border-gray-200 hover:border-gray-400 h-24"
        }`}
      >
        {displaySrc ? (
          <img src={displaySrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Icon name="ImagePlus" size={22} />
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
            const prev = URL.createObjectURL(file);
            onChange(file, prev);
          }}
        />
      </div>
      {displaySrc && (
        <button
          className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
          onClick={() => onChange(null as unknown as File, "")}
        >
          Удалить изображение
        </button>
      )}
    </div>
  );
}

export default function ReportBuilder() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "saving">("form");
  const [title, setTitle] = useState("Яндекс Директ");
  const [projectName, setProjectName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), block_type: "content", heading: "Общая информация о проекте", body_text: "", image_url: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: uid(), block_type: "content", heading: "Основные результаты", body_text: "" },
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
        body: JSON.stringify({ title, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Ошибка создания");
      const { id, edit_token } = created;

      let coverImageUrl: string | undefined;
      if (coverFile) {
        coverImageUrl = await uploadImage(coverFile, id, edit_token);
      }

      await fetch(`${REPORTS_URL}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Edit-Token": edit_token },
        body: JSON.stringify({ action: "update_report", title, project_name: projectName, date_from: dateFrom || null, date_to: dateTo || null, cover_image_url: coverImageUrl }),
      });

      const uploadedBlocks = await Promise.all(
        blocks.map(async (b) => {
          let imgUrl = b.image_url;
          if (b._imageFile) {
            imgUrl = await uploadImage(b._imageFile, id, edit_token);
          }
          return { block_type: b.block_type, heading: b.heading, body_text: b.body_text, image_url: imgUrl || null };
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
              <p className="text-gray-500 text-base">Заполни блоки — получишь красивую страницу-отчёт с уникальной ссылкой. Данные хранятся 5 часов.</p>
            </div>

            {/* Титульный слайд */}
            <section className="bg-gray-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="font-bold text-black text-sm">Титульный слайд</span>
                <span className="text-xs text-gray-400 ml-1">(обязательно)</span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Отчёт по площадке</label>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_TITLES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTitle(t)}
                        className={`px-3 py-1.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          title === t ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
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
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Дата по</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <ImageUploader
                  value=""
                  preview={coverPreview}
                  label="Обложка (необязательно)"
                  onChange={(file, prev) => {
                    setCoverFile(file || null);
                    setCoverPreview(prev);
                  }}
                />
              </div>
            </section>

            {/* Контентные блоки */}
            {blocks.map((block, idx) => (
              <section key={block.id} className="bg-gray-50 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">{idx + 2}</div>
                    <span className="font-bold text-black text-sm">Блок</span>
                    <span className="text-xs text-gray-400">(опционально)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveBlock(block.id, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                    >
                      <Icon name="ChevronUp" size={14} />
                    </button>
                    <button
                      onClick={() => moveBlock(block.id, 1)}
                      disabled={idx === blocks.length - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                    >
                      <Icon name="ChevronDown" size={14} />
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors ml-1"
                    >
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
                        <button
                          key={t}
                          onClick={() => updateBlock(block.id, { heading: t })}
                          className="text-xs px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black transition-all"
                        >
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

                  <ImageUploader
                    value={block.image_url}
                    preview={block._imagePreview}
                    label="Скриншот / изображение (необязательно)"
                    onChange={(file, prev) => updateBlock(block.id, { _imageFile: file || undefined, _imagePreview: prev })}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base disabled:opacity-50 transition-all"
                style={{ background: "#FEEB19", color: "#000" }}
              >
                {saving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Sparkles" size={16} />}
                Создать отчёт
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
