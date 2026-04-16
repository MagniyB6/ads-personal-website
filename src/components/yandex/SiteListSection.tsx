import { useState } from "react";
import Icon from "@/components/ui/icon";
import CopySiteRow from "./CopySiteRow";
import { Section } from "./rsySitesData";

export default function SiteListSection({
  section,
  isActive,
  onToggle,
}: {
  section: Section;
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
          {section.note && (
            <div className="flex items-start gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
              <Icon name="AlertTriangle" size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-xs text-amber-700">{section.note}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Нажмите на домен, чтобы скопировать</span>
            <div className="flex items-center gap-2 flex-wrap">
              {section.downloadUrl && (
                <a
                  href={section.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                >
                  <Icon name="Download" size={13} />
                  Скачать все ({section.downloadTotal?.toLocaleString("ru-RU")} площадок)
                </a>
              )}
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: copied ? "#22c55e" : "#FEEB19", color: "#000" }}
              >
                <Icon name={copied ? "Check" : "Copy"} size={13} />
                {copied ? "Скопировано!" : "Копировать всё"}
              </button>
            </div>
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
