function equipajeItemHTML(item) {
  return `
    <li class="compra-item${item.done ? " done" : ""}" data-id="${item.id}">
      <label class="compra-check">
        <input type="checkbox" ${item.done ? "checked" : ""} />
        <span>${item.text}</span>
      </label>
      <button class="compra-delete" aria-label="Eliminar">✕</button>
    </li>`;
}

function renderEquipaje(root) {
  const profile = Profile.get();
  if (!profile) {
    root.innerHTML = `<section class="card center-card"><p class="muted">Elige un perfil primero.</p></section>`;
    return;
  }

  const key = `equipaje_${profile.id}`;
  const items = Storage.get(key, []);

  const listHTML = items.length
    ? `<ul class="compra-list">${items.map(equipajeItemHTML).join("")}</ul>`
    : `<p class="muted">Lista vacía.</p>`;

  root.innerHTML = `
    <section class="card">
      <h2>Equipaje de ${profile.label}</h2>
      <p class="muted">Solo tú ves esta lista, no se comparte con el resto.</p>
      <form id="equipaje-add-form" class="compra-add-form">
        <input type="text" id="equipaje-input" placeholder="Añadir a la maleta…" autocomplete="off" />
        <button type="submit" class="btn-accent">Añadir</button>
      </form>
      ${listHTML}
    </section>
  `;

  document.getElementById("equipaje-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("equipaje-input");
    const text = input.value.trim();
    if (!text) return;
    const current = Storage.get(key, []);
    current.push({ id: newItemId(), text, done: false });
    Storage.set(key, current);
    renderEquipaje(root);
  });

  root.querySelectorAll(".compra-item").forEach((li) => {
    const id = li.dataset.id;

    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      li.classList.toggle("done", e.target.checked);
      const current = Storage.get(key, []);
      const item = current.find((i) => i.id === id);
      if (item) item.done = e.target.checked;
      Storage.set(key, current);
    });

    li.querySelector(".compra-delete").addEventListener("click", () => {
      const current = Storage.get(key, []).filter((i) => i.id !== id);
      Storage.set(key, current);
      renderEquipaje(root);
    });
  });
}
