const INFO_KEY = "viaje_info";

function infoFieldHTML(key, label, value, placeholder, isAdmin) {
  if (isAdmin) {
    return `
      <div class="info-field">
        <span class="home-label">${label}</span>
        <input type="text" class="info-input" data-key="${key}" value="${value || ""}" placeholder="${placeholder}" />
      </div>`;
  }
  return `
    <div class="info-field">
      <span class="home-label">${label}</span>
      <span>${value ? value : `<span class="muted">${placeholder}</span>`}</span>
    </div>`;
}

function phoneButtonsHTML(phones) {
  return `
    <div class="phone-buttons">
      ${phones.map((p) => `
        <a class="phone-btn${p.primary ? " phone-btn-primary" : ""}" href="tel:${p.dial}">
          📞 ${p.display}
        </a>`).join("")}
    </div>`;
}

function renderInfo(root) {
  const isAdmin = Profile.isAdmin();
  const info = Storage.get(INFO_KEY, { wifiName: "", wifiPassword: "" });

  const startD = new Date(TRIP.start);
  const endD = new Date(TRIP.end);
  const startLabel = `${WEEKDAY_LABEL[startD.getDay()]} ${startD.getDate()} de agosto`;
  const endLabel = `${WEEKDAY_LABEL[endD.getDay()]} ${endD.getDate()} de agosto`;

  root.innerHTML = `
    <section class="card">
      <h2>Fechas</h2>
      <div class="home-grid">
        <div><span class="home-label">Entrada</span><span>${startLabel}</span></div>
        <div><span class="home-label">Salida</span><span>${endLabel}</span></div>
      </div>
    </section>

    <section class="card">
      <h2>Ubicación de la casa</h2>
      <p class="info-house-name">${TRIP.house.name}</p>
      <p class="muted">${TRIP.house.address}</p>
      <a class="link-btn" href="${TRIP.house.mapsUrl}" target="_blank" rel="noopener">Ver en Google Maps →</a>
    </section>

    <section class="card">
      <h2>Teléfonos de interés</h2>
      <div class="info-field">
        <span class="home-label">Emergencias</span>
        <span>112</span>
      </div>
      <div class="info-field">
        <span class="home-label">Propietaria de la casa — ${HOUSE_OWNER.name}</span>
        ${phoneButtonsHTML(HOUSE_OWNER.phones)}
      </div>
    </section>

    <section class="card">
      <h2>WiFi</h2>
      ${infoFieldHTML("wifiName", "Red", info.wifiName, "Pendiente", isAdmin)}
      ${infoFieldHTML("wifiPassword", "Contraseña", info.wifiPassword, "Pendiente", isAdmin)}
    </section>
  `;

  if (!isAdmin) return;

  root.querySelectorAll(".info-input").forEach((input) => {
    input.addEventListener("change", () => {
      const current = Storage.get(INFO_KEY, {});
      current[input.dataset.key] = input.value;
      Storage.set(INFO_KEY, current);
    });
  });
}
