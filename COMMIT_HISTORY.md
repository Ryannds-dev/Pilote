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

## Excel: Match child schools with city

Date : 2026-06-24

Objectif : fiabiliser l'attribution enfant quand plusieurs écoles portent le même nom.

- croisement de l'école / GEVASCO avec la ville saisie ;
- attribution à partir des lignes qui correspondent à la fois à l'école et à la ville ;
- conservation du repli par ville si l'école ne donne pas de résultat clair.

## Excel: Clarify wrong file imports

Date : 2026-06-24

Objectif : rendre les erreurs d'import Excel plus compréhensibles.

- message dédié quand le fichier adulte ne correspond pas ;
- message dédié quand le fichier PCH ne correspond pas ;
- message dédié quand le fichier enfant ne correspond pas ;
- suppression du message trop technique sur les colonnes introuvables.

## Sectorization: Handle special cases

Date : 2026-06-25

Objectif : mieux gérer les cas particuliers de sectorisation dans la session.

- ajout d'un champ de correction manuelle de l'instructrice ;
- suggestions d'instructrices issues des fichiers Excel importés ;
- priorité donnée à l'instructrice saisie manuellement quand elle est renseignée ;
- affichage d'un statut de sectorisation sur chaque document ;
- mise en évidence des documents à vérifier ;
- gestion des recours en statut à vérifier ;
- indication de la source de sectorisation dans la carte document.

Limites volontaires :

- pas de sauvegarde persistante de la correction manuelle ;
- pas encore de filtre dédié aux documents à vérifier ;
- pas de workflow de validation séparé.

## PDF: Add document PDF import

Date : 2026-06-25

Objectif : permettre l'association d'un fichier PDF à chaque document.

- ajout d'un champ d'import PDF dans le formulaire document ;
- contrôle des fichiers PDF uniquement ;
- conservation du PDF existant lors d'une modification si aucun nouveau fichier n'est choisi ;
- affichage du nom du PDF associé ;
- ajout d'une icône PDF colorée quand un PDF est présent ;
- conservation de l'icône grisée quand aucun PDF n'est associé ;
- ajout d'un statut visuel PDF présent ou manquant dans chaque carte document.

Limites volontaires :

- pas encore d'export ZIP ;
- pas encore de vérification globale avant export ;
- les fichiers PDF restent en mémoire tant que la page est ouverte.

## Save: Add manual JSON session backup

Date : 2026-06-25

Objectif : permettre à l'agent de sauvegarder et reprendre une session sans base de données.

- ajout d'un bouton "Sauvegarder la session" ;
- export d'un fichier JSON nommé avec l'identifiant de session ;
- import d'une sauvegarde JSON PILOTE ;
- restauration de l'agent, de la date de tampon, du nom de session et des documents ;
- blocage de l'import JSON tant que les fichiers de sectorisation ne sont pas chargés ;
- détection des clics de sauvegarde inutiles quand rien n'a changé depuis la dernière sauvegarde ;
- message clair si la sauvegarde ne crée pas de nouveau fichier ;
- confirmation avant de remplacer une session déjà ouverte.

Points d'attention :

- le bouton de sauvegarde reste utilisable pour rassurer l'agent, mais aucun nouveau fichier n'est téléchargé si la session n'a pas changé ;
- le JSON ne peut pas contenir les fichiers PDF eux-mêmes ;
- après rechargement, PILOTE affiche le nom du PDF connu et demande de le réassocier ;
- cette sauvegarde est volontairement manuelle : pas de stockage caché dans le navigateur pour l'instant.

Limites volontaires :

- pas de sauvegarde automatique ;
- pas d'export ZIP ;
- pas d'export statistique ;
- pas de restauration automatique des fichiers PDF.
