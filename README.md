# PILOTE

PILOTE est un outil local d'aide à la sectorisation des documents numérisés pour une MDPH.

L'application fonctionne dans le navigateur, sans backend, sans base de données et sans envoi de données sur Internet.

## Utilisation actuelle

1. Ouvrir `index.html`.
2. Importer les 3 fichiers Excel de sectorisation :
   - sectorisation adulte ;
   - sectorisation PCH ;
   - sectorisation enfant.
3. Démarrer une session en indiquant l'agent et la date de tampon.
4. Ajouter les documents du lot.

Le formulaire de démarrage est bloqué tant que les 3 fichiers de sectorisation ne sont pas importés correctement.

## Fonctionnalités disponibles

- Import manuel des fichiers Excel de sectorisation.
- Validation des colonnes attendues dans les fichiers Excel.
- Suggestions de villes et d'écoles / GEVASCO à partir des Excel importés.
- Création d'une session de travail.
- Ajout, modification et suppression de documents.
- Attribution automatique d'une instructrice quand une correspondance claire est trouvée.
- Statistiques en temps réel sur les documents du lot.
- Comptage des documents par instructrice.
- Affichage des documents ajoutés dans le lot.

## Structure

```text
/assets
/data
/exports
/sessions
/libs
index.html
style.css
app.js
README.md
COMMIT_HISTORY.md
```

## Contraintes

- HTML, CSS et JavaScript vanilla uniquement.
- Aucun framework.
- Aucun backend.
- Aucune base de données.
- Fonctionnement local.
- Aucune donnée envoyée sur Internet.
- Lecture Excel avec SheetJS chargé localement depuis `libs/xlsx.full.min.js`.
- Licence SheetJS disponible dans `libs`.

## Remarque sur les fichiers Excel

Les fichiers Excel ne sont pas lus automatiquement depuis le disque. L'agent les sélectionne dans l'interface, ce qui permet au navigateur de les lire localement sans serveur.

## Bibliothèques externes

Le dossier `libs` contient SheetJS, utilisé pour lire les fichiers Excel.

`index.html` charge la version optimisée `libs/xlsx.full.min.js`.

La licence officielle est conservée dans `libs/SheetJS-LICENSE.txt`.

Les informations utiles sur cette bibliothèque sont détaillées dans `libs/README.md`.
