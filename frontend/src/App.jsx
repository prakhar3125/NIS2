import { useState, useMemo, useCallback, createContext, useContext } from "react";
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
  bg:       "#080B0F",
  surface:  "#0E1318",
  surface2: "#141A21",
  surface3: "#1A2330",
  border:   "#1E2730",
  borderHi: "#2A3848",
  text:     "#E8EDF2",
  textSub:  "#B0C4D0",
  muted:    "#8A9BAA",
  dimmed:   "#5A6B7A",
  accent:   "#4A90D9",
  accentLo: "rgba(74,144,217,0.14)",
  critical: "#FF5252",
  critLo:   "rgba(255,82,82,0.12)",
  high:     "#FF8C42",
  highLo:   "rgba(255,140,66,0.12)",
  medium:   "#FFD23F",
  medLo:    "rgba(255,210,63,0.12)",
  low:      "#2ECC71",
  lowLo:    "rgba(46,204,113,0.12)",
  criminal: "#FF2D55",
  axisText:   "#8A9BAA",
  gridLine:   "#1E2730",
  legendText: "#8A9BAA",
  tooltipBg:  "#141A21",
  tooltipBdr: "#2A3848",
};

const LIGHT = {
  _mode: "light",
  bg:       "#EEF2F7",
  surface:  "#FFFFFF",
  surface2: "#F4F7FB",
  surface3: "#E8EDF5",
  border:   "#CBD5E0",
  borderHi: "#A0AEC0",
  text:     "#0D1B2A",
  textSub:  "#2D4057",
  muted:    "#4A6070",
  dimmed:   "#7A8FA0",
  accent:   "#1A6FD8",
  accentLo: "rgba(26,111,216,0.10)",
  critical: "#C0392B",
  critLo:   "rgba(192,57,43,0.08)",
  high:     "#C05000",
  highLo:   "rgba(192,80,0,0.08)",
  medium:   "#8B6914",
  medLo:    "rgba(139,105,20,0.08)",
  low:      "#1A7A3C",
  lowLo:    "rgba(26,122,60,0.08)",
  criminal: "#A8002A",
  axisText:   "#4A6070",
  gridLine:   "#CBD5E0",
  legendText: "#4A6070",
  tooltipBg:  "#FFFFFF",
  tooltipBdr: "#A0AEC0",
};
// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const ThemeCtx = createContext(DARK);
const useTheme = () => useContext(ThemeCtx);



// ─────────────────────────────────────────────
// EMBEDDED DATA
// ─────────────────────────────────────────────
const RAW = {
  gaps: [
    { id:"GOV-001", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Management body approves cybersecurity risk measures", state:"No formal board resolution exists", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"CEO / Board" },
    { id:"GOV-002", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Management body oversees Art.21 measures", state:"CISO reports to board ad-hoc only", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"CISO → Board" },
    { id:"GOV-003", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Management body can be held liable for Art.21 infringements", state:"Personal liability not communicated", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"Legal Counsel" },
    { id:"GOV-004", domain:"Art.20 Governance", ref:"Art.20.2", requirement:"Board receives cybersecurity training", state:"Board training at 0%", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"HR + CISO" },
    { id:"GOV-005", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Board ensures Art.21 resources allocated", state:"No formal cybersecurity budget approved by board", level:"CRITICAL", target:"Apr 2026", status:"OPEN – CRITICAL", owner:"CFO + Board" },
    { id:"GOV-006", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Cybersecurity governance policy documented", state:"No formal written policy exists", level:"CRITICAL", target:"Apr 2026", status:"OPEN – CRITICAL", owner:"CISO + Legal" },
    { id:"GOV-007", domain:"Art.20 Governance", ref:"Art.27",   requirement:"LIST SpA registered with ACN as Essential Entity", state:"Registration not confirmed", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"CISO + Legal" },
    { id:"GOV-008", domain:"Art.20 Governance", ref:"Art.20.1", requirement:"Annual board cybersecurity review mandated", state:"No annual review schedule exists", level:"CRITICAL", target:"Apr 2026", status:"OPEN – CRITICAL", owner:"CISO + Legal" },
    { id:"GAP-001", domain:"Art.21 Gap Analysis", ref:"Art.21.2.a", requirement:"Cybersecurity risk management policy documented", state:"Draft policy exists, not formally approved", level:"Partial", target:"Q2 2026", status:"In Progress", owner:"CISO" },
    { id:"GAP-002", domain:"Art.21 Gap Analysis", ref:"Art.23",   requirement:"24h Early Warning template tested with ACN portal", state:"Template draft only; portal not registered", level:"HIGH", target:"Q1 2026", status:"OPEN – OVERDUE RISK", owner:"Head of IR" },
    { id:"GAP-003", domain:"Art.21 Gap Analysis", ref:"Art.21.2.b", requirement:"Incident handling procedures covering detection to recovery", state:"Playbook exists but not annually tested", level:"Partial", target:"Q2 2026", status:"In Progress", owner:"CISO" },
    { id:"GAP-004", domain:"Art.21 Gap Analysis", ref:"Art.21.2.c", requirement:"Business continuity plan documented and tested", state:"BCP exists but DR test results not documented", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Head of Infra" },
    { id:"GAP-005", domain:"Art.21 Gap Analysis", ref:"Art.21.2.d", requirement:"Supply chain security policy for critical vendors", state:"Vendor questionnaire not deployed", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Procurement" },
    { id:"GAP-006", domain:"Art.21 Gap Analysis", ref:"Art.21.2.e", requirement:"Secure network architecture documented", state:"Network diagram outdated (2023)", level:"Partial", target:"Q2 2026", status:"In Progress", owner:"Head of Infra" },
    { id:"GAP-007", domain:"Art.21 Gap Analysis", ref:"Art.21.2.f", requirement:"Vulnerability management programme in place", state:"Ad-hoc scanning; no formal programme", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"CISO" },
    { id:"GAP-008", domain:"Art.21 Gap Analysis", ref:"Art.21.2.g", requirement:"Cyber hygiene practices and awareness training", state:"Phishing simulation not quarterly", level:"Partial", target:"Q2 2026", status:"Compliant – Gaps", owner:"HR + CISO" },
    { id:"GAP-009", domain:"Art.21 Gap Analysis", ref:"Art.21.2.h", requirement:"Cryptography and encryption policy", state:"Policy referenced in ISO 27001 but standalone NIS2 doc missing", level:"LOW", target:"Q3 2026", status:"Compliant – Monitor", owner:"Head of IT Infra" },
    { id:"GAP-010", domain:"Art.21 Gap Analysis", ref:"Art.21.2.i", requirement:"Human resources security and access control policies", state:"HR offboarding process lacks 24h PAM revocation", level:"Partial", target:"Q2 2026", status:"Compliant – Gaps", owner:"HR + CISO" },
    { id:"MG-001", domain:"Missing Gaps", ref:"Art.21.2.j", requirement:"Multi-factor authentication for all privileged accounts", state:"MFA enforced for AD/Azure but not all SaaS", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Head of IT Infra" },
    { id:"MG-002", domain:"Missing Gaps", ref:"Art.21.2.k", requirement:"DORA Art.30 contractual clauses with critical ICT vendors", state:"ION Group and Azure contracts lack DORA Art.30 clauses", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"CISO / SOC Lead" },
    { id:"MG-003", domain:"Missing Gaps", ref:"Art.21.2.b", requirement:"Threat-Led Penetration Testing (TLPT)", state:"No TLPT programme in place; DORA requires it", level:"HIGH", target:"Q3 2026", status:"OPEN", owner:"CISO" },
    { id:"MG-004", domain:"Missing Gaps", ref:"Art.21.2.a", requirement:"Immutable backup integrity verification schedule", state:"Veeam immutable backups deployed but cert expiry not tracked", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"Head of Infra" },
    { id:"MG-005", domain:"Missing Gaps", ref:"Art.21.2.e", requirement:"Zero Trust Network Access (ZTNA) architecture", state:"Traditional VPN in use; no ZTNA roadmap", level:"MEDIUM", target:"Q3 2026", status:"Not Started", owner:"Head of Infra" },
    { id:"MG-006", domain:"Missing Gaps", ref:"Art.21.2.c", requirement:"Trading communications encryption confirmation", state:"Office 365 / Teams trading comms encryption unconfirmed", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"Head of Dev" },
    { id:"MG-007", domain:"Missing Gaps", ref:"Art.21.2.a", requirement:"CSPM continuous monitoring for Azure misconfiguration", state:"CSPM deployed but alert thresholds not tuned", level:"MEDIUM", target:"Q2 2026", status:"In Progress", owner:"Head of Infra" },
    { id:"MG-008", domain:"Missing Gaps", ref:"D.Lgs.105/2019", requirement:"CVCN approval for ION Cloud (PSNC Strategic Asset)", state:"CVCN Pending – 45-day deadline at critical risk", level:"CRITICAL", target:"IMMEDIATE", status:"OPEN – CRITICAL", owner:"CISO + Legal" },
    { id:"MG-009", domain:"Missing Gaps", ref:"Art.21.2.a", requirement:"SIEM threat hunting playbooks documented", state:"Splunk SIEM deployed but no playbooks documented", level:"MEDIUM", target:"Q2 2026", status:"Not Started", owner:"CISO / SOC Lead" },
    { id:"MG-010", domain:"Missing Gaps", ref:"Art.21.2.b", requirement:"SOC escalation matrix with 24/7 on-call", state:"On-call rota exists but not formally documented", level:"HIGH", target:"Q1 2026", status:"In Progress", owner:"Head of IR" },
    { id:"MG-011", domain:"Missing Gaps", ref:"GDPR Art.33", requirement:"GDPR Art.33 parallel notification procedure", state:"No dual NIS2+GDPR notification runbook exists", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"DPO + Legal" },
    { id:"MG-012", domain:"Missing Gaps", ref:"Art.21.2.d", requirement:"Physical security of trading floor and data centres", state:"Physical security policy not linked to NIS2 scope", level:"MEDIUM", target:"Q2 2026", status:"Not Started", owner:"Head of Facilities" },
    { id:"MG-013", domain:"Missing Gaps", ref:"Art.21.2.f", requirement:"Patch management SLA for critical assets", state:"No defined SLA for critical asset patching", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Head of IT Infra" },
    { id:"MG-014", domain:"Missing Gaps", ref:"DORA Art.19", requirement:"DORA 4h notification capability to Bank of Italy", state:"No DORA-specific notification template exists", level:"CRITICAL", target:"Mar 2026", status:"OPEN – CRITICAL", owner:"CISO + Compliance" },
    { id:"MG-015", domain:"Missing Gaps", ref:"Art.21.2.a", requirement:"Cyber insurance policy aligned to NIS2 exposure", state:"Existing policy may not cover NIS2 fines", level:"MEDIUM", target:"Q3 2026", status:"Not Started", owner:"CFO + Legal" },
    { id:"MG-016", domain:"Missing Gaps", ref:"Art.21.2.j", requirement:"Privileged Identity Management session recording", state:"CyberArk session recording not confirmed for all admins", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"IT Security" },
    { id:"MG-017", domain:"Missing Gaps", ref:"Art.27", requirement:"NIS2 cooperative frameworks with peer entities", state:"No inter-entity information sharing agreements", level:"LOW", target:"Q4 2026", status:"Not Started", owner:"Compliance" },
    { id:"ACT-R01", domain:"Remediation Roadmap", ref:"Art.20.1", requirement:"Draft Board Cybersecurity Governance Policy", state:"No policy document exists", level:"CRITICAL", target:"Mar 2026", status:"OPEN", owner:"CISO + Legal" },
    { id:"ACT-R02", domain:"Remediation Roadmap", ref:"Art.20.2", requirement:"Board NIS2 training programme delivery", state:"External trainer engaged; scheduling pending", level:"CRITICAL", target:"Mar 2026", status:"OPEN", owner:"HR + CISO" },
    { id:"ACT-R03", domain:"Remediation Roadmap", ref:"Art.23", requirement:"Register on ACN unified portal + dry-run", state:"Portal registration not started", level:"HIGH", target:"Mar 2026", status:"OPEN", owner:"CISO + IR Manager" },
    { id:"ACT-R04", domain:"Remediation Roadmap", ref:"D.Lgs.105/2019", requirement:"Daily CVCN chase for ION Cloud approval", state:"Ongoing daily escalation to ACN", level:"CRITICAL", target:"IMMEDIATE", status:"In Progress", owner:"CISO + Legal" },
    { id:"ACT-R05", domain:"Remediation Roadmap", ref:"Art.21.2.d", requirement:"Deploy vendor questionnaires to critical suppliers", state:"Questionnaire template drafted", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Procurement" },
    { id:"ACT-R06", domain:"Remediation Roadmap", ref:"Art.21.2.f", requirement:"Vulnerability scanning programme formalisation", state:"Tool selected; programme not yet structured", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"CISO" },
    { id:"ACT-R07", domain:"Remediation Roadmap", ref:"Art.21.2.b", requirement:"TLPT (Threat-Led Penetration Testing) delivery", state:"Budget allocated; vendor selection in progress", level:"HIGH", target:"Q3 2026", status:"OPEN", owner:"CISO" },
    { id:"ACT-R08", domain:"Remediation Roadmap", ref:"Art.21.2.e", requirement:"ZTNA architecture design and rollout", state:"Design phase; no vendor selected", level:"MEDIUM", target:"Q3 2026", status:"Not Started", owner:"Head of Infra" },
    { id:"ACT-R09", domain:"Remediation Roadmap", ref:"Art.21.2.j", requirement:"MFA rollout to all SaaS platforms", state:"Priority SaaS platforms identified", level:"HIGH", target:"Q2 2026", status:"In Progress", owner:"Head of IT Infra" },
    { id:"ACT-R10", domain:"Remediation Roadmap", ref:"DORA Art.30", requirement:"DORA Art.30 contract clauses with ION, Microsoft", state:"Legal review of contracts in progress", level:"HIGH", target:"Q2 2026", status:"In Progress", owner:"CISO / SOC Lead" },
    { id:"ACT-R11", domain:"Remediation Roadmap", ref:"Art.21.2.b", requirement:"IR playbook annual test and update", state:"Tabletop exercise scheduled Q2", level:"MEDIUM", target:"Q2 2026", status:"Not Started", owner:"Head of IR" },
    { id:"ACT-R12", domain:"Remediation Roadmap", ref:"GDPR Art.33", requirement:"Dual NIS2+GDPR notification runbook creation", state:"DPO engaged; runbook drafting pending", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"DPO + Legal" },
    { id:"ACT-R13", domain:"Remediation Roadmap", ref:"Art.21.2.a", requirement:"Backup immutability certificate tracking", state:"Veeam admin to document cert renewal process", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"Head of Infra" },
    { id:"ACT-R14", domain:"Remediation Roadmap", ref:"Art.21.2.f", requirement:"Patch management SLA documentation", state:"IT team drafting SLA document", level:"HIGH", target:"Q2 2026", status:"OPEN", owner:"Head of IT Infra" },
    { id:"ACT-R15", domain:"Remediation Roadmap", ref:"Art.21.2.a", requirement:"SIEM threat hunting playbook creation", state:"SOC Lead drafting first three playbooks", level:"MEDIUM", target:"Q2 2026", status:"In Progress", owner:"CISO / SOC Lead" },
    { id:"ACT-R16", domain:"Remediation Roadmap", ref:"Art.21.2.c", requirement:"Network architecture diagram update", state:"Network team assigned; completion Q2", level:"MEDIUM", target:"Q2 2026", status:"In Progress", owner:"Head of Infra" },
    { id:"ACT-R17", domain:"Remediation Roadmap", ref:"Art.21.2.g", requirement:"Trading comms encryption confirmation", state:"Microsoft 365 admin review in progress", level:"MEDIUM", target:"Q2 2026", status:"In Progress", owner:"Head of Dev" },
    { id:"ACT-R18", domain:"Remediation Roadmap", ref:"Art.20.1", requirement:"Annual board cybersecurity review calendar", state:"CISO drafting annual review schedule", level:"CRITICAL", target:"Mar 2026", status:"OPEN", owner:"CISO + Legal" },
    { id:"ACT-R19", domain:"Remediation Roadmap", ref:"Art.21.2.c", requirement:"DR test documentation for all critical assets", state:"Planned test exercise Q2 2026", level:"MEDIUM", target:"Q2 2026", status:"OPEN", owner:"Head of Infra" },
    { id:"ACT-R20", domain:"Remediation Roadmap", ref:"Art.21.2.i", requirement:"HR 24h PAM revocation automation", state:"CyberArk + HR system integration scoped", level:"MEDIUM", target:"Q3 2026", status:"Not Started", owner:"IT Security" },
  ],

  risks: [
    { id:"RSK-001", desc:"Ransomware on trading platform (cf. ION LockBit 2023)", ttp:"T1486", asset:"AST-001, AST-002", l:4, i:5, inherent:20, controls:"Immutable backups; EDR; network segmentation", residual:"High", postTreatment:12, owner:"CISO", review:"Monthly" },
    { id:"RSK-002", desc:"Supply chain compromise via 3rd-party software update", ttp:"T1195", asset:"AST-001, AST-003", l:3, i:5, inherent:15, controls:"CVCN vetting; vendor questionnaires; change mgmt", residual:"High", postTreatment:9, owner:"CISO", review:"Monthly" },
    { id:"RSK-003", desc:"Insider threat – privileged user exfiltration", ttp:"T1078", asset:"AST-002, AST-005", l:2, i:4, inherent:8, controls:"PAM (CyberArk); quarterly access reviews; SIEM", residual:"Medium", postTreatment:4, owner:"CISO / SOC Lead", review:"Quarterly" },
    { id:"RSK-004", desc:"DDoS attack on market data gateway", ttp:"T1498", asset:"AST-003", l:4, i:4, inherent:16, controls:"DDoS scrubbing (Cloudflare); ISP filtering", residual:"Medium", postTreatment:8, owner:"Head of Infra", review:"Quarterly" },
    { id:"RSK-005", desc:"Phishing / BEC credential theft", ttp:"T1566", asset:"All Assets", l:5, i:3, inherent:15, controls:"MFA; phishing simulation; awareness training", residual:"Medium", postTreatment:6, owner:"CISO", review:"Quarterly" },
    { id:"RSK-006", desc:"Failure to notify ACN within 24h → regulatory sanction", ttp:"Operational", asset:"IR Process", l:3, i:4, inherent:12, controls:"IR playbook; 24h on-call; ACN portal access", residual:"High", postTreatment:6, owner:"Compliance", review:"Monthly" },
    { id:"RSK-007", desc:"Cloud data breach (Azure misconfiguration)", ttp:"T1530", asset:"AST-002", l:3, i:5, inherent:15, controls:"CSPM; access control reviews; encryption", residual:"High", postTreatment:9, owner:"Head of Infra", review:"Monthly" },
    { id:"RSK-008", desc:"CVCN non-compliance → criminal prosecution (ION Cloud)", ttp:"Regulatory", asset:"AST-002", l:3, i:5, inherent:15, controls:"CVCN notice issued; awaiting approval", residual:"CRITICAL", postTreatment:12, owner:"CISO + Legal", review:"DAILY – IMMEDIATE" },
    { id:"RSK-009", desc:"Board personal liability (NIS2 Art.20) – training 0%", ttp:"Regulatory", asset:"Governance", l:3, i:4, inherent:12, controls:"None – Board training at 0%", residual:"High", postTreatment:6, owner:"CEO / Board", review:"Monthly" },
    { id:"RSK-010", desc:"Credential stuffing on investor portal", ttp:"T1110", asset:"AST-010", l:2, i:4, inherent:8, controls:"WAF; rate limiting; account lockout", residual:"High", postTreatment:4, owner:"Head of Dev", review:"Quarterly" },
    { id:"RSK-011", desc:"DORA operational resilience gap for financial ICT", ttp:"Regulatory", asset:"AST-001, AST-003", l:3, i:4, inherent:12, controls:"DORA Art.30 clauses in progress", residual:"High", postTreatment:6, owner:"CISO + Compliance", review:"Monthly" },
    { id:"RSK-012", desc:"Bloomberg terminal compromise (market data manipulation)", ttp:"T1036", asset:"VND-005, AST-003", l:2, i:5, inherent:10, controls:"Network isolation; Bloomberg security monitoring", residual:"High", postTreatment:5, owner:"Head of Trading Tech", review:"Quarterly" },
    { id:"RSK-013", desc:"Office 365 data loss (accidental deletion / exfiltration)", ttp:"T1537", asset:"AST-007", l:3, i:4, inherent:12, controls:"M365 DLP policies; litigation hold; MFA", residual:"High", postTreatment:6, owner:"Head of IT", review:"Quarterly" },
    { id:"RSK-014", desc:"Physical breach of trading floor (social engineering)", ttp:"T1200", asset:"AST-001, AST-005", l:2, i:4, inherent:8, controls:"Badge access; CCTV; clean desk policy", residual:"Medium", postTreatment:4, owner:"Head of Facilities", review:"Quarterly" },
  ],

  assets: [
    { id:"AST-001", type:"Asset", name:"Electronic Trading Platform", category:"Software Platform", criticality:"Critical", psnc:true, cvcn:"Approved", dora:"Strategic", drTested:"⚠️ Results not documented", risk:5 },
    { id:"AST-002", type:"Asset", name:"ION Cloud Infrastructure", category:"Cloud / IaaS", criticality:"Critical", psnc:true, cvcn:"🔴 PENDING – 45-day at risk", dora:"Critical", drTested:"⚠️ Not independently tested", risk:5 },
    { id:"AST-003", type:"Asset", name:"Market Data Feed Gateway", category:"Network Component", criticality:"Critical", psnc:true, cvcn:"Approved", dora:"Critical", drTested:"⚠️ Failover not DR-tested", risk:5 },
    { id:"AST-004", type:"Asset", name:"Active Directory / Azure AD", category:"Identity & Access", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"✅ Yes", risk:3 },
    { id:"AST-005", type:"Asset", name:"SIEM – Splunk Enterprise", category:"Security Tool", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Critical", drTested:"N/A", risk:3 },
    { id:"AST-006", type:"Asset", name:"PAM – CyberArk", category:"Security Tool", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:3 },
    { id:"AST-007", type:"Asset", name:"Office 365 / Teams", category:"SaaS / Productivity", criticality:"Ordinary", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:1 },
    { id:"AST-008", type:"Asset", name:"Backup Infrastructure", category:"Data Protection", criticality:"Critical", psnc:false, cvcn:"N/A", dora:"Critical", drTested:"⚠️ Immutability cert expiry not tracked", risk:5 },
    { id:"AST-009", type:"Asset", name:"ACN Cloud-Qualified SaaS", category:"Cloud / SaaS", criticality:"Critical", psnc:true, cvcn:"🔴 Not Started", dora:"Strategic", drTested:"TBD", risk:5 },
    { id:"AST-010", type:"Asset", name:"Corporate Website", category:"Web / Public", criticality:"Ordinary", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:1 },
    { id:"AST-011", type:"Asset", name:"IoT / OT Office Infrastructure", category:"IoT / Physical", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:3 },
    { id:"VND-001", type:"Vendor", name:"Microsoft Azure", category:"Cloud Provider", criticality:"Critical", psnc:true, cvcn:"Approved", dora:"Critical ICT", drTested:"✅ Yes", risk:5 },
    { id:"VND-002", type:"Vendor", name:"ION Group", category:"ICT Infrastructure", criticality:"Critical", psnc:true, cvcn:"🔴 PENDING", dora:"Critical ICT", drTested:"⚠️ Not independently tested", risk:5 },
    { id:"VND-003", type:"Vendor", name:"CyberArk", category:"Security Tool", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Important", drTested:"N/A", risk:3 },
    { id:"VND-004", type:"Vendor", name:"Splunk", category:"Security Tool", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Important", drTested:"N/A", risk:3 },
    { id:"VND-005", type:"Vendor", name:"Bloomberg L.P.", category:"Market Data", criticality:"Critical", psnc:true, cvcn:"Approved", dora:"Critical ICT", drTested:"✅ Yes", risk:5 },
    { id:"VND-006", type:"Vendor", name:"Veeam Software", category:"Backup", criticality:"Important", psnc:false, cvcn:"N/A", dora:"Important", drTested:"N/A", risk:3 },
    { id:"VND-007", type:"Vendor", name:"Deloitte Italy", category:"Advisory", criticality:"Ordinary", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:1 },
    { id:"VND-008", type:"Vendor", name:"Physical / Facility Vendors", category:"Physical", criticality:"Ordinary", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:1 },
    { id:"VND-009", type:"Vendor", name:"[New SaaS Tool]", category:"TBD", criticality:"TBD", psnc:false, cvcn:"Pending review", dora:"TBD", drTested:"TBD", risk:2 },
    { id:"VND-010", type:"Vendor", name:"HR Software Provider", category:"HR / SaaS", criticality:"Ordinary", psnc:false, cvcn:"N/A", dora:"Ordinary", drTested:"N/A", risk:1 },
  ],

  budget: [
    { id:"ACT-001", action:"24h ACN Early Warning template & escalation tree", owner:"Head of IR", allocated:2000, spent:0, status:"In Progress" },
    { id:"ACT-002", action:"Board NIS2 cybersecurity training", owner:"HR + CISO", allocated:5000, spent:0, status:"OPEN" },
    { id:"ACT-003", action:"IMMEDIATE: CVCN approval chase ION Cloud", owner:"CISO + Legal", allocated:0, spent:0, status:"In Progress" },
    { id:"ACT-004", action:"Board Cybersecurity Governance Policy", owner:"CISO + Legal", allocated:3000, spent:0, status:"OPEN" },
    { id:"ACT-005", action:"ACN portal registration + dry-run", owner:"CISO + IR", allocated:0, spent:0, status:"OPEN" },
    { id:"ACT-006", action:"Vendor questionnaire deployment", owner:"Procurement", allocated:3000, spent:0, status:"OPEN" },
    { id:"ACT-007", action:"TLPT – Threat-Led Penetration Testing", owner:"CISO", allocated:80000, spent:0, status:"OPEN" },
    { id:"ACT-008", action:"SOC 24/7 escalation matrix", owner:"Head of IR", allocated:0, spent:0, status:"In Progress" },
    { id:"ACT-009", action:"Azure CSPM tuning & misconfiguration alerts", owner:"Head of Infra", allocated:8000, spent:0, status:"In Progress" },
    { id:"ACT-010", action:"ZTNA architecture design", owner:"Head of Infra", allocated:4000, spent:0, status:"OPEN" },
    { id:"ACT-011", action:"Patch management SLA documentation", owner:"Head of IT Infra", allocated:1000, spent:0, status:"OPEN" },
    { id:"ACT-012", action:"Vulnerability scanning programme", owner:"CISO", allocated:12000, spent:0, status:"OPEN" },
    { id:"ACT-013", action:"DORA Art.30 contract review", owner:"CISO / SOC Lead", allocated:5000, spent:0, status:"OPEN" },
    { id:"ACT-014", action:"DORA 4h notification template", owner:"CISO + Compliance", allocated:3000, spent:0, status:"OPEN" },
    { id:"ACT-015", action:"Dual NIS2+GDPR notification runbook", owner:"DPO + Legal", allocated:2500, spent:0, status:"OPEN" },
    { id:"ACT-016", action:"HR PAM 24h revocation automation", owner:"IT Security", allocated:0, spent:0, status:"OPEN" },
    { id:"ACT-017", action:"DR test documentation all critical assets", owner:"Head of Infra", allocated:2000, spent:0, status:"OPEN" },
    { id:"ACT-018", action:"Backup immutability cert tracking", owner:"Head of Infra", allocated:5000, spent:0, status:"OPEN" },
    { id:"ACT-019", action:"SIEM threat hunting playbooks", owner:"CISO / SOC Lead", allocated:3000, spent:0, status:"In Progress" },
    { id:"ACT-020", action:"MFA rollout all SaaS platforms", owner:"Head of IT Infra", allocated:8000, spent:0, status:"In Progress" },
  ],

  training: [
    { name:"CEO", role:"Chief Executive Officer", category:"Board", type:"NIS2 Art.20 Personal Liability + Governance", status:"Not Started", due:"Mar 2026" },
    { name:"CFO", role:"Chief Financial Officer", category:"Board", type:"NIS2 Art.20 + DORA Financial Impact", status:"Not Started", due:"Mar 2026" },
    { name:"COO", role:"Chief Operating Officer", category:"Board", type:"NIS2 Art.20 + BC/DR Obligations", status:"Not Started", due:"Mar 2026" },
    { name:"Board Member 1", role:"Non-Executive Director", category:"Board", type:"NIS2 Art.20 Personal Liability", status:"Not Started", due:"Mar 2026" },
    { name:"Board Member 2", role:"Non-Executive Director", category:"Board", type:"NIS2 Art.20 Personal Liability", status:"Not Started", due:"Mar 2026" },
    { name:"CISO", role:"Chief Information Security Officer", category:"C-Suite / Technical", type:"NIS2 Full Programme + DORA", status:"Not Started", due:"Mar 2026" },
    { name:"CTO", role:"Chief Technology Officer", category:"C-Suite / Technical", type:"NIS2 Art.21 Technical Controls", status:"Not Started", due:"Apr 2026" },
    { name:"DPO", role:"Data Protection Officer", category:"C-Suite / Technical", type:"NIS2 + GDPR Art.33 Parallel Reporting", status:"Not Started", due:"Apr 2026" },
    { name:"SOC Lead", role:"SOC Lead", category:"IT Security", type:"NIS2 Incident Response + MITRE ATT&CK", status:"Not Started", due:"Apr 2026" },
    { name:"IR Manager", role:"IR Manager", category:"IT Security", type:"NIS2 Art.23 Notification Timelines", status:"Not Started", due:"Mar 2026" },
    { name:"Head of Dev", role:"Head of Development", category:"Technical", type:"NIS2 Secure Coding + Art.21.2.g", status:"Not Started", due:"May 2026" },
    { name:"Head of Infra", role:"Head of Infrastructure", category:"Technical", type:"NIS2 BC/DR + TLPT Requirements", status:"Not Started", due:"May 2026" },
    { name:"General Staff", role:"All Staff", category:"General", type:"NIS2 Awareness + Phishing Simulation", status:"Not Started", due:"Jun 2026" },
  ],

  evidence: [
    { id:"EV-001", desc:"Board Cybersecurity Governance Policy – signed", related:"GOV-001, GOV-008", ref:"Art.20", status:"REQUIRED" },
    { id:"EV-002", desc:"Board NIS2 training completion certificates", related:"GOV-004, GAP-007", ref:"Art.20.2", status:"REQUIRED" },
    { id:"EV-003", desc:"Board resolution approving Art.21 security measures", related:"GOV-001", ref:"Art.20.1", status:"REQUIRED" },
    { id:"EV-004", desc:"Quarterly board cybersecurity meeting minutes", related:"GOV-002", ref:"Art.20.1", status:"REQUIRED" },
    { id:"EV-005", desc:"Personal liability legal briefing + board acknowledgement", related:"GOV-003", ref:"Art.20", status:"REQUIRED" },
    { id:"EV-006", desc:"ACN registration confirmation", related:"GOV-007", ref:"Art.27", status:"REQUIRED" },
    { id:"EV-007", desc:"24h Early Warning template (tested + approved)", related:"GAP-002, ACT-001", ref:"Art.23", status:"REQUIRED" },
    { id:"EV-008", desc:"Incident response playbook (tested, dated)", related:"GAP-003", ref:"Art.21.2.b", status:"REQUIRED" },
    { id:"EV-009", desc:"Business continuity plan with DR test results", related:"GAP-004", ref:"Art.21.2.c", status:"REQUIRED" },
    { id:"EV-010", desc:"Supply chain vendor questionnaire responses", related:"GAP-005, MG-002", ref:"Art.21.2.d", status:"REQUIRED" },
    { id:"EV-011", desc:"Network architecture diagram (current)", related:"GAP-006", ref:"Art.21.2.e", status:"REQUIRED" },
    { id:"EV-012", desc:"Vulnerability scan reports + remediation log", related:"GAP-007, MG-013", ref:"Art.21.2.f", status:"REQUIRED" },
    { id:"EV-013", desc:"MFA deployment evidence (all privileged accounts)", related:"MG-001", ref:"Art.21.2.j", status:"REQUIRED" },
    { id:"EV-014", desc:"CVCN approval certificate for ION Cloud (AST-002)", related:"MG-008", ref:"D.Lgs.105/2019", status:"CRIMINAL RISK" },
    { id:"EV-015", desc:"DORA 4h notification test log", related:"MG-014", ref:"DORA Art.19", status:"CRIMINAL RISK" },
    { id:"EV-016", desc:"TLPT scope, methodology and results report", related:"MG-003", ref:"Art.21.2.b", status:"REQUIRED" },
    { id:"EV-017", desc:"PAM session recording confirmation all admins", related:"MG-016", ref:"Art.21.2.j", status:"REQUIRED" },
    { id:"EV-018", desc:"Cryptography and encryption policy document", related:"GAP-009", ref:"Art.21.2.h", status:"REQUIRED" },
    { id:"EV-019", desc:"Risk register with treatment plan (current)", related:"All RSK", ref:"Art.21.2.a", status:"REQUIRED" },
    { id:"EV-020", desc:"Asset register (NIS2 / DORA / PSNC classified)", related:"All AST/VND", ref:"Art.21.2.a", status:"REQUIRED" },
    { id:"EV-021", desc:"Phishing simulation results (quarterly KPIs)", related:"GAP-008", ref:"Art.21.2.g", status:"RECOMMENDED" },
    { id:"EV-022", desc:"Cyber insurance policy (NIS2-aligned)", related:"MG-015", ref:"Art.21.2.a", status:"RECOMMENDED" },
    { id:"EV-023", desc:"Inter-entity cooperation agreements", related:"MG-017", ref:"Art.27", status:"RECOMMENDED" },
  ],
};

// ─────────────────────────────────────────────
// NIVO THEME FACTORY (called per component with current T)
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
      background: T.tooltipBg,
      color: T.text,
      fontSize: 12,
      borderRadius: 6,
      border: `1px solid ${T.tooltipBdr}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
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
  if (u === "CRITICAL" || u === "CRIMINAL RISK") return T.criminal;
  if (u === "HIGH") return T.high;
  if (u === "MEDIUM" || u === "PARTIAL") return T.medium;
  if (u === "LOW") return T.low;
  return T.muted;
};
const residualColor = (r) => {
  if (r === "CRITICAL") return T.criminal;
  if (r === "High") return T.high;
  if (r === "Medium") return T.medium;
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
  if (u === "CRIMINAL RISK") return "CRIMINAL";
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
    borderTop: `2px solid ${color || T.border}`,
    borderRadius: 6, padding: "16px 18px",
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
// TABLE COMPONENT (sortable + filterable)
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
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: T.muted }}>No results</td></tr>
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
      {renderField("Post-Treatment Score", row.postTreatment + "/25", scoreColor(row.postTreatment))}
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

// — — — Overview — — —
const OverviewView = ({ setFilter }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const gaps = RAW.gaps;
  const critical = gaps.filter(g => normalizeLevel(g.level) === "CRITICAL").length;
  const high = gaps.filter(g => normalizeLevel(g.level) === "HIGH").length;
  const medium = gaps.filter(g => normalizeLevel(g.level) === "MEDIUM").length;
  const low = gaps.filter(g => normalizeLevel(g.level) === "LOW").length;
  const critRisks = RAW.risks.filter(r => r.residual === "CRITICAL").length;
  const totalBudget = RAW.budget.reduce((a, b) => a + b.allocated, 0);
  const openActions = RAW.budget.filter(b => b.status === "OPEN").length;
  const inProgress = RAW.budget.filter(b => b.status === "In Progress").length;

  // Pie data
  const pieSeverity = [
    { id: "CRITICAL", label: "CRITICAL", value: critical, color: T.criminal },
    { id: "HIGH", label: "HIGH", value: high, color: T.high },
    { id: "MEDIUM", label: "MEDIUM", value: medium, color: T.medium },
    { id: "LOW", label: "LOW", value: low, color: T.low },
  ].filter(d => d.value > 0);

  // Gaps by domain bar
  const domainMap = { "Art.20 Governance": "Art.20", "Art.21 Gap Analysis": "Art.21", "Missing Gaps": "Missing", "Remediation Roadmap": "Roadmap" };
  const domainBar = Object.entries(domainMap).map(([full, short]) => {
    const d = gaps.filter(g => g.domain === full);
    return {
      domain: short,
      CRITICAL: d.filter(g => normalizeLevel(g.level) === "CRITICAL").length,
      HIGH: d.filter(g => normalizeLevel(g.level) === "HIGH").length,
      MEDIUM: d.filter(g => normalizeLevel(g.level) === "MEDIUM").length,
      LOW: d.filter(g => normalizeLevel(g.level) === "LOW").length,
    };
  });

  // Compliance radar
  const radarData = [
    { domain: "Art.20 Gov", score: 0 },
    { domain: "Risk Mgmt", score: 22 },
    { domain: "Incident", score: 15 },
    { domain: "BC/DR", score: 30 },
    { domain: "Supply Chain", score: 10 },
    { domain: "Access Ctrl", score: 35 },
    { domain: "Crypto", score: 55 },
    { domain: "DORA", score: 8 },
    { domain: "PSNC", score: 5 },
    { domain: "Training", score: 0 },
  ];

  // Budget bullet
  const bulletData = [{
    id: "Budget",
    ranges: [totalBudget * 0.5, totalBudget * 0.75, totalBudget],
    measures: [0],
    markers: [totalBudget * 0.3],
  }];

  // Status line (mock monthly progress)
  const lineData = [
    { id: "Open", color: T.criminal, data: [
      { x: "Jan", y: 48 }, { x: "Feb", y: 50 }, { x: "Mar", y: 56 },
      { x: "Q2 est.", y: 40 }, { x: "Q3 est.", y: 25 }, { x: "Q4 est.", y: 10 },
    ]},
    { id: "Resolved", color: T.low, data: [
      { x: "Jan", y: 2 }, { x: "Feb", y: 4 }, { x: "Mar", y: 5 },
      { x: "Q2 est.", y: 18 }, { x: "Q3 est.", y: 34 }, { x: "Q4 est.", y: 48 },
    ]},
  ];

  return (
    <div>
      <AlertBar type="critical" title="IMMEDIATE — CVCN Pending (ION Cloud AST-002): 45-day PSNC rule at risk. Criminal prosecution exposure."
        text="Daily ACN escalation required (ACT-003). Board interim risk acceptance needed (RSK-008). DORA 4h notification template missing (MG-014)." />
      <AlertBar type="warning" title="BOARD TRAINING AT 0% — Personal liability under NIS2 Art.20. All 5 board members at risk. Mar 2026 deadline."
        text="Training programme not scheduled (ACT-002). Board resolution on Art.21 measures not signed (GOV-001)." />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Critical Gaps" value={critical} sub="Immediate action" color={T.criminal} pulse />
        <KPI label="High Gaps" value={high} sub="Priority remediation" color={T.high} />
        <KPI label="Total Gaps" value={gaps.length} sub="All domains" color={T.accent} />
        <KPI label="Critical Risks" value={critRisks} sub="Incl. CVCN criminal" color={T.criminal} pulse />
        <KPI label="Medium Gaps" value={medium} sub="Scheduled action" color={T.medium} />
        <KPI label="Low Gaps" value={low} sub="Monitor" color={T.low} />
        <KPI label="Programme Budget" value="€146k" sub={`${openActions} open / ${inProgress} in progress`} color={T.accent} />
        <KPI label="Board Training" value="0%" sub="Art.20 personal liability" color={T.criminal} pulse />
      </div>

      {/* Row 1: Pie + Bar + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 12, marginBottom: 12 }}>
        <Card title="Gap Severity">
          <div style={{ height: 200 }}>
            <ResponsivePie
              data={pieSeverity}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.62}
              padAngle={2}
              cornerRadius={3}
              colors={({ data }) => data.color}
              borderWidth={0}
              theme={NT}
              enableArcLinkLabels={false}
              arcLabelsTextColor="#fff"
              arcLabelsSkipAngle={15}
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
              <div key={d.id} onClick={() => setFilter({ key: "level", val: d.id })} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", padding: "3px 6px", borderRadius: 3, transition: "background 0.15s" }}
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
              data={domainBar}
              keys={["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
              indexBy="domain"
              margin={{ top: 10, right: 100, bottom: 30, left: 30 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={[T.criminal, T.high, T.medium, T.low]}
              theme={NT}
              stacked={true}
              borderRadius={2}
              axisBottom={{ tickSize: 0, tickPadding: 8, tickRotation: 0 }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
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

        <Card title="Compliance Radar" style={{ overflow: "hidden" }}>
          <div style={{ height: 240 }}>
            <ResponsiveRadar
              data={radarData}
              keys={["score"]}
              indexBy="domain"
              maxValue={100}
              margin={{ top: 48, right: 90, bottom: 48, left: 90 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={T.accent}
              gridLevels={4}
              gridShape="circular"
              gridLabelOffset={16}
              enableDots={true}
              dotSize={6}
              dotColor={T.accent}
              dotBorderWidth={0}
              colors={[T.accent]}
              fillOpacity={0.12}
              blendMode="normal"
              animate={true}
              theme={{
                ...NT,
                text: { ...NT.text, fontSize: 9 },
              }}
              gridLabel={({ id, anchor }) => (
                <text textAnchor={anchor} dominantBaseline="central" style={{ fontSize: 9, fill: T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{id}</text>
              )}
            />
          </div>
        </Card>
      </div>

      {/* Row 2: Line + Waffle + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Card title="Remediation Trajectory (Actual + Forecast)">
          <div style={{ height: 180 }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 10, right: 80, bottom: 40, left: 40 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: 60 }}
              curve="monotoneX"
              axisBottom={{ tickSize: 0, tickPadding: 8 }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              colors={d => d.color}
              lineWidth={2}
              enablePoints={true}
              pointSize={6}
              pointColor={({ serieColor }) => serieColor}
              pointBorderWidth={0}
              enableArea={true}
              areaOpacity={0.08}
              theme={NT}
              legends={[{ anchor: "bottom-right", direction: "column", translateX: 80, itemWidth: 70, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10, symbolShape: "circle" }]}
              defs={[
                { id: "open-grad", type: "linearGradient", colors: [{ offset: 0, color: T.criminal, opacity: 0.4 }, { offset: 100, color: T.criminal, opacity: 0 }] },
                { id: "resolved-grad", type: "linearGradient", colors: [{ offset: 0, color: T.low, opacity: 0.4 }, { offset: 100, color: T.low, opacity: 0 }] },
              ]}
              fill={[{ match: { id: "Open" }, id: "open-grad" }, { match: { id: "Resolved" }, id: "resolved-grad" }]}
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
                { id: "Completed", label: "Completed", value: 0, color: T.low },
                { id: "Not Started", label: "Not Started", value: 13, color: T._mode === "dark" ? `${T.criminal}50` : `${T.criminal}35` },
              ]}
              total={13}
              rows={3}
              columns={5}
              padding={2}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              colors={d => d.color}
              borderRadius={2}
              fillDirection="left"
              theme={NT}
            />
          </div>
          <div style={{ fontSize: 11, color: T.criminal, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>0/13 — 0% complete</div>
          <div style={{ fontSize: 10, color: T.muted, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace" }}>Target: Board 100% by Mar 2026</div>
        </Card>

        <Card title="Programme Status">
          <StatRow label="Critical open" value={critical} color={T.criminal} />
          <StatRow label="In progress" value={inProgress} color={T.accent} />
          <StatRow label="Risks total" value={RAW.risks.length} />
          <StatRow label="Evidence missing" value={RAW.evidence.filter(e => e.status === "REQUIRED").length} color={T.high} />
          <StatRow label="Criminal risk items" value={RAW.evidence.filter(e => e.status === "CRIMINAL RISK").length} color={T.criminal} />
          <StatRow label="Budget allocated" value={fmt(totalBudget)} color={T.accent} />
        </Card>
      </div>
    </div>
  );
};

// — — — Gap Register — — —
const GapsView = ({ filter, setFilter }) => {
  const T = useTheme();
  const NT = makeNivo(T);
  const [sevFilter, setSevFilter] = useState(filter?.key === "level" ? filter.val : "");
  const [domFilter, setDomFilter] = useState(filter?.key === "domain" ? filter.val : "");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const domainShort = { "Art.20 Governance": "Art.20", "Art.21 Gap Analysis": "Art.21", "Missing Gaps": "Missing", "Remediation Roadmap": "Roadmap" };
  const owners = [...new Set(RAW.gaps.map(g => g.owner).filter(Boolean))].slice(0, 12);

  const filtered = useMemo(() => RAW.gaps.filter(g => {
    if (sevFilter && normalizeLevel(g.level) !== sevFilter) return false;
    if (domFilter && domFilter !== domainShort[g.domain] && domFilter !== g.domain) return false;
    if (ownerFilter && g.owner !== ownerFilter) return false;
    if (search) {
      const hay = (g.id + g.requirement + g.state + g.owner + g.ref).toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [sevFilter, domFilter, ownerFilter, search]);

  // Owner burden chart
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

  const columns = [
    { key: "id", label: "ID", width: 100, render: v => <span style={{ color: T.accent, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "domain", label: "Domain", width: 100, render: v => <Badge label={domainShort[v] || v} color={T.dimmed} /> },
    { key: "ref", label: "NIS2 Ref", width: 90 },
    { key: "requirement", label: "Requirement", width: 280, wrap: true },
    { key: "state", label: "Current State", width: 200, wrap: true, render: v => <span style={{ color: T.high }}>{v}</span> },
    { key: "level", label: "Severity", width: 110, render: v => <LevelBadge level={v} /> },
    { key: "target", label: "Target", width: 90 },
    { key: "owner", label: "Owner", width: 130 },
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
        <KPI label="Filtered Gaps" value={filtered.length} color={T.accent} />
        <KPI label="Critical" value={filtered.filter(g => normalizeLevel(g.level) === "CRITICAL").length} color={T.criminal} />
        <KPI label="High" value={filtered.filter(g => normalizeLevel(g.level) === "HIGH").length} color={T.high} />
        <KPI label="Open Actions" value={filtered.filter(g => g.status?.includes("OPEN")).length} color={T.high} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Owner Burden (Critical + High)">
          <div style={{ height: 200 }}>
            <ResponsiveBar
              data={ownerData}
              keys={["CRITICAL", "HIGH", "MEDIUM"]}
              indexBy="owner"
              layout="horizontal"
              margin={{ top: 5, right: 70, bottom: 20, left: 145 }}
              padding={0.3}
              colors={[T.criminal, T.high, T.medium]}
              theme={NT}
              borderRadius={2}
              axisLeft={{ tickSize: 0, tickPadding: 8, format: v => v.length > 17 ? v.substring(0, 16) + "…" : v }}
              axisBottom={{ tickSize: 0, tickPadding: 6 }}
              enableLabel={false}
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
              data={Object.entries(domainShort).map(([full, short]) => ({
                id: short, label: short,
                value: RAW.gaps.filter(g => g.domain === full).length,
                color: [T.criminal, T.accent, T.medium, T.high][Object.keys(domainShort).indexOf(full)],
              }))}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.55}
              padAngle={2}
              cornerRadius={3}
              colors={({ data }) => data.color}
              theme={NT}
              enableArcLinkLabels={true}
              arcLinkLabelsTextColor={T.muted}
              arcLinkLabelsThickness={1}
              arcLinkLabelsColor={T.border}
              arcLabelsSkipAngle={20}
              arcLabelsTextColor="#fff"
              onClick={d => setDomFilter(d.id === domFilter ? "" : d.id)}
            />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <Sel val={sevFilter} onChange={setSevFilter} options={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} placeholder="All Severities" />
        <Sel val={domFilter} onChange={setDomFilter} options={Object.values(domainShort)} placeholder="All Domains" />
        <Sel val={ownerFilter} onChange={setOwnerFilter} options={owners} placeholder="All Owners" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: "6px 12px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", outline: "none", minWidth: 200 }} />
        {(sevFilter || domFilter || ownerFilter || search) && (
          <button onClick={() => { setSevFilter(""); setDomFilter(""); setOwnerFilter(""); setSearch(""); }}
            style={{ background: T.critLo, border: `1px solid ${T.criminal}30`, color: T.criminal, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            ✕ Clear
          </button>
        )}
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>{filtered.length} / {RAW.gaps.length} rows</span>
      </div>

      <DataTable columns={columns} rows={filtered} onRowClick={row => setModal({ type: "gap", row })} maxHeight={480} />
    </div>
  );
};

// — — — Risk Register — — —
const RisksView = () => {
  const T = useTheme();
  const NT = makeNivo(T);

  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("");

  const filtered = RAW.risks.filter(r => !filter || r.residual === filter);

  // Scatter for risk matrix
  const scatterData = useMemo(() => [
    { id: "CRITICAL", color: T.criminal, data: RAW.risks.filter(r => r.residual === "CRITICAL").map(r => ({ x: r.i, y: r.l, risk: r })) },
    { id: "High", color: T.high, data: RAW.risks.filter(r => r.residual === "High").map(r => ({ x: r.i, y: r.l, risk: r })) },
    { id: "Medium", color: T.medium, data: RAW.risks.filter(r => r.residual === "Medium").map(r => ({ x: r.i, y: r.l, risk: r })) },
  ], []);

  // Heatmap (likelihood × impact grid)
  const heatData = useMemo(() => {
    return Array.from({ length: 5 }, (_, yi) => {
      const l = 5 - yi;
      return {
        id: `L${l}`,
        data: Array.from({ length: 5 }, (_, xi) => {
          const i = xi + 1;
          const score = l * i;
          const count = RAW.risks.filter(r => r.l === l && r.i === i).length;
          return { x: `I${i}`, y: count };
        }),
      };
    });
  }, []);

  // Bullet charts for top risks
  const topRisks = [...RAW.risks].sort((a, b) => b.inherent - a.inherent).slice(0, 6);

  const columns = [
    { key: "id", label: "ID", width: 90, render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "desc", label: "Description", width: 260, wrap: true },
    { key: "ttp", label: "TTP", width: 90, render: v => <Badge label={v} color={T.medium} /> },
    { key: "l", label: "L", width: 40, render: v => <span style={{ color: T.high, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "i", label: "I", width: 40, render: v => <span style={{ color: T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
    { key: "inherent", label: "Inherent", width: 70, render: v => <span style={{ color: scoreColor(v, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/25</span> },
    { key: "residual", label: "Residual", width: 100, render: v => <LevelBadge level={v} /> },
    { key: "postTreatment", label: "Post-Treat", width: 80, render: v => <span style={{ color: scoreColor(v, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/25</span> },
    { key: "owner", label: "Owner", width: 140 },
    { key: "review", label: "Review", width: 110 },
  ];

  return (
    <div>
      <Modal data={modal} onClose={() => setModal(null)} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Risks" value={RAW.risks.length} color={T.accent} />
        <KPI label="CRITICAL" value={RAW.risks.filter(r => r.residual === "CRITICAL").length} color={T.criminal} pulse />
        <KPI label="HIGH" value={RAW.risks.filter(r => r.residual === "High").length} color={T.high} />
        <KPI label="Max Inherent Score" value="20/25" color={T.criminal} sub="RSK-001 Ransomware" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Scatter risk matrix */}
        <Card title="Risk Matrix — Likelihood × Impact">
          <div style={{ height: 320 }}>
            <ResponsiveScatterPlot
              data={scatterData}
              margin={{ top: 20, right: 100, bottom: 50, left: 55 }}
              xScale={{ type: "linear", min: 0.5, max: 5.5 }}
              yScale={{ type: "linear", min: 0.5, max: 5.5 }}
              axisBottom={{ legend: "Impact →", legendOffset: 40, legendPosition: "middle", tickValues: [1, 2, 3, 4, 5], tickSize: 0 }}
              axisLeft={{ legend: "← Likelihood", legendOffset: -45, legendPosition: "middle", tickValues: [1, 2, 3, 4, 5], tickSize: 0 }}
              colors={d => d.serieColor}
              nodeSize={22}
              theme={NT}
              legends={[{ anchor: "bottom-right", direction: "column", translateX: 96, itemWidth: 88, itemHeight: 20, itemTextColor: T.muted, symbolSize: 12 }]}
              onClick={({ data }) => data.risk && setModal({ type: "risk", row: data.risk })}
              tooltip={({ node }) => node.data.risk ? (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: node.color }}>{node.data.risk.id}</strong><br />
                  <span style={{ color: T.muted }}>{node.data.risk.desc.substring(0, 50)}…</span><br />
                  Score: <strong>{node.data.risk.inherent}</strong>
                </div>
              ) : null}
              layers={[
                // background quadrants
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
                      {r.id.replace("RSK-", "")}
                    </text>
                  </g>
                );
              }}
            />
          </div>
        </Card>

        {/* Heatmap */}
        <Card title="Risk Count Heatmap">
          <div style={{ height: 320 }}>
            <ResponsiveHeatMap
              data={heatData}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              valueFormat=">-.0s"
              axisTop={null}
              axisBottom={{ tickSize: 0, legend: "Impact →", legendOffset: 35, legendPosition: "middle" }}
              axisLeft={{ tickSize: 0, legend: "← Likelihood", legendOffset: -35, legendPosition: "middle" }}
              colors={{
                type: "sequential",
                scheme: "reds",
                minValue: 0,
                maxValue: 3,
              }}
              emptyColor={T.surface2}
              borderRadius={3}
              borderWidth={1}
              borderColor={T.bg}
              theme={NT}
              label={({ value }) => value > 0 ? value : ""}
              labelTextColor="#fff"
              tooltip={({ cell }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  {cell.serieId} × {cell.data.x}: <strong>{cell.value} risk{cell.value !== 1 ? "s" : ""}</strong>
                </div>
              )}
            />
          </div>
        </Card>
      </div>

      {/* Bullet charts */}
      <Card title="Top Risks — Inherent vs Post-Treatment Score" style={{ marginBottom: 12 }}>
        <div style={{ height: 220 }}>
          <ResponsiveBullet
            data={topRisks.map(r => ({
              id: r.id,
              ranges: [r.postTreatment, (r.inherent + r.postTreatment) / 2, 25],
              measures: [r.inherent],
              markers: [r.postTreatment],
            }))}
            margin={{ top: 10, right: 40, bottom: 20, left: 80 }}
            spacing={24}
            titleAlign="end"
            titleOffsetX={-16}
            measureSize={0.6}
            markerSize={1}
            rangeColors={["green", "yellow", "red"].map(c => `${({ green: T.low, yellow: T.medium, red: T.criminal })[c]}25`)}
            measureColors={[T.accent]}
            markerColors={[T.low]}
            theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
          />
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
          <span style={{ color: T.accent }}>■ Inherent score</span>
          <span style={{ color: T.low }}>| Post-treatment target</span>
          <span style={{ color: T.criminal }}>■ High zone (≥16)</span>
        </div>
      </Card>

      {/* Filter + Table */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", "CRITICAL", "High", "Medium"].map(v => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ background: filter === v ? T.accentLo : T.surface2, border: `1px solid ${filter === v ? T.accent : T.border}`, color: filter === v ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            {v || "All"} {v && `(${RAW.risks.filter(r => r.residual === v).length})`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} onRowClick={row => setModal({ type: "risk", row })} maxHeight={400} />
    </div>
  );
};

// — — — Assets — — —
const AssetsView = () => {
  const T = useTheme();
  const NT = makeNivo(T);

  const [typeF, setTypeF] = useState("");
  const [critF, setCritF] = useState("");

  const filtered = RAW.assets.filter(a => {
    if (typeF && a.type !== typeF) return false;
    if (critF && a.criticality !== critF) return false;
    return true;
  });

  // TreeMap data
  const treeData = {
    name: "Assets",
    children: ["Critical", "Important", "Ordinary"].map(c => ({
      name: c,
      children: RAW.assets.filter(a => a.criticality === c).map(a => ({
        name: a.name.substring(0, 20),
        id: a.id,
        size: a.risk * 10 + 5,
        criticality: c,
        cvcn: a.cvcn,
      })),
    })).filter(c => c.children.length > 0),
  };

  const crit = RAW.assets.filter(a => a.criticality === "Critical").length;
  const cvcnIssues = RAW.assets.filter(a => a.cvcn.includes("Pending") || a.cvcn.includes("Not Started")).length;
  const psnc = RAW.assets.filter(a => a.psnc).length;
  const drIssues = RAW.assets.filter(a => a.drTested?.includes("⚠️")).length;

  // Bar by type + criticality
  const typeBar = ["Asset", "Vendor"].map(t => ({
    type: t,
    Critical: RAW.assets.filter(a => a.type === t && a.criticality === "Critical").length,
    Important: RAW.assets.filter(a => a.type === t && a.criticality === "Important").length,
    Ordinary: RAW.assets.filter(a => a.type === t && a.criticality === "Ordinary").length,
  }));

  const columns = [
    { key: "id", label: "ID", width: 90, render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "type", label: "Type", width: 70, render: v => <Badge label={v} color={T.dimmed} /> },
    { key: "name", label: "Name", width: 200, wrap: true },
    { key: "criticality", label: "NIS2 Class", width: 100, render: v => <LevelBadge level={v === "Critical" ? "CRITICAL" : v === "Important" ? "MEDIUM" : "LOW"} /> },
    { key: "psnc", label: "PSNC", width: 60, render: v => v ? <Badge label="Yes" color={T.high} /> : <span style={{ color: T.muted }}>—</span> },
    { key: "cvcn", label: "CVCN Status", width: 170, render: v => <span style={{ color: (v?.includes("Pending") || v?.includes("Not Started")) ? T.criminal : v?.includes("Approved") ? T.low : T.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{v}</span> },
    { key: "dora", label: "DORA Tier", width: 100 },
    { key: "drTested", label: "DR Tested", width: 200, wrap: true, render: v => <span style={{ color: v?.includes("✅") ? T.low : v?.includes("⚠️") ? T.medium : T.muted }}>{v}</span> },
    { key: "risk", label: "Risk", width: 60, render: v => <span style={{ color: scoreColor(v * 4, T), fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}/5</span> },
  ];

  return (
    <div>
      <AlertBar type="critical" title="AST-002 ION Cloud: CVCN PENDING — 45-day PSNC deadline at criminal risk. Daily ACN escalation required. (RSK-008)" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Records" value={RAW.assets.length} color={T.accent} />
        <KPI label="Critical Assets" value={crit} color={T.criminal} />
        <KPI label="PSNC Strategic" value={psnc} color={T.high} />
        <KPI label="CVCN Issues" value={cvcnIssues} color={T.criminal} pulse />
        <KPI label="DR Not Documented" value={drIssues} color={T.medium} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Treemap — spans 2 cols */}
        <Card title="Asset Inventory Treemap" style={{ gridColumn: "span 2" }}>
          <div style={{ height: 280 }}>
            <ResponsiveTreeMap
              data={treeData}
              identity="name"
              value="size"
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              labelSkipSize={18}
              label={({ data }) => data.id || data.name}
              labelTextColor="#FFFFFF"
              parentLabelTextColor="rgba(255,255,255,0.8)"
              parentLabelSize={11}
              colors={({ data }) => {
                if (data.cvcn?.includes("Pending") || data.cvcn?.includes("Not Started")) return T.criminal;
                if (data.criticality === "Critical") return `${T.high}99`;
                if (data.criticality === "Important") return `${T.medium}70`;
                return `${T.low}50`;
              }}
              borderColor={T.bg}
              borderWidth={2}
              theme={NT}
              tooltip={({ node }) => (
                <div style={{ ...NT.tooltip.container, padding: "8px 12px" }}>
                  <strong style={{ color: T.text }}>{node.data.id || node.data.name}</strong><br />
                  <span style={{ color: T.muted }}>Criticality: {node.data.criticality}</span><br />
                  <span style={{ color: T.muted }}>CVCN: {node.data.cvcn || "—"}</span>
                </div>
              )}
            />
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: T.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>
            <span style={{ color: T.criminal }}>■ CVCN Pending</span>
            <span style={{ color: T.high }}>■ Critical</span>
            <span style={{ color: T.medium }}>■ Important</span>
            <span style={{ color: T.low }}>■ Ordinary</span>
          </div>
        </Card>

        {/* Right column: stacked mini-cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card title="Type × Criticality">
            <div style={{ height: 170 }}>
              <ResponsiveBar
                data={typeBar}
                keys={["Critical", "Important", "Ordinary"]}
                indexBy="type"
                margin={{ top: 8, right: 84, bottom: 28, left: 28 }}
                padding={0.3}
                colors={[T.criminal, T.medium, T.low]}
                theme={NT}
                borderRadius={3}
                axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4 }}
                axisBottom={{ tickSize: 0, tickPadding: 6 }}
                enableLabel={true}
                labelTextColor="#fff"
                labelSkipHeight={14}
                legends={[{ dataFrom: "keys", anchor: "bottom-right", direction: "column", translateX: 84, itemWidth: 80, itemHeight: 16, itemTextColor: T.muted, symbolSize: 9, symbolShape: "square" }]}
              />
            </div>
          </Card>

          <Card title="CVCN Status Breakdown">
            <div style={{ height: 120 }}>
              <ResponsivePie
                data={[
                  { id: "Approved", label: "Approved", value: RAW.assets.filter(a => a.cvcn === "Approved").length, color: T.low },
                  { id: "Pending/Risk", label: "Pending/Risk", value: RAW.assets.filter(a => a.cvcn.includes("Pending") || a.cvcn.includes("Not Started")).length, color: T.criminal },
                  { id: "N/A", label: "N/A", value: RAW.assets.filter(a => a.cvcn === "N/A").length, color: T.dimmed },
                ]}
                margin={{ top: 6, right: 80, bottom: 6, left: 6 }}
                innerRadius={0.58}
                padAngle={3}
                cornerRadius={2}
                colors={({ data }) => data.color}
                theme={NT}
                enableArcLinkLabels={false}
                arcLabelsSkipAngle={20}
                arcLabelsTextColor="#fff"
                legends={[{ anchor: "right", direction: "column", translateX: 78, itemWidth: 72, itemHeight: 16, itemTextColor: T.muted, symbolSize: 9 }]}
              />
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["", "Asset", "Vendor"].map(v => (
          <button key={v} onClick={() => setTypeF(v)}
            style={{ background: typeF === v ? T.accentLo : T.surface2, border: `1px solid ${typeF === v ? T.accent : T.border}`, color: typeF === v ? T.text : T.muted, padding: "6px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            {v || "All Types"}
          </button>
        ))}
        {["", "Critical", "Important", "Ordinary"].map(v => (
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

// — — — Programme (Budget + Training + Evidence) — — —
const ProgrammeView = () => {
  const T = useTheme();
  const NT = makeNivo(T);

  const [tab, setTab] = useState("budget");

  const totalBudget = RAW.budget.reduce((a, b) => a + b.allocated, 0);
  const spent = RAW.budget.reduce((a, b) => a + b.spent, 0);
  const openActs = RAW.budget.filter(b => b.status === "OPEN").length;
  const inProg = RAW.budget.filter(b => b.status === "In Progress").length;
  const reqEv = RAW.evidence.filter(e => e.status === "REQUIRED").length;
  const crimEv = RAW.evidence.filter(e => e.status === "CRIMINAL RISK").length;

  // Budget bar
  const budgetBar = RAW.budget
    .filter(b => b.allocated > 0)
    .sort((a, b) => b.allocated - a.allocated)
    .slice(0, 12)
    .map(b => ({ id: b.id, action: b.action.substring(0, 35), allocated: b.allocated, spent: b.spent }));

  // Training waffle per category
  const trainCats = [
    { id: "Board (5)", label: "Board (5)", value: 5, color: `${T.criminal}50` },
    { id: "C-Suite (3)", label: "C-Suite (3)", value: 3, color: `${T.high}50` },
    { id: "IT Security (2)", label: "IT Security (2)", value: 2, color: `${T.medium}50` },
    { id: "Technical (2)", label: "Technical (2)", value: 2, color: `${T.accent}50` },
    { id: "General (1)", label: "General (1)", value: 1, color: `${T.low}50` },
  ];

  // Evidence pie
  const evPie = [
    { id: "REQUIRED", label: "REQUIRED", value: reqEv, color: T.high },
    { id: "CRIMINAL RISK", label: "CRIMINAL RISK", value: crimEv, color: T.criminal },
    { id: "RECOMMENDED", label: "RECOMMENDED", value: RAW.evidence.filter(e => e.status === "RECOMMENDED").length, color: T.medium },
  ];

  const budgetCols = [
    { key: "id", label: "ID", width: 90, render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "action", label: "Action", width: 300, wrap: true },
    { key: "owner", label: "Owner", width: 130 },
    { key: "allocated", label: "Allocated", width: 100, render: v => <span style={{ fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(v)}</span> },
    { key: "spent", label: "Spent", width: 80, render: v => <span style={{ color: T.low, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(v)}</span> },
    { key: "status", label: "Status", width: 110, render: v => <Badge label={v} color={v === "In Progress" ? T.accent : T.high} /> },
  ];

  const evCols = [
    { key: "id", label: "ID", width: 90, render: v => <span style={{ color: T.accent }}>{v}</span> },
    { key: "desc", label: "Description", width: 300, wrap: true },
    { key: "related", label: "Related", width: 140, render: v => <span style={{ color: T.accent, fontSize: 10 }}>{v}</span> },
    { key: "ref", label: "NIS2 Ref", width: 100 },
    { key: "status", label: "Status", width: 130, render: v => <Badge label={v} color={v === "CRIMINAL RISK" ? T.criminal : v === "REQUIRED" ? T.high : T.medium} /> },
  ];

  const trainCols = [
    { key: "name", label: "Name", width: 130 },
    { key: "role", label: "Role", width: 200 },
    { key: "category", label: "Category", width: 130, render: v => <Badge label={v} color={v === "Board" ? T.criminal : v === "C-Suite / Technical" ? T.high : T.accent} /> },
    { key: "type", label: "Training Type", width: 280, wrap: true },
    { key: "status", label: "Status", width: 120, render: () => <Badge label="Not Started" color={T.criminal} /> },
    { key: "due", label: "Deadline", width: 90, render: v => <span style={{ color: T.criminal, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span> },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 16 }}>
        <KPI label="Total Budget" value={fmt(totalBudget)} color={T.accent} sub="Programme total" />
        <KPI label="Spent" value={fmt(spent)} color={T.low} sub="0% utilised" />
        <KPI label="Open Actions" value={openActs} color={T.high} />
        <KPI label="In Progress" value={inProg} color={T.accent} />
        <KPI label="Evidence Required" value={reqEv} color={T.high} />
        <KPI label="Criminal Risk Evidence" value={crimEv} color={T.criminal} pulse />
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
        {["budget", "training", "evidence"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "9px 18px", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? T.accent : "transparent"}`, color: tab === t ? T.text : T.muted, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: -1 }}>
            {t === "budget" ? "💶 Budget" : t === "training" ? "🎓 Training" : "📁 Evidence"}
          </button>
        ))}
      </div>

      {tab === "budget" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Card title="Budget Allocation by Action (Top 12)">
              <div style={{ height: 320 }}>
                <ResponsiveBar
                  data={budgetBar}
                  keys={["allocated", "spent"]}
                  indexBy="id"
                  layout="horizontal"
                  margin={{ top: 5, right: 20, bottom: 52, left: 80 }}
                  padding={0.3}
                  colors={[T.accent, T.low]}
                  theme={NT}
                  borderRadius={2}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  axisBottom={{ tickSize: 0, tickPadding: 6, format: v => `€${(v / 1000).toFixed(0)}k` }}
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
                    { id: "OPEN", label: "OPEN", value: openActs, color: T.high },
                    { id: "In Progress", label: "In Progress", value: inProg, color: T.accent },
                  ]}
                  margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
                  innerRadius={0.6}
                  padAngle={3}
                  cornerRadius={3}
                  colors={({ data }) => data.color}
                  theme={NT}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#fff"
                  legends={[{ anchor: "bottom", direction: "row", translateY: 48, itemWidth: 90, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                />
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <StatRow label="Total allocated" value={fmt(totalBudget)} color={T.accent} />
              <StatRow label="Largest action" value="€80k (TLPT)" />
              <StatRow label="Zero-cost actions" value={RAW.budget.filter(b => b.allocated === 0).length} />
            </Card>
          </div>
          <DataTable columns={budgetCols} rows={RAW.budget} maxHeight={360} />
        </div>
      )}

      {tab === "training" && (
        <div>
          <AlertBar type="critical" title="ALL 13 TRAINING RECORDS NOT STARTED — Personal liability risk for all board members (NIS2 Art.20)" text="Mar 2026 deadline for board. Target: 100% board, >95% all staff. Phishing click rate target: <5%." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Card title="Completion by Category">
              <div style={{ height: 200 }}>
                <ResponsiveWaffle
                  data={trainCats}
                  total={13}
                  rows={3}
                  columns={5}
                  padding={3}
                  margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                  colors={d => d.color}
                  borderRadius={3}
                  fillDirection="left"
                  theme={NT}
                  legends={[{ anchor: "bottom", direction: "row", translateY: 28, itemWidth: 110, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                />
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: T.criminal, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>0 / 13 completed</div>
            </Card>
            <Card title="Deadline Targets">
              <StatRow label="Board (5) — Art.20 liability" value="Mar 2026" color={T.criminal} />
              <StatRow label="C-Suite (3)" value="Mar–Apr 2026" color={T.high} />
              <StatRow label="IT Security (2)" value="Mar–Apr 2026" color={T.high} />
              <StatRow label="Technical (2)" value="May 2026" color={T.medium} />
              <StatRow label="General Staff" value="Jun 2026" color={T.accent} />
              <Divider style={{ margin: "10px 0" }} />
              <StatRow label="Overall target" value=">95% by Jun 2026" />
              <StatRow label="Phishing sim target" value="<5% click rate" />
              <StatRow label="Refresher frequency" value="Annual + post-incident" />
            </Card>
          </div>
          <DataTable columns={trainCols} rows={RAW.training} maxHeight={360} />
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
                  innerRadius={0.6}
                  padAngle={3}
                  cornerRadius={3}
                  colors={({ data }) => data.color}
                  theme={NT}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#fff"
                  legends={[{ anchor: "bottom", direction: "row", translateY: 48, itemWidth: 110, itemHeight: 18, itemTextColor: T.muted, symbolSize: 10 }]}
                />
              </div>
            </Card>
            <Card title="Evidence Registry Info">
              <StatRow label="Total evidence items" value={RAW.evidence.length} color={T.accent} />
              <StatRow label="REQUIRED (mandatory)" value={reqEv} color={T.high} />
              <StatRow label="CRIMINAL RISK" value={crimEv} color={T.criminal} />
              <StatRow label="RECOMMENDED" value={RAW.evidence.filter(e => e.status === "RECOMMENDED").length} color={T.medium} />
              <Divider style={{ margin: "10px 0" }} />
              <StatRow label="Upload status" value="0 / 23 uploaded" color={T.criminal} />
              <StatRow label="ACN audit readiness" value="NOT READY" color={T.criminal} />
            </Card>
          </div>
          <DataTable columns={evCols} rows={RAW.evidence} maxHeight={400} />
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// EMBEDDED DATA — NEW MODULES
// ─────────────────────────────────────────────
const MATURITY = [
  { num:1,  article:"Art.20",        domain:"Board Governance & Personal Liability",       current:1, target:4, priority:"CRITICAL", state:"No board resolution or formal governance structure",           action:"Implement Board Cybersecurity Governance Policy + personal liability briefing", owner:"CEO / CISO",    target_date:"Mar 2026", status:"Initial" },
  { num:2,  article:"Art.20.2",      domain:"Mandatory Management Training",               current:1, target:3, priority:"HIGH",     state:"0% board training completion. No curriculum defined.",        action:"Engage external NIS2 trainer; complete board training by Mar 2026",              owner:"HR + CISO",     target_date:"Mar 2026", status:"Initial" },
  { num:3,  article:"Art.21.2.a",    domain:"Risk Analysis & Information Security Policies",current:2, target:4, priority:"HIGH",    state:"ISO 27001 ISMS exists but not NIS2-aligned. No TI feed.",     action:"Update risk templates; add D.Lgs.138/2024 mapping; threat intelligence feed",    owner:"CISO",          target_date:"Q2 2026",  status:"Significant Gap" },
  { num:4,  article:"Art.21.2.b",    domain:"Incident Handling",                           current:2, target:4, priority:"HIGH",     state:"IR Plan v1.3 exists. No 24h EW template or on-call tree.",   action:"Create EW/72h templates; link DORA Art.19; SIEM escalation trigger",             owner:"Head of IR",    target_date:"Q1 2026",  status:"Significant Gap" },
  { num:5,  article:"Art.21.2.c",    domain:"Business Continuity & Crisis Management",     current:3, target:4, priority:"MEDIUM",   state:"BC/DR plan exists; test results not documented.",             action:"Document BC test results; BIA for AST-001/003; crisis comms template",           owner:"Head of Infra", target_date:"Q3 2026",  status:"Minor Gap" },
  { num:6,  article:"Art.21.2.d",    domain:"Supply Chain Security",                       current:1, target:4, priority:"CRITICAL", state:"No DORA Art.30 clauses. CVCN pending for AST-002.",           action:"CVCN vetting; DORA contractual clauses; vendor risk scoring",                    owner:"CISO",          target_date:"Q2 2026",  status:"Initial" },
  { num:7,  article:"Art.21.2.e",    domain:"Vulnerability Management & Disclosure",       current:2, target:3, priority:"MEDIUM",   state:"No formal CVE triage SLAs. Patch process ad-hoc.",            action:"Adopt CVSS-based triage SLAs; automate patch reporting",                        owner:"Head of IT Infra",target_date:"Q2 2026", status:"Minor Gap" },
  { num:8,  article:"Art.21.2.f",    domain:"Cybersecurity Hygiene & Training (Staff)",    current:2, target:3, priority:"MEDIUM",   state:"Annual training exists but not board-mandated.",              action:"Board-endorsed training mandate; phishing simulation KPIs",                      owner:"HR + CISO",     target_date:"Apr 2026", status:"Minor Gap" },
  { num:9,  article:"Art.21.2.g",    domain:"Network Security & Zero Trust",               current:2, target:4, priority:"HIGH",     state:"Segmentation exists post-LockBit. No ZTNA.",                 action:"Deploy ZTNA (ACT-010); document network security baseline",                      owner:"Head of Network",target_date:"Q2 2026",  status:"Significant Gap" },
  { num:10, article:"Art.21.2.h",    domain:"Cryptography Policy",                         current:3, target:4, priority:"MEDIUM",   state:"AES-256 / TLS 1.3 deployed. No formal crypto policy doc.",   action:"Draft and board-approve Cryptography & Key Management Policy",                  owner:"Head of IT Infra",target_date:"Q2 2026", status:"Minor Gap" },
  { num:11, article:"Art.21.2.i",    domain:"Access Control & PAM",                        current:3, target:4, priority:"MEDIUM",   state:"CyberArk PAM deployed. No auto-revocation.",                 action:"Automate 24h PAM revocation on HR trigger; SIEM insider use-cases",             owner:"CISO / SOC",    target_date:"Q1 2026",  status:"Minor Gap" },
  { num:12, article:"Art.21.2.j",    domain:"Multi-Factor Authentication",                 current:3, target:4, priority:"MEDIUM",   state:"MFA enforced for privileged accounts. Not all SaaS.",        action:"Extend MFA to all SaaS platforms",                                              owner:"Head of IT Infra",target_date:"Q1 2026", status:"Minor Gap" },
  { num:13, article:"Art.23",        domain:"Incident Reporting (24h/72h/30d)",            current:1, target:4, priority:"CRITICAL", state:"No tested 24h EW template. No ACN portal submission tested.", action:"Build templates; tabletop exercise with ACN portal; dual DORA notify",          owner:"Head of IR",    target_date:"Q1 2026",  status:"Initial" },
  { num:14, article:"Art.27",        domain:"Registration with National Authority (ACN)",   current:2, target:4, priority:"HIGH",     state:"ACN registration not confirmed.",                             action:"Confirm ACN registration; assign NIS2 liaison",                                 owner:"Compliance",    target_date:"Mar 2026", status:"Significant Gap" },
  { num:15, article:"DORA Art.28-30",domain:"ICT Third-Party Risk",                        current:1, target:4, priority:"CRITICAL", state:"No DORA contractual clauses. CTO not assigned.",              action:"DORA CTO appointment; Art.30 clauses in all critical ICT contracts",            owner:"CISO",          target_date:"Q2 2026",  status:"Initial" },
  { num:16, article:"PSNC",          domain:"Perimeter National Cybersecurity",            current:2, target:4, priority:"HIGH",     state:"CVCN pending AST-002. 45-day rule at risk.",                  action:"Daily CVCN chase; PSNC asset update; ACN liaison appointed",                    owner:"Compliance",    target_date:"Mar 2026", status:"Significant Gap" },
];

const PHASES = [
  { id:"Phase 0", name:"Foundation & Scoping",          start:"Jan 2026", end:"Feb 2026", pct:100, status:"COMPLETE",     color_key:"low",    activities:["Appoint NIS2 workgroup","Register with ACN (Art.27)","Conduct NIS2 gap assessment","Classify assets (Essential/Important)"] },
  { id:"Phase 1", name:"Governance & Board Liability",  start:"Feb 2026", end:"Mar 2026", pct:35,  status:"AT RISK",      color_key:"criminal",activities:["Board resolution (GOV-001)","Board training Art.20.2","Legal liability briefing","Cybersecurity Governance Policy"] },
  { id:"Phase 2", name:"Risk Management Framework",     start:"Feb 2026", end:"Apr 2026", pct:50,  status:"IN PROGRESS",  color_key:"accent",  activities:["Update risk assessment (Art.21.2.a)","Align DORA ICT risk framework","Threat intelligence feed","Define risk appetite statement"] },
  { id:"Phase 3", name:"Incident Handling & Reporting", start:"Mar 2026", end:"Apr 2026", pct:20,  status:"AT RISK",      color_key:"high",    activities:["24h Early Warning template","72h Full Notification template","On-call escalation tree","ACN portal test & DORA dual-notify"] },
  { id:"Phase 4", name:"Supply Chain & Third-Party",    start:"Mar 2026", end:"Jun 2026", pct:15,  status:"AT RISK",      color_key:"high",    activities:["CVCN vetting (PSNC assets)","DORA Art.30 contractual clauses","Vendor risk questionnaires","Supplier resilience testing"] },
  { id:"Phase 5", name:"Technical Security Controls",   start:"Apr 2026", end:"Jun 2026", pct:10,  status:"AT RISK",      color_key:"criminal",activities:["MFA / ZTNA rollout (ACT-010)","TLPT / penetration testing","Immutable backup verification","Cryptography policy"] },
  { id:"Phase 6", name:"Business Continuity & DR",      start:"Apr 2026", end:"Jul 2026", pct:30,  status:"AT RISK",      color_key:"medium",  activities:["BIA mapping critical services","BC/DR test & documentation","Crisis communications template","RTO/RPO validation"] },
  { id:"Phase 7", name:"Audit Readiness & Sustainment", start:"Jun 2026", end:"Oct 2026", pct:5,   status:"AT RISK",      color_key:"medium",  activities:["Evidence repository complete","External audit dry-run","Quarterly review cycle","Continuous monitoring KPIs"] },
];

const POLICIES = [
  { id:"POL-001", title:"Board Cybersecurity Governance Policy",             ref:"Art.20",         category:"Governance",    approver:"CEO / Board",  drafted:false, reviewed:false, approved:false, notes:"Mandatory board-level policy" },
  { id:"POL-002", title:"NIS2 & DORA Acceptable Use Policy",                 ref:"Art.21",         category:"Security Policy",approver:"CISO",         drafted:false, reviewed:false, approved:false, notes:"" },
  { id:"POL-003", title:"Information Security Risk Management Policy",        ref:"Art.21.2.a",     category:"Risk",          approver:"CISO",         drafted:false, reviewed:false, approved:false, notes:"Must reference D.Lgs.138/2024" },
  { id:"POL-004", title:"Incident Response & Reporting Plan",                 ref:"Art.21.2.b/23",  category:"Incident",      approver:"Head of IR",   drafted:false, reviewed:false, approved:false, notes:"Covers 24h EW, 72h NTF, 30-day FR" },
  { id:"POL-005", title:"Business Continuity & Disaster Recovery Plan",       ref:"Art.21.2.c",     category:"BC/DR",         approver:"Head of Infra",drafted:false, reviewed:false, approved:false, notes:"BIA mapping required" },
  { id:"POL-006", title:"Supply Chain Security Policy",                       ref:"Art.21.2.d",     category:"Supply Chain",  approver:"CISO",         drafted:false, reviewed:false, approved:false, notes:"Vendor questionnaire attached" },
  { id:"POL-007", title:"Cryptography & Key Management Policy",               ref:"Art.21.2.h",     category:"Technical",     approver:"Head of IT Infra",drafted:false, reviewed:false, approved:false, notes:"TLS 1.3 + AES-256 standard" },
  { id:"POL-008", title:"Access Control & Privileged Access Management Policy",ref:"Art.21.2.i",   category:"Identity",      approver:"Head of IT Infra",drafted:false, reviewed:false, approved:false, notes:"MFA, ZTNA, CyberArk PAM" },
  { id:"POL-009", title:"Vulnerability Disclosure & Patch Management Policy", ref:"Art.21.2.e",     category:"Technical",     approver:"CISO",         drafted:false, reviewed:false, approved:false, notes:"CVE triage SLAs defined" },
  { id:"POL-010", title:"Network Security & Segmentation Policy",             ref:"Art.21.2.e",     category:"Technical",     approver:"Head of Network",drafted:false, reviewed:false, approved:false, notes:"" },
  { id:"POL-011", title:"Security Awareness & Training Policy",               ref:"Art.20.2",       category:"HR / Training", approver:"HR + CISO",    drafted:false, reviewed:false, approved:false, notes:"Board completion mandatory" },
  { id:"POL-012", title:"Data Classification & Retention Policy",             ref:"Art.21 / GDPR",  category:"Data",          approver:"DPO",          drafted:false, reviewed:false, approved:false, notes:"GDPR Art.32 alignment" },
  { id:"POL-013", title:"Backup & Recovery Policy",                           ref:"Art.21.2.c",     category:"BC/DR",         approver:"Head of Infra",drafted:false, reviewed:false, approved:false, notes:"Immutability certificates" },
  { id:"POL-014", title:"DORA ICT Third-Party Risk Management Policy",        ref:"DORA Art.28-30", category:"DORA",          approver:"CISO",         drafted:false, reviewed:false, approved:false, notes:"Critical ICT suppliers only" },
  { id:"POL-015", title:"PSNC / CVCN Asset Management Procedure",             ref:"PSNC / Art.21.2.f",category:"Supply Chain",approver:"Compliance",   drafted:false, reviewed:false, approved:false, notes:"45-day CVCN rule tracking" },
];

const INCIDENTS = [
  { id:"INC-2024-001", detected:"15 Jan 2024", resolved:"16 Jan 2024", title:"DDoS Attack on Market Data Gateway",           severity:"HIGH",     type:"DDoS / Availability",       assets:"AST-003",           significant:true, ew24:"Y", ntf72:"Y", report30:"Y", dora4h:"N", rootCause:"Hacktivist DDoS – Cloudflare scrubbing activated. 2.3h outage.",        lessons:"Upgraded to Cloudflare DDoS+ tier. Failover tested quarterly." },
  { id:"INC-2024-002", detected:"03 Mar 2024", resolved:"04 Mar 2024", title:"Phishing Campaign – BEC Attempt",              severity:"MEDIUM",   type:"Phishing / BEC",            assets:"All (email gw)",    significant:false,ew24:"N", ntf72:"N", report30:"N", dora4h:"N", rootCause:"Criminal BEC attempt targeting CFO. MFA prevented account compromise.", lessons:"Extended MFA to all SaaS platforms (ACT-010). Phishing simulation quarterly." },
  { id:"INC-2024-003", detected:"22 Jul 2024", resolved:"25 Jul 2024", title:"Ransomware – Isolated Dev Server",             severity:"CRITICAL", type:"Ransomware",                assets:"AST-002 (dev only)",significant:true, ew24:"Y", ntf72:"Y", report30:"Y", dora4h:"N", rootCause:"LockBit-affiliated actor. Dev environment only. Immutable backup restored in 4h.", lessons:"TLPT commissioned (ACT-007). ZTNA deployment accelerated." },
  { id:"INC-2024-004", detected:"11 Oct 2024", resolved:"11 Oct 2024", title:"Privileged Account Anomaly – False Positive",  severity:"LOW",      type:"Insider Threat (Suspected)",assets:"AST-005 (SIEM)",   significant:false,ew24:"N", ntf72:"N", report30:"N", dora4h:"N", rootCause:"SIEM alert – CyberArk flagged unusual PAM session. Confirmed authorised.", lessons:"PAM alerting rules tuned. No reporting required." },
  { id:"INC-2025-001", detected:"14 Feb 2025", resolved:"17 Feb 2025", title:"Supply Chain Compromise Attempt – Vendor Portal",severity:"HIGH",   type:"Supply Chain",              assets:"AST-001 via VND-003",significant:true, ew24:"Y", ntf72:"Y", report30:"Y", dora4h:"N", rootCause:"Nation-state-linked attempt via compromised vendor update. Blocked at CVCN checkpoint.", lessons:"DORA Art.30 clauses applied to all critical ICT vendors (ACT-013)." },
];

const SIGNIFICANCE = [
  { id:"SIG-01", category:"Service Downtime",           threshold:"Critical trading service unavailable ≥ 2 hours for ≥ 10% of users",           nis2:"Art.23", dora:"Art.18", example:"AST-001 down during EU market hours causing order rejection for 500+ clients" },
  { id:"SIG-02", category:"Users Affected",             threshold:"≥ 10% of total user base OR absolute threshold as set by ACN guidance",        nis2:"Art.23", dora:"Art.18", example:"8,000 of 80,000 users unable to access trading portal" },
  { id:"SIG-03", category:"Financial Impact",           threshold:"Direct financial loss ≥ €500,000",                                             nis2:"Art.23", dora:"Art.18", example:"System breach causes €600k direct trading losses + €150k IR costs" },
  { id:"SIG-04", category:"Malicious Intent",           threshold:"Confirmed criminal or malicious actor caused the incident",                    nis2:"Art.23", dora:"Art.18", example:"Forensic confirms LockBit-affiliated group deployed ransomware on AST-002" },
  { id:"SIG-05", category:"Cross-Border Impact",        threshold:"Incident affects services or users in ≥ 2 EU Member States",                   nis2:"Art.23", dora:"Art.18", example:"London and Milan offices both affected; French broker clients report data loss" },
  { id:"SIG-06", category:"Data Breach",                threshold:"Personal data or Strategic ICT asset data confirmed as exfiltrated",           nis2:"Art.23+GDPR Art.33", dora:"Art.18", example:"Customer KYC records exfiltrated; GDPR Art.33 triggered simultaneously" },
  { id:"SIG-07", category:"Reputational / Media",       threshold:"Incident has caused or likely to cause significant reputational damage",       nis2:"Art.23", dora:"Art.18", example:"Financial Times reports trading firm hit by cyber attack" },
  { id:"SIG-08", category:"Financial Market Stability", threshold:"Indication incident could affect Italian or EU financial market stability",    nis2:"Art.23", dora:"Art.18+ESMA", example:"AST-001 outage coincides with ECB rate announcement; Italian bond liquidity drops 40%" },
  { id:"SIG-09", category:"PSNC / CVCN Compromise",    threshold:"Any confirmed or suspected compromise of a PSNC Strategic asset",              nis2:"D.Lgs.105/2019 Art.1", dora:"—", example:"AST-002 (ION Cloud) shows signs of unauthorized access; PSNC reporting mandatory" },
  { id:"SIG-10", category:"DORA Major ICT Incident",    threshold:"Incident meets DORA major incident classification (per EBA/ESMA thresholds)", nis2:"DORA Art.18", dora:"DORA Art.19", example:"Prolonged AST-001 outage meets EBA/ESMA DORA major incident thresholds" },
  { id:"SIG-11", category:"Cumulative Incidents",       threshold:"Three or more related minor incidents within 30 days collectively meeting any single threshold", nis2:"Art.23+ACN Guidance", dora:"DORA Art.18", example:"Three phishing incidents in 30 days collectively affecting >15% of users" },
];

const CHECKLIST_ITEMS = [
  { id:"EW-01",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Determine if incident meets 'Significant' threshold (Significance Criteria)",  owner:"IR Manager",       evidence:"Significance Assessment form (SIG-01 to SIG-11 checklist)" },
  { id:"EW-02",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Confirm if incident is malicious/criminal in nature",                           owner:"IR Manager",       evidence:"Initial triage ticket in SIEM/ITSM with malicious indicator flag" },
  { id:"EW-03",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Assess cross-border impact (London, NY offices, EU clients)",                   owner:"IR Manager + Legal",evidence:"Cross-border impact assessment memo signed by IR Manager" },
  { id:"EW-04",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"⚠ TEST FIRST: Notify ACN / CSIRT Italia via csirt.gov.it portal",               owner:"CISO",             evidence:"ACN portal submission confirmation (ticket number + timestamp)" },
  { id:"EW-05",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Log ACN portal ticket reference number in Incident Log",                         owner:"IR Manager",       evidence:"ACN ticket reference logged in Incident Log" },
  { id:"EW-06",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Assess if DORA parallel notification required → Bank of Italy / ESAs",          owner:"Compliance",       evidence:"DORA parallel assessment memo; Bank of Italy notification if required" },
  { id:"EW-07",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"🆕 Assess if GDPR data breach notification required → Garante (72h rule)",      owner:"DPO + Compliance", evidence:"GDPR Art.33 preliminary assessment form signed by DPO" },
  { id:"EW-08",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"Activate Incident Response Team and open War Room",                             owner:"Head of IR",       evidence:"War Room activation log with attendee list and timestamp" },
  { id:"EW-09",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24h",  action:"🆕 Notify CEO / Board if incident is Critical (personal liability NIS2 Art.20)",owner:"CISO → CEO",       evidence:"Board notification email/Teams message with CISO timestamp" },
  { id:"EW-10",  phase:"PHASE 1: EARLY WARNING",  deadline:"< 24-48h",action:"🆕 Notify Cyber Insurance Provider per policy terms. Do NOT pay ransom without insurer auth.", owner:"CFO + Legal",    evidence:"Insurance portal notification confirmation; incident reference number" },
  { id:"IN-01",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"Provide initial severity assessment to ACN (severity, impact, first IoCs)", owner:"CISO",          evidence:"Severity assessment report submitted to ACN portal" },
  { id:"IN-02",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"Package and submit IoCs to ACN (IPs, hashes, domains, TTPs – STIX 2.1 preferred)", owner:"SOC Lead", evidence:"STIX 2.1 IoC package attached to 72h submission" },
  { id:"IN-03",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"Submit formal 72h Notification to ACN via unified portal",                owner:"CISO",             evidence:"72h notification submission confirmation from ACN portal" },
  { id:"IN-04",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"🆕 Submit DORA 4h notification to Bank of Italy if ICT financial assets affected", owner:"Compliance", evidence:"DORA 4h notification sent; Bank of Italy reference number" },
  { id:"IN-05",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"🆕 Share IoCs with FS-ISAC if member (cross-sector threat intel)",          owner:"SOC Lead",         evidence:"FS-ISAC threat intel submission confirmation" },
  { id:"IN-06",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"Update Incident Log with notification timestamps and ticket refs",           owner:"IR Manager",       evidence:"Updated Incident Log tab with all notification records" },
  { id:"IN-07",  phase:"PHASE 2: INCIDENT NOTIFICATION", deadline:"< 72h",  action:"Contain incident – isolate affected systems per IR Playbook",               owner:"SOC + IT Security", evidence:"Containment action log with system isolation timestamps" },
  { id:"FR-01",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Complete Root Cause Analysis (RCA) with technical timeline",                  owner:"SOC + IT Security", evidence:"Root Cause Analysis report signed by CISO and SOC Lead" },
  { id:"FR-02",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Document detailed technical timeline of the incident",                        owner:"IR Manager",        evidence:"Technical timeline document with log evidence" },
  { id:"FR-03",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Quantify final business and financial impact (trading losses, fines, remediation)", owner:"CFO + Compliance", evidence:"Financial impact report signed by CFO" },
  { id:"FR-04",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"List long-term mitigation and remediation steps with owners and dates",        owner:"CISO",             evidence:"Long-term remediation plan added to Remediation Roadmap tab" },
  { id:"FR-05",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Submit final report to ACN portal",                                            owner:"CISO",             evidence:"ACN portal final report submission confirmation" },
  { id:"FR-06",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Submit final DORA report to Lead Overseer (Bank of Italy / ESAs if applicable)",owner:"Compliance",       evidence:"DORA final report submitted to Bank of Italy / ESAs" },
  { id:"FR-07",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"🆕 Submit final GDPR report to Garante (if personal data was involved)",       owner:"DPO",              evidence:"GDPR final report submitted to Garante; reference number" },
  { id:"FR-08",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Conduct Post-Incident Review with management and board",                      owner:"CISO + Management", evidence:"Post-Incident Review minutes signed by board" },
  { id:"FR-09",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"Update Incident Log, Risk Register, and Remediation Roadmap",                 owner:"IR Manager",        evidence:"Updated Incident Log, Risk Register, and Roadmap" },
  { id:"FR-10",  phase:"PHASE 3: FINAL REPORT",   deadline:"< 1 month", action:"🆕 Complete Lessons Learned Log – feed findings into Risk Register, GAP Register, Training programme. Board sign-off required.", owner:"CISO + IR Manager", evidence:"Lessons Learned Report (signed); updated Risk Register version" },
];

const REG_CONTACTS = [
  { framework:"NIS2 – General Infrastructure",      authority:"CSIRT Italia (ACN)",              portal:"csirt.gov.it",          contact:"cert@csirt.gov.it", hotline:"+39 06 85264 115 | cert@csirt.gov.it | Portal: csirt.gov.it" },
  { framework:"DORA – Financial Services",          authority:"Bank of Italy / ESAs",            portal:"bancaditalia.it",        contact:"Supervised entity portal", hotline:"Bank of Italy: +39 06 47920400 | Secure entity portal login required" },
  { framework:"GDPR – Data Breach",                 authority:"Garante per la Protezione dei Dati",portal:"garanteprivacy.it",   contact:"Online notification form", hotline:"Garante Privacy: +39 06 69677.1 | garanteprivacy.it" },
];

// ─────────────────────────────────────────────
// — — — Maturity Tracker — — —
// ─────────────────────────────────────────────
const MaturityView = () => {
  const T = useTheme();
  const NT = makeNivo(T);
  const [selected, setSelected] = useState(null);

  const priorityColor = (p) => {
    if (p === "CRITICAL") return T.criminal;
    if (p === "HIGH") return T.high;
    if (p === "MEDIUM") return T.medium;
    return T.low;
  };

  const avgCurrent = (MATURITY.reduce((a, b) => a + b.current, 0) / MATURITY.length).toFixed(2);

  // Radar data
  const radarData = MATURITY.map(m => ({
    domain: m.article.replace("Art.", "").replace("DORA ", "D.").replace("PSNC", "P"),
    Current: m.current,
    Target: m.target,
  }));

  // Bar chart - gap size
  const gapBar = MATURITY.map(m => ({
    domain: m.domain.length > 24 ? m.domain.substring(0, 23) + "…" : m.domain,
    Current: m.current,
    Gap: m.target - m.current,
  })).sort((a, b) => (b.Gap) - (a.Gap));

  const critCount = MATURITY.filter(m => m.priority === "CRITICAL").length;
  const highCount = MATURITY.filter(m => m.priority === "HIGH").length;
  const needsWork = MATURITY.filter(m => m.current < 3).length;

  return (
    <div>
      <AlertBar type="critical"
        title={`PROGRAMME MATURITY: ${avgCurrent}/5 avg — ${needsWork} of 16 domains below NIS2-required minimum (3)`}
        text="Target: All domains ≥ 3 by enforcement date. 4 CRITICAL domains at Initial (1) maturity. Immediate board action required." />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:16 }}>
        <KPI label="Avg Maturity" value={`${avgCurrent}/5`} color={T.medium} sub="Target: 3.0 minimum" />
        <KPI label="Critical Gaps" value={critCount} color={T.criminal} pulse sub="Maturity 1 – Initial" />
        <KPI label="High Gaps" value={highCount} color={T.high} sub="Significant gap" />
        <KPI label="Below Minimum" value={needsWork} color={T.high} sub="Score < 3" />
        <KPI label="Meeting Target" value={MATURITY.filter(m => m.current >= m.target).length} color={T.low} sub="At target maturity" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Card title="Maturity Radar — Current vs Target">
          <div style={{ height: 310 }}>
            <ResponsiveRadar
              data={radarData}
              keys={["Current", "Target"]}
              indexBy="domain"
              maxValue={5}
              margin={{ top: 52, right: 100, bottom: 52, left: 100 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={({ key }) => key === "Target" ? `${T.accent}80` : T.high}
              gridLevels={5}
              gridShape="circular"
              gridLabelOffset={16}
              enableDots={true}
              dotSize={6}
              dotColor={({ key }) => key === "Target" ? T.accent : T.high}
              colors={[T.high, T.accent]}
              fillOpacity={0.12}
              theme={{ ...NT, text: { ...NT.text, fontSize: 9 } }}
              legends={[{ anchor:"bottom", direction:"row", translateY:46, itemWidth:90, itemHeight:18, itemTextColor: T.muted, symbolSize:10 }]}
            />
          </div>
          <div style={{ display:"flex", gap:16, marginTop:6, fontSize:10, fontFamily:"'IBM Plex Mono', monospace", color:T.muted }}>
            <span style={{ color:T.high }}>— Current (avg {avgCurrent})</span>
            <span style={{ color:T.accent }}>— Target (avg {(MATURITY.reduce((a,b)=>a+b.target,0)/MATURITY.length).toFixed(1)})</span>
          </div>
        </Card>

        <Card title="Maturity Gap by Domain (sorted by gap size)">
          <div style={{ height: 320 }}>
            <ResponsiveBar
              data={gapBar}
              keys={["Current", "Gap"]}
              indexBy="domain"
              layout="horizontal"
              margin={{ top:5, right:40, bottom:50, left:252 }}
              padding={0.25}
              colors={[T.accent, T.criminal]}
              theme={NT}
              borderRadius={2}
              axisLeft={{ tickSize:0, tickPadding:8 }}
              axisBottom={{ tickSize:0, tickPadding:6, tickValues:[0,1,2,3,4,5], legend:"Maturity Score (1–5)", legendOffset:34, legendPosition:"middle" }}
              enableLabel={false}
              maxValue={5}
              legends={[{ dataFrom:"keys", anchor:"bottom", direction:"row", translateY:44, itemWidth:120, itemHeight:16, itemTextColor:T.muted, symbolSize:10,
                data:[{ id:"Current", label:"■ Current", color:T.accent },{ id:"Gap to Target", label:"■ Gap to Target", color:T.criminal }] }]}
              tooltip={({ id, value, indexValue }) => (
                <div style={{ ...NT.tooltip.container, padding:"8px 12px" }}>
                  <strong style={{ color: id === "Current" ? T.accent : T.criminal }}>{id}</strong>: {value}<br />
                  <span style={{ color:T.muted, fontSize:10 }}>{indexValue}</span>
                </div>
              )}
            />
          </div>
        </Card>
      </div>

      {/* Maturity domain cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
        {MATURITY.map(m => (
          <div key={m.num}
            onClick={() => setSelected(selected?.num === m.num ? null : m)}
            style={{ background: selected?.num === m.num ? T.surface3 : T.surface, border:`1px solid ${selected?.num === m.num ? T.accent : T.border}`, borderLeft:`3px solid ${priorityColor(m.priority)}`, borderRadius:6, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <span style={{ fontSize:9, color:T.muted, fontFamily:"'IBM Plex Mono', monospace" }}>{m.article}</span>
              <Badge label={m.priority} color={priorityColor(m.priority)} T={T} />
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:T.text, fontFamily:"'IBM Plex Mono', monospace", marginBottom:8, lineHeight:1.3 }}>{m.domain}</div>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ flex:1, height:6, borderRadius:2, background: n <= m.current ? T.accent : n <= m.target ? `${T.high}40` : T.surface2, border: n === m.target ? `1px solid ${T.high}` : "none" }} />
              ))}
              <span style={{ fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono', monospace", marginLeft:4, whiteSpace:"nowrap" }}>{m.current}/{m.target}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Card title={`${selected.article} — ${selected.domain}`} style={{ marginTop:12, borderLeft:`3px solid ${priorityColor(selected.priority)}` }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
            {[["Current Maturity", `${selected.current}/5`, T.high], ["Target Maturity", `${selected.target}/5`, T.accent], ["Gap", `${selected.target - selected.current} levels`, priorityColor(selected.priority)], ["Status", selected.status, T.muted]].map(([l,v,c]) => (
              <div key={l} style={{ background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
                <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'IBM Plex Mono', monospace" }}>{l}</div>
                <div style={{ fontSize:12, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono', monospace" }}>{v}</div>
              </div>
            ))}
            <div style={{ gridColumn:"span 2", background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'IBM Plex Mono', monospace" }}>Current State</div>
              <div style={{ fontSize:11, color:T.high, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.5 }}>{selected.state}</div>
            </div>
            <div style={{ gridColumn:"span 2", background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'IBM Plex Mono', monospace" }}>Key Improvement Action</div>
              <div style={{ fontSize:11, color:T.text, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.5 }}>{selected.action}</div>
            </div>
            <div style={{ background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'IBM Plex Mono', monospace" }}>Owner</div>
              <div style={{ fontSize:11, color:T.text, fontFamily:"'IBM Plex Mono', monospace" }}>{selected.owner}</div>
            </div>
            <div style={{ background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'IBM Plex Mono', monospace" }}>Target Date</div>
              <div style={{ fontSize:11, fontWeight:700, color:T.criminal, fontFamily:"'IBM Plex Mono', monospace" }}>{selected.target_date}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// — — — Phased Programme Timeline — — —
// ─────────────────────────────────────────────
const PhasedView = () => {
  const T = useTheme();
  const NT = makeNivo(T);
  const [expandedPhase, setExpandedPhase] = useState(null);

  const statusColor = (s, T) => {
    if (s === "COMPLETE") return T.low;
    if (s === "IN PROGRESS") return T.accent;
    return T.high;
  };
  const phaseColor = (p, T) => ({
    low: T.low, accent: T.accent, high: T.high, criminal: T.criminal, medium: T.medium
  })[p.color_key] || T.muted;

  const progressBar = PHASES.map(p => ({ id:p.id.replace("Phase ","P"), ...p, fill: p.pct }));
  const overallPct = Math.round(PHASES.reduce((a,b)=>a+b.pct,0)/PHASES.length);

  // Bullet data for progress
  const bulletData = PHASES.map(p => ({
    id: p.id,
    ranges: [33, 66, 100],
    measures: [p.pct],
    markers: [],
  }));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:16 }}>
        <KPI label="Overall Progress" value={`${overallPct}%`} color={T.accent} sub="8-phase programme" />
        <KPI label="Complete" value={PHASES.filter(p=>p.status==="COMPLETE").length} color={T.low} sub="Phase 0 only" />
        <KPI label="In Progress" value={PHASES.filter(p=>p.status==="IN PROGRESS").length} color={T.accent} />
        <KPI label="At Risk" value={PHASES.filter(p=>p.status==="AT RISK").length} color={T.criminal} pulse />
        <KPI label="Target Completion" value="Oct 2026" color={T.muted} sub="Phase 7 end" />
      </div>

      {/* Timeline phase cards */}
      <div style={{ marginBottom:12 }}>
        {PHASES.map((phase, i) => {
          const c = phaseColor(phase, T);
          const expanded = expandedPhase === i;
          return (
            <div key={phase.id}
              style={{ background:T.surface, border:`1px solid ${expanded ? T.accent : T.border}`, borderLeft:`4px solid ${c}`, borderRadius:6, marginBottom:8, overflow:"hidden", transition:"all 0.2s" }}>
              <div onClick={() => setExpandedPhase(expanded ? null : i)}
                style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", cursor:"pointer" }}>
                <div style={{ width:80, flexShrink:0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono', monospace" }}>{phase.id}</div>
                  <div style={{ fontSize:9, color:T.muted, fontFamily:"'IBM Plex Mono', monospace", marginTop:1 }}>{phase.start} – {phase.end}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:T.text, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6 }}>{phase.name}</div>
                  <div style={{ height:8, background:T.surface2, borderRadius:4, overflow:"hidden", position:"relative" }}>
                    <div style={{ height:"100%", width:`${phase.pct}%`, background:c, borderRadius:4, transition:"width 0.5s ease" }} />
                  </div>
                </div>
                <div style={{ width:60, flexShrink:0, textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono', monospace" }}>{phase.pct}%</div>
                </div>
                <div style={{ width:100, flexShrink:0 }}>
                  <Badge label={phase.status === "COMPLETE" ? "✓ COMPLETE" : phase.status === "IN PROGRESS" ? "● IN PROGRESS" : "⚠ AT RISK"} color={c} T={T} />
                </div>
                <div style={{ color:T.muted, fontSize:12 }}>{expanded ? "▲" : "▼"}</div>
              </div>
              {expanded && (
                <div style={{ padding:"0 18px 14px", borderTop:`1px solid ${T.border}` }}>
                  <div style={{ paddingTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div>
                      <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontFamily:"'IBM Plex Mono', monospace" }}>Key Activities</div>
                      {phase.activities.map((a, ai) => (
                        <div key={ai} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                          <span style={{ color:c, fontSize:11, flexShrink:0 }}>▸</span>
                          <span style={{ fontSize:11, color:T.text, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.4 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {[["Start Date", phase.start, T.muted], ["Target End", phase.end, T.muted], ["Completion", `${phase.pct}%`, c], ["Status", phase.status, c]].map(([l,v,col]) => (
                          <div key={l} style={{ background:T.surface2, borderRadius:4, padding:"8px 12px" }}>
                            <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3, fontFamily:"'IBM Plex Mono', monospace" }}>{l}</div>
                            <div style={{ fontSize:12, fontWeight:700, color:col, fontFamily:"'IBM Plex Mono', monospace" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bullet chart summary */}
      <Card title="Programme Progress — All Phases">
        <div style={{ height:260 }}>
          <ResponsiveBullet
            data={bulletData}
            margin={{ top:10, right:30, bottom:20, left:80 }}
            spacing={24}
            titleAlign="end"
            titleOffsetX={-16}
            measureSize={0.5}
            markerSize={0}
            rangeColors={[`${T.low}25`, `${T.medium}25`, `${T.high}25`]}
            measureColors={PHASES.map(p => phaseColor(p, T))}
            theme={{ ...NT, text: { ...NT.text, fontSize:9 } }}
          />
        </div>
        <div style={{ display:"flex", gap:16, fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono', monospace" }}>
          <span style={{ color:T.low }}>■ 0-33%: Early Stage</span>
          <span style={{ color:T.medium }}>■ 34-66%: Progressing</span>
          <span style={{ color:T.high }}>■ 67-99%: Near Complete</span>
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// — — — Policy Tracker — — —
// ─────────────────────────────────────────────
const PolicyView = () => {
  const T = useTheme();
  const NT = makeNivo(T);
  const [catFilter, setCatFilter] = useState("");

  const cats = [...new Set(POLICIES.map(p => p.category))];
  const filtered = POLICIES.filter(p => !catFilter || p.category === catFilter);

  const catColors = { Governance:T.criminal, "Security Policy":T.high, Risk:T.high, Incident:T.high, "BC/DR":T.medium, "Supply Chain":T.medium, Technical:T.accent, Identity:T.accent, "HR / Training":T.accent, Data:T.muted, DORA:T.criminal };

  const catPie = cats.map(c => ({
    id: c, label: c,
    value: POLICIES.filter(p => p.category === c).length,
    color: catColors[c] || T.muted,
  }));

  const columns = [
    { key:"id",       label:"ID",       width:90,  render: v => <span style={{ color:T.accent, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"title",    label:"Policy / Document",  width:300, wrap:true },
    { key:"ref",      label:"NIS2 / DORA Ref",    width:130, render: v => <Badge label={v} color={T.accent} T={T} /> },
    { key:"category", label:"Category",   width:130, render: v => <Badge label={v} color={catColors[v] || T.muted} T={T} /> },
    { key:"approver", label:"Approver",   width:130 },
    { key:"drafted",  label:"Drafted",   width:80,  render: v => v ? <Badge label="✓ Yes" color={T.low} T={T} /> : <Badge label="Pending" color={T.high} T={T} /> },
    { key:"reviewed", label:"Reviewed",  width:80,  render: v => v ? <Badge label="✓ Yes" color={T.low} T={T} /> : <Badge label="Pending" color={T.high} T={T} /> },
    { key:"approved", label:"Board Approved", width:100, render: v => v ? <Badge label="✓ Approved" color={T.low} T={T} /> : <Badge label="NOT YET" color={T.criminal} T={T} /> },
    { key:"notes",    label:"Notes",     width:200, wrap:true, render: v => <span style={{ color:T.muted, fontFamily:"'IBM Plex Mono',monospace", fontSize:10 }}>{v}</span> },
  ];

  return (
    <div>
      <AlertBar type="critical" title="0 / 15 POLICIES BOARD-APPROVED — ACN audit readiness requires all mandatory policies drafted, reviewed and board-approved."
        text="Priority: POL-001 Board Governance Policy (Art.20), POL-004 Incident Response Plan (Art.23), POL-014 DORA ICT Third-Party Policy." />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:16 }}>
        <KPI label="Total Policies" value={15} color={T.accent} />
        <KPI label="Board Approved" value={0} color={T.criminal} pulse sub="Target: 15/15" />
        <KPI label="Drafted" value={0} color={T.high} sub="None drafted yet" />
        <KPI label="Critical Priority" value={POLICIES.filter(p => ["Governance","Incident","DORA"].includes(p.category)).length} color={T.criminal} />
        <KPI label="Overdue" value={POLICIES.filter(p => ["Art.20","Art.23","DORA Art.28-30"].includes(p.ref.split("/")[0].trim())).length} color={T.high} sub="Mar 2026 deadline" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Card title="Policy Approval Pipeline">
          <div style={{ marginBottom:8 }}>
            {["Drafting", "Under Review", "Board Approval", "Approved"].map((stage, i) => {
              const counts = [0, 0, 0, 0];
              const pct = [0, 0, 0, 0];
              const colors = [T.high, T.medium, T.accent, T.low];
              return (
                <div key={stage} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:T.text, fontFamily:"'IBM Plex Mono', monospace" }}>{stage}</span>
                    <span style={{ fontSize:11, color:colors[i], fontFamily:"'IBM Plex Mono', monospace" }}>{i === 3 ? "0 / 15" : i === 0 ? "15 / 15" : "0 / 15"}</span>
                  </div>
                  <div style={{ height:8, background:T.surface2, borderRadius:4 }}>
                    <div style={{ height:"100%", width: i === 0 ? "100%" : "0%", background:colors[i], borderRadius:4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Divider style={{ margin:"10px 0" }} />
          <StatRow label="Governance (Art.20)" value="0 / 1 approved" color={T.criminal} />
          <StatRow label="Incident / BC/DR" value="0 / 3 approved" color={T.criminal} />
          <StatRow label="Technical Controls" value="0 / 5 approved" color={T.high} />
          <StatRow label="DORA / Supply Chain" value="0 / 3 approved" color={T.high} />
        </Card>

        <Card title="Policies by Category">
          <div style={{ height: 240 }}>
            <ResponsivePie
              data={catPie}
              margin={{ top:10, right:10, bottom:50, left:10 }}
              innerRadius={0.55}
              padAngle={2}
              cornerRadius={3}
              colors={({ data }) => data.color}
              theme={NT}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={18}
              arcLabelsTextColor="#fff"
              legends={[{ anchor:"bottom", direction:"row", translateY:48, itemWidth:110, itemHeight:16, itemTextColor:T.muted, symbolSize:9, data: catPie.map(d => ({ id:d.id, label:d.label, color:d.color })) }]}
            />
          </div>
        </Card>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
        <button onClick={() => setCatFilter("")}
          style={{ background:!catFilter ? T.accentLo : T.surface2, border:`1px solid ${!catFilter ? T.accent : T.border}`, color:!catFilter ? T.text : T.muted, padding:"6px 12px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
          All Categories
        </button>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c === catFilter ? "" : c)}
            style={{ background:catFilter === c ? T.accentLo : T.surface2, border:`1px solid ${catFilter === c ? T.accent : T.border}`, color:catFilter === c ? T.text : T.muted, padding:"6px 12px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {c}
          </button>
        ))}
      </div>
      <DataTable columns={columns} rows={filtered} maxHeight={400} />

      {/* Regulatory Contacts */}
      <Card title="Regulatory Contacts & Escalation" style={{ marginTop:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {REG_CONTACTS.map(r => (
            <div key={r.framework} style={{ background:T.surface2, borderRadius:6, padding:"14px 16px", borderLeft:`3px solid ${T.accent}` }}>
              <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6, fontFamily:"'IBM Plex Mono',monospace" }}>{r.framework}</div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>{r.authority}</div>
              <div style={{ fontSize:10, color:T.accent, fontFamily:"'IBM Plex Mono',monospace", marginBottom:6 }}>🌐 {r.portal}</div>
              <div style={{ fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6, borderTop:`1px solid ${T.border}`, paddingTop:6 }}>{r.hotline}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// — — — Incident Management — — —
// ─────────────────────────────────────────────
const IncidentView = () => {
  const T = useTheme();
  const NT = makeNivo(T);
  const [tab, setTab] = useState("log");
  const [expandedPhase, setExpandedPhase] = useState("PHASE 1: EARLY WARNING");

  const sevColor = (s) => {
    if (s === "CRITICAL") return T.criminal;
    if (s === "HIGH") return T.high;
    if (s === "MEDIUM") return T.medium;
    return T.low;
  };

  const phases = [...new Set(CHECKLIST_ITEMS.map(c => c.phase))];
  const phaseColors = { "PHASE 1: EARLY WARNING": T.criminal, "PHASE 2: INCIDENT NOTIFICATION": T.high, "PHASE 3: FINAL REPORT": T.accent };

  const incColumns = [
    { key:"id",       label:"ID",          width:120, render:v => <span style={{ color:T.accent, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"detected", label:"Detected",    width:110 },
    { key:"title",    label:"Incident",    width:260, wrap:true },
    { key:"severity", label:"Severity",    width:90,  render:v => <LevelBadge level={v} /> },
    { key:"type",     label:"Type",        width:150, render:v => <Badge label={v} color={T.medium} T={T} /> },
    { key:"significant",label:"Significant",width:90, render:v => v ? <Badge label="YES" color={T.criminal} T={T} /> : <Badge label="no" color={T.muted} T={T} /> },
    { key:"ew24",     label:"24h EW",      width:70,  render:v => <span style={{ color: v==="Y" ? T.low : T.muted, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"ntf72",    label:"72h NTF",     width:70,  render:v => <span style={{ color: v==="Y" ? T.low : T.muted, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"report30", label:"30d Report",  width:80,  render:v => <span style={{ color: v==="Y" ? T.low : T.muted, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"dora4h",   label:"DORA 4h",     width:75,  render:v => <span style={{ color: v==="Y" ? T.low : T.criminal, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"lessons",  label:"Lessons Learned", width:280, wrap:true, render:v => <span style={{ color:T.muted, fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
  ];

  const sigColumns = [
    { key:"id",        label:"ID",        width:80,  render:v => <span style={{ color:T.accent, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span> },
    { key:"category",  label:"Category",  width:180, render:v => <Badge label={v} color={T.medium} T={T} /> },
    { key:"threshold", label:"Threshold / Trigger", width:360, wrap:true },
    { key:"nis2",      label:"NIS2 Ref",  width:130, render:v => <Badge label={v} color={T.accent} T={T} /> },
    { key:"dora",      label:"DORA Ref",  width:100 },
    { key:"example",   label:"Example Scenario", width:340, wrap:true, render:v => <span style={{ color:T.muted, fontSize:10 }}>{v}</span> },
  ];

  // Incident type bar
  const typeBar = Object.entries(INCIDENTS.reduce((a, inc) => {
    const t = inc.type.split("/")[0].trim();
    a[t] = (a[t] || 0) + 1;
    return a;
  }, {})).map(([k,v]) => ({ type:k, count:v }));

  return (
    <div>
      <AlertBar type="warning"
        title="DORA 4h NOTIFICATION GAP — 0/5 incidents had DORA 4h notification sent. Template missing (MG-014). Bank of Italy deadline applies for ICT financial asset incidents."
        text="For AST-001/AST-003 incidents: DORA Art.19 supersedes NIS2 Art.23 (lex specialis). 4h to Bank of Italy is mandatory. ACT-014 pending." />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:16 }}>
        <KPI label="Total Incidents" value={5} color={T.accent} sub="2024–2025" />
        <KPI label="Significant" value={INCIDENTS.filter(i=>i.significant).length} color={T.high} sub="Regulatory reporting required" />
        <KPI label="24h EW Sent" value={`${INCIDENTS.filter(i=>i.ew24==="Y").length}/5`} color={T.low} />
        <KPI label="DORA 4h Sent" value={`${INCIDENTS.filter(i=>i.dora4h==="Y").length}/5`} color={T.criminal} pulse />
        <KPI label="Reporting Gap" value="MG-014" color={T.criminal} sub="DORA template missing" />
      </div>

      <div style={{ display:"flex", gap:2, borderBottom:`1px solid ${T.border}`, marginBottom:16 }}>
        {[["log","📋 Incident Log"], ["sig","🔍 Significance Criteria"], ["checklist","☑ Operational Checklist"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"9px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t ? T.accent : "transparent"}`, color:tab===t ? T.text : T.muted, cursor:"pointer", fontSize:12, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'IBM Plex Mono', monospace", marginBottom:-1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Card title="Incidents by Severity">
              <div style={{ height:180 }}>
                <ResponsivePie
                  data={[
                    { id:"CRITICAL", label:"CRITICAL", value:INCIDENTS.filter(i=>i.severity==="CRITICAL").length, color:T.criminal },
                    { id:"HIGH",     label:"HIGH",     value:INCIDENTS.filter(i=>i.severity==="HIGH").length,     color:T.high },
                    { id:"MEDIUM",   label:"MEDIUM",   value:INCIDENTS.filter(i=>i.severity==="MEDIUM").length,   color:T.medium },
                    { id:"LOW",      label:"LOW",      value:INCIDENTS.filter(i=>i.severity==="LOW").length,      color:T.low },
                  ].filter(d=>d.value>0)}
                  margin={{ top:10, right:10, bottom:40, left:10 }}
                  innerRadius={0.6} padAngle={3} cornerRadius={3}
                  colors={({data})=>data.color} theme={NT}
                  enableArcLinkLabels={false} arcLabelsSkipAngle={15} arcLabelsTextColor="#fff"
                  legends={[{ anchor:"bottom", direction:"row", translateY:38, itemWidth:90, itemHeight:16, itemTextColor:T.muted, symbolSize:10 }]}
                />
              </div>
            </Card>
            <Card title="Notification Compliance">
              <div style={{ height:180 }}>
                <ResponsiveBar
                  data={[
                    { metric:"Significant", value:INCIDENTS.filter(i=>i.significant).length, na:0 },
                    { metric:"24h EW Sent", value:INCIDENTS.filter(i=>i.ew24==="Y").length, na: INCIDENTS.filter(i=>i.ew24==="N"&&i.significant).length },
                    { metric:"72h NTF",     value:INCIDENTS.filter(i=>i.ntf72==="Y").length, na: INCIDENTS.filter(i=>i.ntf72==="N"&&i.significant).length },
                    { metric:"30d Report",  value:INCIDENTS.filter(i=>i.report30==="Y").length, na: INCIDENTS.filter(i=>i.report30==="N"&&i.significant).length },
                    { metric:"DORA 4h",     value:INCIDENTS.filter(i=>i.dora4h==="Y").length, na: INCIDENTS.filter(i=>i.dora4h==="N").length },
                  ]}
                  keys={["value","na"]}
                  indexBy="metric"
                  layout="horizontal"
                  margin={{ top:5, right:20, bottom:50, left:90 }}
                  padding={0.3}
                  colors={[T.low, T.criminal]}
                  maxValue={5}
                  theme={NT}
                  borderRadius={2}
                  axisLeft={{ tickSize:0, tickPadding:8 }}
                  axisBottom={{ tickSize:0, tickPadding:6 }}
                  enableLabel={true}
                  label={({ value }) => value > 0 ? value : ""}
                  labelTextColor="#fff"
                  legends={[{ dataFrom:"keys", anchor:"bottom", direction:"row", translateY:46, itemWidth:100, itemHeight:16, itemTextColor:T.muted, symbolSize:10,
                    data:[{ id:"value", label:"Sent / Yes", color:T.low },{ id:"na", label:"Missing / No", color:T.criminal }] }]}
                />
              </div>
            </Card>
          </div>
          <DataTable columns={incColumns} rows={INCIDENTS} maxHeight={400} />
        </div>
      )}

      {tab === "sig" && (
        <div>
          <AlertBar type="info" title="Significance criteria determine if an incident is 'Significant' under NIS2 Art.23 and requires mandatory regulatory reporting."
            text="If ANY single criterion is met → report to CSIRT Italia within 24h. DORA Art.19 applies in parallel for ICT financial assets. When in doubt, report." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:12 }}>
            {SIGNIFICANCE.map(s => (
              <div key={s.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.medium}`, borderRadius:6, padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <Badge label={s.id} color={T.accent} T={T} />
                  <Badge label={s.nis2} color={T.medium} T={T} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:T.text, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6 }}>{s.category}</div>
                <div style={{ fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.5, marginBottom:8 }}>{s.threshold}</div>
                <div style={{ fontSize:9, color:T.dimmed, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.4, borderTop:`1px solid ${T.border}`, paddingTop:6 }}>
                  <span style={{ color:T.accent }}>e.g.</span> {s.example}
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
            title="🛑 LEX SPECIALIS OVERRIDE — If incident affects AST-001 or AST-003: DORA Art.19 requires Bank of Italy notification within 4 HOURS (not 24h). Dual reporting mandatory."
            text="(1) NIS2 → CSIRT Italia ≤24h AND (2) DORA → Bank of Italy ≤4h. Ref: DORA Art.19 | NIS2 Art.23 | ACT-014 | Lex Specialis principle." />
          {phases.map(phase => {
            const items = CHECKLIST_ITEMS.filter(c => c.phase === phase);
            const phaseC = phaseColors[phase] || T.muted;
            const expanded = expandedPhase === phase;
            return (
              <div key={phase} style={{ marginBottom:10 }}>
                <div onClick={() => setExpandedPhase(expanded ? null : phase)}
                  style={{ background:T.surface, border:`1px solid ${T.border}`, borderLeft:`4px solid ${phaseC}`, borderRadius:6, padding:"12px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:phaseC, fontFamily:"'IBM Plex Mono', monospace" }}>{phase}</div>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono', monospace", marginTop:2 }}>{items.length} checklist items · {items[0]?.deadline}</div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <Badge label={`${items.length} items`} color={phaseC} T={T} />
                    <span style={{ color:T.muted }}>{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expanded && (
                  <div style={{ border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 0 6px 6px", overflow:"hidden" }}>
                    {items.map((item, ii) => (
                      <div key={item.id} style={{ padding:"10px 18px", borderBottom:`1px solid ${T.border}`, background: ii % 2 === 0 ? T.surface : T.surface2, display:"grid", gridTemplateColumns:"80px 1fr 140px", gap:12, alignItems:"start" }}>
                        <span style={{ color:phaseC, fontWeight:700, fontSize:11, fontFamily:"'IBM Plex Mono', monospace" }}>{item.id}</span>
                        <div>
                          <div style={{ fontSize:11, color:T.text, fontFamily:"'IBM Plex Mono', monospace", lineHeight:1.5, marginBottom:4 }}>{item.action}</div>
                          <div style={{ fontSize:9, color:T.muted, fontFamily:"'IBM Plex Mono', monospace" }}>📎 {item.evidence}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:10, color:T.muted, fontFamily:"'IBM Plex Mono', monospace" }}>{item.owner}</div>
                          <div style={{ marginTop:4 }}><Badge label="[ ] Pending" color={T.high} T={T} /></div>
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
// MAIN APP
// ─────────────────────────────────────────────
const ThemeToggle = ({ dark, toggle }) => {
  const T = dark ? DARK : LIGHT;
  return (
    <button onClick={toggle} title="Toggle light/dark mode"
      style={{ display:"flex", alignItems:"center", gap:7, background:T.surface2, border:`1px solid ${T.border}`, borderRadius:20, padding:"5px 12px 5px 8px", cursor:"pointer", outline:"none", transition:"all 0.2s", fontFamily:"'IBM Plex Mono', monospace" }}>
      <div style={{ position:"relative", width:34, height:18, background: dark ? T.accent : T.border, borderRadius:9, transition:"background 0.25s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:2, left: dark ? 17 : 2, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.22s", boxShadow:"0 1px 4px rgba(0,0,0,0.35)" }} />
      </div>
      <span style={{ fontSize:11, color:T.text, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{dark ? "☽ Dark" : "☀ Light"}</span>
    </button>
  );
};

export default function NIS2Dashboard() {
  const [view, setView] = useState("overview");
  const [globalFilter, setGlobalFilter] = useState(null);
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

  const nav = [
    { id: "overview",  label: "Overview",            icon: "◈" },
    { id: "gaps",      label: "Gap Register",        icon: "⬡" },
    { id: "risks",     label: "Risk Register",       icon: "△" },
    { id: "assets",    label: "Assets & Supply Chain",icon: "□" },
    { id: "maturity",  label: "Maturity Tracker",    icon: "◉" },
    { id: "incidents", label: "Incident Mgmt",       icon: "⚡" },
    { id: "policies",  label: "Policy Tracker",      icon: "📄" },
    { id: "phases",    label: "Phased Programme",    icon: "▶" },
    { id: "programme", label: "Programme",           icon: "◇" },
  ];

  const handleFilter = useCallback((f) => {
    setGlobalFilter(f);
    setView("gaps");
  }, []);

  return (
    <ThemeCtx.Provider value={T}>
    <div style={{
      display: "flex", minHeight: "100vh", background: T.bg,
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: T.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes nis2pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        button:focus { outline: none; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 200, flexShrink: 0, background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, letterSpacing: "0.06em" }}>LIST SpA</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: "0.04em" }}>NIS2 / DORA v2.0</div>
          <div style={{ marginTop: 8, background: T.critLo, border: `1px solid ${T.criminal}30`, borderRadius: 3, padding: "4px 8px", fontSize: 9, color: T.criminal, fontWeight: 700, letterSpacing: "0.06em" }}>
            ⚠ CVCN AT RISK
          </div>
        </div>

        <nav style={{ padding: "8px 0", flex: 1 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 16px",
                background: view === n.id ? T.surface2 : "none",
                border: "none",
                borderLeft: `2px solid ${view === n.id ? T.accent : "transparent"}`,
                color: view === n.id ? T.text : T.muted,
                fontSize: 11, cursor: "pointer", textAlign: "left",
                letterSpacing: "0.02em", transition: "all 0.1s",
              }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.dimmed, letterSpacing: "0.04em" }}>
          <div>Mar 2026 · v2.0</div>
          <div>CISO Owned</div>
          <div style={{ marginTop: 4, color: T.criminal }}>● 4 CRITICAL risks</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div style={{
          background: T.surface, borderBottom: `1px solid ${T.border}`,
          padding: "14px 28px", position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em" }}>
              {nav.find(n => n.id === view)?.icon} {nav.find(n => n.id === view)?.label}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
              LIST SpA · NIS2/DORA Compliance Programme · 56 gaps · 14 risks · €146k budget · 16 domains · 15 policies · 5 incidents
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[["CRITICAL: 15", T.critical], ["HIGH: 13", T.high], ["OPEN: 38", T.medium]].map(([l, c], i) => (
              <div key={i} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "4px 10px", fontSize: 10, color: c, letterSpacing: "0.04em", fontFamily:"'IBM Plex Mono',monospace" }}>{l}</div>
            ))}
            <ThemeToggle dark={dark} toggle={() => setDark(d => !d)} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px" }}>
          {view === "overview"  && <OverviewView setFilter={handleFilter} />}
          {view === "gaps"      && <GapsView filter={globalFilter} setFilter={setGlobalFilter} />}
          {view === "risks"     && <RisksView />}
          {view === "assets"    && <AssetsView />}
          {view === "maturity"  && <MaturityView />}
          {view === "incidents" && <IncidentView />}
          {view === "policies"  && <PolicyView />}
          {view === "phases"    && <PhasedView />}
          {view === "programme" && <ProgrammeView />}
        </div>
      </div>
    </div>
    </ThemeCtx.Provider>
  );
}