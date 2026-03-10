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

const narrationByScene: Record<number, string> = {
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

const videoByScene: Partial<Record<number, string>> = {
  1: "/saludoblancanieves.mp4",
  2: "/reina frente espejo.mp4",
  5: "/corre blancanieves.mp4",
  10: "/depedida.mp4",
};

export function StoryBook() {
  const pinWrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const introNarrationRef = useRef<HTMLAudioElement | null>(null);
  const sceneNarrationRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const introAudioTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSections = storyScenes.length + 1;

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

  // Horizontal scroll: pin wrapper, translate track
  useEffect(() => {
    const pinWrap = pinWrapRef.current;
    const track = trackRef.current;
    if (!pinWrap || !track) return;

    const totalScrollWidth = (totalSections - 1) * window.innerWidth;

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
          const index = Math.round(self.progress * (totalSections - 1));
          setActiveIndex(index);
        },
      },
    });

    // Card content fade-in per scene using containerAnimation
    const panels = track.querySelectorAll<HTMLElement>("[data-scene-panel]");
    const cleanups: Array<() => void> = [];

    panels.forEach((panel) => {
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
  }, [totalSections]);

  // Intro video: play/pause based on active scene
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

  // Scene narration
  useEffect(() => {
    const narration = sceneNarrationRef.current;
    if (!narration) return;

    const src = narrationByScene[activeIndex];

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

  return (
    <main>
      <audio ref={sceneNarrationRef} className="hidden" preload="metadata" />

      {/* Progress bar */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-1 bg-white/25">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / totalSections) * 100}%` }}
        />
      </div>

      {/* Narrator panel */}
      <aside className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-zinc-900/85 p-4 text-white shadow-lg backdrop-blur-sm md:bottom-8 md:right-8">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Narrador</p>
        <p className="mt-2 text-sm leading-6">
          {activeIndex === 0
            ? "Comienza la historia de Blancanieves."
            : storyScenes[activeIndex - 1]?.narration}
        </p>
        <p className="mt-3 text-xs text-zinc-300">
          Escena {activeIndex + 1} de {totalSections}
        </p>
      </aside>

      {/* Arrow hints */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 text-white/60">
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path d="M1 6h18M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Pin wrapper — GSAP pins this element */}
      <div ref={pinWrapRef} className="overflow-hidden">
        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex h-screen will-change-transform"
          style={{ width: `${totalSections * 100}vw` }}
        >
          {/* Intro panel */}
          <section className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden">
            <video
              ref={introVideoRef}
              src="/blancanievesprincipal.mp4"
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

          {/* Story scenes */}
          {storyScenes.map((scene) => (
            <section
              key={scene.id}
              data-scene-panel
              className={cn(
                "relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden px-4 py-8 md:px-8",
                `bg-gradient-to-br ${scene.gradient}`,
              )}
            >
              {scene.id === 1 ? (
                <div className="absolute inset-0">
                  <video
                    src="/saludoblancanieves.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0">
                    <SceneBackgroundMedia sceneId={scene.id} image={scene.image} title={scene.title} />
                  </div>

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
                </>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function SceneBackgroundMedia({
  sceneId,
  image,
  title,
}: {
  sceneId: number;
  image: string;
  title: string;
}) {
  const videoSrc = videoByScene[sceneId];

  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={(event) => {
          event.currentTarget.currentTime = 0;
          void event.currentTarget.play().catch(() => undefined);
        }}
      />
    );
  }

  return (
    <Image
      src={image}
      alt={title}
      fill
      priority={sceneId <= 2}
      className="object-cover"
    />
  );
}
