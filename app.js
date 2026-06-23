"use strict";

const PUBLIC_TYPES = {
  ADULT: "adulte",
  CHILD: "enfant"
};

const DOCUMENT_TYPES = {
  REQUEST: "demande",
  COMPLEMENTARY: "piece_complementaire",
  APPEAL: "recours"
};

const SECTORIZATION_STATUS = {
  PENDING: "pending",
  FOUND: "found",
  WARNING: "warning",
  MANUAL: "manual"
};

const EXCEL_FILES = {
  ADULT: {
    label: "Sectorisation adulte",
    path: "data/sectorisation_adulte.xlsx",
    convertedSourceKey: "adult"
  },
  PCH: {
    label: "Sectorisation PCH",
    path: "data/sectorisation_pch.xlsx",
    convertedSourceKey: "pch"
  },
  CHILD: {
    label: "Sectorisation enfant",
    path: "data/sectorisation_enfant.xlsx",
    convertedSourceKey: "child"
  },
  STATISTICS: {
    label: "Statistiques",
    path: "data/statistiques.xlsx",
    optional: true
  }
};

const currentSession = {
  agent: "",
  tamponDate: "",
  sessionId: "",
  createdAt: "",
  documents: []
};

let documentIdCounter = 0;
let editedDocumentId = "";

const excelData = {
  files: {},
  references: {
    cities: [],
    schools: []
  },
  errors: []
};

document.addEventListener("DOMContentLoaded", () => {
  const formulaireDemarrage = document.getElementById("formulaire-demarrage-session");
  const formulaireDocument = document.getElementById("formulaire-document");
  const cancelEditButton = document.getElementById("bouton-annuler-modification");

  formulaireDemarrage.addEventListener("submit", handleSessionStart);
  formulaireDocument.addEventListener("submit", handleDocumentSubmit);
  cancelEditButton.addEventListener("click", cancelDocumentEdition);
  loadConvertedSectorizationData();
});

function loadConvertedSectorizationData() {
  renderExcelFileStatuses();

  if (!window.PILOTE_SECTORIZATION_DATA?.sources) {
    markAllExcelFilesAsUnavailable("Données de sectorisation converties indisponibles.");
    return;
  }

  loadConvertedSource("ADULT");
  loadConvertedSource("PCH");
  loadConvertedSource("CHILD");
  markOptionalStatisticsFile();

  buildExcelReferences();
  renderExcelSuggestions();
  renderExcelFileStatuses();
}

function loadConvertedSource(fileKey) {
  const fileConfig = EXCEL_FILES[fileKey];
  const convertedSource = window.PILOTE_SECTORIZATION_DATA.sources[fileConfig.convertedSourceKey];

  if (!convertedSource) {
    excelData.files[fileKey] = {
      ...fileConfig,
      status: "error",
      usableRows: [],
      errors: ["données converties introuvables"]
    };

    return;
  }

  excelData.files[fileKey] = {
    ...fileConfig,
    status: "validated",
    sourceFileName: convertedSource.sourceFileName,
    selectedSheetName: convertedSource.selectedSheetName,
    usableRows: convertedSource.rows || [],
    errors: []
  };
}

function markOptionalStatisticsFile() {
  const fileConfig = EXCEL_FILES.STATISTICS;

  excelData.files.STATISTICS = {
    ...fileConfig,
    status: "missing_optional",
    usableRows: [],
    errors: ["fichier optionnel absent"]
  };
}

function markAllExcelFilesAsUnavailable(message) {
  Object.entries(EXCEL_FILES).forEach(([fileKey, fileConfig]) => {
    excelData.files[fileKey] = {
      ...fileConfig,
      status: "error",
      usableRows: [],
      errors: [message]
    };
  });

  renderExcelFileStatuses();
}

function renderExcelFileStatuses() {
  const excelFileList = document.getElementById("liste-fichiers-excel");

  if (!excelFileList) {
    return;
  }

  excelFileList.innerHTML = "";

  Object.entries(EXCEL_FILES).forEach(([fileKey, fileConfig]) => {
    const fileState = excelData.files[fileKey];
    const statusItem = document.createElement("li");
    const fileName = document.createElement("strong");
    const fileMessage = document.createElement("span");
    const status = fileState?.status || "pending";

    statusItem.className = `statut-fichier-excel ${getExcelStatusClass(status)}`;
    fileName.textContent = fileConfig.label;
    fileMessage.textContent = getExcelStatusMessage(fileState, fileConfig);

    statusItem.appendChild(fileName);
    statusItem.appendChild(fileMessage);
    excelFileList.appendChild(statusItem);
  });
}

function getExcelStatusClass(status) {
  if (status === "loaded" || status === "validated") {
    return "ok";
  }

  if (status === "missing_optional") {
    return "warning";
  }

  if (status === "error") {
    return "error";
  }

  return "";
}

function getExcelStatusMessage(fileState, fileConfig) {
  if (!fileState) {
    return "En attente de chargement.";
  }

  if (fileState.status === "validated") {
    return `${fileState.usableRows.length} ligne(s) utilisable(s), source ${fileState.sourceFileName}.`;
  }

  if (fileState.status === "missing_optional") {
    return `Fichier optionnel absent : ${fileConfig.path}.`;
  }

  return `Chargement impossible : ${fileState.errors.join(", ")}.`;
}

function buildExcelReferences() {
  const cityMap = new Map();
  const schoolMap = new Map();

  addCityReferences(cityMap, "ADULT");
  addCityReferences(cityMap, "PCH");
  addCityReferences(cityMap, "CHILD");
  addSchoolReferences(schoolMap, "CHILD");

  excelData.references.cities = [...cityMap.values()].sort(compareReferenceLabels);
  excelData.references.schools = [...schoolMap.values()].sort(compareReferenceLabels);
}

function addCityReferences(cityMap, fileKey) {
  const fileState = excelData.files[fileKey];

  if (!fileState?.usableRows) {
    return;
  }

  fileState.usableRows.forEach((row) => {
    addReference(cityMap, row.city);
  });
}

function addSchoolReferences(schoolMap, fileKey) {
  const fileState = excelData.files[fileKey];

  if (!fileState?.usableRows) {
    return;
  }

  fileState.usableRows.forEach((row) => {
    addReference(schoolMap, row.school);
  });
}

function addReference(referenceMap, label) {
  const cleanLabel = String(label || "").trim();

  if (!cleanLabel) {
    return;
  }

  const normalizedLabel = normalizeExcelText(cleanLabel);

  if (!referenceMap.has(normalizedLabel)) {
    referenceMap.set(normalizedLabel, {
      label: cleanLabel,
      normalizedLabel
    });
  }
}

function compareReferenceLabels(firstReference, secondReference) {
  return firstReference.label.localeCompare(secondReference.label, "fr");
}

function renderExcelSuggestions() {
  renderDatalistOptions("suggestions-villes", excelData.references.cities);
  renderDatalistOptions("suggestions-ecoles-gevasco", excelData.references.schools);
}

function renderDatalistOptions(datalistId, references) {
  const datalist = document.getElementById(datalistId);

  if (!datalist) {
    return;
  }

  datalist.innerHTML = "";

  references.forEach((reference) => {
    const option = document.createElement("option");

    option.value = reference.label;
    datalist.appendChild(option);
  });
}

function normalizeExcelText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`´-]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

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
  currentSession.documents = [];
  editedDocumentId = "";

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
  updateDocumentCounter();
  renderDocumentList();
  document.getElementById("carte-session-creee").hidden = false;
  document.getElementById("zone-documents").hidden = false;
}

function formatDateForDisplay(dateValue) {
  const [year, month, day] = dateValue.split("-");

  return `${day}/${month}/${year}`;
}

function generateDocumentId() {
  const timestamp = Date.now();

  documentIdCounter += 1;

  return `doc_${timestamp}_${documentIdCounter}`;
}

function createDocument(documentData = {}) {
  const now = new Date().toISOString();
  const document = {
    id: "",
    multigestFileName: "",
    publicType: "",
    documentType: "",
    pchOnly: false,
    city: "",
    gevascoSchoolOrCity: "",
    outOfDepartment: false,
    instructor: "",
    sectorizationSource: "",
    sectorizationStatus: SECTORIZATION_STATUS.PENDING,
    pdfLoaded: false,
    pdfFileName: "",
    createdAt: "",
    updatedAt: "",
    ...documentData
  };

  document.id = document.id || generateDocumentId();
  document.createdAt = document.createdAt || now;
  document.updatedAt = now;

  return document;
}

function addDocumentToSession(documentData = {}) {
  if (!currentSession.sessionId) {
    throw new Error("Impossible d'ajouter un document : aucune session n'est démarrée.");
  }

  const document = createDocument(documentData);

  currentSession.documents.push(document);
  updateDocumentCounter();
  renderDocumentList();

  return document;
}

function handleDocumentSubmit(event) {
  event.preventDefault();

  const documentData = getDocumentFormData();
  const validationMessage = validateDocumentForm(documentData);

  if (validationMessage) {
    showDocumentFormError(validationMessage);
    return;
  }

  const documentDataWithSectorization = applySectorizationToDocumentData(documentData);

  if (editedDocumentId) {
    updateDocumentInSession(editedDocumentId, documentDataWithSectorization);
  } else {
    addDocumentToSession(documentDataWithSectorization);
  }

  clearDocumentFormError();
  resetDocumentForm();
}

function getDocumentFormData() {
  return {
    multigestFileName: document.getElementById("champ-nom-multigest").value.trim(),
    publicType: document.getElementById("champ-public").value,
    documentType: document.getElementById("champ-type-document").value,
    pchOnly: document.getElementById("champ-pch").checked,
    city: document.getElementById("champ-ville").value.trim(),
    gevascoSchoolOrCity: document.getElementById("champ-gevasco").value.trim(),
    outOfDepartment: document.getElementById("champ-hors-departement").checked
  };
}

function validateDocumentForm(documentData) {
  if (!documentData.multigestFileName) {
    return "Veuillez indiquer le nom MultiGest du document.";
  }

  if (!documentData.publicType) {
    return "Veuillez sélectionner le public concerné.";
  }

  if (!documentData.documentType) {
    return "Veuillez sélectionner le type de document.";
  }

  return "";
}

function showDocumentFormError(message) {
  document.getElementById("message-erreur-document").textContent = message;
}

function clearDocumentFormError() {
  document.getElementById("message-erreur-document").textContent = "";
}

function applySectorizationToDocumentData(documentData) {
  const sectorizationResult = findInstructorForDocument(documentData);

  return {
    ...documentData,
    instructor: sectorizationResult.instructor,
    sectorizationSource: sectorizationResult.source,
    sectorizationStatus: sectorizationResult.status
  };
}

function findInstructorForDocument(documentData) {
  if (documentData.outOfDepartment) {
    return createSectorizationResult("", "", SECTORIZATION_STATUS.WARNING);
  }

  if (documentData.pchOnly) {
    return findInstructorByCity("PCH", documentData.city);
  }

  if (documentData.publicType === PUBLIC_TYPES.CHILD) {
    return findChildInstructor(documentData);
  }

  if (documentData.publicType === PUBLIC_TYPES.ADULT) {
    return findInstructorByCity("ADULT", documentData.city);
  }

  return createSectorizationResult("", "", SECTORIZATION_STATUS.PENDING);
}

function findChildInstructor(documentData) {
  if (documentData.gevascoSchoolOrCity) {
    const schoolResult = findInstructorBySchool(documentData.gevascoSchoolOrCity);

    if (schoolResult.status === SECTORIZATION_STATUS.FOUND) {
      return schoolResult;
    }
  }

  return findInstructorByCity("CHILD", documentData.city);
}

function findInstructorBySchool(schoolName) {
  const matchingRows = findRowsByNormalizedValue("CHILD", "school", schoolName);

  return buildInstructorResultFromRows("CHILD", matchingRows);
}

function findInstructorByCity(fileKey, cityName) {
  const matchingRows = findRowsByNormalizedValue(fileKey, "city", cityName);

  return buildInstructorResultFromRows(fileKey, matchingRows);
}

function findRowsByNormalizedValue(fileKey, fieldName, value) {
  const fileState = excelData.files[fileKey];
  const normalizedValue = normalizeExcelText(value);

  if (!fileState?.usableRows || !normalizedValue) {
    return [];
  }

  return fileState.usableRows.filter((row) => {
    return normalizeExcelText(row[fieldName]) === normalizedValue;
  });
}

function buildInstructorResultFromRows(fileKey, rows) {
  if (rows.length === 0) {
    return createSectorizationResult("", "", SECTORIZATION_STATUS.PENDING);
  }

  const instructorNames = [
    ...new Set(rows.map((row) => row.instructor).filter(Boolean))
  ];

  if (instructorNames.length !== 1) {
    return createSectorizationResult(
      "",
      EXCEL_FILES[fileKey].label,
      SECTORIZATION_STATUS.WARNING
    );
  }

  return createSectorizationResult(
    instructorNames[0],
    EXCEL_FILES[fileKey].label,
    SECTORIZATION_STATUS.FOUND
  );
}

function createSectorizationResult(instructor, source, status) {
  return {
    instructor,
    source,
    status
  };
}

function updateDocumentInSession(documentId, documentData) {
  const documentIndex = currentSession.documents.findIndex((documentItem) => {
    return documentItem.id === documentId;
  });

  if (documentIndex === -1) {
    throw new Error("Impossible de modifier ce document : il est introuvable.");
  }

  currentSession.documents[documentIndex] = {
    ...currentSession.documents[documentIndex],
    ...documentData,
    updatedAt: new Date().toISOString()
  };

  renderDocumentList();
}

function deleteDocumentFromSession(documentId) {
  const documentToDelete = currentSession.documents.find((documentItem) => {
    return documentItem.id === documentId;
  });

  if (!documentToDelete) {
    return;
  }

  const deletionConfirmed = window.confirm(
    `Supprimer le document "${documentToDelete.multigestFileName}" ?`
  );

  if (!deletionConfirmed) {
    return;
  }

  currentSession.documents = currentSession.documents.filter((documentItem) => {
    return documentItem.id !== documentId;
  });

  if (editedDocumentId === documentId) {
    resetDocumentForm();
  }

  updateDocumentCounter();
  renderDocumentList();
}

function startDocumentEdition(documentId) {
  const documentToEdit = currentSession.documents.find((documentItem) => {
    return documentItem.id === documentId;
  });

  if (!documentToEdit) {
    return;
  }

  editedDocumentId = documentId;
  fillDocumentForm(documentToEdit);
  document.getElementById("message-erreur-document").textContent = "";
  document.querySelector(".bouton-ajouter-document").textContent =
    "Enregistrer les modifications";
  document.getElementById("bouton-annuler-modification").hidden = false;
}

function fillDocumentForm(documentItem) {
  document.getElementById("champ-nom-multigest").value =
    documentItem.multigestFileName;
  document.getElementById("champ-public").value = documentItem.publicType;
  document.getElementById("champ-type-document").value =
    documentItem.documentType;
  document.getElementById("champ-pch").checked = documentItem.pchOnly;
  document.getElementById("champ-ville").value = documentItem.city;
  document.getElementById("champ-gevasco").value =
    documentItem.gevascoSchoolOrCity;
  document.getElementById("champ-hors-departement").checked =
    documentItem.outOfDepartment;
}

function cancelDocumentEdition() {
  resetDocumentForm();
  clearDocumentFormError();
}

function resetDocumentForm() {
  document.getElementById("formulaire-document").reset();
  editedDocumentId = "";
  document.querySelector(".bouton-ajouter-document").textContent =
    "Ajouter le document";
  document.getElementById("bouton-annuler-modification").hidden = true;
}

function updateDocumentCounter() {
  const documentCounter = document.getElementById("nombre-documents-session");

  if (!documentCounter) {
    return;
  }

  documentCounter.textContent = currentSession.documents.length;
}

function renderDocumentList() {
  const documentList = document.getElementById("liste-documents");
  const emptyListMessage = document.getElementById("message-liste-vide");

  if (!documentList || !emptyListMessage) {
    return;
  }

  documentList.innerHTML = "";
  emptyListMessage.hidden = currentSession.documents.length > 0;

  currentSession.documents.forEach((documentItem) => {
    documentList.appendChild(createDocumentCard(documentItem));
  });
}

function createDocumentCard(documentItem) {
  const documentCard = document.createElement("article");
  const pdfIcon = document.createElement("img");
  const cardContent = document.createElement("div");
  const documentTitle = document.createElement("p");
  const documentDetails = document.createElement("div");
  const documentActions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  documentCard.className = "carte-document";
  pdfIcon.className = "icone-pdf-document";
  pdfIcon.src = "assets/empty-icon.svg";
  pdfIcon.alt = "PDF non associé";
  cardContent.className = "contenu-carte-document";
  documentTitle.className = "titre-document";
  documentTitle.textContent = documentItem.multigestFileName;
  documentDetails.className = "details-document";
  documentActions.className = "actions-document";
  editButton.className = "bouton-modifier-document";
  editButton.type = "button";
  editButton.textContent = "Modifier";
  editButton.addEventListener("click", () => {
    startDocumentEdition(documentItem.id);
  });
  deleteButton.className = "bouton-supprimer-document";
  deleteButton.type = "button";
  deleteButton.textContent = "Supprimer";
  deleteButton.addEventListener("click", () => {
    deleteDocumentFromSession(documentItem.id);
  });

  addDocumentDetail(documentDetails, `Public : ${formatPublicType(documentItem.publicType)}`);
  addDocumentDetail(documentDetails, `Type : ${formatDocumentType(documentItem.documentType)}`);
  addDocumentDetail(documentDetails, `Ville : ${documentItem.city || "Non renseignée"}`);
  addDocumentDetail(documentDetails, `Instructrice : ${formatInstructor(documentItem)}`);

  if (documentItem.gevascoSchoolOrCity) {
    addDocumentDetail(documentDetails, `École / GEVASCO : ${documentItem.gevascoSchoolOrCity}`);
  }

  if (documentItem.pchOnly) {
    addDocumentDetail(documentDetails, "PCH uniquement");
  }

  if (documentItem.outOfDepartment) {
    addDocumentDetail(documentDetails, "Hors département");
  }

  cardContent.appendChild(documentTitle);
  cardContent.appendChild(documentDetails);
  documentActions.appendChild(editButton);
  documentActions.appendChild(deleteButton);
  cardContent.appendChild(documentActions);
  documentCard.appendChild(pdfIcon);
  documentCard.appendChild(cardContent);

  return documentCard;
}

function addDocumentDetail(documentDetails, text) {
  const detail = document.createElement("span");

  detail.className = "detail-document";
  detail.textContent = text;
  documentDetails.appendChild(detail);
}

function formatPublicType(publicType) {
  if (publicType === PUBLIC_TYPES.ADULT) {
    return "Adulte";
  }

  if (publicType === PUBLIC_TYPES.CHILD) {
    return "Enfant";
  }

  return "Non renseigné";
}

function formatDocumentType(documentType) {
  if (documentType === DOCUMENT_TYPES.REQUEST) {
    return "Demande";
  }

  if (documentType === DOCUMENT_TYPES.COMPLEMENTARY) {
    return "Pièce complémentaire";
  }

  if (documentType === DOCUMENT_TYPES.APPEAL) {
    return "Recours";
  }

  return "Non renseigné";
}

function formatInstructor(documentItem) {
  if (documentItem.instructor) {
    return documentItem.instructor;
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.WARNING) {
    return "À vérifier";
  }

  return "Non trouvée";
}
