"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";


declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

interface PDFCanvasViewerProps {
  fileUrl: string;
  initialPage: number;
  onPageChange: (page: number, totalPages: number) => void;
  scale?: number;
}

export function PDFCanvasViewer({
  fileUrl,
  initialPage,
  onPageChange,
  scale: initialScale = 1.2,
}: PDFCanvasViewerProps) {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(initialScale);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [pageViewports, setPageViewports] = useState<{ width: number; height: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const initialScrollDoneRef = useRef<boolean>(false);
  const activePageRef = useRef<number>(initialPage);

  // 1. Load PDF.js from public and open document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setLoadingError(null);
    renderedPagesRef.current.clear();
    initialScrollDoneRef.current = false;

    const loadEngineAndDocument = async () => {
      if (!window.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[src="/pdf.min.js"]');
          if (existing) {
            existing.addEventListener("load", () => resolve());
            return;
          }
          const script = document.createElement("script");
          script.src = "/pdf.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PDF script"));
          document.body.appendChild(script);
        });
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const loadingTask = window.pdfjsLib.getDocument(fileUrl);
      const doc = await loadingTask.promise;
      if (isCancelled) return;

      pdfDocRef.current = doc;
      const count = doc.numPages;
      setTotalPages(count);

      try {
        const firstPage = await doc.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        setPageViewports(
          Array.from({ length: count }, () => ({
            width: vp.width,
            height: vp.height,
          }))
        );
      } catch {
        setPageViewports(Array.from({ length: count }, () => ({ width: 595, height: 842 })));
      }

      setLoading(false);
      onPageChange(Math.min(initialPage, count), count);
    };

    loadEngineAndDocument().catch((err) => {
      if (isCancelled) return;
      console.error("PDF loading error:", err);
      setLoadingError("Unable to load document pages. Please try another PDF.");
      setLoading(false);
    });

    return () => {
      isCancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy().catch(() => {});
      }
    };
  }, [fileUrl]);

  // 2. Render Page to Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      const doc = pdfDocRef.current;
      if (!doc || renderedPagesRef.current.has(pageNum)) return;
      renderedPagesRef.current.add(pageNum);

      try {
        const page = await doc.getPage(pageNum);
        const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
        if (!canvas) {
          renderedPagesRef.current.delete(pageNum);
          return;
        }

        const viewport = page.getViewport({ scale });
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          transform: transform,
        }).promise;
      } catch (err) {
        renderedPagesRef.current.delete(pageNum);
      }
    },
    [scale]
  );

  // 3. Clear and re-render on zoom/scale change
  useEffect(() => {
    if (!pdfDocRef.current) return;
    renderedPagesRef.current.clear();
    const current = activePageRef.current;
    for (let p = Math.max(1, current - 1); p <= Math.min(totalPages, current + 2); p++) {
      renderPage(p);
    }
  }, [scale, totalPages, renderPage]);

  // 4. Instant IntersectionObserver for Auto-Scrolling Page Detection & Lazy Loading
  useEffect(() => {
    if (!pdfDocRef.current || totalPages === 0 || loading) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page-number"));
          if (entry.isIntersecting) {
            renderPage(pageNum);
            if (pageNum + 1 <= totalPages) renderPage(pageNum + 1);
            if (pageNum - 1 >= 1) renderPage(pageNum - 1);

            // Instant page update when 45%+ in view
            if (entry.intersectionRatio >= 0.4 && activePageRef.current !== pageNum) {
              activePageRef.current = pageNum;
              onPageChange(pageNum, totalPages);
            }
          }
        });
      },
      {
        root: container,
        rootMargin: "250px 0px",
        threshold: [0.1, 0.4, 0.8],
      }
    );

    const pageElements = container.querySelectorAll(".pdf-page-container");
    pageElements.forEach((el) => observer.observe(el));

    // Instant smooth jump to initialPage on first load
    if (!initialScrollDoneRef.current && initialPage > 1) {
      setTimeout(() => {
        const targetEl = document.getElementById(`pdf-page-${initialPage}`);
        if (targetEl && container) {
          targetEl.scrollIntoView({ behavior: "auto", block: "start" });
          initialScrollDoneRef.current = true;
          renderPage(initialPage);
          if (initialPage + 1 <= totalPages) renderPage(initialPage + 1);
        }
      }, 80);
    } else {
      initialScrollDoneRef.current = true;
      renderPage(1);
      if (totalPages > 1) renderPage(2);
    }

    return () => {
      observer.disconnect();
    };
  }, [totalPages, loading, initialPage, onPageChange, renderPage]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0d0e12] text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <div className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
          Streaming Book Pages...
        </div>
        <div className="text-[11px] text-zinc-500">Fast continuous scrolling engine</div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0d0e12] text-red-400 p-6 text-center space-y-3">
        <div className="text-sm font-bold">{loadingError}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111217]">
      {/* Floating Scale Indicator (shown only on scroll, hidden by default) */}
      <div
        id="zoom-indicator"
        style={{
          position: "absolute",
          top: "12px",
          right: "16px",
          zIndex: 30,
          opacity: 0,
          transition: "opacity 300ms",
          backgroundColor: "rgba(10,11,15,0.8)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--border-2)",
          borderRadius: "8px",
          padding: "5px 10px",
          fontSize: "11px",
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 600,
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      >
        {Math.round(scale * 100)}%
      </div>

      {/* Scroll Canvas — Ctrl+Scroll to Zoom, natural scroll to read */}
      <div
        ref={containerRef}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale((s) => Math.min(2.5, Math.max(0.5, Number((s + delta).toFixed(2)))));
            // Briefly show the zoom indicator
            const indicator = document.getElementById("zoom-indicator");
            if (indicator) {
              indicator.style.opacity = "1";
              clearTimeout((indicator as any)._timer);
              (indicator as any)._timer = setTimeout(() => {
                indicator.style.opacity = "0";
              }, 1200);
            }
          }
        }}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-auto py-8 px-4 flex flex-col items-center space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const vp = pageViewports[i] || { width: 595, height: 842 };
          const displayWidth = Math.floor(vp.width * scale);
          const displayHeight = Math.floor(vp.height * scale);

          return (
            <div
              key={pageNum}
              id={`pdf-page-${pageNum}`}
              data-page-number={pageNum}
              className="pdf-page-container relative bg-white shadow-2xl rounded-sm transition-transform duration-150"
              style={{
                width: `${displayWidth}px`,
                minHeight: `${displayHeight}px`,
              }}
            >
              <canvas
                id={`pdf-canvas-${pageNum}`}
                className="w-full h-full block rounded-sm"
              />
              <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono font-semibold text-neutral-400 select-none">
                {pageNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
