"use client";

import React, { useState, useTransition } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { addBook, deleteBook } from '@/app/actions';
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
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newPages, setNewPages] = useState('100');
  const [isPending, startTransition] = useTransition();

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newFileUrl) return;

    startTransition(async () => {
      await addBook(newTitle, newAuthor || null, newFileUrl, parseInt(newPages, 10) || 100);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewAuthor('');
      setNewFileUrl('');
    });
  };

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
              onClick={() => {
                setNewTitle('Meditations — Marcus Aurelius');
                setNewAuthor('Marcus Aurelius');
                setNewFileUrl('https://www.gutenberg.org/files/2680/2680-pdf.pdf');
                setNewPages('180');
                setIsAddModalOpen(true);
              }}
              className="text-gold underline text-[11px] hover:text-ivory transition-colors"
            >
              Load Stoic Classics Demo
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

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-elevated border border-border p-6 rounded-lg max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-serif text-base text-ivory font-semibold">
                Add Book to Shelf
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone hover:text-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-stone font-medium">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deep Work, Meditations"
                  className="w-full bg-surface border border-border text-ivory text-xs p-2.5 rounded focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone font-medium">Author (Optional)</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Cal Newport"
                  className="w-full bg-surface border border-border text-ivory text-xs p-2.5 rounded focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone font-medium">PDF File URL *</label>
                <input
                  type="url"
                  required
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="https://.../book.pdf or Cloudflare R2 link"
                  className="w-full bg-surface border border-border text-ivory text-xs p-2.5 rounded focus:outline-none focus:border-gold font-mono"
                />
                <p className="text-[10px] text-muted">
                  Paste any public PDF URL or your Cloudflare R2 upload link.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone font-medium">Total Pages</label>
                <input
                  type="number"
                  min="1"
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                  className="w-full bg-surface border border-border text-ivory text-xs p-2.5 rounded focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs bg-gold text-obsidian font-semibold rounded hover:bg-gold-hover transition-colors"
                >
                  {isPending ? 'Adding...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
