# Historique des commits

Ce fichier résume les changements importants du projet PILOTE.

Il sert à comprendre rapidement ce que chaque étape a ajouté, sans devoir relire tout le code ou parcourir l'historique Git.

## 5054eb9 - Set up project structure

Date : 2026-06-20

Objectif : créer le socle initial du projet.

- création de l'arborescence de base ;
- ajout des dossiers `assets`, `data`, `sessions` et `exports` ;
- ajout de `index.html`, `style.css`, `app.js` et `README.md` ;
- page d'accueil simple pour PILOTE ;
- message indiquant que les données restent locales ;
- zone prévue pour le futur démarrage de session.

## 6ca60b9 - App base: Add favicon and logos

Date : 2026-06-21

Objectif : intégrer les premiers éléments visuels officiels.

- ajout du favicon ;
- ajout du logo d'en-tête ;
- déclaration du favicon dans `index.html` ;
- affichage du logo long PILOTE dans l'en-tête.

## 0532b3b - App base: Make style names easier to read

Date : 2026-06-21

Objectif : rendre le HTML et le CSS plus faciles à comprendre.

- noms de classes plus explicites ;
- variables CSS plus lisibles ;
- structure visuelle clarifiée.

## eacddf6 - App base: Clarify start screen wording

Date : 2026-06-21

Objectif : clarifier le texte affiché dans la zone de démarrage.

- phrase de démarrage simplifiée ;
- précision sur l'agent et la date de tampon attendus.

## c26a0f9 - App base: Add session start screen

Date : 2026-06-21

Objectif : ajouter l'écran de démarrage de session.

- formulaire agent/date ;
- validation des champs obligatoires ;
- génération du nom de session `YYYY-MM-DD_AGENT` ;
- création de l'objet `currentSession` ;
- affichage d'une carte récapitulative après démarrage.

## 9104bfc - App base: Add data model helpers

Date : 2026-06-21

Objectif : préparer le modèle JavaScript interne.

- ajout du tableau `documents` dans `currentSession` ;
- ajout des constantes de public, type de document et statut de sectorisation ;
- fonctions de création de documents ;
- compteur de documents.

## cd7a5c2 - Docs: Add detailed commit history

Date : 2026-06-21

Objectif : documenter les étapes de développement.

- création de `COMMIT_HISTORY.md` ;
- résumé des commits déjà réalisés.

## 6bd3407 - Data: Organize sectorization spreadsheets

Date : 2026-06-23

Objectif : ranger les fichiers Excel de sectorisation.

- ajout de `data/sectorisation_adulte.xlsx` ;
- ajout de `data/sectorisation_enfant.xlsx` ;
- ajout de `data/sectorisation_pch.xlsx` ;
- noms de fichiers courts et stables.

## 25f0211 - Documents: Add document form

Date : 2026-06-23

Objectif : ajouter le formulaire d'ajout de document.

- champ Nom MultiGest ;
- public ;
- type de document ;
- PCH uniquement ;
- ville ;
- école / GEVASCO ;
- hors département ;
- ajout dans `currentSession.documents`.

## ae67cac - Documents: Show document list

Date : 2026-06-23

Objectif : afficher les documents ajoutés.

- liste des documents ;
- message de liste vide ;
- icône PDF vide ;
- affichage des informations saisies.

## 94af452 - Documents: Add edit and delete actions

Date : 2026-06-23

Objectif : permettre la modification et la suppression.

- bouton Modifier ;
- remplissage du formulaire en mode modification ;
- bouton Annuler la modification ;
- bouton Supprimer ;
- confirmation avant suppression.

## 7a45c14 - Excel: Add local SheetJS library

Date : 2026-06-23

Objectif : intégrer SheetJS localement.

- ajout de `libs/xlsx.full.min.js` ;
- ajout de la licence SheetJS ;
- ajout de `libs/README.md` pour expliquer le rôle des fichiers externes ;
- préparation de la lecture Excel sans dépendance distante.

## bd20460 - Excel: Load sectorization workbooks

Date : 2026-06-23

Objectif : tester le chargement dynamique des fichiers Excel depuis `data`.

- configuration des fichiers attendus ;
- première lecture des classeurs de sectorisation ;
- affichage de statuts dans l'interface.

Limite ensuite remplacée : cette approche demandait un serveur local avec certains navigateurs.

## 13389ef - Excel: Validate workbook columns

Date : 2026-06-23

Objectif : valider les colonnes nécessaires.

- détection des lignes d'en-tête ;
- validation des colonnes adulte, PCH et enfant ;
- normalisation des textes ;
- extraction des lignes utilisables.

## 8bf6cc7 - Excel: Add city and school suggestions

Date : 2026-06-23

Objectif : proposer des villes et écoles pendant la saisie.

- suggestions de villes depuis les fichiers Excel ;
- suggestions d'écoles / GEVASCO depuis la sectorisation enfant ;
- tolérance sur accents, apostrophes, tirets et espaces.

## 5547ffd - Excel: Add instructor lookup

Date : 2026-06-23

Objectif : déduire l'instructrice à partir des données Excel.

- recherche adulte par ville ;
- recherche PCH par ville ;
- recherche enfant par école puis par ville ;
- statut "À vérifier" pour les cas ambigus ou hors département ;
- affichage de l'instructrice dans la carte document.

## e12885c - Data: Convert sectorization workbooks to JSON

Date : 2026-06-23

Objectif : essayer une solution sans serveur avec données converties.

- script de conversion Excel vers JSON/JS ;
- génération de `data/sectorisation-data.json` ;
- génération de `data/sectorisation-data.js`.

Limite ensuite remplacée : il fallait régénérer les fichiers quand les Excel changeaient.

## 7fa6165 - Excel: Use converted sectorization data

Date : 2026-06-23

Objectif : utiliser les données converties dans PILOTE.

- chargement de `data/sectorisation-data.js` ;
- suppression de la lecture Excel automatique au runtime ;
- conservation des suggestions et de l'attribution automatique.

Limite ensuite remplacée : cette solution ajoutait des fichiers générés peu pratiques à maintenir.

## Excel: Require manual sectorization import

Date : 2026-06-24

Objectif : remplacer les données générées par un import manuel des Excel.

- suppression du chargement de `data/sectorisation-data.js` ;
- suppression de `data/sectorisation-data.js` et `data/sectorisation-data.json` ;
- suppression du script `scripts/convert-sectorization-data.js` ;
- chargement de SheetJS dans `index.html` ;
- zone d'import très visible pour les 3 fichiers Excel de sectorisation ;
- bouton "Démarrer la session" bloqué tant que les 3 fichiers ne sont pas validés ;
- champs agent et date bloqués tant que les 3 fichiers ne sont pas validés ;
- lecture des fichiers choisis par l'agent avec `FileReader` ;
- conservation de la validation des colonnes ;
- conservation des suggestions de villes et d'écoles / GEVASCO ;
- conservation de l'attribution automatique de l'instructrice.

Limites volontaires :

- pas de serveur local ;
- pas de conversion JSON ;
- pas de sauvegarde persistante ;
- pas d'import PDF ;
- pas de statistiques.

## Stats: Add live and instructor statistics

Date : 2026-06-24

Objectif : afficher les statistiques de la session en temps réel.

- ajout d'une zone "Statistiques" dans l'écran des documents ;
- comptage du total des documents ;
- comptage des demandes ;
- comptage des pièces complémentaires ;
- comptage des recours ;
- comptage des documents PCH ;
- comptage des documents hors département ;
- comptage des documents par instructrice ;
- mise à jour automatique après ajout, modification ou suppression d'un document.

Limites volontaires :

- pas d'export statistique ;
- pas d'écriture dans `statistiques.xlsx` ;
- pas de graphique ;
- pas de sauvegarde persistante.

## Excel: Improve normalized suggestions

Date : 2026-06-24

Objectif : rendre les suggestions de villes et d'écoles plus tolérantes pendant la saisie.

- ajout de variantes sans accents dans les suggestions ;
- meilleure prise en compte des saisies en majuscules ;
- meilleure prise en compte des tirets remplacés par des espaces ;
- conservation de la comparaison normalisée pour l'attribution d'instructrice.
