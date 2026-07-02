"use strict";

const genesisStep = {
  title: "Genèse",
  description:
    "Le projet part d'un constat métier : numériser un document ne suffit pas. Il doit encore être orienté vers la bonne instructrice.",
  video: "videos/0 GENESE DU PROJET.mp4"
};

const presentationSteps = [
  {
    number: 1,
    title: "Présentation générale",
    description:
      "Découvrir le rôle de PILOTE, son fonctionnement local et sa place aux côtés de MultiGest.",
    video: "videos/1 Présentation générale de l'outil.mp4"
  },
  {
    number: 2,
    title: "Importation des sectorisations",
    description:
      "Charger et valider les fichiers Excel adulte, PCH et enfant avant de commencer le traitement.",
    video: "videos/2 Importation des sectorisations.mp4"
  },
  {
    number: 3,
    title: "Démarrage d'une session",
    description:
      "Renseigner l'agent et la date de tampon pour créer automatiquement une session identifiable.",
    video: "videos/3 Demarrage d'une session.mp4"
  },
  {
    number: 4,
    title: "Ajout d'un document",
    description:
      "Reporter les informations utiles, rechercher l'instructrice et associer le PDF correspondant.",
    video: "videos/4 Ajout d'un document.mp4"
  },
  {
    number: 5,
    title: "Gestion des documents ajoutés",
    description:
      "Suivre le lot, retrouver un document, utiliser les filtres et repérer les situations à vérifier.",
    video: "videos/5 Gestion des documents ajoutés.mp4"
  },
  {
    number: 6,
    title: "Sauvegarde de la session",
    description:
      "Télécharger une sauvegarde JSON et reprendre ultérieurement les informations de la session.",
    video: "videos/6 Sauvegarde de la session.mp4"
  },
  {
    number: 7,
    title: "Exportation finale",
    description:
      "Contrôler les documents puis récupérer les PDF classés par instructrice selon le navigateur utilisé.",
    video: "videos/7 Exporation finale.mp4"
  }
];

document.addEventListener("DOMContentLoaded", initializePresentation);

function initializePresentation() {
  renderGenesisSection();
  renderTimelineSteps();
  prepareScrollAnimations();
  updateTimelineProgress();
  scrollToRequestedStep();

  window.addEventListener("scroll", updateTimelineProgress, { passive: true });
  window.addEventListener("resize", updateTimelineProgress);
}

function scrollToRequestedStep() {
  if (!window.location.hash) {
    return;
  }

  const requestedElement = document.querySelector(window.location.hash);

  if (!requestedElement) {
    return;
  }

  window.requestAnimationFrame(() => {
    requestedElement.scrollIntoView({ block: "center" });
  });
}

function renderGenesisSection() {
  document.getElementById("genese-description").textContent =
    genesisStep.description;
  document.getElementById("genese-video").appendChild(
    createVideoFrame(genesisStep.video, genesisStep.title)
  );
}

function renderTimelineSteps() {
  const timelineSteps = document.getElementById("timeline-steps");

  presentationSteps.forEach((step) => {
    timelineSteps.appendChild(createTimelineStep(step));
  });
}

function createTimelineStep(step) {
  const article = document.createElement("article");
  const marker = document.createElement("div");
  const card = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");

  article.className = "timeline-step";
  article.id = `etape-${step.number}`;

  marker.className = "timeline-marker";
  marker.textContent = step.number;
  marker.setAttribute("aria-hidden", "true");

  card.className = "timeline-card";
  title.textContent = step.title;
  description.textContent = step.description;

  card.append(
    title,
    description,
    createVideoFrame(step.video, step.title)
  );
  article.append(marker, card);

  return article;
}

function createVideoFrame(videoSource, videoTitle) {
  const frame = document.createElement("div");
  const video = document.createElement("video");

  frame.className = "video-frame";
  video.controls = true;
  video.preload = "metadata";
  video.playsInline = true;
  video.src = encodeURI(videoSource);
  video.setAttribute("aria-label", `Vidéo : ${videoTitle}`);

  frame.appendChild(video);

  return frame;
}

function prepareScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".reveal-on-scroll, .timeline-step"
  );

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    animatedElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
}

function updateTimelineProgress() {
  const timeline = document.getElementById("timeline");
  const progress = document.getElementById("timeline-progress");
  const timelineBounds = timeline.getBoundingClientRect();
  const viewportReference = window.innerHeight * 0.58;
  const traveledDistance = viewportReference - timelineBounds.top;
  const progressRatio = Math.min(
    1,
    Math.max(0, traveledDistance / timelineBounds.height)
  );

  progress.style.height = `${progressRatio * 100}%`;
}
