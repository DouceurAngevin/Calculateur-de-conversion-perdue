# Tests manuels – Diagnostic Commercial Express

## Pré-requis
- Ouvrir `src/index.html` dans un navigateur moderne (Chrome, Edge, Safari, Firefox).
- Vider le cache pour s'assurer qu'aucune version précédente n'est conservée.

## Scénario 1 – Parcours nominal
1. Renseigner `Leads générés` = 250.
2. Renseigner `Devis envoyés` = 80.
3. Renseigner `Signatures obtenues` = 28.
4. Renseigner `Panier moyen` = 3200.
5. Cliquer sur **Calculer** (ou vérifier que le calcul en direct s'exécute).
6. Vérifier :
   - Taux Leads → Devis ≈ `32,0 %` (badge "Au-dessus" attendu car supérieur à 30 %).
   - Taux Devis → Signatures ≈ `35,0 %` (badge "Dans la moyenne" car proche des 40 % ± 20 %).
   - CA actuel ≈ `89 600 €`.
   - Manque à gagner ≈ `25 600 €` (28 → 36 signatures avec +10 pts).
   - Barres comparatives affichent la valeur utilisateur vs benchmark (barre moyenne à 30 % / 40 %).
7. Cliquer sur le CTA et confirmer qu'il ouvre l'URL définie dans `data-cta-url` (par défaut `https://example.com`).

## Scénario 2 – Absence de leads
1. Saisir `Leads générés` = 0, `Devis envoyés` = 0, `Signatures obtenues` = 0, `Panier moyen` = 0.
2. Vérifier :
   - Les taux affichent `0,0 %`.
   - Les badges passent en état "Non disponible" ou "En retard" selon la logique.
   - Les barres restent vides.
   - Aucun message d'erreur ne s'affiche.

## Scénario 3 – Validation signatures > devis
1. Saisir `Leads générés` = 50, `Devis envoyés` = 20, `Signatures obtenues` = 30.
2. Constater l'apparition du message d'erreur "Les signatures ne peuvent pas dépasser les devis." sous le champ signatures, avec un style rouge.
3. Ajuster `Signatures obtenues` à 18.
4. Vérifier que l'erreur disparaît et que les résultats se recalculent automatiquement.

## Scénario 4 – Valeur panier importante
1. Saisir `Leads générés` = 120, `Devis envoyés` = 36, `Signatures obtenues` = 15, `Panier moyen` = 10500.
2. Vérifier :
   - CA actuel ≈ `157 500 €`.
   - Manque à gagner reflète l'augmentation des signatures (taux à 25 % → +10 pts = 35 % → 13 signatures → +2 signatures ≈ `21 000 €`).
   - Les barres comparatives restent proportionnelles et limitées à 100 % de largeur.

## Scénario 5 – Accessibilité et responsive
1. Naviguer au clavier (Tab) : chaque champ et bouton doit afficher un focus visible.
2. Réduire la fenêtre à une largeur < 480 px : les cartes passent en une colonne, le contenu reste lisible et sans débordement.
3. Sur écran large (> 1024 px), vérifier que la largeur n'excède pas ~720 px et que le module reste centré.
