import { useEffect, useRef } from "react";
import { TG_LINK, ymGoal } from "@/components/sections/TopSections";

const MAX_LINK = "https://max.ru/u/f9LHodD0cOIWFyxLhrycutlD8nEHwYcMoH-v9xJ2SyKiB_g1VjIuf82JIos";

const TelegramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#229ED9" />
    <path
      d="M5.2 11.6 17.4 7c.6-.2 1.1.1.9.8l-2 9.4c-.1.6-.5.7-.9.5l-2.6-1.9-1.2 1.2c-.1.1-.3.2-.6.2l.2-2.7 4.9-4.4c.2-.2 0-.3-.3-.1L7.3 13.2 5 12.5c-.5-.2-.5-.5.2-.9Z"
      fill="white"
    />
  </svg>
);

const MaxIcon = () => (
  <img
    src="https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/fb315558-936a-47de-84c3-674c94e060a1.png"
    width={22}
    height={22}
    alt="MAX"
    style={{ borderRadius: "50%" }}
  />
);

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
      className="absolute z-50 mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[190px]"
      style={{ animation: "scale-in 0.15s ease-out forwards", transformOrigin: "top right" }}
    >
      <a
        href={TG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-black text-sm"
        onClick={() => { ymGoal("Переход в Телеграм"); onClose(); }}
      >
        <TelegramIcon />
        Telegram
      </a>
      <a
        href={MAX_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-black text-sm"
        onClick={() => { ymGoal("Переход в MAX"); onClose(); }}
      >
        <MaxIcon />
        MAX
      </a>
    </div>
  );
}