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
// useTypingCount — devuelve cuántos caracteres mostrar (con jitter natural)
// ---------------------------------------------------------------------------

function useTypingCount(
  text: string,
  isActive: boolean,
  charDelay: number,
  startDelay: number,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCount(0);
      return;
    }

    let cancelled = false;
    let i = 0;
    let timerId: number;

    const typeNext = () => {
      if (cancelled) return;
      i++;
      setCount(i);
      if (i < text.length) {
        // jitter ±35 % para ritmo más humano
        const jitter = charDelay * (0.65 + Math.random() * 0.7);
        timerId = window.setTimeout(typeNext, jitter);
      }
    };

    timerId = window.setTimeout(typeNext, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [isActive, text, charDelay, startDelay]);

  return count;
}

// ---------------------------------------------------------------------------
// TypingText — renderiza cada carácter como <span> con fade-in suave
// ---------------------------------------------------------------------------

function TypingText({
  text,
  isActive,
  charDelay,
  startDelay,
  className,
}: {
  text: string;
  isActive: boolean;
  charDelay: number;
  startDelay: number;
  className?: string;
}) {
  const count = useTypingCount(text, isActive, charDelay, startDelay);

  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            opacity: i < count ? 1 : 0,
            transition: i === count - 1 ? "opacity 0.12s ease-out" : "none",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SceneOverlay — texto animado en la parte inferior de cada escena
// ---------------------------------------------------------------------------

function SceneOverlay({
  scene,
  isActive,
}: {
  scene: (typeof storyScenes)[number];
  isActive: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Para saber cuándo terminó la narración usamos un contador propio
  const narrationCount = useTypingCount(scene.narration, isActive, 28, 700);
  const narrationDone = narrationCount >= scene.narration.length;

  // GSAP para el slide-fade del título
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    if (isActive) {
      gsap.to(title, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
    } else {
      gsap.set(title, { autoAlpha: 0, y: 14 });
    }
  }, [isActive]);

  // Estado inicial oculto
  useEffect(() => {
    const title = titleRef.current;
    if (title) gsap.set(title, { autoAlpha: 0, y: 14 });
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 pt-32 bg-linear-to-t from-black/90 via-black/55 to-transparent">
      <h2
        ref={titleRef}
        className="mb-4 text-2xl font-black leading-tight text-white drop-shadow md:text-4xl"
      >
        {scene.title}
      </h2>

      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
        <TypingText text={scene.narration} isActive={isActive} charDelay={28} startDelay={700} />
      </p>

      {narrationDone && (
        <div className="border-l-2 border-rose-400 pl-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-rose-300">
            {scene.speaker}
          </p>
          <p className="text-sm italic text-white/80 md:text-base">
            <TypingText text={scene.dialogue} isActive={isActive && narrationDone} charDelay={40} startDelay={400} />
          </p>
        </div>
      )}
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
  const s2VideoRef = useRef<HTMLVideoElement | null>(null);
  const s2SecVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const horseAudioRef = useRef<HTMLAudioElement | null>(null);
  const llevatelaAudioRef = useRef<HTMLAudioElement | null>(null);
  const correAudioRef = useRef<HTMLAudioElement | null>(null);
  const quienEsAudioRef = useRef<HTMLAudioElement | null>(null);
  const manzanaAudioRef = useRef<HTMLAudioElement | null>(null);
  const noPerdAudioRef = useRef<HTMLAudioElement | null>(null);
  const besoAudioRef = useRef<HTMLAudioElement | null>(null);
  const s10SecVideoRef = useRef<HTMLVideoElement | null>(null);
  const [s4AudioPlayed, setS4AudioPlayed] = useState(false);
  const [s9SecAudioPlayed, setS9SecAudioPlayed] = useState(false);
  const [s7AudioPlayed, setS7AudioPlayed] = useState(false);
  const [s8SecAudioPlayed, setS8SecAudioPlayed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0); // ref para evitar stale closure en keydown

  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const [s2SecAudioOn, setS2SecAudioOn] = useState(false);
  const [s1BubblesVisible, setS1BubblesVisible] = useState(false);
  const [s3BubbleVisible, setS3BubbleVisible] = useState(false);
  // Tracks panel horizontal lógico (0 = primario, 1 = secundario) por sección
  const panelIndexRef = useRef<Record<number, number>>({});

  // Sync refs con estado
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);


  // Resetear panel lógico y audio secundario s2 al cambiar de sección
  useEffect(() => {
    // Resetear scroll horizontal de todas las secciones no activas
    SECTIONS.forEach((s, i) => {
      if (i !== activeIndex && s.secondary) {
        panelIndexRef.current[i] = 0;
        const el = sectionRefs.current[i];
        if (el) el.scrollLeft = 0;
      }
    });
    panelIndexRef.current[activeIndex] = 0;
    const s2Idx = SECTIONS.findIndex((s) => s.key === "s2");
    const s1Idx = SECTIONS.findIndex((s) => s.key === "s1");
    if (activeIndex !== s2Idx) {
      setS2SecAudioOn(false);
      if (s2SecVideoRef.current) s2SecVideoRef.current.muted = true;
    }
    if (activeIndex !== s1Idx) setS1BubblesVisible(false);
    const s3Idx = SECTIONS.findIndex((s) => s.key === "s3");
    if (activeIndex !== s3Idx) setS3BubbleVisible(false);
    const s4Idx = SECTIONS.findIndex((s) => s.key === "s4");
    if (activeIndex !== s4Idx) {
      setS4AudioPlayed(false);
      if (llevatelaAudioRef.current) llevatelaAudioRef.current.pause();
    }
    const s7Idx = SECTIONS.findIndex((s) => s.key === "s7");
    if (activeIndex !== s7Idx) {
      setS7AudioPlayed(false);
      if (quienEsAudioRef.current) quienEsAudioRef.current.pause();
    }
    const s8Idx = SECTIONS.findIndex((s) => s.key === "s8");
    if (activeIndex !== s8Idx) {
      setS8SecAudioPlayed(false);
      if (manzanaAudioRef.current) manzanaAudioRef.current.pause();
    }
    const s9Idx = SECTIONS.findIndex((s) => s.key === "s9");
    if (activeIndex !== s9Idx) {
      setS9SecAudioPlayed(false);
      if (besoAudioRef.current) besoAudioRef.current.pause();
    }
    const s10Idx = SECTIONS.findIndex((s) => s.key === "s10");
    if (activeIndex !== s10Idx) {
      if (s10SecVideoRef.current) s10SecVideoRef.current.muted = true;
    }
  }, [activeIndex]);

  // Wheel → scroll horizontal cuando la sección tiene secundario
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    let scrolling = false;

    const handleWheel = (e: WheelEvent) => {
      const idx = activeIndexRef.current;
      const section = sectionRefs.current[idx];
      if (!section || !SECTIONS[idx]?.secondary) return;

      const panel = panelIndexRef.current[idx] ?? 0;

      // Panel primario + rueda abajo → ir al secundario
      if (e.deltaY > 0 && panel === 0) {
        e.preventDefault();
        if (!scrolling) {
          scrolling = true;
          panelIndexRef.current[idx] = 1;
          section.scrollTo({ left: window.innerWidth, behavior: "smooth" });
          // S2: cambiar audio al video secundario
          if (SECTIONS[idx]?.key === "s2" && soundEnabledRef.current) {
            if (s2VideoRef.current) s2VideoRef.current.muted = true;
            if (s2SecVideoRef.current) {
              s2SecVideoRef.current.muted = false;
              void s2SecVideoRef.current.play().catch(() => undefined);
            }
          }
          // S4: iniciar caballo al entrar al panel secundario
          if (SECTIONS[idx]?.key === "s4" && soundEnabledRef.current) {
            if (horseAudioRef.current) void horseAudioRef.current.play().catch(() => undefined);
          }
          // S5: iniciar corre blancanieves al entrar al panel secundario
          if (SECTIONS[idx]?.key === "s5" && soundEnabledRef.current) {
            if (correAudioRef.current) void correAudioRef.current.play().catch(() => undefined);
          }
          // S10: activar audio del video despedida al entrar al panel secundario
          if (SECTIONS[idx]?.key === "s10" && soundEnabledRef.current) {
            if (s10SecVideoRef.current) {
              s10SecVideoRef.current.muted = false;
              void s10SecVideoRef.current.play().catch(() => undefined);
            }
          }
          setTimeout(() => { scrolling = false; }, 700);
        }
        return;
      }

      // Panel secundario + rueda arriba → volver al primario
      if (e.deltaY < 0 && panel === 1) {
        e.preventDefault();
        if (!scrolling) {
          scrolling = true;
          panelIndexRef.current[idx] = 0;
          section.scrollTo({ left: 0, behavior: "smooth" });
          // S2: cambiar audio al video primario
          if (SECTIONS[idx]?.key === "s2" && soundEnabledRef.current) {
            if (s2SecVideoRef.current) s2SecVideoRef.current.muted = true;
            if (s2VideoRef.current) {
              s2VideoRef.current.muted = false;
              void s2VideoRef.current.play().catch(() => undefined);
            }
          }
          // S4: pausar caballo al salir del panel secundario
          if (SECTIONS[idx]?.key === "s4") {
            if (horseAudioRef.current) horseAudioRef.current.pause();
          }
          // S5: pausar corre blancanieves al salir del panel secundario
          if (SECTIONS[idx]?.key === "s5") {
            if (correAudioRef.current) correAudioRef.current.pause();
          }
          // S10: silenciar video despedida al volver al panel primario
          if (SECTIONS[idx]?.key === "s10") {
            if (s10SecVideoRef.current) s10SecVideoRef.current.muted = true;
          }
          setTimeout(() => { scrolling = false; }, 700);
        }
        return;
      }

      // Panel secundario + rueda abajo → siguiente sección vertical
      // Panel primario + rueda arriba → sección anterior vertical
      // → no preventDefault, el mainEl scrollea normalmente
    };

    mainEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => mainEl.removeEventListener("wheel", handleWheel);
  }, []);

  // Touch swipe horizontal dentro de secciones con secundario
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const idx = activeIndexRef.current;
      const section = sectionRefs.current[idx];
      if (!section || !SECTIONS[idx]?.secondary) return;

      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;

      // Solo si el gesto es más horizontal que vertical
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        section.scrollBy({ left: dx > 0 ? window.innerWidth : -window.innerWidth, behavior: "smooth" });
      }
    };

    mainEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    mainEl.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      mainEl.removeEventListener("touchstart", handleTouchStart);
      mainEl.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Track which section is vertically active
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const cleanups: Array<() => void> = [];

    sectionRefs.current.forEach((section, idx) => {
      if (!section) return;

      // Secciones dobles (con secundario) tienen ancho 200vw → ratio máx 50%
      // Usar threshold 0.4 para ellas y 0.7 para las simples
      const threshold = SECTIONS[idx]?.secondary ? 0.4 : 0.7;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(idx);
        },
        { root: mainEl, threshold },
      );

      observer.observe(section);
      cleanups.push(() => observer.disconnect());
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Intro video play/pause + audio
  useEffect(() => {
    const video = introVideoRef.current;
    const narration = introNarrationRef.current;
    if (!video || !narration) return;

    if (activeIndex === 0) {
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => undefined);

      if (soundEnabled) {
        if (introAudioTimerRef.current) window.clearTimeout(introAudioTimerRef.current);
        introAudioTimerRef.current = window.setTimeout(() => {
          video.muted = false;
          video.volume = 1;
          narration.currentTime = 0;
          void narration.play().catch(() => undefined);
        }, 3000);
      } else {
        video.muted = true;
        narration.pause();
      }
    } else {
      video.muted = true;
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
  }, [activeIndex, soundEnabled]);

  // S2 video audio (directo, sin pasar por props de React)
  useEffect(() => {
    const s2Idx = SECTIONS.findIndex((s) => s.key === "s2");
    const onS2 = soundEnabled && activeIndex === s2Idx;
    const panel = panelIndexRef.current[s2Idx] ?? 0;

    // Primario: sonido si estamos en s2 y en panel 0
    if (s2VideoRef.current) {
      s2VideoRef.current.muted = !(onS2 && panel === 0);
      if (onS2 && panel === 0) void s2VideoRef.current.play().catch(() => undefined);
    }
    // Secundario: siempre muted al entrar/salir (el wheel handler lo controla al cambiar panel)
    if (s2SecVideoRef.current) {
      s2SecVideoRef.current.muted = !(onS2 && panel === 1);
      if (onS2 && panel === 1) void s2SecVideoRef.current.play().catch(() => undefined);
    }
  }, [activeIndex, soundEnabled]);

  // Horse audio — panel secundario s4
  useEffect(() => {
    const horse = horseAudioRef.current;
    if (!horse) return;
    const s4Idx = SECTIONS.findIndex((s) => s.key === "s4");
    const onS4Sec = soundEnabled && activeIndex === s4Idx && (panelIndexRef.current[s4Idx] ?? 0) === 1;
    if (onS4Sec) { void horse.play().catch(() => undefined); } else { horse.pause(); }
  }, [activeIndex, soundEnabled]);

  // Corre audio — panel secundario s5
  useEffect(() => {
    const corre = correAudioRef.current;
    if (!corre) return;
    const s5Idx = SECTIONS.findIndex((s) => s.key === "s5");
    const onS5Sec = soundEnabled && activeIndex === s5Idx && (panelIndexRef.current[s5Idx] ?? 0) === 1;
    if (onS5Sec) { void corre.play().catch(() => undefined); } else { corre.pause(); }
  }, [activeIndex, soundEnabled]);

  // Background music play/pause
  useEffect(() => {
    const bg = bgMusicRef.current;
    if (!bg) return;
    if (soundEnabled) {
      bg.volume = 0.25;
      void bg.play().catch(() => undefined);
    } else {
      bg.pause();
    }
  }, [soundEnabled]);

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

    const needsLoad = narration.getAttribute("src") !== src;
    if (needsLoad) {
      narration.setAttribute("src", src);
      narration.load();
    }

    if (!soundEnabled) return;

    if (needsLoad) {
      // Esperar a que cargue suficiente antes de reproducir
      narration.addEventListener(
        "canplay",
        () => {
          narration.currentTime = 0;
          void narration.play().catch(() => undefined);
        },
        { once: true },
      );
    } else {
      narration.currentTime = 0;
      void narration.play().catch(() => undefined);
    }
  }, [activeIndex, soundEnabled]);

  const setSectionRef = (idx: number) => (el: HTMLElement | null) => {
    sectionRefs.current[idx] = el;
  };

  return (
    <main
      ref={mainRef}
      className="story-scroller h-screen overflow-y-scroll"
    >
      <audio ref={sceneNarrationRef} className="hidden" preload="metadata" />
      <audio ref={bgMusicRef} src="/melodia principal blancanieves.mp3" loop preload="metadata" className="hidden" />
      <audio ref={horseAudioRef} src="/caballo galopando.mp3" loop preload="metadata" className="hidden" />
      <audio ref={llevatelaAudioRef} src="/llevatela al bosque.mp3" preload="metadata" className="hidden" onEnded={() => setS4AudioPlayed(false)} />
      <audio ref={correAudioRef} src="/corre blancanieves.mp3" loop preload="metadata" className="hidden" />
      <audio ref={quienEsAudioRef} src="/quien es esa chica.mp3" preload="metadata" className="hidden" onEnded={() => setS7AudioPlayed(false)} />
      <audio ref={manzanaAudioRef} src="/blancanieves muerde la manzana.mp3" preload="metadata" className="hidden" onEnded={() => setS8SecAudioPlayed(false)} />
      <audio ref={noPerdAudioRef} src="/no perderemos.mp3" preload="metadata" className="hidden" />
      <audio ref={besoAudioRef} src="/beso del principe.mp3" preload="metadata" className="hidden" onEnded={() => setS9SecAudioPlayed(false)} />

      {/* Progress bar — fixed */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-1 bg-white/25">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / TOTAL) * 100}%` }}
        />
      </div>


      {/* Sound toggle — fixed */}
      <button
        onClick={() => setSoundEnabled((v) => !v)}
        className="fixed right-5 top-4 z-50 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition hover:bg-black/60"
      >
        {soundEnabled ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        )}
        {soundEnabled ? "sonido on" : "sonido off"}
      </button>

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
                  <MediaBackground
                    media={section.primary}
                    priority={idx <= 3}
                    videoRef={section.key === "s2" ? s2VideoRef : undefined}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

                {scene && <SceneOverlay scene={scene} isActive={activeIndex === idx} />}

                {/* PNG interactiva + audio — escena 4 primario */}
                {section.key === "s4" && (
                  <>
                    <div
                      className={cn("absolute inset-0 z-10 cursor-pointer", !s4AudioPlayed && "chars-invite")}
                      onClick={() => {
                        const audio = llevatelaAudioRef.current;
                        if (!audio) return;
                        setS4AudioPlayed(true);
                        audio.currentTime = 0;
                        void audio.play().catch(() => undefined);
                      }}
                    >
                      <Image
                        src="/imagen%20sin%20fondo/reina%20expulsa%20a%20Blancanieves.png"
                        alt="La reina expulsa a Blancanieves"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Hint */}
                    <div className={cn(
                      "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-rose-700/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                      s4AudioPlayed ? "opacity-0" : "opacity-100",
                    )}>
                      👆 ¡Toca la escena!
                    </div>
                  </>
                )}

                {/* PNG interactiva — escena 10 primario → ir al video */}
                {section.key === "s10" && (
                  <>
                    <div
                      className="absolute inset-0 z-[5] cursor-pointer chars-invite"
                      onClick={() => {
                        const el = sectionRefs.current[idx];
                        if (!el) return;
                        panelIndexRef.current[idx] = 1;
                        el.scrollTo({ left: window.innerWidth, behavior: "smooth" });
                        if (soundEnabledRef.current && s10SecVideoRef.current) {
                          s10SecVideoRef.current.muted = false;
                          void s10SecVideoRef.current.play().catch(() => undefined);
                        }
                      }}
                    >
                      <Image
                        src="/imagen%20sin%20fondo/blancanieves%20carruaje.png"
                        alt="Blancanieves en el carruaje"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-amber-500/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm animate-bounce">
                      👆 ¡Toca para ver el final!
                    </div>
                  </>
                )}

                {/* Bocadillo Enanitos — escena 9 */}
                {section.key === "s9" && (
                  <div
                    className="absolute top-12 left-1/2 -translate-x-1/2 z-20 max-w-72 cursor-pointer bubble-float"
                    onClick={() => {
                      const audio = noPerdAudioRef.current;
                      if (!audio) return;
                      audio.currentTime = 0;
                      void audio.play().catch(() => undefined);
                    }}
                  >
                    <div className="relative rounded-2xl rounded-bl-sm bg-emerald-950/85 px-6 py-5 shadow-2xl border border-emerald-700/50 backdrop-blur-sm text-center select-none">
                      <span className="block text-xs font-bold uppercase tracking-wide text-emerald-300 mb-2">Los Enanitos</span>
                      <p className="text-base text-emerald-50 leading-snug italic">"No perderemos la esperanza..."</p>
                      <div style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '14px solid rgba(6,47,31,0.85)', position: 'absolute', bottom: '-14px', left: '50%', transform: 'translateX(-50%)' }} />
                    </div>
                  </div>
                )}

                {/* Bocadillo Blancanieves — escena 4 */}
                {section.key === "s4" && (
                  <div className="absolute bottom-180 left-220 z-20 max-w-48 pointer-events-none bubble-float">
                    <div className="relative rounded-2xl rounded-bl-sm bg-sky-50/70 px-5 py-4 shadow-2xl border-2 border-sky-200/70 backdrop-blur-sm">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-sky-600 mb-1"></span>
                      <p className="text-2xl font-black text-gray-900 leading-tight">¡NOOOOOO!!!!</p>
                      <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '0px solid transparent', borderTop: '12px solid rgba(240,249,255,0.70)', position: 'absolute', bottom: '-12px', left: '16px' }} />
                    </div>
                  </div>
                )}

                {/* Bocadillos — escena 8 */}
                {section.key === "s8" && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Vendedora */}
                    <div className="absolute top-12 right-100 max-w-80 bubble-float">
                      <div className="relative rounded-2xl rounded-tr-sm bg-rose-950/85 px-6 py-5 shadow-2xl border border-rose-800/50 backdrop-blur-sm">
                        <span className="block text-xs font-bold uppercase tracking-wide text-rose-300 mb-2">La Vendedora</span>
                        <p className="text-base text-rose-50 leading-snug italic">"Toma esta manzana. Es un regalo para ti."</p>
                        <div style={{ width: 0, height: 0, borderLeft: '0px solid transparent', borderRight: '14px solid transparent', borderTop: '14px solid rgba(76,5,25,0.85)', position: 'absolute', bottom: '-14px', right: '16px' }} />
                      </div>
                    </div>

                    {/* Blancanieves */}
                    <div className="absolute bottom-200 left-190 max-w-72 bubble-float-delay">
                      <div className="relative rounded-2xl rounded-bl-sm bg-sky-50/85 px-6 py-5 shadow-2xl border border-sky-200/60 backdrop-blur-sm">
                        <span className="block text-xs font-bold uppercase tracking-wide text-sky-600 mb-2">Blancanieves</span>
                        <p className="text-base text-gray-800 leading-snug italic">"¡Ooohh! Gracias."</p>
                        <div style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '0px solid transparent', borderTop: '14px solid rgba(240,249,255,0.85)', position: 'absolute', bottom: '-14px', left: '16px' }} />
                      </div>
                    </div>
                  </div>
                )}

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
                <MediaBackground
                  media={section.secondary!}
                  priority={false}
                  videoRef={section.key === "s2" ? s2SecVideoRef : section.key === "s10" ? s10SecVideoRef : undefined}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                {section.key === "s1" && (
                  <>
                    {/* PNG sin fondo superpuesta — clickeable para mostrar bocadillos */}
                    <div
                      className={cn("absolute inset-0 z-10 cursor-pointer", !s1BubblesVisible && "chars-invite")}
                      onClick={() => setS1BubblesVisible((v) => !v)}
                    >
                      <Image
                        src="/imagen%20sin%20fondo/blancanieves%20en%20su%20reino.png"
                        alt="Personajes"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Hint inferior con bounce */}
                    <div className={cn(
                      "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-rose-500/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                      s1BubblesVisible ? "opacity-0" : "opacity-100",
                    )}>
                      ✨ ¡Toca los personajes!
                    </div>

                    {/* Bocadillos — aparecen al hacer click */}
                    <div className={cn(
                      "absolute inset-0 z-20 pointer-events-none transition-opacity duration-500",
                      s1BubblesVisible ? "opacity-100" : "opacity-0",
                    )}>
                      {/* El Rey */}
                      <div className="absolute top-10 left-96 max-w-50 bubble-float">
                        <div className="relative rounded-2xl rounded-bl-sm bg-amber-50/95 px-4 py-3 shadow-xl">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">El Rey</span>
                          <p className="text-sm text-gray-800 leading-snug italic">"Hija mía, todo esto te pertenece."</p>
                          <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '0px solid transparent', borderTop: '12px solid rgba(255,251,235,0.95)', position: 'absolute', bottom: '-12px', left: '16px' }} />
                        </div>
                      </div>

                      {/* Blancanieves */}
                      <div className="absolute bottom-176 left-75 -translate-x-1/2 max-w-45 bubble-float-delay">
                        <div className="relative rounded-2xl rounded-br-sm bg-sky-50/95 px-4 py-3 shadow-xl text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-sky-600 mb-1">Blancanieves</span>
                          <p className="text-sm text-gray-800 leading-snug italic">"Oh papá, te amo."</p>
                          <div style={{ width: 0, height: 0, borderLeft: '0px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid rgba(240,249,255,0.95)', position: 'absolute', bottom: '-12px', right: '16px' }} />
                        </div>
                      </div>

                      {/* La Reina */}
                      <div className="absolute top-25 right-85 max-w-55 bubble-float-delay2">
                        <div className="relative rounded-2xl rounded-br-sm bg-purple-950/90 px-4 py-3 shadow-xl border border-purple-700/40">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-purple-300 mb-1">La Reina</span>
                          <p className="text-sm text-purple-100 leading-snug italic">"¡Jum! Tarde que temprano esto será mío y de nadie más…"</p>
                          <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '0px solid transparent', borderTop: '12px solid rgba(59,7,100,0.9)', position: 'absolute', bottom: '-12px', right: '16px' }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {section.key === "s5" && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Cazador */}
                    <div className="absolute top-8 left-145 max-w-64 bubble-float">
                      <div className="relative rounded-2xl rounded-tl-sm bg-amber-900/85 px-4 py-3 shadow-2xl border border-amber-700/50 backdrop-blur-sm">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-300 mb-1">El Cazador</span>
                        <p className="text-sm text-amber-50 leading-snug italic">"Corre Blancanieves, huye hacia lo profundo del bosque, escóndete muy bien, no dejen que te encuentren."</p>
                        <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '0px solid transparent', borderTop: '12px solid rgba(120,53,15,0.85)', position: 'absolute', bottom: '-12px', left: '16px' }} />
                      </div>
                    </div>

                    {/* Blancanieves */}
                    <div className="absolute bottom-180 right-150 max-w-72 bubble-float-delay">
                      <div className="relative rounded-2xl rounded-br-sm bg-sky-50/85 px-6 py-5 shadow-2xl border border-sky-200/60 backdrop-blur-sm text-right">
                        <span className="block text-xs font-bold uppercase tracking-wide text-sky-600 mb-2">Blancanieves</span>
                        <p className="text-base text-gray-800 leading-snug italic">"¡Lo haré! Gracias...!"</p>
                        <div style={{ width: 0, height: 0, borderLeft: '0px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid rgba(240,249,255,0.85)', position: 'absolute', bottom: '-12px', right: '16px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {section.key === "s9" && (
                  <>
                    <div
                      className={cn("absolute inset-0 z-10 cursor-pointer", !s9SecAudioPlayed && "chars-invite")}
                      onClick={() => {
                        const audio = besoAudioRef.current;
                        if (!audio) return;
                        setS9SecAudioPlayed(true);
                        audio.currentTime = 0;
                        void audio.play().catch(() => undefined);
                      }}
                    >
                      <Image
                        src="/imagen%20sin%20fondo/beso%20a%20blancanieves.png"
                        alt="El beso del príncipe"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className={cn(
                      "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-rose-400/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                      s9SecAudioPlayed ? "opacity-0" : "opacity-100",
                    )}>
                      👆 ¡Toca la escena!
                    </div>
                  </>
                )}

                {section.key === "s8" && (
                  <>
                    <div
                      className={cn("absolute inset-0 z-10 cursor-pointer", !s8SecAudioPlayed && "chars-invite")}
                      onClick={() => {
                        const audio = manzanaAudioRef.current;
                        if (!audio) return;
                        setS8SecAudioPlayed(true);
                        audio.currentTime = 0;
                        void audio.play().catch(() => undefined);
                      }}
                    >
                      <Image
                        src="/imagen%20sin%20fondo/blancanieves%20desmayandose.png"
                        alt="Blancanieves desmayándose"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className={cn(
                      "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-rose-900/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                      s8SecAudioPlayed ? "opacity-0" : "opacity-100",
                    )}>
                      👆 ¡Toca la escena!
                    </div>
                  </>
                )}

                {section.key === "s10" && (
                  <button
                    onClick={() => {
                      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-amber-400/90 px-7 py-3 text-sm font-bold text-amber-950 shadow-xl backdrop-blur-sm transition hover:bg-amber-300 active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                    Volver al inicio
                  </button>
                )}

                {section.key === "s2" && (
                  <button
                    onClick={() => {
                      const v = s2SecVideoRef.current;
                      if (!v) return;
                      const next = !s2SecAudioOn;
                      setS2SecAudioOn(next);
                      v.muted = !next;
                      if (next) {
                        if (!soundEnabledRef.current) setSoundEnabled(true);
                        void v.play().catch(() => undefined);
                      }
                    }}
                    className="absolute bottom-8 right-6 z-20 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs text-white/90 backdrop-blur-sm transition hover:bg-black/70"
                  >
                    {s2SecAudioOn ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    )}
                    {s2SecAudioOn ? "silenciar" : "activar audio"}
                  </button>
                )}
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

            {scene && <SceneOverlay scene={scene} isActive={activeIndex === idx} />}

            {section.key === "s6" && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-72 bubble-float">
                <div className="relative rounded-2xl rounded-bl-sm bg-sky-50/85 px-6 py-5 shadow-2xl border border-sky-200/60 backdrop-blur-sm text-center">
                  <span className="block text-xs font-bold uppercase tracking-wide text-sky-600 mb-2">Blancanieves</span>
                  <p className="text-base text-gray-800 leading-snug italic">"Todo aquí es pequeño... quizás pueda descansar."</p>
                  <div style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '14px solid rgba(240,249,255,0.85)', position: 'absolute', bottom: '-14px', left: '50%', transform: 'translateX(-50%)' }} />
                </div>
              </div>
            )}

            {section.key === "s7" && (
              <>
                <div
                  className={cn("absolute inset-0 z-[5] cursor-pointer", !s7AudioPlayed && "chars-invite")}
                  onClick={() => {
                    const audio = quienEsAudioRef.current;
                    if (!audio) return;
                    setS7AudioPlayed(true);
                    audio.currentTime = 0;
                    void audio.play().catch(() => undefined);
                  }}
                >
                  <Image
                    src="/imagen%20sin%20fondo/blancanieves%20durmiendo.png"
                    alt="Blancanieves durmiendo"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className={cn(
                  "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-indigo-700/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                  s7AudioPlayed ? "opacity-0" : "opacity-100",
                )}>
                  👆 ¡Toca la escena!
                </div>
              </>
            )}

            {section.key === "s3" && (
              <>
                {/* PNG sin fondo superpuesta — clickeable */}
                <div
                  className={cn("absolute inset-0 z-10 cursor-pointer", !s3BubbleVisible && "chars-invite")}
                  onClick={() => setS3BubbleVisible((v) => !v)}
                >
                  <Image
                    src="/imagen%20sin%20fondo/espejo.png"
                    alt="Espejo mágico"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Hint inferior con bounce */}
                <div className={cn(
                  "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-amber-500/80 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 animate-bounce",
                  s3BubbleVisible ? "opacity-0" : "opacity-100",
                )}>
                  ✨ ¡Toca el espejo!
                </div>

                {/* Bocadillos — aparecen al hacer click */}
                <div className={cn(
                  "absolute inset-0 z-20 pointer-events-none transition-opacity duration-500",
                  s3BubbleVisible ? "opacity-100" : "opacity-0",
                )}>
                  {/* Espejo Mágico */}
                  <div className="absolute top-[2%] left-[55%] -translate-x-1/2 max-w-lg w-[55%] bubble-float">
                    <div className="relative rounded-2xl bg-amber-50/50 px-6 py-5 shadow-2xl border-2 border-amber-300/60 text-center backdrop-blur-sm">
                      <span className="block text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">✦ El Espejo Mágico ✦</span>
                      <p className="text-base text-gray-800 leading-relaxed italic">"En verdad, Blancanieves es más bella que la reina, por ser noble y pura de corazón."</p>
                      <div style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '14px solid rgba(255,251,235,0.50)', position: 'absolute', bottom: '-14px', left: '50%', transform: 'translateX(-50%)' }} />
                    </div>
                  </div>

                </div>
              </>
            )}
          </section>
        );
      })}
    </main>
  );
}

// ---------------------------------------------------------------------------
// MediaBackground — full-cover image or looping video
// ---------------------------------------------------------------------------

function MediaBackground({
  media,
  priority,
  videoRef,
}: {
  media: Media;
  priority?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const ref = videoRef ?? internalRef;

  if (media.type === "video") {
    return (
      <video
        ref={ref}
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
