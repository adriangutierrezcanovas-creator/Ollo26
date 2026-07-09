const ROUTES = [
  { path: "home", label: "Home", icon: "🏠", render: renderHome },
  { path: "calendario", label: "Calendario", icon: "📅", render: renderCalendario },
  { path: "actividades", label: "Actividades", icon: "🎡", render: renderActividades },
  { path: "restaurantes", label: "Restaurantes", icon: "🍽️", render: renderRestaurantes },
  { path: "compra", label: "Compra", icon: "🛒", render: renderCompra },
  { path: "equipaje", label: "Equipaje", icon: "🧳", render: renderEquipaje },
  { path: "gastos", label: "Gastos", icon: "💶", render: renderGastos },
  { path: "info", label: "+Info", icon: "ℹ️", render: renderInfo },
];

function currentRoutePath() {
  const hash = location.hash.replace(/^#\/?/, "");
  return hash || "home";
}

function renderDrawer() {
  const nav = document.getElementById("drawer-nav");
  const current = currentRoutePath();
  nav.innerHTML = ROUTES.map(
    (r) => `<a href="#/${r.path}" class="drawer-link${r.path === current ? " active" : ""}">
        <span class="drawer-icon">${r.icon}</span>${r.label}
      </a>`
  ).join("");
}

function setDrawerOpen(open) {
  document.getElementById("drawer").classList.toggle("open", open);
  document.getElementById("drawer-backdrop").classList.toggle("open", open);
}

function renderRoute() {
  const path = currentRoutePath();
  const route = ROUTES.find((r) => r.path === path) || ROUTES[0];
  document.getElementById("topbar-title").textContent = route.label;
  route.render(document.getElementById("view-root"));
  renderDrawer();
  setDrawerOpen(false);
  window.scrollTo(0, 0);
}

function renderProfileModal() {
  const modal = document.getElementById("profile-modal");
  const profile = Profile.get();
  if (profile) {
    modal.classList.remove("open");
    modal.innerHTML = "";
    return;
  }
  modal.classList.add("open");
  modal.innerHTML = `
    <div class="profile-modal-content">
      <h2>¿Quién eres?</h2>
      <p class="muted">Elige tu perfil para este dispositivo.</p>
      <div class="profile-grid">
        ${PROFILES.map((p) => `<button class="profile-btn" data-id="${p.id}">${p.label}${p.isAdmin ? " (admin)" : ""}</button>`).join("")}
      </div>
    </div>
  `;
  modal.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      Profile.set(btn.dataset.id);
      renderProfileModal();
    });
  });
}

function changeProfile() {
  Profile.clear();
  setDrawerOpen(false);
  renderProfileModal();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Sync sin backend: un enlace compartido (?sync=<clave>.<base64>) trae los datos
// codificados y, al abrirse, sobrescriben la copia local de esa clave.
function applyIncomingSync() {
  const params = new URLSearchParams(location.search);
  const sync = params.get("sync");
  if (!sync) return null;

  history.replaceState(null, "", location.pathname + location.hash);

  const separatorIndex = sync.indexOf(".");
  if (separatorIndex === -1) return null;
  const key = sync.slice(0, separatorIndex);
  const payload = sync.slice(separatorIndex + 1);

  try {
    const json = decodeURIComponent(escape(atob(payload)));
    const data = JSON.parse(json);
    if (key === "calendario") {
      Storage.set(CALENDARIO_KEY, data);
      return "calendario";
    }
    return null;
  } catch (e) {
    return null;
  }
}

function initShell() {
  document.getElementById("hamburger-btn").addEventListener("click", () => {
    setDrawerOpen(!document.getElementById("drawer").classList.contains("open"));
  });
  document.getElementById("drawer-backdrop").addEventListener("click", () => setDrawerOpen(false));
  document.getElementById("change-profile-btn").addEventListener("click", changeProfile);
  document.getElementById("maps-fab").addEventListener("click", () => {
    window.open(TRIP.house.mapsUrl, "_blank");
  });

  window.addEventListener("hashchange", renderRoute);

  const imported = applyIncomingSync();
  if (imported === "calendario") location.hash = "#/calendario";

  renderProfileModal();
  renderRoute();

  if (imported === "calendario") showToast("Calendario actualizado desde el enlace compartido ✓");

  const isLocalDev = ["localhost", "127.0.0.1"].includes(location.hostname);
  if ("serviceWorker" in navigator && !isLocalDev) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", initShell);
