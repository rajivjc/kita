import { useState } from "react";

export default function LandingPagePrototype() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      color: "#2C2C2A",
      maxWidth: 680,
      margin: "0 auto",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 20px", borderBottom: "1px solid #E8E6E0",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          kita<span style={{ fontWeight: 300 }}>run</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#888780" }}>
          <span>Our story</span>
          <span>Features</span>
          <span>Accessibility</span>
          <span style={{ color: "#0F6E56", fontWeight: 600 }}>Sign in</span>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        padding: "48px 20px 40px", textAlign: "center",
        background: "linear-gradient(180deg, #FBF9F7 0%, #E8F5EE 100%)",
      }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12,
          color: "#2C2C2A",
        }}>
          The running app where{" "}
          <span style={{ color: "#0F6E56" }}>every athlete</span> belongs
        </h1>
        <p style={{ fontSize: 15, color: "#5F5E5A", lineHeight: 1.6, marginBottom: 6, maxWidth: 480, margin: "0 auto 6px" }}>
          Built for coaches, caregivers, and athletes with intellectual disabilities.
          Inclusive by design. Not an afterthought.
        </p>
        <p style={{ fontSize: 13, color: "#888780", marginBottom: 24 }}>
          For Special Olympics clubs, inclusive running groups, and adaptive sports programmes
        </p>

        {/* ─── CTA PAIR (revised hierarchy) ─── */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {/* PRIMARY: See the app */}
          <a href="/demo" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "14px 28px", borderRadius: 10,
            background: "#0F6E56", color: "white",
            fontSize: 15, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 2px 8px rgba(15,110,86,0.25)",
          }}>
            See the app →
          </a>
          {/* SECONDARY: Watch overview */}
          <button
            onClick={() => setVideoOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "14px 24px", borderRadius: 10,
              background: "white", color: "#2C2C2A",
              fontSize: 15, fontWeight: 600, border: "1px solid #D3D1C7",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18 }}>▶</span> Watch overview
          </button>
        </div>

        {/* Annotation showing the change */}
        <div style={{
          marginTop: 20, display: "flex", justifyContent: "center", gap: 32,
          fontSize: 11, color: "#888780",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#0F6E56", margin: "0 auto 4px" }} />
            Primary CTA → /demo
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#D3D1C7", margin: "0 auto 4px" }} />
            Secondary → video lightbox
          </div>
        </div>
      </section>

      {/* ─── Collapsed sections (showing structure) ─── */}
      <SectionPlaceholder label="WHY I BUILT THIS" title="Our story" color="#FBF9F7" note="Existing story section — no changes" />
      <SectionPlaceholder label="SEE IT IN ACTION" title="Three roles. One app. Zero clutter." color="white" note="Existing screenshot gallery — no changes" />
      <SectionPlaceholder label="BUILT FOR THREE ROLES" title="Everyone has their own view" color="#FBF9F7" note="Existing features section — no changes" />
      <SectionPlaceholder label="BUILT DIFFERENTLY" title="Inclusive design is not a feature" color="#1A1A2E" dark note="Existing inclusive design section — no changes" />
      <SectionPlaceholder label="HOW IT WORKS" title="Up and running in 3 steps" color="white" note="Existing how-it-works section — no changes" />

      {/* ─── Video section (NEW, lightweight) ─── */}
      <section style={{
        padding: "32px 20px", textAlign: "center",
        background: "#FBF9F7", borderTop: "1px solid #E8E6E0",
      }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#888780", fontWeight: 600, marginBottom: 6 }}>
          Prefer to watch?
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          2-minute overview
        </h2>
        <p style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>
          See the coach, caregiver, and athlete experience in action
        </p>
        {/* Video placeholder */}
        <div style={{
          maxWidth: 480, margin: "0 auto", aspectRatio: "16/9",
          background: "#E8E6E0", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", overflow: "hidden",
        }} onClick={() => setVideoOpen(true)}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: "rgba(255,255,255,0.9)", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}>
            <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
          </div>
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(0,0,0,0.6)", color: "white",
            fontSize: 11, padding: "2px 8px", borderRadius: 4,
          }}>2:15</div>
        </div>
        <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8 }}>
          YouTube embed — appears once video is recorded
        </p>

        {/* Annotation */}
        <div style={{
          marginTop: 12, padding: "8px 16px", borderRadius: 8,
          background: "#FBF5EC", border: "1px solid #FAC77530",
          fontSize: 11, color: "#854F0B", display: "inline-block",
        }}>
          ⏳ This section ships with Workstream A (after video recording)
        </div>
      </section>

      <SectionPlaceholder label="COMMON QUESTIONS" title="Everything you need to know" color="white" note="Existing FAQ section — no changes" />

      {/* ─── CTA / Contact section ─── */}
      <section style={{
        padding: "40px 20px", textAlign: "center",
        background: "linear-gradient(180deg, #E8F5EE 0%, #FBF9F7 100%)",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Start running sessions with your club
        </h2>
        <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
          We'll set up your club and walk you through your first session. Takes less than a week.
        </p>

        {/* Simplified form representation */}
        <div style={{
          maxWidth: 400, margin: "0 auto", textAlign: "left",
        }}>
          {["Your name", "Email", "Club / organisation name", "Tell us about your club"].map((label, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A", display: "block", marginBottom: 4 }}>{label}</label>
              <div style={{
                background: "white", border: "1px solid #D3D1C7", borderRadius: 8,
                padding: "10px 12px", fontSize: 13, color: "#B4B2A9",
                height: i === 3 ? 72 : "auto",
              }}>
                {i === 3 ? "" : ""}
              </div>
            </div>
          ))}
          <button style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: "#0F6E56", color: "white", border: "none",
            fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4,
          }}>
            Get started →
          </button>
          <p style={{ fontSize: 12, color: "#888780", textAlign: "center", marginTop: 8 }}>
            You'll hear from us within 48 hours
          </p>
        </div>

        {/* Annotation */}
        <div style={{
          marginTop: 16, padding: "8px 16px", borderRadius: 8,
          background: "#E6F1FB", border: "1px solid #85B7EB30",
          fontSize: 11, color: "#0C447C", display: "inline-block",
        }}>
          Workstream C: refined CTA copy — concierge framing
        </div>
      </section>

      {/* Footer placeholder */}
      <footer style={{
        padding: "20px", textAlign: "center", fontSize: 12, color: "#888780",
        borderTop: "1px solid #E8E6E0",
      }}>
        Privacy Policy · Terms · GitHub · hello@kitarun.com
      </footer>

      {/* Video lightbox */}
      {videoOpen && (
        <div
          onClick={() => setVideoOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 999, cursor: "pointer",
          }}
        >
          <div style={{
            width: "90%", maxWidth: 560, aspectRatio: "16/9",
            background: "#1a1a1a", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 14,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>▶</div>
              <div>YouTube embed would play here</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Click anywhere to close</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionPlaceholder({ label, title, color, dark, note }) {
  return (
    <section style={{
      padding: "24px 20px", textAlign: "center",
      background: color, borderTop: dark ? "none" : "1px solid #E8E6E0",
    }}>
      <p style={{
        fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5,
        color: dark ? "#5DCAA5" : "#888780", fontWeight: 600, marginBottom: 4,
      }}>{label}</p>
      <p style={{
        fontSize: 16, fontWeight: 700,
        color: dark ? "white" : "#2C2C2A", marginBottom: 4,
      }}>{title}</p>
      <p style={{ fontSize: 11, color: dark ? "#9FE1CB" : "#B4B2A9", fontStyle: "italic" }}>{note}</p>
    </section>
  );
}
