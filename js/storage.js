// Helpers finos sobre localStorage. Cada feature (compra, gastos, equipaje, calendario)
// tiene su propia clave y su propio módulo; esto solo evita repetir JSON.parse/stringify.

const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};
