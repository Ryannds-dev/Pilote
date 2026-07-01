<p align="center">
  <img src="assets/logo-header.png" alt="PILOTE" width="360">
</p>

# PILOTE

PILOTE est un outil local d'aide au traitement des documents numérisés pour une MDPH.

Il permet de préparer un lot de documents, de déterminer l'instructrice concernée à partir des fichiers Excel de sectorisation, d'associer les PDF et d'exporter les fichiers classés par instructrice.

PILOTE ne remplace pas MultiGest et n'interagit pas directement avec ses bannettes.

## Confidentialité

- aucun backend ;
- aucune base de données ;
- aucune donnée envoyée sur Internet ;
- aucune donnée enregistrée automatiquement dans le navigateur ;
- fichiers Excel et PDF lus uniquement après leur sélection par l'agent.

Les bibliothèques nécessaires sont incluses dans le projet. Une connexion Internet n'est donc pas nécessaire pour utiliser PILOTE.

## Prérequis

- un poste Windows avec un navigateur récent ;
- les trois fichiers Excel de sectorisation adulte, PCH et enfant ;
- les PDF à traiter ;
- aucun logiciel supplémentaire à installer ;
- aucun serveur local à démarrer.

Microsoft Edge ou Google Chrome sont recommandés pour créer directement les dossiers d'export. Firefox reste compatible grâce à l'export ZIP.

## Ouvrir PILOTE

1. Conserver tous les fichiers et dossiers du projet ensemble.
2. Ouvrir le fichier `index.html`.
3. Si nécessaire, faire un clic droit sur `index.html`, choisir **Ouvrir avec**, puis sélectionner Edge, Chrome ou Firefox.

Le projet peut être copié sur un emplacement local ou réseau accessible par l'agent, sous réserve des règles internes de la DNUM.

## Utilisation

1. Importer les trois fichiers Excel dans les emplacements correspondants.
2. Vérifier que la zone d'import devient verte.
3. Indiquer l'agent et la date de tampon.
4. Démarrer la session.
5. Ajouter chaque document et associer son PDF.
6. Vérifier l'instructrice proposée et corriger manuellement uniquement si nécessaire.
7. Utiliser la recherche et les filtres pour contrôler le lot.
8. Sauvegarder régulièrement la session en JSON.
9. Consulter la vérification automatique située en bas de la page.
10. Corriger les erreurs bloquantes puis exporter les PDF.

## Fichiers de sectorisation

Les fichiers Excel doivent être importés à chaque ouverture de PILOTE. Ce choix permet de toujours utiliser les fichiers sélectionnés par l'agent, sans serveur et sans conversion préalable.

PILOTE :

- vérifie que chaque fichier est placé dans le bon emplacement ;
- recherche les colonnes attendues même si leur ligne change ;
- refuse les fichiers vides ou dont le format ne correspond pas ;
- récupère les villes, écoles et instructrices ;
- accepte les recherches sans accents et tolère les différences de tirets, apostrophes, espaces et majuscules.

La session ne peut pas commencer tant que les trois fichiers ne sont pas validés.

## Documents et sectorisation

Pour chaque document, PILOTE conserve notamment :

- le nom MultiGest ;
- le public adulte ou enfant ;
- le type de document ;
- la ville ;
- l'école ou le GEVASCO si nécessaire ;
- les cas PCH et hors département ;
- l'instructrice proposée ou corrigée ;
- le statut de sectorisation ;
- le PDF associé.

Les recours, les cas hors département et les recherches sans résultat certain sont signalés comme étant à vérifier. Ils seront placés dans `A_VERIFIER` lors de l'export.

Un doublon de nom MultiGest déclenche une confirmation et reste visible grâce à un badge dédié.

## Sauvegarder et reprendre une session

Le bouton **Sauvegarder** télécharge un fichier JSON contenant les informations de la session et des documents.

- plusieurs clics sans modification ne créent pas de nouvelle sauvegarde ;
- PILOTE avertit avant de fermer une session modifiée qui n'a pas été sauvegardée ;
- une sauvegarde peut être rechargée après l'import des trois fichiers Excel ;
- un JSON vide, invalide ou incompatible est refusé.

Le JSON ne contient pas les PDF eux-mêmes. Après la reprise d'une session, les PDF doivent donc être associés de nouveau.

## Gestion des PDF

PILOTE vérifie l'extension et le contenu réel des PDF sélectionnés. Un fichier vide ou simplement renommé en `.pdf` est refusé.

Avant l'export final, il ne faut pas supprimer, déplacer ou renommer les PDF d'origine. Le navigateur garde seulement un accès temporaire aux fichiers tant que la page reste ouverte.

## Vérification avant export

Le contrôle situé en bas de la page affiche :

- le nombre total de documents ;
- les PDF manquants ou à réassocier ;
- les attributions à vérifier ;
- les doublons de nom MultiGest.

Les PDF manquants bloquent l'export. Les attributions à vérifier et les doublons affichent un avertissement, puis demandent une confirmation. La validation interne continue de refuser un document auquel il manque une information obligatoire.

## Export selon le navigateur

| Navigateur | Méthode | Résultat |
| --- | --- | --- |
| Microsoft Edge | Dossiers directs | Un dossier de session contenant un dossier par instructrice |
| Google Chrome | Dossiers directs | Un dossier de session contenant un dossier par instructrice |
| Mozilla Firefox | Fichier ZIP | Un ZIP contenant les mêmes dossiers par instructrice |

### Edge et Chrome

1. Cliquer sur **Choisir un dossier et exporter**.
2. Sélectionner l'emplacement de destination.
3. PILOTE crée le dossier de session et les dossiers des instructrices.

Si le dossier de session existe déjà, PILOTE crée un nouveau dossier avec `_2`, `_3`, etc. Aucun ancien export n'est remplacé silencieusement.

### Firefox

1. Cliquer sur **Télécharger l'export pour Firefox**.
2. Retrouver le ZIP dans les téléchargements.
3. Faire un clic droit sur le ZIP puis choisir **Extraire tout**.

### Nommage des PDF

Chaque PDF exporté porte le nom saisi dans le champ **Nom MultiGest**, quelle que soit l'appellation du fichier PDF sélectionné sur l'ordinateur.

Si plusieurs documents portent le même nom MultiGest dans un dossier d'instructrice :

- le premier conserve son nom ;
- les suivants reçoivent les suffixes MultiGest `_002`, `_003`, etc.

### Vérifier manuellement le navigateur

1. Ouvrir PILOTE dans le navigateur à tester.
2. Appuyer sur `F12`.
3. Ouvrir l'onglet **Console**.
4. Saisir :

```javascript
typeof window.showDirectoryPicker
```

- Firefox affiche `"undefined"`.
- Edge et Chrome affichent `"function"`.

PILOTE effectue automatiquement cette vérification pour activer la bonne méthode.

## Statistiques

Les statistiques sont mises à jour après chaque ajout, modification ou suppression :

- total des documents ;
- demandes ;
- pièces complémentaires ;
- recours ;
- PCH ;
- hors département ;
- comptage par instructrice.

Les statistiques ne sont pas exportées dans un fichier séparé. Elles restent consultables dans PILOTE et dans les informations de la session JSON.

## Recherche et filtres

La liste peut être filtrée par :

- nom MultiGest ;
- présence ou absence du PDF ;
- instructrice ;
- type de document.

Les filtres modifient uniquement l'affichage. Ils ne changent et ne suppriment aucune donnée.

## Problèmes fréquents

### Le démarrage reste bloqué

Vérifier que les trois fichiers Excel sont importés au bon endroit et que chaque ligne de statut est verte.

### Une ville ou une école n'est pas proposée

Vérifier le fichier Excel importé et poursuivre la saisie. PILOTE tolère les accents, espaces et tirets, mais la donnée doit exister dans les fichiers sélectionnés.

### Un PDF est refusé

Vérifier qu'il s'agit réellement d'un PDF non vide. Changer uniquement l'extension d'un autre fichier ne suffit pas.

### L'export est désactivé

Consulter la vérification automatique en bas de page. Tous les documents doivent posséder un PDF et leurs informations obligatoires.

### Le bouton de création des dossiers est désactivé

Le navigateur ne prend probablement pas en charge cette fonction. Utiliser le ZIP ou ouvrir PILOTE avec Edge ou Chrome.

## Limites connues

- pas d'écriture dans MultiGest ;
- pas d'accès direct aux bannettes ;
- pas de sauvegarde automatique ;
- pas de restauration des PDF depuis le JSON ;
- pas d'écriture dans le fichier `statistiques.xlsx` ;
- pas d'export statistique séparé ;
- création directe des dossiers indisponible dans Firefox.

## Structure du projet

```text
/assets      Images, logos, icônes et informations de licence
/data        Fichiers Excel de sectorisation
/exports     Emplacement réservé aux exports manuels
/libs        SheetJS, JSZip et leurs licences
/sessions    Emplacement réservé aux sauvegardes JSON
index.html   Structure de l'interface
style.css    Présentation et responsive
app.js       Fonctionnement de PILOTE
README.md    Guide d'installation et d'utilisation
COMMIT_HISTORY.md
```

Les dossiers `sessions` et `exports` ne sont pas remplis automatiquement par le navigateur. L'agent choisit l'emplacement des téléchargements ou de l'export.

## Bibliothèques externes

- SheetJS Community Edition `0.20.3` pour lire les fichiers Excel ;
- JSZip `3.10.1` pour produire l'export ZIP ;
- Tabler Icons pour les icônes de navigateurs.

Les fichiers sont chargés localement. Leurs sources et licences sont documentées dans `libs/README.md` et `assets/README.md`.

## Développement

Le projet utilise uniquement HTML, CSS et JavaScript vanilla. Il n'utilise aucun framework, gestionnaire de paquets, backend ou service distant.

Pour une modification :

1. éditer les fichiers concernés ;
2. ouvrir `index.html` dans un navigateur ;
3. vérifier le parcours sur Edge ou Chrome et sur Firefox ;
4. conserver `COMMIT_HISTORY.md` à jour.
