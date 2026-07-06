import logo from '../../assets/images/logo.png';
export default function Sidebar({ isMain, activeTab, goMain }) {
  const menuItems = [
    { id: "dashboard", label: "Panel główny", hanzi: "主", sublabel: "Twój dzień nauki" },
    { id: "path",      label: "Mapa Wiedzy",  hanzi: "路", sublabel: "Ścieżka HSK" },
    { id: "tones",     label: "Tony",         hanzi: "声", sublabel: "Wizualizator" },
    { id: "profile",   label: "Profil",       hanzi: "我", sublabel: "Statystyki" },
  ];

  return (
    <aside
      className="flex-none flex flex-col justify-between"
      style={{
        width: "260px",
        minHeight: "100vh",
        backgroundColor: "var(--secondary)",
        borderRight: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 30,
        boxSizing: "border-box" 
      }}
    >
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-center px-2 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <img 
              src={logo} 
              alt="HSK Platform Logo" 
              className="w-full h-auto max-h-25 object-contain" 
            />
          </div>
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {menuItems.map((tab) => {
            const isActive = isMain && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goMain(tab.id)}
                className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group w-full cursor-pointer"
                style={{
                  backgroundColor: isActive ? "rgba(200,62,52,0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(200,62,52,0.18)" : "1px solid transparent",
                }}
              >
                <div
                  className="flex-none w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: isActive ? "rgba(200,62,52,0.1)" : "var(--muted)",
                    border: isActive ? "1px solid rgba(200,62,52,0.2)" : "1px solid var(--border)",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "17px", fontWeight: isActive ? 700 : 400, color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}>
                    {tab.hanzi}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--foreground)" : "var(--muted-foreground)", lineHeight: 1.2 }}>
                    {tab.label}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: isActive ? "var(--primary)" : "transparent", transition: "color 0.2s" }}>
                    {tab.sublabel}
                  </p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: "var(--primary)" }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="px-4 pb-5">
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(79,121,66,0.08)", border: "1px solid rgba(79,121,66,0.2)" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "3px" }}>
            PROGNOZA EGZAMINU
          </p>
          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "15px", fontWeight: 700, color: "var(--accent)" }}>
            HSK 3
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", marginTop: "1px" }}>
            est. 15.03.2027
          </p>
        </div>
      </div>
    </aside>
  );
}