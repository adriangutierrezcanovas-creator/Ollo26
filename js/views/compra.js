const COMPRA_KEY = "viaje_compra";

function newItemId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}

function compraItemHTML(item, isAdmin) {
  return `
    <li class="compra-item${item.done ? " done" : ""}" data-id="${item.id}">
      <label class="compra-check">
        <input type="checkbox" ${item.done ? "checked" : ""} ${isAdmin ? "" : "disabled"} />
        <span>${item.text}</span>
      </label>
      ${isAdmin ? `<button class="compra-delete" aria-label="Eliminar">✕</button>` : ""}
    </li>`;
}

function renderCompra(root) {
  const isAdmin = Profile.isAdmin();
  const items = Storage.get(COMPRA_KEY, []);

  const addFormHTML = isAdmin
    ? `<form id="compra-add-form" class="compra-add-form">
        <input type="text" id="compra-input" placeholder="Añadir producto…" autocomplete="off" />
        <button type="submit" class="btn-accent">Añadir</button>
      </form>`
    : "";

  const listHTML = items.length
    ? `<ul class="compra-list">${items.map((i) => compraItemHTML(i, isAdmin)).join("")}</ul>`
    : `<p class="muted">Lista vacía.</p>`;

  root.innerHTML = `
    <section class="card">
      <h2>Lista de la compra</h2>
      ${addFormHTML}
      ${listHTML}
    </section>
    <p class="muted compra-note">Supermercados de referencia: Carrefour y Mercadona (Pamplona/Barañáin).</p>
  `;

  if (!isAdmin) return;

  document.getElementById("compra-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("compra-input");
    const text = input.value.trim();
    if (!text) return;
    const current = Storage.get(COMPRA_KEY, []);
    current.push({ id: newItemId(), text, done: false });
    Storage.set(COMPRA_KEY, current);
    renderCompra(root);
  });

  root.querySelectorAll(".compra-item").forEach((li) => {
    const id = li.dataset.id;

    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      li.classList.toggle("done", e.target.checked);
      const current = Storage.get(COMPRA_KEY, []);
      const item = current.find((i) => i.id === id);
      if (item) item.done = e.target.checked;
      Storage.set(COMPRA_KEY, current);
    });

    li.querySelector(".compra-delete").addEventListener("click", () => {
      const current = Storage.get(COMPRA_KEY, []).filter((i) => i.id !== id);
      Storage.set(COMPRA_KEY, current);
      renderCompra(root);
    });
  });
}
