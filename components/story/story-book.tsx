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

type SceneRef = HTMLElement | null;

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
  const sceneRefs = useRef<SceneRef[]>([]);
  const sceneOnePanelRef = useRef<HTMLDivElement | null>(null);
  const sceneOneImageRef = useRef<HTMLDivElement | null>(null);
  const introSectionRef = useRef<HTMLElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const introNarrationRef = useRef<HTMLAudioElement | null>(null);
  const sceneNarrationRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const introAudioTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSections = storyScenes.length + 1;

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
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    sceneRefs.current.forEach((scene, index) => {
      if (!scene) return;

      const content = scene.querySelector("[data-scene-content]");
      const image = scene.querySelector("[data-scene-image]");

      if (content) {
        const contentTween = gsap.fromTo(
          content,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scene,
              start: "top 72%",
              end: "top 30%",
              toggleActions: "play none none reverse",
            },
          },
        );
        cleanups.push(() => contentTween.kill());
      }

      if (image) {
        const imageTween = gsap.fromTo(
          image,
          { scale: 1.04, autoAlpha: 0.82 },
          {
            scale: 1,
            autoAlpha: 1,
            ease: "power1.out",
            duration: 1.1,
            scrollTrigger: {
              trigger: scene,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
        cleanups.push(() => imageTween.kill());
      }

      const tracker = ScrollTrigger.create({
        trigger: scene,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });

      cleanups.push(() => tracker.kill());
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ScrollTrigger.refresh();
    };
  }, []);

  useEffect(() => {
    const panel = sceneOnePanelRef.current;
    const image = sceneOneImageRef.current;

    if (!panel || !image) return;

    const tween = gsap.fromTo(
      image,
      { xPercent: 0 },
      {
        xPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    const section = introSectionRef.current;
    const video = introVideoRef.current;
    const narration = introNarrationRef.current;

    if (!section || !video || !narration) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 1) {
          if (video.ended) {
            video.currentTime = 0;
          }
          void video.play().catch(() => undefined);

          if (introAudioTimerRef.current) {
            window.clearTimeout(introAudioTimerRef.current);
          }

          introAudioTimerRef.current = window.setTimeout(() => {
            video.muted = false;
            video.volume = 1;
            void video.play().catch(() => undefined);
            narration.currentTime = 0;
            void narration.play().catch(() => undefined);
          }, 3000);
          return;
        }

        video.pause();
        narration.pause();
        if (introAudioTimerRef.current) {
          window.clearTimeout(introAudioTimerRef.current);
          introAudioTimerRef.current = null;
        }
      },
      { threshold: [0, 1] },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
      narration.pause();
      if (introAudioTimerRef.current) {
        window.clearTimeout(introAudioTimerRef.current);
        introAudioTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const narration = sceneNarrationRef.current;
    if (!narration) return;

    const sceneId = activeIndex;
    const src = narrationByScene[sceneId];

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

  const setSceneRef =
    (index: number) =>
    (element: HTMLElement | null): void => {
      sceneRefs.current[index] = element;
    };

  return (
    <main className="relative snap-y snap-mandatory overflow-x-hidden">
      <audio ref={sceneNarrationRef} className="hidden" preload="metadata" />

      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-1 bg-white/25">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / totalSections) * 100}%` }}
        />
      </div>

      <section
        ref={(element) => {
          introSectionRef.current = element;
          setSceneRef(0)(element);
        }}
        className="relative flex h-screen snap-start items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <video
            ref={introVideoRef}
            src="/blancanievesprincipal.mp4"
            autoPlay
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            data-scene-image
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/5" />
        </div>
        <audio
          ref={introNarrationRef}
          preload="metadata"
          className="hidden"
          src="/Narrador/bievenidos%20al%20reino.mp3"
        >
          Tu navegador no soporta audio.
        </audio>
      </section>

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

      {storyScenes.map((scene, index) => (
        <section
          key={scene.id}
          ref={setSceneRef(index + 1)}
          className={cn(
            "relative flex h-screen snap-start items-center justify-center overflow-hidden px-4 py-8 md:px-8",
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
                data-scene-image
              />
            </div>
          ) : null}

          {scene.id !== 1 ? (
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
          ) : null}
        </section>
      ))}
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
        data-scene-image
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
      data-scene-image
    />
  );
}
