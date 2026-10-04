"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  fileUrl: string;
  initialPage?: number;
  totalPages?: number;
  onPageChange?: (page: number, total: number) => void;
  title?: string;
}

export function PDFViewer({
  fileUrl,
  initialPage = 1,
  totalPages = 1,
  onPageChange,
  title,
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(totalPages || 1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(initialPage);
    setIsIframeLoaded(false);
    setHasError(false);
  }, [initialPage, fileUrl]);

  useEffect(() => {
    if (totalPages && totalPages > 1) {
      setNumPages(totalPages);
    }
  }, [totalPages]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage, numPages);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage, numPages);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(2.0, s + 0.15));
  const handleZoomOut = () => setScale((s) => Math.max(0.7, s - 0.15));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  if (!fileUrl) {
    return (
      <div className="h-[580px] rounded-md border border-border bg-obsidian flex flex-col items-center justify-center p-8 text-center space-y-3">
        <FileQuestion className="w-8 h-8 text-stone/50" />
        <p className="text-sm font-medium text-stone">No PDF Document Selected</p>
        <p className="text-xs text-muted max-w-xs">
          Select a title from your bookshelf or drop a new book to begin reading.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-obsidian rounded-md border border-border overflow-hidden shadow-xl transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none"
          : "h-[calc(100vh-10rem)] min-h-[580px]"
      )}
    >
      {/* Top Telemetry & Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-elevated/90 border-b border-border text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-[40%] truncate">
          <Bookmark className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="font-serif text-ivory font-medium truncate">
            {title || "Reading Room"}
          </span>
        </div>

        {/* Page Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface disabled:opacity-30 transition-all duration-150 active:scale-95"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-[11px] text-stone bg-surface px-2.5 py-1 rounded border border-border/60">
            <span className="text-ivory font-semibold">{currentPage}</span>
            <span className="text-muted">/</span>
            <span>{numPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface disabled:opacity-30 transition-all duration-150 active:scale-95"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Zen Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface transition-all duration-150 active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-muted w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface transition-all duration-150 active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface ml-1 transition-all duration-150 active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Zen Focus Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-gold" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Document Viewport */}
      <div className="flex-1 relative overflow-auto bg-[#09090b] flex items-center justify-center p-3">
        {/* Loading Skeleton */}
        {!isIframeLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-obsidian/90 z-10 animate-in fade-in duration-200">
            <div className="w-full max-w-lg h-[460px] rounded-md bg-surface border border-border p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-elevated rounded w-1/3" />
              <div className="h-3 bg-elevated/70 rounded w-full" />
              <div className="h-3 bg-elevated/70 rounded w-5/6" />
              <div className="h-3 bg-elevated/70 rounded w-4/6" />
              <div className="h-44 bg-elevated/40 rounded w-full mt-6" />
            </div>
            <p className="text-[11px] font-mono text-stone">Streaming digital parchment...</p>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="text-center space-y-3 p-8 border border-border rounded bg-surface/50">
            <FileQuestion className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-300 font-medium">PDF could not be rendered directly</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-gold underline hover:text-ivory font-mono"
            >
              Open raw document in new tab →
            </a>
          </div>
        ) : (
          <div
            className="w-full h-full max-w-5xl rounded-sm overflow-hidden shadow-2xl transition-transform duration-200 origin-top flex"
            style={{ transform: `scale(${scale})` }}
          >
            <iframe
              src={fileUrl}
              onLoad={() => setIsIframeLoaded(true)}
              onError={() => setHasError(true)}
              className={cn(
                "w-full h-full border-0 rounded-sm bg-white transition-opacity duration-400",
                isIframeLoaded ? "opacity-100" : "opacity-0"
              )}
              title={title || "Book PDF"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
