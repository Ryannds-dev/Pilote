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
