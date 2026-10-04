"use client";

import React, { useState, useTransition } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { deleteBook } from '@/app/actions';
import { AddBookModal } from './AddBookModal';
import { cn } from '@/lib/utils';

export interface BookItem {
  id: string;
  title: string;
  author?: string | null;
  fileUrl: string;
  currentPage: number;
  totalPages: number;
  isCompleted?: boolean;
}

interface BookshelfSidebarProps {
  books: BookItem[];
  selectedBookId?: string;
  onSelectBook: (book: BookItem) => void;
}

export function BookshelfSidebar({
  books,
  selectedBookId,
  onSelectBook,
}: BookshelfSidebarProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (confirm('Remove this book from your bookshelf?')) {
      startTransition(async () => {
        await deleteBook(bookId);
      });
    }
  };

  return (
    <aside className="w-full md:w-80 flex flex-col bg-elevated/70 border border-border/80 rounded-lg p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-sm font-semibold tracking-wide text-ivory">
            My Bookshelf
          </h2>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-medium text-gold hover:text-ivory bg-surface px-2.5 py-1 rounded border border-border/60 transition-all hover:border-gold"
          title="Add new PDF book"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Book</span>
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
        {books.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone space-y-3 bg-surface/50 rounded border border-border/30">
            <p>Your bookshelf is quiet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-gold underline text-[11px] hover:text-ivory transition-colors"
            >
              Add a Book to Shelf
            </button>
          </div>
        ) : (
          books.map((book) => {
            const isSelected = selectedBookId === book.id;
            const progress = book.totalPages > 0
              ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
              : 0;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className={cn(
                  "group relative p-3 rounded-md border text-left cursor-pointer transition-all duration-200",
                  isSelected
                    ? "bg-surface border-gold/80 shadow-md ring-1 ring-gold/40"
                    : "bg-surface/50 border-border/50 hover:bg-surface hover:border-stone/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-medium text-ivory truncate group-hover:text-gold transition-colors">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-[11px] text-stone truncate mt-0.5">{book.author}</p>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, book.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone hover:text-error transition-all"
                    title="Remove book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                    <span>Page {book.currentPage} / {book.totalPages}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-obsidian rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        progress >= 100 ? "bg-success" : "bg-gold"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Book Modal with Drag-Drop & Auto-Metadata Extraction */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </aside>
  );
}
