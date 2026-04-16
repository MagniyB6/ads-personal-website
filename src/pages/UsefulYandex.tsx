import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const DSP_SITES = [
  "dsp-mail-ru.yandex.ru", "dsp.yandex.ru", "dsp-unityads.yandex.ru",
  "dsp-minimob-ww.yandex.ru", "dsp-yeahmobi.yandex.ru", "dsp-betweenx.yandex.ru",
  "dsp-ironsource.yandex.ru", "dsp-inneractive.yandex.ru", "dsp-opera-exchange.yandex.ru",
  "dsp-mintagral.yandex.ru", "dsp-xiaomi.yandex.ru", "dsp-start-io.yandex.ru",
  "dsp-blueseax.yandex.ru", "dsp-webeye.yandex.ru", "dsp-transsion.yandex.ru",
  "dsp-inmobi.yandex.ru", "dsp-huawei.yandex.ru", "droidspace.ru",
];

const RSY_SECTIONS = [
  { id: "dsp", label: "DSP площадки", icon: "List", sites: DSP_SITES },
];

export default function UsefulYandex() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="font-golos min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="container-narrow flex items-center h-16 md:h-20 gap-4">
          <Link to="/useful" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Icon name="ArrowLeft" size={18} />
            Полезное
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black text-base">Яндекс</span>
        </div>
      </header>

      <main className="container-narrow py-12 md:py-20">
        <div className="mb-12">
          <span className="tag mb-4 inline-block">яндекс</span>
          <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">Яндекс</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xl">Полезные инструменты и данные для работы с Яндекс Директ</p>
        </div>

        <div className="flex flex-col gap-6">
          <RsyBlock sections={RSY_SECTIONS} />
        </div>
      </main>
    </div>
  );
}

function RsyBlock({ sections }: { sections: typeof RSY_SECTIONS }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => { setOpen(!open); setActiveSection(null); }}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEEB19" }}>
            <Icon name="LayoutGrid" size={20} />
          </div>
          <div>
            <p className="font-bold text-black text-base">РСЯ площадки</p>
            <p className="text-sm text-gray-400 mt-0.5">Списки площадок по тематикам для исключений</p>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={20} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col gap-3 bg-gray-50/50">
          {sections.map((section) => (
            <SiteListSection
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onToggle={() => setActiveSection(activeSection === section.id ? null : section.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SiteListSection({
  section,
  isActive,
  onToggle,
}: {
  section: (typeof RSY_SECTIONS)[0];
  isActive: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(section.sites.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon name={section.icon as "List"} size={16} className="text-gray-400" />
          <span className="font-semibold text-black">{section.label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{section.sites.length}</span>
        </div>
        <Icon name={isActive ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-400" />
      </button>

      {isActive && (
        <div className="border-t border-gray-100">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Нажмите на домен, чтобы скопировать</span>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: copied ? "#22c55e" : "#FEEB19", color: "#000" }}
            >
              <Icon name={copied ? "Check" : "Copy"} size={13} />
              {copied ? "Скопировано!" : "Копировать всё"}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {section.sites.map((site, i) => (
              <CopySiteRow key={i} site={site} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopySiteRow({ site }: { site: string }) {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    navigator.clipboard.writeText(site);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handle}
      className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-[#FEEB19]/10 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
    >
      <span className="font-mono">{site}</span>
      <span className="flex items-center gap-1 text-xs shrink-0 ml-3">
        {copied ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">
            <Icon name="Check" size={13} /> Скопировано
          </span>
        ) : (
          <Icon name="Copy" size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        )}
      </span>
    </button>
  );
}
