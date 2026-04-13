import { useEffect, useRef } from "react";
import { TG_LINK, ymGoal } from "@/components/sections/TopSections";

const MAX_LINK = "https://max.ru/u/f9LHodD0cOIWFyxLhrycutlD8nEHwYcMoH-v9xJ2SyKiB_g1VjIuf82JIos";

interface Props {
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function MessengerPicker({ onClose, anchorRef }: Props) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-2 min-w-[210px]"
      style={{ animation: "scale-in 0.15s ease-out forwards", transformOrigin: "top right" }}
    >
      <a
        href={TG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-black text-sm"
        onClick={() => { ymGoal("Переход в Телеграм"); onClose(); }}
      >
        <span className="text-xl">✈️</span>
        Telegram
      </a>
      <a
        href={MAX_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-black text-sm"
        onClick={() => { ymGoal("Переход в MAX"); onClose(); }}
      >
        <span className="text-xl">💬</span>
        MAX
      </a>
    </div>
  );
}
