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

## Docs: Clarify PDF file handling

Date : 2026-06-26

Objectif : préciser dans la documentation comment PILOTE gère les PDF sélectionnés.

- ajout d'une remarque dédiée aux PDF dans le README ;
- précision que PILOTE ne crée pas de copie automatique des PDF ;
- indication de conserver les PDF d'origine tant que l'export final n'est pas terminé ;
- rappel qu'après rechargement JSON, les PDF devront être réassociés.

Point d'attention :

- cette précision évite de laisser croire qu'une sauvegarde JSON ou une association PDF protège déjà les fichiers PDF eux-mêmes.

## UX: Move session tools to side panel

Date : 2026-06-26

Objectif : rendre l'écran principal plus clair en séparant les manipulations du lot et les actions de gestion de session.

- déplacement de l'import JSON de session dans un panneau latéral ;
- déplacement du bouton de sauvegarde JSON dans le même panneau ;
- conservation du bloc central pour les fichiers Excel, le démarrage, les documents et les statistiques ;
- bouton de sauvegarde visible mais désactivé tant qu'aucune session n'est ouverte ;
- sur les écrans de plus de `1100 px`, panneau de gestion affiché à droite et conservé à l'écran pendant le défilement ;
- sur les écrans de `1100 px` ou moins, panneau placé au-dessus des manipulations principales et affichage ramené sur une seule colonne.

Point d'attention :

- les fonctionnalités n'ont pas changé ; seul leur emplacement a été revu pour éviter que les options de sauvegarde/import perturbent la saisie principale.

## UX: Place form beside document list

Date : 2026-06-26

Objectif : rendre la saisie plus pratique en affichant le formulaire à côté de la liste des documents.

- formulaire d'ajout de document placé à gauche ;
- liste des documents placée à droite ;
- statistiques déplacées dans le panneau latéral pour rester visibles ;
- sur les écrans de plus de `1100 px`, formulaire et liste affichés côte à côte, avec le panneau latéral conservé à l'écran pendant le défilement ;
- sur les écrans de `1100 px` ou moins, formulaire, liste et panneau latéral affichés les uns sous les autres ;
- sur les écrans de `640 px` ou moins, formulaire ramené sur une seule colonne et boutons principaux affichés sur toute la largeur.

Point d'attention :

- la difficulté était de garder les informations utiles sous les yeux sans transformer le centre de l'écran en mélange de boutons, statistiques et saisie.

## UX: Make document list easier to manage

Date : 2026-06-26

Objectif : faciliter la saisie quand la session contient beaucoup de documents.

- ajout du nombre de documents directement dans le titre "Documents ajoutés" ;
- ajout d'un numéro visible sur chaque document pour faciliter le repérage dans les longues listes ;
- recalcul automatique des numéros selon l'ordre de la liste après une suppression ;
- liste des documents isolée dans un panneau visuellement distinct ;
- sur les écrans de plus de `1100 px`, hauteur de la liste limitée précisément à la hauteur du formulaire situé à gauche ;
- apparition immédiate du défilement interne dès que les documents dépassent la hauteur du bouton d'ajout ;
- ajustement automatique de cette hauteur quand le formulaire change ou quand la fenêtre est redimensionnée ;
- sur les écrans de `1100 px` ou moins, suppression du défilement interne et retour à une liste complète sous le formulaire ;
- sur les écrans de `640 px` ou moins, cartes de documents ramenées sur une seule colonne et boutons affichés sur toute la largeur ;
- sur les écrans de `420 px` ou moins, statistiques affichées sur une seule colonne pour rester lisibles.

Point d'attention :

- l'enjeu était d'éviter les grands allers-retours dans la page entre la saisie et la liste lorsque beaucoup de documents sont ajoutés ;
- le CSS ne peut pas connaître seul la hauteur variable du formulaire : une synchronisation JavaScript observe donc ses changements de taille ;
- le numéro sert uniquement de repère visuel : il n'est pas enregistré comme une donnée du document et reste toujours cohérent avec sa place actuelle dans la liste.

## Search: Add document search and filters

Date : 2026-06-26

Objectif : retrouver rapidement les documents utiles dans une session chargée.

- recherche instantanée dans le nom MultiGest ;
- recherche tolérante aux majuscules, accents, apostrophes, tirets et espaces ;
- filtre des documents avec PDF associé ou PDF manquant ;
- filtre par instructrice, avec une liste construite à partir des documents de la session ;
- filtre par type de document : demande, pièce complémentaire ou recours ;
- combinaison possible de plusieurs critères ;
- bouton permettant d'effacer tous les filtres ;
- affichage du nombre de résultats par rapport au nombre total de documents ;
- message distinct quand la session est vide et quand aucun document ne correspond ;
- conservation du numéro d'origine des documents dans les résultats filtrés ;
- sur les écrans de `640 px` ou moins, filtres affichés sur une seule colonne.

Points d'attention :

- les filtres modifient uniquement l'affichage : ils ne changent et ne suppriment aucune donnée ;
- le filtre « PDF manquant » inclut également les PDF à réassocier après l'import d'une sauvegarde JSON ;
- la liste des instructrices est actualisée après chaque ajout, modification, suppression ou restauration de document.

## Excel: Show completed import state

Date : 2026-06-27

Objectif : rendre immédiatement visible l'état global des fichiers de sectorisation.

- contour jaune tant que les trois fichiers Excel ne sont pas validés ;
- contour et fond verts lorsque les trois imports sont terminés correctement ;
- retour automatique à l'état jaune si un fichier est retiré ou devient invalide ;
- conservation des messages détaillés pour connaître l'état de chaque fichier.

Point d'attention :

- la couleur dépend de la validation réelle des trois fichiers, pas seulement de leur sélection.

## Export: Support folders and ZIP

Date : 2026-06-27

Objectif : exporter les PDF classés par instructrice sans exclure Firefox.

- ajout de JSZip `3.10.1` dans `libs` pour fonctionner sans Internet ;
- ajout des licences et des sources des fichiers externes ;
- ajout d'une zone d'information avec les icônes Edge, Chrome et Firefox ;
- export direct dans des dossiers avec les navigateurs compatibles ;
- choix du dossier de destination par l'agent avant toute écriture ;
- création d'un dossier portant le nom de la session puis d'un sous-dossier par instructrice ;
- export ZIP avec la même organisation pour Firefox et les autres navigateurs ;
- rangement des cas non attribués ou à vérifier dans `A_VERIFIER` ;
- blocage de l'export tant qu'un PDF manque ;
- nettoyage des caractères interdits dans les noms de dossiers et de fichiers ;
- ajout automatique d'un numéro quand plusieurs PDF portent le même nom ;
- présentation des exports sous forme de deux parcours détaillés pour Edge/Chrome et Firefox ;
- indication automatique de la méthode recommandée dans le navigateur utilisé ;
- étapes visibles pour choisir le dossier ou extraire le ZIP après téléchargement ;
- libellés de boutons précisant directement l'action réalisée ;
- rappel visible concernant le dossier `A_VERIFIER` ;
- aucun export CSV ni export séparé des statistiques.

Points d'attention :

- une page web ne peut écrire que dans un dossier explicitement choisi par l'agent ;
- Firefox ne propose pas l'accès direct au dossier : le ZIP assure donc la compatibilité ;
- les explications utilisent des actions concrètes et évitent de demander à l'agent de connaître les différences techniques entre navigateurs ;
- les PDF sont traités localement et ne sont envoyés sur aucun service extérieur ;
- l'export ne remplace pas la sauvegarde JSON de la session.
