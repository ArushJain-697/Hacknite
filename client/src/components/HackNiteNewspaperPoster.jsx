import React from "react";

/**
 * Figma: node 128:657 — "Component 1" (newspaper / dossier layout, 750×982).
 * Typography and layout match the file; pass `paperImageSrc` / `portraitSrc` for exported fills.
 */

function QuoteLeft({ className }) {
  return (
    <svg
      className={className}
      width={25}
      height={38}
      viewBox="0 0 24.5 38"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 0h24.5M9 10v28M17 10v28M8 37.5h9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      />
    </svg>
  );
}

function QuoteRight({ className }) {
  return (
    <svg
      className={className}
      width={25}
      height={38}
      viewBox="0 0 24.5 38"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 28h24.5M7.5 0v28M15.5 0v28M7.5.5h9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function HackNiteNewspaperPoster({
  className = "",
  paperImageSrc,
  portraitSrc,
  volumeLabel = "Vol1 , 13",
  pageLabel = "Page : 1",
  headlineTop = "Recently attended a criminal con event",
  headlineBottom = "I recently killed a famous politician",
  bodyColumn = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius augue eu dolor egestas, nec hendrerit augue varius. Duis ultrices iaculis nunc nec tempor. Nunc mollis ex non enim gravida lobortis. Praesent ligula justo, egestas tempor leo nec, sodales pellentesque elit. Suspendisse hendrerit enim quis orci euismod, sed aliquet nibh euismod. Suspendisse interdum risus ac aliquam scelerisque. In sit amet quam a eros pretium ultrices.`,
  bodyFullWidth = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius augue eu dolor egestas, nec hendrerit augue varius. Duis ultrices iaculis nunc nec tempor. Nunc mollis ex non enim gravida lobortis. Praesent ligula justo, egestas tempor leo nec, sodales pellentesque elit. Suspendisse hendrerit enim quis orci euismod, sed aliquet nibh euismod. Suspendisse interdum risus ac aliquam scelerisque. In sit amet quam a eros pretium ultrices.`,
  usernameTop = "Username",
  usernameBottom = "Username",
  bountyLabel = "Bounty reward",
  bountyAmount = "$3000",
}) {
  return (
    <article
      className={`relative isolate box-border h-[982px] w-[750px] max-w-none shrink-0 overflow-hidden bg-white text-black ${className}`}
      aria-label="Newspaper poster"
    >
      {paperImageSrc ? (
        <img
          src={paperImageSrc}
          alt=""
          className="pointer-events-none absolute left-0 top-0 h-[982px] w-[751px] max-w-none select-none object-fill"
          width={751}
          height={982}
          draggable={false}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-[#f2ede3]"
          aria-hidden
        />
      )}

      {/* Frame 9 instance — top rules on the plate */}
      <div
        className="pointer-events-none absolute left-5 top-[15px] h-[5px] w-[716px] bg-black"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-5 top-[23px] h-px w-[716px] bg-black"
        aria-hidden
      />

      {/* Group 22 — editorial overlay */}
      <div className="absolute left-5 top-[35px] h-[870px] w-[728px]">
        <div
          className="absolute left-px top-[27px] h-[5px] w-[716px] bg-black"
          aria-hidden
        />
        <div
          className="absolute left-px top-[35px] h-px w-[716px] bg-black"
          aria-hidden
        />

        <p
          className="absolute left-2.5 top-px m-0 w-24 p-0 font-['Arapey'] text-2xl leading-[1.096em] text-black"
          style={{ width: 96, height: 39 }}
        >
          {volumeLabel}
        </p>
        <p
          className="absolute top-px m-0 p-0 font-['Arapey'] text-2xl leading-[1.096em] text-black"
          style={{ left: 624, width: 96, height: 39 }}
        >
          {pageLabel}
        </p>

        <h2
          className="absolute left-2 top-[52px] m-0 max-w-none p-0 font-['IM_Fell_Double_Pica_SC'] text-[40px] font-normal leading-[1.2534] text-black"
          style={{ width: 719, height: 50 }}
        >
          {headlineTop}
        </h2>

        {/* Line 37 — left spine */}
        <div
          className="absolute left-0 top-[102.5px] h-[405px] w-px bg-[#040404]"
          aria-hidden
        />
        {/* Line 41 */}
        <div
          className="absolute left-0 top-[96px] h-[3.75px] w-[716.49px] bg-[#040404]"
          aria-hidden
        />
        {/* Line 40 — column rule */}
        <div
          className="absolute left-[313px] top-[98px] h-[337px] w-px bg-[#040404]"
          aria-hidden
        />

        {portraitSrc ? (
          <img
            src={portraitSrc}
            alt=""
            className="absolute left-2.5 top-[114px] box-border h-[295px] w-[295px] border border-black object-cover select-none"
            width={295}
            height={295}
            draggable={false}
          />
        ) : (
          <div
            className="absolute left-2.5 top-[114px] box-border flex h-[295px] w-[295px] items-center justify-center border border-black bg-neutral-200/80 text-sm text-neutral-600"
            aria-hidden
          >
            Portrait
          </div>
        )}

        <p
          className="absolute left-[320px] top-[104px] m-0 max-w-none whitespace-pre-wrap p-0 font-['Fahkwang'] text-[20px] font-normal leading-[1.35] text-black"
          style={{ width: 376, height: 289 }}
        >
          {bodyColumn}
        </p>

        {/* Line 42 */}
        <div
          className="absolute left-0 top-[435px] h-px w-[313px] bg-black"
          aria-hidden
        />

        {/* Username + rule — Group 14 */}
        <div
          className="absolute text-[#010202]"
          style={{ left: 463, top: 460, width: 257, height: 27 }}
        >
          <div
            className="absolute left-0 top-5 h-1 w-[39px] bg-[#130802]"
            aria-hidden
          />
          <p
            className="absolute m-0 p-0 font-['Hermeneus_One'] text-[42px] font-normal leading-[0.643em]"
            style={{ left: 55, top: 0, width: 202, height: 27 }}
          >
            {usernameTop}
          </p>
        </div>

        <p
          className="absolute left-[11px] top-[468px] m-0 p-0 font-['Koulen'] text-[25px] font-normal leading-[1.08] text-[#050200]"
          style={{ width: 149, height: 30 }}
        >
          {bountyLabel}
        </p>

        <div
          className="absolute box-border border-2 border-black bg-transparent"
          style={{ left: 164, top: 462, width: 125, height: 37 }}
        >
          <p
            className="absolute m-0 p-0 font-['Fredericka_the_Great'] text-[25px] font-normal leading-[1.08] text-black"
            style={{ left: 6, top: 5, width: 76, height: 26 }}
          >
            {bountyAmount}
          </p>
        </div>

        <div
          className="pointer-events-none absolute text-black"
          style={{ left: 300, top: 461 }}
        >
          <QuoteLeft />
        </div>
        <div
          className="pointer-events-none absolute text-black"
          style={{ left: 335.5, top: 461 }}
        >
          <QuoteRight />
        </div>

        {/* Lower masthead / section break */}
        <div
          className="absolute left-0 top-[507px] h-px w-[712px] bg-[#040404]"
          aria-hidden
        />

        <h2
          className="absolute left-2 top-[512px] m-0 max-w-none p-0 font-['IM_Fell_Double_Pica_SC'] text-[40px] font-normal leading-[1.2534] text-black"
          style={{ width: 719, height: 50 }}
        >
          {headlineBottom}
        </h2>

        <div
          className="absolute left-[2.98px] top-[560.38px] h-px w-[709.03px] bg-[#040404]"
          aria-hidden
        />

        <div
          className="absolute left-[1.5px] top-[510px] h-[354.5px] w-px bg-[#040404]"
          aria-hidden
        />

        <p
          className="absolute left-[13px] top-[581px] m-0 max-w-none whitespace-pre-wrap p-0 font-['Fahkwang'] text-[20px] font-normal leading-[1.35] text-black"
          style={{ width: 701, height: 289 }}
        >
          {bodyFullWidth}
        </p>

        {/* Group 18 */}
        <div
          className="absolute text-[#010202]"
          style={{ left: 463, top: 800, width: 257, height: 27 }}
        >
          <div
            className="absolute left-0 top-5 h-1 w-[39px] bg-[#130802]"
            aria-hidden
          />
          <p
            className="absolute m-0 p-0 font-['Hermeneus_One'] text-[42px] font-normal leading-[0.643em]"
            style={{ left: 55, top: 0, width: 202, height: 27 }}
          >
            {usernameBottom}
          </p>
        </div>

        <p
          className="absolute left-[11px] top-[798px] m-0 p-0 font-['Koulen'] text-[25px] font-normal leading-[1.08] text-[#050200]"
          style={{ width: 149, height: 30 }}
        >
          {bountyLabel}
        </p>

        <div
          className="absolute box-border border-2 border-black bg-transparent"
          style={{ left: 164, top: 791, width: 125, height: 37 }}
        >
          <p
            className="absolute m-0 p-0 font-['Fredericka_the_Great'] text-[25px] font-normal leading-[1.08] text-black"
            style={{ left: 6, top: 5, width: 76, height: 26 }}
          >
            {bountyAmount}
          </p>
        </div>

        <div
          className="pointer-events-none absolute text-black"
          style={{ left: 300, top: 790 }}
        >
          <QuoteLeft />
        </div>
        <div
          className="pointer-events-none absolute text-black"
          style={{ left: 335.5, top: 790 }}
        >
          <QuoteRight />
        </div>

        <div
          className="absolute left-[3px] top-[864.5px] h-px w-[711px] bg-[#040404]"
          aria-hidden
        />
      </div>
    </article>
  );
}
