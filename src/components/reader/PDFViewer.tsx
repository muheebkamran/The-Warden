"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage, fileUrl]);

  useEffect(() => {
    if (fileUrl) {
      setIsLoading(false);
      if (totalPages && totalPages > 1) {
        setNumPages(totalPages);
      }
    }
  }, [fileUrl, totalPages]);

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-obsidian rounded-lg border border-border/80 overflow-hidden shadow-2xl transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "h-[calc(100vh-10rem)] min-h-[580px]"
      )}
    >
      {/* Top Reader Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-elevated/90 border-b border-border/60 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-[40%] truncate">
          <Bookmark className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="font-serif text-ivory font-medium truncate">{title || 'Reading Room'}</span>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface disabled:opacity-30 transition-all"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-[11px] text-stone bg-surface px-2.5 py-1 rounded border border-border/50">
            <span className="text-ivory font-semibold">{currentPage}</span>
            <span className="text-muted">/</span>
            <span>{numPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface disabled:opacity-30 transition-all"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-muted w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-stone hover:text-ivory hover:bg-surface ml-1 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Zen Focus Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-gold" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Document Canvas Viewport */}
      <div className="flex-1 relative overflow-auto bg-[#0a0a0c] flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-stone font-mono">Loading digital parchment...</p>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-200 origin-top shadow-2xl bg-white rounded-sm overflow-hidden"
            style={{
              transform: `scale(${scale})`,
              width: '100%',
              maxWidth: '820px',
              height: '100%',
              minHeight: '720px',
            }}
          >
            <iframe
              src={`${fileUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={title || 'Book PDF'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
