/**
 * Maps `section_a` … `section_e` (as returned by the API) to the flat dossier
 * shape for HeistSlideDeck / dossier mapping. Field names align with server validation
 * (`validate.js`): timeline steps use `desc`; crew uses `money_share`, `threat_level`.
 */

function str(v) {
  if (v == null) return "";
  return String(v).trim();
}

/** Map free-form threat strings to dossier badge keys. */
export function normalizeThreatLevel(raw) {
  const s = str(raw).toUpperCase().replace(/\s+/g, "");
  if (s.includes("EXTREME")) return "EXTREME";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MEDIUM")) return "MEDIUM";
  if (s.includes("LOW")) return "LOW";
  return "";
}

export function normalizeCrewMemberFromApi(m) {
  if (!m || typeof m !== "object") {
    return {
      title: "",
      job: "",
      moneyShare: "",
      requirements: "",
      threatLevel: "",
    };
  }
  return {
    title: str(m.title ?? m.codename),
    job: str(m.job),
    moneyShare: str(m.money_share ?? m.moneyShare),
    requirements: str(m.requirements),
    threatLevel: normalizeThreatLevel(m.threat_level ?? m.threatLevel),
  };
}

function heistRecordId(h) {
  if (h == null) return null;
  return h.id ?? h.heist_id ?? h["heist id"];
}

/**
 * @param {object} heist - Normalized heist with section_a … section_e (from API or transformHeist).
 * @returns {object} Flat fields for dossier UI + id metadata for actions.
 */
export function heistToDossierForm(heist) {
  if (!heist || typeof heist !== "object") return {};

  const a = heist.section_a || {};
  const b = heist.section_b || {};
  const c = heist.section_c || {};
  const d = heist.section_d || {};
  const e = heist.section_e || {};
  const intel = b.intel && typeof b.intel === "object" ? b.intel : {};

  const timelineRaw = Array.isArray(c.timeline) ? c.timeline : [];
  const timeline = timelineRaw
    .map((t) => ({
      time: str(t?.time),
      description: str(t?.description ?? t?.desc),
    }))
    .filter((t) => t.time || t.description);

  const crewRaw = Array.isArray(e.crew_members) ? e.crew_members : [];
  const crew = crewRaw.map(normalizeCrewMemberFromApi);

  return {
    heistId: heistRecordId(heist),
    status: heist.status != null ? str(heist.status) : "",
    created_at: heist.created_at,

    operationName: str(a.operation_name),
    place: str(a.place),
    target: str(a.target),
    introduction: str(a.introduction),
    quote: str(a.quote),

    phase1Name: str(b.phase1_name),
    phase1Description: str(b.phase1_description),
    phase1Photo: str(b.phase1_photo_url),

    executionDescription: str(c.execution_description),
    executionPhoto: str(c.execution_photo_url),

    extractionPlan: str(d.extraction_plan),
    extractionPhoto: str(d.extraction_photo_url),

    intelEndpoints: str(intel.end_points_mapped),
    intelGuardRotations: str(intel.guard_rotations),
    intelSurveillanceHours: str(intel.surveillance_hours),
    intelVulnerabilities: str(intel.vulnerabilities_found),

    timeline,
    crew,
  };
}

