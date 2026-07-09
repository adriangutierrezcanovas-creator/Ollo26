let expandedActivityId = null;

function activityTagsHTML(a) {
  return `
    <span class="tag">${a.kidFriendly ? "👶 Niño friendly" : "🚫 No niño friendly"}</span>
    <span class="tag">📍 ${a.distance}</span>
    <span class="tag">💶 ${a.price}</span>
    <span class="tag">📅 ${a.reservation}</span>
    <span class="tag">🏷️ ${a.type}</span>
  `;
}

function activityCardHTML(a, expanded) {
  return `
    <article class="activity-card" data-id="${a.id}">
      <img class="activity-photo" src="${a.photo}" alt="${a.name}" loading="lazy" />
      <div class="activity-body">
        <div class="activity-head">
          <div>
            <h2>${a.name}</h2>
            <p class="muted activity-zone">${a.zone}</p>
          </div>
          <span class="expand-chevron">${expanded ? "▲" : "▼"}</span>
        </div>
        <div class="tag-row">${activityTagsHTML(a)}</div>
        <p class="activity-desc">${a.shortDesc}</p>
        ${expanded ? `
          <p class="activity-long-desc">${a.longDesc}</p>
          <a class="link-btn" href="${a.mapsUrl}" target="_blank" rel="noopener">Ver en Google Maps →</a>
        ` : ""}
      </div>
    </article>`;
}

function renderActividades(root) {
  root.innerHTML = `<div class="activities-list">${
    ACTIVITIES.map((a) => activityCardHTML(a, a.id === expandedActivityId)).join("")
  }</div>`;

  root.querySelectorAll(".activity-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const id = card.dataset.id;
      expandedActivityId = expandedActivityId === id ? null : id;
      renderActividades(root);
    });
  });
}
