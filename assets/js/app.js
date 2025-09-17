document.addEventListener('DOMContentLoaded', () => {
  const formatCurrency = (value) =>
    Number.isFinite(value)
      ? value.toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        })
      : '—';

  const get = (id) => document.getElementById(id);

  const fieldIds = ['leads', 'devis', 'signatures', 'panier', 'improv', 'secteur', 'benchLD', 'benchDS'];

  const sectorPresets = {
    indus: { ld: 30, ds: 40 },
    b2b: { ld: 25, ds: 35 },
    surmesure: { ld: 20, ds: 30 },
  };

  const STORAGE_KEY = 'convbench@v1';
  const CTA_BASE_URL = 'https://cal.com/your-handle/diagnostic';
  const customRow = get('customRow');
  let cachedCustomBench = null;

  const clampPercent = (value) => Math.max(0, Math.min(100, value));

  const classify = (value, reference) => {
    const delta = value - reference;
    if (delta >= 5) return { cls: 'ok', label: 'Au-dessus' };
    if (Math.abs(delta) < 5) return { cls: 'warn', label: 'Dans la moyenne' };
    return { cls: 'bad', label: 'En dessous' };
  };

  function updateBenchVisibility() {
    const secteur = get('secteur').value;
    const isCustom = secteur === 'custom';
    customRow.classList.toggle('is-visible', isCustom);
    if (isCustom) {
      if (cachedCustomBench) {
        get('benchLD').value = cachedCustomBench.ld ?? '';
        get('benchDS').value = cachedCustomBench.ds ?? '';
      }
      return;
    }

    const preset = sectorPresets[secteur] || sectorPresets.indus;
    get('benchLD').value = preset.ld;
    get('benchDS').value = preset.ds;
  }

  function renderPill(elementId, verdict) {
    const element = get(elementId);
    element.className = `pill ${verdict.cls}`;
    element.textContent = verdict.label;
  }

  function calc() {
    const leads = Number(get('leads').value) || 0;
    const devis = Number(get('devis').value) || 0;
    const signatures = Number(get('signatures').value) || 0;
    const panier = Number(get('panier').value) || 0;
    const improvement = Number(get('improv').value) || 0;
    const benchLD = Number(get('benchLD').value) || 0;
    const benchDS = Number(get('benchDS').value) || 0;

    const tauxLD = leads > 0 ? (devis / leads) * 100 : 0;
    const tauxDS = devis > 0 ? (signatures / devis) * 100 : 0;

    const caActuel = signatures * panier;
    const tauxDSAmeliore = clampPercent(tauxDS + improvement);
    const caProjete = devis * (tauxDSAmeliore / 100) * panier;
    const manque = Math.max(0, caProjete - caActuel);

    get('improvShow').textContent = improvement.toFixed(0);
    get('caActuel').textContent = formatCurrency(caActuel);
    get('caProjete').textContent = formatCurrency(caProjete);
    get('manque').textContent = formatCurrency(manque);

    get('barLD').style.width = `${clampPercent(tauxLD)}%`;
    get('barDS').style.width = `${clampPercent(tauxDS)}%`;

    get('targetLD').style.left = `${clampPercent(benchLD)}%`;
    get('targetDS').style.left = `${clampPercent(benchDS)}%`;

    get('txtLD').textContent = `Votre taux : ${tauxLD.toFixed(0)}% • Réf : ${benchLD}%`;
    get('txtDS').textContent = `Votre taux : ${tauxDS.toFixed(0)}% • Réf : ${benchDS}%`;

    renderPill('pillLD', classify(tauxLD, benchLD));
    renderPill('pillDS', classify(tauxDS, benchDS));

    const params = new URLSearchParams({
      leads,
      devis,
      sign: signatures,
      panier,
      tLD: tauxLD.toFixed(0),
      tDS: tauxDS.toFixed(0),
      manque: Math.round(manque),
    });
    get('ctaLink').href = `${CTA_BASE_URL}?${params.toString()}`;
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Impossible de charger les valeurs enregistrées', error);
      return null;
    }
  }

  function writeStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de mémoriser les valeurs', error);
    }
  }

  function save(options = {}) {
    const existing = readStorage() || {};
    const fields = Object.fromEntries(fieldIds.map((id) => [id, get(id).value]));
    const payload = { fields };

    if (fields.secteur === 'custom') {
      cachedCustomBench = {
        ld: fields.benchLD,
        ds: fields.benchDS,
      };
      payload.customBench = { ...cachedCustomBench };
    } else if (!options.clearCustomBench) {
      const preserved = cachedCustomBench || existing.customBench;
      if (preserved) {
        cachedCustomBench = { ...preserved };
        payload.customBench = { ...preserved };
      } else {
        cachedCustomBench = null;
      }
    } else {
      cachedCustomBench = null;
    }

    writeStorage(payload);
  }

  function load() {
    const stored = readStorage();
    if (!stored) return;

    const data = stored.fields || stored;

    fieldIds.forEach((id) => {
      if (data[id] !== undefined) {
        get(id).value = data[id];
      }
    });

    if (stored.customBench && stored.customBench.ld !== undefined && stored.customBench.ds !== undefined) {
      cachedCustomBench = { ...stored.customBench };
    } else if (data.secteur === 'custom') {
      cachedCustomBench = {
        ld: data.benchLD,
        ds: data.benchDS,
      };
    }
  }

  function resetAll() {
    fieldIds.forEach((id) => {
      if (id === 'secteur') {
        get(id).value = 'indus';
      } else if (id === 'improv') {
        get(id).value = 10;
      } else {
        get(id).value = '';
      }
    });
    updateBenchVisibility();
    calc();
    save({ clearCustomBench: true });
  }

  get('calcBtn').addEventListener('click', () => {
    calc();
    save();
  });
  get('resetBtn').addEventListener('click', resetAll);

  get('secteur').addEventListener('change', () => {
    updateBenchVisibility();
    calc();
    save();
  });

  ['leads', 'devis', 'signatures', 'panier', 'improv', 'benchLD', 'benchDS'].forEach((id) => {
    get(id).addEventListener('input', () => {
      calc();
      save();
    });
  });

  load();
  updateBenchVisibility();
  calc();
});
