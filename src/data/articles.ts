export type ContentBlock =
  | { type: "text"; value: string; items?: never; href?: never; label?: never }
  | { type: "list"; items: string[]; value?: never; href?: never; label?: never }
  | { type: "code"; value: string; items?: never; href?: never; label?: never }
  | { type: "link"; label: string; href: string; value?: never; items?: never };

export type Article = {
  id: number;
  slug: string;
  title: string;
  image: string;
  date: string;
  tag: string;
  content: ContentBlock[];
};

const ARTICLE_IMAGE = "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/d1ccf348-9075-46f2-ad88-dc6de2e3e883.png";
const TRAFFIC_LIGHT_IMAGE = "https://cdn.poehali.dev/projects/d8daede3-cd33-47b5-afe6-fe49f35fc4fe/bucket/444e0ed5-7d08-426c-99aa-cabe165bdc35.jpg";

export const articles: Article[] = [
  {
    id: 1,
    slug: "html5-yandex-direct",
    title: "Как добавить HTML5 для Яндекс Директа через Google Web Designer",
    image: ARTICLE_IMAGE,
    date: "Апрель 2026",
    tag: "Яндекс Директ",
    content: [
      { type: "text", value: "На всякий случай тут оставлю, может кто столкнется с проблемой и будет решение 👇🏻" },
      { type: "text", value: "Когда +- разобрался, все кажется уже и не слишком сложно))" },
      {
        type: "list",
        items: [
          "Идем скачивать Google Web Designer",
          "Перед этим подготавливаем все в фигме (желательно в группировке) в формате JPG не PNG (так как помним про ограничение размера до 1мб). У меня макет состоял из 4 горизонтальных баннеров плавно сменяющих друг друга, но может кто еще чего придумает.",
          "Делаем минимальную анимацию и зацикливаем на повторение.",
        ],
      },
      { type: "text", value: "4) Теперь про правки в самом коде, нужно добавить информацию о размере в <Head>, выглядит вот так:" },
      { type: "code", value: `<meta name="ad.size" content="width=640,height=134">` },
      { type: "text", value: `Далее делаем баннер кликабельным, после <Body> добавляем:` },
      { type: "code", value: `<a id="click_area" href="#" target="_blank" style="display:block; width:640px; height:134px;">` },
      { type: "text", value: "И добавляем обработку клика яндекса:" },
      { type: "code", value: `<script>\n  document.getElementById('click_area').href =\n    yandexHTML5BannerApi.getClickURLNum(1);\n</script>` },
      { type: "text", value: "У меня был косяк в том, что я все это сделав — сталкивался с проблемой, мол не удалено из кода:" },
      { type: "code", value: `<script data-source="https://s0.2mdn.net/ads/studio/Enabler.js" data-exports-type="gwd-google-ad" src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>` },
      { type: "text", value: "Чтобы это решить — просто в GWD выбирайте при создании «внешнее объявление» и всё (см скрин). Если кому-то сэкономит время буду рад 🤝🔥" },
      { type: "link", label: "Урок по созданию HTML Баннера на YouTube", href: "https://www.youtube.com/watch?v=MoKGQIykurg" },
    ],
  },
  {
    id: 2,
    slug: "svetofor-master-kampaniy",
    title: "Принцип светофора в Мастере кампаний🚦",
    image: TRAFFIC_LIGHT_IMAGE,
    date: "Апрель 2026",
    tag: "Яндекс Директ",
    content: [
      { type: "text", value: "Как-то уже отвечал про него. Однако давайте расскажу ещё раз про эти индикаторы подробнее." },
      { type: "text", value: "В Мастере кампаний у элементов объявлений со временем появляются цветовые индикаторы. Обычно это происходит в течение недели с момента добавления элемента, когда накоплено достаточно статистики." },
      { type: "text", value: "Основной принцип светофора — это сравнение показателей между собой внутри одной кампании:" },
      {
        type: "list",
        items: [
          "🟢 Зелёный — элемент объявлений работает хорошо, и он чаще всего отбирается для показов среди остальных",
          "🟡 Жёлтый — элемент отбирается чуть реже для показов или ещё не собрал достаточно данных",
          "🔴 Красный — показывает, что другие элементы одного типа внутри кампании работают эффективнее",
        ],
      },
      { type: "text", value: "При этом допустимо, что все элементы могут быть одного или двух цветов. В этом случае они работают с очень близкими друг к другу показателями." },
      { type: "text", value: "Сам светофор не влияет на показы, он нужен только для сравнения. Жёлтые и красные сигналы — относительная оценка. Если заменить менее эффективные элементы на другие, то, возможно, они также окрасятся в жёлтый и красный цвета через некоторое время. Ротировать элементы можно и даже полезно, особенно если показатели кампании перестали расти." },
      { type: "text", value: "Цветовая индикация рассчитывается алгоритмом на основании количества показов, кликов, конверсий и суммы потраченных средств внутри кампании." },
      { type: "text", value: "Пост взят с телеграм канала «Громов о контексте»" },
      { type: "link", label: "Источник: t.me/ya_gromov/618", href: "https://t.me/ya_gromov/618" },
    ],
  },
];
