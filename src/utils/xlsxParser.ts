// Minimal xlsx parser - reads a ZIP file and extracts worksheet data
// No external dependencies required

interface XlsxRow { [key: string]: string }

export async function parseXlsxFile(file: File): Promise<{ headers: string[]; rows: XlsxRow[]; errors: string[] }> {
  const errors: string[] = [];
  try {
    const buffer = await file.arrayBuffer();
    const zip = await readZip(buffer);
    const ssEntry = zip.find(e => e.name === "xl/sharedStrings.xml");
    const wsEntry = zip.find(e => e.name === "xl/worksheets/sheet1.xml");
    if (!wsEntry) { errors.push("no sheet"); return { headers: [], rows: [], errors }; }
    const sharedStrings = ssEntry ? parseSharedStrings(ssEntry.data) : [];
    const xml = new TextDecoder().decode(wsEntry.data);
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const rawRows: { [rn: number]: { [ref: string]: { col: string; row: number; val: string } } } = {};
    doc.querySelectorAll("c, row c").forEach((cell: Element) => {
      const r = cell.getAttribute("r") || ""; const t = cell.getAttribute("t") || "";
      const vEl = cell.querySelector("v"); if (!vEl || !vEl.textContent) return;
      const col = r.replace(/[0-9]/g, ""); const row = parseInt(r.replace(/[A-Z]/gi, ""));
      let val = vEl.textContent; if (t === "s") { const idx = parseInt(val); val = (idx >= 0 && idx < sharedStrings.length) ? sharedStrings[idx] : ""; }
      if (!rawRows[row]) rawRows[row] = {}; rawRows[row][r] = { col, row, val };
    });
    if (Object.keys(rawRows).length === 0) { errors.push("no data"); return { headers: [], rows: [], errors }; }
    const rowNums = Object.keys(rawRows).map(Number).sort((a, b) => a - b);
    const headerRowNum = rowNums[0];
    const headerCells = Object.entries(rawRows[headerRowNum] || {}).sort((a, b) => a[0].localeCompare(b[0]));
    const colMap = headerCells.map(([, c]) => ({ col: c.col, header: c.val || "" }));
    const headers = colMap.map(c => c.header);
    const rows: XlsxRow[] = [];
    for (let i = 1; i < rowNums.length; i++) {
      const rn = rowNums[i]; const rowCells = rawRows[rn] || {}; const row: XlsxRow = {};
      colMap.forEach(cm => { const cell = Object.values(rowCells as Record<string,{col:string;val:string}>).find((c: {col:string}) => c.col === cm.col); row[cm.header] = cell ? cell.val : ""; });
      if (Object.values(row).some(v => v)) rows.push(row);
    }
    return { headers, rows, errors };
  } catch (e) { errors.push("parse error: " + (e instanceof Error ? e.message : String(e))); return { headers: [], rows: [], errors }; }
}

async function readZip(buffer: ArrayBuffer): Promise<{ name: string; data: Uint8Array }[]> {
  const entries: { name: string; data: Uint8Array }[] = [];
  const view = new DataView(buffer); let offset = 0;
  while (offset < buffer.byteLength - 30) {
    let found = -1;
    for (let i = offset; i < buffer.byteLength - 4; i++) {
      if (view.getUint8(i) === 0x50 && view.getUint8(i + 1) === 0x4B && view.getUint8(i + 2) === 0x03 && view.getUint8(i + 3) === 0x04) { found = i; break; }
    }
    if (found === -1) break; offset = found;
    const compressionMethod = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameBytes = new Uint8Array(buffer, offset + 30, fileNameLen);
    const name = new TextDecoder().decode(nameBytes);
    const dataOffset = offset + 30 + fileNameLen + extraLen;
    if (compressionMethod === 0) { entries.push({ name, data: new Uint8Array(buffer, dataOffset, compressedSize) }); }
    else if (compressionMethod === 8) {
      try { const compressed = new Uint8Array(buffer, dataOffset, compressedSize); const decompressed = await decompressDeflate(compressed); entries.push({ name, data: decompressed }); } catch {}
    }
    offset = dataOffset + compressedSize;
  }
  return entries;
}

async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(data as BufferSource); writer.close();
  const reader: ReadableStreamDefaultReader<Uint8Array> = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const chunk of chunks) { result.set(chunk, pos); pos += chunk.length; }
  return result;
}

function parseSharedStrings(data: Uint8Array): string[] {
  const xml = new TextDecoder().decode(data);
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const strings: string[] = [];
  doc.querySelectorAll("si, sst si").forEach((si: Element) => {
    let combined = "";
    si.querySelectorAll("t").forEach((t: Element) => { combined += t.textContent || ""; });
    strings.push(combined);
  });
  return strings;
}