import { BENCH } from './benchmarks.js';
import { clamp, pct, eur, badgeFromRatio } from './utils.js';

const appRoot = document.querySelector('[data-app-root]');
const form = document.querySelector('#metrics-form');

const fieldWrappers = {};
const inputs = {};
const helpTexts = {};
const helpDefaults = {};

if (form) {
  form.querySelectorAll('.field[data-field]').forEach((wrapper) => {
    const key = wrapper.dataset.field;
    fieldWrappers[key] = wrapper;
    const input = wrapper.querySelector('input');
    if (input) {
      inputs[key] = input;
    }
    const help = wrapper.querySelector('.help[data-help-for]');
    if (help) {
      const helpKey = help.dataset.helpFor;
      helpTexts[helpKey] = help;
      helpDefaults[helpKey] = help.dataset.default || help.textContent || '';
    }
  });
}

const outputs = {
  leadsRate: document.querySelector('[data-output="leads-rate"]'),
  devisRate: document.querySelector('[data-output="devis-rate"]'),
  caActuel: document.querySelector('[data-output="ca-actuel"]'),
  manque: document.querySelector('[data-output="manque"]')
};

const badges = {
  leads: document.querySelector('[data-badge="leads"]'),
  devis: document.querySelector('[data-badge="devis"]')
};

const barFills = {
  leads: {
    you: document.querySelector('[data-fill="leads-you"]'),
    bench: document.querySelector('[data-fill="leads-bench"]')
  },
  devis: {
    you: document.querySelector('[data-fill="devis-you"]'),
    bench: document.querySelector('[data-fill="devis-bench"]')
  }
};

const barValues = {
  leads: {
    you: document.querySelector('[data-value="leads-you"]'),
    bench: document.querySelector('[data-value="leads-bench"]')
  },
  devis: {
    you: document.querySelector('[data-value="devis-you"]'),
    bench: document.querySelector('[data-value="devis-bench"]')
  }
};

const cta = document.querySelector('[data-role="cta"]');

if (cta && appRoot?.dataset.ctaUrl) {
  cta.setAttribute('href', appRoot.dataset.ctaUrl);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function readState() {
  return {
    leads_mois: toNumber(inputs.leads_mois?.value),
    devis_mois: toNumber(inputs.devis_mois?.value),
    signatures_mois: toNumber(inputs.signatures_mois?.value),
    panier_moyen: toNumber(inputs.panier_moyen?.value)
  };
}

function validate(state) {
  const errors = {};

  if (state.leads_mois < 0) {
    errors.leads_mois = 'Le nombre de leads doit être supérieur ou égal à 0.';
  }

  if (state.devis_mois < 0) {
    errors.devis_mois = 'Le nombre de devis doit être supérieur ou égal à 0.';
  }

  if (state.signatures_mois < 0) {
    errors.signatures_mois = 'Les signatures doivent être supérieures ou égales à 0.';
  } else if (state.signatures_mois > state.devis_mois) {
    errors.signatures_mois = 'Les signatures ne peuvent pas dépasser les devis.';
  }

  if (state.panier_moyen < 0) {
    errors.panier_moyen = 'Le panier moyen doit être positif.';
  }

  return errors;
}

function sanitize(state) {
  const leads = Math.max(0, state.leads_mois);
  const devis = Math.max(0, state.devis_mois);
  const signatures = Math.max(0, Math.min(state.signatures_mois, devis));
  const panier = Math.max(0, state.panier_moyen);

  return { leads, devis, signatures, panier };
}

function computeMetrics(values) {
  const tauxLeadsDevis = values.leads > 0 ? values.devis / values.leads : 0;
  const tauxDevisSign = values.devis > 0 ? values.signatures / values.devis : 0;
  const caActuel = values.signatures * values.panier;
  const tauxBoost = clamp(tauxDevisSign + 0.1, 0, 1);
  const signaturesBoost = Math.round(values.devis * tauxBoost);
  const caBoost = signaturesBoost * values.panier;
  const manque = Math.max(caBoost - caActuel, 0);

  return {
    ...values,
    tauxLeadsDevis,
    tauxDevisSign,
    caActuel,
    manque,
    tauxBoost,
    signaturesBoost,
    caBoost
  };
}

function applyBadge(element, badge) {
  if (!element || !badge) return;
  element.textContent = badge.label;
  element.dataset.tone = badge.tone;
}

function updateBars(metricKey, value, benchValue) {
  const fillYou = barFills[metricKey]?.you;
  const fillBench = barFills[metricKey]?.bench;
  const valYou = barValues[metricKey]?.you;
  const valBench = barValues[metricKey]?.bench;

  if (fillYou) {
    fillYou.style.transform = `scaleX(${clamp(value, 0, 1)})`;
  }

  if (fillBench) {
    fillBench.style.transform = `scaleX(${clamp(benchValue, 0, 1)})`;
  }

  if (valYou) {
    valYou.textContent = pct(value);
  }

  if (valBench) {
    valBench.textContent = pct(benchValue);
  }
}

function render(metrics) {
  if (outputs.leadsRate) {
    outputs.leadsRate.textContent = pct(metrics.tauxLeadsDevis);
  }
  if (outputs.devisRate) {
    outputs.devisRate.textContent = pct(metrics.tauxDevisSign);
  }
  if (outputs.caActuel) {
    outputs.caActuel.textContent = eur(metrics.caActuel);
  }
  if (outputs.manque) {
    outputs.manque.textContent = eur(metrics.manque);
  }

  applyBadge(
    badges.leads,
    badgeFromRatio(metrics.tauxLeadsDevis, BENCH.moyenne.leads_devis, BENCH.seuil)
  );

  applyBadge(
    badges.devis,
    badgeFromRatio(metrics.tauxDevisSign, BENCH.moyenne.devis_signatures, BENCH.seuil)
  );

  updateBars('leads', metrics.tauxLeadsDevis, BENCH.moyenne.leads_devis);
  updateBars('devis', metrics.tauxDevisSign, BENCH.moyenne.devis_signatures);
}

function displayErrors(errors) {
  Object.entries(fieldWrappers).forEach(([key, wrapper]) => {
    const message = errors[key] ?? '';
    if (message) {
      wrapper.dataset.state = 'error';
    } else {
      delete wrapper.dataset.state;
    }
    const help = helpTexts[key];
    if (help) {
      help.textContent = message || helpDefaults[key] || '';
    }
  });
}

function update() {
  const state = readState();
  const errors = validate(state);
  displayErrors(errors);
  const sanitized = sanitize(state);
  const metrics = computeMetrics(sanitized);
  render(metrics);
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    update();
  });

  form.addEventListener('input', () => {
    update();
  });
}

update();
