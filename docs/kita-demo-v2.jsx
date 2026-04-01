import { useState, useEffect } from "react";

const DEMO_DATA = {
  club: { name: "Sunrise Running Club", location: "Melbourne, Australia" },
  athletes: [
    { name: "Daniel", avatar: "🏃", color: "#0F6E56", feel: 4, lastRun: "2.3 km", lastFeel: "😊", streak: 6 },
    { name: "Aisha", avatar: "⭐", color: "#534AB7", feel: 3, lastRun: "1.8 km", lastFeel: "😐", streak: 3 },
    { name: "Liam", avatar: "🌊", color: "#185FA5", feel: 5, lastRun: "3.1 km", lastFeel: "😄", streak: 12 },
    { name: "Priya", avatar: "🌻", color: "#BA7517", feel: 2, lastRun: "1.2 km", lastFeel: "😔", streak: 1 },
  ],
};

const ROLES = [
  { id: "coach", label: "Coach", icon: "📋", color: "#0F6E56" },
  { id: "caregiver", label: "Caregiver", icon: "💚", color: "#534AB7" },
  { id: "athlete", label: "Athlete", icon: "🏅", color: "#BA7517" },
];

/* ─── Lucide-style SVG icons (matching actual app) ─── */
function IconHome({ size = 18, stroke = 2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
}
function IconCalendar({ size = 18, stroke = 2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}
function IconUsers({ size = 18, stroke = 2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconBell({ size = 18, stroke = 2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
}
function IconUser({ size = 18, stroke = 2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
}

/* ─── Bottom nav matching actual app ─── */
function BottomNav({ active, role = "coach" }) {
  const coachTabs = [
    { id: "feed", icon: IconHome, label: "Feed" },
    { id: "sessions", icon: IconCalendar, label: "Sessions" },
    { id: "athletes", icon: IconUsers, label: "Athletes" },
    { id: "alerts", icon: IconBell, label: "Alerts" },
    { id: "account", icon: IconUser, label: "Account" },
  ];
  const caregiverTabs = [
    { id: "feed", icon: IconHome, label: "Feed" },
    { id: "sessions", icon: IconCalendar, label: "Sessions" },
    { id: "athletes", icon: IconUsers, label: "Athletes" },
    { id: "account", icon: IconUser, label: "Account" },
  ];
  const tabs = role === "caregiver" ? caregiverTabs : coachTabs;

  return (
    <div style={{
      display: "flex", justifyContent: "space-around", padding: "8px 2px 6px",
      borderTop: "1px solid #E8E6E0", marginTop: 12, background: "#FBF9F7",
    }}>
      {tabs.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <div key={it.id} style={{
            textAlign: "center", fontSize: 10, cursor: "pointer",
            color: isActive ? "#0F6E56" : "#B4B2A9",
            fontWeight: isActive ? 600 : 400,
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "4px 2px", borderRadius: 8,
            background: isActive ? "#E8F5EE" : "transparent",
          }}>
            <Icon size={18} stroke={isActive ? 2.5 : 2} />
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Phone frame ─── */
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 320, minHeight: 580, maxHeight: 640,
      background: "#FBF9F7", borderRadius: 32,
      border: "3px solid #2C2C2A", position: "relative",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, color: "#3d3d3a", letterSpacing: 0.3,
        background: "#FBF9F7", position: "relative", zIndex: 2,
      }}>
        <span>9:41</span>
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          width: 80, height: 22, background: "#2C2C2A", borderRadius: 12,
        }} />
      </div>
      <div style={{ height: "calc(100% - 44px)", overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── COACH SCREENS ─── */

function CoachFeed() {
  const d = DEMO_DATA;
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ padding: "8px 0 12px" }}>
        <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Good morning</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginTop: 2 }}>Sarah</div>
      </div>
      <div style={{
        background: "#FFF4EC", borderRadius: 12, padding: "12px 14px", marginBottom: 12,
        borderLeft: "3px solid #D85A30",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#993C1D", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Needs attention</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4A1B0C" }}>
            <span style={{ fontSize: 14 }}>📉</span>
            <span><b>Priya:</b> Feel declining (3→2→😔)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4A1B0C" }}>
            <span style={{ fontSize: 14 }}>🔗</span>
            <span>2 unmatched Strava activities</span>
          </div>
        </div>
      </div>
      <div style={{
        background: "#E8F5EE", borderRadius: 12, padding: "12px 14px", marginBottom: 12,
        borderLeft: "3px solid #0F6E56",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#085041", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Celebrate</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#04342C" }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span><b>Liam</b> hit <b>50km total distance!</b></span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8, marginTop: 4 }}>Recent sessions</div>
      {d.athletes.slice(0, 3).map((a, i) => (
        <div key={i} style={{
          background: "white", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
          border: "1px solid #E8E6E0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: a.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{a.avatar}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#888780" }}>{a.lastRun} · {a.lastFeel}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#888780" }}>Today</div>
          </div>
        </div>
      ))}
      <BottomNav active="feed" role="coach" />
    </div>
  );
}

function CoachSessions() {
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 14px" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>Sessions</div>
        <div style={{
          background: "#0F6E56", color: "white", fontSize: 12, fontWeight: 600,
          padding: "6px 12px", borderRadius: 8, cursor: "pointer",
        }}>+ New session</div>
      </div>

      <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>This week</div>

      {/* Upcoming session card */}
      <div style={{
        background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
        border: "1px solid #E8E6E0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Saturday Training</div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Sat, Apr 5 · 8:00 – 9:30 AM</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 10,
            background: "#E8F5EE", color: "#0F6E56",
          }}>Published</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5F5E5A", marginBottom: 8 }}>
          <span>📍</span><span>Albert Park Lake, Track 2</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>
            <span style={{ fontWeight: 600, color: "#0F6E56" }}>3</span> coaches available
          </div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>
            <span style={{ fontWeight: 600, color: "#0F6E56" }}>8</span> athletes attending
          </div>
        </div>
        <div style={{
          marginTop: 10, padding: "8px 10px", borderRadius: 8,
          background: "#FBF5EC", border: "1px solid #FAC77530",
          fontSize: 12, color: "#854F0B", fontWeight: 500,
        }}>
          ⚡ Needs pairings — 8 athletes, 3 coaches
        </div>
      </div>

      {/* Second session */}
      <div style={{
        background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
        border: "1px solid #E8E6E0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Wednesday Run</div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Wed, Apr 9 · 5:30 – 6:30 PM</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 10,
            background: "#F1EFE8", color: "#888780",
          }}>Draft</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5F5E5A" }}>
          <span>📍</span><span>Albert Park Lake, Track 2</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Completed</div>

      {/* Past session */}
      <div style={{
        background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
        border: "1px solid #E8E6E0", opacity: 0.75,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Saturday Training</div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Sat, Mar 29 · 8:00 – 9:30 AM</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 10,
            background: "#E8F5EE", color: "#0F6E56",
            display: "flex", alignItems: "center", gap: 3,
          }}>✓ Completed</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "#888780" }}>
          <span>3 coaches</span><span>·</span><span>10 athletes</span><span>·</span><span>18.4 km total</span>
        </div>
      </div>

      <BottomNav active="sessions" role="coach" />
    </div>
  );
}

function CoachMilestone() {
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{
        marginTop: 12, borderRadius: 16, overflow: "hidden",
        background: "linear-gradient(135deg, #0F6E56 0%, #1D9E75 50%, #5DCAA5 100%)",
        padding: "28px 20px", textAlign: "center", color: "white",
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏅</div>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.85, marginBottom: 4 }}>Milestone achieved</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>50km Total Distance</div>
        <div style={{ fontSize: 15, opacity: 0.9 }}>Liam · March 28, 2026</div>
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Share</div>
          <div style={{
            background: "white", color: "#0F6E56", borderRadius: 8, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Print certificate</div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Liam's milestones</div>
      {[
        { name: "First Run", date: "Nov 2025", icon: "👟" },
        { name: "5 Sessions", date: "Dec 2025", icon: "⭐" },
        { name: "10km Total", date: "Jan 2026", icon: "🎯" },
        { name: "25 Sessions", date: "Feb 2026", icon: "🏆" },
        { name: "50km Total", date: "Mar 2026", icon: "🏅" },
      ].map((m, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
          borderBottom: i < 4 ? "1px solid #F1EFE8" : "none",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: i === 4 ? "#E8F5EE" : "#F1EFE8",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>{m.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{m.name}</div>
            <div style={{ fontSize: 12, color: "#888780" }}>{m.date}</div>
          </div>
          {i === 4 && <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#0F6E56", background: "#E8F5EE", padding: "3px 8px", borderRadius: 6 }}>New!</div>}
        </div>
      ))}
      <BottomNav active="feed" role="coach" />
    </div>
  );
}

/* ─── CAREGIVER SCREENS ─── */

function CaregiverDashboard() {
  const a = DEMO_DATA.athletes[0];
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ padding: "8px 0 12px" }}>
        <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Your athlete</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginTop: 2 }}>Daniel's progress</div>
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${a.color}12, ${a.color}08)`,
        borderRadius: 14, padding: "16px", marginBottom: 14, border: `1px solid ${a.color}20`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: a.color + "20",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>{a.avatar}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C2C2A" }}>Daniel</div>
            <div style={{ fontSize: 13, color: "#888780" }}>6-session streak 🔥</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["This month", "8 runs"], ["Distance", "14.2 km"], ["Avg. feel", "😊 Happy"], ["Next milestone", "25 Sessions"]].map(([l, v], i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#888780" }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Coach Sarah's latest note</div>
      <div style={{
        background: "white", borderRadius: 12, padding: "12px 14px", marginBottom: 14,
        border: "1px solid #E8E6E0",
      }}>
        <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.6 }}>
          "Daniel had a great session today. Ran the full 2.3km without stopping — that's a first! He was really proud. Working toward 25 sessions next week."
        </div>
        <div style={{ fontSize: 12, color: "#888780", marginTop: 6 }}>Coach Sarah · Today, 10:15 AM</div>
      </div>
      <button style={{
        width: "100%", padding: "12px", borderRadius: 10,
        background: a.color, color: "white", border: "none",
        fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}>
        Send Daniel a cheer 💚
      </button>
      <BottomNav active="feed" role="caregiver" />
    </div>
  );
}

function CaregiverSessions() {
  const a = DEMO_DATA.athletes[0];
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ padding: "8px 0 14px" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>Sessions</div>
        <div style={{ fontSize: 13, color: "#888780" }}>Upcoming sessions for Daniel</div>
      </div>

      <div style={{
        background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
        border: "1px solid #E8E6E0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Saturday Training</div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Sat, Apr 5 · 8:00 – 9:30 AM</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 10, background: "#E8F5EE", color: "#0F6E56" }}>Pairings out</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>
          <span>📍</span><span>Albert Park Lake, Track 2</span>
        </div>
        <div style={{
          background: `${a.color}08`, borderRadius: 8, padding: "10px 12px",
          border: `1px solid ${a.color}15`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: a.color, marginBottom: 4 }}>Daniel's pairing</div>
          <div style={{ fontSize: 13, color: "#2C2C2A" }}>Running with <b>Coach Sarah</b></div>
          <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Paired with Liam</div>
        </div>
      </div>

      <div style={{
        background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
        border: "1px solid #E8E6E0",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Wednesday Run</div>
          <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>Wed, Apr 9 · 5:30 – 6:30 PM</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5F5E5A", marginTop: 8 }}>
          <span>📍</span><span>Albert Park Lake, Track 2</span>
        </div>
        <div style={{ fontSize: 12, color: "#888780", marginTop: 8, fontStyle: "italic" }}>
          Pairings not published yet
        </div>
      </div>

      <BottomNav active="sessions" role="caregiver" />
    </div>
  );
}

function CaregiverDigest() {
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ padding: "8px 0 12px" }}>
        <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Weekly digest</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginTop: 2 }}>Daniel's week</div>
        <div style={{ fontSize: 12, color: "#888780" }}>March 24 – 30, 2026</div>
      </div>
      <div style={{
        background: "linear-gradient(135deg, #E8F5EE, #FBF9F7)", borderRadius: 14,
        padding: 16, marginBottom: 14, border: "1px solid #9FE1CB40",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Runs this week", "3"], ["Total distance", "6.8 km"], ["Avg. feel", "😊"], ["Streak", "6 sessions"]].map(([l, v], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0F6E56" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#888780" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.6, padding: "0 4px", marginBottom: 14 }}>
        Daniel ran 3 times this week, totalling 6.8 km. His feel ratings were consistently positive. Coach Sarah noted he's getting more confident with longer distances.
      </div>
      <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Highlight</div>
      <div style={{
        background: "#FBF5EC", borderRadius: 12, padding: "12px 14px",
        border: "1px solid #FAC77540",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#854F0B" }}>🎯 Approaching milestone</div>
        <div style={{ fontSize: 13, color: "#633806", marginTop: 4 }}>
          Daniel is 2 sessions away from <b>25 Sessions!</b>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "#FAC77540", marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "92%", borderRadius: 3, background: "#BA7517" }} />
        </div>
      </div>
      <BottomNav active="feed" role="caregiver" />
    </div>
  );
}

/* ─── ATHLETE SCREENS (no bottom nav) ─── */

function AthleteJourney() {
  const a = DEMO_DATA.athletes[0];
  return (
    <div style={{ background: a.color + "08" }}>
      <div style={{
        background: `linear-gradient(135deg, ${a.color}, ${a.color}CC)`,
        borderRadius: "0 0 24px 24px", padding: "20px 16px 24px", color: "white",
        textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
          margin: "0 auto 8px", border: "2px solid rgba(255,255,255,0.3)",
        }}>{a.avatar}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Daniel</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Sunrise Running Club</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
          {[["23", "Runs"], ["38.4", "Total km"], ["6", "Streak"]].map(([v, l], i) => (
            <div key={i}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 10 }}>How are you feeling today?</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {["😔", "😐", "🙂", "😊", "😄"].map((e, i) => (
            <div key={i} style={{
              width: 48, height: 48, borderRadius: 14,
              background: i === 3 ? a.color + "18" : "white",
              border: i === 3 ? `2px solid ${a.color}` : "1px solid #E8E6E0",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              cursor: "pointer",
            }}>{e}</div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 10 }}>My milestones</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18 }}>
          {[
            { icon: "👟", name: "First Run", done: true },
            { icon: "⭐", name: "5 Sessions", done: true },
            { icon: "🎯", name: "10km", done: true },
            { icon: "🏆", name: "25 Sessions", done: false },
          ].map((m, i) => (
            <div key={i} style={{
              minWidth: 80, padding: "10px 8px", borderRadius: 12, textAlign: "center",
              background: m.done ? a.color + "12" : "#F1EFE8",
              border: m.done ? `1px solid ${a.color}30` : "1px solid #E8E6E0",
            }}>
              <div style={{ fontSize: 22, marginBottom: 2, opacity: m.done ? 1 : 0.4 }}>{m.icon}</div>
              <div style={{ fontSize: 11, color: m.done ? a.color : "#B4B2A9", fontWeight: m.done ? 600 : 400 }}>{m.name}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 10 }}>From Mum 💚</div>
        <div style={{
          background: "white", borderRadius: 12, padding: "12px 14px",
          border: "1px solid #E8E6E0",
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>💚</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Great job today!</div>
          <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>From Mum · 2 hours ago</div>
        </div>
      </div>
    </div>
  );
}

function AthleteGoal() {
  const a = DEMO_DATA.athletes[0];
  return (
    <div style={{ padding: "12px 14px 16px", background: a.color + "04" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>My running goal</div>
        <div style={{ fontSize: 13, color: "#888780", marginTop: 2 }}>What do you want to work toward?</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: "🏃", label: "Run further", desc: "Increase my distance each week", active: true },
          { icon: "😊", label: "Have fun", desc: "Enjoy every session", active: false },
          { icon: "👥", label: "Run with friends", desc: "Keep running with my group", active: false },
          { icon: "🏅", label: "Earn milestones", desc: "Collect all the badges", active: false },
        ].map((g, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px",
            borderRadius: 12, cursor: "pointer",
            background: g.active ? a.color + "12" : "white",
            border: g.active ? `2px solid ${a.color}` : "1px solid #E8E6E0",
          }}>
            <div style={{ fontSize: 24 }}>{g.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{g.label}</div>
              <div style={{ fontSize: 12, color: "#888780" }}>{g.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", padding: "12px", borderRadius: 10, marginTop: 16,
        background: a.color, color: "white", border: "none",
        fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}>Save my goal</button>
    </div>
  );
}

function AthleteFavourite() {
  const a = DEMO_DATA.athletes[0];
  return (
    <div style={{ padding: "12px 14px 16px", background: a.color + "04" }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 12 }}>My favourite runs ❤️</div>
      {[
        { date: "Mar 28", dist: "2.3 km", feel: "😊", note: "Ran the whole way!" },
        { date: "Mar 15", dist: "2.1 km", feel: "😄", note: "Best time ever" },
        { date: "Feb 22", dist: "1.8 km", feel: "😊", note: "Ran with Liam" },
      ].map((r, i) => (
        <div key={i} style={{
          background: "white", borderRadius: 12, padding: "14px", marginBottom: 8,
          border: "1px solid #E8E6E0", position: "relative",
        }}>
          <div style={{ position: "absolute", top: 12, right: 12, fontSize: 16, color: "#D85A30" }}>❤️</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 22 }}>{r.feel}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{r.dist}</div>
              <div style={{ fontSize: 12, color: "#888780" }}>{r.date}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#5F5E5A", fontStyle: "italic" }}>"{r.note}"</div>
        </div>
      ))}
      <div style={{ fontSize: 13, color: "#888780", textAlign: "center", padding: "12px", fontStyle: "italic" }}>
        Tap ❤️ on any run to add it here
      </div>
    </div>
  );
}

/* ─── SCREEN CONFIG ─── */
const SCREENS = {
  coach: [
    { id: "feed", label: "Coach feed", desc: "Priority buckets surface what needs attention now", component: CoachFeed },
    { id: "sessions", label: "Session scheduling", desc: "Create sessions, track RSVPs, manage coach-athlete pairings", component: CoachSessions },
    { id: "milestone", label: "Milestone celebration", desc: "Sensory-safe celebrations with shareable certificates", component: CoachMilestone },
  ],
  caregiver: [
    { id: "dashboard", label: "Progress dashboard", desc: "See your athlete's journey without being at the track", component: CaregiverDashboard },
    { id: "sessions", label: "Upcoming sessions", desc: "See when sessions are, who your child is paired with", component: CaregiverSessions },
    { id: "digest", label: "Weekly digest", desc: "Automated summary delivered to your inbox every Monday", component: CaregiverDigest },
  ],
  athlete: [
    { id: "journey", label: "My Journey", desc: "A personal page that's truly theirs — avatar, colour, milestones", component: AthleteJourney },
    { id: "goal", label: "Choose a goal", desc: "Simple, literal choices — no jargon, no pressure", component: AthleteGoal },
    { id: "favourites", label: "Favourite runs", desc: "Athletes curate their own highlight reel", component: AthleteFavourite },
  ],
};

/* ─── MAIN DEMO PAGE ─── */
export default function KitaDemoPrototype() {
  const [activeRole, setActiveRole] = useState("coach");
  const [screenIdx, setScreenIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => { setScreenIdx(0); }, [activeRole]);

  const screens = SCREENS[activeRole];
  const current = screens[screenIdx];

  const goTo = (idx) => {
    if (idx === screenIdx || transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setScreenIdx(idx); setTransitioning(false); }, 200);
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Nunito Sans', system-ui, sans-serif",
      maxWidth: 680, margin: "0 auto", padding: "20px 16px",
      color: "#2C2C2A",
    }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#888780", fontWeight: 600, marginBottom: 6 }}>Interactive demo</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.2 }}>
          See kita<span style={{ fontWeight: 300 }}>run</span> in action
        </div>
        <div style={{ fontSize: 14, color: "#888780", marginTop: 6 }}>
          Explore the app through each role's eyes
        </div>
      </div>

      <div style={{
        display: "flex", gap: 6, justifyContent: "center", marginBottom: 20,
        background: "#F1EFE8", borderRadius: 12, padding: 4,
      }}>
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRole(r.id)}
            style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              background: activeRole === r.id ? "white" : "transparent",
              color: activeRole === r.id ? r.color : "#888780",
              boxShadow: activeRole === r.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span style={{ marginRight: 4, fontSize: 14 }}>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{current.label}</div>
        <div style={{ fontSize: 13, color: "#888780", marginTop: 2 }}>{current.desc}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <button
          onClick={() => goTo(Math.max(0, screenIdx - 1))}
          disabled={screenIdx === 0}
          style={{
            width: 36, height: 36, borderRadius: 18, border: "1px solid #E8E6E0",
            background: "white", cursor: screenIdx === 0 ? "default" : "pointer",
            opacity: screenIdx === 0 ? 0.3 : 1, fontSize: 16, color: "#5F5E5A",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "opacity 0.2s",
          }}
        >←</button>

        <div style={{
          opacity: transitioning ? 0.4 : 1,
          transform: transitioning ? "scale(0.97)" : "scale(1)",
          transition: "all 0.2s ease",
        }}>
          <PhoneFrame>
            <current.component />
          </PhoneFrame>
        </div>

        <button
          onClick={() => goTo(Math.min(screens.length - 1, screenIdx + 1))}
          disabled={screenIdx === screens.length - 1}
          style={{
            width: 36, height: 36, borderRadius: 18, border: "1px solid #E8E6E0",
            background: "white", cursor: screenIdx === screens.length - 1 ? "default" : "pointer",
            opacity: screenIdx === screens.length - 1 ? 0.3 : 1, fontSize: 16, color: "#5F5E5A",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "opacity 0.2s",
          }}
        >→</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {screens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            style={{
              width: i === screenIdx ? 24 : 8, height: 8, borderRadius: 4,
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: i === screenIdx
                ? ROLES.find(r => r.id === activeRole).color
                : "#D3D1C7",
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <div style={{
          display: "inline-block", padding: "12px 28px", borderRadius: 10,
          background: "#0F6E56", color: "white", fontSize: 14, fontWeight: 600,
          cursor: "pointer",
        }}>
          Start your club →
        </div>
        <div style={{ fontSize: 12, color: "#888780", marginTop: 8 }}>
          We'll set you up and walk you through your first session
        </div>
      </div>
    </div>
  );
}
