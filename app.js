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

const SAVE_FORMAT_VERSION = 1;

const EXCEL_FILES = {
  ADULT: {
    label: "Sectorisation adulte",
    inputId: "fichier-sectorisation-adulte",
    invalidFileMessage:
      "Ce fichier ne semble pas être la sectorisation adulte. Vérifiez le fichier sélectionné.",
    requiredColumns: {
      city: ["commune"],
      instructor: ["assistant de gestion"]
    }
  },
  PCH: {
    label: "Sectorisation PCH",
    inputId: "fichier-sectorisation-pch",
    invalidFileMessage:
      "Ce fichier ne semble pas être la sectorisation PCH. Vérifiez le fichier sélectionné.",
    requiredColumns: {
      city: ["commune"],
      instructor: ["instructeur pch"]
    }
  },
  CHILD: {
    label: "Sectorisation enfant",
    inputId: "fichier-sectorisation-enfant",
    invalidFileMessage:
      "Ce fichier ne semble pas être la sectorisation enfant. Vérifiez le fichier sélectionné.",
    requiredColumns: {
      school: ["nom"],
      city: ["commune"],
      instructor: ["instructrice enfant"]
    }
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
let lastSavedSessionSignature = "";

const excelData = {
  files: {},
  references: {
    cities: [],
    schools: [],
    instructors: []
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const formulaireDemarrage = document.getElementById("formulaire-demarrage-session");
  const formulaireDocument = document.getElementById("formulaire-document");
  const cancelEditButton = document.getElementById("bouton-annuler-modification");
  const saveSessionButton = document.getElementById("bouton-sauvegarder-session");
  const sessionImportInput = document.getElementById("fichier-session-json");

  formulaireDemarrage.addEventListener("submit", handleSessionStart);
  formulaireDocument.addEventListener("submit", handleDocumentSubmit);
  cancelEditButton.addEventListener("click", cancelDocumentEdition);
  saveSessionButton.addEventListener("click", saveCurrentSession);
  sessionImportInput.addEventListener("change", () => {
    handleSessionFileSelection(sessionImportInput.files[0]);
  });

  prepareExcelImportArea();
  prepareDocumentFilters();
  synchronizeDocumentPanelsHeight();
  updateSaveControls("Sauvegarde disponible après le démarrage d'une session.");
});

function prepareDocumentFilters() {
  const searchInput = document.getElementById("recherche-documents");
  const pdfFilter = document.getElementById("filtre-pdf");
  const instructorFilter = document.getElementById("filtre-instructrice");
  const documentTypeFilter = document.getElementById("filtre-type-document");
  const clearFiltersButton = document.getElementById("bouton-effacer-filtres");

  searchInput.addEventListener("input", renderDocumentList);
  pdfFilter.addEventListener("change", renderDocumentList);
  instructorFilter.addEventListener("change", renderDocumentList);
  documentTypeFilter.addEventListener("change", renderDocumentList);
  clearFiltersButton.addEventListener("click", clearDocumentFilters);
}

function clearDocumentFilters() {
  document.getElementById("recherche-documents").value = "";
  document.getElementById("filtre-pdf").value = "";
  document.getElementById("filtre-instructrice").value = "";
  document.getElementById("filtre-type-document").value = "";
  renderDocumentList();
}

function synchronizeDocumentPanelsHeight() {
  const documentFormArea = document.querySelector(".zone-ajout-document");
  const documentListArea = document.querySelector(".zone-liste-documents");
  const wideScreen = window.matchMedia("(min-width: 1101px)");

  if (!documentFormArea || !documentListArea) {
    return;
  }

  const updateDocumentListHeight = () => {
    if (wideScreen.matches) {
      documentListArea.style.height = `${documentFormArea.offsetHeight}px`;
      return;
    }

    documentListArea.style.height = "";
  };

  const formSizeObserver = new ResizeObserver(updateDocumentListHeight);

  formSizeObserver.observe(documentFormArea);
  wideScreen.addEventListener("change", updateDocumentListHeight);
  updateDocumentListHeight();
}

function prepareExcelImportArea() {
  Object.entries(EXCEL_FILES).forEach(([fileKey, fileConfig]) => {
    excelData.files[fileKey] = {
      ...fileConfig,
      status: "waiting",
      sourceFileName: "",
      selectedSheetName: "",
      usableRows: [],
      errors: []
    };

    const fileInput = document.getElementById(fileConfig.inputId);

    fileInput.addEventListener("change", () => {
      handleExcelFileSelection(fileKey, fileInput.files[0]);
    });
  });

  renderExcelFileStatuses();
  updateSessionStartAvailability();
}

function handleExcelFileSelection(fileKey, selectedFile) {
  if (!selectedFile) {
    resetExcelFileState(fileKey);
    return;
  }

  excelData.files[fileKey].status = "loading";
  excelData.files[fileKey].sourceFileName = selectedFile.name;
  excelData.files[fileKey].errors = [];
  renderExcelFileStatuses();
  updateSessionStartAvailability();

  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    try {
      readExcelWorkbook(fileKey, event.target.result, selectedFile.name);
      buildExcelReferences();
      renderExcelSuggestions();
    } catch (error) {
      setExcelFileError(fileKey, selectedFile.name, error.message);
    }

    renderExcelFileStatuses();
    updateSessionStartAvailability();
  };

  fileReader.onerror = () => {
    setExcelFileError(fileKey, selectedFile.name, "lecture du fichier impossible");
    renderExcelFileStatuses();
    updateSessionStartAvailability();
  };

  fileReader.readAsArrayBuffer(selectedFile);
}

function resetExcelFileState(fileKey) {
  excelData.files[fileKey] = {
    ...excelData.files[fileKey],
    status: "waiting",
    sourceFileName: "",
    selectedSheetName: "",
    usableRows: [],
    errors: []
  };

  buildExcelReferences();
  renderExcelSuggestions();
  renderExcelFileStatuses();
  updateSessionStartAvailability();
}

function readExcelWorkbook(fileKey, fileContent, sourceFileName) {
  if (!window.XLSX) {
    throw new Error("bibliothèque SheetJS indisponible");
  }

  const workbook = XLSX.read(fileContent, { type: "array" });
  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    return {
      name: sheetName,
      rows: XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false
      })
    };
  });

  const sheetValidation = findValidSheet(
    sheets,
    EXCEL_FILES[fileKey].requiredColumns
  );

  if (!sheetValidation) {
    throw new Error(EXCEL_FILES[fileKey].invalidFileMessage);
  }

  excelData.files[fileKey] = {
    ...excelData.files[fileKey],
    status: "validated",
    sourceFileName,
    selectedSheetName: sheetValidation.sheetName,
    usableRows: sheetValidation.usableRows,
    errors: []
  };
}

function findValidSheet(sheets, requiredColumns) {
  for (const sheet of sheets) {
    const sheetValidation = validateSheetRows(sheet, requiredColumns);

    if (sheetValidation) {
      return {
        ...sheetValidation,
        sheetName: sheet.name
      };
    }
  }

  return null;
}

function validateSheetRows(sheet, requiredColumns) {
  for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex += 1) {
    const headerRow = sheet.rows[rowIndex];
    const columnMap = findExpectedColumns(headerRow, requiredColumns);

    if (columnMap) {
      return {
        usableRows: buildUsableRows(sheet.rows.slice(rowIndex + 1), columnMap)
      };
    }
  }

  return null;
}

function findExpectedColumns(headerRow, requiredColumns) {
  const columnMap = {};

  for (const [fieldName, acceptedHeaders] of Object.entries(requiredColumns)) {
    const columnIndex = headerRow.findIndex((headerCell) => {
      return acceptedHeaders.some((acceptedHeader) => {
        return normalizeExcelText(headerCell) === normalizeExcelText(acceptedHeader);
      });
    });

    if (columnIndex === -1) {
      return null;
    }

    columnMap[fieldName] = columnIndex;
  }

  return columnMap;
}

function buildUsableRows(rows, columnMap) {
  return rows
    .map((row) => {
      return buildUsableRow(row, columnMap);
    })
    .filter(isUsableRow);
}

function buildUsableRow(row, columnMap) {
  const usableRow = {};

  Object.entries(columnMap).forEach(([fieldName, columnIndex]) => {
    usableRow[fieldName] = String(row[columnIndex] || "").trim();
  });

  return usableRow;
}

function isUsableRow(row) {
  const hasContent = Object.values(row).some((value) => value !== "");

  if (!hasContent) {
    return false;
  }

  if (normalizeExcelText(row.city) === "commune") {
    return false;
  }

  if (normalizeExcelText(row.instructor).includes("instructeur")) {
    return false;
  }

  if (normalizeExcelText(row.instructor) === "assistant de gestion") {
    return false;
  }

  return true;
}

function setExcelFileError(fileKey, sourceFileName, message) {
  excelData.files[fileKey] = {
    ...excelData.files[fileKey],
    status: "error",
    sourceFileName,
    selectedSheetName: "",
    usableRows: [],
    errors: [message]
  };

  buildExcelReferences();
  renderExcelSuggestions();
}

function areRequiredExcelFilesReady() {
  return Object.values(excelData.files).every((fileState) => {
    return fileState.status === "validated";
  });
}

function updateSessionStartAvailability() {
  const startButton = document.querySelector(".bouton-demarrer-session");
  const agentInput = document.getElementById("champ-agent");
  const tamponDateInput = document.getElementById("champ-date-tampon");
  const sessionImportInput = document.getElementById("fichier-session-json");
  const excelMessage = document.getElementById("message-import-excel");
  const sessionImportMessage = document.getElementById("message-import-session");
  const excelImportArea = document.querySelector(".zone-excel");
  const ready = areRequiredExcelFilesReady();

  startButton.disabled = !ready;
  agentInput.disabled = !ready;
  tamponDateInput.disabled = !ready;
  sessionImportInput.disabled = !ready;
  excelImportArea.classList.toggle("zone-excel-validee", ready);

  if (ready) {
    excelMessage.textContent =
      "Import terminé : vous pouvez démarrer une session.";
    excelMessage.className = "message-import-excel message-import-excel-ok";
    sessionImportMessage.textContent =
      "Vous pouvez aussi importer une sauvegarde JSON existante.";
    sessionImportMessage.className = "message-import-session message-import-session-ok";
    return;
  }

  excelMessage.textContent =
    "Import obligatoire : chargez les 3 fichiers pour débloquer le démarrage de session.";
  excelMessage.className = "message-import-excel message-import-excel-attente";
  sessionImportMessage.textContent =
    "Import disponible après les fichiers de sectorisation.";
  sessionImportMessage.className = "message-import-session";
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
    const status = fileState?.status || "waiting";

    statusItem.className = `statut-fichier-excel ${getExcelStatusClass(status)}`;
    fileName.textContent = fileConfig.label;
    fileMessage.textContent = getExcelStatusMessage(fileState);

    statusItem.appendChild(fileName);
    statusItem.appendChild(fileMessage);
    excelFileList.appendChild(statusItem);
  });
}

function getExcelStatusClass(status) {
  if (status === "validated") {
    return "ok";
  }

  if (status === "loading") {
    return "loading";
  }

  if (status === "error") {
    return "error";
  }

  return "waiting";
}

function getExcelStatusMessage(fileState) {
  if (!fileState || fileState.status === "waiting") {
    return "Fichier à importer.";
  }

  if (fileState.status === "loading") {
    return `Lecture en cours : ${fileState.sourceFileName}.`;
  }

  if (fileState.status === "validated") {
    return `${fileState.usableRows.length} ligne(s) utilisable(s), fichier ${fileState.sourceFileName}.`;
  }

  return `Import impossible : ${fileState.errors.join(", ")}.`;
}

function buildExcelReferences() {
  const cityMap = new Map();
  const schoolMap = new Map();
  const instructorMap = new Map();

  addCityReferences(cityMap, "ADULT");
  addCityReferences(cityMap, "PCH");
  addCityReferences(cityMap, "CHILD");
  addSchoolReferences(schoolMap, "CHILD");
  addInstructorReferences(instructorMap, "ADULT");
  addInstructorReferences(instructorMap, "PCH");
  addInstructorReferences(instructorMap, "CHILD");

  excelData.references.cities = [...cityMap.values()].sort(compareReferenceLabels);
  excelData.references.schools = [...schoolMap.values()].sort(compareReferenceLabels);
  excelData.references.instructors = [...instructorMap.values()].sort(compareReferenceLabels);
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

function addInstructorReferences(instructorMap, fileKey) {
  const fileState = excelData.files[fileKey];

  if (!fileState?.usableRows) {
    return;
  }

  fileState.usableRows.forEach((row) => {
    addReference(instructorMap, row.instructor);
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
  renderDatalistOptions("suggestions-instructrices", excelData.references.instructors);
}

function renderDatalistOptions(datalistId, references) {
  const datalist = document.getElementById(datalistId);
  const displayedSuggestions = new Set();

  if (!datalist) {
    return;
  }

  datalist.innerHTML = "";

  references.forEach((reference) => {
    addDatalistOption(datalist, displayedSuggestions, reference.label);
    addDatalistOption(
      datalist,
      displayedSuggestions,
      reference.normalizedLabel.toUpperCase()
    );
  });
}

function addDatalistOption(datalist, displayedSuggestions, value) {
  const cleanValue = String(value || "").trim();
  const suggestionKey = cleanValue.toLowerCase();

  if (!cleanValue || displayedSuggestions.has(suggestionKey)) {
    return;
  }

  const option = document.createElement("option");

  option.value = cleanValue;
  datalist.appendChild(option);
  displayedSuggestions.add(suggestionKey);
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
  lastSavedSessionSignature = "";

  clearStartFormError();
  showSessionInformation(currentSession);
  updateSaveControls("");
}

function validateStartForm(agentValue, tamponDateValue) {
  if (!areRequiredExcelFilesReady()) {
    return "Veuillez importer les fichiers de sectorisation avant de démarrer.";
  }

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
  updateStatisticsDisplay();
  document.getElementById("carte-session-creee").hidden = false;
  document.getElementById("zone-documents").hidden = false;
}

function saveCurrentSession() {
  if (!currentSession.sessionId) {
    updateSaveControls("Aucune session à sauvegarder.");
    return;
  }

  const currentSignature = createCurrentSessionSignature();

  if (lastSavedSessionSignature === currentSignature) {
    updateSaveControls("Aucune modification depuis la dernière sauvegarde.");
    return;
  }

  const saveContent = JSON.stringify(buildSessionSaveFile(), null, 2);
  const fileName = `${currentSession.sessionId}.json`;

  downloadTextFile(fileName, saveContent);
  lastSavedSessionSignature = currentSignature;
  updateSaveControls(`Session sauvegardée : ${fileName}.`);
}

function buildSessionSaveFile() {
  return {
    app: "PILOTE",
    formatVersion: SAVE_FORMAT_VERSION,
    savedAt: new Date().toISOString(),
    session: buildSerializableSession()
  };
}

function buildSerializableSession() {
  return {
    agent: currentSession.agent,
    tamponDate: currentSession.tamponDate,
    sessionId: currentSession.sessionId,
    createdAt: currentSession.createdAt,
    documents: currentSession.documents.map(buildSerializableDocument)
  };
}

function buildSerializableDocument(documentItem) {
  return {
    id: documentItem.id,
    multigestFileName: documentItem.multigestFileName,
    publicType: documentItem.publicType,
    documentType: documentItem.documentType,
    pchOnly: documentItem.pchOnly,
    city: documentItem.city,
    gevascoSchoolOrCity: documentItem.gevascoSchoolOrCity,
    outOfDepartment: documentItem.outOfDepartment,
    instructor: documentItem.instructor,
    manualInstructor: documentItem.manualInstructor,
    sectorizationSource: documentItem.sectorizationSource,
    sectorizationStatus: documentItem.sectorizationStatus,
    pdfLoaded: documentItem.pdfLoaded,
    pdfFileName: documentItem.pdfFileName,
    pdfNeedsReimport: documentItem.pdfNeedsReimport,
    createdAt: documentItem.createdAt,
    updatedAt: documentItem.updatedAt
  };
}

function createCurrentSessionSignature() {
  return JSON.stringify(buildSerializableSession());
}

function downloadTextFile(fileName, content) {
  const fileBlob = new Blob([content], { type: "application/json" });
  const temporaryLink = document.createElement("a");
  const temporaryUrl = URL.createObjectURL(fileBlob);

  temporaryLink.href = temporaryUrl;
  temporaryLink.download = fileName;
  document.body.appendChild(temporaryLink);
  temporaryLink.click();
  temporaryLink.remove();
  URL.revokeObjectURL(temporaryUrl);
}

function handleSessionFileSelection(selectedFile) {
  if (!selectedFile) {
    return;
  }

  if (!areRequiredExcelFilesReady()) {
    showSessionImportMessage(
      "Importez les fichiers de sectorisation avant de reprendre une session.",
      true
    );
    resetSessionImportInput();
    return;
  }

  if (!isJsonFile(selectedFile)) {
    showSessionImportMessage("Le fichier sélectionné doit être un JSON.", true);
    resetSessionImportInput();
    return;
  }

  if (currentSession.sessionId && !confirmSessionReplacement()) {
    resetSessionImportInput();
    return;
  }

  readSessionSaveFile(selectedFile);
}

function isJsonFile(file) {
  const fileName = String(file.name || "").toLowerCase();

  return file.type === "application/json" || fileName.endsWith(".json");
}

function confirmSessionReplacement() {
  return window.confirm(
    "Une session est déjà ouverte. Importer une sauvegarde remplacera la session affichée."
  );
}

function readSessionSaveFile(selectedFile) {
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    try {
      const saveFile = JSON.parse(event.target.result);

      restoreSessionFromSaveFile(saveFile);
      showSessionImportMessage(`Session importée : ${selectedFile.name}.`, false);
    } catch (error) {
      showSessionImportMessage(error.message, true);
    }

    resetSessionImportInput();
  };

  fileReader.onerror = () => {
    showSessionImportMessage("Lecture de la sauvegarde impossible.", true);
    resetSessionImportInput();
  };

  fileReader.readAsText(selectedFile);
}

function restoreSessionFromSaveFile(saveFile) {
  validateSessionSaveFile(saveFile);

  const restoredSession = saveFile.session;

  currentSession.agent = String(restoredSession.agent || "").trim();
  currentSession.tamponDate = String(restoredSession.tamponDate || "").trim();
  currentSession.sessionId = String(restoredSession.sessionId || "").trim();
  currentSession.createdAt = String(restoredSession.createdAt || "").trim();
  currentSession.documents = restoredSession.documents.map(normalizeImportedDocument);
  editedDocumentId = "";
  documentIdCounter = currentSession.documents.length;
  lastSavedSessionSignature = createCurrentSessionSignature();

  clearStartFormError();
  clearDocumentFormError();
  resetDocumentForm();
  showSessionInformation(currentSession);
  updateSaveControls("Session importée. Aucun changement depuis l'import.");
}

function validateSessionSaveFile(saveFile) {
  if (!saveFile || saveFile.app !== "PILOTE") {
    throw new Error("Ce fichier ne semble pas être une sauvegarde PILOTE.");
  }

  if (saveFile.formatVersion !== SAVE_FORMAT_VERSION) {
    throw new Error("Cette sauvegarde PILOTE n'a pas le format attendu.");
  }

  if (!saveFile.session || !saveFile.session.sessionId) {
    throw new Error("La sauvegarde ne contient pas de session valide.");
  }

  if (!saveFile.session.agent || !saveFile.session.tamponDate) {
    throw new Error("La sauvegarde ne contient pas les informations de session attendues.");
  }

  if (!Array.isArray(saveFile.session.documents)) {
    throw new Error("La liste des documents est absente ou invalide.");
  }
}

function normalizeImportedDocument(documentItem) {
  const hadPdfInSavedSession = Boolean(
    (documentItem.pdfLoaded || documentItem.pdfNeedsReimport) &&
      documentItem.pdfFileName
  );

  return createDocument({
    id: String(documentItem.id || ""),
    multigestFileName: String(documentItem.multigestFileName || ""),
    publicType: String(documentItem.publicType || ""),
    documentType: String(documentItem.documentType || ""),
    pchOnly: Boolean(documentItem.pchOnly),
    city: String(documentItem.city || ""),
    gevascoSchoolOrCity: String(documentItem.gevascoSchoolOrCity || ""),
    outOfDepartment: Boolean(documentItem.outOfDepartment),
    instructor: String(documentItem.instructor || ""),
    manualInstructor: String(documentItem.manualInstructor || ""),
    sectorizationSource: String(documentItem.sectorizationSource || ""),
    sectorizationStatus: String(documentItem.sectorizationStatus || SECTORIZATION_STATUS.PENDING),
    pdfLoaded: false,
    pdfFileName: String(documentItem.pdfFileName || ""),
    pdfFile: null,
    pdfNeedsReimport: hadPdfInSavedSession,
    createdAt: String(documentItem.createdAt || ""),
    updatedAt: String(documentItem.updatedAt || "")
  });
}

function resetSessionImportInput() {
  document.getElementById("fichier-session-json").value = "";
}

function showSessionImportMessage(message, isError) {
  const sessionImportMessage = document.getElementById("message-import-session");

  sessionImportMessage.textContent = message;
  sessionImportMessage.className = isError
    ? "message-import-session message-import-session-erreur"
    : "message-import-session message-import-session-ok";
}

function updateSaveControls(message) {
  const saveButton = document.getElementById("bouton-sauvegarder-session");
  const saveMessage = document.getElementById("message-sauvegarde-session");

  if (!saveMessage) {
    return;
  }

  saveButton.disabled = !currentSession.sessionId;
  saveMessage.textContent = message;
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
    manualInstructor: "",
    sectorizationSource: "",
    sectorizationStatus: SECTORIZATION_STATUS.PENDING,
    pdfLoaded: false,
    pdfFileName: "",
    pdfFile: null,
    pdfNeedsReimport: false,
    createdAt: "",
    updatedAt: "",
    ...documentData
  };

  document.id = document.id || generateDocumentId();
  document.createdAt = document.createdAt || now;
  document.updatedAt = document.updatedAt || now;

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
  updateStatisticsDisplay();
  updateSaveControls("Modifications non sauvegardées.");

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
  const selectedPdfFile = document.getElementById("champ-pdf-document").files[0] || null;
  const existingDocument = getEditedDocument();

  return {
    multigestFileName: document.getElementById("champ-nom-multigest").value.trim(),
    publicType: document.getElementById("champ-public").value,
    documentType: document.getElementById("champ-type-document").value,
    pchOnly: document.getElementById("champ-pch").checked,
    city: document.getElementById("champ-ville").value.trim(),
    gevascoSchoolOrCity: document.getElementById("champ-gevasco").value.trim(),
    manualInstructor: document.getElementById("champ-instructrice-manuelle").value.trim(),
    outOfDepartment: document.getElementById("champ-hors-departement").checked,
    pdfLoaded: selectedPdfFile ? true : Boolean(existingDocument?.pdfLoaded),
    pdfFileName: selectedPdfFile ? selectedPdfFile.name : existingDocument?.pdfFileName || "",
    pdfFile: selectedPdfFile || existingDocument?.pdfFile || null,
    pdfNeedsReimport: selectedPdfFile ? false : Boolean(existingDocument?.pdfNeedsReimport)
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

  if (documentData.pdfFile && !isPdfFile(documentData.pdfFile)) {
    return "Le fichier associé doit être un PDF.";
  }

  return "";
}

function isPdfFile(file) {
  const fileName = String(file.name || "").toLowerCase();

  return file.type === "application/pdf" || fileName.endsWith(".pdf");
}

function getEditedDocument() {
  if (!editedDocumentId) {
    return null;
  }

  return currentSession.documents.find((documentItem) => {
    return documentItem.id === editedDocumentId;
  }) || null;
}

function showDocumentFormError(message) {
  document.getElementById("message-erreur-document").textContent = message;
}

function clearDocumentFormError() {
  document.getElementById("message-erreur-document").textContent = "";
}

function applySectorizationToDocumentData(documentData) {
  if (documentData.manualInstructor) {
    return {
      ...documentData,
      instructor: documentData.manualInstructor,
      sectorizationSource: "Correction manuelle",
      sectorizationStatus: SECTORIZATION_STATUS.MANUAL
    };
  }

  const sectorizationResult = findInstructorForDocument(documentData);

  return {
    ...documentData,
    instructor: sectorizationResult.instructor,
    sectorizationSource: sectorizationResult.source,
    sectorizationStatus: sectorizationResult.status
  };
}

function findInstructorForDocument(documentData) {
  if (documentData.documentType === DOCUMENT_TYPES.APPEAL) {
    return createSectorizationResult("", "Recours", SECTORIZATION_STATUS.WARNING);
  }

  if (documentData.outOfDepartment) {
    return createSectorizationResult("", "Hors département", SECTORIZATION_STATUS.WARNING);
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
    const schoolResult = findInstructorBySchool(
      documentData.gevascoSchoolOrCity,
      documentData.city
    );

    if (schoolResult.status === SECTORIZATION_STATUS.FOUND) {
      return schoolResult;
    }
  }

  return findInstructorByCity("CHILD", documentData.city);
}

function findInstructorBySchool(schoolName, cityName) {
  const matchingRows = findRowsByNormalizedValue("CHILD", "school", schoolName);
  const matchingRowsInCity = filterRowsByNormalizedValue(
    matchingRows,
    "city",
    cityName
  );

  if (matchingRowsInCity.length > 0) {
    return buildInstructorResultFromRows("CHILD", matchingRowsInCity);
  }

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

function filterRowsByNormalizedValue(rows, fieldName, value) {
  const normalizedValue = normalizeExcelText(value);

  if (!normalizedValue) {
    return [];
  }

  return rows.filter((row) => {
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
  updateStatisticsDisplay();
  updateSaveControls("Modifications non sauvegardées.");
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
  updateStatisticsDisplay();
  updateSaveControls("Modifications non sauvegardées.");
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
  document.getElementById("champ-instructrice-manuelle").value =
    documentItem.manualInstructor || "";
  document.getElementById("champ-hors-departement").checked =
    documentItem.outOfDepartment;
  document.getElementById("message-pdf-actuel").textContent =
    documentItem.pdfNeedsReimport
      ? `PDF à réassocier : ${documentItem.pdfFileName}`
      : documentItem.pdfLoaded
      ? `PDF déjà associé : ${documentItem.pdfFileName}`
      : "Aucun PDF associé.";
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
  document.getElementById("message-pdf-actuel").textContent = "";
}

function updateDocumentCounter() {
  const documentCounter = document.getElementById("nombre-documents-session");
  const documentListCounter = document.getElementById("nombre-documents-liste");

  if (documentCounter) {
    documentCounter.textContent = currentSession.documents.length;
  }

  if (documentListCounter) {
    documentListCounter.textContent = currentSession.documents.length;
  }
}

function updateStatisticsDisplay() {
  const statistics = calculateSessionStatistics();

  updateStatisticValue("stat-total-documents", statistics.totalDocuments);
  updateStatisticValue("stat-demandes", statistics.requests);
  updateStatisticValue("stat-pieces", statistics.complementaryDocuments);
  updateStatisticValue("stat-recours", statistics.appeals);
  updateStatisticValue("stat-pch", statistics.pchDocuments);
  updateStatisticValue("stat-hors-departement", statistics.outOfDepartmentDocuments);
  renderInstructorStatistics(statistics.byInstructor);
}

function calculateSessionStatistics() {
  const statistics = {
    totalDocuments: currentSession.documents.length,
    requests: 0,
    complementaryDocuments: 0,
    appeals: 0,
    pchDocuments: 0,
    outOfDepartmentDocuments: 0,
    byInstructor: new Map()
  };

  currentSession.documents.forEach((documentItem) => {
    updateDocumentTypeStatistics(statistics, documentItem);
    updateSpecificCaseStatistics(statistics, documentItem);
    updateInstructorStatistics(statistics.byInstructor, documentItem);
  });

  return statistics;
}

function updateDocumentTypeStatistics(statistics, documentItem) {
  if (documentItem.documentType === DOCUMENT_TYPES.REQUEST) {
    statistics.requests += 1;
  }

  if (documentItem.documentType === DOCUMENT_TYPES.COMPLEMENTARY) {
    statistics.complementaryDocuments += 1;
  }

  if (documentItem.documentType === DOCUMENT_TYPES.APPEAL) {
    statistics.appeals += 1;
  }
}

function updateSpecificCaseStatistics(statistics, documentItem) {
  if (documentItem.pchOnly) {
    statistics.pchDocuments += 1;
  }

  if (documentItem.outOfDepartment) {
    statistics.outOfDepartmentDocuments += 1;
  }
}

function updateInstructorStatistics(instructorMap, documentItem) {
  const instructorName = getInstructorStatisticName(documentItem);

  if (!instructorMap.has(instructorName)) {
    instructorMap.set(instructorName, 0);
  }

  instructorMap.set(instructorName, instructorMap.get(instructorName) + 1);
}

function getInstructorStatisticName(documentItem) {
  if (documentItem.instructor) {
    return documentItem.instructor;
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.WARNING) {
    return "À vérifier";
  }

  return "Non trouvée";
}

function updateStatisticValue(elementId, value) {
  const statisticElement = document.getElementById(elementId);

  if (!statisticElement) {
    return;
  }

  statisticElement.textContent = value;
}

function renderInstructorStatistics(instructorMap) {
  const instructorStatisticsList = document.getElementById("liste-statistiques-instructrices");
  const emptyMessage = document.getElementById("message-statistiques-instructrices-vide");

  if (!instructorStatisticsList || !emptyMessage) {
    return;
  }

  const instructorStatistics = [...instructorMap.entries()].sort(compareInstructorStatistics);

  instructorStatisticsList.innerHTML = "";
  emptyMessage.hidden = instructorStatistics.length > 0;

  instructorStatistics.forEach(([instructorName, documentCount]) => {
    instructorStatisticsList.appendChild(
      createInstructorStatisticLine(instructorName, documentCount)
    );
  });
}

function compareInstructorStatistics(firstStatistic, secondStatistic) {
  const [firstInstructorName, firstDocumentCount] = firstStatistic;
  const [secondInstructorName, secondDocumentCount] = secondStatistic;

  if (firstDocumentCount !== secondDocumentCount) {
    return secondDocumentCount - firstDocumentCount;
  }

  return firstInstructorName.localeCompare(secondInstructorName, "fr");
}

function createInstructorStatisticLine(instructorName, documentCount) {
  const statisticLine = document.createElement("div");
  const instructorLabel = document.createElement("span");
  const documentCountLabel = document.createElement("strong");

  statisticLine.className = "ligne-statistique-instructrice";
  instructorLabel.textContent = instructorName;
  documentCountLabel.textContent = documentCount;

  statisticLine.appendChild(instructorLabel);
  statisticLine.appendChild(documentCountLabel);

  return statisticLine;
}

function renderDocumentList() {
  const documentList = document.getElementById("liste-documents");
  const emptyListMessage = document.getElementById("message-liste-vide");
  const noResultMessage = document.getElementById("message-aucun-resultat");
  const filterResultCount = document.getElementById("nombre-resultats-filtres");

  if (!documentList || !emptyListMessage || !noResultMessage || !filterResultCount) {
    return;
  }

  updateInstructorFilterOptions();

  const filteredDocuments = getFilteredDocuments();
  const filtersAreActive = areDocumentFiltersActive();

  documentList.innerHTML = "";
  emptyListMessage.hidden = currentSession.documents.length > 0;
  noResultMessage.hidden =
    currentSession.documents.length === 0 || filteredDocuments.length > 0;
  filterResultCount.hidden = !filtersAreActive || currentSession.documents.length === 0;
  filterResultCount.textContent =
    `${filteredDocuments.length} document(s) affiché(s) sur ${currentSession.documents.length}`;

  filteredDocuments.forEach(({ documentItem, documentNumber }) => {
    documentList.appendChild(createDocumentCard(documentItem, documentNumber));
  });
}

function getFilteredDocuments() {
  const searchedName = normalizeExcelText(
    document.getElementById("recherche-documents").value
  );
  const selectedPdfStatus = document.getElementById("filtre-pdf").value;
  const selectedInstructor = document.getElementById("filtre-instructrice").value;
  const selectedDocumentType = document.getElementById("filtre-type-document").value;

  return currentSession.documents
    .map((documentItem, documentIndex) => ({
      documentItem,
      documentNumber: documentIndex + 1
    }))
    .filter(({ documentItem }) => {
      const nameMatches =
        !searchedName ||
        normalizeExcelText(documentItem.multigestFileName).includes(searchedName);
      const pdfMatches =
        !selectedPdfStatus ||
        (selectedPdfStatus === "present" && documentItem.pdfLoaded) ||
        (selectedPdfStatus === "manquant" && !documentItem.pdfLoaded);
      const instructorMatches =
        !selectedInstructor ||
        getInstructorStatisticName(documentItem) === selectedInstructor;
      const documentTypeMatches =
        !selectedDocumentType || documentItem.documentType === selectedDocumentType;

      return nameMatches && pdfMatches && instructorMatches && documentTypeMatches;
    });
}

function areDocumentFiltersActive() {
  return [
    document.getElementById("recherche-documents").value,
    document.getElementById("filtre-pdf").value,
    document.getElementById("filtre-instructrice").value,
    document.getElementById("filtre-type-document").value
  ].some(Boolean);
}

function updateInstructorFilterOptions() {
  const instructorFilter = document.getElementById("filtre-instructrice");
  const selectedInstructor = instructorFilter.value;
  const instructorNames = [
    ...new Set(currentSession.documents.map(getInstructorStatisticName))
  ].sort((firstName, secondName) => firstName.localeCompare(secondName, "fr"));

  instructorFilter.innerHTML = "";
  instructorFilter.appendChild(new Option("Toutes les instructrices", ""));

  instructorNames.forEach((instructorName) => {
    instructorFilter.appendChild(new Option(instructorName, instructorName));
  });

  instructorFilter.value = selectedInstructor;
}

function createDocumentCard(documentItem, documentNumber) {
  const documentCard = document.createElement("article");
  const pdfIcon = document.createElement("img");
  const cardContent = document.createElement("div");
  const documentNumberLabel = document.createElement("p");
  const documentTitle = document.createElement("p");
  const documentDetails = document.createElement("div");
  const documentActions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  documentCard.className = "carte-document";
  pdfIcon.className = `icone-pdf-document ${
    documentItem.pdfLoaded ? "icone-pdf-associe" : "icone-pdf-manquant"
  }`;
  pdfIcon.src = documentItem.pdfLoaded ? "assets/pdf-icon.svg" : "assets/empty-icon.svg";
  pdfIcon.alt = documentItem.pdfLoaded ? "PDF associé" : "PDF non associé ou à réassocier";
  cardContent.className = "contenu-carte-document";
  documentNumberLabel.className = "numero-document";
  documentNumberLabel.textContent = `Document ${documentNumber}`;
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
  addDocumentStatusDetail(documentDetails, documentItem);
  addPdfStatusDetail(documentDetails, documentItem);

  if (documentItem.gevascoSchoolOrCity) {
    addDocumentDetail(documentDetails, `École / GEVASCO : ${documentItem.gevascoSchoolOrCity}`);
  }

  if (documentItem.pchOnly) {
    addDocumentDetail(documentDetails, "PCH uniquement");
  }

  if (documentItem.outOfDepartment) {
    addDocumentDetail(documentDetails, "Hors département");
  }

  if (documentItem.sectorizationSource) {
    addDocumentDetail(documentDetails, `Source : ${documentItem.sectorizationSource}`);
  }

  cardContent.appendChild(documentNumberLabel);
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

function addDocumentStatusDetail(documentDetails, documentItem) {
  const detail = document.createElement("span");

  detail.className = `detail-document statut-sectorisation ${getSectorizationStatusClass(documentItem)}`;
  detail.textContent = formatSectorizationStatus(documentItem);
  documentDetails.appendChild(detail);
}

function addPdfStatusDetail(documentDetails, documentItem) {
  const detail = document.createElement("span");

  detail.className = `detail-document statut-pdf ${
    documentItem.pdfLoaded ? "statut-pdf-ok" : "statut-pdf-manquant"
  }`;
  if (documentItem.pdfLoaded) {
    detail.textContent = `PDF : ${documentItem.pdfFileName}`;
  } else if (documentItem.pdfNeedsReimport) {
    detail.textContent = `PDF à réassocier : ${documentItem.pdfFileName}`;
  } else {
    detail.textContent = "PDF : manquant";
  }

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

function formatSectorizationStatus(documentItem) {
  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.FOUND) {
    return "Statut : attribuée automatiquement";
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.MANUAL) {
    return "Statut : correction manuelle";
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.WARNING) {
    return "Statut : à vérifier";
  }

  return "Statut : non trouvée";
}

function getSectorizationStatusClass(documentItem) {
  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.FOUND) {
    return "statut-sectorisation-ok";
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.MANUAL) {
    return "statut-sectorisation-manuel";
  }

  if (documentItem.sectorizationStatus === SECTORIZATION_STATUS.WARNING) {
    return "statut-sectorisation-attention";
  }

  return "statut-sectorisation-vide";
}
