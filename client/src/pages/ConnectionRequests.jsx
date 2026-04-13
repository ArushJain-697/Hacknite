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
  const [openRequestId, setOpenRequestId] = useState(null);

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
      <div className="min-h-screen overflow-y-auto bg-[#1a1814] text-[#f0e8d0] font-[Arapey] p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
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

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((r) => (
              <li
                key={r.connection_id}
                className=" bg-stone-900/40 p-2 md:p-3"
              >
                <button
                  type="button"
                  className="group relative mx-auto block w-full max-w-[250px] transition-transform hover:scale-[1.02] focus:outline-none"
                  onClick={() =>
                    setOpenRequestId((current) =>
                      current === r.connection_id ? null : r.connection_id,
                    )
                  }
                  aria-expanded={openRequestId === r.connection_id}
                >
                  <img
                    src={
                      openRequestId === r.connection_id
                        ? "/assets/envelopeOpen.png"
                        : "/assets/envelopeClosed.png"
                    }
                    alt={
                      openRequestId === r.connection_id
                        ? `Opened envelope from ${r.username}`
                        : `Envelope from ${r.username}`
                    }
                    className="w-full select-none outline-none"
                  />
                  {openRequestId !== r.connection_id && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
                      <p className="text-lg md:text-xl font-semibold text-red-800 drop-shadow-sm">
                        {r.name?.trim() || r.username}
                      </p>
                    </div>
                  )}
                </button>

                {openRequestId === r.connection_id && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-amber-200/20 pt-4">
                    <div>
                      <div className="text-xl font-semibold">
                        {r.name?.trim() || r.username}
                      </div>
                      <div className="text-stone-400">@{r.username}</div>
                      {r.role && (
                        <div className="mt-1 text-sm uppercase tracking-wide text-stone-500">
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
                  </div>
                )}
                {actingId === r.connection_id && (
                  <p className="mt-2 text-sm text-stone-400">Processing…</p>
                )}
                {openRequestId !== r.connection_id && (
                  <div className="mt-3 text-center text-xs uppercase tracking-wide text-stone-400">
                    Click envelope to open
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CinematicPage>
  );
}
