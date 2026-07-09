const CALENDARIO_KEY = "viaje_calendario";
const CUSTOM_VALUE = "__custom__";

const DAY_FIELDS = [
  { field: "morning", label: "Mañana", icon: "☀️", list: ACTIVITIES },
  { field: "lunch", label: "Comida", icon: "🍞", list: RESTAURANTS },
  { field: "afternoon", label: "Tarde", icon: "☕", list: ACTIVITIES },
  { field: "dinner", label: "Cena", icon: "🐟", list: RESTAURANTS },
];

function getAllTripDates() {
  const dates = [];
  let d = new Date(TRIP.start);
  const end = new Date(TRIP.end);
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function buildOptions(list, selectedId, emptyLabel, customLabel) {
  const options = [`<option value="">${emptyLabel}</option>`];
  list.forEach((item) => {
    const selected = item.id === selectedId ? " selected" : "";
    options.push(`<option value="${item.id}"${selected}>${item.name}</option>`);
  });
  const customSelected = selectedId === CUSTOM_VALUE ? " selected" : "";
  options.push(`<option value="${CUSTOM_VALUE}"${customSelected}>${customLabel}</option>`);
  return options.join("");
}

function isActivityField(field) {
  return field === "morning" || field === "afternoon";
}

function customLabelFor(field) {
  return isActivityField(field) ? "Otra actividad" : "Otro (comemos en casa)";
}

function fieldPreviewHTML(field, selectedId) {
  if (isActivityField(field)) {
    const a = selectedId && ACTIVITIES.find((x) => x.id === selectedId);
    if (!a) return `<div class="field-preview empty">Sin plan</div>`;
    return `
      <div class="field-preview filled">
        <img class="field-preview-thumb" src="${a.photo}" alt="" />
        <div class="field-preview-info">
          <span class="field-preview-title">${a.name}</span>
          <span class="field-preview-meta">${a.distance}</span>
        </div>
      </div>`;
  }
  const r = selectedId && RESTAURANTS.find((x) => x.id === selectedId);
  if (!r) return `<div class="field-preview empty">Sin plan</div>`;
  return `
    <div class="field-preview filled">
      <div class="field-preview-info">
        <span class="field-preview-title">${r.name}</span>
        <div class="field-preview-stats">
          <span class="stat-box">⭐ ${r.rating}</span>
          <span class="stat-box">${r.priceLevel}</span>
          <span class="stat-box">🚗 ${r.travelTime}</span>
        </div>
      </div>
    </div>`;
}

function customTextPreviewHTML(note) {
  const text = (note || "").trim();
  if (!text) return `<div class="field-preview empty">Sin plan</div>`;
  return `
    <div class="field-preview filled">
      <div class="field-preview-info">
        <span class="field-preview-title">${text}</span>
      </div>
    </div>`;
}

// Cada campo del calendario muestra como máximo 2 cajas:
// - Sin plan / actividad-restaurante elegidos: <select> + tarjeta de preview.
// - Texto libre ("otra actividad" / comemos en casa): <select> oculto + input de texto
//   (con botón de cambiar). Nunca las dos previas + el input a la vez.
function dayFieldHTML(dateISO, def, entry, isAdmin) {
  const { field, label, icon, list } = def;
  const selectedId = entry[field] || "";
  const note = entry[field + "Note"] || "";
  const isCustom = selectedId === CUSTOM_VALUE;

  if (!isAdmin) {
    const preview = isCustom ? customTextPreviewHTML(note) : fieldPreviewHTML(field, selectedId || null);
    return `
      <div class="day-field" data-date="${dateISO}" data-field="${field}">
        <span class="home-label">${icon} ${label}</span>
        ${preview}
      </div>`;
  }

  return `
    <div class="day-field" data-date="${dateISO}" data-field="${field}">
      <span class="home-label">${icon} ${label}</span>
      <select class="day-select" data-date="${dateISO}" data-field="${field}"${isCustom ? ' style="display:none"' : ""}>
        ${buildOptions(list, selectedId, "Sin plan", customLabelFor(field))}
      </select>
      <div class="day-custom-wrap"${isCustom ? "" : ' style="display:none"'}>
        <input
          type="text"
          class="day-custom-input"
          data-date="${dateISO}"
          data-field="${field}"
          placeholder="¿Qué toca?"
          value="${note.replace(/"/g, "&quot;")}"
        />
        <button type="button" class="day-custom-clear" data-date="${dateISO}" data-field="${field}" aria-label="Cambiar">✕</button>
      </div>
      ${isCustom ? "" : fieldPreviewHTML(field, selectedId || null)}
    </div>`;
}

function refreshDayField(root, dateISO, field) {
  const def = DAY_FIELDS.find((f) => f.field === field);
  const container = root.querySelector(`.day-field[data-date="${dateISO}"][data-field="${field}"]`);
  if (!def || !container) return;
  const entry = Storage.get(CALENDARIO_KEY, {})[dateISO] || {};
  const wrapper = document.createElement("div");
  wrapper.innerHTML = dayFieldHTML(dateISO, def, entry, true).trim();
  const newNode = wrapper.firstElementChild;
  container.replaceWith(newNode);
  bindDayField(root, newNode);
}

function bindDayField(root, scope) {
  scope.querySelectorAll(".day-select").forEach((select) => {
    select.addEventListener("change", () => {
      const { date, field } = select.dataset;
      const current = Storage.get(CALENDARIO_KEY, {});
      if (!current[date]) current[date] = {};
      current[date][field] = select.value || null;
      if (select.value !== CUSTOM_VALUE) current[date][field + "Note"] = "";
      Storage.set(CALENDARIO_KEY, current);
      refreshDayField(root, date, field);
    });
  });

  scope.querySelectorAll(".day-custom-input").forEach((input) => {
    input.addEventListener("input", () => {
      const { date, field } = input.dataset;
      const current = Storage.get(CALENDARIO_KEY, {});
      if (!current[date]) current[date] = {};
      current[date][field + "Note"] = input.value;
      Storage.set(CALENDARIO_KEY, current);
    });
  });

  scope.querySelectorAll(".day-custom-clear").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { date, field } = btn.dataset;
      const current = Storage.get(CALENDARIO_KEY, {});
      if (!current[date]) current[date] = {};
      current[date][field] = null;
      current[date][field + "Note"] = "";
      Storage.set(CALENDARIO_KEY, current);
      refreshDayField(root, date, field);
    });
  });
}

function tripDayLabel(dateISO, totalDays) {
  const dayNum = Math.round((new Date(dateISO) - new Date(TRIP.start)) / 86400000) + 1;
  return `Día ${dayNum} de ${totalDays}`;
}

function dayCardHTML(dateISO, entry, isAdmin, totalDays) {
  const d = new Date(dateISO);
  const weekdayFull = WEEKDAY_LABEL[d.getDay()];
  const badges = [];
  if (dateISO === TRIP.start) badges.push(`<span class="day-badge">Entrada</span>`);
  if (dateISO === TRIP.end) badges.push(`<span class="day-badge">Salida</span>`);
  if (dateISO === todayISO()) badges.push(`<span class="day-badge day-badge-today">Hoy</span>`);

  const fieldsHTML = DAY_FIELDS.map((def) => dayFieldHTML(dateISO, def, entry, isAdmin)).join("");

  return `
    <section class="card day-card">
      <div class="day-header">
        <div class="calendar-box">
          <span class="calendar-box-day">${d.getDate()}</span>
          <span class="calendar-box-weekday">${weekdayFull}</span>
        </div>
        <div class="day-header-extra">
          <div class="day-weather" id="weather-${dateISO}">
            <span class="muted">🌡️</span>
          </div>
          <span class="day-trip-count muted">${tripDayLabel(dateISO, totalDays)}</span>
          ${badges.length ? `<div class="day-badges">${badges.join("")}</div>` : ""}
        </div>
      </div>
      <div class="home-grid">${fieldsHTML}</div>
    </section>`;
}

async function shareCalendario() {
  const data = Storage.get(CALENDARIO_KEY, {});
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url = `${location.origin}${location.pathname}?sync=calendario.${encoded}`;
  const shareText = "Calendario actualizado del viaje a Pamplona 🧡";

  if (navigator.share) {
    try {
      await navigator.share({ title: "Calendario del viaje", text: shareText, url });
      return;
    } catch (e) {
      return; // el usuario canceló el share nativo, no hace falta fallback
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast("Enlace copiado. Pégalo en WhatsApp para compartirlo.");
  } catch (e) {
    prompt("Copia este enlace y compártelo:", url);
  }
}

function renderCalendario(root) {
  const isAdmin = Profile.isAdmin();
  const calendario = Storage.get(CALENDARIO_KEY, {});
  const dates = getAllTripDates();

  const shareHTML = isAdmin
    ? `<div class="calendario-share">
        <button id="share-calendario-btn" class="btn-accent">📤 Compartir calendario</button>
      </div>`
    : "";

  root.innerHTML = shareHTML + dates.map((date) => dayCardHTML(date, calendario[date] || {}, isAdmin, dates.length)).join("");

  dates.forEach((date) => {
    fetchWeather(date)
      .then((w) => {
        const el = document.getElementById(`weather-${date}`);
        if (el) el.innerHTML = `<span class="weather-icon-sm">${weatherIcon(w.code)}</span>${w.max}°/${w.min}°`;
      })
      .catch(() => {
        const el = document.getElementById(`weather-${date}`);
        if (el) el.innerHTML = `<span class="muted">—</span>`;
      });
  });

  if (!isAdmin) return;

  document.getElementById("share-calendario-btn").addEventListener("click", shareCalendario);
  bindDayField(root, root);
}
