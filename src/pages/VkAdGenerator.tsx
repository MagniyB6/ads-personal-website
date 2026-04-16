import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const DAILY_LIMIT = 5;
const STORAGE_KEY = "vk_ad_generator_usage";

type Tone = "neutral" | "friendly" | "aggressive";

const TONES: { value: Tone; label: string; desc: string; emoji: string }[] = [
  { value: "neutral", label: "Нейтральный", desc: "Чётко и по делу", emoji: "🎯" },
  { value: "friendly", label: "Дружелюбный", desc: "Тепло и искренне", emoji: "😊" },
  { value: "aggressive", label: "Агрессивный", desc: "Срочность и напор", emoji: "🔥" },
];

type VkAdResult = {
  title: string;
  short_desc: string;
  button_text: string;
  long_desc: string;
};

function getUsageToday(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch {
    return 0;
  }
}

function incrementUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const count = getUsageToday() + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return (
    <span className={`text-xs font-mono ${over ? "text-red-500 font-bold" : "text-gray-400"}`}>
      {len}/{max}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
    >
      <Icon name={copied ? "Check" : "Copy"} size={14} />
      {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

export default function VkAdGenerator() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<Tone>("neutral");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VkAdResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(getUsageToday());
  const [edited, setEdited] = useState<VkAdResult | null>(null);

  const func2urlRef = useRef<Record<string, string> | null>(null);

  const getUrl = async () => {
    if (func2urlRef.current) return func2urlRef.current;
    const res = await fetch("/func2url.json");
    func2urlRef.current = await res.json();
    return func2urlRef.current!;
  };

  const generate = async () => {
    if (!description.trim()) {
      setError("Расскажи о своём бизнесе или предложении");
      return;
    }
    if (usageCount >= DAILY_LIMIT) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setEdited(null);

    try {
      const urls = await getUrl();
      const url = urls["vk-ad-generator"];
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Что-то пошло не так, попробуй снова");
        return;
      }
      setResult(data);
      setEdited(data);
      incrementUsage();
      setUsageCount(getUsageToday());
    } catch {
      setError("Ошибка соединения. Попробуй ещё раз");
    } finally {
      setLoading(false);
    }
  };

  const remaining = DAILY_LIMIT - usageCount;
  const limitReached = usageCount >= DAILY_LIMIT;

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful/vk" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            VK реклама
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">Генератор объявлений</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-16 max-w-2xl">
        <div className="mb-10">
          <span className="tag mb-4 inline-block" style={{ background: "#2688EB20", color: "#2688EB" }}>инструмент</span>
          <h1 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-3">Генератор объявлений VK</h1>
          <p className="text-gray-500 text-lg max-w-lg">Опиши свой бизнес или акцию — ИИ составит все тексты для лид-формы ВКонтакте по требованиям платформы.</p>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ background: "#2688EB08", border: "1.5px solid #2688EB30" }}>
          <label className="block text-sm font-bold text-black mb-2">
            Расскажи о своём предложении
          </label>
          <p className="text-xs text-gray-400 mb-3">Чем подробнее — тем точнее результат. Укажи: что продаёшь, ключевые плюсы, акцию или оффер, целевую аудиторию, призыв к действию.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={limitReached || loading}
            rows={5}
            placeholder="Например: Фитнес-клуб в Москве. Акция — первый месяц за 990 рублей. Бассейн, тренажёрный зал, групповые занятия. Для тех, кто хочет начать заниматься спортом без больших вложений."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none resize-none disabled:opacity-50 transition"
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px #2688EB50"}
            onBlur={e => e.target.style.boxShadow = "none"}
          />

          <div className="mt-4 mb-4">
            <p className="text-xs font-bold text-black mb-2">Тон текста</p>
            <div className="flex gap-2 flex-wrap">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  disabled={limitReached || loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all disabled:opacity-40 ${
                    tone === t.value
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {TONES.find(t => t.value === tone)?.desc}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Icon name="Zap" size={13} />
              {limitReached
                ? <span className="text-red-500 font-semibold">Лимит на сегодня исчерпан (5/5)</span>
                : <span>Осталось генераций сегодня: <b className="text-black">{remaining}</b> из {DAILY_LIMIT}</span>
              }
            </div>
            <button
              onClick={generate}
              disabled={loading || limitReached || !description.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: "#2688EB" }}
            >
              {loading
                ? <><Icon name="Loader" size={15} className="animate-spin" />Генерирую...</>
                : <><Icon name="Sparkles" size={15} />Сгенерировать</>
              }
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 text-sm text-red-600">
            <Icon name="AlertCircle" size={16} />
            {error}
          </div>
        )}

        {edited && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-black">Результат</h2>
              <span className="text-xs text-gray-400">Можешь отредактировать перед копированием</span>
            </div>

            <VkAdField
              label="Заголовок"
              max={40}
              value={edited.title}
              onChange={(v) => setEdited({ ...edited, title: v })}
              hint="До 40 символов"
            />
            <VkAdField
              label="Короткое описание"
              max={90}
              value={edited.short_desc}
              onChange={(v) => setEdited({ ...edited, short_desc: v })}
              hint="До 90 символов"
            />
            <VkAdField
              label="Текст рядом с кнопкой"
              max={30}
              value={edited.button_text}
              onChange={(v) => setEdited({ ...edited, button_text: v })}
              hint="До 30 символов"
            />
            <VkAdField
              label="Длинное описание"
              max={220}
              value={edited.long_desc}
              onChange={(v) => setEdited({ ...edited, long_desc: v })}
              hint="До 220 символов"
              multiline
            />

            <button
              onClick={generate}
              disabled={loading || limitReached}
              className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="RefreshCw" size={14} />
              Сгенерировать ещё раз
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function VkAdField({
  label,
  max,
  value,
  onChange,
  hint,
  multiline = false,
}: {
  label: string;
  max: number;
  value: string;
  onChange: (v: string) => void;
  hint: string;
  multiline?: boolean;
}) {
  const over = value.length > max;
  const baseClass = `w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none resize-none transition ${
    over ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
  }`;

  return (
    <div className="rounded-2xl p-4" style={{ background: "#f8f9fa" }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-black">{label}</span>
          <span className="text-xs text-gray-400 ml-2">{hint}</span>
        </div>
        <div className="flex items-center gap-3">
          <CharCounter value={value} max={max} />
          <CopyButton text={value} />
        </div>
      </div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={baseClass} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={baseClass} />
      )}
      {over && (
        <p className="text-xs text-red-500 mt-1 font-semibold">Превышен лимит на {value.length - max} символов</p>
      )}
    </div>
  );
}
