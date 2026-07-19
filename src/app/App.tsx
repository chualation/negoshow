// ─── More Screen ──────────────────────────────────────────────────────────────

function MoreScreen({ navigate, isAdminLoggedIn }: { navigate: (s: Screen)=>void; isAdminLoggedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-base font-bold text-foreground">{t("more")}</h1>
      </div>
        
        <div className="px-4 pt-5 pb-6 space-y-2">
        <button onClick={()=>navigate("transparency")}
          className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 border border-border active:bg-muted transition-colors text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><Shield size={16} className="text-primary"/></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t("sourceTransparency")}</p>
            <p className="text-xs text-muted-foreground">{t("sourceTransparencySubtitle")}</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground"/>
        </button>

        <button onClick={()=>navigate(isAdminLoggedIn?"admin":"admin-login")}
          className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 border border-border active:bg-muted transition-colors text-left">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isAdminLoggedIn?"bg-green-100 border border-green-200":"bg-amber-50 border border-amber-200"}`}>
            {isAdminLoggedIn?<Database size={16} className="text-green-700"/>:<Lock size={16} className="text-amber-700"/>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{t("adminArea")}</p>
              {isAdminLoggedIn && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">{t("loggedIn")}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{isAdminLoggedIn?`${t("upload")} & ${t("validate")}`:t("restrictedAccess")}</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground"/>
        </button>

        <button className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 border border-border transition-colors text-left opacity-50 pointer-events-none">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><BookOpen size={16} className="text-primary"/></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t("aboutApp")}</p>
            <p className="text-xs text-muted-foreground">{t("aboutSubtitle")}</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground"/>
        </button>

        <div className="pt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Leaf size={14} className="text-white"/></div>
            <span className="font-bold text-foreground">Ne-goshow</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("appMvp")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">ITISDEV Group 6 · Pasay City, 2026</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import {
  Home, Search, TrendingUp, MoreHorizontal, ChevronRight,
  MapPin, CheckCircle, AlertTriangle, ArrowLeft, Clock, Shield,
  ChevronDown, Check, X, Navigation, TrendingDown, Minus,
  BookOpen, BarChart2, Leaf, Zap, Activity, Target, Lightbulb,
  Info, Lock, Upload, FileText, LogOut, Eye, EyeOff, FilePlus,
  Trash2, RefreshCw, Database,
} from "lucide-react";

// Simple Error Boundary to avoid blank screens when third-party runtime errors occur
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error?: any}> {
  constructor(props:any){ super(props); this.state = { hasError:false }; }
  static getDerivedStateFromError(err:any){ return { hasError:true, error: err }; }
  componentDidCatch(error:any, info:any){ console.error("ErrorBoundary caught:", error, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-bold text-red-700">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-2">An unexpected error occurred while rendering this section. Check the console for details.</p>
            <pre className="text-xs mt-3 text-red-600">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "home" | "checker" | "dashboard" | "commodity"
  | "advisor" | "transparency" | "admin" | "admin-login" | "more";

type ResultState = "fair" | "flagged" | null;
type AdminTab = "upload" | "validate" | "dashboard";
type DocStatus = "processing" | "validated" | "published" | "rejected";

interface Commodity {
  id: string; name: { fil: string; en: string }; tagalog: string; shortLabel: string; icon: string;
  baseline: number; baseline30d: number;
  trend: "up" | "down" | "stable"; change: number; changeAbs: number;
  volatility: "Mataas" | "Katamtaman" | "Mababa";
  primarySource: string;
  sources: { name: string; price: number; distance: string }[];
}

interface BulletinRecord {
  id: number; source: string; date: string; location: string;
  commodities: string[]; type: "PDF" | "Image"; verified: boolean;
}

interface AdminRecord {
  id: number; commodity: string; price: number; location: string;
  date: string; source: string; status: "pending" | "approved" | "rejected";
  flagged?: boolean; flagReason?: string;
}

interface UploadedDoc {
  id: number; filename: string; sourceOffice: string; bulletinDate: string;
  coverage: string; docType: "PDF" | "Image"; commodities: string[];
  status: DocStatus; uploadedAt: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const COMMODITIES: Commodity[] = [
  {
    id: "red-onion", name: { fil: "Sibuyas Pula", en: "Red Onion" }, tagalog: "Sibuyas Pula", shortLabel: "S. Pula", icon: "🧅",
    baseline: 140, baseline30d: 118, trend: "up", change: 6, changeAbs: 8,
    volatility: "Mataas", primarySource: "Divisoria Market",
    sources: [
      { name: "Divisoria Market", price: 132, distance: "2.1 km" },
      { name: "Guadalupe Market", price: 136, distance: "1.4 km" },
      { name: "Cartimar Market",  price: 145, distance: "0.3 km" },
    ],
  },
  {
    id: "white-onion", name: { fil: "Sibuyas Puti", en: "White Onion" }, tagalog: "Sibuyas Puti", shortLabel: "S. Puti", icon: "🧅",
    baseline: 95, baseline30d: 98, trend: "stable", change: -2, changeAbs: -2,
    volatility: "Mababa", primarySource: "Cartimar Market",
    sources: [
      { name: "Cartimar Market",  price: 90, distance: "0.3 km" },
      { name: "Pasay Central",    price: 93, distance: "0.8 km" },
      { name: "Baclaran Market",  price: 96, distance: "1.9 km" },
    ],
  },
  {
    id: "garlic", name: { fil: "Bawang", en: "Garlic" }, tagalog: "Bawang", shortLabel: "Bawang", icon: "🧄",
    baseline: 220, baseline30d: 242, trend: "down", change: -6, changeAbs: -14,
    volatility: "Katamtaman", primarySource: "Divisoria Market",
    sources: [
      { name: "Divisoria Market", price: 208, distance: "2.1 km" },
      { name: "Baclaran Market",  price: 214, distance: "1.9 km" },
      { name: "Guadalupe Market", price: 222, distance: "1.4 km" },
    ],
  },
  {
    id: "ginger", name: { fil: "Luya", en: "Ginger" }, tagalog: "Luya", shortLabel: "Luya", icon: "🫚",
    baseline: 180, baseline30d: 155, trend: "up", change: 7, changeAbs: 12,
    volatility: "Mataas", primarySource: "Guadalupe Market",
    sources: [
      { name: "Guadalupe Market", price: 170, distance: "1.4 km" },
      { name: "Pasay Central",    price: 175, distance: "0.8 km" },
      { name: "Cartimar Market",  price: 182, distance: "0.3 km" },
    ],
  },
  {
    id: "potato", name: { fil: "Patatas", en: "Potato" }, tagalog: "Patatas", shortLabel: "Patatas", icon: "🥔",
    baseline: 65, baseline30d: 63, trend: "stable", change: 2, changeAbs: 1,
    volatility: "Mababa", primarySource: "Cartimar Market",
    sources: [
      { name: "Cartimar Market",  price: 62, distance: "0.3 km" },
      { name: "Divisoria Market", price: 63, distance: "2.1 km" },
      { name: "Pasay Central",    price: 66, distance: "0.8 km" },
    ],
  },
];

const COMMODITY_NAMES = ["Sibuyas Pula","Sibuyas Puti","Bawang","Luya","Patatas"];
const COVERAGE_AREAS  = ["Metro Manila","Pasay City","Makati City","Quezon City","Caloocan City","Marikina City"];
const LOCATIONS       = ["Pasay Talipapa","Cartimar Market","Pasay Central Market","Baclaran Market","Guadalupe Market","Malibay Market"];

const VARIANCE_DATA = COMMODITIES.map((c) => ({
  name: c.shortLabel,
  "30-Araw na Avg": c.baseline30d,
  "Kasalukuyan":    c.baseline,
  variancePct: parseFloat((((c.baseline - c.baseline30d) / c.baseline30d) * 100).toFixed(1)),
}));

const PREDICTION_DATA: Record<string, { araw: string; aktwal: number | null; hula: number | null; isPeak?: boolean }[]> = {
  "red-onion":   [
    { araw: "Jul 4",  aktwal: 124, hula: null },
    { araw: "Jul 6",  aktwal: 128, hula: null },
    { araw: "Jul 8",  aktwal: 133, hula: null },
    { araw: "Jul 10", aktwal: 140, hula: 140  },
    { araw: "Jul 11", aktwal: null, hula: 145 },
    { araw: "Jul 12", aktwal: null, hula: 151 },
    { araw: "Jul 13", aktwal: null, hula: 158, isPeak: true },
    { araw: "Jul 14", aktwal: null, hula: 153 },
    { araw: "Jul 15", aktwal: null, hula: 148 },
    { araw: "Jul 16", aktwal: null, hula: 144 },
  ],
  "ginger":      [
    { araw: "Jul 4",  aktwal: 162, hula: null },
    { araw: "Jul 6",  aktwal: 168, hula: null },
    { araw: "Jul 8",  aktwal: 174, hula: null },
    { araw: "Jul 10", aktwal: 180, hula: 180  },
    { araw: "Jul 11", aktwal: null, hula: 184 },
    { araw: "Jul 12", aktwal: null, hula: 189 },
    { araw: "Jul 13", aktwal: null, hula: 194, isPeak: true },
    { araw: "Jul 14", aktwal: null, hula: 191 },
    { araw: "Jul 15", aktwal: null, hula: 186 },
    { araw: "Jul 16", aktwal: null, hula: 183 },
  ],
  "garlic":      [
    { araw: "Jul 4",  aktwal: 248, hula: null },
    { araw: "Jul 6",  aktwal: 238, hula: null },
    { araw: "Jul 8",  aktwal: 228, hula: null },
    { araw: "Jul 10", aktwal: 220, hula: 220  },
    { araw: "Jul 11", aktwal: null, hula: 216 },
    { araw: "Jul 12", aktwal: null, hula: 212 },
    { araw: "Jul 13", aktwal: null, hula: 208 },
    { araw: "Jul 14", aktwal: null, hula: 205 },
    { araw: "Jul 15", aktwal: null, hula: 202 },
    { araw: "Jul 16", aktwal: null, hula: 200 },
  ],
  "white-onion": [
    { araw: "Jul 4",  aktwal: 97, hula: null },
    { araw: "Jul 6",  aktwal: 96, hula: null },
    { araw: "Jul 8",  aktwal: 95, hula: null },
    { araw: "Jul 10", aktwal: 95, hula: 95   },
    { araw: "Jul 11", aktwal: null, hula: 94 },
    { araw: "Jul 12", aktwal: null, hula: 95 },
    { araw: "Jul 13", aktwal: null, hula: 95 },
    { araw: "Jul 14", aktwal: null, hula: 94 },
    { araw: "Jul 15", aktwal: null, hula: 93 },
    { araw: "Jul 16", aktwal: null, hula: 93 },
  ],
  "potato":      [
    { araw: "Jul 4",  aktwal: 64, hula: null },
    { araw: "Jul 6",  aktwal: 65, hula: null },
    { araw: "Jul 8",  aktwal: 65, hula: null },
    { araw: "Jul 10", aktwal: 65, hula: 65   },
    { araw: "Jul 11", aktwal: null, hula: 65 },
    { araw: "Jul 12", aktwal: null, hula: 66 },
    { araw: "Jul 13", aktwal: null, hula: 65 },
    { araw: "Jul 14", aktwal: null, hula: 64 },
    { araw: "Jul 15", aktwal: null, hula: 64 },
    { araw: "Jul 16", aktwal: null, hula: 63 },
  ],
};

const VENDOR_TIPS = [
  { icon: "🛒", titleKey: "vendorTip1Title", bodyKey: "vendorTip1Body" },
  { icon: "📍", titleKey: "vendorTip2Title", bodyKey: "vendorTip2Body" },
  { icon: "🤝", titleKey: "vendorTip3Title", bodyKey: "vendorTip3Body" },
  { icon: "⏳", titleKey: "vendorTip4Title", bodyKey: "vendorTip4Body" },
];

const INITIAL_BULLETINS: BulletinRecord[] = [
  { id: 1, source: "DA – Region IV-A", date: "Jul 10, 2026", location: "Metro Manila", commodities: ["Sibuyas Pula","Bawang"],              type: "PDF",   verified: true  },
  { id: 2, source: "LGU Pasay City",   date: "Jul 8, 2026",  location: "Pasay City",   commodities: ["Patatas","Luya"],                    type: "Image", verified: true  },
  { id: 3, source: "DA – Region IV-A", date: "Jul 5, 2026",  location: "Metro Manila", commodities: ["Sibuyas Puti","Sibuyas Pula"],        type: "PDF",   verified: true  },
  { id: 4, source: "LGU Makati",       date: "Jul 3, 2026",  location: "Makati City",  commodities: ["Bawang","Luya","Patatas"],            type: "PDF",   verified: false },
  { id: 5, source: "DA – Region IV-A", date: "Jun 28, 2026", location: "Metro Manila", commodities: ["Sibuyas Pula","Sibuyas Puti","Bawang"],type: "PDF",  verified: true  },
];

const INITIAL_RECORDS: AdminRecord[] = [
  { id: 1, commodity: "Sibuyas Pula", price: 138, location: "Divisoria",    date: "Jul 10", source: "DA Bulletin",  status: "pending" },
  { id: 2, commodity: "Bawang",       price: 580, location: "Baclaran",     date: "Jul 10", source: "DA Bulletin",  status: "pending", flagged: true, flagReason: "Presyo ay 2.6× itaas ng baseline (₱220)" },
  { id: 3, commodity: "Patatas",      price: 64,  location: "Cartimar",     date: "Jul 9",  source: "LGU Bulletin", status: "approved" },
  { id: 4, commodity: "Luya",         price: 175, location: "Guadalupe",    date: "Jul 9",  source: "LGU Bulletin", status: "pending" },
  { id: 5, commodity: "Sibuyas Puti", price: 92,  location: "Pasay Central",date: "Jul 8",  source: "DA Bulletin",  status: "rejected" },
  { id: 6, commodity: "Bawang",       price: 218, location: "Cartimar",     date: "Jul 8",  source: "LGU Bulletin", status: "approved" },
];

const INITIAL_UPLOADS: UploadedDoc[] = [
  { id: 1, filename: "DA_PriceMonitoring_Jul10_2026.pdf", sourceOffice: "DA – Region IV-A", bulletinDate: "2026-07-10", coverage: "Metro Manila", docType: "PDF",   commodities: ["Sibuyas Pula","Bawang"],       status: "published",  uploadedAt: "Jul 10, 9:02 AM"  },
  { id: 2, filename: "LGU_Pasay_Bulletin_Jul08.jpg",      sourceOffice: "LGU Pasay City",   bulletinDate: "2026-07-08", coverage: "Pasay City",   docType: "Image", commodities: ["Patatas","Luya"],             status: "published",  uploadedAt: "Jul 8, 11:45 AM"  },
  { id: 3, filename: "DA_PriceMonitoring_Jul05_2026.pdf", sourceOffice: "DA – Region IV-A", bulletinDate: "2026-07-05", coverage: "Metro Manila", docType: "PDF",   commodities: ["Sibuyas Puti","Sibuyas Pula"],status: "validated",  uploadedAt: "Jul 5, 2:18 PM"   },
];

const ADMIN_CREDS = { username: "admin", password: "negoshow2026" };

const DOC_STATUS: Record<DocStatus, { labelKey: string; cls: string }> = {
  processing: { labelKey: "processing", cls: "bg-blue-100 text-blue-700 border-blue-200"   },
  validated:  { labelKey: "validated",  cls: "bg-amber-100 text-amber-700 border-amber-200" },
  published:  { labelKey: "published",  cls: "bg-green-100 text-green-700 border-green-200" },
  rejected:   { labelKey: "rejected",   cls: "bg-red-100 text-red-700 border-red-200"       },
};

const gen7Day = (baseline: number, trend: string) => {
  const days = ["Lun","Mar","Miy","Huw","Biy","Sab","Lin"];
  return days.map((day, i) => {
    const d = trend === "up" ? i * 2.2 : trend === "down" ? -i * 2.8 : Math.sin(i * 1.2) * 4;
    return { day, presyo: Math.round(baseline - 10 + d) };
  });
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusChip({ volatility }: { volatility: string }) {
  const { t } = useLanguage();
  const s: Record<string,string> = {
    Mataas:     "bg-red-100 text-red-700 border border-red-200",
    Katamtaman: "bg-amber-100 text-amber-700 border border-amber-200",
    Mababa:     "bg-green-100 text-green-700 border border-green-200",
  };
  const labelKey: Record<string,string> = { Mataas: "high", Katamtaman: "moderate", Mababa: "low" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s[volatility] || s.Mababa}`}>{t((labelKey[volatility] || "low") as any)}</span>;
}

function TrendBadge({ trend, change, changeAbs }: { trend: string; change: number; changeAbs: number }) {
  if (trend === "up")   return <span className="flex items-center gap-0.5 text-sm font-semibold text-red-600"><TrendingUp size={14}/> +₱{changeAbs} ({change}%)</span>;
  if (trend === "down") return <span className="flex items-center gap-0.5 text-sm font-semibold text-green-700"><TrendingDown size={14}/> -₱{Math.abs(changeAbs)} ({Math.abs(change)}%)</span>;
  return <span className="flex items-center gap-0.5 text-sm font-semibold text-[#72796e]"><Minus size={14}/> ±₱{Math.abs(changeAbs)} ({Math.abs(change)}%)</span>;
}

function PageHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const [language, setLanguage] = useState<"fil" | "en">("fil");

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setLanguage("fil")}
              aria-pressed={language === "fil"}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                language === "fil"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              FIL
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                language === "en"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              ENG
            </button>
          </div>

          {right}
        </div>
      </div>
    </div>
  );
}

function SL({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{children}</p>;
}

// TierBadge removed — simplified dashboard headings

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { t, language } = useLanguage();
  return (
    <div>
      <div className="relative bg-primary overflow-hidden px-5 pt-8 pb-6">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize:"18px 18px" }}/>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Leaf size={16} className="text-white"/></div>
            <span className="text-white/80 text-sm font-semibold tracking-wide">Ne-goshow</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">{t("homeTitle")}</h1>
          <p className="text-white/70 text-base leading-relaxed mb-5 max-w-xl">{t("checkPriceSubtitle")}</p>
          <button onClick={() => navigate("checker")}
            className="bg-white text-primary font-bold text-sm px-5 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-transform shadow-md w-fit">
            <Search size={15}/> {t("checkPrice")}
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-28 flex flex-col items-end justify-center gap-1 pr-3 opacity-25 pointer-events-none select-none">
          {["🧅","🧄","🥔","🫚","🧅"].map((e,i)=><span key={i} className="text-3xl" style={{transform:`rotate(${i%2===0?8:-8}deg)`}}>{e}</span>)}
        </div>
      </div>

      <div className="px-4 pt-5">
          <SL>{t("marketConditionNow")}</SL>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">{t("volatileNow")}</p>
            <p className="text-lg font-bold text-foreground">{COMMODITIES[0].icon} {COMMODITIES[0].name[language]}</p>
            <p className="text-xs text-red-600 font-semibold mt-0.5">+6% {t("sinceYesterday")}</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">{t("mostStable")}</p>
            <p className="text-lg font-bold text-foreground">{COMMODITIES[4].icon} {COMMODITIES[4].name[language]}</p>
            <p className="text-xs text-green-700 font-semibold mt-0.5">{t("almostNoMovement")}</p>
          </div>
          <div className="col-span-2 bg-card rounded-xl p-3 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("lastBaselineUpdate")}</p>
              <p className="text-sm font-bold text-foreground">Jul 10, 2026 — DA Bulletin</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          </div>
        </div>

        <SL>{t("quickAccess")}</SL>
        <div className="space-y-2 mb-5">
          {[
            { icon: BarChart2, label: t("dashboard"), sub: t("dashboardSubtitle"), screen: "dashboard" as Screen },
            { icon: FileText,  label: t("sourceTransparency"),      sub: t("sourceTransparencySubtitle"),          screen: "transparency" as Screen },
          ].map(({ icon: Icon, label, sub, screen }) => (
            <button key={screen} onClick={() => navigate(screen)}
              className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border active:bg-muted transition-colors text-left">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0"><Icon size={16} className="text-accent"/></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground shrink-0"/>
            </button>
          ))}
        </div>
        <div className="mb-6 rounded-xl bg-[#f0ebe4] border border-[#ddd5c8] px-4 py-3">
          <p className="text-xs text-[#72796e] leading-relaxed">{t("dataNotice")}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Checker Screen ───────────────────────────────────────────────────────────

function CheckerScreen({ commodities, locations, checkerCommodity, setCheckerCommodity, quotedPrice, setQuotedPrice, checkerLocation, setCheckerLocation, onCheck }: {
  commodities: Commodity[]; locations: string[];
  checkerCommodity: Commodity | null; setCheckerCommodity: (c: Commodity) => void;
  quotedPrice: string; setQuotedPrice: (v: string) => void;
  checkerLocation: string; setCheckerLocation: (v: string) => void;
  onCheck: () => void;
}) {
  const [locationOpen, setLocationOpen] = useState(false);
  const canSubmit = checkerCommodity && quotedPrice && parseFloat(quotedPrice) > 0 && checkerLocation;
  const { t, language } = useLanguage();
  return (
    <div>
      <PageHeader title={t("checkPrice")} subtitle={t("checkPriceSubtitle")}/>
      <div className="px-4 pt-5 space-y-5 pb-6">
        <div>
          <SL>{t("selectCommodity")}</SL>
          <div className="space-y-2">
            {commodities.map((c) => (
              <button key={c.id} onClick={() => setCheckerCommodity(c)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all active:scale-[0.99] text-left ${
                  checkerCommodity?.id === c.id ? "bg-primary text-white border-primary" : "bg-card border-border text-foreground"
                }`}>
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight">{c.name[language]}</p>
                  <p className={`text-xs ${checkerCommodity?.id === c.id ? "text-white/70" : "text-muted-foreground"}`}>{t("baselineLabel")}: ₱{c.baseline}/kg</p>
                </div>
                {checkerCommodity?.id === c.id && <Check size={16} className="text-white shrink-0"/>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <SL>{t("pricePerKilo")}</SL>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₱</span>
            <input type="text" inputMode="decimal" value={quotedPrice} onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setQuotedPrice(val);
              }
            }} placeholder="0.00"
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-4 text-xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"/>
          </div>
          {checkerCommodity && quotedPrice && (
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">
              {t("baselineLabel")}: ₱{checkerCommodity.baseline}/kg ·{" "}
              {parseFloat(quotedPrice) > checkerCommodity.baseline * 1.15
                ? <span className="text-red-600 font-semibold">{t("higherThanBaseline")}</span>
                : <span className="text-green-700 font-semibold">{t("withinRange")}</span>}
            </p>
          )}
        </div>

        <div>
          <SL>{t("currentLocation")}</SL>
          <div className="relative">
            <button onClick={() => setLocationOpen(!locationOpen)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-4 text-left active:bg-muted transition-colors">
              <MapPin size={16} className="text-muted-foreground shrink-0"/>
              <span className={`flex-1 text-sm font-medium ${checkerLocation ? "text-foreground" : "text-muted-foreground/60"}`}>
                {checkerLocation || t("selectMarket")}
              </span>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${locationOpen ? "rotate-180" : ""}`}/>
            </button>
            {locationOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                {locations.map((loc) => (
                  <button key={loc} onClick={() => { setCheckerLocation(loc); setLocationOpen(false); }}
                    className="w-full px-4 py-3 text-sm text-left hover:bg-muted transition-colors border-b border-border last:border-0 font-medium">{loc}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={onCheck} disabled={!canSubmit}
          className="w-full bg-primary text-white font-bold text-base py-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-primary/20">
          <Search size={18}/> {t("submitCheck")}
        </button>
      </div>
    </div>
  );
}

// ─── Checker Result ───────────────────────────────────────────────────────────

function CheckerResult({ result, commodity, quotedPrice, location, onReset, onAdvisor }: {
  result: "fair" | "flagged"; commodity: Commodity; quotedPrice: number;
  location: string; onReset: () => void; onAdvisor: () => void;
}) {
  const isFair = result === "fair";
  const variance = (((quotedPrice - commodity.baseline) / commodity.baseline) * 100);
  const cheapest = commodity.sources[0];
  const { language, t } = useLanguage();
  return (
    <div>
      <PageHeader title={t("checkResultTitle")} subtitle={`${commodity.name[language]} · ${location}`}/>
      <div className="px-4 pt-5 space-y-4 pb-6">
        <div className={`rounded-2xl p-5 border-2 ${isFair ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isFair ? "bg-green-600" : "bg-red-600"}`}>
              {isFair ? <CheckCircle size={24} className="text-white"/> : <AlertTriangle size={24} className="text-white"/>}
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${isFair ? "text-green-700" : "text-red-700"}`}>{isFair ? t("fair") : t("flagged")}</p>
              <p className={`text-2xl font-extrabold ${isFair ? "text-green-800" : "text-red-800"}`}>{isFair ? t("fair") : t("flagged")}</p>
              <p className={`text-sm mt-1 ${isFair ? "text-green-700" : "text-red-700"}`}>
                {isFair ? t("fairDescription") : `${t("flaggedDescription")} ${Math.abs(variance).toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("priceBreakdown")}</p></div>
          {[
            { label:t("quotedPrice"),      value:`₱${quotedPrice}/kg`,          highlight:!isFair },
            { label:t("currentBaseline"), value:`₱${commodity.baseline}/kg`,   highlight:false },
            { label:t("difference"),            value:`${variance>0?"+":""}${variance.toFixed(1)}%`, highlight:!isFair },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-sm font-bold ${highlight ? "text-red-600" : "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>

        {!isFair && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">{t("cheaperNearbySource")}</p>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-foreground">{cheapest.name}</p>
                <p className="text-lg font-extrabold text-green-700">₱{cheapest.price}/kg</p>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Navigation size={12}/>{cheapest.distance} · {t("fromYou")}</p>
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-green-700">{t("savePerKg").replace("{amt}", String((quotedPrice - cheapest.price).toFixed(0)))}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-3 border border-border">
          <Shield size={14} className="text-primary shrink-0"/>
          <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Source: </span>DA Bulletin, Jul 10, 2026 · Metro Manila</p>
        </div>

        {!isFair && (
            <button onClick={onAdvisor} className="w-full bg-primary text-white font-bold text-sm py-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <Navigation size={16}/>{t("viewRecommendedAction")}
          </button>
        )}
        <button onClick={onReset} className="w-full bg-card border border-border text-foreground font-semibold text-sm py-4 rounded-full active:bg-muted transition-colors">{t("checkAgain")}</button>
      </div>
    </div>
  );
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────

function DashboardScreen({ commodities, onSelectCommodity, onAdvisor }: {
  commodities: Commodity[]; onSelectCommodity: (c: Commodity) => void; onAdvisor: () => void;
}) {
  const { language, t } = useLanguage();
  const [predC, setPredC] = useState(commodities[0]);
  const predData = PREDICTION_DATA[predC.id] ?? PREDICTION_DATA["red-onion"];
  const peak = predData.find((d) => d.isPeak);
  const volatileCount = commodities.filter((c) => c.volatility === "Mataas").length;
  const avgChange = (commodities.reduce((s,c) => s + c.change, 0) / commodities.length).toFixed(1);
  const risingCount = commodities.filter((c) => c.trend === "up").length;

  const VarTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-foreground mb-1">{payload[0]?.payload?.name}</p>
        {payload.map((p: any) => <p key={p.name} style={{color:p.color}} className="font-semibold">{p.name}: ₱{p.value}</p>)}
      </div>
    );
  };

  const PredTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const a = payload.find((p:any) => p.name === t("actualPrice"));
    const h = payload.find((p:any) => p.name === t("predictedPrice"));
    return (
      <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {a?.value != null && <p className="text-primary font-semibold">{t("actualPrice")}: ₱{a.value}</p>}
        {h?.value != null && <p className="text-amber-600 font-semibold">{t("predictedPrice")}: ₱{h.value}</p>}
      </div>
    );
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-base font-bold text-foreground">{t("dashboard")}</h1>
        <p className="text-xs text-muted-foreground">{t("latestUpdate")}: Jul 10, 2026</p>
      </div>
      <div className="px-4 pt-5 pb-6 space-y-7">
          <p className="text-xs text-muted-foreground mb-1">{t("avgPriceMovement")}</p>
          <p className="text-xs text-muted-foreground mb-1">{t("risingPrices")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("vsYesterday")}</p>
          
          <section>
          <SL>{t("topKpiCards")}</SL>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="bg-card rounded-xl p-3.5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{t("marketStability")}</p>
              <p className="text-xl font-extrabold text-amber-700">{t("moderate")}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-0.5">{[1,2,3].map(i=><div key={i} className={`h-1.5 w-4 rounded-full ${i<=2?"bg-amber-500":"bg-muted"}`}/>)}</div>
                <span className="text-xs text-muted-foreground">2/3</span>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3.5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{t("volatileCommodities")}</p>
              <p className="text-xl font-extrabold text-red-600">{volatileCount} <span className="text-sm text-muted-foreground font-normal">sa {commodities.length}</span></p>
              <p className="text-xs text-red-600 font-semibold mt-1">{commodities.filter(c=>c.volatility==="Mataas").map(c=>c.name[language]).slice(0,2).join(", ")}</p>
            </div>
            <div className="bg-card rounded-xl p-3.5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{t("avgPriceMovement")}</p>
              <p className={`text-xl font-extrabold ${parseFloat(avgChange)>0?"text-red-600":"text-green-700"}`}>{parseFloat(avgChange)>0?"+":""}{avgChange}%</p>
              <p className="text-xs text-muted-foreground mt-1">{t("vsYesterday")}</p>
            </div>
            <div className="bg-card rounded-xl p-3.5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{t("risingPrices")}</p>
              <p className="text-xl font-extrabold text-foreground">{risingCount} <span className="text-sm text-muted-foreground font-normal">{t("currentPrices")}</span></p>
              <div className="flex items-center gap-1 mt-1"><TrendingUp size={12} className="text-red-500"/><span className="text-xs text-red-600 font-semibold">{t("beCarefulBuying")}</span></div>
            </div>
          </div>

          <SL>{t("priceMovement")}</SL>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_52px_64px_56px] bg-muted px-3 py-2 border-b border-border">
              {[t("commodityHeader"), t("priceHeader"), t("movementHeader"), t("statusHeader")].map((h, idx)=>(
                <p key={String(idx)} className={`text-[10px] font-bold uppercase tracking-wide text-muted-foreground ${idx!==0?"text-right":""}`}>{h}</p>
              ))}
            </div>
            {commodities.map((c,i)=>(
              <button key={c.id} onClick={()=>onSelectCommodity(c)}
                className={`w-full grid grid-cols-[1fr_52px_64px_56px] items-center px-3 py-3 border-b border-border last:border-0 active:bg-muted transition-colors text-left ${i%2===0?"":"bg-card/40"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{c.shortLabel}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.primarySource}</p>
                  </div>
                </div>
                <p className="text-sm font-extrabold text-foreground text-right">₱{c.baseline}</p>
                <div className="flex justify-end">
                  {c.trend==="up"     && <span className="text-[10px] font-bold text-red-600   flex items-center gap-0.5"><TrendingUp size={10}/>+{c.change}%</span>}
                  {c.trend==="down"   && <span className="text-[10px] font-bold text-green-700 flex items-center gap-0.5"><TrendingDown size={10}/>{c.change}%</span>}
                  {c.trend==="stable" && <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5"><Minus size={10}/>±{Math.abs(c.change)}%</span>}
                </div>
                <div className="flex justify-end"><StatusChip volatility={c.volatility}/></div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Info size={10}/>{t("tapRowForDetails")}</p>
        </section>

        {/* DIAGNOSTIC */}
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2 space-y-7">
            <section>
          
          <SL>{t("priceVarianceTitle")}</SL>
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-3">
            <div className="px-4 pt-4 pb-1">
                <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary"/><span className="text-[10px] text-muted-foreground font-semibold">{t("currentLabel")}</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#c8a97a]"/><span className="text-[10px] text-muted-foreground font-semibold">{t("avg30Label")}</span></div>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={VARIANCE_DATA} barCategoryGap="28%" barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,121,110,0.15)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:"#72796e"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#72796e"}} axisLine={false} tickLine={false} width={34} tickFormatter={(v)=>`₱${v}`} domain={[0,"auto"]}/>
                  <Tooltip content={<VarTip/>}/>
                  <Bar name={t("avg30Label")} dataKey="30-Araw na Avg" fill="#c8a97a" radius={[4,4,0,0]}/>
                  <Bar name={t("currentLabel")} dataKey="Kasalukuyan" radius={[4,4,0,0]}>
                    {VARIANCE_DATA.map((d,i)=><Cell key={i} fill={d.variancePct>5?"#c62828":d.variancePct<-3?"#2d5a27":"#154212"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5">
                {VARIANCE_DATA.filter((d)=>Math.abs(d.variancePct)>2).map((d)=>{
              const hi = d.variancePct > 0;
              return (
                <div key={d.name} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${hi?"bg-red-50 border-red-200":"bg-green-50 border-green-200"}`}>
                  <div>
                    <p className="text-xs font-bold text-foreground">{d.name}</p>
                        <p className={`text-[10px] font-semibold ${hi?"text-red-600":"text-green-700"}`}>
                          {hi
                            ? t("varianceHigher").replace("{amt}", String(d["Kasalukuyan"] - d["30-Araw na Avg"]))
                            : t("varianceLower").replace("{amt}", String(d["30-Araw na Avg"] - d["Kasalukuyan"]))
                          }
                        </p>
                  </div>
                  <span className={`text-base font-extrabold ${hi?"text-red-600":"text-green-700"}`}>{hi?"+":""}{d.variancePct}%</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-start gap-1 leading-relaxed">
            <Info size={10} className="mt-0.5 shrink-0"/>
            {t("varianceExplanation").replace("{redPct}", String(VARIANCE_DATA[0].variancePct)).replace("{gingerPct}", String(VARIANCE_DATA[3].variancePct))}
          </p>
          </section>

          {/* PREDICTIVE */}
          <section>
          
          <SL>{t("predictionTitle")}</SL>
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {commodities.map((c)=>(
              <button key={c.id} onClick={()=>setPredC(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors shrink-0 ${
                  predC.id===c.id?"bg-primary text-white border-primary":"bg-card border-border text-foreground"
                }`}><span>{c.icon}</span>{c.shortLabel}</button>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {peak && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200">
                  <AlertTriangle size={13} className="text-amber-600 shrink-0"/>
                  <p className="text-xs text-amber-800 font-semibold">{t("expectedPeak")}: ₱{peak.hula}/kg {t("on")} {peak.araw} — {t("beCarefulBuying")}.</p>
                </div>
              )}
            <div className="px-2 pt-4 pb-3">
              <div className="flex items-center gap-4 px-2 mb-3">
                    <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-primary rounded"/><span className="text-[10px] text-muted-foreground font-semibold">{t("actualPrice")}</span></div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 rounded" style={{backgroundImage:"repeating-linear-gradient(to right,#f59e0b 0,#f59e0b 4px,transparent 4px,transparent 7px)"}}/>
                      <span className="text-[10px] text-muted-foreground font-semibold">{t("predictedPrice")}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={175}>
                <LineChart data={predData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,121,110,0.15)"/>
                  <XAxis dataKey="araw" tick={{fontSize:9,fill:"#72796e"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:"#72796e"}} axisLine={false} tickLine={false} width={34} tickFormatter={(v)=>`₱${v}`} domain={["auto","auto"]}/>
                      <Tooltip content={<PredTip/>}/>
                      <ReferenceLine x="Jul 10" stroke="rgba(114,121,110,0.4)" strokeDasharray="4 4" label={{value:t("now"),position:"top",fontSize:9,fill:"#72796e"}}/>
                      <Line type="monotone" dataKey="aktwal" name={t("actualPrice")} stroke="#154212" strokeWidth={2.5} dot={{fill:"#154212",r:3}} connectNulls={false}/>
                      <Line type="monotone" dataKey="hula"   name={t("predictedPrice")} stroke="#f59e0b" strokeWidth={2}   strokeDasharray="5 4" dot={{fill:"#f59e0b",r:3}} connectNulls={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-start gap-1 leading-relaxed">
            <Info size={10} className="mt-0.5 shrink-0"/>
                {t("predictionsDisclaimer")}
          </p>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="md:col-span-1 space-y-7">
            {/* PRESCRIPTIVE */}
            <section>
          
          <SL>{t("procurementAdvisorPanel")}</SL>
          {commodities.filter((c)=>c.volatility!=="Mababa").map((c)=>{
            const act = c.trend==="up"
              ? {label:t("cardNegotiateLabel"),color:"bg-amber-600",icon:"🤝"}
              : {label:t("cardBuyLabel"),color:"bg-green-600",icon:"✅"};
            return (
              <div key={c.id} className="bg-card rounded-xl border border-border overflow-hidden mb-2">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <span className="text-xl">{c.icon}</span>
                  <p className="font-bold text-sm text-foreground flex-1">{c.name[language]}</p>
                  <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${act.color}`}>{act.icon} {act.label}</span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                          <p className="text-xs text-muted-foreground">{t("lowestPrice")}</p>
                    <p className="text-base font-extrabold text-green-700">₱{c.sources[0].price}/kg</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Navigation size={9}/>{c.sources[0].name} · {c.sources[0].distance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t("baselineNow")}</p>
                    <p className="text-base font-extrabold text-foreground">₱{c.baseline}/kg</p>
                    <StatusChip volatility={c.volatility}/>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={onAdvisor}
            className="w-full bg-card border border-border text-foreground font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 active:bg-muted transition-colors mb-5">
            <Navigation size={14}/>{t("openProcurementAdvisor")}
          </button>
          <SL>{t("vendorTips")}</SL>
          <div className="space-y-2">
            {VENDOR_TIPS.map((tip,i)=>(
              <div key={i} className="flex items-start gap-3 bg-card rounded-xl px-4 py-3.5 border border-border">
                <span className="text-xl shrink-0 mt-0.5">{tip.icon}</span>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight mb-0.5">{t(tip.titleKey as any)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(tip.bodyKey as any)}</p>
                </div>
              </div>
            ))}
          </div>
            </section>

            <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-3 border border-border">
              <Clock size={14} className="text-muted-foreground"/>
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{t("latestUpdate")}: </span> Jul 10, 2026 · 9:00 AM · DA Bulletin</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Commodity Detail ─────────────────────────────────────────────────────────

function CommodityScreen({ commodity, onBack, onAdvisor }: { commodity: Commodity; onBack: ()=>void; onAdvisor: ()=>void }) {
  const [range, setRange] = useState<"7d"|"30d">("7d");
  const { language, t } = useLanguage();
  return (
    <div>
      <PageHeader title={`${commodity.icon} ${commodity.name[language]}`} subtitle={commodity.name[language]} onBack={onBack}/>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="bg-primary rounded-2xl px-5 py-5 text-white">
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-1">Kasalukuyang Baseline</p>
          <p className="text-4xl font-extrabold">₱{commodity.baseline}<span className="text-xl font-medium text-white/60">/kg</span></p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <TrendBadge trend={commodity.trend} change={commodity.change} changeAbs={commodity.changeAbs}/>
            <StatusChip volatility={commodity.volatility}/>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Galaw ng Presyo</p>
            <div className="flex bg-muted rounded-full overflow-hidden">
              {(["7d","30d"] as const).map((r)=>(
                <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1 text-xs font-semibold transition-colors ${range===r?"bg-primary text-white":"text-muted-foreground"}`}>
                  {r==="7d"?"7 Araw":"30 Araw"}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2 pt-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={gen7Day(commodity.baseline,commodity.trend)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,121,110,0.15)"/>
                <XAxis dataKey="day" tick={{fontSize:10,fill:"#72796e"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#72796e"}} axisLine={false} tickLine={false} width={36} tickFormatter={(v)=>`₱${v}`} domain={["auto","auto"]}/>
                <Tooltip contentStyle={{background:"#fcf9f8",border:"1px solid rgba(114,121,110,0.22)",borderRadius:8,fontSize:12}} formatter={(v:number)=>[`₱${v}/kg`,t("priceLabel")]}/>
                <Line type="monotone" dataKey="presyo" stroke="#154212" strokeWidth={2.5} dot={{fill:"#154212",r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <SL>{t("pricesAcrossMarkets")}</SL>
          <div className="space-y-2">
            {commodity.sources.map((src,i)=>(
              <div key={src.name} className={`flex items-center justify-between bg-card rounded-xl px-4 py-3 border ${i===0?"border-green-200 bg-green-50":"border-border"}`}>
                <div className="flex items-center gap-2">
                  {i===0 && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{t("cheapestLabel")}</span>}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{src.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Navigation size={10}/>{src.distance}</p>
                  </div>
                </div>
                <p className={`text-lg font-extrabold ${i===0?"text-green-700":"text-foreground"}`}>₱{src.price}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onAdvisor} className="w-full bg-primary text-white font-bold text-sm py-4 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Navigation size={16}/>{t("viewProcurementAdvisor")}
        </button>
      </div>
    </div>
  );
}

// ─── Advisor Screen ───────────────────────────────────────────────────────────

function AdvisorScreen({ commodity, quotedPrice, onBack }: { commodity: Commodity; quotedPrice: number; onBack: ()=>void }) {
  const cheapest = commodity.sources[0];
  const { language, t } = useLanguage();
  const isFlagged = quotedPrice > 0 && quotedPrice > commodity.baseline * 1.15;
  const action = isFlagged ? "negotiate" : commodity.trend === "up" ? "monitor" : "buy";
  const cards = {
    buy:       { label: t("cardBuyLabel"),   color:"bg-green-600", emoji:"✅", desc: t("cardBuyDesc") },
    negotiate: { label: t("cardNegotiateLabel"), color:"bg-amber-600", emoji:"🤝", desc: t("cardNegotiateDesc") },
    monitor:   { label: t("cardMonitorLabel"),  color:"bg-blue-600",  emoji:"👀", desc: t("cardMonitorDesc") },
  };
  const card = cards[action];
  return (
    <div>
      <PageHeader title={t("procurementAdvisor") || "Procurement Advisor"} subtitle={t("advisorSubtitle") || "Rekomendasyon batay sa presyo"} onBack={onBack}/>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border">
          <span className="text-3xl">{commodity.icon}</span>
          <div>
            <p className="font-bold text-foreground">{commodity.name[language]}</p>
            <p className="text-xs text-muted-foreground">{t("baselineLabel")}: ₱{commodity.baseline}/kg{quotedPrice>0&&` · ${t("quotedPrice")}: ₱${quotedPrice}/kg`}</p>
          </div>
        </div>
        <div className={`${card.color} rounded-2xl p-5 text-white`}>
          <p className="text-3xl mb-2">{card.emoji}</p>
          <p className="text-xs uppercase tracking-widest text-white/70 mb-1 font-semibold">{t("recommended")}</p>
          <p className="text-2xl font-extrabold mb-2">{card.label}</p>
          <p className="text-sm text-white/80 leading-relaxed">{card.desc}</p>
        </div>
        <div>
          <SL>Mas Murang Malapit na Source</SL>
          <div className="bg-green-50 rounded-xl border border-green-200 px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-foreground">{cheapest.name}</p>
              <p className="text-2xl font-extrabold text-green-700">₱{cheapest.price}<span className="text-sm text-green-600">/kg</span></p>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Navigation size={11}/>{cheapest.distance} · {t("verifiedSource")}</p>
            {quotedPrice>0&&(
              <div className="mt-3 bg-white/70 rounded-lg px-3 py-2 border border-green-200">
                <p className="text-xs font-semibold text-green-800">{t("savePer10kg").replace("{amt}", String(((quotedPrice-cheapest.price)*10).toFixed(0)))}</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <SL>{t("vendorTips")}</SL>
          {VENDOR_TIPS.slice(0,2).map((tip,i)=>(
            <div key={i} className="flex items-start gap-3 bg-card rounded-xl px-4 py-3.5 border border-border mb-2">
              <span className="text-xl shrink-0 mt-0.5">{tip.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight mb-0.5">{t(tip.titleKey as any)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(tip.bodyKey as any)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 bg-card rounded-xl px-4 py-3 border border-border">
          <Shield size={14} className="text-primary mt-0.5 shrink-0"/>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFlagged
              ? t("yourQuoteHigher").replace("{quote}", String(quotedPrice)).replace("{pct}", (((quotedPrice-commodity.baseline)/commodity.baseline)*100).toFixed(1))
              : `${t("baselineLabel")} ng ${commodity.name[language]}: ₱${commodity.baseline}/kg · DA Bulletin Jul 10, 2026.`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Source Transparency ──────────────────────────────────────────────────────

function TransparencyScreen({ bulletins, onBack }: { bulletins: BulletinRecord[]; onBack: ()=>void }) {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader title={t("sourceTransparency")} subtitle={t("sourceTransparencySubtitle")} onBack={onBack}/>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="bg-card rounded-xl border border-border px-4 py-3 flex items-start gap-3">
          <Shield size={16} className="text-primary mt-0.5 shrink-0"/>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("dataNotice")}</p>
        </div>
        <div className="space-y-2">
          {bulletins.map((b)=>(
            <div key={b.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-4">
                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold ${b.type==="PDF"?"bg-red-600":"bg-blue-600"}`}>{b.type}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{b.source}</p>
                    {b.verified
                      ? <span className="flex items-center gap-0.5 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold"><Check size={10}/>{t("verified")}</span>
                      : <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">{t("pending")}</span>}
                  </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5"><Clock size={10}/>{b.date} · {b.location}</p>
                      <div className="flex flex-wrap gap-1">
                        {b.commodities.map((c)=><span key={c} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>)}
                      </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLoginScreen({ onLogin, onBack }: { onLogin: ()=>void; onBack: ()=>void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleLogin = () => {
    if (!username || !password) { setError(t("fillAllFields")); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        onLogin();
      } else {
        setError(t("wrongCredentials"));
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div>
      <PageHeader title={t("adminLogin")} onBack={onBack}/>
      <div className="px-4 pt-8 pb-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <Lock size={28} className="text-white"/>
          </div>
          <h2 className="text-lg font-extrabold text-foreground">{t("adminTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-1 text-center">{t("restrictedAccess")}. {t("signedInAs")}.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{t("username")}</label>
            <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="admin"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{t("password")}</label>
            <div className="relative">
              <input type={showPass?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••••"
                onKeyDown={(e)=>e.key==="Enter"&&handleLogin()}
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"/>
              <button onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform">
                {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          </div>
          {error && (() => {
            const errMsg = typeof error === "string" ? error : String(error);
            console.error("Admin login error:", error);
            return (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle size={14} className="text-red-600 shrink-0"/>
                <p className="text-xs text-red-700 font-semibold flex-1">{errMsg}</p>
                <button onClick={()=>setError("")} className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded">Close</button>
              </div>
            );
          })()}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-primary text-white font-bold text-sm py-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 mt-2">
            {loading ? <><RefreshCw size={16} className="animate-spin"/>{t("checking")}</> : <><Lock size={16}/>{t("loginAsAdmin")}</>}
          </button>
        </div>
        <div className="mt-8 bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Ang admin area ay para lamang sa mga awtorisadong tauhan ng Ne-goshow. Para sa access, makipag-ugnayan sa inyong system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Hub ────────────────────────────────────────────────────────────────

function AdminScreen({ onLogout, onBack }: { onLogout: ()=>void; onBack: ()=>void }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<AdminTab>("upload");
  const [selectedCommodityAdmin, setSelectedCommodityAdmin] = useState<Commodity | null>(null);
  const [records, setRecords] = useState<AdminRecord[]>(INITIAL_RECORDS);
  const [uploads, setUploads] = useState<UploadedDoc[]>(INITIAL_UPLOADS);

  const publishDoc  = (id: number) => setUploads((p)=>p.map((d)=>d.id===id&&d.status==="validated"?{...d,status:"published"}:d));
  const deleteDoc   = (id: number) => setUploads((p)=>p.filter((d)=>d.id!==id));
  const updateRec   = (id: number, status: "approved"|"rejected") => setRecords((p)=>p.map((r)=>r.id===id?{...r,status}:r));

  const pending = records.filter((r)=>r.status==="pending");
  const done    = records.filter((r)=>r.status!=="pending");

  return (
    <div className="relative md:flex min-h-screen">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center"><Leaf size={18} className="text-white"/></div>
          <div>
            <div className="font-bold">Admin</div>
            <div className="text-xs opacity-80">Ne-goshow</div>
          </div>
        </div>
        <nav className="space-y-1">
          <button onClick={()=>{ setTab("dashboard"); setSelectedCommodityAdmin(null); }} className={`w-full text-left px-3 py-2 rounded ${tab==="dashboard"?"bg-slate-800":"hover:bg-slate-800/40"}`}>{t("dashboard")}</button>
          <button onClick={()=>setTab("upload")} className={`w-full text-left px-3 py-2 rounded ${tab==="upload"?"bg-slate-800":"hover:bg-slate-800/40"}`}>{t("upload")}</button>
          <button onClick={()=>setTab("validate")} className={`w-full text-left px-3 py-2 rounded ${tab==="validate"?"bg-slate-800":"hover:bg-slate-800/40"}`}>{t("validate")}</button>
        </nav>
        <div className="mt-6">
          <button onClick={onLogout} className="w-full bg-red-600 text-white px-3 py-2 rounded">{t("logout")}</button>
        </div>
      </aside>

      <main className="flex-1 p-4 bg-transparent text-foreground md:bg-transparent md:text-inherit">
        <div className="max-w-full">
          <PageHeader title={t("adminDashboard")} subtitle="Ne-goshow Talipapa Utility" onBack={onBack}
            right={<div className="hidden md:block"><button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">{t("logout")}</button></div>} />

          <div className="mt-2">
              <div className="flex bg-muted border-b border-border">
              {( [["dashboard", t("adminDashboard"), BarChart2],["upload", t("upload"), Upload],["validate", t("validate"), Database]] as [AdminTab|string,string,React.ElementType][] ).map(([id,label,Icon]) => (
                <button key={String(id)} onClick={()=>setTab(id as AdminTab)} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors border-b-2 ${tab===id?"border-primary text-primary bg-background":"border-transparent text-muted-foreground"}`}>
                  <Icon size={13}/>{label}
                </button>
              ))}
            </div>

            {tab==="dashboard" && (
              <div>
                {selectedCommodityAdmin ? (
                  <CommodityScreen commodity={selectedCommodityAdmin} onBack={()=>setSelectedCommodityAdmin(null)} onAdvisor={()=>{/* noop */}}/>
                ) : (
                  <DashboardScreen commodities={COMMODITIES} onSelectCommodity={(c)=>setSelectedCommodityAdmin(c)} onAdvisor={()=>setTab("validate")}/>
                )}
              </div>
            )}

            {tab==="upload" && (
              <div className="px-4 pt-5 pb-6 space-y-5">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <FilePlus size={14} className="text-primary"/>
                    <p className="text-sm font-bold text-foreground">{t("uploadBulletin")}</p>
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-sm text-muted-foreground">{t("adminUploadHelp")}</p>
                  </div>
                </div>

                <div>
                  <SL>{t("uploadsHeading")}</SL>
                  <div className="space-y-2">
                    {uploads.map((doc)=>{
                      const s = DOC_STATUS[doc.status];
                      return (
                        <div key={doc.id} className="bg-card rounded-xl border border-border overflow-hidden">
                          <div className="flex items-start gap-3 px-4 py-3">
                            <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold ${doc.docType==="PDF"?"bg-red-600":"bg-blue-600"}`}>{doc.docType}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-foreground truncate flex-1">{doc.filename}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.cls}`}>{t(s.labelKey as any)}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{doc.sourceOffice} · {doc.coverage}</p>
                            </div>
                          </div>
                          {(doc.status==="validated"||doc.status==="processing") && (
                            <div className="flex gap-2 px-4 pb-3">
                                                {doc.status==="validated" && (
                                                  <button onClick={()=>publishDoc(doc.id)} className="flex-1 flex items-center justify-center gap-1 bg-primary text-white text-xs font-bold py-2 rounded-lg">{t("publish")}</button>
                                                )}
                                                <button onClick={()=>deleteDoc(doc.id)} className="flex items-center justify-center gap-1 bg-card border border-red-200 text-red-600 text-xs font-bold px-3 py-2 rounded-lg">{t("delete")}</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab==="validate" && (
              <div className="px-4 pt-4 pb-6 space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className={`rounded-xl px-3 py-3 text-center border bg-amber-100 text-amber-700`}>
                    <p className="text-2xl font-extrabold">{pending.length}</p>
                    <p className="text-xs font-semibold">{t("pending")}</p>
                  </div>
                  <div className={`rounded-xl px-3 py-3 text-center border bg-green-100 text-green-700`}>
                    <p className="text-2xl font-extrabold">{done.filter(r=>r.status==="approved").length}</p>
                    <p className="text-xs font-semibold">{t("approved")}</p>
                  </div>
                  <div className={`rounded-xl px-3 py-3 text-center border bg-red-100 text-red-700`}>
                    <p className="text-2xl font-extrabold">{done.filter(r=>r.status==="rejected").length}</p>
                    <p className="text-xs font-semibold">{t("rejected")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {pending.map((r)=> (
                    <div key={r.id} className="bg-card rounded-xl border overflow-hidden">
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">{r.commodity}</p>
                            <p className="text-xs text-muted-foreground">{r.location} · {r.date} · {r.source}</p>
                          </div>
                          <p className={`text-lg font-extrabold shrink-0 ${r.flagged?"text-red-700":"text-foreground"}`}>₱{r.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>updateRec(r.id,"approved")} className="flex-1 flex items-center justify-center gap-1 bg-primary text-white text-xs font-bold py-2.5 rounded-lg">{t("approve")}</button>
                          <button onClick={()=>updateRec(r.id,"rejected")} className="flex-1 flex items-center justify-center gap-1 bg-card border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-lg">{t("reject")}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

 

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({ activeTab, navigate }: { activeTab: string; navigate: (s: Screen)=>void }) {
  const { t } = useLanguage();

  const tabs = [
    { id:"home",    label:t("home"),    icon:Home,          screen:"home" as Screen },
    { id:"checker", label:t("checker"), icon:Search,        screen:"checker" as Screen },
    { id:"trends",  label:t("analytics"),icon:TrendingUp,    screen:"dashboard" as Screen },
    { id:"more",    label:t("more"),    icon:MoreHorizontal,screen:"more" as Screen },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 pb-safe">
        {tabs.map(({id,label,icon:Icon,screen})=>{
          const active = activeTab===id;
          return (
            <button key={id} onClick={()=>navigate(screen)}
              className="flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 active:scale-90 transition-transform">
              <div className={`w-10 h-9 rounded-xl flex items-center justify-center transition-colors ${active?"bg-primary":""}`}>
                <Icon size={18} className={active?"text-white":"text-muted-foreground"}/>
              </div>
              <span className={`text-[10px] font-semibold leading-tight ${active?"text-primary":"text-muted-foreground"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { t } = useLanguage();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [checkerStep, setCheckerStep] = useState<"input"|"result">("input");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [checkerCommodity, setCheckerCommodity] = useState<Commodity | null>(null);
  const [checkerLocation, setCheckerLocation] = useState("");
  const [checkResult, setCheckResult] = useState<ResultState>(null);

  const navigate = (s: Screen, commodity?: Commodity) => {
    setScreen(s);
    if (commodity) setSelectedCommodity(commodity);
    if (s === "checker") { setCheckerStep("input"); setCheckResult(null); }
    window.scrollTo(0, 0);
  };

  const handleCheck = () => {
    if (!checkerCommodity || !quotedPrice || !checkerLocation) return;
    const variance = (parseFloat(quotedPrice) - checkerCommodity.baseline) / checkerCommodity.baseline;
    setCheckResult(variance > 0.15 ? "flagged" : "fair");
    setCheckerStep("result");
  };

  const handleAdminLogin  = () => { setIsAdminLoggedIn(true);  navigate("admin"); };
  const handleAdminLogout = () => { setIsAdminLoggedIn(false); navigate("more");  };

  const activeTab =
    screen === "home"                              ? "home"
    : screen === "checker"                         ? "checker"
    : ["dashboard","commodity","advisor"].includes(screen) ? "trends"
    : "more";

  const isAdminFlow = screen === "admin-login" || screen === "admin";

  return (
    <div className={`min-h-screen ${isAdminFlow?"bg-slate-900 text-white":"bg-[#e8e3dc]"}`} style={{ fontFamily:"'Be Vietnam Pro', sans-serif" }}>
      <div className="w-full min-h-screen flex flex-col bg-background relative overflow-hidden">
        {isAdminFlow && (
          <div className="w-full bg-slate-800 text-white border-b border-slate-700">
            <div className="w-full px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center"><Leaf size={16} className="text-white"/></div>
                  <div>
                    <div className="text-sm font-bold">{t("adminArea")}</div>
                    <div className="text-xs opacity-80">Ne-goshow — {t("restrictedAccess")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs opacity-80">{t("signedInAs")} admin</div>
                </div>
              </div>
          </div>
        )}

        {/* Desktop top nav */}
        {!isAdminFlow && <div className="hidden md:block border-b bg-background"> 
        
        </div>}
        {!isAdminFlow && (
        <div className="hidden md:block border-b bg-background">
          <div className="w-full px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center"><Leaf size={18} className="text-accent"/></div>
              <div>
                <div className="text-sm font-bold">Ne-goshow</div>
                <div className="text-xs text-muted-foreground">Talipapa Utility</div>
              </div>
            </div>
            <nav className="flex items-center gap-3">
              <button onClick={() => navigate("home")} className={`px-3 py-2 rounded ${screen==="home"?"bg-primary text-white":"text-muted-foreground"}`}>{t("home")}</button>
              <button onClick={() => navigate("checker")} className={`px-3 py-2 rounded ${screen==="checker"?"bg-primary text-white":"text-muted-foreground"}`}>{t("checker")}</button>
              <button onClick={() => navigate("dashboard")} className={`px-3 py-2 rounded ${screen==="dashboard"?"bg-primary text-white":"text-muted-foreground"}`}>{t("dashboard")}</button>
              <button onClick={() => navigate("transparency")} className={`px-3 py-2 rounded ${screen==="transparency"?"bg-primary text-white":"text-muted-foreground"}`}>{t("analytics")}</button>
              <button onClick={() => navigate("more")} className={`px-3 py-2 rounded ${screen==="more"?"bg-primary text-white":"text-muted-foreground"}`}>{t("more")}</button>
            </nav>
          </div>
        </div>)}

        <div className={`flex-1 overflow-y-auto scrollbar-hide ${isAdminFlow ? "" : "pb-20"}`}>
          {isAdminFlow ? (
            <>
              {screen==="admin-login" && (
                <ErrorBoundary>
                  <AdminLoginScreen onLogin={handleAdminLogin} onBack={()=>navigate("more")}/>
                </ErrorBoundary>
              )}
              {screen==="admin" && isAdminLoggedIn && (
                <ErrorBoundary>
                  <AdminScreen onLogout={handleAdminLogout} onBack={()=>navigate("more")}/>
                </ErrorBoundary>
              )}
            </>
          ) : (
            <div className="w-full mx-auto px-4 min-h-screen">

            {screen==="home"        && <HomeScreen navigate={navigate}/>}

            {screen==="checker" && checkerStep==="input" && (
              <CheckerScreen commodities={COMMODITIES} locations={LOCATIONS}
                checkerCommodity={checkerCommodity} setCheckerCommodity={setCheckerCommodity}
                quotedPrice={quotedPrice} setQuotedPrice={setQuotedPrice}
                checkerLocation={checkerLocation} setCheckerLocation={setCheckerLocation}
                onCheck={handleCheck}/>
            )}

            {screen==="checker" && checkerStep==="result" && checkResult && checkerCommodity && (
              <CheckerResult result={checkResult} commodity={checkerCommodity}
                quotedPrice={parseFloat(quotedPrice)} location={checkerLocation}
                onReset={()=>{ setCheckerStep("input"); setCheckResult(null); setQuotedPrice(""); }}
                onAdvisor={()=>navigate("advisor")}/>
            )}

            {screen==="dashboard"   && <DashboardScreen commodities={COMMODITIES} onSelectCommodity={(c)=>navigate("commodity",c)} onAdvisor={()=>navigate("advisor")}/>} 
            {screen==="commodity"   && selectedCommodity && <CommodityScreen commodity={selectedCommodity} onBack={()=>navigate("dashboard")} onAdvisor={()=>navigate("advisor")}/>} 
            {screen==="advisor"     && <AdvisorScreen commodity={checkerCommodity||COMMODITIES[0]} quotedPrice={checkerCommodity?parseFloat(quotedPrice)||0:0} onBack={()=>navigate("checker")}/>} 
            {screen==="transparency"&& <TransparencyScreen bulletins={INITIAL_BULLETINS} onBack={()=>navigate("more")}/>} 
            {screen==="more"        && <MoreScreen navigate={navigate} isAdminLoggedIn={isAdminLoggedIn}/>} 

            </div>
          )}
        </div>

        {!isAdminFlow && <BottomNav activeTab={activeTab} navigate={navigate}/>} 
      </div>
    </div>
  );
}
