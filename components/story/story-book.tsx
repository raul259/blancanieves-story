"use client";

import Image from "next/image";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { storyScenes } from "./story-data";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Panel configuration — flat list of every horizontal panel in order
// ---------------------------------------------------------------------------

type PanelMedia =
  | { type: "video"; src: string }
  | { type: "image"; src: string };

type PanelConfig = {
  key: string;
  sceneId: number | null; // 1-10, null = intro
  isSecondary: boolean;
  media: PanelMedia;
};

const PANELS: PanelConfig[] = [
  // 0 – Intro
  {
    key: "intro",
    sceneId: null,
    isSecondary: false,
    media: { type: "video", src: "/blancanievesprincipal.mp4" },
  },

  // 1 – Escena 1 principal
  {
    key: "s1",
    sceneId: 1,
    isSecondary: false,
    media: { type: "video", src: "/saludoblancanieves.mp4" },
  },
  // 2 – Escena 1 secundario → blancanieves en su reino
  {
    key: "s1b",
    sceneId: 1,
    isSecondary: true,
    media: { type: "image", src: "/blancanieves%20en%20su%20reino.jpg" },
  },

  // 3 – Escena 2 principal
  {
    key: "s2",
    sceneId: 2,
    isSecondary: false,
    media: { type: "video", src: "/reina frente espejo.mp4" },
  },
  // 4 – Escena 2 secundario → reina frente al espejo
  {
    key: "s2b",
    sceneId: 2,
    isSecondary: true,
    media: { type: "video", src: "/reina frente al espejo.mp4" },
  },

  // 5 – Escena 3 (sin secundario)
  {
    key: "s3",
    sceneId: 3,
    isSecondary: false,
    media: { type: "image", src: "/espejo.jpg" },
  },

  // 6 – Escena 4 principal
  {
    key: "s4",
    sceneId: 4,
    isSecondary: false,
    media: { type: "image", src: "/reina expulsa a Blancanieves.jpg" },
  },
  // 7 – Escena 4 secundario → cazador se lleva a Blancanieves
  {
    key: "s4b",
    sceneId: 4,
    isSecondary: true,
    media: { type: "image", src: "/cazador se lleva a blancanieves.jpg" },
  },

  // 8 – Escena 5 principal
  {
    key: "s5",
    sceneId: 5,
    isSecondary: false,
    media: { type: "image", src: "/cazador%20piadoso.jpg" },
  },
  // 9 – Escena 5 secundario → Blancanieves corriendo
  {
    key: "s5b",
    sceneId: 5,
    isSecondary: true,
    media: { type: "image", src: "/blancanieves corriendo.jpg" },
  },

  // 10 – Escena 6 (sin secundario)
  {
    key: "s6",
    sceneId: 6,
    isSecondary: false,
    media: { type: "image", src: "/blancanieves%20caba%C3%B1a.jpg" },
  },

  // 11 – Escena 7 principal
  {
    key: "s7",
    sceneId: 7,
    isSecondary: false,
    media: { type: "image", src: "/blancanieves%20durmiendo.jpg" },
  },
  // 12 – Escena 7 secundario → blancanieves durmiendo (alt)
  {
    key: "s7b",
    sceneId: 7,
    isSecondary: true,
    media: { type: "image", src: "/blancanieves%20durmiendo.jpg" },
  },

  // 13 – Escena 8 principal
  {
    key: "s8",
    sceneId: 8,
    isSecondary: false,
    media: { type: "image", src: "/blancanieves%20recibiendo%20la%20manzana.jpg" },
  },
  // 14 – Escena 8 secundario → Blancanieves desmayándose
  {
    key: "s8b",
    sceneId: 8,
    isSecondary: true,
    media: { type: "image", src: "/blancanieves desmayandose.jpg" },
  },

  // 15 – Escena 9 principal
  {
    key: "s9",
    sceneId: 9,
    isSecondary: false,
    media: { type: "image", src: "/blancanievees dentro ataúd.jpg" },
  },
  // 16 – Escena 9 secundario → beso a Blancanieves
  {
    key: "s9b",
    sceneId: 9,
    isSecondary: true,
    media: { type: "image", src: "/beso a blancanieves.jpg" },
  },

  // 17 – Escena 10 principal
  {
    key: "s10",
    sceneId: 10,
    isSecondary: false,
    media: { type: "image", src: "/blancanieves carruaje.jpg" },
  },
  // 18 – Escena 10 secundario → despedida (video)
  {
    key: "s10b",
    sceneId: 10,
    isSecondary: true,
    media: { type: "video", src: "/depedida.mp4" },
  },
];

const TOTAL = PANELS.length; // 19

// ---------------------------------------------------------------------------
// Narration audio per scene ID
// ---------------------------------------------------------------------------

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
// Component
// ---------------------------------------------------------------------------

export function StoryBook() {
  const pinWrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const introNarrationRef = useRef<HTMLAudioElement | null>(null);
  const sceneNarrationRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const introAudioTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const frame = (time: number) => {
      lenis.raf(time);
      frameRef.current = window.requestAnimationFrame(frame);
    };
    frameRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      lenis.destroy();
    };
  }, []);

  // Horizontal scroll: pin + translate track
  useEffect(() => {
    const pinWrap = pinWrapRef.current;
    const track = trackRef.current;
    if (!pinWrap || !track) return;

    const totalScrollWidth = (TOTAL - 1) * window.innerWidth;

    const horizontalTween = gsap.to(track, {
      x: -totalScrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: pinWrap,
        start: "top top",
        end: `+=${totalScrollWidth}`,
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        onUpdate: (self) => {
          const index = Math.round(self.progress * (TOTAL - 1));
          setActiveIndex(index);
        },
      },
    });

    // Card fade-in per primary panel
    const cleanups: Array<() => void> = [];
    const primaryPanels = track.querySelectorAll<HTMLElement>("[data-primary-panel]");

    primaryPanels.forEach((panel) => {
      const content = panel.querySelector("[data-scene-content]");
      if (!content) return;

      const tween = gsap.fromTo(
        content,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: horizontalTween,
            trigger: panel,
            start: "left 85%",
            end: "left 45%",
            toggleActions: "play none none reverse",
          },
        },
      );
      cleanups.push(() => tween.kill());
    });

    return () => {
      cleanups.forEach((fn) => fn());
      horizontalTween.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // Intro video control
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

  // Scene narration — only plays on primary (non-secondary) scene panels
  useEffect(() => {
    const narration = sceneNarrationRef.current;
    if (!narration) return;

    const panel = PANELS[activeIndex];
    if (!panel || panel.isSecondary || panel.sceneId === null) {
      narration.pause();
      narration.currentTime = 0;
      return;
    }

    const src = narrationBySceneId[panel.sceneId];
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

  // Narrator aside content
  const currentPanel = PANELS[activeIndex];
  const activeScene = storyScenes.find((s) => s.id === currentPanel?.sceneId);

  const narratorText =
    activeIndex === 0
      ? "Comienza la historia de Blancanieves."
      : (activeScene?.narration ?? "");

  const sceneLabel =
    activeIndex === 0
      ? "Introducción"
      : `Escena ${currentPanel?.sceneId ?? ""} de 10${currentPanel?.isSecondary ? " →" : ""}`;

  return (
    <main>
      <audio ref={sceneNarrationRef} className="hidden" preload="metadata" />

      {/* Progress bar */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-1 bg-white/25">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / TOTAL) * 100}%` }}
        />
      </div>

      {/* Narrator aside */}
      <aside className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-zinc-900/85 p-4 text-white shadow-lg backdrop-blur-sm md:bottom-8 md:right-8">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Narrador</p>
        <p className="mt-2 text-sm leading-6">{narratorText}</p>
        <p className="mt-3 text-xs text-zinc-300">{sceneLabel}</p>
      </aside>

      {/* Scroll hint */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 text-white/60">
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path
            d="M1 6h18M13 1l6 5-6 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Pin wrapper */}
      <div ref={pinWrapRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-screen will-change-transform"
          style={{ width: `${TOTAL * 100}vw` }}
        >
          {PANELS.map((panel, idx) => {
            const scene = storyScenes.find((s) => s.id === panel.sceneId);

            // ── Intro panel ────────────────────────────────────────────────
            if (panel.key === "intro") {
              return (
                <section
                  key={panel.key}
                  className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden"
                >
                  <video
                    ref={introVideoRef}
                    src={panel.media.src}
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/5" />
                  <audio
                    ref={introNarrationRef}
                    preload="metadata"
                    className="hidden"
                    src="/Narrador/bievenidos%20al%20reino.mp3"
                  />
                </section>
              );
            }

            // ── Secondary panel — purely visual, no card ───────────────────
            if (panel.isSecondary) {
              return (
                <section
                  key={panel.key}
                  className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden bg-zinc-900"
                >
                  <PanelMedia media={panel.media} priority={idx <= 4} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </section>
              );
            }

            // ── Primary scene panel — background + card ────────────────────
            return (
              <section
                key={panel.key}
                data-primary-panel
                className={cn(
                  "relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden px-4 py-8 md:px-8",
                  scene ? `bg-gradient-to-br ${scene.gradient}` : "bg-zinc-900",
                )}
              >
                <div className="absolute inset-0">
                  <PanelMedia media={panel.media} priority={idx <= 4} />
                </div>

                {scene && (
                  <Card
                    data-scene-content
                    className="relative z-10 w-full max-w-3xl border-white bg-white py-7 shadow-2xl"
                  >
                    <CardHeader className="gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                        Escena {scene.id}
                      </p>
                      <CardTitle className="text-3xl font-black leading-tight text-zinc-900 md:text-5xl">
                        {scene.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="max-w-2xl text-base leading-7 text-zinc-700 md:text-xl md:leading-8">
                        {scene.narration}
                      </p>
                      <div className="mt-5 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-700">
                          {scene.speaker}
                        </p>
                        <p className="mt-1 text-base text-zinc-800 md:text-lg">{scene.dialogue}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// PanelMedia — renders a video or image as full-cover background
// ---------------------------------------------------------------------------

function PanelMedia({ media, priority }: { media: PanelMedia; priority?: boolean }) {
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
