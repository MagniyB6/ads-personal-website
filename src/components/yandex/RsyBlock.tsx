import { useState } from "react";
import Icon from "@/components/ui/icon";
import SiteListSection from "./SiteListSection";
import { Section } from "./rsySitesData";

export default function RsyBlock({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => { setOpen(!open); setActiveSection(null); }}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEEB19" }}>
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