import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const STEPS = [
  {
    id: "niche",
    question: "В какой нише работаете?",
    options: [
      "Недвижимость",
      "Услуги (салон, ремонт и т.д.)",
      "E-commerce / интернет-магазин",
      "Авто (продажа / доставка / аренда)",
      "Другое",
    ],
  },
  {
    id: "ads_exp",
    question: "Уже запускали рекламу?",
    options: [
      "Да, сейчас работает",
      "Да, но не устроил результат",
      "Нет, хочу начать",
    ],
  },
  {
    id: "platform",
    question: "Где планируете запускать рекламу?",
    options: [
      "Яндекс Директ",
      "VK реклама",
      "Авито реклама",
      "Несколько площадок",
      "Не знаю, нужна рекомендация",
    ],
  },
  {
    id: "budget",
    question: "Какой бюджет на рекламу (в мес.) рассматриваете?",
    options: [
      "до 30 000 ₽",
      "30 000 – 70 000 ₽",
      "70 000 – 150 000 ₽",
      "150 000+ ₽",
      "Затрудняюсь, нужна помощь",
    ],
  },
];

type Stage =
  | "greeting"
  | "niche"
  | "niche_other"
  | "ads_exp"
  | "platform"
  | "budget"
  | "contacts"
  | "done";

interface Answers {
  niche?: string;
  ads_exp?: string;
  platform?: string;
  budget?: string;
  name?: string;
  phone?: string;
  messenger?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatBot({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("greeting");
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [started, setStarted] = useState(false);
  const [contactStep, setContactStep] = useState<"name" | "phone" | "messenger">("name");
  const [messenger, setMessenger] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const nextId = () => ++msgIdRef.current;

  const addBotMessage = (text: string, delay = 800) => {
    setTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { id: nextId(), from: "bot", text }]);
        resolve();
      }, delay);
    });
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), from: "user", text }]);
  };

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMessages([]);
      setStage("greeting");
      setAnswers({});
      setContactStep("name");
      setInputVal("");
      msgIdRef.current = 0;

      addBotMessage(
        "Привет! Давайте познакомимся с вашим бизнесом. Расскажите коротко о продукте, отвечая на несколько вопросов. Займёт 1 минуту.",
        900
      ).then(() => {
        setTimeout(() => setStage("niche"), 400);
      });
    }
    if (!open) {
      setStarted(false);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleOption = async (option: string) => {
    addUserMessage(option);

    if (stage === "niche") {
      if (option === "Другое") {
        await addBotMessage("Расскажите подробнее о вашем бизнесе:");
        setStage("niche_other");
      } else {
        setAnswers((a) => ({ ...a, niche: option }));
        await addBotMessage(STEPS[1].question);
        setStage("ads_exp");
      }
    } else if (stage === "ads_exp") {
      setAnswers((a) => ({ ...a, ads_exp: option }));
      await addBotMessage(STEPS[2].question);
      setStage("platform");
    } else if (stage === "platform") {
      setAnswers((a) => ({ ...a, platform: option }));
      await addBotMessage(STEPS[3].question);
      setStage("budget");
    } else if (stage === "budget") {
      setAnswers((a) => ({ ...a, budget: option }));
      await addBotMessage(
        "Отлично!\nЯ уже готов рассчитать стратегию под ваш бизнес. Оставьте свои контакты для более подробной консультации.",
        1000
      );
      await addBotMessage("Как вас зовут?", 600);
      setStage("contacts");
      setContactStep("name");
    }
  };

  const handleInput = async () => {
    const val = inputVal.trim();
    if (!val) return;
    setInputVal("");
    addUserMessage(val);

    if (stage === "niche_other") {
      setAnswers((a) => ({ ...a, niche: val }));
      await addBotMessage(STEPS[1].question);
      setStage("ads_exp");
    } else if (stage === "contacts") {
      if (contactStep === "name") {
        setAnswers((a) => ({ ...a, name: val }));
        await addBotMessage("Ваш номер телефона:");
        setContactStep("phone");
      } else if (contactStep === "phone") {
        setAnswers((a) => ({ ...a, phone: val }));
        await addBotMessage("Куда вам лучше написать?");
        setContactStep("messenger");
        setStage("messenger_choice");
      }
    }
  };

  const handleMessenger = async (option: string) => {
    addUserMessage(option);
    setAnswers((a) => ({ ...a, messenger: option }));
    await addBotMessage(
      "Спасибо! Я скоро свяжусь с вами и подготовлю персональную стратегию. До встречи! 🚀",
      900
    );
    setStage("done");
  };

  const currentOptions = () => {
    if (stage === "niche") return STEPS[0].options;
    if (stage === "ads_exp") return STEPS[1].options;
    if (stage === "platform") return STEPS[2].options;
    if (stage === "budget") return STEPS[3].options;
    if (stage === "messenger_choice") return ["Telegram", "WhatsApp", "ВКонтакте", "Позвоните мне"];
    return [];
  };

  const showInput =
    stage === "niche_other" ||
    (stage === "contacts" && (contactStep === "name" || contactStep === "phone"));

  const options = currentOptions();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6 pointer-events-none">
      <div
        className="pointer-events-auto flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        style={{
          height: "min(600px, 90vh)",
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
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="rounded-2xl px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-line leading-relaxed"
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
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-1"
                style={{ background: "#f3f4f6" }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Options / Input */}
        {!typing && stage !== "done" && (
          <div className="px-4 pb-4 shrink-0 flex flex-col gap-2">
            {options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      stage === "messenger_choice" ? handleMessenger(opt) : handleOption(opt)
                    }
                    className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {showInput && (
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
          </div>
        )}
      </div>

      <style>{`
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
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
