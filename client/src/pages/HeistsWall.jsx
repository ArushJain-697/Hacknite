import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import { useNavigate } from "react-router-dom";

import HackNiteCard from "../components/HackNiteCard";
import ApprovalInterface from "../components/ApprovalInterface";
import CinematicPage from "../components/CinematicPage";
import "../styles/HeistsWall.css";

const linearTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.35,
};

const HorizontalGallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [heists, setHeists] = useState([]);
  const [role, setRole] = useState("sicario");
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);
  const [showApprovalInterface, setShowApprovalInterface] = useState(false);
  const [selectedHeistForApplicants, setSelectedHeistForApplicants] =
    useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((authData) => {
        const userRole = String(authData?.user?.role || "sicario").toLowerCase();
        setRole(userRole);

        const url =
          userRole === "fixer"
            ? "https://api.sicari.works/api/fixer/heists"
            : "https://api.sicari.works/api/sicario/heists";

        return fetch(url, { credentials: "include" });
      })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.heists || data.data || [];
        setHeists(arr);
      })
      .catch((err) => console.error("Error fetching heists data:", err));
  }, []);

  const fetchApplicantsForHeist = useCallback(async (heist) => {
    if (!heist) return;
    const hid = heist.id ?? heist.heist_id;
    if (hid == null) {
      setApplicantsError("Invalid heist id.");
      return;
    }

    setSelectedHeistForApplicants(heist);
    setApplicants([]);
    setApplicantsError(null);
    setApplicantsLoading(true);
    setShowApprovalInterface(true);

    try {
      const res = await fetch(
        `https://api.sicari.works/api/fixer/heist/${hid}/applicants`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Could not load applicants.");
      }
      const list = Array.isArray(data.applicants) ? data.applicants : [];
      const pendingOnly = list.filter((a) => a.status === "pending");
      const mapped = pendingOnly.map((a) => ({
        ...a,
        id: a.application_id,
        role: a.title || "Sicario",
        skill: a.fit_score ?? "N/A",
        successRate: a.fit_score ?? 0,
        wantedBy: Array.isArray(a.skills) ? a.skills : [],
        bio: a.bio || "",
      }));
      setApplicants(mapped);
    } catch (e) {
      setApplicantsError(e.message || "Could not load applicants.");
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  const handleApplicantDecision = useCallback(async (applicationId, status) => {
    const res = await fetch(
      `https://api.sicari.works/api/fixer/application/${applicationId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Failed to update application.");
    }
    setApplicants((prev) =>
      prev.filter((a) => a.application_id !== applicationId),
    );
  }, []);

  // const infiniteHeists =
  // heists.length > 0 ? [...heists, ...heists, ...heists] : [];
  const infiniteHeists = heists;

  return (
    <CinematicPage>
      {/* ✅ FIXED "MY HEISTS" BUTTON */}
      <button
        onClick={() => navigate("/my_heists")}
        className="fixed top-6 right-6 z-[100] bg-[#2c1303] text-[#f0e8d0] font-['Bungee'] py-[0.6rem] px-[1.8rem] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-transform"
        style={{
          fontSize: 16,
          border: "2px solid black",
          letterSpacing: "1px",
        }}
      >
        My Heists
      </button>

      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#050505] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundColor: "#050505" }}
        />

        <Swiper
          modules={[FreeMode, Mousewheel]}
          direction="horizontal" // 👈 important
          mousewheel={{
            enabled: true,
            forceToAxis: false, // 👈 allow vertical wheel to control horizontal
            sensitivity: 0.8,
            releaseOnEdges: false,
          }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 1.2,
            momentumVelocityRatio: 1.1,
          }}
          slidesPerView="auto"
          spaceBetween={120}
          centeredSlides={true}
          grabCursor={true}
          loop={false}
          resistance={true}
          resistanceRatio={0.5}
          className="w-full h-full z-10"
        >
          {infiniteHeists.map((item, index) => {
            const realIndex = index % heists.length; // original index

            const title =
              item?.section_a?.operation_name || `Heist ${realIndex + 1}`;

            const hashtags =
              item?.section_e?.crew_members?.map(
                (member) => `# ${member.job} ${member.money_share}`,
              ) || [];

            return (
              <SwiperSlide
                key={`${item.id}-${index}`} // ✅ VERY IMPORTANT (unique key)
                className="!w-auto h-full !flex justify-center items-center px-[5vw]"
                // slidesPerView="auto"
                // spaceBetween={120} // 👈 add this
              >
                <div
                  className="relative w-fit flex-shrink-0 cursor-pointer group transform-gpu will-change-transform"
                  onClick={() =>
                    setSelectedItem({
                      raw: item, // original API data
                      uniqueIndex: index,
                      _title: title,
                      _hashtags: hashtags,
                      description: item.quote || item.short_description || "",
                    })
                  }
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] pointer-events-none z-0"
                    style={{
                      backgroundImage: "url('/assets/StoneTexture.png')",
                      backgroundSize: "30rem",
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 35vw 45vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",
                      maskImage:
                        "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 35vw 45vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",
                      WebkitMaskComposite: "source-in, source-over",
                      maskComposite: "intersect, add",
                    }}
                  />

                  <div className="relative z-0 opacity-0 pointer-events-none">
                    <HackNiteCard title={title} hashtagLines={hashtags} />
                  </div>

                  <motion.div
                    layoutId={`card-${index}`}
                    className="absolute inset-0 z-10 transition-transform duration-300 group-hover:scale-105"
                    transition={linearTransition}
                  >
                    <HackNiteCard title={title} hashtagLines={hashtags} />
                  </motion.div>

                  <div
                    className={`absolute inset-0 z-20 pointer-events-none transition-all duration-300 group-hover:scale-105 rounded-[inherit] ${
                      selectedItem?.uniqueIndex === index
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                    style={{
                      background:
                        "radial-gradient(120% 120% at 50% -10%, transparent 30%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.95) 100%)",
                    }}
                  />
                </div>
              </SwiperSlide>
            );
          })}
          {role === "fixer" && (
            <SwiperSlide
              key="add-heist-slide"
              className="!w-auto h-full !flex justify-center items-center px-[5vw]"
            >
              <button
                type="button"
                onClick={() => navigate("/add_heist")}
                className="relative flex h-[507px] w-[381px] flex-shrink-0 cursor-pointer flex-col items-center justify-center border-2 border-black bg-[#2c1303] text-[#f0e8d0] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0e8d0]"
                style={{ fontFamily: "Bungee, system-ui, sans-serif" }}
                aria-label="Add new heist"
              >
                <span
                  className="leading-none"
                  style={{ fontSize: 120, lineHeight: 1 }}
                >
                  +
                </span>
                <span
                  className="mt-4 px-4 text-center"
                  style={{ fontSize: 14, letterSpacing: "0.06em" }}
                >
                  NEW HEIST
                </span>
              </button>
            </SwiperSlide>
          )}
        </Swiper>

        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={linearTransition}
              className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center bg-black/95 px-4 py-8"
              onClick={() => setSelectedItem(null)}
            >
              <div
                className="flex max-h-[100dvh] w-full max-w-[min(100%,420px)] flex-col items-center gap-8 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  layoutId={`card-${selectedItem.uniqueIndex}`}
                  transition={linearTransition}
                  className="cursor-default shadow-[0_0_5rem_rgba(0,0,0,1)]"
                >
                  <div className="heist-wall-modal-card">
                    <HackNiteCard
                      title={selectedItem._title}
                      hashtagLines={selectedItem._hashtags}
                    />
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={linearTransition}
                  onClick={(e) => {
                    e.stopPropagation();
                    const hid = selectedItem?.raw?.id;
                    if (hid == null) return;
                    if (role === "fixer") {
                      fetchApplicantsForHeist(selectedItem.raw);
                      setSelectedItem(null);
                    } else {
                      navigate(`/heist/${hid}`, {
                        state: { heist: selectedItem.raw },
                      });
                    }
                  }}
                  className="shrink-0 bg-[#2c1303] text-[#f0e8d0] font-['Bungee'] py-[0.75rem] px-[2.5rem] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-transform"
                  style={{
                    fontSize: 20,
                    border: "2px solid black",
                    letterSpacing: "1px",
                  }}
                >
                  {role === "fixer" ? "SEE APPLICANTS" : "VIEW"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showApprovalInterface && role === "fixer" && (
          <div className="fixed inset-0 z-[300] bg-black/85 p-4 overflow-y-auto">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
              <div className="flex w-full max-w-4xl items-center justify-between rounded bg-[#1d1a16] px-4 py-3 border border-stone-700">
                <div>
                  <p className="text-lg font-semibold">
                    {selectedHeistForApplicants?.section_a?.operation_name ||
                      "Heist applicants"}
                  </p>
                  <p className="text-sm text-stone-400">
                    Review and accept or reject applicants
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-stone-900 px-4 py-2 border border-stone-500 hover:bg-stone-800"
                  onClick={() => setShowApprovalInterface(false)}
                >
                  Close
                </button>
              </div>

              {applicantsLoading && (
                <div className="text-stone-300">Loading applicants...</div>
              )}
              {applicantsError && (
                <div className="text-red-300">{applicantsError}</div>
              )}
              {!applicantsLoading && !applicantsError && applicants.length === 0 && (
                <div className="text-stone-400">No pending applicants.</div>
              )}
              {!applicantsLoading && !applicantsError && applicants.length > 0 && (
                <ApprovalInterface
                  initialProfiles={applicants}
                  onDecision={handleApplicantDecision}
                  onClose={() => setShowApprovalInterface(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </CinematicPage>
  );
};

export default HorizontalGallery;
