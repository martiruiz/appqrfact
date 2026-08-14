import React, { useState } from "react";

// ---- Design tokens ----
const C = {
  ink: "#12182B",
  paper: "#F5F2E9",
  card: "#FFFFFF",
  verified: "#00B37A",
  verifiedDark: "#00875A",
  amber: "#E8A23D",
  text: "#1C2333",
  muted: "#7C8194",
  line: "#E4E0D3",
};

const IVA_RATE = 0.21;

const DEMO_CLIENTS = [
  { nif: "B67432190", name: "Bar Restaurant Can Manel SL", address: "C. Major 14, Girona" },
  { nif: "45789231F", name: "Marta Solé Puig", address: "Av. Diagonal 220, Barcelona" },
  { nif: "B58821034", name: "Esports Vallès SL", address: "C. Indústria 8, Sabadell" },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Targeta", icon: "▭" },
  { id: "cash", label: "Efectiu", icon: "○" },
  { id: "transfer", label: "Transferència", icon: "⇄" },
  { id: "bizum", label: "Bizum", icon: "◇" },
];

const PLANS = [
  { id: "basic", name: "Bàsic", price: 9, period: "/mes", desc: "Fins a 30 factures/mes", features: ["Escaneig QR il·limitat", "1 usuari"] },
  { id: "pro", name: "Pro", price: 24, period: "/mes", desc: "Factures il·limitades", features: ["Escaneig QR il·limitat", "Fins a 5 usuaris", "Exportació comptable"] },
];

function euro(n) {
  return n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });
}

// Deterministic pseudo-QR pattern generated from the business's own fiscal data.
// (Visual placeholder for a real QR encoder — in production this would encode
// a lookup ID pointing to this business's record in the app's database.)
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function QRCode({ data, size = 180 }) {
  const grid = 15;
  const seed = hashString(data || "guinew-facturaqr");
  const cells = [];
  let s = seed;
  for (let i = 0; i < grid * grid; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    cells.push(s % 5 === 0); // ~20% filled, sparse-QR look
  }
  const cell = size / grid;
  const finder = (x, y) => (
    <g>
      <rect x={x} y={y} width={cell * 3} height={cell * 3} fill={C.ink} />
      <rect x={x + cell * 0.6} y={y + cell * 0.6} width={cell * 1.8} height={cell * 1.8} fill={C.paper} />
      <rect x={x + cell * 1.1} y={y + cell * 1.1} width={cell * 0.8} height={cell * 0.8} fill={C.ink} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.paper, borderRadius: 8 }}>
      {cells.map((filled, i) => {
        const x = (i % grid) * cell;
        const y = Math.floor(i / grid) * cell;
        const inFinderZone =
          (x < cell * 3.5 && y < cell * 3.5) ||
          (x > size - cell * 3.5 && y < cell * 3.5) ||
          (x < cell * 3.5 && y > size - cell * 3.5);
        if (!filled || inFinderZone) return null;
        return <rect key={i} x={x} y={y} width={cell * 0.85} height={cell * 0.85} fill={C.ink} />;
      })}
      {finder(2, 2)}
      {finder(size - cell * 3 - 2, 2)}
      {finder(2, size - cell * 3 - 2)}
    </svg>
  );
}

// ---- Small building blocks ----
function PhoneChrome({ children, bottomNav }) {
  return (
    <div
      className="flex flex-col overflow-hidden w-full"
      style={{
        minHeight: "100dvh",
        background: C.paper,
      }}
    >
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {children}
      </div>
      {bottomNav}
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.line}` }}>
      {onBack && (
        <button onClick={onBack} style={{ color: C.text, fontSize: 18, fontWeight: 700 }} className="leading-none">
          ←
        </button>
      )}
      <div style={{ fontFamily: "monospace", letterSpacing: 1, fontSize: 11, color: C.muted, textTransform: "uppercase" }}>
        {title}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, mono = true }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={!onChange}
        style={{
          width: "100%",
          fontFamily: mono ? "monospace" : "inherit",
          fontSize: 14,
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: C.card,
          color: C.text,
        }}
      />
    </div>
  );
}

function StampBadge({ size = 64 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${C.verified}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-8deg)",
        boxShadow: `0 0 0 3px ${C.paper}, 0 0 0 4px ${C.verified}`,
      }}
    >
      <div style={{ textAlign: "center", lineHeight: 1.1 }}>
        <div style={{ fontFamily: "monospace", fontSize: size * 0.14, fontWeight: 700, color: C.verified, letterSpacing: 1 }}>
          VERIFACTU
        </div>
        <div style={{ fontFamily: "monospace", fontSize: size * 0.11, color: C.verified }}>✓ OK</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        background: disabled ? C.line : C.ink,
        color: disabled ? C.muted : C.paper,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 0.3,
        border: "none",
      }}
    >
      {children}
    </button>
  );
}

const TABS = [
  { id: "home", label: "Inici", icon: "⌂" },
  { id: "invoices", label: "Factures", icon: "▤" },
  { id: "profile", label: "Perfil", icon: "◍" },
];

function BottomNav({ active, onNavigate }) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${C.line}`,
        background: C.paper,
        padding: "8px 4px calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 4px",
              color: isActive ? C.ink : C.muted,
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</div>
            <div style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, fontFamily: "monospace", letterSpacing: 0.3 }}>
              {t.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---- Screens ----
export default function FacturaQRApp() {
  const [screen, setScreen] = useState("subscribe");
  const [history, setHistory] = useState([]);
  const [company, setCompany] = useState({ nif: "", name: "", address: "", email: "", phone: "", invoiceCopyEmail: "" });
  const [plan, setPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [client, setClient] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([{ concept: "", price: "" }]);
  const [generating, setGenerating] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [lastInvoice, setLastInvoice] = useState(null);

  const total = items.reduce((s, it) => s + (parseFloat(it.price) || 0), 0);
  const totalWithIva = total * (1 + IVA_RATE);

  // Simple navigation history so "back" always works, from anywhere in the app
  function goTo(next) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setScreen(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }
  function goToTab(tab) {
    // Tab switches reset the back-stack to that tab, like a normal bottom nav
    setHistory([]);
    setScreen(tab);
  }

  function startScan() {
    setScanning(true);
    setClient(null);
    setTimeout(() => {
      const c = DEMO_CLIENTS[Math.floor(Math.random() * DEMO_CLIENTS.length)];
      setClient(c);
      setScanning(false);
    }, 1400);
  }

  function generateInvoice() {
    setGenerating(true);
    // Simulated call to a Verifactu-ready invoicing API (e.g. B2Brouter / verifactuapi.es sandbox)
    setTimeout(() => {
      const inv = {
        id: `F-${String(invoices.length + 1).padStart(4, "0")}`,
        date: new Date().toLocaleDateString("ca-ES"),
        client,
        items,
        total,
        totalWithIva,
      };
      setInvoices((v) => [inv, ...v]);
      setLastInvoice(inv);
      setGenerating(false);
      setHistory([]);
      setScreen("result");
    }, 1800);
  }

  function chargeWithStripe() {
    setSubscribing(true);
    // Simulated Stripe Checkout confirmation for the app subscription
    setTimeout(() => {
      setSubscribing(false);
      goTo("setup");
    }, 1600);
  }

  function resetFlow() {
    setClient(null);
    setItems([{ concept: "", price: "" }]);
    goToTab("home");
  }

  const isTabScreen = screen === "home" || screen === "invoices" || screen === "profile";

  return (
    <PhoneChrome
      bottomNav={isTabScreen ? <BottomNav active={screen} onNavigate={goToTab} /> : null}
    >
      {/* SUBSCRIBE */}
      {screen === "subscribe" && (
        <div className="flex-1 flex flex-col" style={{ padding: 24 }}>
          <div style={{ marginTop: 20, marginBottom: 6, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 2 }}>
            BENVINGUT
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4, lineHeight: 1.1 }}>
            Tria el teu pla
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Cancel·la quan vulguis. Cobrament segur amb Stripe.
          </div>

          <div className="flex flex-col gap-3" style={{ marginBottom: 20 }}>
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                style={{
                  textAlign: "left",
                  padding: 18,
                  borderRadius: 16,
                  border: `1.5px solid ${plan === p.id ? C.ink : C.line}`,
                  background: plan === p.id ? C.ink : C.card,
                  color: plan === p.id ? C.paper : C.text,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800 }}>
                    {p.price}€<span style={{ fontSize: 11, fontWeight: 400 }}>{p.period}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>{p.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ fontSize: 11, opacity: 0.85 }}>✓ {f}</div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {plan && (
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, textAlign: "center" }}>
              Es cobraran {PLANS.find((p) => p.id === plan).price}€ ara i cada mes via Stripe.
            </div>
          )}
          <PrimaryButton disabled={!plan || subscribing} onClick={chargeWithStripe}>
            {subscribing ? "Processant amb Stripe…" : "Subscriure amb Stripe"}
          </PrimaryButton>
        </div>
      )}

      {/* SETUP */}
      {screen === "setup" && (
        <div className="flex-1 flex flex-col" style={{ padding: 24 }}>
          <div style={{ marginTop: 30, marginBottom: 6, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 2 }}>
            PAS 1 / 1
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4, lineHeight: 1.1 }}>
            Dades del<br />teu negoci
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>
            Es fan servir per emetre les teves factures. Podràs completar la resta (adreça, email...) al teu Perfil.
          </div>
          <Field label="Nom / Raó social" value={company.name} onChange={(v) => setCompany({ ...company, name: v })} mono={false} />
          <Field label="NIF / CIF" value={company.nif} onChange={(v) => setCompany({ ...company, nif: v })} />
          <div style={{ flex: 1 }} />
          <PrimaryButton disabled={!company.name || !company.nif} onClick={() => goToTab("home")}>
            Continuar
          </PrimaryButton>
        </div>
      )}

      {/* HOME */}
      {screen === "home" && (
        <div className="flex-1 flex flex-col">
          <TopBar title={company.name || "El teu negoci"} />
          <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>NIF {company.nif}</div>

            <button
              onClick={() => goTo("scan")}
              style={{
                background: C.card,
                border: `1px dashed ${C.ink}`,
                borderRadius: 16,
                padding: "22px 16px",
                textAlign: "left",
                marginBottom: 22,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>+ Nova factura</div>
              <div style={{ fontSize: 12, color: C.muted }}>Escaneja el QR fiscal del client</div>
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.muted, fontFamily: "monospace" }}>
                FACTURES RECENTS
              </div>
              {invoices.length > 0 && (
                <button onClick={() => goToTab("invoices")} style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>
                  Veure totes →
                </button>
              )}
            </div>
            {invoices.length === 0 && (
              <div style={{ fontSize: 12, color: C.muted, padding: "20px 0", textAlign: "center" }}>
                Encara no has generat cap factura.
              </div>
            )}
            <div className="flex flex-col gap-2">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv.id} style={{ background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: C.text }}>{inv.id}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{inv.client.name}</div>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: C.verifiedDark }}>
                    {euro(inv.totalWithIva)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INVOICES (tab) */}
      {screen === "invoices" && (
        <div className="flex-1 flex flex-col">
          <TopBar title="Les teves factures" />
          <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
            {invoices.length === 0 && (
              <div style={{ fontSize: 12, color: C.muted, padding: "40px 0", textAlign: "center" }}>
                Encara no has generat cap factura.
                <div style={{ marginTop: 14 }}>
                  <PrimaryButton onClick={() => goTo("scan")}>+ Nova factura</PrimaryButton>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {invoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => { setLastInvoice(inv); goTo("result"); }}
                  style={{ background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: C.text }}>{inv.id}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{inv.client.name} · {inv.date}</div>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: C.verifiedDark }}>
                    {euro(inv.totalWithIva)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE (tab) */}
      {screen === "profile" && (
        <div className="flex-1 flex flex-col">
          <TopBar title="Perfil" />
          <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>

            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.line}`, marginBottom: 16, alignItems: "center", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.muted, fontFamily: "monospace", marginBottom: 12, alignSelf: "flex-start" }}>
                EL TEU QR FISCAL
              </div>
              <QRCode data={`${company.nif}|${company.name}|${company.email}`} size={168} />
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 1.4 }}>
                Ensenya aquest codi perquè qualsevol negoci et faci una factura a l'instant.
                Al escanejar-lo reben les teves dades fiscals directament des de la base de dades de l'app.
              </div>
            </div>

            <div style={{ fontSize: 10, letterSpacing: 1, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>
              DADES FISCALS DEL NEGOCI
            </div>
            <Field label="Nom / Raó social" value={company.name} onChange={(v) => setCompany({ ...company, name: v })} mono={false} />
            <Field label="NIF / CIF" value={company.nif} onChange={(v) => setCompany({ ...company, nif: v })} />
            <Field label="Adreça fiscal" value={company.address} onChange={(v) => setCompany({ ...company, address: v })} mono={false} />
            <Field label="Email de facturació" value={company.email} onChange={(v) => setCompany({ ...company, email: v })} mono={false} />
            <Field label="Telèfon" value={company.phone} onChange={(v) => setCompany({ ...company, phone: v })} mono={false} />

            <div style={{ fontSize: 10, letterSpacing: 1, color: C.muted, fontFamily: "monospace", marginTop: 8, marginBottom: 10 }}>
              ENVIAMENT DE FACTURES
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 16, border: `1px solid ${C.line}`, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
                Cada factura que emetis s'enviarà també (en còpia) a aquest correu, a més del correu del client.
              </div>
              <Field
                label="Correu on rebre còpia de les factures"
                value={company.invoiceCopyEmail}
                onChange={(v) => setCompany({ ...company, invoiceCopyEmail: v })}
                mono={false}
              />
            </div>

            <div style={{ background: C.card, borderRadius: 14, padding: 16, border: `1px solid ${C.line}`, marginTop: 6, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Pla actual</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                {PLANS.find((p) => p.id === plan)?.name || "—"}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Cobrament amb Stripe</div>
              <button onClick={() => goTo("subscribe")} style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                Canviar de pla →
              </button>
            </div>

            <div style={{ background: C.card, borderRadius: 14, padding: 16, border: `1px solid ${C.line}`, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Factures emeses</div>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: C.text }}>{invoices.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* SCAN */}
      {screen === "scan" && (
        <div className="flex-1 flex flex-col">
          <TopBar title="Escaneig fiscal" onBack={goBack} />
          <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: 20,
                background: C.ink,
                marginTop: 20,
                marginBottom: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "70%",
                  height: "70%",
                  border: `2px solid ${scanning ? C.amber : C.verified}`,
                  borderRadius: 12,
                }}
              />
              {scanning && (
                <div style={{ position: "absolute", top: "15%", left: "15%", right: "15%", height: 2, background: C.amber }} />
              )}
              <div style={{ position: "absolute", bottom: 14, fontFamily: "monospace", fontSize: 10, color: "#6E7690" }}>
                {scanning ? "LLEGINT DADES..." : "CÀMERA LLESTA"}
              </div>
            </div>

            {!client && !scanning && (
              <PrimaryButton onClick={startScan}>Escanejar QR del client</PrimaryButton>
            )}
            {scanning && <div style={{ fontSize: 12, color: C.muted }}>Extraient i validant NIF amb IA…</div>}

            {client && (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: C.verifiedDark, fontSize: 12, fontWeight: 700 }}>
                  ✓ Dades validades
                </div>
                <Field label="Nom / Raó social" value={client.name} onChange={(v) => setClient({ ...client, name: v })} mono={false} />
                <Field label="NIF / CIF" value={client.nif} onChange={(v) => setClient({ ...client, nif: v })} />
                <Field label="Adreça fiscal" value={client.address} onChange={(v) => setClient({ ...client, address: v })} mono={false} />
                <div style={{ marginTop: 10 }}>
                  <PrimaryButton onClick={() => goTo("items")}>Continuar</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ITEMS */}
      {screen === "items" && (
        <div className="flex-1 flex flex-col">
          <TopBar title="Conceptes" onBack={goBack} />
          <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Factura per a <b style={{ color: C.text }}>{client?.name}</b>
            </div>

            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  placeholder="Concepte"
                  value={it.concept}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[i].concept = e.target.value;
                    setItems(copy);
                  }}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, fontSize: 13 }}
                />
                <input
                  placeholder="0.00"
                  value={it.price}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[i].price = e.target.value;
                    setItems(copy);
                  }}
                  style={{ width: 78, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, fontSize: 13, fontFamily: "monospace" }}
                />
              </div>
            ))}
            <button
              onClick={() => setItems([...items, { concept: "", price: "" }])}
              style={{ fontSize: 12, color: C.muted, textAlign: "left", padding: "6px 0", marginBottom: 20 }}
            >
              + Afegir concepte
            </button>

            <div style={{ marginTop: "auto", borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                <span>Base imposable</span>
                <span style={{ fontFamily: "monospace" }}>{euro(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 10 }}>
                <span>IVA (21%)</span>
                <span style={{ fontFamily: "monospace" }}>{euro(total * IVA_RATE)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 16 }}>
                <span>Total</span>
                <span style={{ fontFamily: "monospace" }}>{euro(totalWithIva)}</span>
              </div>
              <PrimaryButton disabled={total <= 0} onClick={() => { setHistory([]); setScreen("generating"); generateInvoice(); }}>
                Generar factura
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* GENERATING */}
      {screen === "generating" && (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: 24 }}>
          <div style={{ animation: "spin 1.4s linear infinite" }}>
            <StampBadge size={90} />
          </div>
          <div style={{ marginTop: 22, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 1 }}>
            {generating ? "ENVIANT REGISTRE A L'API DE FACTURACIÓ…" : "FET"}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && lastInvoice && (
        <div className="flex-1 flex flex-col">
          <TopBar title="Factura generada" onBack={history.length > 0 ? goBack : undefined} />
          <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ marginTop: 6, marginBottom: 16 }}>
              <StampBadge size={80} />
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2 }}>
              {lastInvoice.id}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{lastInvoice.date}</div>

            <div style={{ width: "100%", background: C.card, borderRadius: 14, padding: 16, border: `1px solid ${C.line}`, marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Client</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{lastInvoice.client.name}</div>
              {lastInvoice.items.filter(it => it.concept).map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  <span>{it.concept || "Concepte"}</span>
                  <span style={{ fontFamily: "monospace" }}>{euro(parseFloat(it.price) || 0)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: C.text, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
                <span>Total (IVA inc.)</span>
                <span style={{ fontFamily: "monospace" }}>{euro(lastInvoice.totalWithIva)}</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: C.verifiedDark, marginBottom: 8, textAlign: "center" }}>
              ✓ Registre enviat i verificat (simulació API Verifactu)
            </div>
            {!company.invoiceCopyEmail && (
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 20, textAlign: "center" }}>
                Configura un correu de còpia al teu <button onClick={() => goToTab("profile")} style={{ color: C.text, fontWeight: 700 }}>Perfil</button> per rebre totes les factures que emets.
              </div>
            )}

            <div style={{ width: "100%", marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <PrimaryButton
                onClick={() =>
                  alert(
                    `Simulació: email enviat a ${lastInvoice.client.name}` +
                    (company.invoiceCopyEmail ? `\nCòpia enviada a ${company.invoiceCopyEmail}` : "")
                  )
                }
              >
                Enviar per email
              </PrimaryButton>
              <button onClick={resetFlow} style={{ fontSize: 12, color: C.muted, padding: "6px 0" }}>
                Tornar a l'inici
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneChrome>
  );
}
