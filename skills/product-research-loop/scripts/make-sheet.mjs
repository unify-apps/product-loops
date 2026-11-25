#!/usr/bin/env node
// make-sheet.mjs writes the Excel copy of the capability sheet: <out folder>/capability-sheet.xlsx.
//   node make-sheet.mjs <out folder>
// It reads capability-sheet.csv, rivals/*.md and beats/*.md in that folder, and writes only the .xlsx.
// Tabs: Matrix (one row per capability, each rival's cell next to the link that backs it), Sources (one line per
// link: which row, which rival, which cell), Beat proof, one tab per rival, and Read me. It needs no package.
// Run it again after every change to the CSV: CHECK matrix fails an .xlsx older than the CSV.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHEET_FILE, SHEET_XLSX, featureText, labelledSources, readSheet, tableRows } from "./check-research.mjs";

const slug = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/gu, "");
// Excel's HYPERLINK() takes at most 255 characters; a longer link stays plain text.
const MAX_LINK = 255;
// Excel allows at most 31 characters in a tab name.
const MAX_TAB = 31;

/** Pure: text made safe for XML, with characters XML cannot hold removed. */
const xml = (text) => String(text ?? "").replace(/[^\t\n\r -퟿-�]/gu, "")
  .replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** Pure: the column letters for a 0-based column number (0 -> A, 26 -> AA). */
export function columnName(index) {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Pure: one cell. A value that is one link becomes a link you can click; everything else is text. */
function cell(ref, value, style) {
  const text = String(value ?? "");
  if (/^https?:\/\/\S+$/u.test(text) && text.length <= MAX_LINK) {
    return `<c r="${ref}" s="3" t="str"><f>HYPERLINK("${xml(text.replace(/"/gu, "%22"))}")</f><v>${xml(text)}</v></c>`;
  }
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(text)}</t></is></c>`;
}

/** Pure: one worksheet's XML from a header row, data rows and column widths. */
export function sheetXml(header, rows, widths) {
  const lastColumn = columnName(Math.max(header.length - 1, 0));
  const line = (values, number, style) => `<row r="${number}">${values.map((value, index) => cell(`${columnName(index)}${number}`, value, style)).join("")}</row>`;
  const cols = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${cols}</cols>
<sheetData>${[line(header, 1, 1), ...rows.map((values, index) => line(values, index + 2, 2))].join("")}</sheetData>
<autoFilter ref="A1:${lastColumn}${rows.length + 1}"/>
</worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><u/><color rgb="FF0563C1"/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7EEF7"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/** Pure: the workbook's files, from tabs of { name, header, rows, widths }. */
export function workbookFiles(tabs) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${tabs.map((tab, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${tabs.map((tab, index) => `<sheet name="${xml(tab.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets><definedNames>${tabs.map((tab, index) => `<definedName name="_xlnm._FilterDatabase" localSheetId="${index}" hidden="1">'${xml(tab.name.replace(/'/gu, "''"))}'!$A$1:$${columnName(Math.max(tab.header.length - 1, 0))}$${tab.rows.length + 1}</definedName>`).join("")}</definedNames></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${tabs.map((tab, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}<Relationship Id="rId${tabs.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": STYLES,
  };
  tabs.forEach((tab, index) => { files[`xl/worksheets/sheet${index + 1}.xml`] = sheetXml(tab.header, tab.rows, tab.widths); });
  return files;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** Pure: a ZIP file (stored, not compressed) holding the given { name: text } files. */
export function zip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const nameBytes = Buffer.from(name, "utf8");
    const data = Buffer.from(text, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(centrals.length / 2, 8); end.writeUInt16LE(centrals.length / 2, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** Pure: a tab name Excel accepts, and not already used. */
function tabName(name, used) {
  let base = String(name).replace(/[[\]:*?/\\']/gu, " ").trim().slice(0, MAX_TAB) || "Tab";
  let candidate = base;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base.slice(0, MAX_TAB - String(n).length - 1)} ${n}`;
  used.add(candidate.toLowerCase());
  return candidate;
}

/** Builds the tabs from the files in the out folder. */
export function buildTabs(outDir) {
  const sheet = readSheet(outDir);
  if (!sheet) throw new Error(`No ${SHEET_FILE} in ${outDir}.`);
  const folder = (name) => (fs.existsSync(path.join(outDir, name)) ? fs.readdirSync(path.join(outDir, name)).filter((file) => file.endsWith(".md")) : []);
  const fileFor = (dir, column) => folder(dir).find((file) => slug(file.replace(/\.md$/u, "")) === slug(column));
  const rivals = sheet.rivalColumns.map((column) => {
    const file = fileFor("rivals", column);
    const text = file ? fs.readFileSync(path.join(outDir, "rivals", file), "utf8") : "";
    const beatFile = fileFor("beats", column);
    return { column, name: text.match(/^# +(.+)$/mu)?.[1]?.trim() || column, text, beats: beatFile ? fs.readFileSync(path.join(outDir, "beats", beatFile), "utf8") : "" };
  });
  const sourcesFor = (row, column) => labelledSources(row.sources).filter(({ rival }) => slug(rival ?? "") === slug(column)).map(({ link }) => link);
  const used = new Set();
  const tabs = [];
  tabs.push({
    name: tabName("Matrix", used),
    header: ["ID", "Group", "Capability", "What it does", ...rivals.flatMap((rival) => [rival.name, `${rival.name} source`]), "Our mark", "Note"],
    rows: sheet.rows.map((row) => [row.id, row.category, row.capability, row["what it does"],
      ...rivals.flatMap((rival) => [row[rival.column], sourcesFor(row, rival.column).join("\n")]), row.mark, row.note]),
    widths: [7, 18, 34, 50, ...rivals.flatMap(() => [10, 40]), 10, 40],
  });
  tabs.push({
    name: tabName("Sources", used),
    header: ["ID", "Capability", "Rival", "Cell", "Link"],
    rows: sheet.rows.flatMap((row) => labelledSources(row.sources).map(({ rival, link }) => {
      const owner = rivals.find((candidate) => slug(candidate.column) === slug(rival ?? ""));
      return [row.id, row.capability, owner?.name ?? rival ?? "", owner ? row[owner.column] : "", link];
    })),
    widths: [7, 40, 16, 10, 70],
  });
  const proofRows = rivals.flatMap((rival) => (tableRows(rival.beats) ?? []).map((entry) => [entry.row, rival.name, entry.capability, entry.searches, entry.pages, entry.result, entry.link]));
  if (proofRows.length) {
    tabs.push({ name: tabName("Beat proof", used), header: ["ID", "Rival", "Capability", "Searches", "Pages read", "Found", "Link"], rows: proofRows, widths: [7, 16, 34, 50, 60, 9, 50] });
  }
  for (const rival of rivals) {
    const rows = (tableRows(featureText(rival.text)) ?? []).map((entry) => [entry.feature, entry.category, entry["what it does"], entry.source, entry.status]);
    tabs.push({ name: tabName(rival.name, used), header: ["Feature", "Group", "What it does", "Source", "Status"], rows, widths: [34, 18, 60, 60, 11] });
  }
  tabs.push({
    name: tabName("Read me", used),
    header: ["What", "Meaning"],
    rows: [
      ["Matrix", "One row per capability. Each rival has two columns: its cell, and the link on its own site that backs that cell."],
      ["yes", "The rival's own page shows it, as the row words it."],
      ["partial", "The rival's page shows less than the row says."],
      ["no", "The rival's pages were read and it is not there."],
      ["unknown", "The pages read did not say."],
      ["Our mark: gap", "A rival has it and we do not, yet."],
      ["Our mark: beat", "No rival has it, or every rival does it badly. The Beat proof tab shows what was searched on each rival's site."],
      ["Our mark: have", "We have it today."],
      ["Sources", "Every link, with the row, the rival and the cell it backs."],
      ["Rival tabs", "Every feature read on that rival's pages, with its link."],
    ],
    widths: [18, 100],
  });
  return tabs;
}

export function main(argv) {
  const [outDir] = argv;
  if (!outDir || outDir.startsWith("--")) throw new Error("Usage: make-sheet.mjs <out folder>");
  const tabs = buildTabs(path.resolve(outDir));
  const target = path.join(path.resolve(outDir), SHEET_XLSX);
  fs.writeFileSync(target, zip(workbookFiles(tabs)));
  process.stdout.write(`ok make-sheet: ${target}; tabs ${tabs.map((tab) => `${tab.name} (${tab.rows.length})`).join(", ")}\n`);
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (error) { console.error(`make-sheet: ${error.message}`); process.exitCode = 1; }
}
