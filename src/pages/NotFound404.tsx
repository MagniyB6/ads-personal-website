const NotFound404 = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: "#0a0a0a", fontFamily: "'Golos Text', sans-serif" }}
    >
      <style>{`
        @keyframes searchlight-left {
          0%   { transform: rotate(-35deg); }
          30%  { transform: rotate(15deg); }
          55%  { transform: rotate(-10deg); }
          80%  { transform: rotate(25deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes searchlight-right {
          0%   { transform: rotate(35deg); }
          25%  { transform: rotate(-20deg); }
          50%  { transform: rotate(10deg); }
          75%  { transform: rotate(-30deg); }
          100% { transform: rotate(35deg); }
        }
        @keyframes cop-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes cop-bob-delayed {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes float-404 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes glitch {
          0%   { clip-path: inset(0 0 98% 0); transform: translateX(0); }
          10%  { clip-path: inset(30% 0 50% 0); transform: translateX(-4px); }
          20%  { clip-path: inset(70% 0 10% 0); transform: translateX(4px); }
          30%  { clip-path: inset(10% 0 80% 0); transform: translateX(-2px); }
          40%  { clip-path: inset(50% 0 30% 0); transform: translateX(2px); }
          50%  { clip-path: inset(80% 0 5% 0); transform: translateX(-4px); }
          60%  { clip-path: inset(20% 0 60% 0); transform: translateX(4px); }
          70%  { clip-path: inset(60% 0 20% 0); transform: translateX(-2px); }
          80%  { clip-path: inset(5% 0 90% 0); transform: translateX(2px); }
          90%  { clip-path: inset(40% 0 40% 0); transform: translateX(-4px); }
          100% { clip-path: inset(0 0 98% 0); transform: translateX(0); }
        }
        @keyframes beam-l {
          0%   { opacity:0.13; transform:rotate(-35deg); }
          30%  { opacity:0.2;  transform:rotate(15deg); }
          55%  { opacity:0.1;  transform:rotate(-10deg); }
          80%  { opacity:0.17; transform:rotate(25deg); }
          100% { opacity:0.13; transform:rotate(-35deg); }
        }
        @keyframes beam-r {
          0%   { opacity:0.1;  transform:rotate(35deg); }
          25%  { opacity:0.2;  transform:rotate(-20deg); }
          50%  { opacity:0.13; transform:rotate(10deg); }
          75%  { opacity:0.17; transform:rotate(-30deg); }
          100% { opacity:0.1;  transform:rotate(35deg); }
        }
        @keyframes blink-l {
          0%,88%,100%{opacity:1;}93%{opacity:0.15;}
        }
        @keyframes blink-r {
          0%,80%,100%{opacity:1;}85%{opacity:0.15;}
        }
        .nf-cop-l { animation: cop-bob 2.8s ease-in-out infinite; }
        .nf-cop-r { animation: cop-bob-delayed 2.8s ease-in-out infinite 0.5s; }
        .nf-arm-l { transform-origin: 66px 55px; animation: searchlight-left  4s ease-in-out infinite; }
        .nf-arm-r { transform-origin: 66px 55px; animation: searchlight-right 4s ease-in-out infinite 0.7s; }
        .nf-num   { animation: float-404 3s ease-in-out infinite; }
        .nf-beam-l { transform-origin: top center; animation: beam-l 4s ease-in-out infinite; }
        .nf-beam-r { transform-origin: top center; animation: beam-r 4s ease-in-out infinite 0.7s; }
        .nf-torch-l { animation: blink-l 4s infinite; }
        .nf-torch-r { animation: blink-r 4s infinite 1.5s; }
        .nf-back-btn { transition: all 0.2s ease; }
        .nf-back-btn:hover { background: #ffffff !important; box-shadow: 0 0 40px rgba(255,255,255,0.2) !important; }
      `}</style>

      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(254,235,25,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(254,235,25,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Light beams in bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="nf-beam-l absolute" style={{ left:"15%", top:0, width:"220px", height:"100vh", background:"linear-gradient(180deg,rgba(254,235,25,0.28) 0%,transparent 65%)" }}/>
        <div className="nf-beam-r absolute" style={{ right:"15%", top:0, width:"220px", height:"100vh", background:"linear-gradient(180deg,rgba(254,235,25,0.22) 0%,transparent 65%)" }}/>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Scene row */}
        <div className="flex items-end justify-center gap-6 md:gap-16 mb-2">

          {/* Left cop */}
          <div className="nf-cop-l">
            <svg width="80" height="155" viewBox="0 0 90 160" fill="none">
              {/* hat */}
              <rect x="22" y="8" width="46" height="8" rx="4" fill="#1a1a2e"/>
              <rect x="18" y="14" width="54" height="5" rx="2" fill="#16213e"/>
              <rect x="30" y="6" width="30" height="10" rx="3" fill="#1a1a2e"/>
              <circle cx="45" cy="10" r="3.5" fill="#FEEB19"/>
              {/* head */}
              <ellipse cx="45" cy="34" rx="16" ry="18" fill="#f4c89a"/>
              {/* eyes */}
              <circle cx="39" cy="32" r="2.5" fill="#fff"/><circle cx="51" cy="32" r="2.5" fill="#fff"/>
              <circle cx="40" cy="32" r="1.5" fill="#1a1a2e"/><circle cx="52" cy="32" r="1.5" fill="#1a1a2e"/>
              {/* mouth */}
              <path d="M40 40 Q45 44 50 40" stroke="#c47a4a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              {/* body */}
              <rect x="27" y="52" width="36" height="48" rx="8" fill="#1a1a2e"/>
              {/* badge */}
              <rect x="36" y="61" width="10" height="7" rx="2" fill="#FEEB19" opacity="0.95"/>
              {/* belt */}
              <rect x="25" y="94" width="40" height="7" rx="3" fill="#111"/>
              {/* legs */}
              <rect x="28" y="100" width="14" height="38" rx="6" fill="#1a1a2e"/>
              <rect x="24" y="132" width="18" height="10" rx="4" fill="#222"/>
              <rect x="48" y="100" width="14" height="38" rx="6" fill="#1a1a2e"/>
              <rect x="48" y="132" width="18" height="10" rx="4" fill="#222"/>
              {/* left arm */}
              <rect x="18" y="55" width="12" height="36" rx="6" fill="#1a1a2e"/>
              {/* right arm + flashlight */}
              <g className="nf-arm-l">
                <rect x="60" y="55" width="12" height="44" rx="6" fill="#1a1a2e"/>
                <rect x="56" y="95" width="18" height="10" rx="4" fill="#3a3a3a"/>
                <ellipse className="nf-torch-l" cx="74" cy="100" rx="10" ry="6" fill="#FEEB19"/>
              </g>
            </svg>
          </div>

          {/* 404 */}
          <div className="nf-num relative select-none">
            <div style={{
              fontSize:"clamp(70px,13vw,128px)",
              fontWeight:900,
              color:"#FEEB19",
              lineHeight:1,
              letterSpacing:"-4px",
              textShadow:"0 0 60px rgba(254,235,25,0.45),0 0 120px rgba(254,235,25,0.2)",
            }}>
              404
            </div>
            {/* glitch copy */}
            <div aria-hidden style={{
              fontSize:"clamp(70px,13vw,128px)",
              fontWeight:900,
              color:"#ff4444",
              lineHeight:1,
              letterSpacing:"-4px",
              position:"absolute",
              top:0, left:0,
              animation:"glitch 5s steps(1) infinite",
              opacity:0.55,
              pointerEvents:"none",
            }}>
              404
            </div>
          </div>

          {/* Right cop (mirrored) */}
          <div className="nf-cop-r" style={{ transform:"scaleX(-1)" }}>
            <svg width="80" height="155" viewBox="0 0 90 160" fill="none">
              <rect x="22" y="8" width="46" height="8" rx="4" fill="#16213e"/>
              <rect x="18" y="14" width="54" height="5" rx="2" fill="#1a1a2e"/>
              <rect x="30" y="6" width="30" height="10" rx="3" fill="#16213e"/>
              <circle cx="45" cy="10" r="3.5" fill="#FEEB19"/>
              <ellipse cx="45" cy="34" rx="16" ry="18" fill="#f4c89a"/>
              <circle cx="39" cy="32" r="2.5" fill="#fff"/><circle cx="51" cy="32" r="2.5" fill="#fff"/>
              <circle cx="40" cy="32" r="1.5" fill="#1a1a2e"/><circle cx="52" cy="32" r="1.5" fill="#1a1a2e"/>
              <path d="M40 40 Q45 44 50 40" stroke="#c47a4a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <rect x="27" y="52" width="36" height="48" rx="8" fill="#16213e"/>
              <rect x="36" y="61" width="10" height="7" rx="2" fill="#FEEB19" opacity="0.95"/>
              <rect x="25" y="94" width="40" height="7" rx="3" fill="#111"/>
              <rect x="28" y="100" width="14" height="38" rx="6" fill="#16213e"/>
              <rect x="24" y="132" width="18" height="10" rx="4" fill="#222"/>
              <rect x="48" y="100" width="14" height="38" rx="6" fill="#16213e"/>
              <rect x="48" y="132" width="18" height="10" rx="4" fill="#222"/>
              <rect x="18" y="55" width="12" height="36" rx="6" fill="#16213e"/>
              <g className="nf-arm-r">
                <rect x="60" y="55" width="12" height="44" rx="6" fill="#16213e"/>
                <rect x="56" y="95" width="18" height="10" rx="4" fill="#3a3a3a"/>
                <ellipse className="nf-torch-r" cx="74" cy="100" rx="10" ry="6" fill="#FEEB19"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Subtitle */}
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"clamp(14px,2.2vw,17px)", letterSpacing:"0.04em", marginTop:"2rem", marginBottom:"2.5rem" }}>
          Технические проблемы на сайте — уже устраняем
        </p>

        {/* Button */}
        <a
          href="/"
          className="nf-back-btn"
          style={{
            display:"inline-flex",
            alignItems:"center",
            gap:"8px",
            background:"#FEEB19",
            color:"#000",
            fontWeight:700,
            fontSize:"16px",
            padding:"14px 36px",
            borderRadius:"10px",
            textDecoration:"none",
            boxShadow:"0 0 30px rgba(254,235,25,0.3)",
          }}
        >
          ← Вернуться на главную
        </a>
      </div>
    </div>
  );
};

export default NotFound404;
