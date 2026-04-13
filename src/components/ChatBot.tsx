import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const LEADS_URL = "https://functions.poehali.dev/78260252-815a-46d9-9594-6898000ca410";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const NICHE_OPTIONS = [
  "Недвижимость",
  "Услуги (салон, ремонт и т.д.)",
  "E-commerce / интернет-магазин",
  "Авто (продажа / доставка / аренда)",
  "Другое",
];
const ADS_EXP_OPTIONS = [
  "Да, сейчас работает",
  "Да, но не устроил результат",
  "Нет, хочу начать",
];
const PLATFORM_OPTIONS = [
  "Яндекс Директ",
  "VK реклама",
  "Авито реклама",
  "Несколько площадок",
  "Не знаю, нужна рекомендация",
];
const BUDGET_OPTIONS = [
  "до 30 000 ₽",
  "30 000 – 70 000 ₽",
  "70 000 – 150 000 ₽",
  "150 000+ ₽",
  "Затрудняюсь, нужна помощь",
];
const MESSENGER_OPTIONS = ["Telegram", "MAX", "ВКонтакте", "Позвоните мне"];

type Stage =
  | "greeting"
  | "niche"
  | "niche_other"
  | "company"
  | "ads_exp"
  | "platform"
  | "budget"
  | "contacts_name"
  | "contacts_phone"
  | "messenger_choice"
  | "done";

interface Answers {
  niche: string;
  company_info: string;
  ads_exp: string;
  platform: string;
  budget: string;
  name: string;
  phone: string;
  messenger: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "+7 ";
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length > 4) result += ") " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

function isPhoneComplete(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 11;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatBot({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("greeting");
  const [answers, setAnswers] = useState<Answers>({
    niche: "", company_info: "", ads_exp: "", platform: "",
    budget: "", name: "", phone: "+7 ", messenger: "",
  });
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("+7 ");
  const [started, setStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const nextId = () => ++msgIdRef.current;

  const addBotMessage = (text: string, delay = 900) =>
    new Promise<void>((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { id: nextId(), from: "bot", text }]);
        resolve();
      }, delay);
    });

  const addUserMessage = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId(), from: "user", text }]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMessages([]);
      setStage("greeting");
      setAnswers({ niche: "", company_info: "", ads_exp: "", platform: "", budget: "", name: "", phone: "+7 ", messenger: "" });
      setInputVal("");
      setPhoneVal("+7 ");
      msgIdRef.current = 0;

      addBotMessage(
        "Привет! Давайте познакомимся с вашим бизнесом. Расскажите коротко о продукте, отвечая на несколько вопросов. Займёт 1 минуту.",
        900
      ).then(() => {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: nextId(), from: "bot", text: "В какой нише работаете?" }]);
          setStage("niche");
        }, 400);
      });
    }
    if (!open) setStarted(false);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleOption = async (option: string) => {
    addUserMessage(option);

    if (stage === "niche") {
      if (option === "Другое") {
        setAnswers((a) => ({ ...a, niche: "" }));
        await addBotMessage("Расскажите подробнее о вашем бизнесе:");
        setStage("niche_other");
      } else {
        setAnswers((a) => ({ ...a, niche: option }));
        await addBotMessage(
          "Как я могу подробнее ознакомиться с вашей компанией? Напишите ссылку на сайт или название, по которому смогу найти информацию в поисковике."
        );
        setStage("company");
      }
    } else if (stage === "ads_exp") {
      setAnswers((a) => ({ ...a, ads_exp: option }));
      await addBotMessage("Где планируете запускать рекламу?");
      setStage("platform");
    } else if (stage === "platform") {
      setAnswers((a) => ({ ...a, platform: option }));
      await addBotMessage("Какой бюджет на рекламу (в мес.) рассматриваете?");
      setStage("budget");
    } else if (stage === "budget") {
      setAnswers((a) => ({ ...a, budget: option }));
      await addBotMessage(
        "Отлично!\nЯ уже готов рассчитать стратегию под ваш бизнес. Оставьте свои контакты для более подробной консультации.",
        1000
      );
      await addBotMessage("Как вас зовут?", 600);
      setStage("contacts_name");
    } else if (stage === "messenger_choice") {
      const finalAnswers = { ...answers, messenger: option };
      setAnswers(finalAnswers);
      addUserMessage(option);
      setStage("done");
      await addBotMessage("Спасибо! Я скоро свяжусь с вами и подготовлю персональную стратегию. До встречи! 🚀", 900);
      window.ym?.(97865261, "reachGoal", "Chat_Bot_Order");
      setSending(true);
      try {
        await fetch(LEADS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalAnswers),
        });
      } catch (_e) { /* silent */ }
      setSending(false);
    }
  };

  const handleInput = async () => {
    const val = inputVal.trim();
    if (!val) return;
    setInputVal("");
    addUserMessage(val);

    if (stage === "niche_other") {
      setAnswers((a) => ({ ...a, niche: val }));
      await addBotMessage(
        "Как я могу подробнее ознакомиться с вашей компанией? Напишите ссылку на сайт или название, по которому смогу найти информацию в поисковике."
      );
      setStage("company");
    } else if (stage === "company") {
      setAnswers((a) => ({ ...a, company_info: val }));
      await addBotMessage("Уже запускали рекламу?");
      setStage("ads_exp");
    } else if (stage === "contacts_name") {
      setAnswers((a) => ({ ...a, name: val }));
      await addBotMessage("Ваш номер телефона:");
      setStage("contacts_phone");
      setPhoneVal("+7 ");
    }
  };

  const handlePhoneSubmit = async () => {
    if (!isPhoneComplete(phoneVal)) return;
    const phone = phoneVal;
    setPhoneVal("+7 ");
    addUserMessage(phone);
    setAnswers((a) => ({ ...a, phone }));
    await addBotMessage("Куда вам лучше написать?");
    setStage("messenger_choice");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    setPhoneVal(formatted);
  };

  const currentOptions = (): string[] => {
    if (stage === "niche") return NICHE_OPTIONS;
    if (stage === "ads_exp") return ADS_EXP_OPTIONS;
    if (stage === "platform") return PLATFORM_OPTIONS;
    if (stage === "budget") return BUDGET_OPTIONS;
    if (stage === "messenger_choice") return MESSENGER_OPTIONS;
    return [];
  };

  const showTextInput = stage === "niche_other" || stage === "company" || stage === "contacts_name";
  const showPhoneInput = stage === "contacts_phone";
  const options = currentOptions();

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-full max-w-sm">
      <div
        className="flex flex-col bg-white rounded-2xl shadow-2xl w-full"
        style={{
          height: "min(620px, 90vh)",
          border: "1px solid #e5e7eb",
          animation: "fade-up 0.3s ease-out forwards",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-t-2xl shrink-0"
          style={{ background: "#FEEB19" }}
        >
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
            <Icon name="Bot" size={20} color="white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Алексей Николотов</div>
            <div className="flex items-center gap-1.5 text-xs text-black/60">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Онлайн
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="rounded-2xl px-4 py-2.5 text-sm max-w-[82%] whitespace-pre-line leading-relaxed"
                style={
                  m.from === "bot"
                    ? { background: "#f3f4f6", color: "#111" }
                    : { background: "#FEEB19", color: "#111" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 flex items-center gap-1" style={{ background: "#f3f4f6" }}>
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Controls */}
        {!typing && stage !== "done" && (
          <div className="px-4 pb-4 shrink-0 flex flex-col gap-2">
            {options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {showTextInput && (
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
                  placeholder="Введите ответ..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInput()}
                  autoFocus
                />
                <button
                  onClick={handleInput}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: "#FEEB19" }}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
            )}

            {showPhoneInput && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors font-mono"
                    placeholder="+7 (___) ___-__-__"
                    value={phoneVal}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                    inputMode="tel"
                    autoFocus
                  />
                  <button
                    onClick={handlePhoneSubmit}
                    disabled={!isPhoneComplete(phoneVal)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background: "#FEEB19" }}
                  >
                    <Icon name="Send" size={16} />
                  </button>
                </div>
                {!isPhoneComplete(phoneVal) && phoneVal.length > 3 && (
                  <p className="text-xs text-gray-400 px-1">Введите полный номер: +7 (999) 000-00-00</p>
                )}
              </div>
            )}
          </div>
        )}

        {sending && (
          <div className="px-4 pb-4 text-xs text-gray-400 text-center shrink-0">Отправляем заявку...</div>
        )}
      </div>

      <style>{`
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #9ca3af;
          animation: typing-bounce 0.8s infinite ease-in-out;
        }
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}