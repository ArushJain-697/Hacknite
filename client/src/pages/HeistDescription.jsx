import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import HeistSlideDeck from "../components/HeistSlideDeck";
import { heistToDossierForm } from "../utils/heistToDossierForm";
import { normalizeDossierData } from "../utils/normalizeDossierData";

function idsMatch(a, b) {
  return (
    a != null &&
    b != null &&
    (a === b || Number(a) === Number(b) || String(a) === String(b))
  );
}

function heistRecordId(h) {
  if (h == null) return null;
  return h.id ?? h.heist_id ?? h["heist id"];
}

/**
 * Produces the dossier input shape from API data.
 * Matches server `getMyHeists` / sicario `getHeists` (heistController / sicarioController):
 * section_a–e, timeline steps `{ step, time, desc }`, crew `{ title, job, requirements, threat_level, money_share }`.
 * No synthetic fields — only what the backend returns.
 */
function transformHeist(apiHeist) {
  if (!apiHeist) return null;
  const id = heistRecordId(apiHeist);

  if (apiHeist.section_a && apiHeist.section_b) {
    const intelSrc =
      apiHeist.section_b.intel && typeof apiHeist.section_b.intel === "object"
        ? apiHeist.section_b.intel
        : {};

    return {
      id,
      status: apiHeist.status ?? null,
      created_at: apiHeist.created_at ?? null,
      section_a: {
        operation_name: apiHeist.section_a.operation_name,
        place: apiHeist.section_a.place,
        target: apiHeist.section_a.target,
        introduction: apiHeist.section_a.introduction,
        quote: apiHeist.section_a.quote,
      },
      section_b: {
        phase1_name: apiHeist.section_b.phase1_name,
        phase1_description: apiHeist.section_b.phase1_description,
        phase1_photo_url: apiHeist.section_b.phase1_photo_url,
        intel: {
          end_points_mapped: intelSrc.end_points_mapped,
          guard_rotations: intelSrc.guard_rotations,
          surveillance_hours: intelSrc.surveillance_hours,
          vulnerabilities_found: intelSrc.vulnerabilities_found,
        },
      },
      section_c: {
        execution_description: apiHeist.section_c?.execution_description,
        execution_photo_url: apiHeist.section_c?.execution_photo_url,
        timeline: Array.isArray(apiHeist.section_c?.timeline)
          ? apiHeist.section_c.timeline
          : [],
      },
      section_d: {
        extraction_plan: apiHeist.section_d?.extraction_plan,
        extraction_photo_url: apiHeist.section_d?.extraction_photo_url,
      },
      section_e: {
        crew_members: Array.isArray(apiHeist.section_e?.crew_members)
          ? apiHeist.section_e.crew_members
          : [],
      },
    };
  }

  /* Rare: flat row–style object without nested sections (not current API). */
  const intelFlat =
    apiHeist.intel && typeof apiHeist.intel === "object"
      ? apiHeist.intel
      : {};
  return {
    id,
    status: apiHeist.status ?? null,
    created_at: apiHeist.created_at ?? null,
    section_a: {
      operation_name: apiHeist.operation_name ?? "",
      place: apiHeist.place ?? "",
      target: apiHeist.target ?? "",
      introduction: apiHeist.introduction ?? "",
      quote: apiHeist.quote ?? "",
    },
    section_b: {
      phase1_name: apiHeist.phase1_name,
      phase1_description: apiHeist.phase1_description,
      phase1_photo_url: apiHeist.phase1_photo_url,
      intel: {
        end_points_mapped: intelFlat.end_points_mapped,
        guard_rotations: intelFlat.guard_rotations,
        surveillance_hours: intelFlat.surveillance_hours,
        vulnerabilities_found: intelFlat.vulnerabilities_found,
      },
    },
    section_c: {
      execution_description: apiHeist.execution_description,
      execution_photo_url: apiHeist.execution_photo_url,
      timeline: Array.isArray(apiHeist.timeline) ? apiHeist.timeline : [],
    },
    section_d: {
      extraction_plan: apiHeist.extraction_plan,
      extraction_photo_url: apiHeist.extraction_photo_url,
    },
    section_e: {
      crew_members: Array.isArray(apiHeist.crew_members)
        ? apiHeist.crew_members
        : [],
    },
  };
}

export default function HeistDescription() {
  const [applying, setApplying] = useState(false);
  const [role, setRole] = useState("sicario");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const stateHeist = location.state?.heist;

  const heistId =
    id != null
      ? Number(id)
      : heistRecordId(stateHeist) != null
        ? Number(heistRecordId(stateHeist))
        : null;

  const [heist, setHeist] = useState(() => {
    const sid = heistRecordId(stateHeist);
    if (stateHeist && idsMatch(sid, heistId)) {
      return transformHeist(stateHeist);
    }
    return null;
  });
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
        setRole(userRole);
        const url =
          userRole === "fixer"
            ? "https://api.sicari.works/api/fixer/heists"
            : "https://api.sicari.works/api/sicario/heists";
        return fetch(url, { credentials: "include" });
      })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : data.heists || data.data || [];
        const found = arr.find((h) => Number(heistRecordId(h)) === heistId);

        if (found) {
          setHeist(transformHeist(found));
          setError(null);
        } else if (stateHeist && idsMatch(heistRecordId(stateHeist), heistId)) {
          setHeist(transformHeist(stateHeist));
          setError(null);
        } else {
          setHeist(null);
          setError("not-found");
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (stateHeist && idsMatch(heistRecordId(stateHeist), heistId)) {
          setHeist(transformHeist(stateHeist));
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
  }, [heistId, stateHeist]);

  const dossierForm = useMemo(() => {
    if (!heist) return null;
    const flat = heistToDossierForm(heist);
    return normalizeDossierData(flat) ?? flat;
  }, [heist]);

  const handleApply = useCallback(async () => {
    if (!heist?.id || applying) return;
    setApplying(true);
    try {
      const res = await fetch(
        `https://api.sicari.works/api/sicario/apply/${heist.id}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        navigate("/my_heists");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to apply");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setApplying(false);
    }
  }, [heist, applying, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-400 text-sm tracking-wide">
        Loading operation data…
      </div>
    );
  }

  if (error === "missing-id" || !heist || !dossierForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#09090b] text-zinc-300">
        <p>
          {error === "missing-id"
            ? "No case file selected."
            : "File not found or restricted."}
        </p>
        <button
          type="button"
          className="border border-red-500/50 px-6 py-2 uppercase tracking-widest text-red-400 hover:bg-red-950/40 transition-colors"
          onClick={() => navigate("/Heists")}
        >
          Return to wall
        </button>
      </div>
    );
  }

  return (
    <HeistSlideDeck
      formData={dossierForm}
      showApply={role === "sicario"}
      onApply={handleApply}
      applying={applying}
    />
  );
}
