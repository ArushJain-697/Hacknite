import "../styles/Newspaper.css";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion, AnimatePresence } from "framer-motion";
import CinematicPage from "../components/CinematicPage";
import { useNavigate } from "react-router-dom";
import WantedProfileFrame from "../components/WantedProfileFrame";
import newsPaperBG from "../../public/assets/Newspaper.png";

const API = "https://api.sicari.works";

/** WantedProfileFrame intrinsic layout size (matches component). */
const PROFILE_W = 736;
const PROFILE_H = 952;

const PAGE_HEIGHT_VH = 90;
const PAGE_ASPECT_RATIO = 0.75;
/** Header row inside each directory page (px). */
const PAGE_HEADER_RESERVE = 88;
/** Approximate minimum row height for pagination math (px). */
const ROW_HEIGHT_ESTIMATE = 46;

const DirectoryPage = React.forwardRef(({ users = [], pageNum = 1 }, ref) => (
  <div
    className="demoPage bg-contain select-none z-3 overflow-hidden"
    ref={ref}
  >
    <div className="w-full h-full min-h-0 flex flex-col p-3 sm:p-4 bg-[#f0e8d0]">
      <div className="flex shrink-0 justify-between items-baseline border-b-2 border-black pb-2 mb-2 font-[Arapey]">
        <span className="text-base sm:text-lg tracking-wide">Vol. 1</span>
        <span className="text-xl sm:text-2xl font-bold tracking-tight">
          NETWORK DIRECTORY
        </span>
        <span className="text-base sm:text-lg">Page {pageNum}</span>
      </div>
      <ul className="flex flex-1 flex-col min-h-0 overflow-hidden list-none m-0 p-0">
        {users.length === 0 ? (
          <li className="flex flex-1 items-center justify-center text-stone-600 italic text-lg sm:text-xl text-center px-2">
            No users in the directory yet.
          </li>
        ) : (
          users.map((u) => (
            <li
              key={u.id}
              className="flex flex-1 min-h-0 flex-col justify-center border-b border-stone-400/70 py-1 sm:py-2"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-semibold text-stone-900 min-w-0 truncate text-lg sm:text-xl">
                  {u.name?.trim() || u.username}
                </span>
                <button
                  type="button"
                  className="text-left underline decoration-stone-600 underline-offset-2 hover:text-amber-900 hover:decoration-amber-800 cursor-pointer bg-transparent border-0 p-0 font-[Arapey] text-lg sm:text-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    u.onSelect?.(u.username);
                  }}
                >
                  @{u.username}
                </button>
                {u.role && (
                  <span className="text-stone-600 text-sm sm:text-base uppercase tracking-wide">
                    ({u.role})
                  </span>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  </div>
));
DirectoryPage.displayName = "DirectoryPage";

function chunkUsers(users, perPage) {
  const chunks = [];
  for (let i = 0; i < users.length; i += perPage) {
    chunks.push(users.slice(i, i + perPage));
  }
  return chunks;
}

function normalizeProfileForFrame(apiProfile) {
  if (!apiProfile) return null;
  return {
    ...apiProfile,
    connections_count:
      apiProfile.connection_count ?? apiProfile.connections_count ?? 0,
  };
}

/** `transform: scale()` does not shrink layout; outer box is the scaled size so buttons stay visible below. */
function ScaledWantedFrame({ profile, scale }) {
  const w = PROFILE_W * scale;
  const h = PROFILE_H * scale;
  return (
    <div
      className="shrink-0 overflow-hidden mx-auto"
      style={{ width: w, height: h }}
    >
      <div
        style={{
          width: PROFILE_W,
          height: PROFILE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <WantedProfileFrame
          profile={profile}
          className="relative shadow-2xl"
        />
      </div>
    </div>
  );
}

const modalScrollHide =
  "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0";

export default function FindConnections() {
  const navigate = useNavigate();
  const bookRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: window.innerHeight * (PAGE_HEIGHT_VH / 100) * PAGE_ASPECT_RATIO,
    height: window.innerHeight * (PAGE_HEIGHT_VH / 100),
  });

  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  const [showProfile, setShowProfile] = useState(false);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [requestSending, setRequestSending] = useState(false);
  const [profileScale, setProfileScale] = useState(0.45);

  const usersPerPage = useMemo(() => {
    const innerH = Math.max(0, dimensions.height - PAGE_HEADER_RESERVE);
    return Math.max(1, Math.floor(innerH / ROW_HEIGHT_ESTIMATE));
  }, [dimensions.height]);

  const openProfile = useCallback(async (username) => {
    if (!username) return;
    setShowProfile(true);
    setProfileLoading(true);
    setProfileError(null);
    setProfileDetail(null);
    try {
      const res = await fetch(
        `${API}/api/profile/${encodeURIComponent(username)}`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Could not load profile.");
      }
      const raw = data.profile || data;
      setProfileDetail(normalizeProfileForFrame(raw));
    } catch (e) {
      setProfileError(e.message || "Could not load profile.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const sendConnectionRequest = useCallback(async () => {
    const id = profileDetail?.id;
    if (id == null) return;
    setRequestSending(true);
    try {
      const res = await fetch(`${API}/api/connections/request/${id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Could not send request.");
      }
      setProfileDetail((prev) =>
        prev ? { ...prev, connection_status: "sent" } : prev,
      );
      alert(data.message || "Connection request sent.");
    } catch (e) {
      alert(e.message || "Could not send request.");
    } finally {
      setRequestSending(false);
    }
  }, [profileDetail?.id]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerHeight * (PAGE_HEIGHT_VH / 100) * PAGE_ASPECT_RATIO,
        height: window.innerHeight * (PAGE_HEIGHT_VH / 100),
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showProfile) return undefined;
    const fit = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const reserveButtons = 132;
      const verticalPad = 56;
      const maxH = Math.max(160, vh - reserveButtons - verticalPad);
      const maxW = Math.max(200, vw - 32);
      const s = Math.min(maxW / PROFILE_W, maxH / PROFILE_H, 0.72);
      setProfileScale(Math.min(0.72, Math.max(0.26, s)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [showProfile]);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    setLoadError(null);
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : data.users || data.profiles || data.data || [];
        const sorted = [...list].sort((a, b) =>
          String(a.username || "").localeCompare(
            String(b.username || ""),
            undefined,
            { sensitivity: "base" },
          ),
        );
        setUsers(sorted);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load directory.");
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const userChunks = useMemo(
    () => chunkUsers(users, usersPerPage),
    [users, usersPerPage],
  );

  const chunksWithHandlers = useMemo(
    () =>
      userChunks.map((chunk) =>
        chunk.map((u) => ({ ...u, onSelect: openProfile })),
      ),
    [userChunks, openProfile],
  );

  const displayChunks =
    chunksWithHandlers.length > 0 ? chunksWithHandlers : [[]];

  const pagesArray = useMemo(() => {
    const dirs = displayChunks.map((chunk, idx) => (
      <DirectoryPage
        key={`dir-${idx}-${usersPerPage}`}
        users={chunk}
        pageNum={idx + 1}
      />
    ));
    if (displayChunks.length % 2 !== 0) {
      dirs.push(
        <div
          key="pad"
          className="demoPage bg-cover bg-center"
          style={{ backgroundImage: `url(${newsPaperBG})` }}
        />,
      );
    }
    return dirs;
  }, [displayChunks, usersPerPage]);

  const connStatus = profileDetail?.connection_status;
  const canShowSendRequest =
    profileDetail &&
    (connStatus == null ||
      connStatus === "none" ||
      connStatus === "declined");

  const connectionStatusLabel =
    connStatus === "connected"
      ? "Already connected"
      : connStatus === "sent"
        ? "Request pending"
        : connStatus === "received"
          ? "This user sent you a request (check Connection requests)"
          : null;

  return (
    <CinematicPage>
      <div className="bgTable bg-[url('/assets/table.png')] fixed inset-0 flex justify-center items-center bg-cover overflow-hidden">
        <div
          className="fixed top-4 left-4 z-40 pointer-events-auto flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="font-[Arapey] text-[#f0e8d0] bg-stone-900/90 px-4 py-2 border-2 border-amber-700/80 hover:bg-stone-800 text-left"
            onClick={() => navigate("/feed")}
          >
            ← Back to paper
          </button>
        </div>

        <div
          className="fixed top-4 right-4 z-40 pointer-events-auto flex flex-col sm:flex-row gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="font-[Arapey] text-[#f0e8d0] bg-stone-900/90 px-4 py-2 border-2 border-amber-700/80 hover:bg-stone-800 whitespace-nowrap"
            onClick={() => navigate("/connections")}
          >
            My connections
          </button>
          <button
            type="button"
            className="font-[Arapey] text-[#f0e8d0] bg-stone-900/90 px-4 py-2 border-2 border-amber-700/80 hover:bg-stone-800 whitespace-nowrap"
            onClick={() => navigate("/connection_requests")}
          >
            Connection requests
          </button>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-30 opacity-100 scale-100 blur-0"
        >
          {loadingList ? (
            <div className="text-[#f0e8d0] font-[Arapey] text-xl p-8">
              Loading directory…
            </div>
          ) : loadError ? (
            <div className="text-red-300 font-[Arapey] text-xl p-8 max-w-md text-center">
              {loadError}
            </div>
          ) : (
            <HTMLFlipBook
              key={`find-conn-${users.length}-${usersPerPage}`}
              width={dimensions.width}
              height={dimensions.height}
              showCover={false}
              usePortrait={false}
              ref={bookRef}
              className="shadow-2xl bg-white"
              startZIndex={30}
              maxShadowOpacity={0.3}
              disableFlipByClick={false}
              image={newsPaperBG}
            >
              {pagesArray}
            </HTMLFlipBook>
          )}
        </div>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              key="profile-modal"
              className={`find-connections-profile-modal fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-4 ${modalScrollHide} max-h-[100dvh]`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => {
                  setShowProfile(false);
                  setProfileDetail(null);
                  setProfileError(null);
                }}
              />
              <motion.div
                className={`find-connections-profile-modal relative z-10 my-auto flex w-full max-w-[min(100%,736px)] flex-col items-stretch gap-3 pointer-events-auto ${modalScrollHide} max-h-[min(100dvh,920px)]`}
                initial={{ opacity: 0, scale: 0.88, y: 32 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {profileLoading && (
                  <div className="bg-[#fff4e0] border-4 border-stone-900 px-12 py-16 font-[Arapey] text-2xl text-stone-900 shadow-2xl text-center">
                    Loading dossier…
                  </div>
                )}
                {!profileLoading && profileError && (
                  <div className="bg-[#fff4e0] border-4 border-red-900 px-8 py-10 font-[Arapey] text-xl text-red-900 max-w-md shadow-2xl mx-auto">
                    {profileError}
                    <button
                      type="button"
                      className="block mt-6 font-bold underline"
                      onClick={() => setShowProfile(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
                {!profileLoading && !profileError && profileDetail && (
                  <>
                    <ScaledWantedFrame
                      profile={profileDetail}
                      scale={profileScale}
                    />
                    <div className="flex shrink-0 flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-1">
                      {canShowSendRequest && (
                        <button
                          type="button"
                          disabled={requestSending}
                          className="font-[Arapey] text-[#f0e8d0] bg-stone-900 px-6 py-3 border-4 border-amber-600 hover:bg-stone-800 disabled:opacity-60"
                          onClick={sendConnectionRequest}
                        >
                          {requestSending
                            ? "Sending…"
                            : "Send connection request"}
                        </button>
                      )}
                      {connectionStatusLabel && !canShowSendRequest && (
                        <span className="font-[Arapey] text-[#f0e8d0] bg-stone-800/90 px-4 py-2 border border-stone-600 text-center">
                          {connectionStatusLabel}
                        </span>
                      )}
                      <button
                        type="button"
                        className="font-[Arapey] text-[#f0e8d0] bg-stone-900 px-6 py-3 border-4 border-stone-600 hover:bg-stone-800"
                        onClick={() => {
                          setShowProfile(false);
                          setProfileDetail(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CinematicPage>
  );
}
