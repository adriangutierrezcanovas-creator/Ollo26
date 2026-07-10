// Datos estáticos del viaje. Sin backend: esto es la única "fuente de verdad" de contenido fijo.
// Lo editable en runtime (calendario, compra, gastos, equipaje) vive en localStorage, ver storage.js.

const TRIP = {
  start: "2026-08-03",
  end: "2026-08-11",
  house: {
    name: "Casa Rural Gure Txokoa",
    address: "Calle Santo Tomás 3, 31172 Ollo, Navarra",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Casa Rural Gure Txokoa, Calle Santo Tomás 3, 31172 Ollo, Navarra"),
  },
};

const HOUSE_OWNER = {
  name: "Asun",
  phones: [
    { display: "(+34) 639 03 54 48", dial: "+34639035448", primary: true },
    { display: "(+34) 626 08 69 93", dial: "+34626086993", primary: false },
    { display: "(+34) 948 32 82 16", dial: "+34948328216", primary: false },
  ],
};

function mapsUrlFor(name, zone) {
  // La zona puede traer anotaciones entre paréntesis (p.ej. "Ollo (a pie)")
  // que no aportan nada a una búsqueda de Maps.
  const cleanZone = zone.replace(/\s*\([^)]*\)/g, "").trim();
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${name}, ${cleanZone}, Navarra`);
}

const ACTIVITIES = [
  {
    id: "granja-gure-sustraiak",
    zone: "Ollo (a pie)",
    name: "Granja Escuela Gure Sustraiak",
    distance: "500m / <5 min",
    price: "Variable (aperitivo o menú completo)",
    reservation: "Sí, solo fines de semana",
    kidFriendly: true,
    type: "Granja / gastronomía",
    shortDesc: "Cuidar y alimentar animales de granja",
    longDesc: "Visita a cabras, conejos, burros, cerdos, ovejas y patos, con opción de aperitivo (txistorra/croqueta) o comida completa (alubias y txuletón para adultos, macarrones con lomo para niños). Proyecto social sin ánimo de lucro, a 500m de la casa.",
    photo: "assets/actividades/Realistic-photo-of-a-rustic-countryside-farm-scene-in-Navarra-Spain-goats-and-s.jpg",
  },
  {
    id: "queseria-aldaia",
    zone: "Valle de Yerri / Tierras de Iranzu",
    name: "Quesería Aldaia (Lezáun)",
    distance: "~15km / 20-25 min",
    price: "Consultar (incluye posible comida en borda)",
    reservation: "Sí",
    kidFriendly: true,
    type: "Rural / gastronomía",
    shortDesc: "Ver el rebaño y aprender a hacer queso",
    longDesc: "Visita guiada a la cuadra para ver el rebaño de 400 ovejas latxas y su manejo, seguida de la visita a la quesería para conocer el proceso de elaboración del queso Idiazabal. Opción de comer después en la borda de montaña. 4.8★.",
    photo: "assets/actividades/Realistic-photo-of-an-artisan-cheese-making-workshop-wheels-of-sheep-cheese-agi.jpg",
  },
  {
    id: "safari-casta-navarra",
    zone: "Valle de Yerri / Tierras de Iranzu",
    name: "Safari Casta Navarra (Grocín)",
    distance: "~20km / 25-30 min",
    price: "40€ adulto / 20€ niño (3-11)",
    reservation: "Sí, grupos (se unen a otros)",
    kidFriendly: true,
    type: "Naturaleza / ganadería",
    shortDesc: "Ver toros bravos en su hábitat desde un 4x4",
    longDesc: "Recepción con vídeo explicativo, visita a instalaciones, aperitivo con productos locales y safari en 4x4 o a pie por la finca viendo ganado bravo en libertad. ~3 horas. Grupos pequeños se unen a otros para completar plazas.",
    photo: "assets/actividades/Realistic-photo-of-an-open-top-4x4-jeep-driving-through-a-lush-green-forest-trai.jpg",
  },
  {
    id: "embalse-alloz",
    zone: "Valle de Yerri / Tierras de Iranzu",
    name: "Embalse de Alloz (Lerate)",
    distance: "~17km / ~25 min",
    price: "Baño gratis; kayak doble 12€/hora",
    reservation: "Aparcamiento con reserva en temporada alta",
    kidFriendly: true,
    type: "Acuática",
    shortDesc: "Playa de pantano con kayak y baño",
    longDesc: "Zona de baño con aguas turquesas de calidad excelente, apta mayo-septiembre. Alquiler de kayak doble con chalecos y remos en la playa de Lerate; también hidropedales y vela.",
    photo: "assets/actividades/Realistic-photo-of-a-turquoise-reservoir-lake-with-a-wooden-kayak-resting-on-the.jpg",
  },
  {
    id: "parque-tren-trinitarios",
    zone: "Pamplona y alrededores",
    name: "Parque del Tren (Trinitarios)",
    distance: "~17,5km / ~25 min",
    price: "3€ adulto / 2€ niño",
    reservation: "No",
    kidFriendly: true,
    type: "Ocio familiar",
    shortDesc: "Paseo en tren de vapor en miniatura",
    longDesc: "Recorrido en \"minitren\" con vagones y locomotora de vapor por circuito con túneles, puentes y taludes. Abre fines de semana.",
    photo: "assets/actividades/Realistic-photo-of-a-small-vintage-miniature-steam-train-on-narrow-tracks-passin.jpg",
  },
  {
    id: "planetario-yamaguchi",
    zone: "Pamplona y alrededores",
    name: "Planetario (Yamaguchi)",
    distance: "~18km / ~25-28 min",
    price: "~6€",
    reservation: "Recomendable",
    kidFriendly: true,
    type: "Cultural / educativo",
    shortDesc: "Sesión sobre el universo en cúpula",
    longDesc: "Proyección en cúpula sobre astronomía, en el parque japonés Yamaguchi. Ojo: el idioma de la sesión varía según el día, comprobar antes de reservar.",
    photo: "assets/actividades/Realistic-photo-of-the-interior-of-a-planetarium-dome-theater-star-projections.jpg",
  },
  {
    id: "discover-bricks",
    zone: "Pamplona y alrededores",
    name: "Discover Bricks (Legoteca)",
    distance: "~19km / ~25 min",
    price: "Consultar (por sesión)",
    reservation: "Sí",
    kidFriendly: true,
    type: "Ocio interior",
    shortDesc: "Mesa libre de piezas de Lego",
    longDesc: "Mesas con piezas y accesorios de Lego para construir libremente. Horario reducido, revisar disponibilidad.",
    photo: "assets/actividades/Realistic-photo-of-a-wooden-table-covered-with-colorful-toy-building-bricks-clo.jpg",
  },
  {
    id: "bertiz-aventura-park",
    zone: "Norte (excepción de distancia)",
    name: "Bertiz Aventura Park (Narbarte)",
    distance: "~34km / ~45-50 min",
    price: "Consultar",
    reservation: "Sí",
    kidFriendly: true,
    type: "Aventura / arborismo",
    shortDesc: "Circuitos de tirolina entre árboles",
    longDesc: "Circuitos de arborismo con distintos niveles según edad; adultos y niños hacen la misma actividad. Mantenida como excepción pese a superar los 35 min habituales.",
    photo: "assets/actividades/Realistic-photo-of-a-zipline-cable-stretching-between-tall-pine-trees-in-a-fores.jpg",
  },
  {
    id: "cueva-mendukilo",
    zone: "Sierra de Aralar",
    name: "Cueva de Mendukilo (Astiz)",
    distance: "~12km / 20-25 min",
    price: "9€ adultos / 7€ niños (4-10 años) / gratis menores de 3 años",
    reservation: "Sí, obligatoria (grupos limitados, reservar por teléfono o web con antelación)",
    kidFriendly: true,
    type: "Naturaleza / cultural",
    shortDesc: "Visita guiada por una cueva subterránea con pasarelas",
    longDesc: "Visita guiada de una hora por la Cueva de Mendukilo, recorrido de 540m con pasarela flotante que desciende 40m bajo tierra, visitando tres salas con estalactitas, estalagmitas y formaciones kársticas. La temperatura interior es de 8-9ºC con humedad, así que hace falta ropa de abrigo y calzado cómodo. Muy valorada por familias, guías especialmente atentas con niños pequeños. Reserva obligatoria, grupos limitados.",
    photo: "assets/actividades/mendukilo.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=42.973906,-1.8968941",
  },
];

const RESTAURANTS = [
  {
    id: "gure-sustraiak",
    name: "Restaurante Gure Sustraiak",
    zone: "Ollo",
    desc: "Proyecto social con huerto propio, solo fines de semana 11:00-18:30",
    rating: 4.9,
    priceLevel: "€€",
    travelTime: "5 min",
  },
  {
    id: "posada-de-ollo",
    name: "Posada de Ollo",
    zone: "Ollo",
    desc: "Pintxos y menú casero, en el propio pueblo",
    rating: 4.9,
    priceLevel: "€€",
    travelTime: "2 min",
  },
  {
    id: "baserriberri",
    name: "Restaurante Baserriberri",
    zone: "Pamplona, C. San Nicolás 32",
    desc: "Gama alta, cocina vasca moderna",
    rating: 4.4,
    priceLevel: "€€€€",
    travelTime: "~25 min",
  },
  {
    id: "katuzarra",
    name: "Asador Katuzarra",
    zone: "Pamplona, C. San Nicolás 34-36",
    desc: "Pintxos, buena relación calidad-precio",
    rating: 4.3,
    priceLevel: "€€",
    travelTime: "~25 min",
  },
  {
    id: "irunazarra",
    name: "Iruñazarra",
    zone: "Pamplona, C. Mercaderes 15",
    desc: "Clásico de pintxos",
    rating: 4.4,
    priceLevel: "€€",
    travelTime: "~25 min",
  },
  {
    id: "la-olla",
    name: "La Olla",
    zone: "Pamplona, Av. Roncesvalles 2",
    desc: "Algo más caro, muy bien valorado",
    rating: 4.5,
    priceLevel: "€€€",
    travelTime: "~25 min",
  },
  {
    id: "arostegui",
    name: "Restaurante Arostegui",
    zone: "Pamplona, C. Juan de Labrit 19",
    desc: "Cocina navarra de calidad, conviene reservar",
    rating: 4.7,
    priceLevel: "€€€€",
    travelTime: "~25 min",
  },
];

RESTAURANTS.forEach((r) => { r.mapsUrl = mapsUrlFor(r.name, r.zone); });
ACTIVITIES.forEach((a) => { if (!a.mapsUrl) a.mapsUrl = mapsUrlFor(a.name, a.zone); });
