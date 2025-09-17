# Diagnostic Commercial Express

Mini-module 100 % client-side pour estimer en quelques secondes la performance de votre tunnel commercial et le manque à gagner potentiel. Idéal pour être embarqué dans Notion ou partagé via une simple URL.

![Aperçu à ajouter](docs/screenshot.png)

## Démo
- Vercel : https://votre-url-a-remplacer.vercel.app
- GitHub Pages : https://votre-utilisateur.github.io/diagnostic-commercial-express/

> 💡 Remplacez les liens ci-dessus par l'URL réelle de votre déploiement.

## Fonctionnalités
- Saisie ultra-rapide (leads, devis, signatures, panier moyen).
- Calcul automatique des taux de conversion, du chiffre d'affaires actuel et du manque à gagner avec +10 pts sur la conversion devis → signatures.
- Comparaison visuelle à un benchmark fictif.
- Aucune donnée envoyée côté serveur : tout se passe dans le navigateur.
- Charte visuelle minimaliste inspirée de Notion pour une intégration harmonieuse dans vos espaces.

## Installer & embarquer dans Notion
1. Déployez le dossier `/src` sur Vercel ou activez GitHub Pages (voir section Déploiement).
2. Copiez l'URL publique de la page `index.html` (ex. `https://.../`).
3. Dans Notion, tapez `/embed`, collez l'URL et validez. Le module s'affiche automatiquement.

## Configuration
- **Lien CTA** : modifiez l'attribut `data-cta-url` dans `src/index.html` (section `<main>`). Le bouton "Activer mes 3 leviers maintenant" pointera vers cette URL.
- **Benchmarks** : ajustez les valeurs dans `src/benchmarks.js` pour refléter vos propres moyennes sectorielles.

## Développement
Aucune étape de build n'est nécessaire : ouvrez simplement `src/index.html` dans votre navigateur.

Structure du projet :
```
.
├─ README.md
├─ LICENSE
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  ├─ benchmarks.js
│  └─ utils.js
├─ tests/
│  └─ app.test.md
├─ vercel.json
└─ .editorconfig
```

### Tests
Les scénarios de tests manuels se trouvent dans `tests/app.test.md`. Ils couvrent notamment :
- Valeurs nominales réalistes.
- Cas limites (0 lead, 0 devis, signatures > devis...).
- Vérification de la cohérence des badges et du comparatif benchmark.

## Déploiement
### Vercel
Le fichier `vercel.json` configure la redirection de toutes les routes vers `src/index.html` et expose le dossier `public/` pour les assets statiques.

### GitHub Pages
Option 1 : déplacer le contenu de `src/` dans un dossier `docs/` et activer GitHub Pages sur `main` → `/docs`.

Option 2 : configurer une GitHub Action qui copie `src/` vers la branche `gh-pages` (et `public/` à la racine) lors des pushes.

## Licence
Projet sous licence [MIT](LICENSE). Vous êtes libre de l'utiliser et de l'adapter tant que vous conservez la mention de licence.
