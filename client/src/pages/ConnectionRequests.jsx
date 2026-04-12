import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CinematicPage from "../components/CinematicPage";

const API = "https://api.sicari.works";

export default function ConnectionRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}/api/connections/pending`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      })
      .catch(() => setError("Could not load requests."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** PATCH /api/connections/:id/accept | /api/connections/:id/decline */
  const patchStatus = async (connectionId, action) => {
    if (action !== "accept" && action !== "decline") return;
    setActingId(connectionId);
    try {
      const res = await fetch(
        `${API}/api/connections/${connectionId}/${action}`,
        { method: "PATCH", credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Action failed.");
      load();
    } catch (e) {
      alert(e.message || "Something went wrong.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <CinematicPage>
      <div className="min-h-screen bg-[#1a1814] text-[#f0e8d0] font-[Arapey] p-6 md:p-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl tracking-wide">
              Connection requests
            </h1>
            <button
              type="button"
              className="bg-stone-900 px-4 py-2 border-2 border-amber-700/80 hover:bg-stone-800"
              onClick={() => navigate("/find_connections")}
            >
              ← Directory
            </button>
          </div>
          <p className="text-stone-400 text-lg">
            Incoming requests from other users. Accept or decline each one.
          </p>

          {loading && <p className="text-xl">Loading…</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && requests.length === 0 && (
            <p className="text-xl text-stone-500 italic">No pending requests.</p>
          )}

          <ul className="flex flex-col gap-4">
            {requests.map((r) => (
              <li
                key={r.connection_id}
                className="flex flex-wrap items-center justify-between gap-4 border border-stone-600/80 bg-stone-900/40 p-4"
              >
                <div>
                  <div className="text-xl font-semibold">
                    {r.name?.trim() || r.username}
                  </div>
                  <div className="text-stone-400">@{r.username}</div>
                  {r.role && (
                    <div className="text-sm uppercase tracking-wide text-stone-500 mt-1">
                      {r.role}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actingId === r.connection_id}
                    className="bg-emerald-900/90 px-4 py-2 border-2 border-emerald-600 hover:bg-emerald-800 disabled:opacity-50"
                    onClick={() => patchStatus(r.connection_id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={actingId === r.connection_id}
                    className="bg-red-900/80 px-4 py-2 border-2 border-red-500 hover:bg-red-800 disabled:opacity-50"
                    onClick={() => patchStatus(r.connection_id, "decline")}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CinematicPage>
  );
}
