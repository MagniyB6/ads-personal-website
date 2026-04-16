import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const DSP_SITES = [
  "dsp-mail-ru.yandex.ru",
  "dsp.yandex.ru",
  "dsp-unityads.yandex.ru",
  "dsp-minimob-ww.yandex.ru",
  "dsp-yeahmobi.yandex.ru",
  "dsp-betweenx.yandex.ru",
  "dsp-ironsource.yandex.ru",
  "dsp-inneractive.yandex.ru",
  "dsp-opera-exchange.yandex.ru",
  "dsp-mintagral.yandex.ru",
  "dsp-xiaomi.yandex.ru",
  "dsp-start-io.yandex.ru",
  "dsp-blueseax.yandex.ru",
  "dsp-webeye.yandex.ru",
  "dsp-transsion.yandex.ru",
  "dsp-inmobi.yandex.ru",
  "dsp-huawei.yandex.ru",
];

const GAME_SITES = [
  "ru.thousandcardgame.android",
  "com.diamonds.expert.game",
  "game.yandex.ru",
  "grill.sort.food.games.match.puzzle",
  "com.KGames.InifinityRun",
  "tower.defense.ant.conquer.games",
  "sorting.games.goods.sort.triple.match3d.puzzle.stuff",
  "com.tgames.line98classic",
  "com.sorting.games.match3d.goods.triple.puzzle",
  "com.openmygame.games.android.wordsearchsea",
  "com.openmygame.magicwordsearch",
  "com.cloudycastlegames.wordline",
  "com.openmygame.games.android.wordpizza",
  "com.gamebrain.hexasort",
  "games.vaveda.militaryoverturn",
  "and.matchgames.zenblossom",
  "org.aastudio.games.longnards",
  "azurgames.idle.war",
  "com.easybrain.number.puzzle.game",
];

type Section = {
  id: string;
  label: string;
  icon: string;
  sites: string[];
  note?: string;
  downloadUrl?: string;
  downloadTotal?: number;
};

const VK_SITES = [
  "vk.com",
  "220vk.org",
  "m.vk.com",
  "com.vk.vkclient",
  "kissvk.in",
  "list-vk.com",
  "top1000vk.com",
  "onli-vk.ru",
  "top100vk.com",
  "bibliovk.net",
  "jobvk.com",
  "downloadmusicvk.site",
  "kissvk.com",
  "220vk.com",
  "top-list-vk.com",
  "usevk.ru",
  "vk.99px.ru",
  "new.220vk.ru",
  "kissvk.xyz",
  "regvk.com",
  "ru.dkvk.magnetology",
  "lib-li-vk.com",
  "vk.laskino.xyz",
  "ru.jobvk.com",
  "stikvk.ru",
  "vk.baraholka.russia",
  "kissvk.pro",
  "vk.ru",
  "vk.otdamdarom.russia",
];

const GDZ_SITES = [
  "gdz-raketa.ru",
  "gdz-ok.ru",
  "gdz.top",
  "gdzkote.ru",
  "gdzotvet.ru",
  "gdz.ru",
  "gdz.moda",
  "com.reshak.gdzapp",
  "gdzbakulin.ru",
  "gdz.fm",
  "angl-gdz.ru",
  "gdz.red",
  "gdzking.ru",
  "com.gdz.max.greatapp",
  "yagdz.com",
  "gdz-shok.ru",
  "gdzshnik.ru",
  "gdztube.com",
  "gdzznaika.ru",
  "com.gdz_ru",
  "vipgdz.com",
  "gdz-putina.info",
  "gdz-r.ru",
  "gdz24.com",
  "geo-gdz.ru",
  "gdzdom.ru",
  "freegdz.ru",
  "eng-gdz.ru",
  "biogdz.ru",
  "lovegdz.com",
  "gdzbot.com",
  "gdzfgos.ru",
  "dagdz.ru",
  "gdzroom.ru",
  "ru.reshak.gdzapp",
  "gdzmonstr.ru",
  "chatgdz.ru",
  "history-gdz.ru",
  "gdz-klass.ru",
  "com.gdzme",
  "gdegdz.ru",
  "kzgdz.com",
  "gdz.rodeo",
  "gdzbro.ru",
  "gdzwow.com",
  "gdzen.ru",
  "gdz-gdz-gdz.ru",
  "gdz-polinkin.ru",
  "gdz-history.ru",
  "gdzputina.net",
  "gdzolo.ru",
  "na5-gdz.ru",
  "gdzpofoto.com",
  "gdzilla.space",
  "gdz-doma.ru",
  "z.gdzdom.ru",
  "gdz-spishy.ru",
  "gdz.me",
  "gdzland.ru",
  "supergdz.ru",
  "gdz.one",
  "gdz-books.ru",
  "gdzrus.ru",
  "vsegdz.ru",
  "gdzlady.biz",
  "gdz24.org",
  "gdz-online.com",
  "gdzbomb.ru",
  "gdz.pub",
  "gdzpro.com",
  "gdz-fizika.ru",
  "tutgdzbesplatno.ru",
  "com.javalearning.gdzrussia",
  "gdz-otvety.ru",
  "ru.thenewschool.gdz",
  "filingdz.ru",
  "gdz-po.ru",
  "free-gdz.ru",
  "gdz-resheba.ru",
];

const VPN_SITES = [
  "free.vpn.proxy.secure",
  "com.now.vpn",
  "com.free.vpn.hotspot.secure.vpnify",
  "free.vpn.unblock.proxy.turbovpn",
  "app.jumpjumpvpn.jumpjumpvpn",
  "com.free.vpn.convert.ParserVPN",
  "com.free.vpn.proxy.master",
  "com.supervpn.vpn.free.proxy",
  "com.asinosoft.vpn",
  "con.hotspot.vpn.free.master",
  "com.fly.ultra.free.vpn.high",
  "octohide.vpn",
  "com.blue.shield.one.vpn",
  "com.free.vpn.proxy.bearmaster",
  "com.freevpnplanet",
  "com.freevpn.vpn.fast.simple",
  "com.free.tiptop.vpn.proxy",
  "vpn.free.orange",
  "free.vpn.unblock.proxy.vpnmaster",
  "com.vpn.ifylite.vpnfree.lite",
  "com.db.speedVPN",
  "free.vpn.unblock.proxy.vpn.master.pro",
  "com.vpn.planet.config.coverter",
  "com.bear.vpn.super.fast.unlimited.connect",
  "com.free.vpn.proxy.master.app",
  "fbll.XSpotVPN",
  "aerovpn.app.fox.free.vpn.AirPlaneMaster",
  "com.atrix.rusvpn",
  "com.nord.star.vpn",
  "com.vpn.freevpn.fastvpn.simple",
  "com.top.x.connect.freedom.vpn.ios.app",
  "com.vpn.free.hotspot.secure.vpnify",
  "com.vpnappvpn.VPNApp",
  "fast.free.vpn.proxy",
  "com.free.bear.shield.vpn",
  "com.super.free.vpn.config",
  "com.this.windvpn",
  "io.deveem.vpn.global",
  "com.vpn.secure.proxy.guard",
  "com.satoshi.vpns",
  "com.kbyc.owlVPN",
  "com.cool.vpn.lite",
  "com.freevpn.fast.cat.pro",
  "com.fwl.newvpn",
  "com.super.free.supervpn",
  "com.vpn.proxy.unblock.privatevpn.fastvpn.securevpn",
  "com.ufovpn.connect.velnet",
  "com.corgi.VPNStart",
  "kg.nooken.vpn.dev",
  "com.vpn.tools.bitter.BitterVpn",
  "com.triangle.VPNTriangle",
  "com.fast.free.secure.unblock.vpn",
  "com.rg.nomadvpn",
  "app.greywebs.vpn",
  "app.start.vpn.russia",
  "io.deveem.vpn",
  "com.edgevpn.secure.proxy.unblock",
  "com.beanstudiohq.vpn",
  "com.zoogvpn.android",
  "com.lychee.vpn.supervpn.top",
  "com.vpn.securevpnpro",
  "free.vpn.proxy.vpnly",
  "free.vpn.unblock.proxy.turbovpn.lite",
  "com.nodramavpn.android",
  "com.humble.cloudvpn",
  "antivirus.virus.cleaner.clean.vpn.booster",
  "com.kbyc.DeerVPN",
  "com.vpn.onesvpn",
  "com.fkey.master.zip.vpn",
  "com.vpn.vpnify.vpnfree.vpnsuper",
  "com.FFNL.HitSpeedVPN",
  "com.top.free.vpn",
  "com.vpn-buck.proxy",
  "free.vpn.filter.unblock.proxy.hotspot.fastvpn",
  "vpn.fast.unlimited.free",
  "com.vpn.stolitomson",
  "free.vpn.filter.freely.vproject",
  "com.freevpn.russiavpn",
  "com.hotspotvpn.super4-ios",
  "com.speed.svpn",
  "com.platovpn.vpn",
  "com.vpn_tube.vpntube",
  "com.db.FastVPN",
  "vpnredcat.com.VPNClient",
  "com.vpn.camel.free.Camel-Lite",
  "com.freefastconnect.vpn",
  "com.top.free.planet.saturn.vpn.app",
  "com.dancy.FastVPN",
  "com.turbosquirrel.vpn",
  "kg.vostok.vpn",
  "com.ten.fast.vpn.super.uncle",
  "com.erc.russiavpn",
  "vpn.com.stolitomson",
  "com.vpnfreeunlim.app",
  "com.secure.vpn.proxy.fast.server",
  "com.stolitomson.vpn",
  "com.ultralvpn.max",
  "com.vpnbeaver.vpn",
  "com.vpn.hedgehog",
  "com.connect.vpn.fast.vpn.hotspot",
  "vpnjantit.com",
  "app.sfssinc.safevpn",
  "com.fast.vpn.unblocker.unlimited.free",
  "com.snail.VPNSnail",
  "timon.kiwi.vpn.premium",
  "com.teng.ify.master.vpn",
  "com.lyh.flowvpn",
  "com.quan.brother.secure.vpn",
  "com.techconnect.hitvpn",
  "com.lychee.vpn.supervpn.top1",
  "com.free.vpn.planet.dark2",
  "com.vpn.quick.super.QuickVPN1",
  "com.ktsoev.mintvpn",
  "com.humble.unlimited_vpn_lite",
  "com.softsystems.vpn",
  "com.free.vpn.planet.rus",
  "com.free.fast.hot.vpn.ios",
  "com.ivansoft.VPN",
  "com.vpn.fire.good.fox",
  "com.simple.pro.fast.unlimited.private.vpn",
  "aerovpn.app.fox.free.vpn",
  "com.CynepLinkVPN.app",
  "com.seak.vpntool",
  "vpn.vpn.green",
  "com.top.free.shield.vpn.ios.app",
  "com.connect.proxy.catvpn",
  "com.speedy.vpn",
  "com.notvpn",
  "com.vpn.kernel.core.hex",
  "com.vinevpn.app",
  "com.technosofts.vpnmax",
  "VPNSecure.com.VPNSecure",
  "com.supervpn.max",
  "net.travelvpn.ikev2",
  "vpn.secure.fast.proxy.free",
  "fbll.bearVPN",
  "free.vpn.astro.rus",
  "com.mtadeveloper.myvpn",
  "com.freevpn.vpnbear",
  "com.free.vpn.planet",
  "com.admaster.CircleVPN",
  "com.vpn.proxy.master.lemon.patiapps",
  "com.annsoft.vpn",
  "com.vpnhouse",
  "com.polaris.ravenvpn",
  "com.saharavpn.chrono",
  "app.vless.vpn",
  "com.coco.neon.vpn.fly",
  "com.tikvpn.tikvpn",
  "com.pavloffmedev.adcoinvpn",
  "com.defendvpn.russiavpn",
  "free.vpn.proxy.secure.pro",
  "com.vpnservice.TurtleVPN",
  "com.platoxvpn.apple",
  "top.vpn.fast.ios",
  "com.booster.proxy.fast.secure.vpn",
  "com.bobr.vpn1pro",
  "com.turboapps.DotVPN",
  "com.hotspotvpn.super4-ios.dark",
  "free.vpn.proxy.secure.unlimited",
  "proxy.robotsecure.vpn",
  "com.secure.vpn.proxy",
  "com.free.connect.proxy.rabbit.vpn",
  "com.freevpn.vpnfrance",
  "com.lyh.hitvpn",
  "app.nyx.vpn",
  "com.vpn-buck.proxy.pro",
  "com.vpn.proxyme",
  "com.appsvpn.securevpnhw",
  "vpnobratno.info",
  "com.nord.shield.vpn",
  "io.deveem.vpn.ru",
  "com.LY.VPNAssistant",
  "com.owl.vpn.app",
  "com.supersecurevpn",
  "fsl.BuckSpeedVPN",
  "com.grossvpn.exd",
  "com.REDIZIT.AstraVPN",
  "com.npvpn.vpn",
  "com.fast.secure.proxyvpn.unlimitedproxy.security",
  "com.gulfsupervpn",
  "com.vpnsatoshi.vpnsatoshiapp",
  "cleaner.antivirus.cleaner.virus.clean.vpn",
  "org.freevpn.vpn",
  "com.hotspotvpn.super4-ios.lite",
  "com.vpn.secure.lite.proxy.ios",
  "com.khrm.fastsecvpn",
  "com.vpn.onefree.proxy",
  "CatVPN.CatVPN",
  "com.freeproxy.bytevpn",
  "com.top.easy.freevpn.fast",
  "com.vpn.boat.free.boatllite.BoatConnect",
  "com.begadigital.KikoVPN",
  "com.svoi.vpnmain",
  "com.rg.nomadvpnne",
  "com.goodbenya.developer.be_free_vpn",
  "com.rg.nomadvpnkz",
  "com.vpn.super.unlimited.proxy.open.free",
  "com.hafiza.vpn.safe",
  "com.fast.secure.unblock.website.vpn",
  "tg.televpn.messenger",
  "com.optimal.vpn",
  "com.krishnatechnoweb.vpnbrowser",
  "com.bearvpn.vpn",
  "top.yalaso.neo.vpn",
  "com.free.vpn.unlimited.hotpotshield.vpnmaster",
  "com.falconvpn.securelink.vpn",
  "com.Next.VPN",
  "com.free.vpn.pro.unblock.proxy.hotspot.vpn",
  "con.russ.vpn.application",
  "com.bobr.vpn1",
  "com.freefastconnect.vpn.lite",
  "free.vpn.unblock.proxy.agivpn",
  "vpn.provilen.proxybrowser",
  "co.allconnected.vpnmaster",
  "org.homevpn",
  "pro.vpnfreedom.android",
  "org.freevpn",
  "com.allconnected.turbovpn",
  "net.fouruvpn.vpn4u",
  "timon.kiwi.vpn",
  "comrade.vpn",
  "freeopenvpn.org",
  "antivirus.anti.virus.applock.protection.vpn",
  "com.satoshi.vpns.box",
  "com.flykey.flyvpn1",
  "com.hbirdVPN",
  "fruice.tomatovpn.security.turbo.proxy.ipchanger.unblocksites",
  "com.vpn-buck.proxy.lite",
  "com.super.fast.secure.vpn.patiapps",
  "com.hafiza.vpn.gaming",
  "com.platoxvpn.android",
  "com.lukayn.ratatoskvpn",
  "com.fspl.ShiledVPN",
  "timon.ultrafastvpn.net",
  "com.planetvpnpro.canto",
  "mobi.mobilejump.freevpn",
  "ios.vpnmaster.proxy",
  "com.gyh.bearvpn",
  "free.vpn.unblock.fast.proxy.vpn.master.pro.lite",
  "com.convivator.foxvpn",
  "com.quantum.vpn.proxy.betensh",
  "ios.vpnmaster.lite.proxy",
  "vpn.free.fast.ios.lion",
  "com.thefreevpn",
  "open.free.unlimited.proxy.vpn.apps",
  "com.satoshi.vpns.lite",
  "russia.vpn.dollarvpn",
  "com.ray.vpn.sky",
  "com.instavpns.max",
  "com.astravpn.security.vpnproxy",
  "com.androidsecurity.vpn",
  "com.free.unlimited.hotspot.vpn",
  "com.fast.best.free.vpn",
  "com.app.fast.vpn",
  "com.green.vpn.proxy",
  "freevpn4you.net",
  "com.hwplutovpn.chrono",
  "app.nnm.vpn",
  "free.vpn.unlimited.fast.ios.pronghorn",
  "com.hothotdag.vpnproxy",
  "com.newvpn",
  "mobi.mobilejump.vpn",
  "com.rg.nomadvpntv",
  "com.freevpn.vpn.turbo",
  "vpn.vpnpro.vpnbrowser",
  "com.DenCom.NovaVPN",
  "com.freeguardvpn.app",
  "www.freeopenvpn.org",
];

const RSY_SECTIONS: Section[] = [
  {
    id: "dsp",
    label: "DSP площадки",
    icon: "List",
    sites: DSP_SITES,
  },
  {
    id: "games",
    label: "Игровые площадки",
    icon: "Gamepad2",
    sites: GAME_SITES,
    note: "Не рекомендую удалять все игровые сразу — с некоторых могут приходить хорошие заявки",
    downloadUrl: "https://drive.google.com/file/d/1btr_vRQ49x3nk98RIkmC-UpVTBCJyOYQ/view?usp=sharing",
    downloadTotal: 2560,
  },
  {
    id: "vk",
    label: "VK площадки",
    icon: "Users",
    sites: VK_SITES,
  },
  {
    id: "gdz",
    label: "ГДЗ площадки",
    icon: "BookOpen",
    sites: GDZ_SITES,
  },
  {
    id: "vpn",
    label: "VPN площадки",
    icon: "Shield",
    sites: VPN_SITES,
  },
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

function RsyBlock({ sections }: { sections: Section[] }) {
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