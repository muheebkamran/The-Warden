"use client";

import React, { useState, useTransition } from 'react';
import { BookshelfSidebar, BookItem } from '@/components/reader/BookshelfSidebar';
import { PDFViewer } from '@/components/reader/PDFViewer';
import { ReadingSessionTimer } from '@/components/reader/ReadingSessionTimer';
import { updateBookProgress } from '@/app/actions';
import { PanelLeftClose, PanelLeftOpen, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderViewProps {
  initialBooks: BookItem[];
  readTargetMinutes?: number;
}

export function ReaderView({ initialBooks, readTargetMinutes = 30 }: ReaderViewProps) {
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(
    initialBooks.length > 0 ? initialBooks[0] : null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, startTransition] = useTransition();

  const handlePageChange = (newPage: number, totalPages: number) => {
    if (!selectedBook) return;

    // Optimistic local update
    setSelectedBook((prev) => (prev ? { ...prev, currentPage: newPage, totalPages } : null));
    setBooks((prev) =>
      prev.map((b) => (b.id === selectedBook.id ? { ...b, currentPage: newPage, totalPages } : b))
    );

    // Persist to Neon
    startTransition(async () => {
      try {
        await updateBookProgress(selectedBook.id, newPage, totalPages);
      } catch (err) {
        console.error('Failed to auto-save page memory:', err);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 pt-2 pb-16 animate-fade-in">
      {/* Top Header & Session Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md text-stone hover:text-ivory hover:bg-surface border border-border/50 transition-colors"
            title={isSidebarOpen ? "Collapse Bookshelf (Zen Mode)" : "Open Bookshelf"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-gold" />}
          </button>
          <div>
            <h1 className="font-serif text-2xl text-ivory tracking-tight flex items-center gap-2">
              The Reading Room
            </h1>
            <p className="text-xs text-stone">
              Discipline Sanctuary • Automatic page-memory & commitment sync
            </p>
          </div>
        </div>

        {selectedBook && (
          <ReadingSessionTimer
            bookId={selectedBook.id}
            currentPage={selectedBook.currentPage}
            totalPages={selectedBook.totalPages}
            targetMinutes={readTargetMinutes}
          />
        )}
      </div>

      {/* Main Reading Room Workspace */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Bookshelf Sidebar */}
        {isSidebarOpen && (
          <div className="w-full md:w-80 shrink-0 animate-fade-in">
            <BookshelfSidebar
              books={books}
              selectedBookId={selectedBook?.id}
              onSelectBook={(book) => setSelectedBook(book)}
            />
          </div>
        )}

        {/* PDF Reader Canvas */}
        <div className="flex-1 w-full min-w-0">
          {selectedBook ? (
            <PDFViewer
              key={selectedBook.id}
              fileUrl={selectedBook.fileUrl}
              initialPage={selectedBook.currentPage}
              totalPages={selectedBook.totalPages}
              title={selectedBook.title}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="h-[520px] rounded-lg border border-dashed border-border/80 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-surface/30">
              <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center text-gold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-ivory">No Book Selected</h3>
                <p className="text-xs text-stone max-w-sm">
                  Select a book from your shelf on the left or add a new PDF to begin your disciplined reading session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
