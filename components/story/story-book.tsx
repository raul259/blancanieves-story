"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import { storyScenes } from "./story-data";

// ---------------------------------------------------------------------------
// Types & section configuration
// ---------------------------------------------------------------------------

type Media = { type: "video"; src: string } | { type: "image"; src: string };

type SectionConfig = {
  key: string;
  sceneId: number | null; // 1-10, null = intro
  primary: Media;
  secondary?: Media; // si existe → horizontal scroll dentro de la sección
};

const SECTIONS: SectionConfig[] = [
  // 0 – Intro
  {
    key: "intro",
    sceneId: null,
    primary: { type: "video", src: "/blancanievesprincipal.mp4" },
  },

  // 1 – Escena 1
  {
    key: "s1",
    sceneId: 1,
    primary: { type: "video", src: "/saludoblancanieves.mp4" },
    secondary: { type: "image", src: "/blancanieves%20en%20su%20reino.jpg" },
  },

  // 2 – Escena 2
  {
    key: "s2",
    sceneId: 2,
    primary: { type: "video", src: "/reina frente espejo.mp4" },
    secondary: { type: "video", src: "/reina frente al espejo.mp4" },
  },

  // 3 – Escena 3 (sin secundario)
  {
    key: "s3",
    sceneId: 3,
    primary: { type: "image", src: "/espejo.jpg" },
  },

  // 4 – Escena 4
  {
    key: "s4",
    sceneId: 4,
    primary: { type: "image", src: "/reina expulsa a Blancanieves.jpg" },
    secondary: { type: "image", src: "/cazador se lleva a blancanieves.jpg" },
  },

  // 5 – Escena 5
  {
    key: "s5",
    sceneId: 5,
    primary: { type: "image", src: "/cazador%20piadoso.jpg" },
    secondary: { type: "image", src: "/blancanieves corriendo.jpg" },
  },

  // 6 – Escena 6 (sin secundario)
  {
    key: "s6",
    sceneId: 6,
    primary: { type: "image", src: "/blancanieves%20caba%C3%B1a.jpg" },
  },

  // 7 – Escena 7
  {
    key: "s7",
    sceneId: 7,
    primary: { type: "image", src: "/blancanieves%20durmiendo.jpg" },
    secondary: { type: "image", src: "/blancanieves%20durmiendo.jpg" },
  },

  // 8 – Escena 8
  {
    key: "s8",
    sceneId: 8,
    primary: { type: "image", src: "/blancanieves%20recibiendo%20la%20manzana.jpg" },
    secondary: { type: "image", src: "/blancanieves desmayandose.jpg" },
  },

  // 9 – Escena 9
  {
    key: "s9",
    sceneId: 9,
    primary: { type: "image", src: "/blancanievees dentro ataúd.jpg" },
    secondary: { type: "image", src: "/beso a blancanieves.jpg" },
  },

  // 10 – Escena 10
  {
    key: "s10",
    sceneId: 10,
    primary: { type: "image", src: "/blancanieves carruaje.jpg" },
    secondary: { type: "video", src: "/depedida.mp4" },
  },
];

const TOTAL = SECTIONS.length; // 11

const narrationBySceneId: Record<number, string> = {
  1: "/Narrador/en%20un%20reino.mp3",
  2: "/Narrador/lareina%20preguntaba.mp3",
  3: "/Narrador/un%20dia%20el%20espejo%20dijo.mp3",
  4: "/Narrador/la%20reina%20se%20lleno%20de%20ira.mp3",
  5: "/Narrador/El%20cazador%20se%20apiad%C3%B3.mp3",
  6: "/Narrador/alanochecer%20encontr%C3%B3.mp3",
  7: "/Narrador/los%20enanitos%20cuando%20regresaron.mp3",
  8: "/Narrador/pero%20un%20dia%20la%20reina.mp3",
  9: "/Narrador/Cuando%20la%20encontraron.mp3",
  10: "/Narrador/blancanieves%20regreso%20para%20gobernar.mp3",
};

// ---------------------------------------------------------------------------
// SceneOverlay — texto animado en la parte inferior de cada escena
// ---------------------------------------------------------------------------

function WordSpans({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block" data-word>
          {word}
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

function SceneOverlay({ scene }: { scene: (typeof storyScenes)[number] }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 pt-32 bg-linear-to-t from-black/90 via-black/55 to-transparent">
      <p
        data-anim-label
        className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-400"
      >
        Escena {scene.id}
      </p>

      <h2
        data-anim-title
        className="mb-4 text-2xl font-black leading-tight text-white drop-shadow md:text-4xl"
      >
        {scene.title}
      </h2>

      <p
        className="mb-5 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base"
        data-anim-narration
      >
        <WordSpans text={scene.narration} />
      </p>

      <div data-anim-dialogue-border className="border-l-2 border-rose-400 pl-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-rose-300">
          {scene.speaker}
        </p>
        <p className="text-sm italic text-white/80 md:text-base" data-anim-dialogue>
          <WordSpans text={scene.dialogue} />
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryBook() {
  const mainRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const introNarrationRef = useRef<HTMLAudioElement | null>(null);
  const sceneNarrationRef = useRef<HTMLAudioElement | null>(null);
  const introAudioTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0); // ref para evitar stale closure en keydown

  // Sync ref con estado
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Navegación por teclado
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = activeIndexRef.current;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (idx < TOTAL - 1) {
          mainEl.scrollTo({ top: (idx + 1) * window.innerHeight, behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx > 0) {
          mainEl.scrollTo({ top: (idx - 1) * window.innerHeight, behavior: "smooth" });
        }
      } else if (e.key === "ArrowRight") {
        const section = sectionRefs.current[idx];
        if (section && SECTIONS[idx]?.secondary) {
          e.preventDefault();
          section.scrollBy({ left: window.innerWidth, behavior: "smooth" });
        }
      } else if (e.key === "ArrowLeft") {
        const section = sectionRefs.current[idx];
        if (section && SECTIONS[idx]?.secondary) {
          e.preventDefault();
          section.scrollBy({ left: -window.innerWidth, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // empty deps — usa refs, no estado

  // Track which section is vertically active
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const cleanups: Array<() => void> = [];

    sectionRefs.current.forEach((section, idx) => {
      if (!section) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(idx);
        },
        { root: mainEl, threshold: 0.7 },
      );

      observer.observe(section);
      cleanups.push(() => observer.disconnect());
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Animación word-by-word al entrar cada sección
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const cleanups: Array<() => void> = [];

    sectionRefs.current.forEach((section, idx) => {
      if (!section || idx === 0) return;

      const label = section.querySelector<HTMLElement>("[data-anim-label]");
      const title = section.querySelector<HTMLElement>("[data-anim-title]");
      const narrationWords = section.querySelectorAll<HTMLElement>("[data-anim-narration] [data-word]");
      const dialogueBorder = section.querySelector<HTMLElement>("[data-anim-dialogue-border]");
      const dialogueWords = section.querySelectorAll<HTMLElement>("[data-anim-dialogue] [data-word]");

      if (!title) return;

      // Estado inicial invisible
      gsap.set([label, title], { autoAlpha: 0, y: 14 });
      gsap.set(narrationWords, { autoAlpha: 0, y: 8 });
      gsap.set([dialogueBorder, ...dialogueWords], { autoAlpha: 0 });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline();
            tl.to([label, title], {
                autoAlpha: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.5,
                ease: "power2.out",
              })
              .to(
                narrationWords,
                { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.2, ease: "power1.out" },
                "+=0.05",
              )
              .to(dialogueBorder, { autoAlpha: 1, duration: 0.25 }, "+=0.15")
              .to(
                dialogueWords,
                { autoAlpha: 1, stagger: 0.04, duration: 0.2, ease: "power1.out" },
                "<0.05",
              );
          } else {
            gsap.killTweensOf([label, title, narrationWords, dialogueBorder, dialogueWords]);
            gsap.set([label, title], { autoAlpha: 0, y: 14 });
            gsap.set(narrationWords, { autoAlpha: 0, y: 8 });
            gsap.set([dialogueBorder, ...dialogueWords], { autoAlpha: 0 });
          }
        },
        { root: mainEl, threshold: 0.5 },
      );

      observer.observe(section);
      cleanups.push(() => observer.disconnect());
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Intro video play/pause
  useEffect(() => {
    const video = introVideoRef.current;
    const narration = introNarrationRef.current;
    if (!video || !narration) return;

    if (activeIndex === 0) {
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => undefined);

      if (introAudioTimerRef.current) window.clearTimeout(introAudioTimerRef.current);
      introAudioTimerRef.current = window.setTimeout(() => {
        video.muted = false;
        video.volume = 1;
        void video.play().catch(() => undefined);
        narration.currentTime = 0;
        void narration.play().catch(() => undefined);
      }, 3000);
    } else {
      video.pause();
      narration.pause();
      if (introAudioTimerRef.current) {
        window.clearTimeout(introAudioTimerRef.current);
        introAudioTimerRef.current = null;
      }
    }

    return () => {
      if (introAudioTimerRef.current) {
        window.clearTimeout(introAudioTimerRef.current);
        introAudioTimerRef.current = null;
      }
    };
  }, [activeIndex]);

  // Scene narration audio
  useEffect(() => {
    const narration = sceneNarrationRef.current;
    if (!narration) return;

    const section = SECTIONS[activeIndex];
    if (!section?.sceneId) {
      narration.pause();
      narration.currentTime = 0;
      return;
    }

    const src = narrationBySceneId[section.sceneId];
    if (!src) {
      narration.pause();
      narration.currentTime = 0;
      return;
    }

    narration.pause();
    if (narration.getAttribute("src") !== src) {
      narration.setAttribute("src", src);
      narration.load();
    }
    narration.currentTime = 0;
    void narration.play().catch(() => undefined);
  }, [activeIndex]);

  const setSectionRef = (idx: number) => (el: HTMLElement | null) => {
    sectionRefs.current[idx] = el;
  };

  const activeSection = SECTIONS[activeIndex];
  const activeScene = storyScenes.find((s) => s.id === activeSection?.sceneId);
  const narratorText =
    activeIndex === 0
      ? "Comienza la historia de Blancanieves."
      : (activeScene?.narration ?? "");

  return (
    <main
      ref={mainRef}
      className="story-scroller h-screen overflow-y-scroll"
    >
      <audio ref={sceneNarrationRef} className="hidden" preload="metadata" />

      {/* Progress bar — fixed */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-1 bg-white/25">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / TOTAL) * 100}%` }}
        />
      </div>

      {/* Narrator aside — fixed */}
      <aside className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-zinc-900/85 p-4 text-white shadow-lg backdrop-blur-sm md:bottom-8 md:right-8">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Narrador</p>
        <p className="mt-2 text-sm leading-6">{narratorText}</p>
        <p className="mt-3 text-xs text-zinc-300">
          {activeIndex === 0 ? "Introducción" : `Escena ${activeSection?.sceneId} de 10`}
        </p>
      </aside>

      {/* Scroll down hint — fixed */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60">
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path
            d="M6 1v18M1 13l5 6 5-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs tracking-widest uppercase">scroll</span>
      </div>

      {SECTIONS.map((section, idx) => {
        const scene = storyScenes.find((s) => s.id === section.sceneId);
        const hasSecondary = !!section.secondary;

        // ── Intro ──────────────────────────────────────────────────────────
        if (section.key === "intro") {
          return (
            <section
              key={section.key}
              ref={setSectionRef(idx)}
              className="relative h-screen snap-start snap-always overflow-hidden"
            >
              <video
                ref={introVideoRef}
                src={section.primary.src}
                autoPlay
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/20 to-black/5" />
              <audio
                ref={introNarrationRef}
                preload="metadata"
                className="hidden"
                src="/Narrador/bievenidos%20al%20reino.mp3"
              />
            </section>
          );
        }

        // ── Sección con horizontal scroll ──────────────────────────────────
        if (hasSecondary) {
          return (
            <section
              key={section.key}
              ref={setSectionRef(idx)}
              className="no-scrollbar h-screen snap-start snap-always flex overflow-x-scroll snap-x snap-mandatory"
            >
              {/* Panel primario: fondo + card */}
              <div
                className={cn(
                  "relative flex h-full w-screen shrink-0 snap-start snap-always items-center justify-center overflow-hidden px-4 py-8 md:px-8",
                  scene ? `bg-linear-to-br ${scene.gradient}` : "bg-zinc-900",
                )}
              >
                <div className="absolute inset-0">
                  <MediaBackground media={section.primary} priority={idx <= 3} />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

                {scene && <SceneOverlay scene={scene} />}

                {/* Hint → scroll horizontal */}
                <div className="absolute right-5 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-1 text-white/70">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path
                      d="M1 6h18M13 1l6 5-6 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[10px] tracking-widest uppercase">ver más</span>
                </div>
              </div>

              {/* Panel secundario: solo imagen/video */}
              <div className="relative h-full w-screen shrink-0 snap-start snap-always overflow-hidden bg-zinc-900">
                <MediaBackground media={section.secondary!} priority={false} />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>
            </section>
          );
        }

        // ── Sección simple (sin secundario) ───────────────────────────────
        return (
          <section
            key={section.key}
            ref={setSectionRef(idx)}
            className={cn(
              "relative flex h-screen snap-start snap-always items-center justify-center overflow-hidden px-4 py-8 md:px-8",
              scene ? `bg-linear-to-br ${scene.gradient}` : "bg-zinc-900",
            )}
          >
            <div className="absolute inset-0">
              <MediaBackground media={section.primary} priority={idx <= 3} />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

            {scene && <SceneOverlay scene={scene} />}
          </section>
        );
      })}
    </main>
  );
}

// ---------------------------------------------------------------------------
// MediaBackground — full-cover image or looping video
// ---------------------------------------------------------------------------

function MediaBackground({ media, priority }: { media: Media; priority?: boolean }) {
  if (media.type === "video") {
    return (
      <video
        src={media.src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt=""
      fill
      priority={priority}
      className="object-cover"
    />
  );
}
