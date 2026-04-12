import React, { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "../styles/HeistPage.css";

// ─────────────────────────────────────────────
// Scroll-triggered section wrapper
// ─────────────────────────────────────────────
function ScrollSection({ children, className = "", id }) {
  return (
    <motion.section
      id={id}
      className={`heist-section ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Animated text block
// ─────────────────────────────────────────────
function RevealBlock({ children, delay = 0, direction = "up" }) {
  const yOffset = direction === "up" ? 50 : direction === "down" ? -50 : 0;
  const xOffset = direction === "left" ? 50 : direction === "right" ? -50 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Redacted text span
// ─────────────────────────────────────────────
function RedactedSpan({ children }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      className="redact"
      style={revealed ? { background: "rgba(192,57,43,0.15)", color: "var(--heist-accent-red)" } : {}}
      onClick={() => setRevealed(!revealed)}
      title="Click to reveal"
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Heat level bar
// ─────────────────────────────────────────────
function HeatBar({ level, label }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="heat-level" ref={ref}>
      <div className="heat-label">
        <span>{label}</span>
        <span className="heat-value">{level}%</span>
      </div>
      <div className="heat-bar-track">
        <motion.div
          className="heat-bar-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function idsMatch(a, b) {
  return (
    a != null &&
    b != null &&
    (a === b || Number(a) === Number(b) || String(a) === String(b))
  );
}

export default function HeistDescription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const stateHeist = location.state?.heist;

  const heistId = id != null ? Number(id) : stateHeist?.id != null ? Number(stateHeist.id) : null;

  const [heist, setHeist] = useState(() => (stateHeist && idsMatch(stateHeist.id, heistId) ? stateHeist : null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (heistId == null || Number.isNaN(heistId)) {
      setLoading(false);
      setError("missing-id");
      return;
    }

    let cancelled = false;

    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((authData) => {
        const userRole = authData?.user?.role || "sicario";
        const url = userRole === "fixer"
            ? "https://api.sicari.works/api/fixer/heists"
            : "https://api.sicari.works/api/sicario/heists";
        return fetch(url, { credentials: "include" });
      })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : data.heists || data.data || [];
        const found = arr.find((h) => idsMatch(h.id, heistId));
        if (found) {
          setHeist(found);
          setError(null);
        } else if (stateHeist && idsMatch(stateHeist.id, heistId)) {
          setHeist(stateHeist);
          setError(null);
        } else {
          setHeist(null);
          setError("not-found");
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (stateHeist && idsMatch(stateHeist.id, heistId)) {
          setHeist(stateHeist);
          setError(null);
        } else {
          setError("fetch-failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [heistId, stateHeist?.id]);

  // Framer motion scroll setup
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const bgY1 = useTransform(scrollYProgress, [0, 0.33], ["0%", "-8%"]);
  const bgY2 = useTransform(scrollYProgress, [0.33, 0.66], ["0%", "-8%"]);
  const bgY3 = useTransform(scrollYProgress, [0.66, 1], ["0%", "-8%"]);

  const bg1Opacity = useTransform(scrollYProgress, [0, 0.28, 0.35], [1, 1, 0]);
  const bg2Opacity = useTransform(scrollYProgress, [0.28, 0.35, 0.62, 0.68], [0, 1, 1, 0]);
  const bg3Opacity = useTransform(scrollYProgress, [0.62, 0.68, 1], [0, 1, 1]);

  const bg1Blur = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 2, 6]);
  const bg2Blur = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 2, 5]);
  const bg3Blur = useTransform(scrollYProgress, [0.68, 0.85, 1], [0, 1, 3]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center text-[#e8dcc8]" style={{ background: "#0a0a0c", fontFamily: "var(--font-mono)" }}>
        Loading operation data...
      </div>
    );
  }

  if (error === "missing-id" || !heist) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-6 text-[#e8dcc8]" style={{ background: "#0a0a0c", fontFamily: "var(--font-mono)" }}>
        <p>{error === "missing-id" ? "No case file selected." : "File not found or restricted."}</p>
        <button type="button" className="border-2 border-[#c9a84c] px-6 py-2 uppercase tracking-widest text-[#c9a84c]" onClick={() => navigate("/Heists")}>
          Return to wall
        </button>
      </div>
    );
  }

  const { section_a, section_b, section_c, section_d, section_e } = heist;

  // Fallbacks for URLs
  const defaultBg1 = "/assets/heist/phase1_recon.png";
  const defaultBg2 = "/assets/heist/phase2_execution.png";
  const defaultBg3 = "/assets/heist/phase3_extraction.png";

  const backgrounds = [
    section_b?.phase1_photo_url || defaultBg1,
    section_c?.execution_photo_url || defaultBg2,
    section_d?.extraction_photo_url || defaultBg3,
  ];

  // Helper variables
  const operationName = section_a?.operation_name || "Unknown Operation";
  const target = section_a?.target || "Unknown Target";
  const creationDate = heist.created_at ? new Date(heist.created_at).toISOString().split('T')[0] : "classified";
  const timelineEvents = Array.isArray(section_c?.timeline) ? section_c.timeline : [];
  const teamArray = Array.isArray(section_e?.crew_members) ? section_e.crew_members : [];

  return (
    <div className="heist-page" ref={containerRef}>
      <div className="heist-progress">
        <motion.div className="heist-progress-bar" style={{ scaleX }} />
      </div>

      <div className="scanlines" />

      <motion.div className="heist-bg-layer" style={{ opacity: bg1Opacity, filter: useTransform(bg1Blur, (v) => `blur(${v}px) grayscale(0.2)`), y: bgY1 }}>
        <img src={backgrounds[0]} alt="Phase 1" loading="eager" />
      </motion.div>

      <motion.div className="heist-bg-layer" style={{ opacity: bg2Opacity, filter: useTransform(bg2Blur, (v) => `blur(${v}px) saturate(1.3)`), y: bgY2 }}>
        <img src={backgrounds[1]} alt="Phase 2" loading="eager" />
      </motion.div>

      <motion.div className="heist-bg-layer" style={{ opacity: bg3Opacity, filter: useTransform(bg3Blur, (v) => `blur(${v}px) grayscale(0.4)`), y: bgY3 }}>
        <img src={backgrounds[2]} alt="Phase 3" loading="eager" />
      </motion.div>

      <div className="heist-bg-overlay" />

      <div className="heist-scroll-content">
        <div style={{ padding: '2rem' }}>
          <button onClick={() => navigate(-1)} style={{ color: 'var(--heist-text)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--heist-border)', padding: '0.5rem 1rem', cursor: 'pointer', opacity: 0.8 }}>
            &larr; BACK
          </button>
        </div>

        <section className="heist-hero" id="heist-hero">
          <motion.div className="heist-hero-inner" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <motion.div className="heist-classification" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
              TS//SCI — EYES ONLY
            </motion.div>

            <h1 className="heist-hero-title">
              <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
                Operation
              </motion.span>
              <motion.span className="accent-gold" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
                {operationName}
              </motion.span>
            </h1>

            <motion.p className="heist-hero-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
              {section_a?.introduction || "A high stakes extraction. Zero casualties. Zero traces. Complete deniability."}
            </motion.p>

            <motion.div className="heist-hero-meta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.8 }}>
              <span>Case File: {heist.id || "CLASSIFIED"}</span>
              <span className="dot" />
              <span>Status: {heist.status || "UNKNOWN"}</span>
              <span className="dot" />
              <span>Target: {target}</span>
              <span className="dot" />
              <span>Declassified: {creationDate}</span>
            </motion.div>
          </motion.div>

          <motion.div className="scroll-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 0.8 }}>
            <span>Scroll to Declassify</span>
            <div className="scroll-line" />
          </motion.div>
        </section>

        {section_a?.quote && (
          <ScrollSection id="mission-objective">
            <div className="heist-section-content">
              <RevealBlock>
                <div className="mission-objective">
                  <div className="obj-label">Priority Alpha — Mission Objective</div>
                  <div className="obj-text" style={{ textTransform: 'uppercase', fontSize: '1.2rem', lineHeight: 1.6 }}>
                    {section_a.quote}
                  </div>
                </div>
              </RevealBlock>
            </div>
          </ScrollSection>
        )}

        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase I</div>
          <div className="divider-line" />
        </div>

        <ScrollSection id="phase-1-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 01 — {section_b?.phase1_name || "Intel & Reconnaissance"}</div>
                <h2 className="phase-title amber">
                  Know Thy <br />Enemy
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                {section_b?.phase1_description || "Every security rotation, every camera angle, and every biometric handshake has been catalogued."}
              </p>
            </RevealBlock>
            {section_a?.place && (
              <RevealBlock delay={0.25}>
                <p className="narrative-text">
                  The target facility is situated in <RedactedSpan>{section_a.place}</RedactedSpan>. Its blueprints are classified under restricted national security framing.
                </p>
              </RevealBlock>
            )}
          </div>
        </ScrollSection>

        {section_b?.intel && (
          <ScrollSection id="phase-1-intel">
            <div className="heist-section-content">
              <RevealBlock>
                <div className="intel-grid">
                  <motion.div className="intel-card" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="label">End Points</div>
                    <div className="value" style={{ fontSize: '1.1rem', marginTop: '10px' }}>{section_b.intel.end_points_mapped || "N/A"}</div>
                    <div className="detail">Access mapped</div>
                  </motion.div>
                  <motion.div className="intel-card" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="label">Guard Rotations</div>
                    <div className="value" style={{ fontSize: '1.1rem', marginTop: '10px' }}>{section_b.intel.guard_rotations || "N/A"}</div>
                    <div className="detail">Personnel cycles</div>
                  </motion.div>
                  <motion.div className="intel-card" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="label">Surveillance</div>
                    <div className="value" style={{ fontSize: '1.1rem', marginTop: '10px' }}>{section_b.intel.surveillance_hours || "N/A"}</div>
                    <div className="detail">Downtime estimated</div>
                  </motion.div>
                  <motion.div className="intel-card" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="label">Vulnerabilities</div>
                    <div className="value" style={{ fontSize: '1.1rem', marginTop: '10px', color: 'var(--heist-accent-red)' }}>{section_b.intel.vulnerabilities_found || "N/A"}</div>
                    <div className="detail">Identified weak points</div>
                  </motion.div>
                </div>
              </RevealBlock>
            </div>
          </ScrollSection>
        )}

        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase II</div>
          <div className="divider-line" />
        </div>

        <ScrollSection id="phase-2-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 02 — The Execution</div>
                <h2 className="phase-title red">
                  The Clock <br />Starts Now
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                {section_c?.execution_description || "After the insertion window, every second is accounted for—every movement choreographed to the millisecond."}
              </p>
            </RevealBlock>
          </div>
        </ScrollSection>

        {timelineEvents.length > 0 && (
          <ScrollSection id="phase-2-timeline">
            <div className="heist-section-content">
              <RevealBlock>
                <div className="heist-timeline">
                  {timelineEvents.map((t, index) => (
                    <motion.div
                      key={t.step || index}
                      className={`timeline-entry ${index % 2 === 0 ? "active" : ""}`}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="timeline-time">T+ {t.time}</div>
                      <div className="timeline-event">Step {t.step}</div>
                      <div className="timeline-desc">{t.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </RevealBlock>
            </div>
          </ScrollSection>
        )}

        <ScrollSection id="phase-2-heat">
          <div className="heist-section-content">
            <RevealBlock>
              <HeatBar level={85} label="Threat Level — Active" />
            </RevealBlock>
            <RevealBlock delay={0.1}>
              <HeatBar level={42} label="Detection Probability" />
            </RevealBlock>

            {teamArray.length > 0 && (
              <RevealBlock delay={0.35}>
                <div className="personnel-grid">
                  {teamArray.map((p, i) => (
                    <motion.div
                      key={i}
                      className="personnel-card"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="status-dot" />
                      <div className="role-tag">{p.job}</div>
                      <div className="codename">{p.title}</div>
                      <div className="specialty">
                        Share: {p.money_share}<br/>
                        Req: {p.requirements}<br/>
                        Threat: <span style={{color: 'var(--heist-accent-red)'}}>{String(p.threat_level).toUpperCase()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </RevealBlock>
            )}
          </div>
        </ScrollSection>

        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase III</div>
          <div className="divider-line" />
        </div>

        <ScrollSection id="phase-3-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 03 — Extraction &amp; Laundering</div>
                <h2 className="phase-title green">
                  Vanishing <br />Act
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                {section_d?.extraction_plan || "The assets leave the jurisdiction in separate streams—none traceable to the same origin."}
              </p>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="heist-end">
          <div className="heist-section-content end-section-layout">
            <RevealBlock>
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                style={{
                  display: "inline-block",
                  border: "3px solid var(--heist-accent-red)",
                  padding: "1.5rem 3rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--heist-accent-red)",
                  transform: "rotate(-5deg)",
                  opacity: 0.7,
                }}
              >
                FILE CLOSED
              </motion.div>
            </RevealBlock>

            <RevealBlock delay={0.3} direction="left">
              <div className="apply-section">
                <motion.button
                  className="heist-apply-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  APPLY FOR CREW
                </motion.button>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        <div className="dossier-footer">
          <div className="end-stamp">
            End of Classified Dossier — {operationName} — All Rights Denied
          </div>
        </div>
      </div>
    </div>
  );
}
