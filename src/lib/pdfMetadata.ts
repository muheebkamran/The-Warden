import { PDFParse } from "pdf-parse";

export interface PDFMetadataResult {
  title: string;
  author: string;
  totalPages: number;
}

/**
 * Extracts metadata (title, author, page count) from a PDF buffer or URL.
 * Falls back cleanly to filename or defaults if PDF metadata is incomplete.
 */
export async function extractPdfMetadata(
  pdfBuffer: Buffer,
  fallbackFilename?: string
): Promise<PDFMetadataResult> {
  const cleanFilename = fallbackFilename
    ? fallbackFilename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim()
    : "Untitled Book";

  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const infoResult = await parser.getInfo();

    const numPages = (infoResult as any)?.total || (infoResult as any)?.numPages || 1;
    const info = ((infoResult as any)?.info as Record<string, string>) || {};

    let title = info.Title ? info.Title.trim() : "";
    let author = info.Author ? info.Author.trim() : "";

    await parser.destroy();

    // If metadata title is empty, or just whitespace / cryptic, use filename
    if (!title || title.length < 2) {
      title = cleanFilename;
    }

    if (!author || author.length < 2) {
      author = "Unknown Author";
    }

    return {
      title,
      author,
      totalPages: Math.max(1, numPages),
    };
  } catch (err) {
    console.error("PDF metadata extraction failed, using fallback:", err);
    return {
      title: cleanFilename,
      author: "Unknown Author",
      totalPages: 100,
    };
  }
}
