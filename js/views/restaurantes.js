function restaurantCardHTML(r) {
  return `
    <article class="card restaurant-card">
      <div class="restaurant-main">
        <h2>${r.name}</h2>
        <p class="muted restaurant-zone">${r.zone}</p>
        <p class="restaurant-desc">${r.desc}</p>
        <div class="stat-row">
          <span class="stat-box">⭐ ${r.rating}</span>
          <span class="stat-box">${r.priceLevel}</span>
          <span class="stat-box">🚗 ${r.travelTime}</span>
        </div>
      </div>
      <a class="restaurant-arrow" href="${r.mapsUrl}" target="_blank" rel="noopener" aria-label="Ver en Google Maps">›</a>
    </article>`;
}

function renderRestaurantes(root) {
  root.innerHTML = RESTAURANTS.map(restaurantCardHTML).join("");
}
