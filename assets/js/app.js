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

  const readNumber = (id) => {
    const element = get(id);
    if (!element) return null;
    const rawValue = element.value;
    if (rawValue === '' || rawValue === null) return null;
    const normalized = rawValue.trim();
    if (normalized === '') return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const fieldIds = ['leads', 'devis', 'signatures', 'panier', 'improv', 'secteur', 'benchLD', 'benchDS'];

  const DEFAULT_SECTOR = 'chauffage';

  const sectorPresets = {
    chauffage: { ld: 34, ds: 42 },
    'constructeurs-bois': { ld: 29, ds: 35 },
    'equipements-industriels': { ld: 31, ds: 37 },
    'materiaux-ecologiques': { ld: 27, ds: 34 },
    'equipements-artisanat-batiment': { ld: 36, ds: 39 },
    'equipements-electromenagers': { ld: 38, ds: 44 },
    'mobilier-haut-de-gamme': { ld: 24, ds: 31 },
    'piscines-spas': { ld: 23, ds: 29 },
    'revetements-sol': { ld: 33, ds: 38 },
    'systemes-securite': { ld: 37, ds: 41 },
    'peintures-revetements-industriels': { ld: 30, ds: 36 },
    'machines-outils': { ld: 26, ds: 33 },
    'materiel-electrique': { ld: 35, ds: 40 },
    'solutions-domotiques': { ld: 28, ds: 34 },
    'ventilation-climatisation': { ld: 32, ds: 37 },
    'charpentes-metalliques': { ld: 25, ds: 32 },
    'materiel-agroalimentaire': { ld: 29, ds: 38 },
    'logistique-industrielle': { ld: 27, ds: 35 },
    'emballages-techniques': { ld: 34, ds: 39 },
  };

  const STORAGE_KEY = 'convbench@v2';
  const CTA_BASE_URL = 'https://cal.com/your-handle/diagnostic';
  const customRow = get('customRow');

  const clampPercent = (value) => Math.max(0, Math.min(100, value));

  const classify = (value, reference) => {
    const delta = value - reference;
    if (delta >= 5) return { cls: 'ok', label: 'Au-dessus' };
    if (Math.abs(delta) < 5) return { cls: 'warn', label: 'Dans la moyenne' };
    return { cls: 'bad', label: 'En dessous' };
  };

  function normalizeSectorValue() {
    const select = get('secteur');
    if (select.value !== 'custom' && !sectorPresets[select.value]) {
      select.value = DEFAULT_SECTOR;
    }
  }

  function updateBenchVisibility() {
    normalizeSectorValue();
    const selected = get('secteur').value;
    const isCustom = selected === 'custom';
    customRow.classList.toggle('is-visible', isCustom);
    if (!isCustom) {
      const preset = sectorPresets[selected] || sectorPresets[DEFAULT_SECTOR];
      get('benchLD').value = preset.ld;
      get('benchDS').value = preset.ds;
    }
  }

  function renderPill(elementId, verdict) {
    const element = get(elementId);
    if (!verdict) {
      element.className = 'pill';
      element.textContent = '—';
      return;
    }
    element.className = `pill ${verdict.cls}`;
    element.textContent = verdict.label;
  }

  function resetResults({ benchLD, benchDS }) {
    get('caActuel').textContent = '—';
    get('caProjete').textContent = '—';
    get('manque').textContent = '—';

    get('barLD').style.width = '0%';
    get('barDS').style.width = '0%';

    get('txtLD').textContent = `Votre taux : — • Réf : ${benchLD}%`;
    get('txtDS').textContent = `Votre taux : — • Réf : ${benchDS}%`;

    renderPill('pillLD', null);
    renderPill('pillDS', null);

    get('ctaLink').href = CTA_BASE_URL;
  }

  function calc() {
    const leads = readNumber('leads');
    const devis = readNumber('devis');
    const signatures = readNumber('signatures');
    const panier = readNumber('panier');
    const improvement = clampPercent(readNumber('improv') ?? 0);
    const benchLD = clampPercent(readNumber('benchLD') ?? 0);
    const benchDS = clampPercent(readNumber('benchDS') ?? 0);

    get('improvShow').textContent = improvement.toFixed(0);

    get('targetLD').style.left = `${benchLD}%`;
    get('targetDS').style.left = `${benchDS}%`;

    if ([leads, devis, signatures, panier].some((value) => value === null)) {
      resetResults({ benchLD, benchDS });
      return;
    }

    const tauxLD = leads > 0 ? (devis / leads) * 100 : 0;
    const tauxDS = devis > 0 ? (signatures / devis) * 100 : 0;

    const caActuel = signatures * panier;
    const tauxDSAmeliore = clampPercent(tauxDS + improvement);
    const caProjete = devis * (tauxDSAmeliore / 100) * panier;
    const manque = Math.max(0, caProjete - caActuel);

    get('caActuel').textContent = formatCurrency(caActuel);
    get('caProjete').textContent = formatCurrency(caProjete);
    get('manque').textContent = formatCurrency(manque);

    get('barLD').style.width = `${clampPercent(tauxLD)}%`;
    get('barDS').style.width = `${clampPercent(tauxDS)}%`;

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

  function save() {
    const payload = Object.fromEntries(fieldIds.map((id) => [id, get(id).value]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    alert('Valeurs mémorisées dans votre navigateur.');
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      fieldIds.forEach((id) => {
        if (data[id] !== undefined) {
          get(id).value = data[id];
        }
      });
    } catch (error) {
      console.warn('Impossible de charger les valeurs enregistrées', error);
    }
  }

  function resetAll() {
    fieldIds.forEach((id) => {
      if (id === 'secteur') {
        get(id).value = DEFAULT_SECTOR;
      } else if (id === 'improv') {
        get(id).value = 10;
      } else {
        get(id).value = '';
      }
    });
    updateBenchVisibility();
    calc();
  }

  get('saveBtn').addEventListener('click', save);
  get('resetBtn').addEventListener('click', resetAll);

  get('secteur').addEventListener('change', () => {
    updateBenchVisibility();
    calc();
  });

  ['leads', 'devis', 'signatures', 'panier', 'improv', 'benchLD', 'benchDS'].forEach((id) => {
    get(id).addEventListener('input', calc);
  });

  load();
  updateBenchVisibility();
  calc();
});
