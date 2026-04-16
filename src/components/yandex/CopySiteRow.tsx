import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function CopySiteRow({ site }: { site: string }) {
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
