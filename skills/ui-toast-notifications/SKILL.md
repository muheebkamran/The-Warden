---
name: ui-toast-notifications
description: Toast notifications, transient status alerts, Sonner library integration, promise-driven toasts, and dark theme notification patterns for The Warden. Use this skill whenever implementing user action confirmations, error alerts, promise spinners, or configuring the Sonner toast notification system.
---

# Warden Toast & Feedback Architecture

A guide to user feedback and transient toast notifications in **The Warden** powered by [Sonner](https://sonner.emilkowal.ski).

Use this skill to implement polished, non-intrusive feedback for mutations (saving habits, recording transactions, deleting records).

---

## 1. Global Setup & Mounting Rule

Mount `<Toaster />` **exactly once** in [`src/app/layout.tsx`](file:///C:/Users/muhee/Desktop/Programs/The-Warden/src/app/layout.tsx):

```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        {children}
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          toastOptions={{
            className: 'bg-neutral-900/95 border border-neutral-800 text-neutral-100 backdrop-blur-md shadow-2xl rounded-xl',
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
```

* **Never mount duplicate `<Toaster />` tags in pages or modals.**

---

## 2. Standard Toast Call Recipes

```tsx
import { toast } from 'sonner';

// 1. Success confirmation
toast.success('Habit completed for today');

// 2. Error message
toast.error('Failed to update transaction', {
  description: 'Please check your connection and try again.',
});

// 3. Asynchronous Promise Toast (ideal for Server Actions)
toast.promise(updateBill(billId, formData), {
  loading: 'Updating bill details...',
  success: 'Bill updated successfully',
  error: (err) => err.message || 'Failed to update bill',
});

// 4. Action Toast with Undo capability
toast('Transaction logged', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo(transactionId),
  },
});
```
