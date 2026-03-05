import { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { ResponsiveBullet } from "@nivo/bullet";
import { ResponsiveWaffle } from "@nivo/waffle";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { ResponsiveLine } from "@nivo/line";

// ─────────────────────────────────────────────
// THEME SYSTEM — DARK + LIGHT
// ─────────────────────────────────────────────
const DARK = {
  _mode: "dark",
  bg: "#080B0F", surface: "#0E1318", surface2: "#141A21", surface3: "#1A2330",
  border: "#1E2730", borderHi: "#2A3848", text: "#E8EDF2", textSub: "#B0C4D0",
  muted: "#8A9BAA", dimmed: "#5A6B7A", accent: "#4A90D9", accentLo: "rgba(74,144,217,0.14)",
  critical: "#FF5252", critLo: "rgba(255,82,82,0.12)", high: "#FF8C42",
  highLo: "rgba(255,140,66,0.12)", medium: "#FFD23F", medLo: "rgba(255,210,63,0.12)",
  low: "#2ECC71", lowLo: "rgba(46,204,113,0.12)", criminal: "#FF2D55",
  axisText: "#8A9BAA", gridLine: "#1E2730", legendText: "#8A9BAA",
  tooltipBg: "#141A21", tooltipBdr: "#2A3848",
};

const LIGHT = {
  _mode: "light",
  bg: "#EEF2F7", surface: "#FFFFFF", surface2: "#F4F7FB", surface3: "#E8EDF5",
  border: "#CBD5E0", borderHi: "#A0AEC0", text: "#0D1B2A", textSub: "#2D4057",
  muted: "#4A6070", dimmed: "#7A8FA0", accent: "#1A6FD8", accentLo: "rgba(26,111,216,0.10)",
  critical: "#C0392B", critLo: "rgba(192,57,43,0.08)", high: "#C05000",
  highLo: "rgba(192,80,0,0.08)", medium: "#8B6914", medLo: "rgba(139,105,20,0.08)",
  low: "#1A7A3C", lowLo: "rgba(26,122,60,0.08)", criminal: "#A8002A",
  axisText: "#4A6070", gridLine: "#CBD5E0", legendText: "#4A6070",
  tooltipBg: "#FFFFFF", tooltipBdr: "#A0AEC0",
};

const ThemeCtx = createContext(DARK);
const useTheme = () => useContext(ThemeCtx);

// ─────────────────────────────────────────────
// HARDCODED REFERENCE DATA (Laws, SOPs, Contacts)
// ─────────────────────────────────────────────
const SIGNIFICANCE = [
  { id:"SIG-01", category:"Service Downtime", threshold:"Critical trading service unavailable ≥ 2 hours for ≥ 10% of users", nis2:"Art.23", dora:"Art.18", example:"AST-001 down during EU market hours causing order rejection for 500+ clients" },
  { id:"SIG-02", category:"Users Affected", threshold:"≥ 10% of total user base OR absolute threshold as set by ACN guidance", nis2:"Art.23", dora:"Art.18", example:"8,000 of 80,000 users unable to access trading portal" },
  { id:"SIG-03", category:"Financial Impact", threshold:"Direct financial loss ≥ €500,000", nis2:"Art.23", dora:"Art.18", example:"System breach causes €600k direct trading losses + €150k IR costs" },
  { id:"SIG-04", category:"Malicious Intent", threshold:"Confirmed criminal or malicious actor caused the incident", nis2:"Art.23", dora:"Art.18", example:"Forensic confirms LockBit-affiliated group deployed ransomware on AST-002" },
  { id:"SIG-05", category:"Cross-Border Impact", threshold:"Incident affects services or users in ≥ 2 EU Member States", nis2:"Art.23", dora:"Art.18", example:"London and Milan offices both affected; French broker clients report data loss" },
  { id:"SIG-06", category:"Data Breach", threshold:"Personal data or Strategic ICT asset data confirmed as exfiltrated", nis2:"Art.23+GDPR Art.33", dora:"Art.18", example:"Customer KYC records exfiltrated; GDPR Art.33 triggered simultaneously" },
  { id:"SIG-07", category:"Reputational / Media", threshold:"Incident has caused or likely to cause significant reputational damage", nis2:"Art.23", dora:"Art.18", example:"Financial Times reports trading firm hit by cyber attack" },
  { id:"SIG-08", category:"Financial Market Stability", threshold:"Indication incident could affect Italian or EU financial market stability", nis2:"Art.23", dora:"Art.18+ESMA", example:"AST-001 outage coincides with ECB rate announcement; Italian bond liquidity drops 40%" },
  { id:"SIG-09", category:"PSNC / CVCN Compromise", threshold:"Any confirmed or suspected compromise of a PSNC Strategic asset", nis2:"D.Lgs.105/2019 Art.1", dora:"—", example:"AST-002 (ION Cloud) shows signs of unauthorized access; PSNC reporting mandatory" },
  { id:"SIG-10", category:"DORA Major ICT Incident", threshold:"Incident meets DORA major incident classification (per EBA/ESMA thresholds)", nis2:"DORA Art.18", dora:"DORA Art.19", example:"Prolonged AST-001 outage meets EBA/ESMA DORA major incident thresholds" },
  { id:"SIG-11", category:"Cumulative Incidents", threshold:"Three or more related minor incidents within 30 days collectively meeting any single threshold", nis2:"Art.23+ACN Guidance", dora:"DORA Art.18", example:"Three phishing incidents in 30 days collectively affecting >15% of users" },
];

const CHECKLIST_ITEMS = [
  { id:"EW-01",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Determine if incident meets 'Significant' threshold (Significance Criteria)",             owner:"IR Manager",       evidence:"Significance Assessment form (SIG-01 to SIG-11 checklist)" },
  { id:"EW-02",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Confirm if incident is malicious/criminal in nature",                                        owner:"IR Manager",       evidence:"Initial triage ticket in SIEM/ITSM with malicious indicator flag" },
  { id:"EW-03",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Assess cross-border impact (London, NY offices, EU clients)",                                owner:"IR Manager + Legal",evidence:"Cross-border impact assessment memo signed by IR Manager" },
  { id:"EW-04",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"⚠ TEST FIRST: Notify ACN / CSIRT Italia via csirt.gov.it portal",                           owner:"CISO",             evidence:"ACN portal submission confirmation (ticket number + timestamp)" },
  { id:"EW-05",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Log ACN portal ticket reference number in Incident Log",                                     owner:"IR Manager",       evidence:"ACN ticket reference logged in Incident Log" },
  { id:"EW-06",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Assess if DORA parallel notification required → Bank of Italy / ESAs",                      owner:"Compliance",       evidence:"DORA parallel assessment memo; Bank of Italy notification if required" },
  { id:"EW-07",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"🆕 Assess if GDPR data breach notification required → Garante (72h rule)",                  owner:"DPO + Compliance", evidence:"GDPR Art.33 preliminary assessment form signed by DPO" },
  { id:"EW-08",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"Activate Incident Response Team and open War Room",                                          owner:"Head of IR",       evidence:"War Room activation log with attendee list and timestamp" },
  { id:"EW-09",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24h",     action:"🆕 Notify CEO / Board if incident is Critical (personal liability NIS2 Art.20)",             owner:"CISO → CEO",       evidence:"Board notification email/Teams message with CISO timestamp" },
  { id:"EW-10",  phase:"PHASE 1: EARLY WARNING", deadline:"< 24-48h",  action:"🆕 Notify Cyber Insurance Provider per policy terms. Do NOT pay ransom without insurer auth.",owner:"CFO + Legal",      evidence:"Insurance portal notification confirmation; incident reference number" },
  { id:"IN-01",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"Provide initial severity assessment to ACN (severity, impact, first IoCs)",             owner:"CISO",             evidence:"Severity assessment report submitted to ACN portal" },
  { id:"IN-02",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"Package and submit IoCs to ACN (IPs, hashes, domains, TTPs – STIX 2.1 preferred)",      owner:"SOC Lead",         evidence:"STIX 2.1 IoC package attached to 72h submission" },
  { id:"IN-03",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"Submit formal 72h Notification to ACN via unified portal",                              owner:"CISO",             evidence:"72h notification submission confirmation from ACN portal" },
  { id:"IN-04",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"🆕 Submit DORA 4h notification to Bank of Italy if ICT financial assets affected",       owner:"Compliance",       evidence:"DORA 4h notification sent; Bank of Italy reference number" },
  { id:"IN-05",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"🆕 Share IoCs with FS-ISAC if member (cross-sector threat intel)",                       owner:"SOC Lead",         evidence:"FS-ISAC threat intel submission confirmation" },
  { id:"IN-06",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"Update Incident Log with notification timestamps and ticket refs",                       owner:"IR Manager",       evidence:"Updated Incident Log tab with all notification records" },
  { id:"IN-07",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h", action:"Contain incident – isolate affected systems per IR Playbook",                            owner:"SOC + IT Security", evidence:"Containment action log with system isolation timestamps" },
  { id:"FR-01",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Complete Root Cause Analysis (RCA) with technical timeline",                                 owner:"SOC + IT Security", evidence:"Root Cause Analysis report signed by CISO and SOC Lead" },
  { id:"FR-02",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Document detailed technical timeline of the incident",                                       owner:"IR Manager",        evidence:"Technical timeline document with log evidence" },
  { id:"FR-03",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Quantify final business and financial impact (trading losses, fines, remediation)",          owner:"CFO + Compliance",  evidence:"Financial impact report signed by CFO" },
  { id:"FR-04",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"List long-term mitigation and remediation steps with owners and dates",                      owner:"CISO",              evidence:"Long-term remediation plan added to Remediation Roadmap tab" },
  { id:"FR-05",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Submit final report to ACN portal",                                                          owner:"CISO",              evidence:"ACN portal final report submission confirmation" },
  { id:"FR-06",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Submit final DORA report to Lead Overseer (Bank of Italy / ESAs if applicable)",             owner:"Compliance",        evidence:"DORA final report submitted to Bank of Italy / ESAs" },
  { id:"FR-07",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"🆕 Submit final GDPR report to Garante (if personal data was involved)",                    owner:"DPO",               evidence:"GDPR final report submitted to Garante; reference number" },
  { id:"FR-08",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Conduct Post-Incident Review with management and board",                                     owner:"CISO + Management", evidence:"Post-Incident Review minutes signed by board" },
  { id:"FR-09",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"Update Incident Log, Risk Register, and Remediation Roadmap",                               owner:"IR Manager",        evidence:"Updated Incident Log, Risk Register, and Roadmap" },
  { id:"FR-10",  phase:"PHASE 3: FINAL REPORT", deadline:"< 1 month",  action:"🆕 Complete Lessons Learned Log – feed findings into Risk Register, GAP Register, Training programme. Board sign-off required.", owner:"CISO + IR Manager", evidence:"Lessons Learned Report (signed); updated Risk Register version" },
];

const REG_CONTACTS = [
  { framework:"NIS2 – General Infrastructure",   authority:"CSIRT Italia (ACN)",               portal:"csirt.gov.it",       contact:"cert@csirt.gov.it",        hotline:"+39 06 85264 115 | cert@csirt.gov.it | Portal: csirt.gov.it" },
  { framework:"DORA – Financial Services",        authority:"Bank of Italy / ESAs",             portal:"bancaditalia.it",     contact:"Supervised entity portal", hotline:"Bank of Italy: +39 06 47920400 | Secure entity portal login required" },
  { framework:"GDPR – Data Breach",               authority:"Garante per la Protezione dei Dati",portal:"garanteprivacy.it", contact:"Online notification form",  hotline:"Garante Privacy: +39 06 69677.1 | garanteprivacy.it" },
];

// ─────────────────────────────────────────────
// LIVE SHAREPOINT DATA FETCHING
// ─────────────────────────────────────────────
// ⚠ Replace this URL with the direct-download link from your SharePoint Document Library
const SHAREPOINT_JSON_URL = window.location.hostname === "localhost" 
  ? "/api-sharepoint/teams/ComplianceHub_NIS2/DashboardData/nis2-data.json?download=1" // Local dev path
  : "https://iontradingcom.sharepoint.com/teams/ComplianceHub_NIS2/DashboardData/nis2-data.json?download=1"; // Production path
const useComplianceData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(SHAREPOINT_JSON_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} – Failed to connect to SharePoint`);
        const json = await res.json();

        const mapped = {
          // GAPS Mapping
          gaps: (json.gaps || []).filter(item => item.Title && !item.Title.includes("📊")).map(item => ({
            id: item.Title,
            domain: item.field_1,
            ref: item.field_2,
            requirement: item.field_3,
            state: item.field_4,
            level: item.field_6 || "LOW",
            target: item.field_14,
            status: item.field_16 || "OPEN",
            owner: item.field_11
          })),

          // RISKS Mapping
          risks: (json.risks || []).map(item => ({
            id: item.Title,
            desc: item.field_1,
            ttp: item.field_2,
            asset: item.field_3,
            l: parseInt(item.field_4) || 0,
            i: parseInt(item.field_5) || 0,
            inherent: parseInt(item.field_6) || 0,
            controls: item.field_7,
            residual: item.field_8 || "Medium",
            postTreatment: parseInt(item.field_10) || 0,
            owner: item.field_12,
            review: item.field_11
          })),

          // ASSETS Mapping
          assets: (json.assets || []).map(item => ({
            id: item.Title,
            type: item.field_3,
            name: item.field_2,
            category: item.field_9,
            criticality: item.field_6,
            psnc: String(item.field_7).toLowerCase() === "yes",
            cvcn: item.field_8 || "N/A",
            dora: item.field_10 || "N/A",
            drTested: item.field_12,
            risk: parseInt(item.field_16) || 3
          })),

          // BUDGET Mapping
          budget: (json.budget || []).filter(item => item.Title !== "TOTAL").map(item => ({
            id: item.Title,
            action: item.field_1,
            owner: item.field_2,
            allocated: parseFloat(item.field_3) || 0,
            spent: parseFloat(item.field_4) || 0,
            status: item.field_7 || "OPEN"
          })),

          // TRAINING Mapping
          training: (json.training || []).map(item => ({
            name: item.Title,
            role: item.field_1,
            category: item.field_2,
            type: item.field_3,
            status: item.field_4,
            due: item.field_5
          })),

          // EVIDENCE Mapping
          evidence: (json.evidence || []).map(item => ({
            id: item.Title,
            desc: item.field_1,
            related: item.field_2,
            ref: item.field_5,
            status: item.field_4
          })),

          // INCIDENTS Mapping
          incidents: (json.incidents || []).filter(item => item.Title && !item.Title.includes("⚠️")).map(item => ({
            id: item.Title,
            detected: item.field_1,
            resolved: item.field_2,
            title: item.field_3,
            severity: item.field_4,
            type: item.field_5,
            significant: String(item.field_8).toLowerCase() === "y",
            ew24: item.field_9 || "N",
            ew24_ts: item.field_10 || "—",
            ntf72: item.field_11 || "N",
            report30: item.field_13 || "N",
            dora4h: item.field_15 || "N",
            lessons: item.field_16 || "—"
          })),

          // POLICIES Mapping
          policies: (json.policies || []).map(item => ({
            id: item.Title,
            title: item.field_1,
            ref: item.field_2,
            category: item.field_3,
            approver: item.field_4,
            drafted: true, 
            approved: false, 
            notes: item.field_6 || ""
          })),

          // MATURITY Mapping
          maturity: (json.maturity || []).filter(item => item.Title && !item.Title.includes("📊")).map((item, index) => ({
            num: index + 1,
            article: item.field_1,
            domain: item.field_2,
            current: parseInt(item.field_3) || 1,
            target: parseInt(item.field_4) || 4,
            priority: (item.field_6 || "").replace(/[^a-zA-Z]/g, "").toUpperCase() || "MEDIUM",
            state: item.field_7,
            action: item.field_8,
            owner: item.field_9,
            target_date: item.field_10,
            status: item.field_11
          })),

          // PHASES Mapping
          phases: (json.phases || []).filter(item => item.Title && !item.Title.includes("⚠️")).map(item => ({
            id: item.Title,
            name: item.field_1,
            start: item.field_2,
            end: item.field_3,
            pct: parseInt(String(item.field_5 || "0").replace("%", "")) || 0,
            status: (item.field_6 || "IN PROGRESS"),
            color_key: (item.field_6 || "").includes("AT RISK") ? "criminal" : (item.field_6 || "").includes("COMPLETE") ? "low" : "accent",
            activities: item.field_4 ? item.field_4.split("•").map(s => s.trim()).filter(Boolean) : []
          }))
        };

        setData(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 15 minutes to keep the dashboard live
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

// ─────────────────────────────────────────────
// NIVO THEME FACTORY
// ─────────────────────────────────────────────
const makeNivo = (T) => ({
  background: "transparent",
  text: { fill: T.axisText, fontSize: 11, fontFamily: "'IBM Plex Mono', 'Courier New', monospace" },
  axis: {
    domain: { line: { stroke: T.gridLine, strokeWidth: 1 } },
    ticks: { line: { stroke: T.gridLine, strokeWidth: 1 }, text: { fill: T.axisText, fontSize: 10 } },
    legend: { text: { fill: T.muted, fontSize: 11 } },
  },
  grid: { line: { stroke: T.gridLine, strokeWidth: 1 } },
  legends: { text: { fill: T.legendText, fontSize: 11 } },
  tooltip: {
    container: {
      background: T.tooltipBg, color: T.text, fontSize: 12, borderRadius: 6,
      border: `1px solid ${T.tooltipBdr}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      fontFamily: "'IBM Plex Mono', monospace",
    },
  },
  crosshair: { line: { stroke: T.accent, strokeWidth: 1, strokeOpacity: 0.5 } },
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const levelColor = (l, T) => {
  const u = (l || "").toString().toUpperCase();
  if (u === "CRITICAL" || u === "CRIMINAL RISK" || u === "CRIMINAL") return T.criminal;
  if (u === "HIGH") return T.high;
  if (u === "MEDIUM" || u === "PARTIAL") return T.medium;
  if (u === "LOW") return T.low;
  return T.muted;
};

const residualColor = (r, T) => {
  if (!T) return "#888";
  const u = (r || "").toString().toUpperCase();
  if (u === "CRITICAL") return T.criminal;
  if (u === "HIGH") return T.high;
  if (u === "MEDIUM") return T.medium;
  return T.low;
};

const scoreColor = (s, T) => {
  const n = parseFloat(s) || 0;
  if (n >= 16) return T.criminal;
  if (n >= 10) return T.high;
  if (n >= 6) return T.medium;
  return T.low;
};

const normalizeLevel = (l) => {
  const u = (l || "").toString().toUpperCase().trim();
  if (u === "CRIMINAL RISK" || u === "CRIMINAL") return "CRIMINAL";
  if (u === "CRITICAL") return "CRITICAL";
  if (u === "HIGH") return "HIGH";
  if (u === "MEDIUM" || u === "PARTIAL") return "MEDIUM";
  if (u === "LOW") return "LOW";
  return null;
};

const fmt = (n) => `€${Number(n || 0).toLocaleString()}`;

// ─────────────────────────────────────────────
// MICRO-COMPONENTS
// ─────────────────────────────────────────────
const Badge = ({ label, color, bg, T: _T }) => {
  const T = _T || useTheme();
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      background: bg || `${color || T.muted}22`, color: color || T.muted,
      border: `1px solid ${color || T.border}50`,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>{label}</span>
  );
};

const LevelBadge = ({ level }) => {
  const T = useTheme();
  const u = (level || "").toString().toUpperCase().trim();
  if (u === "CRIMINAL RISK" || u === "CRIMINAL") return <Badge label="CRIMINAL" color={T.criminal} T={T} />;
  if (u === "CRITICAL") return <Badge label="CRITICAL" color={T.critical} T={T} />;
  if (u === "HIGH") return <Badge label="HIGH" color={T.high} T={T} />;
  if (u === "MEDIUM" || u === "PARTIAL") return <Badge label="MEDIUM" color={T.medium} T={T} />;
  if (u === "LOW") return <Badge label="LOW" color={T.low} T={T} />;
  return <Badge label={level || "—"} color={T.muted} T={T} />;
};

const KPI = ({ label, value, sub, color, pulse }) => {
  const T = useTheme();
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderTop: `2px solid ${color || T.border}`, borderRadius: 6, padding: "16px 18px",
    }}>
      <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {pulse && <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.criminal, animation: "nis2pulse 2s infinite", display: "inline-block" }} />}
        <span style={{ fontSize: 28, fontWeight: 700, color: color || T.text, lineHeight: 1, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: T.dimmed, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>{sub}</div>}
    </div>
  );
};

const Card = ({ title, children, badge, style }) => {
  const T = useTheme();
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "18px 20px", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>{title}</span>
          {badge && <span style={{ fontSize: 10, color: T.muted, background: T.surface2, padding: "2px 6px", borderRadius: 3, border: `1px solid ${T.border}` }}>{badge}</span>}
        </div>
      )}
      {children}
    </div>
  );
};

const AlertBar = ({ type, title, text }) => {
  const T = useTheme();
  const colors = { critical: T.criminal, warning: T.high, info: T.accent };
  const c = colors[type] || T.muted;
  return (
    <div style={{ background: `${c}0d`, border: `1px solid ${c}30`, borderLeft: `3px solid ${c}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: c, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>{title}</div>
        {text && <div style={{ fontSize: 11, color: T.dimmed, fontFamily: "'IBM Plex Mono', monospace" }}>{text}</div>}
      </div>
    </div>
  );
};

const Divider = ({ style }) => { const T = useTheme(); return <div style={{ borderTop: `1px solid ${T.border}`, ...style }} />; };

const StatRow = ({ label, value, color }) => {
  const T = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12, color: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || T.text, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────
const DataTable = ({ columns, rows, onRowClick, maxHeight = 400 }) => {
  const T = useTheme();
  const [sort, setSort] = useState({ col: null, asc: true });
  const sorted = useMemo(() => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sort.col] ?? "";
      const vb = b[sort.col] ?? "";
      return sort.asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [rows, sort]);

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight, borderRadius: 4, border: `1px solid ${T.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
        <thead>
          <tr style={{ background: T.surface2 }}>
            {columns.map((c) => (
              <th key={c.key} onClick={() => setSort(s => ({ col: c.key, asc: s.col === c.key ? !s.asc : true }))}
                style={{ padding: "9px 12px", textAlign: "left", color: T.textSub || T.text, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}`, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                {c.label}{sort.col === c.key ? (sort.asc ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}
              style={{ borderBottom: `1px solid ${T.border}`, cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.surface2}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "8px 12px", color: T.text, verticalAlign: "top", maxWidth: c.width || 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: c.wrap ? "normal" : "nowrap" }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: T.muted }}>No data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
const Modal = ({ data, onClose }) => {
  const T = useTheme();
  if (!data) return null;
  const { type, row } = data;
  const renderField = (label, value, color) => (
    <div style={{ background: T.surface2, borderRadius: 4, padding: "10px 12px" }}>
      <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 12, color: color || T.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{value || "—"}</div>
    </div>
  );

  const content = type === "gap" ? (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {renderField("ID", row.id)}{renderField("NIS2 Ref", row.ref)}
      {renderField("Severity", <LevelBadge level={row.level} />)}{renderField("Status", row.status)}
      {renderField("Target", row.target)}{renderField("Owner", row.owner)}
      <div style={{ gridColumn: "span 2" }}>{renderField("Requirement", row.requirement)}</div>
      <div style={{ gridColumn: "span 2" }}>{renderField("Current State", row.state, T.high)}</div>
    </div>
  ) : type === "risk" ? (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {renderField("Risk ID", row.id)}{renderField("TTP", row.ttp)}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace", padding: "10px 12px 0", background: T.surface2, borderRadius: "4px 4px 0 0" }}>Scores</div>
        <div style={{ background: T.surface2, padding: "4px 12px 10px", borderRadius: "0 0 4px 4px", display: "flex", gap: 16 }}>
          <span style={{ color: T.high, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>L:{row.l}/5</span>
          <span style={{ color: T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>I:{row.i}/5</span>
          <span style={{ color: scoreColor(row.inherent, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>⬛{row.inherent}/25</span>
        </div>
      </div>
      {renderField("Residual Risk", <LevelBadge level={row.residual} />)}
      {renderField("Post-Treatment Score", `${row.postTreatment}/25`, scoreColor(row.postTreatment, T))}
      {renderField("Owner", row.owner)}{renderField("Review", row.review)}
      <div style={{ gridColumn: "span 2" }}>{renderField("Description", row.desc)}</div>
      <div style={{ gridColumn: "span 2" }}>{renderField("Current Controls", row.controls)}</div>
    </div>
  ) : null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.borderHi}`, borderRadius: 8, width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span style={{ color: T.accent }}>{row.id}</span>{" — "}{(row.requirement || row.desc || "").substring(0, 55)}{(row.requirement || row.desc || "").length > 55 ? "…" : ""}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>✕</button>
        </div>
        {content}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────

// ── Overview ──
const OverviewView = ({ RAW, setFilter }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const gaps = RAW.gaps || [];
  const risks = RAW.risks || [];
  const budget = RAW.budget || [];
  const evidence = RAW.evidence || [];
  const training = RAW.training || [];

  const critical = gaps.filter(g => normalizeLevel(g.level) === "CRITICAL").length;
  const high = gaps.filter(g => normalizeLevel(g.level) === "HIGH").length;
  const medium = gaps.filter(g => normalizeLevel(g.level) === "MEDIUM").length;
  const low = gaps.filter(g => normalizeLevel(g.level) === "LOW").length;
  const critRisks = risks.filter(r => (r.residual || "").toUpperCase() === "CRITICAL").length;
  const totalBudget = budget.reduce((a, b) => a + (b.allocated || 0), 0);
  const openActions = budget.filter(b => b.status === "OPEN").length;
  const inProgress = budget.filter(b => b.status === "In Progress").length;
  const trainingTotal = training.length;
  const trainingDone = training.filter(t => (t.status || "").toLowerCase().includes("complete")).length;
  const trainingPct = trainingTotal > 0 ? Math.round((trainingDone / trainingTotal) * 100) : 0;

  const pieSeverity = [
    { id: "CRITICAL", label: "CRITICAL", value: critical, color: T.criminal },
    { id: "HIGH",     label: "HIGH",     value: high,     color: T.high },
    { id: "MEDIUM",   label: "MEDIUM",   value: medium,   color: T.medium },
    { id: "LOW",      label: "LOW",      value: low,      color: T.low },
  ].filter(d => d.value > 0);

  const domainMap = {};
  gaps.forEach(g => { domainMap[g.domain] = domainMap[g.domain] || []; domainMap[g.domain].push(g); });
  const domainBar = Object.entries(domainMap).slice(0, 6).map(([full, items]) => ({
    domain: full.length > 14 ? full.substring(0, 13) + "…" : full,
    CRITICAL: items.filter(g => normalizeLevel(g.level) === "CRITICAL").length,
    HIGH:     items.filter(g => normalizeLevel(g.level) === "HIGH").length,
    MEDIUM:   items.filter(g => normalizeLevel(g.level) === "MEDIUM").length,
    LOW:      items.filter(g => normalizeLevel(g.level) === "LOW").length,
  }));

  // Maturity radar from RAW.maturity
  const maturity = RAW.maturity || [];
  const radarData = maturity.length > 0
    ? maturity.map(m => ({ domain: (m.article || "").replace("Art.", "").replace("DORA ", "D.").replace("PSNC", "P"), score: Math.round(((m.current || 1) / 5) * 100) }))
    : [{ domain: "No Data", score: 0 }];

  const lineData = [
    { id: "Open",     color: T.criminal, data: [{ x: "Baseline", y: gaps.length }, { x: "Q2 est.", y: Math.round(gaps.length * 0.7) }, { x: "Q3 est.", y: Math.round(gaps.length * 0.45) }, { x: "Q4 est.", y: Math.round(gaps.length * 0.18) }] },
    { id: "Resolved", color: T.low,      data: [{ x: "Baseline", y: 0 }, { x: "Q2 est.", y: Math.round(gaps.length * 0.3) }, { x: "Q3 est.", y: Math.round(gaps.length * 0.55) }, { x: "Q4 est.", y: Math.round(gaps.length * 0.82) }] },
  ];

  return (
    <div>
      <AlertBar type="critical" title="LIVE DATA — Connected to SharePoint via Power Automate. Dashboard refreshes every 15 minutes." text="All gap, risk, asset, incident and policy data is sourced live from your SharePoint lists." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Critical Gaps"    value={critical}                    sub="Immediate action"      color={T.criminal} pulse />
        <KPI label="High Gaps"        value={high}                        sub="Priority remediation"  color={T.high} />
        <KPI label="Total Gaps"       value={gaps.length}                 sub="All domains"           color={T.accent} />
        <KPI label="Critical Risks"   value={critRisks}                   sub="Residual risk"         color={T.criminal} pulse />
        <KPI label="Medium Gaps"      value={medium}                      sub="Scheduled action"      color={T.medium} />
        <KPI label="Low Gaps"         value={low}                         sub="Monitor"               color={T.low} />
        <KPI label="Budget Allocated" value={fmt(totalBudget)}            sub={`${openActions} open / ${inProgress} in progress`} color={T.accent} />
        <KPI label="Training"         value={`${trainingPct}%`}           sub={`${trainingDone}/${trainingTotal} complete`} color={trainingPct < 20 ? T.criminal : T.medium} pulse={trainingPct === 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 12, marginBottom: 12 }}>
        <Card title="Gap Severity">
          <div style={{ height: 200 }}>
            <ResponsivePie
              data={pieSeverity}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.62} padAngle={2} cornerRadius={3}
              colors={({ data }) => data.color} borderWidth={0} theme={NT}
              enableArcLinkLabels={false} arcLabelsTextColor="#fff" arcLabelsSkipAngle={15}
              onClick={d => setFilter({ key: "level", val: d.id })}
              layers={["arcs", "arcLabels", ({ centerX, centerY }) => (
                <g>
                  <text x={centerX} y={centerY - 10} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: T.text, fontFamily: "'IBM Plex Mono', monospace" }}>{gaps.length}</text>
                  <text x={centerX} y={centerY + 10} textAnchor="middle" style={{ fontSize: 10, fill: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>gaps</text>
                </g>
              )]}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {pieSeverity.map(d => (
              <div key={d.id} onClick={() => setFilter({ key: "level", val: d.id })}
                style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", padding: "3px 6px", borderRadius: 3 }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 11, color: d.color, fontFamily: "'IBM Plex Mono', monospace" }}>■ {d.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono', monospace" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gaps by Domain × Severity">
          <div style={{ height: 240 }}>
            <ResponsiveBar
              data={domainBar} keys={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} indexBy="domain"
              margin={{ top: 10, right: 100, bottom: 30, left: 30 }} padding={0.3}
              colors={[T.criminal, T.high, T.medium, T.low]} theme={NT} stacked={true} borderRadius={2}
              axisBottom={{ tickSize: 0, tickPadding: 8 }} axisLeft={{ tickSize: 0, tickPadding: 8 }}
              enableLabel={false}
              legends={[{ dataFrom: "keys", anchor: "bottom-right", direction: "column", translateX: 100, itemWidth: 90, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10, symbolShape: "square" }]}
              onClick={d => setFilter({ key: "domain", val: d.indexValue })}
              tooltip={({ id, value, indexValue }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: levelColor(id, T) }}>{id}</strong> in {indexValue}: <strong>{value}</strong>
                </div>
              )}
            />
          </div>
        </Card>

        <Card title="Compliance Radar">
          <div style={{ height: 240 }}>
            <ResponsiveRadar
              data={radarData} keys={["score"]} indexBy="domain" maxValue={100}
              margin={{ top: 48, right: 90, bottom: 48, left: 90 }}
              curve="linearClosed" borderWidth={2} borderColor={T.accent}
              gridLevels={4} gridShape="circular" gridLabelOffset={16}
              enableDots={true} dotSize={6} dotColor={T.accent}
              colors={[T.accent]} fillOpacity={0.12} animate={true}
              theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
              gridLabel={({ id, anchor }) => (
                <text textAnchor={anchor} dominantBaseline="central" style={{ fontSize: 9, fill: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{id}</text>
              )}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Card title="Remediation Trajectory (Forecast)">
          <div style={{ height: 180 }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 10, right: 80, bottom: 40, left: 40 }}
              xScale={{ type: "point" }} yScale={{ type: "linear", min: 0, max: Math.max(gaps.length + 5, 10) }}
              curve="monotoneX" axisBottom={{ tickSize: 0, tickPadding: 8 }} axisLeft={{ tickSize: 0, tickPadding: 8 }}
              colors={d => d.color} lineWidth={2} enablePoints={true} pointSize={6}
              pointColor={({ serieColor }) => serieColor} enableArea={true} areaOpacity={0.08} theme={NT}
              legends={[{ anchor: "bottom-right", direction: "column", translateX: 80, itemWidth: 70, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10, symbolShape: "circle" }]}
              tooltip={({ point }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: point.serieColor }}>{point.serieId}</strong>: {point.data.y} gaps
                </div>
              )}
            />
          </div>
        </Card>

        <Card title="Training Completion">
          <div style={{ height: 160 }}>
            <ResponsiveWaffle
              data={[
                { id: "Completed",   label: "Completed",   value: trainingDone,                 color: T.low },
                { id: "Not Started", label: "Not Started", value: trainingTotal - trainingDone,  color: T._mode === "dark" ? `${T.criminal}50` : `${T.criminal}35` },
              ]}
              total={Math.max(trainingTotal, 1)} rows={3} columns={Math.max(Math.ceil(trainingTotal / 3), 5)}
              padding={2} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              colors={d => d.color} borderRadius={2} fillDirection="left" theme={NT}
            />
          </div>
          <div style={{ fontSize: 11, color: trainingPct < 20 ? T.criminal : T.medium, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            {trainingDone}/{trainingTotal} — {trainingPct}% complete
          </div>
        </Card>

        <Card title="Programme Status">
          <StatRow label="Critical open"       value={critical}                                     color={T.criminal} />
          <StatRow label="In progress"         value={inProgress}                                   color={T.accent} />
          <StatRow label="Risks total"         value={risks.length} />
          <StatRow label="Evidence missing"    value={evidence.filter(e => e.status === "REQUIRED").length}        color={T.high} />
          <StatRow label="Criminal risk items" value={evidence.filter(e => e.status === "CRIMINAL RISK").length}   color={T.criminal} />
          <StatRow label="Budget allocated"    value={fmt(totalBudget)}                             color={T.accent} />
        </Card>
      </div>
    </div>
  );
};

// ── Gap Register ──
const GapsView = ({ RAW, filter, setFilter }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const gaps = RAW.gaps || [];
  const [sevFilter,   setSevFilter]   = useState(filter?.key === "level"  ? filter.val : "");
  const [domFilter,   setDomFilter]   = useState(filter?.key === "domain" ? filter.val : "");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [search,      setSearch]      = useState("");
  const [modal,       setModal]       = useState(null);

  const owners = useMemo(() => [...new Set(gaps.map(g => g.owner).filter(Boolean))].slice(0, 14), [gaps]);
  const domains = useMemo(() => [...new Set(gaps.map(g => g.domain).filter(Boolean))], [gaps]);

  const filtered = useMemo(() => gaps.filter(g => {
    if (sevFilter && normalizeLevel(g.level) !== sevFilter) return false;
    if (domFilter && g.domain !== domFilter) return false;
    if (ownerFilter && g.owner !== ownerFilter) return false;
    if (search) {
      const hay = (g.id + g.requirement + g.state + g.owner + g.ref).toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [sevFilter, domFilter, ownerFilter, search, gaps]);

  const ownerData = useMemo(() => {
    const map = {};
    filtered.forEach(g => {
      const o = g.owner || "Unknown";
      if (!map[o]) map[o] = { owner: o, CRITICAL: 0, HIGH: 0, MEDIUM: 0 };
      const l = normalizeLevel(g.level);
      if (l === "CRITICAL") map[o].CRITICAL++;
      else if (l === "HIGH") map[o].HIGH++;
      else if (l === "MEDIUM") map[o].MEDIUM++;
    });
    return Object.values(map).sort((a, b) => (b.CRITICAL + b.HIGH) - (a.CRITICAL + a.HIGH)).slice(0, 8);
  }, [filtered]);

  const domainPie = useMemo(() => domains.map((d, i) => ({
    id: d.length > 16 ? d.substring(0, 15) + "…" : d,
    label: d,
    value: gaps.filter(g => g.domain === d).length,
    color: [T.criminal, T.accent, T.medium, T.high, T.low, T.muted][i % 6],
  })), [domains, gaps, T]);

  const columns = [
    { key: "id",          label: "ID",          width: 100, render: v => <span style={{ color: T.accent, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "domain",      label: "Domain",      width: 130, render: v => <Badge label={v ? (v.length > 16 ? v.substring(0, 15) + "…" : v) : "—"} color={T.dimmed} /> },
    { key: "ref",         label: "NIS2 Ref",    width: 90 },
    { key: "requirement", label: "Requirement", width: 280, wrap: true },
    { key: "state",       label: "Current State", width: 200, wrap: true, render: v => <span style={{ color: T.high }}>{v}</span> },
    { key: "level",       label: "Severity",    width: 110, render: v => <LevelBadge level={v} /> },
    { key: "target",      label: "Target",      width: 90 },
    { key: "owner",       label: "Owner",       width: 130 },
  ];

  const Sel = ({ val, onChange, options, placeholder }) => (
    <select value={val} onChange={e => onChange(e.target.value)} style={{ background: T.surface2, border: `1px solid ${T.border}`, color: val ? T.text : T.muted, padding: "6px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", outline: "none" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div>
      <Modal data={modal} onClose={() => setModal(null)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Filtered Gaps" value={filtered.length}                                                   color={T.accent} />
        <KPI label="Critical"      value={filtered.filter(g => normalizeLevel(g.level) === "CRITICAL").length} color={T.criminal} />
        <KPI label="High"          value={filtered.filter(g => normalizeLevel(g.level) === "HIGH").length}    color={T.high} />
        <KPI label="Open Actions"  value={filtered.filter(g => (g.status || "").includes("OPEN")).length}     color={T.high} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Owner Burden (Critical + High)">
          <div style={{ height: 200 }}>
            <ResponsiveBar
              data={ownerData} keys={["CRITICAL", "HIGH", "MEDIUM"]} indexBy="owner"
              layout="horizontal" margin={{ top: 5, right: 70, bottom: 20, left: 145 }} padding={0.3}
              colors={[T.criminal, T.high, T.medium]} theme={NT} borderRadius={2}
              axisLeft={{ tickSize: 0, tickPadding: 8, format: v => v.length > 17 ? v.substring(0, 16) + "…" : v }}
              axisBottom={{ tickSize: 0, tickPadding: 6 }} enableLabel={false}
              legends={[{ dataFrom: "keys", anchor: "bottom-right", direction: "column", translateX: 70, itemWidth: 65, itemHeight: 16, itemTextColor: T.muted, symbolSize: 10 }]}
              onClick={d => setOwnerFilter(d.indexValue === ownerFilter ? "" : d.indexValue)}
              tooltip={({ id, value, indexValue }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: levelColor(id, T) }}>{id}</strong>: {value} — {indexValue}
                </div>
              )}
            />
          </div>
        </Card>
        <Card title="Domain Coverage">
          <div style={{ height: 200 }}>
            <ResponsivePie
              data={domainPie}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.55} padAngle={2} cornerRadius={3}
              colors={({ data }) => data.color} theme={NT}
              enableArcLinkLabels={true} arcLinkLabelsTextColor={T.muted}
              arcLinkLabelsThickness={1} arcLinkLabelsColor={T.border}
              arcLabelsSkipAngle={20} arcLabelsTextColor="#fff"
              onClick={d => setDomFilter(d.label === domFilter ? "" : d.label)}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <Sel val={sevFilter}   onChange={setSevFilter}   options={["CRITICAL", "HIGH", "MEDIUM", "LOW"]}   placeholder="All Severities" />
        <Sel val={domFilter}   onChange={setDomFilter}   options={domains}                                  placeholder="All Domains" />
        <Sel val={ownerFilter} onChange={setOwnerFilter} options={owners}                                   placeholder="All Owners" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: "6px 12px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", outline: "none", minWidth: 200 }} />
        {(sevFilter || domFilter || ownerFilter || search) && (
          <button onClick={() => { setSevFilter(""); setDomFilter(""); setOwnerFilter(""); setSearch(""); }}
            style={{ background: T.critLo, border: `1px solid ${T.criminal}30`, color: T.criminal, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            ✕ Clear
          </button>
        )}
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>{filtered.length} / {gaps.length} rows</span>
      </div>
      <DataTable columns={columns} rows={filtered} onRowClick={row => setModal({ type: "gap", row })} maxHeight={480} />
    </div>
  );
};

// ── Risk Register ──
const RisksView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const risks = RAW.risks || [];
  const [modal,  setModal]  = useState(null);
  const [filter, setFilter] = useState("");

  const filtered = risks.filter(r => !filter || r.residual === filter);

  const scatterData = useMemo(() => {
    const levels = [...new Set(risks.map(r => r.residual))];
    return levels.map(level => ({
      id: level,
      color: residualColor(level, T),
      data: risks.filter(r => r.residual === level).map(r => ({ x: r.i, y: r.l, risk: r })),
    }));
  }, [risks, T]);

  const heatData = useMemo(() => Array.from({ length: 5 }, (_, yi) => {
    const l = 5 - yi;
    return {
      id: `L${l}`,
      data: Array.from({ length: 5 }, (_, xi) => {
        const i = xi + 1;
        const count = risks.filter(r => r.l === l && r.i === i).length;
        return { x: `I${i}`, y: count };
      }),
    };
  }), [risks]);

  const topRisks = useMemo(() => [...risks].sort((a, b) => b.inherent - a.inherent).slice(0, 6), [risks]);
  const maxInherent = risks.length > 0 ? Math.max(...risks.map(r => r.inherent || 0)) : 25;

  const residualCounts = useMemo(() => {
    const map = {};
    risks.forEach(r => { map[r.residual] = (map[r.residual] || 0) + 1; });
    return map;
  }, [risks]);

  const columns = [
    { key: "id",           label: "ID",         width: 90,  render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "desc",         label: "Description",width: 260, wrap: true },
    { key: "ttp",          label: "TTP",         width: 90,  render: v => <Badge label={v} color={T.medium} /> },
    { key: "l",            label: "L",           width: 40,  render: v => <span style={{ color: T.high, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "i",            label: "I",           width: 40,  render: v => <span style={{ color: T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "inherent",     label: "Inherent",    width: 70,  render: v => <span style={{ color: scoreColor(v, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/25</span> },
    { key: "residual",     label: "Residual",    width: 100, render: v => <LevelBadge level={v} /> },
    { key: "postTreatment",label: "Post-Treat",  width: 80,  render: v => <span style={{ color: scoreColor(v, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/25</span> },
    { key: "owner",        label: "Owner",       width: 140 },
    { key: "review",       label: "Review",      width: 110 },
  ];

  return (
    <div>
      <Modal data={modal} onClose={() => setModal(null)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Risks"       value={risks.length}                                                          color={T.accent} />
        <KPI label="CRITICAL"          value={risks.filter(r => (r.residual || "").toUpperCase() === "CRITICAL").length} color={T.criminal} pulse />
        <KPI label="HIGH"              value={risks.filter(r => r.residual === "High").length}                       color={T.high} />
        <KPI label="Max Inherent"      value={`${maxInherent}/25`}                                                   color={T.criminal} sub="Highest inherent score" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Risk Matrix — Likelihood × Impact">
          <div style={{ height: 320 }}>
            <ResponsiveScatterPlot
              data={scatterData}
              margin={{ top: 20, right: 100, bottom: 50, left: 55 }}
              xScale={{ type: "linear", min: 0.5, max: 5.5 }} yScale={{ type: "linear", min: 0.5, max: 5.5 }}
              axisBottom={{ legend: "Impact →", legendOffset: 40, legendPosition: "middle", tickValues: [1,2,3,4,5], tickSize: 0 }}
              axisLeft={{ legend: "← Likelihood", legendOffset: -45, legendPosition: "middle", tickValues: [1,2,3,4,5], tickSize: 0 }}
              colors={d => d.serieColor} nodeSize={22} theme={NT}
              legends={[{ anchor: "bottom-right", direction: "column", translateX: 96, itemWidth: 88, itemHeight: 20, itemTextColor: T.muted, symbolSize: 12 }]}
              onClick={({ data }) => data.risk && setModal({ type: "risk", row: data.risk })}
              tooltip={({ node }) => node.data.risk ? (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: node.color }}>{node.data.risk.id}</strong><br />
                  <span style={{ color: T.muted }}>{(node.data.risk.desc || "").substring(0, 50)}…</span><br />
                  Score: <strong>{node.data.risk.inherent}</strong>
                </div>
              ) : null}
              layers={[
                ({ innerWidth, innerHeight }) => {
                  const qW = innerWidth / 2, qH = innerHeight / 2;
                  return (
                    <g>
                      <rect x={0} y={0} width={qW} height={qH} fill={`${T.low}08`} />
                      <rect x={qW} y={0} width={qW} height={qH} fill={`${T.high}12`} />
                      <rect x={0} y={qH} width={qW} height={qH} fill={`${T.medium}08`} />
                      <rect x={qW} y={qH} width={qW} height={qH} fill={`${T.criminal}15`} />
                      <text x={qW + 10} y={qH + 20} style={{ fontSize: 9, fill: `${T.criminal}60`, fontFamily: "'IBM Plex Mono', monospace" }}>HIGH RISK</text>
                      <text x={5} y={qH - 5} style={{ fontSize: 9, fill: `${T.low}60`, fontFamily: "'IBM Plex Mono', monospace" }}>LOW RISK</text>
                    </g>
                  );
                },
                "grid", "axes", "nodes", "markers", "mesh", "legends", "annotations"
              ]}
              renderNode={({ node }) => {
                const r = node.data.risk;
                if (!r) return null;
                return (
                  <g transform={`translate(${node.x},${node.y})`} style={{ cursor: "pointer" }} onClick={() => setModal({ type: "risk", row: r })}>
                    <circle r={11} fill={node.color} fillOpacity={0.9} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                    <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: 7, fill: "#fff", fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", pointerEvents: "none" }}>
                      {(r.id || "").replace(/\D/g, "").slice(-3)}
                    </text>
                  </g>
                );
              }}
            />
          </div>
        </Card>

        <Card title="Risk Count Heatmap">
          <div style={{ height: 320 }}>
            <ResponsiveHeatMap
              data={heatData}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              valueFormat=">-.0s"
              axisTop={null}
              axisBottom={{ tickSize: 0, legend: "Impact →", legendOffset: 35, legendPosition: "middle" }}
              axisLeft={{ tickSize: 0, legend: "← Likelihood", legendOffset: -35, legendPosition: "middle" }}
              colors={{ type: "sequential", scheme: "reds", minValue: 0, maxValue: Math.max(3, risks.length / 5) }}
              emptyColor={T.surface2} borderRadius={3} borderWidth={1} borderColor={T.bg} theme={NT}
              label={({ value }) => value > 0 ? value : ""} labelTextColor="#fff"
              tooltip={({ cell }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  {cell.serieId} × {cell.data.x}: <strong>{cell.value} risk{cell.value !== 1 ? "s" : ""}</strong>
                </div>
              )}
            />
          </div>
        </Card>
      </div>

      {topRisks.length > 0 && (
        <Card title="Top Risks — Inherent vs Post-Treatment Score" style={{ marginBottom: 12 }}>
          <div style={{ height: 220 }}>
            <ResponsiveBullet
              data={topRisks.map(r => ({
                id: r.id,
                ranges: [r.postTreatment, (r.inherent + r.postTreatment) / 2, 25],
                measures: [r.inherent],
                markers: [r.postTreatment],
              }))}
              margin={{ top: 10, right: 40, bottom: 20, left: 90 }}
              spacing={24} titleAlign="end" titleOffsetX={-16} measureSize={0.6} markerSize={1}
              rangeColors={[`${T.low}25`, `${T.medium}25`, `${T.high}25`]}
              measureColors={[T.accent]} markerColors={[T.low]}
              theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            <span style={{ color: T.accent }}>■ Inherent score</span>
            <span style={{ color: T.low }}>| Post-treatment target</span>
            <span style={{ color: T.criminal }}>■ High zone (≥16)</span>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", ...Object.keys(residualCounts)].map(v => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ background: filter === v ? T.accentLo : T.surface2, border: `1px solid ${filter === v ? T.accent : T.border}`, color: filter === v ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            {v || "All"} {v ? `(${residualCounts[v]})` : ""}
          </button>
        ))}
      </div>
      <DataTable columns={columns} rows={filtered} onRowClick={row => setModal({ type: "risk", row })} maxHeight={400} />
    </div>
  );
};

// ── Assets & Supply Chain ──
const AssetsView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const assets = RAW.assets || [];
  const [typeF, setTypeF] = useState("");
  const [critF, setCritF] = useState("");

  const filtered = assets.filter(a => {
    if (typeF && a.type !== typeF) return false;
    if (critF && a.criticality !== critF) return false;
    return true;
  });

  const treeData = useMemo(() => {
    const cGroups = {};
    assets.forEach(a => {
      const c = a.criticality || "Unknown";
      if (!cGroups[c]) cGroups[c] = [];
      cGroups[c].push({ name: (a.name || "").substring(0, 20), id: a.id, size: (a.risk || 1) * 10 + 5, criticality: c, cvcn: a.cvcn });
    });
    return { name: "Assets", children: Object.entries(cGroups).map(([c, items]) => ({ name: c, children: items })) };
  }, [assets]);

  const crit      = assets.filter(a => a.criticality === "Critical").length;
  const cvcnIssues = assets.filter(a => (a.cvcn || "").includes("Pending") || (a.cvcn || "").includes("Not Started")).length;
  const psnc      = assets.filter(a => a.psnc).length;
  const drIssues  = assets.filter(a => (a.drTested || "").includes("⚠")).length;

  const types      = [...new Set(assets.map(a => a.type).filter(Boolean))];
  const criticalities = [...new Set(assets.map(a => a.criticality).filter(Boolean))];

  const typeBar = types.map(t => {
    const subset = assets.filter(a => a.type === t);
    return {
      type: t,
      Critical:  subset.filter(a => a.criticality === "Critical").length,
      Important: subset.filter(a => a.criticality === "Important").length,
      Ordinary:  subset.filter(a => a.criticality === "Ordinary").length,
    };
  });

  const columns = [
    { key: "id",          label: "ID",          width: 90,  render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "type",        label: "Type",         width: 70,  render: v => <Badge label={v} color={T.dimmed} /> },
    { key: "name",        label: "Name",         width: 200, wrap: true },
    { key: "criticality", label: "NIS2 Class",   width: 100, render: v => <LevelBadge level={v === "Critical" ? "CRITICAL" : v === "Important" ? "MEDIUM" : "LOW"} /> },
    { key: "psnc",        label: "PSNC",         width: 60,  render: v => v ? <Badge label="Yes" color={T.high} /> : <span style={{ color: T.muted }}>—</span> },
    { key: "cvcn",        label: "CVCN Status",  width: 170, render: v => <span style={{ color: (v?.includes("Pending") || v?.includes("Not Started")) ? T.criminal : v?.includes("Approved") ? T.low : T.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{v}</span> },
    { key: "dora",        label: "DORA Tier",    width: 100 },
    { key: "drTested",    label: "DR Tested",    width: 200, wrap: true, render: v => <span style={{ color: (v || "").includes("✅") ? T.low : (v || "").includes("⚠") ? T.medium : T.muted }}>{v}</span> },
    { key: "risk",        label: "Risk",         width: 60,  render: v => <span style={{ color: scoreColor((v || 0) * 4, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/5</span> },
  ];

  return (
    <div>
      {cvcnIssues > 0 && (
        <AlertBar type="critical" title={`${cvcnIssues} asset(s) with CVCN PENDING / NOT STARTED — PSNC criminal prosecution risk. Daily ACN escalation required.`} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Records"       value={assets.length}  color={T.accent} />
        <KPI label="Critical Assets"     value={crit}           color={T.criminal} />
        <KPI label="PSNC Strategic"      value={psnc}           color={T.high} />
        <KPI label="CVCN Issues"         value={cvcnIssues}     color={T.criminal} pulse />
        <KPI label="DR Not Documented"   value={drIssues}       color={T.medium} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Asset Inventory Treemap" style={{ gridColumn: "span 2" }}>
          <div style={{ height: 280 }}>
            <ResponsiveTreeMap
              data={treeData} identity="name" value="size"
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              labelSkipSize={18} label={({ data }) => data.id || data.name}
              labelTextColor="#FFFFFF" parentLabelTextColor="rgba(255,255,255,0.8)"
              parentLabelSize={11}
              colors={({ data }) => {
                if ((data.cvcn || "").includes("Pending") || (data.cvcn || "").includes("Not Started")) return T.criminal;
                if (data.criticality === "Critical") return `${T.high}99`;
                if (data.criticality === "Important") return `${T.medium}70`;
                return `${T.low}50`;
              }}
              borderColor={T.bg} borderWidth={2} theme={NT}
              tooltip={({ node }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: T.text }}>{node.data.id || node.data.name}</strong><br />
                  <span style={{ color: T.muted }}>Criticality: {node.data.criticality}</span><br />
                  <span style={{ color: T.muted }}>CVCN: {node.data.cvcn || "—"}</span>
                </div>
              )}
            />
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card title="Type × Criticality">
            <div style={{ height: 170 }}>
              <ResponsiveBar
                data={typeBar} keys={["Critical", "Important", "Ordinary"]} indexBy="type"
                margin={{ top: 8, right: 84, bottom: 28, left: 28 }} padding={0.3}
                colors={[T.criminal, T.medium, T.low]} theme={NT} borderRadius={3}
                axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4 }}
                axisBottom={{ tickSize: 0, tickPadding: 6 }}
                enableLabel={true} labelTextColor="#fff" labelSkipHeight={14}
                legends={[{ dataFrom: "keys", anchor: "bottom-right", direction: "column", translateX: 84, itemWidth: 80, itemHeight: 16, itemTextColor: T.muted, symbolSize: 9, symbolShape: "square" }]}
              />
            </div>
          </Card>
          <Card title="CVCN Breakdown">
            <div style={{ height: 120 }}>
              <ResponsivePie
                data={[
                  { id: "Approved",    label: "Approved",    value: assets.filter(a => (a.cvcn || "") === "Approved").length,                                               color: T.low },
                  { id: "Pending",     label: "Pending",     value: assets.filter(a => (a.cvcn || "").includes("Pending") || (a.cvcn || "").includes("Not Started")).length, color: T.criminal },
                  { id: "N/A",         label: "N/A",         value: assets.filter(a => (a.cvcn || "") === "N/A").length,                                                     color: T.dimmed },
                ].filter(d => d.value > 0)}
                margin={{ top: 6, right: 80, bottom: 6, left: 6 }}
                innerRadius={0.58} padAngle={3} cornerRadius={2}
                colors={({ data }) => data.color} theme={NT}
                enableArcLinkLabels={false} arcLabelsSkipAngle={20} arcLabelsTextColor="#fff"
                legends={[{ anchor: "right", direction: "column", translateX: 78, itemWidth: 72, itemHeight: 16, itemTextColor: T.muted, symbolSize: 9 }]}
              />
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", ...types].map(v => (
          <button key={v} onClick={() => setTypeF(v)}
            style={{ background: typeF === v ? T.accentLo : T.surface2, border: `1px solid ${typeF === v ? T.accent : T.border}`, color: typeF === v ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            {v || "All Types"}
          </button>
        ))}
        {["", ...criticalities].map(v => (
          <button key={v} onClick={() => setCritF(v)}
            style={{ background: critF === v ? T.accentLo : T.surface2, border: `1px solid ${critF === v ? T.accent : T.border}`, color: critF === v ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            {v || "All Criticality"}
          </button>
        ))}
      </div>
      <DataTable columns={columns} rows={filtered} maxHeight={400} />
    </div>
  );
};

// ── Programme (Budget + Training + Evidence) ──
const ProgrammeView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const budget   = RAW.budget   || [];
  const evidence = RAW.evidence || [];
  const training = RAW.training || [];
  const [tab, setTab] = useState("budget");

  const totalBudget = budget.reduce((a, b) => a + (b.allocated || 0), 0);
  const spent       = budget.reduce((a, b) => a + (b.spent || 0), 0);
  const openActs    = budget.filter(b => b.status === "OPEN").length;
  const inProg      = budget.filter(b => b.status === "In Progress").length;
  const reqEv       = evidence.filter(e => e.status === "REQUIRED").length;
  const crimEv      = evidence.filter(e => e.status === "CRIMINAL RISK").length;
  const pctSpent    = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

  const trainDone  = training.filter(t => (t.status || "").toLowerCase().includes("complete")).length;
  const trainCats  = [...new Set(training.map(t => t.category).filter(Boolean))];
  const trainCatColors = [T.criminal, T.high, T.medium, T.accent, T.low];

  const waffleData = trainCats.map((cat, i) => ({
    id: cat, label: cat,
    value: training.filter(t => t.category === cat).length,
    color: `${trainCatColors[i % trainCatColors.length]}50`,
  }));

  const budgetBar = [...budget]
    .filter(b => (b.allocated || 0) > 0)
    .sort((a, b) => b.allocated - a.allocated)
    .slice(0, 12)
    .map(b => ({ id: b.id, action: (b.action || "").substring(0, 35), allocated: b.allocated, spent: b.spent || 0 }));

  const evPie = [
    { id: "REQUIRED",      label: "REQUIRED",      value: reqEv,  color: T.high },
    { id: "CRIMINAL RISK", label: "CRIMINAL RISK",  value: crimEv, color: T.criminal },
    { id: "RECOMMENDED",   label: "RECOMMENDED",    value: evidence.filter(e => e.status === "RECOMMENDED").length, color: T.medium },
  ].filter(d => d.value > 0);

  const budgetCols = [
    { key: "id",        label: "ID",         width: 90,  render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "action",    label: "Action",     width: 300, wrap: true },
    { key: "owner",     label: "Owner",      width: 130 },
    { key: "allocated", label: "Allocated",  width: 100, render: v => <span style={{ fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(v)}</span> },
    { key: "spent",     label: "Spent",      width: 80,  render: v => <span style={{ color: T.low, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(v)}</span> },
    { key: "status",    label: "Status",     width: 110, render: v => <Badge label={v} color={v === "In Progress" ? T.accent : T.high} /> },
  ];
  const evCols = [
    { key: "id",      label: "ID",          width: 90,  render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "desc",    label: "Description", width: 300, wrap: true },
    { key: "related", label: "Related",     width: 140, render: v => <span style={{ color: T.accent, fontSize: 10 }}>{v}</span> },
    { key: "ref",     label: "NIS2 Ref",    width: 100 },
    { key: "status",  label: "Status",      width: 130, render: v => <Badge label={v} color={v === "CRIMINAL RISK" ? T.criminal : v === "REQUIRED" ? T.high : T.medium} /> },
  ];
  const trainCols = [
    { key: "name",     label: "Name",          width: 130 },
    { key: "role",     label: "Role",          width: 200 },
    { key: "category", label: "Category",      width: 130, render: v => <Badge label={v} color={v === "Board" ? T.criminal : v?.includes("C-Suite") ? T.high : T.accent} /> },
    { key: "type",     label: "Training Type", width: 280, wrap: true },
    { key: "status",   label: "Status",        width: 120, render: v => <Badge label={v || "Not Started"} color={(v || "").toLowerCase().includes("complete") ? T.low : T.criminal} /> },
    { key: "due",      label: "Deadline",      width: 90,  render: v => <span style={{ color: T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Budget"         value={fmt(totalBudget)} color={T.accent}   sub="Programme total" />
        <KPI label="Spent"                value={fmt(spent)}       color={T.low}      sub={`${pctSpent}% utilised`} />
        <KPI label="Open Actions"         value={openActs}         color={T.high} />
        <KPI label="In Progress"          value={inProg}           color={T.accent} />
        <KPI label="Evidence Required"    value={reqEv}            color={T.high} />
        <KPI label="Criminal Risk Items"  value={crimEv}           color={T.criminal} pulse />
      </div>

      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
        {[["budget","💶 Budget"], ["training","🎓 Training"], ["evidence","📁 Evidence"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "9px 18px", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? T.accent : "transparent"}`, color: tab === t ? T.text : T.muted, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "budget" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Card title="Budget Allocation (Top 12)">
              <div style={{ height: 320 }}>
                <ResponsiveBar
                  data={budgetBar} keys={["allocated", "spent"]} indexBy="id"
                  layout="horizontal" margin={{ top: 5, right: 20, bottom: 52, left: 80 }} padding={0.3}
                  colors={[T.accent, T.low]} theme={NT} borderRadius={2}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  axisBottom={{ tickSize: 0, tickPadding: 6, format: v => `€${(v/1000).toFixed(0)}k` }}
                  enableLabel={false}
                  legends={[{ dataFrom: "keys", anchor: "bottom", direction: "row", translateY: 48, itemWidth: 100, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                  tooltip={({ id, value, indexValue }) => (
                    <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                      <strong style={{ color: id === "allocated" ? T.accent : T.low }}>{id}</strong>: {fmt(value)}<br />
                      <span style={{ color: T.muted }}>{indexValue}</span>
                    </div>
                  )}
                />
              </div>
            </Card>
            <Card title="Action Status">
              <div style={{ height: 200 }}>
                <ResponsivePie
                  data={[
                    { id: "OPEN",        label: "OPEN",        value: openActs, color: T.high },
                    { id: "In Progress", label: "In Progress", value: inProg,   color: T.accent },
                  ].filter(d => d.value > 0)}
                  margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
                  innerRadius={0.6} padAngle={3} cornerRadius={3}
                  colors={({ data }) => data.color} theme={NT}
                  enableArcLinkLabels={false} arcLabelsSkipAngle={10} arcLabelsTextColor="#fff"
                  legends={[{ anchor: "bottom", direction: "row", translateY: 48, itemWidth: 90, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                />
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <StatRow label="Total allocated"    value={fmt(totalBudget)}              color={T.accent} />
              <StatRow label="Total spent"        value={fmt(spent)}                    color={T.low} />
              <StatRow label="Zero-cost actions"  value={budget.filter(b => (b.allocated || 0) === 0).length} />
            </Card>
          </div>
          <DataTable columns={budgetCols} rows={budget} maxHeight={360} />
        </div>
      )}

      {tab === "training" && (
        <div>
          {trainDone === 0 && (
            <AlertBar type="critical" title={`ALL ${training.length} TRAINING RECORDS NOT STARTED — Personal liability risk (NIS2 Art.20)`} text="Board training must be completed before enforcement date. Target: 100% board, >95% all staff." />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Card title="Completion by Category">
              {waffleData.length > 0 ? (
                <div style={{ height: 200 }}>
                  <ResponsiveWaffle
                    data={waffleData} total={Math.max(training.length, 1)} rows={3}
                    columns={Math.max(Math.ceil(training.length / 3), 5)} padding={3}
                    margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                    colors={d => d.color} borderRadius={3} fillDirection="left" theme={NT}
                    legends={[{ anchor: "bottom", direction: "row", translateY: 28, itemWidth: 130, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                  />
                </div>
              ) : <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>No training data</div>}
              <div style={{ textAlign: "center", fontSize: 12, color: T.criminal, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>{trainDone} / {training.length} completed</div>
            </Card>
            <Card title="Deadline Summary">
              {[...new Set(training.map(t => t.due).filter(Boolean))].map(d => (
                <StatRow key={d} label={d} value={`${training.filter(t => t.due === d).length} staff`} color={T.high} />
              ))}
              <Divider style={{ margin: "10px 0" }} />
              <StatRow label="Total staff tracked" value={training.length} />
              <StatRow label="Completed"           value={trainDone}      color={T.low} />
              <StatRow label="Remaining"           value={training.length - trainDone} color={T.criminal} />
            </Card>
          </div>
          <DataTable columns={trainCols} rows={training} maxHeight={360} />
        </div>
      )}

      {tab === "evidence" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Card title="Evidence Status">
              <div style={{ height: 200 }}>
                <ResponsivePie
                  data={evPie}
                  margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
                  innerRadius={0.6} padAngle={3} cornerRadius={3}
                  colors={({ data }) => data.color} theme={NT}
                  enableArcLinkLabels={false} arcLabelsSkipAngle={10} arcLabelsTextColor="#fff"
                  legends={[{ anchor: "bottom", direction: "row", translateY: 48, itemWidth: 110, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                />
              </div>
            </Card>
            <Card title="Evidence Registry">
              <StatRow label="Total items"       value={evidence.length}   color={T.accent} />
              <StatRow label="REQUIRED"          value={reqEv}             color={T.high} />
              <StatRow label="CRIMINAL RISK"     value={crimEv}            color={T.criminal} />
              <StatRow label="RECOMMENDED"       value={evidence.filter(e => e.status === "RECOMMENDED").length} color={T.medium} />
              <Divider style={{ margin: "10px 0" }} />
              <StatRow label="ACN audit readiness" value={reqEv === 0 && crimEv === 0 ? "READY" : "NOT READY"} color={reqEv === 0 && crimEv === 0 ? T.low : T.criminal} />
            </Card>
          </div>
          <DataTable columns={evCols} rows={evidence} maxHeight={400} />
        </div>
      )}
    </div>
  );
};

// ── Maturity Tracker ──
const MaturityView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const maturity = RAW.maturity || [];
  const [selected, setSelected] = useState(null);

  const priorityColor = (p, T) => {
    const u = (p || "").toUpperCase();
    if (u === "CRITICAL") return T.criminal;
    if (u === "HIGH") return T.high;
    if (u === "MEDIUM") return T.medium;
    return T.low;
  };

  const avgCurrent = maturity.length > 0
    ? (maturity.reduce((a, b) => a + (b.current || 0), 0) / maturity.length).toFixed(2)
    : "—";
  const avgTarget = maturity.length > 0
    ? (maturity.reduce((a, b) => a + (b.target || 0), 0) / maturity.length).toFixed(1)
    : "—";

  const radarData = maturity.map(m => ({
    domain: (m.article || "").replace("Art.", "").replace("DORA ", "D.").replace("PSNC", "P"),
    Current: m.current || 0,
    Target: m.target || 0,
  }));

  const gapBar = maturity.map(m => ({
    domain: (m.domain || "").length > 24 ? (m.domain || "").substring(0, 23) + "…" : (m.domain || ""),
    Current: m.current || 0,
    Gap: Math.max((m.target || 0) - (m.current || 0), 0),
  })).sort((a, b) => b.Gap - a.Gap);

  const critCount = maturity.filter(m => (m.priority || "").toUpperCase() === "CRITICAL").length;
  const highCount = maturity.filter(m => (m.priority || "").toUpperCase() === "HIGH").length;
  const needsWork = maturity.filter(m => (m.current || 0) < 3).length;

  if (maturity.length === 0) {
    return <AlertBar type="info" title="No maturity data loaded from SharePoint yet." text="Ensure the 'maturity' sheet is present in your nis2-data.json export." />;
  }

  return (
    <div>
      <AlertBar type="critical"
        title={`PROGRAMME MATURITY: ${avgCurrent}/5 avg — ${needsWork} of ${maturity.length} domains below NIS2-required minimum (3)`}
        text="Target: All domains ≥ 3 by enforcement date. Board action required for CRITICAL domains." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Avg Maturity"    value={`${avgCurrent}/5`}                                         color={T.medium}  sub="Target: 3.0 minimum" />
        <KPI label="Critical Gaps"  value={critCount}                                                  color={T.criminal} pulse sub="Maturity 1 – Initial" />
        <KPI label="High Gaps"      value={highCount}                                                  color={T.high}    sub="Significant gap" />
        <KPI label="Below Minimum"  value={needsWork}                                                  color={T.high}    sub="Score < 3" />
        <KPI label="Meeting Target" value={maturity.filter(m => (m.current || 0) >= (m.target || 0)).length} color={T.low} sub="At target maturity" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Maturity Radar — Current vs Target">
          <div style={{ height: 310 }}>
            <ResponsiveRadar
              data={radarData} keys={["Current", "Target"]} indexBy="domain" maxValue={5}
              margin={{ top: 52, right: 100, bottom: 52, left: 100 }}
              curve="linearClosed" borderWidth={2}
              borderColor={({ key }) => key === "Target" ? `${T.accent}80` : T.high}
              gridLevels={5} gridShape="circular" gridLabelOffset={16}
              enableDots={true} dotSize={6} dotColor={({ key }) => key === "Target" ? T.accent : T.high}
              colors={[T.high, T.accent]} fillOpacity={0.12}
              theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
              legends={[{ anchor: "bottom", direction: "row", translateY: 46, itemWidth: 90, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
            />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: T.muted }}>
            <span style={{ color: T.high }}>— Current (avg {avgCurrent})</span>
            <span style={{ color: T.accent }}>— Target (avg {avgTarget})</span>
          </div>
        </Card>

        <Card title="Maturity Gap by Domain">
          <div style={{ height: 320 }}>
            <ResponsiveBar
              data={gapBar} keys={["Current", "Gap"]} indexBy="domain"
              layout="horizontal" margin={{ top: 5, right: 40, bottom: 50, left: 252 }} padding={0.25}
              colors={[T.accent, T.criminal]} theme={NT} borderRadius={2}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: [0,1,2,3,4,5], legend: "Maturity Score (1–5)", legendOffset: 34, legendPosition: "middle" }}
              enableLabel={false} maxValue={5}
              tooltip={({ id, value, indexValue }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: id === "Current" ? T.accent : T.criminal }}>{id}</strong>: {value}<br />
                  <span style={{ color: T.muted, fontSize: 10 }}>{indexValue}</span>
                </div>
              )}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {maturity.map(m => (
          <div key={m.num}
            onClick={() => setSelected(selected?.num === m.num ? null : m)}
            style={{ background: selected?.num === m.num ? T.surface3 : T.surface, border: `1px solid ${selected?.num === m.num ? T.accent : T.border}`, borderLeft: `3px solid ${priorityColor(m.priority, T)}`, borderRadius: 6, padding: "10px 12px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{m.article}</span>
              <Badge label={m.priority} color={priorityColor(m.priority, T)} T={T} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, lineHeight: 1.3 }}>{m.domain}</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ flex: 1, height: 6, borderRadius: 2, background: n <= (m.current || 0) ? T.accent : n <= (m.target || 0) ? `${T.high}40` : T.surface2, border: n === (m.target || 0) ? `1px solid ${T.high}` : "none" }} />
              ))}
              <span style={{ fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginLeft: 4, whiteSpace: "nowrap" }}>{m.current}/{m.target}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Card title={`${selected.article} — ${selected.domain}`} style={{ marginTop: 12, borderLeft: `3px solid ${priorityColor(selected.priority, T)}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[["Current Maturity", `${selected.current}/5`, T.high], ["Target Maturity", `${selected.target}/5`, T.accent], ["Gap", `${Math.max((selected.target || 0) - (selected.current || 0), 0)} levels`, priorityColor(selected.priority, T)], ["Status", selected.status, T.muted]].map(([l, v, c]) => (
              <div key={l} style={{ background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
              </div>
            ))}
            <div style={{ gridColumn: "span 2", background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Current State</div>
              <div style={{ fontSize: 11, color: T.high, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{selected.state}</div>
            </div>
            <div style={{ gridColumn: "span 2", background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Key Improvement Action</div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{selected.action}</div>
            </div>
            <div style={{ background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Owner</div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: "'IBM Plex Mono', monospace" }}>{selected.owner}</div>
            </div>
            <div style={{ background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Target Date</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.criminal, fontFamily: "'IBM Plex Mono', monospace" }}>{selected.target_date}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Phased Programme ──
const PhasedView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const phases = RAW.phases || [];
  const [expandedPhase, setExpandedPhase] = useState(null);

  const phaseColor = (p, T) => ({
    low: T.low, accent: T.accent, high: T.high, criminal: T.criminal, medium: T.medium
  })[p.color_key] || T.muted;

  const overallPct = phases.length > 0
    ? Math.round(phases.reduce((a, b) => a + (b.pct || 0), 0) / phases.length)
    : 0;

  const bulletData = phases.map(p => ({
    id: p.id,
    ranges: [33, 66, 100],
    measures: [p.pct || 0],
    markers: [],
  }));

  if (phases.length === 0) {
    return <AlertBar type="info" title="No phased programme data loaded from SharePoint." text="Ensure the 'phases' sheet is in your nis2-data.json export." />;
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Overall Progress"   value={`${overallPct}%`}                                                               color={T.accent}  sub={`${phases.length}-phase programme`} />
        <KPI label="Complete"           value={phases.filter(p => (p.status || "").includes("COMPLETE")).length}               color={T.low} />
        <KPI label="In Progress"        value={phases.filter(p => (p.status || "").includes("IN PROGRESS")).length}           color={T.accent} />
        <KPI label="At Risk"            value={phases.filter(p => (p.status || "").includes("AT RISK") || (p.color_key || "") === "criminal").length} color={T.criminal} pulse />
        <KPI label="End Date"           value={phases.length > 0 ? (phases[phases.length - 1].end || "—") : "—"}              color={T.muted} />
      </div>

      <div style={{ marginBottom: 12 }}>
        {phases.map((phase, i) => {
          const c = phaseColor(phase, T);
          const expanded = expandedPhase === i;
          return (
            <div key={phase.id}
              style={{ background: T.surface, border: `1px solid ${expanded ? T.accent : T.border}`, borderLeft: `4px solid ${c}`, borderRadius: 6, marginBottom: 8, overflow: "hidden" }}>
              <div onClick={() => setExpandedPhase(expanded ? null : i)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", cursor: "pointer" }}>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono', monospace" }}>{phase.id}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 1 }}>{phase.start} – {phase.end}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>{phase.name}</div>
                  <div style={{ height: 8, background: T.surface2, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${phase.pct || 0}%`, background: c, borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ width: 60, flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono', monospace" }}>{phase.pct || 0}%</div>
                </div>
                <div style={{ width: 110, flexShrink: 0 }}>
                  <Badge label={phase.status || "UNKNOWN"} color={c} T={T} />
                </div>
                <div style={{ color: T.muted, fontSize: 12 }}>{expanded ? "▲" : "▼"}</div>
              </div>
              {expanded && (
                <div style={{ padding: "0 18px 14px", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>Key Activities</div>
                      {(phase.activities || []).map((a, ai) => (
                        <div key={ai} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                          <span style={{ color: c, fontSize: 11, flexShrink: 0 }}>▸</span>
                          <span style={{ fontSize: 11, color: T.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.4 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[["Start Date", phase.start, T.muted], ["Target End", phase.end, T.muted], ["Completion", `${phase.pct || 0}%`, c], ["Status", phase.status, c]].map(([l, v, col]) => (
                        <div key={l} style={{ background: T.surface2, borderRadius: 4, padding: "8px 12px" }}>
                          <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: col, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card title="Programme Progress — All Phases">
        <div style={{ height: Math.max(phases.length * 30 + 30, 200) }}>
          <ResponsiveBullet
            data={bulletData}
            margin={{ top: 10, right: 30, bottom: 20, left: 90 }}
            spacing={24} titleAlign="end" titleOffsetX={-16}
            measureSize={0.5} markerSize={0}
            rangeColors={[`${T.low}25`, `${T.medium}25`, `${T.high}25`]}
            measureColors={phases.map(p => phaseColor(p, T))}
            theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
          />
        </div>
      </Card>
    </div>
  );
};

// ── Policy Tracker ──
const PolicyView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const policies = RAW.policies || [];
  const [catFilter, setCatFilter] = useState("");

  const cats = useMemo(() => [...new Set(policies.map(p => p.category).filter(Boolean))], [policies]);
  const filtered = policies.filter(p => !catFilter || p.category === catFilter);

  const catColorMap = useMemo(() => {
    const palette = [T.criminal, T.high, T.medium, T.accent, T.low, T.muted];
    const map = {};
    cats.forEach((c, i) => { map[c] = palette[i % palette.length]; });
    return map;
  }, [cats, T]);

  const catPie = cats.map(c => ({
    id: c, label: c,
    value: policies.filter(p => p.category === c).length,
    color: catColorMap[c] || T.muted,
  }));

  const boardApproved = policies.filter(p => p.approved).length;
  const drafted       = policies.filter(p => p.drafted).length;
  const reviewed      = policies.filter(p => p.reviewed).length;

  const columns = [
    { key: "id",       label: "ID",               width: 90,  render: v => <span style={{ color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
    { key: "title",    label: "Policy / Document", width: 300, wrap: true },
    { key: "ref",      label: "NIS2 / DORA Ref",   width: 130, render: v => <Badge label={v} color={T.accent} T={T} /> },
    { key: "category", label: "Category",           width: 130, render: v => <Badge label={v} color={catColorMap[v] || T.muted} T={T} /> },
    { key: "approver", label: "Approver",           width: 130 },
    { key: "drafted",  label: "Drafted",            width: 80,  render: v => v ? <Badge label="✓ Yes" color={T.low} T={T} /> : <Badge label="Pending" color={T.high} T={T} /> },
    { key: "reviewed", label: "Reviewed",           width: 80,  render: v => v ? <Badge label="✓ Yes" color={T.low} T={T} /> : <Badge label="Pending" color={T.high} T={T} /> },
    { key: "approved", label: "Board Approved",     width: 100, render: v => v ? <Badge label="✓ Approved" color={T.low} T={T} /> : <Badge label="NOT YET" color={T.criminal} T={T} /> },
    { key: "notes",    label: "Notes",              width: 200, wrap: true, render: v => <span style={{ color: T.muted, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}>{v}</span> },
  ];

  return (
    <div>
      {boardApproved < policies.length && (
        <AlertBar type="critical" title={`${boardApproved} / ${policies.length} POLICIES BOARD-APPROVED — ACN audit readiness requires all mandatory policies drafted, reviewed and approved.`}
          text="Priority: Governance Policy (Art.20), Incident Response Plan (Art.23), DORA ICT Third-Party Policy." />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Policies"    value={policies.length}    color={T.accent} />
        <KPI label="Board Approved"    value={boardApproved}      color={boardApproved < policies.length ? T.criminal : T.low} pulse={boardApproved === 0} sub={`Target: ${policies.length}/${policies.length}`} />
        <KPI label="Drafted"           value={drafted}            color={drafted < policies.length ? T.high : T.low} />
        <KPI label="Reviewed"          value={reviewed}           color={reviewed < policies.length ? T.high : T.low} />
        <KPI label="Pending Approval"  value={policies.length - boardApproved} color={T.criminal} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Policy Approval Pipeline">
          {[["Drafting", drafted, policies.length, T.high], ["Under Review", reviewed, policies.length, T.medium], ["Board Approved", boardApproved, policies.length, T.low]].map(([stage, count, total, color]) => (
            <div key={stage} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: T.text, fontFamily: "'IBM Plex Mono', monospace" }}>{stage}</span>
                <span style={{ fontSize: 11, color: color, fontFamily: "'IBM Plex Mono', monospace" }}>{count} / {total}</span>
              </div>
              <div style={{ height: 8, background: T.surface2, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <Divider style={{ margin: "10px 0" }} />
          {cats.slice(0, 5).map(c => (
            <StatRow key={c} label={c} value={`${policies.filter(p => p.category === c && p.approved).length} / ${policies.filter(p => p.category === c).length} approved`} color={catColorMap[c]} />
          ))}
        </Card>
        <Card title="Policies by Category">
          <div style={{ height: 240 }}>
            <ResponsivePie
              data={catPie}
              margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
              innerRadius={0.55} padAngle={2} cornerRadius={3}
              colors={({ data }) => data.color} theme={NT}
              enableArcLinkLabels={false} arcLabelsSkipAngle={18} arcLabelsTextColor="#fff"
              legends={[{ anchor: "bottom", direction: "row", translateY: 48, itemWidth: 110, itemHeight: 16, itemTextColor: T.muted, symbolSize: 9 }]}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => setCatFilter("")}
          style={{ background: !catFilter ? T.accentLo : T.surface2, border: `1px solid ${!catFilter ? T.accent : T.border}`, color: !catFilter ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
          All Categories
        </button>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c === catFilter ? "" : c)}
            style={{ background: catFilter === c ? T.accentLo : T.surface2, border: `1px solid ${catFilter === c ? T.accent : T.border}`, color: catFilter === c ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
            {c}
          </button>
        ))}
      </div>
      <DataTable columns={columns} rows={filtered} maxHeight={400} />

      <Card title="Regulatory Contacts & Escalation" style={{ marginTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {REG_CONTACTS.map(r => (
            <div key={r.framework} style={{ background: T.surface2, borderRadius: 6, padding: "14px 16px", borderLeft: `3px solid ${T.accent}` }}>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>{r.framework}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>{r.authority}</div>
              <div style={{ fontSize: 10, color: T.accent, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 }}>🌐 {r.portal}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>{r.hotline}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Incident Management ──
const IncidentView = ({ RAW }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const incidents = RAW.incidents || [];
  const [tab, setTab] = useState("log");
  const [expandedPhase, setExpandedPhase] = useState("PHASE 1: EARLY WARNING");

  const phases = [...new Set(CHECKLIST_ITEMS.map(c => c.phase))];
  const phaseColors = { "PHASE 1: EARLY WARNING": T.criminal, "PHASE 2: INCIDENT NOTIFICATION": T.high, "PHASE 3: FINAL REPORT": T.accent };

  const significant = incidents.filter(i => i.significant).length;
  const ew24Sent    = incidents.filter(i => i.ew24 === "Y").length;
  const dora4hSent  = incidents.filter(i => i.dora4h === "Y").length;

  const incColumns = [
    { key: "id",          label: "ID",             width: 120, render: v => <span style={{ color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
    { key: "detected",    label: "Detected",       width: 110 },
    { key: "resolved",    label: "Resolved",       width: 110 },
    { key: "title",       label: "Incident",       width: 220, wrap: true },
    { key: "severity",    label: "Severity",       width: 90,  render: v => <LevelBadge level={v} /> },
    { key: "type",        label: "Type",           width: 160, render: v => <Badge label={v} color={T.medium} T={T} /> },
    { key: "significant", label: "Significant",    width: 90,  render: v => v ? <Badge label="YES" color={T.criminal} T={T} /> : <Badge label="no" color={T.muted} T={T} /> },
    { key: "ew24",        label: "24h EW",         width: 130, render: (v, row) => (
        <div>
          <span style={{ color: v === "Y" ? T.low : T.muted, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
          {row.ew24_ts && row.ew24_ts !== "—" && <div style={{ fontSize: 9, color: T.dimmed, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{row.ew24_ts}</div>}
        </div>
      )},
    { key: "ntf72",       label: "72h NTF",        width: 140, render: (v, row) => (
        <div>
          <span style={{ color: v === "Y" ? T.low : T.muted, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
          {row.ntf72_ts && row.ntf72_ts !== "—" && <div style={{ fontSize: 9, color: T.dimmed, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{row.ntf72_ts}</div>}
        </div>
      )},
    { key: "report30",    label: "30d Report",     width: 120, render: (v, row) => (
        <div>
          <span style={{ color: v === "Y" ? T.low : T.muted, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
          {row.report30_date && row.report30_date !== "—" && <div style={{ fontSize: 9, color: T.dimmed, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{row.report30_date}</div>}
        </div>
      )},
    { key: "dora4h",      label: "DORA 4h",        width: 75,  render: v => <span style={{ color: v === "Y" ? T.low : T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
    { key: "rootCause",   label: "Root Cause",     width: 240, wrap: true, render: v => <span style={{ color: T.muted, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
    { key: "lessons",     label: "Lessons Learned",width: 240, wrap: true, render: v => <span style={{ color: T.muted, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
  ];

  const sigColumns = [
    { key: "id",        label: "ID",        width: 80,  render: v => <span style={{ color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span> },
    { key: "category",  label: "Category",  width: 180, render: v => <Badge label={v} color={T.medium} T={T} /> },
    { key: "threshold", label: "Threshold / Trigger", width: 360, wrap: true },
    { key: "nis2",      label: "NIS2 Ref",  width: 130, render: v => <Badge label={v} color={T.accent} T={T} /> },
    { key: "dora",      label: "DORA Ref",  width: 100 },
    { key: "example",   label: "Example Scenario", width: 340, wrap: true, render: v => <span style={{ color: T.muted, fontSize: 10 }}>{v}</span> },
  ];

  const severityPie = useMemo(() => {
    const map = {};
    incidents.forEach(i => { map[i.severity] = (map[i.severity] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ id: k, label: k, value: v, color: levelColor(k, T) }));
  }, [incidents, T]);

  return (
    <div>
      {dora4hSent === 0 && incidents.length > 0 && (
        <AlertBar type="warning"
          title={`DORA 4h NOTIFICATION GAP — ${dora4hSent}/${incidents.length} incidents had DORA 4h notification sent. Template missing.`}
          text="For AST-001/AST-003 incidents: DORA Art.19 requires Bank of Italy notification within 4h. Dual reporting is mandatory." />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Incidents"  value={incidents.length}                          color={T.accent} />
        <KPI label="Significant"      value={significant}                               color={T.high}    sub="Regulatory reporting" />
        <KPI label="24h EW Sent"      value={`${ew24Sent}/${incidents.length}`}         color={T.low} />
        <KPI label="DORA 4h Sent"     value={`${dora4hSent}/${incidents.length}`}       color={T.criminal} pulse />
        <KPI label="Reporting Gap"    value={significant - dora4hSent > 0 ? `${significant - dora4hSent} missing` : "None"} color={significant - dora4hSent > 0 ? T.criminal : T.low} />
      </div>

      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
        {[["log","📋 Incident Log"], ["sig","🔍 Significance Criteria"], ["checklist","☑ Operational Checklist"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "9px 18px", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? T.accent : "transparent"}`, color: tab === t ? T.text : T.muted, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <div>
          {incidents.length === 0 ? (
            <AlertBar type="info" title="No incidents loaded from SharePoint." text="Ensure the 'incidents' sheet is present in your nis2-data.json export." />
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Card title="Incidents by Severity">
                  <div style={{ height: 180 }}>
                    <ResponsivePie
                      data={severityPie}
                      margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
                      innerRadius={0.6} padAngle={3} cornerRadius={3}
                      colors={({ data }) => data.color} theme={NT}
                      enableArcLinkLabels={false} arcLabelsSkipAngle={15} arcLabelsTextColor="#fff"
                      legends={[{ anchor: "bottom", direction: "row", translateY: 38, itemWidth: 90, itemHeight: 16, itemTextColor: T.muted, symbolSize: 10 }]}
                    />
                  </div>
                </Card>
                <Card title="Notification Compliance">
                  <div style={{ height: 180 }}>
                    <ResponsiveBar
                      data={[
                        { metric: "Significant",  value: significant,  na: incidents.length - significant },
                        { metric: "24h EW Sent",  value: ew24Sent,     na: significant - ew24Sent },
                        { metric: "72h NTF",      value: incidents.filter(i => i.ntf72 === "Y").length,    na: significant - incidents.filter(i => i.ntf72 === "Y").length },
                        { metric: "30d Report",   value: incidents.filter(i => i.report30 === "Y").length, na: significant - incidents.filter(i => i.report30 === "Y").length },
                        { metric: "DORA 4h",      value: dora4hSent,   na: incidents.length - dora4hSent },
                      ]}
                      keys={["value", "na"]} indexBy="metric" layout="horizontal"
                      margin={{ top: 5, right: 20, bottom: 50, left: 90 }} padding={0.3}
                      colors={[T.low, T.criminal]} maxValue={incidents.length + 1} theme={NT} borderRadius={2}
                      axisLeft={{ tickSize: 0, tickPadding: 8 }} axisBottom={{ tickSize: 0, tickPadding: 6 }}
                      enableLabel={true} label={({ value }) => value > 0 ? value : ""} labelTextColor="#fff"
                      legends={[{ dataFrom: "keys", anchor: "bottom", direction: "row", translateY: 46, itemWidth: 100, itemHeight: 16, itemTextColor: T.muted, symbolSize: 10,
                        data: [{ id: "value", label: "Sent / Yes", color: T.low }, { id: "na", label: "Missing / No", color: T.criminal }] }]}
                    />
                  </div>
                </Card>
              </div>
              <DataTable columns={incColumns} rows={incidents} maxHeight={400} />
            </>
          )}
        </div>
      )}

      {tab === "sig" && (
        <div>
          <AlertBar type="info" title="Significance criteria determine if an incident requires mandatory regulatory reporting under NIS2 Art.23."
            text="If ANY single criterion is met → report to CSIRT Italia within 24h. DORA Art.19 applies in parallel for ICT financial assets. When in doubt, report." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
            {SIGNIFICANCE.map(s => (
              <div key={s.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.medium}`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Badge label={s.id} color={T.accent} T={T} />
                  <Badge label={s.nis2} color={T.medium} T={T} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>{s.category}</div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5, marginBottom: 8 }}>{s.threshold}</div>
                <div style={{ fontSize: 9, color: T.dimmed, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.4, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
                  <span style={{ color: T.accent }}>e.g.</span> {s.example}
                </div>
              </div>
            ))}
          </div>
          <DataTable columns={sigColumns} rows={SIGNIFICANCE} maxHeight={360} />
        </div>
      )}

      {tab === "checklist" && (
        <div>
          <AlertBar type="critical"
            title="🛑 LEX SPECIALIS — If incident affects financial ICT assets: DORA Art.19 requires Bank of Italy notification within 4 HOURS. Dual reporting mandatory."
            text="(1) NIS2 → CSIRT Italia ≤24h AND (2) DORA → Bank of Italy ≤4h. Ref: DORA Art.19 | NIS2 Art.23 | Lex Specialis principle." />
          {phases.map(phase => {
            const items = CHECKLIST_ITEMS.filter(c => c.phase === phase);
            const phaseC = phaseColors[phase] || T.muted;
            const expanded = expandedPhase === phase;
            return (
              <div key={phase} style={{ marginBottom: 10 }}>
                <div onClick={() => setExpandedPhase(expanded ? null : phase)}
                  style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${phaseC}`, borderRadius: 6, padding: "12px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: phaseC, fontFamily: "'IBM Plex Mono', monospace" }}>{phase}</div>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>{items.length} items · {items[0]?.deadline}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge label={`${items.length} items`} color={phaseC} T={T} />
                    <span style={{ color: T.muted }}>{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expanded && (
                  <div style={{ border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
                    {items.map((item, ii) => (
                      <div key={item.id} style={{ padding: "10px 18px", borderBottom: `1px solid ${T.border}`, background: ii % 2 === 0 ? T.surface : T.surface2, display: "grid", gridTemplateColumns: "80px 1fr 140px", gap: 12, alignItems: "start" }}>
                        <span style={{ color: phaseC, fontWeight: 700, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>{item.id}</span>
                        <div>
                          <div style={{ fontSize: 11, color: T.text, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5, marginBottom: 4 }}>{item.action}</div>
                          <div style={{ fontSize: 9, color: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>📎 {item.evidence}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{item.owner}</div>
                          <div style={{ marginTop: 4 }}><Badge label="[ ] Pending" color={T.high} T={T} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────
const ThemeToggle = ({ dark, toggle }) => {
  const T = dark ? DARK : LIGHT;
  return (
    <button onClick={toggle} title="Toggle light/dark mode"
      style={{ display: "flex", alignItems: "center", gap: 7, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "5px 12px 5px 8px", cursor: "pointer", outline: "none", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ position: "relative", width: 34, height: 18, background: dark ? T.accent : T.border, borderRadius: 9, flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: dark ? 17 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.35)" }} />
      </div>
      <span style={{ fontSize: 11, color: T.text, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{dark ? "☽ Dark" : "☀ Light"}</span>
    </button>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function NIS2Dashboard() {
  const [view, setView] = useState("overview");
  const [globalFilter, setGlobalFilter] = useState(null);
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

  // ── Live SharePoint Connection ──
  const { data: RAW, loading, error } = useComplianceData();

  const handleFilter = useCallback((f) => {
    setGlobalFilter(f);
    setView("gaps");
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", background: T.bg, color: T.accent, fontFamily: "'IBM Plex Mono', monospace", gap: 16 }}>
        <div style={{ fontSize: 32, animation: "nis2pulse 1.5s infinite" }}>⟳</div>
        <div style={{ fontSize: 14, letterSpacing: "0.08em" }}>Loading Live Compliance Data from SharePoint…</div>
        <div style={{ fontSize: 11, color: T.muted }}>Connecting via Power Automate · NIS2/DORA Dashboard v2.0</div>
        <style>{`@keyframes nis2pulse { 0%,100%{opacity:1;transform:rotate(0deg)} 50%{opacity:0.5;transform:rotate(180deg)} }`}</style>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", background: T.bg, color: T.criminal, fontFamily: "'IBM Plex Mono', monospace", gap: 12, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32 }}>⚠</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>SharePoint Connection Failed</div>
        <div style={{ fontSize: 12, color: T.muted, maxWidth: 600, lineHeight: 1.8 }}>
          {error}<br /><br />
          <strong style={{ color: T.text }}>Common causes:</strong><br />
          • SHAREPOINT_JSON_URL not configured in NIS2Dashboard.jsx<br />
          • CORS error on localhost (install "Allow CORS" browser extension while developing)<br />
          • Power Automate flow not yet triggered<br />
          • SharePoint file permissions
        </div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, background: T.accentLo, border: `1px solid ${T.accent}`, color: T.accent, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
          ↺ Retry Connection
        </button>
      </div>
    );
  }

  const criticalCount = (RAW.gaps || []).filter(g => normalizeLevel(g.level) === "CRITICAL").length;
  const highCount     = (RAW.gaps || []).filter(g => normalizeLevel(g.level) === "HIGH").length;
  const openCount     = (RAW.gaps || []).filter(g => (g.status || "").includes("OPEN")).length;

  const nav = [
    { id: "overview",  label: "Overview",             icon: "◈" },
    { id: "gaps",      label: "Gap Register",         icon: "⬡" },
    { id: "risks",     label: "Risk Register",        icon: "△" },
    { id: "assets",    label: "Assets & Supply Chain",icon: "□" },
    { id: "maturity",  label: "Maturity Tracker",     icon: "◉" },
    { id: "incidents", label: "Incident Mgmt",        icon: "⚡" },
    { id: "policies",  label: "Policy Tracker",       icon: "📄" },
    { id: "phases",    label: "Phased Programme",     icon: "▶" },
    { id: "programme", label: "Programme",            icon: "◇" },
  ];

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: T.text }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
          @keyframes nis2pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
          button:focus { outline: none; }
        `}</style>

        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, letterSpacing: "0.06em" }}>LIST SpA</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: "0.04em" }}>NIS2 / DORA v2.0</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.low, display: "inline-block" }} />
              <span style={{ fontSize: 9, color: T.low, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em" }}>LIVE — SharePoint</span>
            </div>
            {criticalCount > 0 && (
              <div style={{ marginTop: 6, background: T.critLo, border: `1px solid ${T.criminal}30`, borderRadius: 3, padding: "4px 8px", fontSize: 9, color: T.criminal, fontWeight: 700, letterSpacing: "0.06em" }}>
                ⚠ {criticalCount} CRITICAL GAPS
              </div>
            )}
          </div>

          <nav style={{ padding: "8px 0", flex: 1 }}>
            {nav.map(n => (
              <button key={n.id} onClick={() => setView(n.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 16px", background: view === n.id ? T.surface2 : "none", border: "none", borderLeft: `2px solid ${view === n.id ? T.accent : "transparent"}`, color: view === n.id ? T.text : T.muted, fontSize: 11, cursor: "pointer", textAlign: "left", letterSpacing: "0.02em", transition: "all 0.1s" }}>
                <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.dimmed, letterSpacing: "0.04em" }}>
            <div>v2.0 · Live Data</div>
            <div style={{ color: T.muted, marginTop: 2 }}>{(RAW.gaps || []).length} gaps · {(RAW.risks || []).length} risks</div>
            {criticalCount > 0 && <div style={{ marginTop: 4, color: T.criminal }}>● {criticalCount} CRITICAL</div>}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 28px", position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em" }}>
                {nav.find(n => n.id === view)?.icon} {nav.find(n => n.id === view)?.label}
              </div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                LIST SpA · NIS2/DORA Compliance Programme · {(RAW.gaps || []).length} gaps · {(RAW.risks || []).length} risks · {(RAW.assets || []).length} assets · {(RAW.incidents || []).length} incidents · {(RAW.policies || []).length} policies
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[
                [`CRITICAL: ${criticalCount}`, T.criminal],
                [`HIGH: ${highCount}`,         T.high],
                [`OPEN: ${openCount}`,         T.medium],
              ].map(([l, c], i) => (
                <div key={i} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "4px 10px", fontSize: 10, color: c, letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono',monospace" }}>{l}</div>
              ))}
              <ThemeToggle dark={dark} toggle={() => setDark(d => !d)} />
            </div>
          </div>

          {/* View content */}
          <div style={{ padding: "24px 28px" }}>
            {view === "overview"  && <OverviewView  RAW={RAW} setFilter={handleFilter} />}
            {view === "gaps"      && <GapsView      RAW={RAW} filter={globalFilter} setFilter={setGlobalFilter} />}
            {view === "risks"     && <RisksView     RAW={RAW} />}
            {view === "assets"    && <AssetsView    RAW={RAW} />}
            {view === "maturity"  && <MaturityView  RAW={RAW} />}
            {view === "incidents" && <IncidentView  RAW={RAW} />}
            {view === "policies"  && <PolicyView    RAW={RAW} />}
            {view === "phases"    && <PhasedView    RAW={RAW} />}
            {view === "programme" && <ProgrammeView RAW={RAW} />}
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}