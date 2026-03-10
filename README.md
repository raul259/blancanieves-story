# Cuento Animado e Interactivo: Blancanieves

Proyecto educativo desarrollado con tecnologías web modernas para público infantil (+1 año), combinando narrativa visual, animación, interacción y experiencia sonora.

## Objetivo de la práctica

Diseñar y desarrollar un cuento animado e interactivo de pantalla completa, con scroll narrativo por escenas, continuidad visual y claridad narrativa, adaptado a uso en escritorio y tablet.

## Tecnologías usadas

- React
- Next.js
- GSAP
- Lenis.js
- TypeScript

## Cumplimiento de requisitos

### Estructura

- Cada escena ocupa pantalla completa (`100vw x 100vh`).
- Navegación por scroll con `snap` para evitar quedarse entre dos escenas.
- Scroll suave y controlado con Lenis.
- Diseño responsive para desktop/tablet y controles táctiles en botones interactivos.

### Animación

- Animaciones de entrada/salida con GSAP (`data-scene-content`, `data-scene-image`).
- Animación de texto tipo typing para subtítulos.
- Efectos ambientales aplicados por escena (niebla, lluvia, viento) según la narrativa.
- Se han eliminado efectos en escenas donde no aportan a la historia para mantener coherencia.

### Narrativa y personajes

- Personajes principales con identidad visual.
- Narrador presente mediante audio y subtítulos.
- Bocadillos de diálogo visibles y legibles.
- Continuidad estética general entre escenas.

### Interacción infantil

- Interacciones simples y evidentes: botones `Sigue/Volver`, reinicio de video con clic, control de sonido.
- Elementos grandes y visuales, aptos para interacción táctil.
- Sin necesidad de instrucciones complejas para navegar.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir en navegador: `http://localhost:3000`

## Comprobación técnica

```bash
npx tsc --noEmit
```

Verifica que el proyecto compile sin errores de TypeScript.
