const GASTOS_KEY = "viaje_gastos";
const ALL_PROFILE_IDS = PROFILES.map((p) => p.id);

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatEuro(n) {
  return round2(n).toFixed(2).replace(".", ",") + "€";
}

function profileLabel(id) {
  const p = PROFILES.find((p) => p.id === id);
  return p ? p.label : id;
}

function participantsOf(g) {
  return g.participants && g.participants.length ? g.participants : ALL_PROFILE_IDS;
}

function computeBalances(gastos) {
  const total = gastos.reduce((sum, g) => sum + g.amount, 0);
  const paid = {};
  const fairShare = {};
  PROFILES.forEach((p) => { paid[p.id] = 0; fairShare[p.id] = 0; });

  gastos.forEach((g) => {
    paid[g.payer] = (paid[g.payer] || 0) + g.amount;
    const participants = participantsOf(g);
    const perHead = g.amount / participants.length;
    participants.forEach((pid) => { fairShare[pid] = (fairShare[pid] || 0) + perHead; });
  });

  return {
    total: round2(total),
    perPerson: PROFILES.map((p) => ({
      id: p.id,
      label: p.label,
      paid: round2(paid[p.id] || 0),
      share: round2(fairShare[p.id] || 0),
      balance: round2((paid[p.id] || 0) - (fairShare[p.id] || 0)),
    })),
  };
}

function computeSettlements(perPerson) {
  const creditors = perPerson.filter((p) => p.balance > 0.01).map((p) => ({ ...p })).sort((a, b) => b.balance - a.balance);
  const debtors = perPerson.filter((p) => p.balance < -0.01).map((p) => ({ ...p, balance: -p.balance })).sort((a, b) => b.balance - a.balance);
  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = round2(Math.min(debtors[i].balance, creditors[j].balance));
    if (amount > 0.01) {
      settlements.push({ from: debtors[i].label, to: creditors[j].label, amount });
    }
    debtors[i].balance = round2(debtors[i].balance - amount);
    creditors[j].balance = round2(creditors[j].balance - amount);
    if (debtors[i].balance <= 0.01) i++;
    if (creditors[j].balance <= 0.01) j++;
  }
  return settlements;
}

function payerOptionsHTML() {
  return PROFILES.map((p) => `<option value="${p.id}">${p.label}</option>`).join("");
}

function participantChecksHTML() {
  return PROFILES.map((p) => `
    <label class="participant-check">
      <input type="checkbox" value="${p.id}" checked /> ${p.label}
    </label>`).join("");
}

function participantsNote(g) {
  const participants = participantsOf(g);
  if (participants.length === ALL_PROFILE_IDS.length) return "";
  return ` · para ${participants.map(profileLabel).join(", ")}`;
}

function gastoItemHTML(g, isAdmin) {
  return `
    <li class="gasto-item" data-id="${g.id}">
      <div class="gasto-info">
        <span class="gasto-concept">${g.concept}</span>
        <span class="muted gasto-payer">Pagó ${profileLabel(g.payer)}${participantsNote(g)}</span>
      </div>
      <span class="gasto-amount">${formatEuro(g.amount)}</span>
      ${isAdmin ? `<button class="compra-delete" aria-label="Eliminar">✕</button>` : ""}
    </li>`;
}

function renderGastos(root) {
  const isAdmin = Profile.isAdmin();
  const gastos = Storage.get(GASTOS_KEY, []);
  const { total, perPerson } = computeBalances(gastos);
  const settlements = computeSettlements(perPerson);

  const formHTML = isAdmin
    ? `<form id="gasto-add-form" class="gasto-add-form">
        <select id="gasto-payer">${payerOptionsHTML()}</select>
        <input type="text" id="gasto-concept" placeholder="Concepto (ej. gasolina)" autocomplete="off" required />
        <input type="number" id="gasto-amount" placeholder="0,00" step="0.01" min="0" inputmode="decimal" required />
        <div class="gasto-participants">
          <span class="home-label">¿Para quién cuenta?</span>
          <div class="participant-checks">${participantChecksHTML()}</div>
        </div>
        <button type="submit" class="btn-accent">Añadir gasto</button>
      </form>`
    : "";

  const listHTML = gastos.length
    ? `<ul class="gasto-list">${gastos.slice().reverse().map((g) => gastoItemHTML(g, isAdmin)).join("")}</ul>`
    : `<p class="muted">Todavía no hay gastos registrados.</p>`;

  const balancesHTML = perPerson.map((p) => `
    <div class="balance-row">
      <span>${p.label}</span>
      <span class="muted">pagó ${formatEuro(p.paid)} · le tocan ${formatEuro(p.share)}</span>
      <span class="${p.balance >= 0 ? "balance-positive" : "balance-negative"}">
        ${p.balance >= 0 ? "+" : ""}${formatEuro(p.balance)}
      </span>
    </div>`).join("");

  const settlementsHTML = settlements.length
    ? `<ul class="settlement-list">${settlements.map((s) => `<li>${s.from} debe ${formatEuro(s.amount)} a ${s.to}</li>`).join("")}</ul>`
    : `<p class="muted">Todo saldado 🎉</p>`;

  root.innerHTML = `
    <section class="card">
      <h2>Registrar gasto</h2>
      ${isAdmin ? formHTML : `<p class="muted">Solo el admin registra gastos.</p>`}
    </section>

    <section class="card">
      <h2>Gastos (${formatEuro(total)} en total)</h2>
      ${listHTML}
    </section>

    <section class="card">
      <h2>Reparto</h2>
      <div class="balances">${balancesHTML}</div>
      <h3 class="settlement-title">Quién debe a quién</h3>
      ${settlementsHTML}
    </section>
  `;

  if (!isAdmin) return;

  document.getElementById("gasto-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const payer = document.getElementById("gasto-payer").value;
    const concept = document.getElementById("gasto-concept").value.trim();
    const amount = parseFloat(document.getElementById("gasto-amount").value);
    const participants = Array.from(root.querySelectorAll('.participant-check input:checked')).map((c) => c.value);
    if (!concept || !amount || amount <= 0) return;
    const current = Storage.get(GASTOS_KEY, []);
    current.push({
      id: newItemId(),
      payer,
      concept,
      amount: round2(amount),
      participants: participants.length ? participants : ALL_PROFILE_IDS,
    });
    Storage.set(GASTOS_KEY, current);
    renderGastos(root);
  });

  root.querySelectorAll(".gasto-item .compra-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".gasto-item").dataset.id;
      const current = Storage.get(GASTOS_KEY, []).filter((g) => g.id !== id);
      Storage.set(GASTOS_KEY, current);
      renderGastos(root);
    });
  });
}
