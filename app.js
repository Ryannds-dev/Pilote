"use strict";

const currentSession = {
  agent: "",
  tamponDate: "",
  sessionId: "",
  createdAt: ""
};

document.addEventListener("DOMContentLoaded", () => {
  const formulaireDemarrage = document.getElementById("formulaire-demarrage-session");

  formulaireDemarrage.addEventListener("submit", handleSessionStart);
});

function handleSessionStart(event) {
  event.preventDefault();

  const agentValue = document.getElementById("champ-agent").value;
  const tamponDateValue = document.getElementById("champ-date-tampon").value;
  const validationMessage = validateStartForm(agentValue, tamponDateValue);

  if (validationMessage) {
    showStartFormError(validationMessage);
    return;
  }

  const cleanAgent = formatAgentName(agentValue);

  currentSession.agent = cleanAgent;
  currentSession.tamponDate = tamponDateValue;
  currentSession.sessionId = generateSessionId(tamponDateValue, cleanAgent);
  currentSession.createdAt = new Date().toISOString();

  clearStartFormError();
  showSessionInformation(currentSession);
}

function validateStartForm(agentValue, tamponDateValue) {
  if (!agentValue.trim()) {
    return "Veuillez indiquer les initiales ou le nom court de l'agent.";
  }

  if (!tamponDateValue) {
    return "Veuillez indiquer la date de tampon.";
  }

  return "";
}

function generateSessionId(tamponDateValue, agentValue) {
  return `${tamponDateValue}_${agentValue}`;
}

function formatAgentName(agentValue) {
  return agentValue.trim().replace(/\s+/g, "-").toUpperCase();
}

function showStartFormError(message) {
  document.getElementById("message-erreur-demarrage").textContent = message;
}

function clearStartFormError() {
  document.getElementById("message-erreur-demarrage").textContent = "";
}

function showSessionInformation(session) {
  document.getElementById("formulaire-demarrage-session").hidden = true;
  document.getElementById("valeur-agent-session").textContent = session.agent;
  document.getElementById("valeur-date-session").textContent = formatDateForDisplay(session.tamponDate);
  document.getElementById("valeur-nom-session").textContent = session.sessionId;
  document.getElementById("carte-session-creee").hidden = false;
}

function formatDateForDisplay(dateValue) {
  const [year, month, day] = dateValue.split("-");

  return `${day}/${month}/${year}`;
}
