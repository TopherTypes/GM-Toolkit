/*
  Minimal embedded PDF generator to mimic the subset of pdf-lib used by GM-Toolkit.
  This is intentionally tiny and only supports a single-page text PDF for the smoke test.
  It can be swapped with the full pdf-lib distribution when available.
*/

const StandardFonts = {
  Helvetica: "Helvetica",
};

const rgb = (r, g, b) => ({ r, g, b });

class MinimalPage {
  constructor() {
    this.textRuns = [];
  }

  // Capture a single text run for the smoke test.
  drawText(text, options = {}) {
    const { x = 72, y = 720, size = 24 } = options;
    this.textRuns.push({ text, x, y, size });
  }
}

class PDFDocument {
  constructor() {
    this.pages = [];
  }

  static async create() {
    return new PDFDocument();
  }

  addPage() {
    const page = new MinimalPage();
    this.pages.push(page);
    return page;
  }

  async embedFont() {
    return {
      name: StandardFonts.Helvetica,
    };
  }

  // Serialize a very small PDF with one page and text.
  async save() {
    const page = this.pages[0] || new MinimalPage();
    const textRuns = page.textRuns.length
      ? page.textRuns
      : [{ text: "GM-Toolkit", x: 72, y: 720, size: 24 }];

    const contentStream = textRuns
      .map((run) => `BT /F1 ${run.size} Tf ${run.x} ${run.y} Td (${escapePdfText(run.text)}) Tj ET`)
      .join("\n");

    const objects = [];
    const addObject = (body) => {
      objects.push(body);
      return objects.length;
    };

    const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
    const pagesId = addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    const pageId = addObject(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>"
    );
    const contentId = addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    const header = "%PDF-1.4\n";
    let offset = header.length;
    const xref = ["0000000000 65535 f "];
    const bodyLines = objects.map((body, index) => {
      const id = index + 1;
      const obj = `${id} 0 obj\n${body}\nendobj\n`;
      const entry = offset.toString().padStart(10, "0");
      xref.push(`${entry} 00000 n `);
      offset += obj.length;
      return obj;
    });

    const xrefOffset = offset;
    const xrefTable = `xref\n0 ${objects.length + 1}\n${xref.join("\n")}\n`;
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const pdf = header + bodyLines.join("") + xrefTable + trailer;
    return new TextEncoder().encode(pdf);
  }
}

const escapePdfText = (text) =>
  String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export { PDFDocument, StandardFonts, rgb };
