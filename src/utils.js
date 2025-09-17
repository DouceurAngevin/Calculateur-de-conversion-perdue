const percentFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function pct(value) {
  if (!Number.isFinite(value)) {
    return '0,0 %';
  }
  return percentFormatter.format(value);
}

export function eur(value) {
  if (!Number.isFinite(value)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(value);
}

export function badgeFromRatio(value, reference, seuils) {
  if (!Number.isFinite(value) || !Number.isFinite(reference) || reference <= 0) {
    return { label: 'Non disponible', tone: 'muted' };
  }

  const ratio = value / reference;

  if (ratio < seuils.bas) {
    return { label: 'En retard', tone: 'bad' };
  }

  if (ratio > seuils.haut) {
    return { label: 'Au-dessus', tone: 'good' };
  }

  return { label: 'Dans la moyenne', tone: 'mid' };
}
