// PDF generation service using a bundled pdf-lib compatible module.
export const createPdfService = ({ banners, debug }) => {
  let pdfLibCache = null;
  let debugState = debug;

  const loadPdfLib = () => {
    if (pdfLibCache) {
      return Promise.resolve(pdfLibCache);
    }
    return import("../../vendor/pdf-lib.esm.js")
      .then((module) => {
        pdfLibCache = module;
        return module;
      })
      .catch((error) => {
        console.warn("PDF library failed to load.", error);
        banners?.show("PDF library unavailable. Falling back to browser print.", "warning");
        return null;
      });
  };

  const generateSmokeTest = async () => {
    const pdfLib = await loadPdfLib();
    if (!pdfLib) {
      window.print();
      return;
    }

    const { PDFDocument, StandardFonts, rgb } = pdfLib;
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("GM-Toolkit PDF Smoke Test", {
      x: 72,
      y: 720,
      size: 24,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gmtoolkit-smoke-test.pdf";
    link.click();
    URL.revokeObjectURL(url);

    if (debugState?.enabled) {
      console.debug("[GM-Toolkit] PDF smoke test generated.");
    }
  };

  return {
    generateSmokeTest,
    setDebug: (nextDebug) => {
      debugState = nextDebug;
    },
  };
};
