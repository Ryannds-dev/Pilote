"use strict";

const fs = require("fs");
const path = require("path");
const XLSX = require("../vendor/xlsx.full.min.js");

const projectRoot = path.join(__dirname, "..");

const sourceFiles = {
  adult: {
    label: "Sectorisation adulte",
    path: path.join(projectRoot, "data", "sectorisation_adulte.xlsx"),
    requiredColumns: {
      city: ["commune"],
      instructor: ["assistant de gestion"]
    }
  },
  pch: {
    label: "Sectorisation PCH",
    path: path.join(projectRoot, "data", "sectorisation_pch.xlsx"),
    requiredColumns: {
      city: ["commune"],
      instructor: ["instructeur pch"]
    }
  },
  child: {
    label: "Sectorisation enfant",
    path: path.join(projectRoot, "data", "sectorisation_enfant.xlsx"),
    requiredColumns: {
      school: ["nom"],
      city: ["commune"],
      instructor: ["instructrice enfant"]
    }
  }
};

const outputPath = path.join(projectRoot, "data", "sectorisation-data.js");
const jsonOutputPath = path.join(projectRoot, "data", "sectorisation-data.json");

const convertedData = {
  generatedAt: new Date().toISOString(),
  sources: {}
};

Object.entries(sourceFiles).forEach(([sourceKey, sourceConfig]) => {
  convertedData.sources[sourceKey] = convertWorkbook(sourceConfig);
});

const fileContent = [
  '"use strict";',
  "",
  "window.PILOTE_SECTORIZATION_DATA = ",
  JSON.stringify(convertedData, null, 2),
  ";",
  ""
].join("\n");

fs.writeFileSync(outputPath, fileContent, "utf8");
fs.writeFileSync(jsonOutputPath, `${JSON.stringify(convertedData, null, 2)}\n`, "utf8");
console.log(`Converted sectorization data written to ${outputPath}`);
console.log(`Converted sectorization JSON written to ${jsonOutputPath}`);

function convertWorkbook(sourceConfig) {
  const workbookContent = fs.readFileSync(sourceConfig.path);
  const workbook = XLSX.read(workbookContent, { type: "buffer" });
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

  const sheetValidation = findValidSheet(sheets, sourceConfig.requiredColumns);

  if (!sheetValidation) {
    throw new Error(`Colonnes attendues introuvables dans ${sourceConfig.path}`);
  }

  return {
    label: sourceConfig.label,
    sourceFileName: path.basename(sourceConfig.path),
    selectedSheetName: sheetValidation.sheetName,
    rowCount: sheetValidation.usableRows.length,
    rows: sheetValidation.usableRows
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
        return normalizeText(headerCell) === normalizeText(acceptedHeader);
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

  if (normalizeText(row.city) === "commune") {
    return false;
  }

  if (normalizeText(row.instructor).includes("instructeur")) {
    return false;
  }

  if (normalizeText(row.instructor) === "assistant de gestion") {
    return false;
  }

  return true;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`´-]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
