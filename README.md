# PILOTE

PILOTE est un outil web local destiné à aider les agents d'une MDPH pendant le traitement des documents numérisés.

Ce premier commit met uniquement en place le squelette du projet. Aucune fonctionnalité métier n'est encore développée.

## Objectif du Commit 1

- Créer la structure initiale du projet.
- Afficher une page d'accueil statique.
- Prévoir un emplacement pour le logo PILOTE.
- Prévoir une zone pour le futur démarrage de session.
- Indiquer clairement qu'aucune donnée n'est envoyée sur Internet.

## Structure

```text
/assets
/data
/sessions
/exports
index.html
style.css
app.js
README.md
```

## Contraintes

- HTML, CSS et JavaScript vanilla uniquement.
- Aucun framework.
- Aucun backend.
- Aucune base de données.
- Fonctionnement local.
- Aucune donnée envoyée sur Internet.

## État actuel

La page `index.html` affiche :

- le titre PILOTE ;
- un emplacement prévu pour le futur logo ;
- un court texte de présentation ;
- un message clair sur la confidentialité ;
- une zone réservée au futur écran de démarrage de session.
