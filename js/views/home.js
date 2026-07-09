// Coordenadas aproximadas de Ollo (Navarra) — suficiente para una previsión general del tiempo.
const HOUSE_COORDS = { lat: 42.77, lon: -1.85 };

const WEEKDAY_LABEL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function getDayEntry(dateISO) {
  const calendario = Storage.get("viaje_calendario", {});
  return calendario[dateISO] || null;
}

function findActivity(id) {
  return ACTIVITIES.find((a) => a.id === id) || null;
}
function findRestaurant(id) {
  return RESTAURANTS.find((r) => r.id === id) || null;
}

function weatherIcon(code) {
  // Códigos WMO simplificados (Open-Meteo)
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

async function fetchWeather(dateISO) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${HOUSE_COORDS.lat}&longitude=${HOUSE_COORDS.lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${dateISO}&end_date=${dateISO}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather request failed");
  const data = await res.json();
  return {
    max: Math.round(data.daily.temperature_2m_max[0]),
    min: Math.round(data.daily.temperature_2m_min[0]),
    code: data.daily.weathercode[0],
  };
}

function homeRowHTML(icon, label, field, entry, isActivity) {
  const id = entry[field];
  const note = entry[field + "Note"] || "";
  const labelHTML = `<span class="home-row-label">${icon} ${label}</span>`;

  if (!id) {
    return `
      <div class="home-row">
        ${labelHTML}
        <div class="home-row-placeholder">Sin plan</div>
      </div>`;
  }

  if (id === "__custom__") {
    return `
      <div class="home-row">
        ${labelHTML}
        <div class="home-row-custom">${note.trim() || "Sin especificar"}</div>
      </div>`;
  }

  if (isActivity) {
    const a = findActivity(id);
    if (!a) return homeRowHTML(icon, label, field, {}, isActivity);
    return `
      <div class="home-row">
        ${labelHTML}
        <a class="home-row-card" href="${a.mapsUrl}" target="_blank" rel="noopener">
          <div class="home-row-main">
            <img class="home-row-thumb" src="${a.photo}" alt="" />
            <div class="home-row-info">
              <span class="home-row-title">${a.name}</span>
              <span class="home-row-meta">${a.distance}</span>
            </div>
          </div>
          <span class="home-row-arrow">›</span>
        </a>
      </div>`;
  }

  const r = findRestaurant(id);
  if (!r) return homeRowHTML(icon, label, field, {}, isActivity);
  return `
    <div class="home-row">
      ${labelHTML}
      <a class="home-row-card" href="${r.mapsUrl}" target="_blank" rel="noopener">
        <div class="home-row-main">
          <div class="home-row-info">
            <span class="home-row-title">${r.name}</span>
            <div class="home-row-stats">
              <span class="stat-box">⭐ ${r.rating}</span>
              <span class="stat-box">${r.priceLevel}</span>
              <span class="stat-box">🚗 ${r.travelTime}</span>
            </div>
          </div>
        </div>
        <span class="home-row-arrow">›</span>
      </a>
    </div>`;
}

function renderHome(root) {
  const start = TRIP.start;
  const end = TRIP.end;
  const today = todayISO();

  if (today < start) {
    root.innerHTML = `
      <section class="card center-card">
        <h2>El viaje empieza el 3 de agosto</h2>
        <p class="muted">Quedan ${Math.ceil((new Date(start) - new Date(today)) / 86400000)} días.</p>
      </section>`;
    return;
  }
  if (today > end) {
    root.innerHTML = `
      <section class="card center-card">
        <h2>El viaje ha terminado</h2>
        <p class="muted">Esperamos que lo disfrutarais 🎒</p>
      </section>`;
    return;
  }

  const entry = getDayEntry(today) || {};
  const d = new Date(today);
  const weekdayFull = WEEKDAY_LABEL[d.getDay()];
  const totalDays = getAllTripDates().length;

  const rows = [
    homeRowHTML("☀️", "Mañana", "morning", entry, true),
    homeRowHTML("🍞", "Comida", "lunch", entry, false),
    homeRowHTML("☕", "Tarde", "afternoon", entry, true),
    homeRowHTML("🐟", "Cena", "dinner", entry, false),
  ].join("");

  root.innerHTML = `
    <section class="card home-today-card">
      <div class="day-header">
        <div class="calendar-box">
          <span class="calendar-box-day">${d.getDate()}</span>
          <span class="calendar-box-weekday">${weekdayFull}</span>
        </div>
        <div class="day-header-extra">
          <div class="day-weather" id="home-weather">
            <span class="muted">🌡️</span>
          </div>
          <span class="day-trip-count muted">${tripDayLabel(today, totalDays)}</span>
        </div>
      </div>
      <div class="home-rows">${rows}</div>
    </section>
  `;

  fetchWeather(today)
    .then((w) => {
      const el = document.getElementById("home-weather");
      if (el) el.innerHTML = `<span class="weather-icon-sm">${weatherIcon(w.code)}</span>${w.max}°/${w.min}°`;
    })
    .catch(() => {
      const el = document.getElementById("home-weather");
      if (el) el.innerHTML = `<span class="muted">—</span>`;
    });
}
