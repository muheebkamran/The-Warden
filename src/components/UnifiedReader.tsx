"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  BookOpen,
  Upload,
  ArrowLeft,
  Trash2,
  Maximize2,
  Minimize2,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { uploadBook, deleteBook, updateBookProgress } from "@/app/actions";
import { PDFCanvasViewer } from "@/components/PDFCanvasViewer";
import { EmptyState } from "@/components/EmptyState";


interface Book {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  currentPage: number;
  totalPages?: number | null;
}

interface UnifiedReaderProps {
  books: Book[];
}

export function UnifiedReader({ books }: UnifiedReaderProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stopwatch state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    if (bookTitle.trim()) {
      formData.append("title", bookTitle.trim());
    }

    startUploadTransition(async () => {
      await uploadBook(formData);
      setBookTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploadModalOpen(false);
    });
  };

  const handleDeleteBook = (bookId: string) => {
    if (!confirm("Are you sure you want to remove this book from your library?")) return;
    startDeleteTransition(async () => {
      await deleteBook(bookId);
      if (selectedBook?.id === bookId) setSelectedBook(null);
    });
  };

  // ACTIVE READER MODE
  if (selectedBook) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-[#111217] overflow-hidden">
        {/* Reader HUD Header */}
        <header className="h-14 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedBook(null);
                setIsTimerRunning(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>
            <div className="truncate">
              <h2 className="text-sm font-bold text-zinc-900 truncate">
                {selectedBook.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stopwatch pill */}
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-xl text-xs font-mono font-bold text-zinc-800">
              <Timer className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatTimer(timerSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:text-blue-600 transition"
                title={isTimerRunning ? "Pause" : "Start"}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                  setIsFullscreen(true);
                } else {
                  document.exitFullscreen();
                  setIsFullscreen(false);
                }
              }}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* PDF Canvas Viewer with Ctrl+Wheel Zoom and Instant Page Memory */}
        <div className="flex-1 w-full h-[calc(100vh-56px)] bg-[#0d0e12] overflow-hidden">
          <PDFCanvasViewer
            fileUrl={selectedBook.fileUrl}
            initialPage={selectedBook.currentPage || 1}
            onPageChange={(page) => {
              updateBookProgress(selectedBook.id, page);
            }}
          />
        </div>

      </div>
    );
  }

  // BOOKSHELF / LIBRARY VIEW
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Reading Room
          </h1>
          <p className="text-xs text-zinc-500">
            Continuous canvas reader with page memory and mouse-scroll zoom
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full flex-1">
        {books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Your Library Is Empty"
            description="Upload study books, documentation, or textbooks in PDF format to start deep-focus reading sessions with automatic page memory."
            actionLabel="+ Upload Your First PDF"
            onAction={() => setIsUploadModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-200 transition group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold mb-4 shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mb-4">
                    Page {book.currentPage || 1}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setIsTimerRunning(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Open & Read
                  </button>

                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={isDeleting}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200"
          >
            <h3 className="font-bold text-base text-zinc-900 mb-1">
              Upload PDF Book
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Add a PDF to your personal library.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Book Title (Optional)
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Python Programming, DSA"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-600 text-zinc-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  PDF File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  required
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 text-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition shadow-sm"
              >
                {isUploading ? "Uploading..." : "Upload Book"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
