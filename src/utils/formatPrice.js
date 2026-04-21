function parsePriceNumber(value) {
  const n =
    typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function formatFrAmount(n) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Affiche un prix en euros : montant formaté FR + symbole € explicite
 * (évite Intl `currency` qui peut afficher $ selon l’environnement).
 * @param {string|number} value — prix stocké en base (nombre décimal)
 */
export function formatPriceEUR(value) {
  const n = parsePriceNumber(value);
  if (n === null) return '—';
  return `${formatFrAmount(n)}\u00A0€`;
}

/**
 * Affiche un prix avec suffixe DT (format français : virgule décimale).
 * @param {string|number} value — prix stocké en base (nombre décimal)
 */
export function formatPriceDT(value) {
  const n = parsePriceNumber(value);
  if (n === null) return '—';
  return `${formatFrAmount(n)} DT`;
}
