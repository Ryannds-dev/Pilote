# Bibliothèques locales

Ce dossier contient les bibliothèques JavaScript externes utilisées par PILOTE.

Elles sont copiées dans le projet pour que l'outil fonctionne localement, sans chargement depuis Internet.

## SheetJS

PILOTE utilise SheetJS Community Edition `0.20.3` pour lire les fichiers Excel importés par l'utilisateur.

Source officielle :

- `https://docs.sheetjs.com/docs/getting-started/installation/standalone/`

Fichiers présents :

- `xlsx.full.min.js` : fichier utilisé par PILOTE pour lire les Excel.
- `SheetJS-LICENSE.txt` : licence officielle de SheetJS.

PILOTE ne modifie pas ces fichiers.

Aucune donnée n'est envoyée sur Internet : les Excel sont lus localement, uniquement après sélection par l'utilisateur.

## JSZip

PILOTE utilise JSZip `3.10.1` pour créer un export ZIP compatible avec les navigateurs qui ne peuvent pas écrire directement dans un dossier, notamment Firefox.

Source officielle :

- `https://stuk.github.io/jszip/`
- `https://github.com/Stuk/jszip/releases/tag/v3.10.1`
- `https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/dist/jszip.min.js`
- `https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/LICENSE.markdown`

Fichiers présents :

- `jszip.min.js` : fichier utilisé localement pour créer le ZIP.
- `JSZip-LICENSE.md` : licence officielle incluse dans le dépôt JSZip.

Les PDF sont ajoutés au ZIP dans le navigateur. Ils ne sont envoyés vers aucun service extérieur.
