<p align="center">
  <img src="assets/logo-header.png" alt="PILOTE" width="360">
</p>

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
5. Sauvegarder la session en JSON si besoin.
6. Exporter les PDF directement en dossiers avec Edge/Chrome, ou en ZIP avec Firefox.

Le formulaire de démarrage est bloqué tant que les 3 fichiers de sectorisation ne sont pas importés correctement.

Une session déjà sauvegardée peut être rechargée après l'import des fichiers de sectorisation.

## Fonctionnalités disponibles

- Import manuel des fichiers Excel de sectorisation.
- Validation des colonnes attendues dans les fichiers Excel.
- Suggestions de villes, d'écoles / GEVASCO et d'instructrices à partir des Excel importés.
- Création d'une session de travail.
- Ajout, modification et suppression de documents.
- Attribution automatique d'une instructrice quand une correspondance claire est trouvée.
- Correction manuelle de l'instructrice si nécessaire.
- Statut visible pour les documents attribués, à vérifier, non trouvés ou corrigés manuellement.
- Gestion des recours en statut à vérifier.
- Association d'un fichier PDF à un document.
- Contrôle des fichiers PDF uniquement.
- Statut visuel PDF manquant ou PDF associé.
- Export manuel de la session en JSON.
- Import d'une sauvegarde JSON PILOTE.
- Détection des sauvegardes inutiles quand rien n'a changé depuis le dernier export.
- Statistiques en temps réel sur les documents du lot.
- Comptage des documents par instructrice.
- Affichage des documents ajoutés dans le lot.
- Export direct des PDF dans des dossiers classés par instructrice avec Edge ou Chrome.
- Export ZIP contenant les mêmes dossiers avec Firefox et les autres navigateurs.

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
- Export ZIP avec JSZip chargé localement depuis `libs/jszip.min.js`.
- Licences des bibliothèques disponibles dans `libs`.

## Remarque sur les fichiers Excel

Les fichiers Excel ne sont pas lus automatiquement depuis le disque. L'agent les sélectionne dans l'interface, ce qui permet au navigateur de les lire localement sans serveur.

## Remarque sur les sauvegardes

La sauvegarde JSON conserve les informations de session et les documents saisis. Elle ne contient pas les fichiers PDF eux-mêmes.

Après rechargement d'une sauvegarde, PILOTE affiche le nom du PDF connu et indique clairement qu'il faut le réassocier.

## Remarque sur les PDF

Quand un PDF est associé à un document, PILOTE ne crée pas de copie du fichier dans le dossier du projet. Le navigateur garde seulement un accès temporaire au fichier sélectionné tant que la page reste ouverte.

Avant l'export final, il faut donc éviter de supprimer, déplacer ou renommer les PDF d'origine. Si la page est fermée ou si une sauvegarde JSON est rechargée, les PDF devront être réassociés.

## Remarque sur l'export

Avec Microsoft Edge ou Google Chrome, PILOTE peut demander à l'agent de choisir un dossier puis créer un sous-dossier par instructrice. Un dossier portant le nom de la session est créé pour isoler chaque export.

Avec Mozilla Firefox, l'accès direct aux dossiers n'est pas disponible. PILOTE crée donc un ZIP portant le nom de la session et contenant la même organisation par instructrice.

Les documents sans instructrice claire ou dont la sectorisation reste à vérifier sont rangés dans `A_VERIFIER`.

L'export est bloqué tant qu'un document ne possède pas de PDF associé.

### Vérifier la compatibilité du navigateur

Pour vérifier manuellement si le navigateur permet la création directe des dossiers :

1. Ouvrir PILOTE dans le navigateur à tester.
2. Appuyer sur `F12`.
3. Ouvrir l'onglet `Console`.
4. Saisir la commande suivante puis appuyer sur Entrée :

```javascript
typeof window.showDirectoryPicker
```

- Firefox affiche `"undefined"` : la création directe des dossiers n'est pas disponible.
- Edge et Chrome affichent `"function"` : la création directe des dossiers est disponible.

PILOTE effectue automatiquement cette même vérification pour activer ou désactiver le bouton correspondant.

## Bibliothèques externes

Le dossier `libs` contient SheetJS, utilisé pour lire les fichiers Excel, et JSZip, utilisé pour créer les exports ZIP.

`index.html` charge la version optimisée `libs/xlsx.full.min.js`.

La licence officielle est conservée dans `libs/SheetJS-LICENSE.txt`.

`index.html` charge également `libs/jszip.min.js`.

La licence officielle de JSZip est conservée dans `libs/JSZip-LICENSE.md`.

Les informations utiles sur ces bibliothèques sont détaillées dans `libs/README.md`.

Les sources et la licence des icônes de navigateurs sont détaillées dans `assets/README.md`.
