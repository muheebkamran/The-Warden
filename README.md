# 🛡️ THE WARDEN
### Personal Accountability Operating System • *"Keep Your Word"*

> *"Character is the ability to carry out a good resolution long after the excitement of the moment has passed."*  
> The core psychological identity of The Warden is simple: **"I do what I say I will do."**

---

## 🧭 Overview

**The Warden** is a high-performance personal accountability and habit operating system built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Prisma ORM**. 

Unlike generic CRUD habit apps that rely on cheap gamification and dopamine loops, The Warden is engineered around an **ethical behavioral psychology loop**:
1. **Commit**: Declare measurable daily standards.
2. **Act**: Execute the standard in the real world.
3. **Record**: Log proof and completion without friction.
4. **See Evidence**: Immediate visual feedback reinforcing progress.
5. **Strengthen Identity**: Cement internal consistency and self-trust.
6. **Return**: Come back because progress is meaningful, not manipulative.

---

## ⚡ Key Features & Architecture

### 1. 🏠 Home Command Center (`/`)
- **Daily Command Center**: Clean, focused interface answering one question: *"What do I need to do today?"*
- **"My Daily Goals" Hero Card**:
  - Dynamic motivation state (*"Your daily goals almost done! X more to go"* or *"All daily goals completed! Outstanding standard"*).
  - Progress ratio counters (*X Done*, *Y Remaining*) and smooth animated percentage bar.
- **Micro-Interaction Checklists**:
  - Interactive circular checkboxes with instantaneous optimistic UI (zero latency).
  - Satisfying checkmark spring pop animation (`animate-check-pop`).
  - Target time indicators for every discipline.
- **Personalized Welcome Greeting**:
  - Floating greeting (*"Welcome, Muheeb"*) that enters smoothly on load and auto-dismisses after 3.8s without blocking user interactions.
- **Snapshots**: Direct access to Promise Vault commitments, 31-day Matrix, and Analytics.

### 2. 🔒 Strict Date-Entry Enforcement
Enforces a non-negotiable temporal accountability rule across both frontend and backend:
- **Today**: Allowed (full entry, editing, toggling).
- **Yesterday**: Allowed (late entry window for missed tracking).
- **Tomorrow / Future**: **Strictly Blocked** in UI and rejected by server actions (`assertEntryDateAllowed`).
- **Past (> 1 Day)**: **Locked** to preserve historical integrity.
- **Timezone-Safe**: Uses local calendar calculations (`formatLocalDate`) to prevent UTC date-shift bugs.

### 3. 🎯 Disciplines & Habits Management (`/habits`)
- Dedicated management space sharing the **exact same single source of truth** with Home.
- Add new daily disciplines with customizable daily target minutes.
- Edit discipline targets and rename habits.
- 7-day mini consistency dots displaying recent execution patterns.
- Delete confirmation safety modal.

### 4. 📊 31-Day Habit Matrix (`/matrix`)
- Month-wide spreadsheet execution grid tracking every discipline day-by-day.
- Cell click logging: toggle showed-up status or record exact hours/minutes.
- Monthly consistency totals and completion percentages per habit.

### 5. 📖 Reading Room (`/reader`)
- High-performance PDF reader with custom Canvas rendering (`PDFCanvasViewer`).
- Page memory: automatically stores exact page left off and resumes seamlessly upon returning.
- Zoom controls, mouse wheel zoom, and fullscreen support.

### 6. 🛡️ Promise Vault (`/vault`)
- Identity and integrity tracker: log explicit daily vows.
- Streak counter and fulfillment tracking (*Total Promised vs. Total Kept*).
- Status states: `pending`, `kept`, `missed`.

### 7. 📈 Trends & Biometrics (`/trends`)
- Correlates habit execution with physical recovery and digital discipline:
  - Focus hours logged.
  - Phone screen time vs. productivity.
  - Sleep duration and wake consistency.

### 8. 🎨 Settings & Dynamic Theme Engine (`/settings`)
- **Profile Configuration**: Custom display name (default: `"Muheeb"`).
- **Appearance & Accent Customization**:
  - Item / Accent Color: 8 curated presets (*Electric Blue, Royal Indigo, Violet Iris, Emerald Forest, Amber Flame, Crimson Red, Rose Pink, Ocean Cyan*) plus custom hex picker.
  - Whole Screen / Background Color: Crisp Slate, Pure White, Soft Sand, Modern Charcoal, Deep Obsidian, Midnight Navy.
  - **Dynamic Contrast Engine**: Automatically computes background luminance and adjusts text tokens to guarantee high readability across all themes.
  - **Live Preview**: Real-time card demonstrating buttons, progress bars, and badges before saving.
  - **Persistence**: Saved directly to the `UserSettings` table in the database.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.3.6 (App Router, Turbopack)](https://nextjs.org) |
| **UI Library** | [React 19.2.8](https://react.dev) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + Dynamic CSS Token Variables |
| **Icons** | [Lucide React](https://lucide.dev) |
| **ORM** | [Prisma 6.19.3](https://prisma.io) |
| **Database** | SQLite (`dev.db`) locally • Cloudflare D1 in production |
| **PDF Engine** | [PDF.js](https://mozilla.github.io/pdf.js/) Canvas Viewer |
| **Charts** | [Recharts](https://recharts.org) |

---

## 📂 Project Structure

```
accountability-app/
├── prisma/
│   ├── schema.prisma       # Prisma schema (Goal, DailyRecord, GoalRecord, Promise, UserSettings)
│   ├── dev.db              # Local SQLite database
│   └── d1-schema.sql       # Production Cloudflare D1 DDL migration script
├── public/                 # Static assets & PDF worker
├── src/
│   ├── app/
│   │   ├── actions.ts      # Server actions with date validation & revalidation
│   │   ├── globals.css     # CSS token variables & micro-interaction keyframes
│   │   ├── layout.tsx      # Root application layout
│   │   ├── page.tsx        # HOME Command Center
│   │   ├── habits/         # Disciplines & Habits Management
│   │   ├── matrix/         # 31-Day Habit Matrix
│   │   ├── dashboard/      # Analytics, Biometrics & Debriefs
│   │   ├── reader/         # PDF Reading Room
│   │   ├── vault/          # Promise Vault
│   │   ├── trends/         # Biometrics & Trends
│   │   └── settings/       # Profile & Theme Settings
│   ├── components/
│   │   ├── AppLayout.tsx   # Global layout with dynamic theme CSS injection
│   │   ├── Sidebar.tsx     # Canonical prioritized sidebar navigation
│   │   ├── HomeCommandCenter.tsx # Daily Goals & Hero card
│   │   ├── HabitsManager.tsx     # Habit configuration & 7-day consistency
│   │   ├── SettingsManager.tsx   # Name & color customization
│   │   ├── WelcomeGreeting.tsx   # Micro-interaction welcome badge
│   │   └── PDFCanvasViewer.tsx   # High-resolution PDF engine
│   └── lib/
│       ├── db.ts           # Prisma client singleton
│       ├── dateRules.ts    # Centralized date entry validation rules
│       └── theme.ts        # Color luminance & contrast token calculation
├── wrangler.toml           # Cloudflare D1 database configuration
└── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Cloudflare D1 Ready

The application includes complete configuration for deployment with Cloudflare D1 serverless database:
- `wrangler.toml` configured with `DB` database binding.
- `prisma/d1-schema.sql` contains the complete SQL DDL ready to execute via:
  ```bash
  npx wrangler d1 execute accountability-db --remote --file=./prisma/d1-schema.sql
  ```

---

## 📜 License
Private & Confidential — Built for Personal Mastery.
