# Spec: App de viaje a Pamplona (PWA)

## Contexto general
App personal para un viaje en familia a Pamplona (Navarra), del **3 al 11 de agosto** (8 noches), en coche desde Murcia.
Grupo: **4 adultos + 2 niños de 6 años** (los niños solo cuentan para ocupación de la casa y reservas de restaurante, no para gastos).

Alojamiento: **Casa Rural Gure Txokoa**, Calle Santo Tomás 3, 31172 Ollo (Navarra), a ~30 min de Pamplona. Capacidad 8 personas, garaje incluido.

## Objetivo técnico
Construir una **PWA** (Progressive Web App), sin backend, para desplegar en GitHub Pages o Vercel y añadir a pantalla de inicio en los móviles de los 4 adultos. Repositorio en GitHub.

## Modelo de datos y permisos

- **Sin backend, sin autenticación real.** Todo el estado vive en `localStorage` del dispositivo.
- **Selector de perfil** al abrir la app por primera vez: 4 botones (admin + 3 acompañantes). Se guarda la elección en `localStorage` de ese dispositivo. Botón de "cambiar perfil" en ajustes por si se necesita.
- **Admin (yo)**: único que edita contenido común — Calendario, Actividades, Restaurantes, Compra, Gastos.
- **Los 3 acompañantes**: solo lectura en todo lo común. Edición únicamente en su propio Equipaje (privado por perfil, no compartido, no sincronizado entre dispositivos).
- Los datos comunes (itinerario, restaurantes, compra, etc.) se guardan también en `localStorage`, pero conceptualmente son "de solo admin" — no hay sincronización real entre los 4 móviles; cada uno tiene su copia local y el admin es quien la mantiene actualizada manualmente en su propio dispositivo. (Nota: si en el futuro se quiere sincronización real entre dispositivos, haría falta backend — descartado para esta v1 a propósito).

## Navegación

1. **Home**
2. **Calendario**
3. **Actividades**
4. **Restaurantes**
5. **Compra**
6. **Equipaje**
7. **Gastos**
8. **+Info**
9. **Botón fijo en el menú**: abre Google Maps directamente en la ubicación de la casa (link tipo `https://www.google.com/maps/search/?api=1&query=LAT,LNG`)

---

## 1. Home

Resumen del día actual (basado en la fecha real del dispositivo, si está dentro del rango 3-11 agosto):
- Actividad de la mañana
- Actividad de la tarde
- Dónde se come
- Dónde se cena
- Clima del día (temperatura y icono simple, no el detalle por horas) — vía Open-Meteo (sin API key)
- Vista rápida del calendario: solo "hoy" + próximo evento (no el mes completo)

Si la fecha del dispositivo está fuera del rango del viaje, mostrar un estado neutro (ej. "el viaje empieza el 3 de agosto" o "el viaje ha terminado").

## 2. Calendario

Vista completa de los 8 días (3-11 agosto). Por cada día: entrada/salida de la casa (día 3 = entrada, día 11 = salida) + actividades programadas ese día. Editable solo por admin.

## 3. Actividades

**Formato**: one-page con scroll vertical, tarjetas de actividad (no filtro, con solo 8 no hace falta).

Cada tarjeta contiene:
- Foto (ver carpeta `/assets/actividades/` — 8 fotos ya generadas, una por actividad)
- Nombre + Zona
- Tags: niño friendly (sí/no), distancia/tiempo desde la casa, precio aproximado, si necesita reserva, tipo de actividad
- Descripción breve
- Al hacer tap/click: expande a descripción detallada + botón directo a Google Maps con la ubicación real

**Pool de 8 actividades** (datos completos):

| Zona | Actividad | Distancia/Tiempo | Precio aprox. | Reserva | Niño friendly | Tipo | Descripción breve | Descripción detallada |
|---|---|---|---|---|---|---|---|---|
| Ollo (a pie) | Granja Escuela Gure Sustraiak | 500m / <5 min | Variable (aperitivo o menú completo) | Sí, solo fines de semana | Sí | Granja / gastronomía | Cuidar y alimentar animales de granja | Visita a cabras, conejos, burros, cerdos, ovejas y patos, con opción de aperitivo (txistorra/croqueta) o comida completa (alubias y txuletón para adultos, macarrones con lomo para niños). Proyecto social sin ánimo de lucro, a 500m de la casa. |
| Valle de Yerri / Tierras de Iranzu | Quesería Aldaia (Lezáun) | ~15km / 20-25 min | Consultar (incluye posible comida en borda) | Sí | Sí | Rural / gastronomía | Ver el rebaño y aprender a hacer queso | Visita guiada a la cuadra para ver el rebaño de 400 ovejas latxas y su manejo, seguida de la visita a la quesería para conocer el proceso de elaboración del queso Idiazabal. Opción de comer después en la borda de montaña. 4.8★. |
| Valle de Yerri / Tierras de Iranzu | Safari Casta Navarra (Grocín) | ~20km / 25-30 min | 40€ adulto / 20€ niño (3-11) | Sí, grupos (se unen a otros) | Sí | Naturaleza / ganadería | Ver toros bravos en su hábitat desde un 4x4 | Recepción con vídeo explicativo, visita a instalaciones, aperitivo con productos locales y safari en 4x4 o a pie por la finca viendo ganado bravo en libertad. ~3 horas. Grupos pequeños se unen a otros para completar plazas. |
| Valle de Yerri / Tierras de Iranzu | Embalse de Alloz (Lerate) | ~17km / ~25 min | Baño gratis; kayak doble 12€/hora | Aparcamiento con reserva en temporada alta | Sí | Acuática | Playa de pantano con kayak y baño | Zona de baño con aguas turquesas de calidad excelente, apta mayo-septiembre. Alquiler de kayak doble con chalecos y remos en la playa de Lerate; también hidropedales y vela. |
| Pamplona y alrededores | Parque del Tren (Trinitarios) | ~17,5km / ~25 min | 3€ adulto / 2€ niño | No | Sí | Ocio familiar | Paseo en tren de vapor en miniatura | Recorrido en "minitren" con vagones y locomotora de vapor por circuito con túneles, puentes y taludes. Abre fines de semana. |
| Pamplona y alrededores | Planetario (Yamaguchi) | ~18km / ~25-28 min | ~6€ | Recomendable | Sí (más educativo) | Cultural / educativo | Sesión sobre el universo en cúpula | Proyección en cúpula sobre astronomía, en el parque japonés Yamaguchi. Ojo: el idioma de la sesión varía según el día, comprobar antes de reservar. |
| Pamplona y alrededores | Discover Bricks (Legoteca) | ~19km / ~25 min | Consultar (por sesión) | Sí | Sí, todas las edades (<4 acompañados) | Ocio interior | Mesa libre de piezas de Lego | Mesas con piezas y accesorios de Lego para construir libremente. Horario reducido, revisar disponibilidad. |
| Norte (excepción de distancia) | Bertiz Aventura Park (Narbarte) | ~34km / ~45-50 min | Consultar | Sí | Sí, desde 3-4 años | Aventura / arborismo | Circuitos de tirolina entre árboles | Circuitos de arborismo con distintos niveles según edad; adultos y niños hacen la misma actividad. Mantenida como excepción pese a superar los 35 min habituales. |

## 4. Restaurantes

Lista curada, editable solo por admin. Cada entrada: nombre, zona, breve descripción, link a Google Maps.

- **Restaurante Gure Sustraiak** (Ollo) — proyecto social con huerto propio, solo fines de semana 11:00-18:30
- **Posada de Ollo** — pintxos y menú casero, en el propio pueblo
- **Restaurante Baserriberri** (Pamplona, C. San Nicolás 32) — gama alta, cocina vasca moderna
- **Asador Katuzarra** (Pamplona, C. San Nicolás 34-36) — pintxos, buena relación calidad-precio
- **Iruñazarra** (Pamplona, C. Mercaderes 15) — clásico de pintxos
- **La Olla** (Pamplona, Av. Roncesvalles 2) — algo más caro, muy bien valorado
- **Restaurante Arostegui** (Pamplona, C. Juan de Labrit 19) — cocina navarra de calidad, conviene reservar

## 5. Compra

Lista de la compra simple, editable solo por admin. Añadir/marcar como comprado/eliminar. Sin categorías complejas, solo lista plana.

Supermercados de referencia (para info, no forman parte de la lógica de la lista): Carrefour y Mercadona en Pamplona/Barañáin.

## 6. Equipaje

Checklist privado por perfil (cada uno el suyo, no compartido). Añadir/marcar/eliminar ítems. Guardado en `localStorage` bajo una clave por perfil (ej. `equipaje_admin`, `equipaje_acompanante1`, etc.).

## 7. Gastos

Llevado únicamente por el admin. Registro simple de gastos: quién pagó, cuánto, concepto. Cálculo local (JavaScript, sin API ni LLM) del reparto entre los **4 adultos** (los niños no cuentan para el reparto). Al final, mostrar "quién debe a quién" de forma resumida.

## 8. +Info

Sección única que agrupa:
- **Fechas**: entrada 3 agosto, salida 11 agosto
- **Ubicación de la casa**: Calle Santo Tomás 3, 31172 Ollo, Navarra + botón a Maps
- **Teléfonos de interés**: placeholder por ahora (ej. "Propietaria: [pendiente]", "Emergencias: 112") — estructura preparada para rellenar más adelante
- **WiFi**: campo vacío/placeholder, pendiente de rellenar cuando se tenga el dato

## Decisiones técnicas confirmadas

- **PWA**, no app nativa. Manifest + service worker básico para poder "añadir a pantalla de inicio" y tener caché offline de lo esencial (todo excepto clima).
- **Sin backend, sin autenticación real.**
- **Clima**: Open-Meteo API (gratuita, sin key), es la única sección que requiere conexión a internet.
- **Gastos**: lógica 100% local en JavaScript, sin llamadas a ningún LLM ni API externa para el cálculo.
- **Imágenes de actividades**: 8 fotos ya generadas (estilo documental, sin caras visibles), a incluir en `/assets/actividades/` del repo.
- Repositorio en GitHub, despliegue en GitHub Pages o Vercel (a decidir según preferencia al montar el repo).

## Fuera de alcance para esta v1 (explícitamente descartado)

- Sincronización en tiempo real entre dispositivos
- Notificaciones push
- Login/autenticación real
- Integración con Splitwise real u otras APIs de terceros para gastos
- Sección de notas rápidas
- Filtros en la página de Actividades
