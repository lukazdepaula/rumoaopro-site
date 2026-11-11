// Public, illustrative previews. No athlete records or paid workout prescriptions.
export const homeProgramScenes = [
  {
    name: "In-Season Pro", shortName: "In-Season Pro", number: 28, unit: ["semanas", "weeks"],
    focus: ["Performance entre jogos", "Performance between matches"],
    title: ["A temporada segue.", "The season goes on."], accent: ["Preparo em dia.", "Stay prepared."],
    description: ["Organize o trabalho de força e potência ao longo da temporada, dentro do RaptorPro.", "Organize strength and power work throughout the season, inside RaptorPro."],
    image: "/assets/programs/in-season/in-season-pro-cover-v2.png",
    poster: "/assets/home/motion-2026-10/field-poster.jpg", video: "/assets/home/motion-2026-10/field-loop.mp4",
    href: ["/programas/elanga-in-season", "/en/programs/elanga-in-season"],
    session: ["Força durante a temporada", "In-season strength"], exercise: ["Agachamento", "Squat"],
    next: ["Potência e estabilidade", "Power and stability"], metric: ["Carga utilizada", "Load used"], value: "40", unitLabel: "kg", effort: false,
    sessionPhoto: "/assets/photos/lukaz-gym-instruction.jpg"
  },
  {
    name: "Power Pro", shortName: "Power Pro", number: 12, unit: ["semanas", "weeks"],
    focus: ["Força. Potência. Academia.", "Strength. Power. Gym."],
    title: ["Força na academia.", "Strength in the gym."], accent: ["Potência no jogo.", "Power in your game."],
    description: ["Um programa de academia para desenvolver força, potência e um físico mais atlético.", "A gym program to develop strength, power and a more athletic physique."],
    image: "/assets/programs/power-pro/power-pro-cover-v2.png",
    poster: "/assets/home/program-scenes-2026-11/power-poster.jpg", video: "/assets/home/program-scenes-2026-11/power-loop.mp4",
    href: ["/programas/power-pro", "/programas/power-pro"],
    session: ["Força de membros inferiores", "Lower-body strength"], exercise: ["Agachamento", "Squat"],
    next: ["Força de membros superiores", "Upper-body strength"], metric: ["Carga utilizada", "Load used"], value: "60", unitLabel: "kg", effort: false,
    sessionPhoto: "/assets/photos/lukaz-gym-coaching-wide.jpg"
  },
  {
    name: "Speed Pro", shortName: "Speed Pro", number: 12, unit: ["semanas", "weeks"],
    focus: ["Aceleração e velocidade", "Acceleration and speed"],
    title: ["Cada arrancada", "Every acceleration"], accent: ["começa no treino.", "starts in training."],
    description: ["Organize sua preparação de velocidade: campo, academia e progressão ao longo das semanas.", "Structure your speed preparation: pitch, gym and progression across the weeks."],
    image: "/assets/programs/project-36/project-36-cover.jpg",
    poster: "/assets/home/program-scenes-2026-11/speed-poster.jpg", video: "/assets/home/program-scenes-2026-11/speed-loop.mp4",
    href: ["/programas/projeto-36kmh", "/en/programs/project-36kmh"],
    session: ["Aceleração no campo", "Acceleration on the pitch"], exercise: ["Sprint de aceleração", "Acceleration sprint"],
    next: ["Força para acelerar", "Strength for acceleration"], metric: ["Como foi o esforço?", "How hard was the session?"], value: "6", unitLabel: "/ 10", effort: true,
    sessionPhoto: "/assets/photos/programs/programs-project36-sprint.jpg"
  },
  {
    name: "Offseason 30", shortName: "Offseason 30", number: 30, unit: ["dias", "days"],
    focus: ["Prepare a próxima temporada", "Prepare for the next season"],
    title: ["Próxima temporada.", "Your next season."], accent: ["Começa agora.", "Starts now."],
    description: ["Trinta dias de preparação organizada, com treinos de campo e academia no seu celular.", "Thirty days of structured preparation, with pitch and gym sessions on your phone."],
    image: "/assets/programs/offseason-30/offseason-30-raptorpro-cover.png",
    poster: "/assets/home/program-scenes-2026-11/offseason-poster.jpg", video: "/assets/home/program-scenes-2026-11/offseason-loop.mp4",
    href: ["/programas/offseason-30-days", "/en/programs/offseason-30-days"],
    session: ["Força e preparação geral", "Strength and general preparation"], exercise: ["Agachamento", "Squat"],
    next: ["Condicionamento no campo", "Pitch conditioning"], metric: ["Carga utilizada", "Load used"], value: "30", unitLabel: "kg", effort: false,
    sessionPhoto: "/assets/photos/programs/programs-gym-briefing.jpg"
  },
  {
    name: "De Volta aos Gramados", shortName: "DVG", number: 7, unit: ["fases", "phases"],
    focus: ["Pubalgia · retorno progressivo", "Pubalgia · return to play"],
    title: ["De volta ao campo.", "Back on the pitch."], accent: ["Uma fase de cada vez.", "One phase at a time."],
    description: ["Preparação física em sete fases para o retorno após pubalgia, com avaliação e liberação profissional.", "Seven-phase physical preparation for return to play after pubalgia, following professional assessment and clearance."],
    image: "/assets/programs/dvg/dvg-return-to-play-cover-v3.png",
    poster: "/assets/programs/dvg/dvg-return-to-play-cover-v3.png", video: "",
    href: ["/programas/de-volta-aos-gramados", "/en/programs/de-volta-aos-gramados"],
    session: ["Retorno progressivo ao treino", "Progressive return to training"], exercise: ["Controle e tolerância", "Control and tolerance"],
    next: ["Progressão por critérios", "Criteria-based progression"], metric: ["Como foi o esforço?", "How hard was the session?"], value: "6", unitLabel: "/ 10", effort: true,
    sessionPhoto: "/assets/photos/lukaz-field-coaching.jpg"
  }
] as const;
export type HomeProgramScene = typeof homeProgramScenes[number];
