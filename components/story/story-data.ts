export type SceneEffect = "none" | "fog" | "rain" | "wind";

export type StoryScene = {
  id: number;
  title: string;
  narration: string;
  dialogue: string;
  speaker: string;
  image: string;
  gradient: string;
  effect: SceneEffect;
};

export const storyScenes: StoryScene[] = [
  {
    id: 1,
    title: "Un reino lejano",
    narration:
      "Érase una vez una princesa llamada Blancanieves que vivía en un castillo junto a su padre y su madrastra.",
    dialogue: "Bienvenidos al reino de Blancanieves.",
    speaker: "Narrador",
    image: "/blancanieves%20en%20su%20reino.jpg",
    gradient: "from-amber-100 via-orange-200 to-rose-300",
    effect: "none",
  },
  {
    id: 2,
    title: "El espejo mágico",
    narration:
      "La reina preguntaba cada día a su espejo quién era la más hermosa.",
    dialogue: "Espejito, espejito, ¿quién es la más hermosa del reino?",
    speaker: "Reina",
    image: "/reina frente al espejo.jpg",
    gradient: "from-rose-200 via-red-300 to-red-400",
    effect: "none",
  },
  {
    id: 3,
    title: "La verdad duele",
    narration:
      "Un día el espejo dijo que Blancanieves era aún más bella por su bondad.",
    dialogue: "Blancanieves es la más hermosa.",
    speaker: "Espejo",
    image: "/espejo.jpg",
    gradient: "from-sky-100 via-indigo-200 to-violet-300",
    effect: "none",
  },
  {
    id: 4,
    title: "Orden cruel",
    narration:
      "La reina se llenó de ira y ordenó al cazador llevar a Blancanieves al bosque.",
    dialogue:
      "Llévatela al bosque y no permitas que regrese al castillo.",
    speaker: "Reina",
    image: "/reina expulsa a Blancanieves.jpg",
    gradient: "from-zinc-200 via-zinc-400 to-zinc-600",
    effect: "none",
  },
  {
    id: 5,
    title: "Huida en el bosque",
    narration:
      "El cazador se apiadó y le pidió que corriera lejos para salvar su vida.",
    dialogue: "Corre, busca un lugar seguro y no mires atrás.",
    speaker: "Cazador",
    image: "/cazador%20piadoso.jpg",
    gradient: "from-emerald-100 via-green-300 to-emerald-500",
    effect: "none",
  },
  {
    id: 6,
    title: "La pequeña cabaña",
    narration:
      "Al anochecer encontró una cabaña con siete platos y siete camas pequeñas.",
    dialogue: "Todo aquí es pequeño... quizás pueda descansar.",
    speaker: "Blancanieves",
    image: "/blancanieves%20caba%C3%B1a.jpg",
    gradient: "from-yellow-100 via-amber-200 to-orange-300",
    effect: "none",
  },
  {
    id: 7,
    title: "Los siete enanos",
    narration:
      "Los enanitos, cuando regresaron de trabajar, hallaron a una hermosa chica dormida en la séptima cama. Ellos no sabían que esa chica dulce era Blancanieves.",
    dialogue: "Qué encantadora muchacha. Puede quedarse con nosotros.",
    speaker: "Enanos",
    image: "/blancanieves%20durmiendo.jpg",
    gradient: "from-cyan-100 via-teal-200 to-emerald-300",
    effect: "none",
  },
  {
    id: 8,
    title: "La manzana envenenada",
    narration:
      "Pero un día la Reina se enteró de que Blancanieves seguía viva y, disfrazándose, se convirtió en una anciana y le ofreció una manzana envenenada.",
    dialogue: "Toma esta manzana. Es un regalo para ti.",
    speaker: "Reina disfrazada",
    image: "/blancanieves%20recibiendo%20la%20manzana.jpg",
    gradient: "from-red-100 via-rose-300 to-red-500",
    effect: "none",
  },
  {
    id: 9,
    title: "Urna de cristal",
    narration:
      "Cuando la encontraron tirada en el suelo, sus amigos los enanitos no sabían qué hacer. Con gran tristeza, la colocaron en una urna de cristal esperando su despertar.",
    dialogue: "No perderemos la esperanza.",
    speaker: "Narrador",
    image: "/blancanievees dentro ataúd.jpg",
    gradient: "from-slate-100 via-blue-200 to-slate-400",
    effect: "none",
  },
  {
    id: 10,
    title: "Final feliz",
    narration:
      "Blancanieves regresó para gobernar con la bondad que aprendió en el bosque y la fuerza de quien ha vencido al miedo. El Príncipe no fue su salvador, sino su mejor aliado, y juntos demostraron que el amor más fuerte es el que nace de la admiración y el respeto mutuo.",
    dialogue: "Y vivieron felices para siempre.",
    speaker: "Narrador",
    image: "/blancanieves carruaje.jpg",
    gradient: "from-pink-100 via-fuchsia-200 to-rose-300",
    effect: "none",
  },
];
