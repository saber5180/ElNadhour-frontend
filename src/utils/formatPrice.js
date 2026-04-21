/**
 * Affiche un prix en euros (symbole €, format français : virgule décimale).
 * @param {string|number} value — prix stocké en base (nombre décimal)
 */
export function formatPriceEUR(value) {
  const n =
    typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
