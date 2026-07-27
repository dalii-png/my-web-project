# Appendix D: Code Structure

Actual project directory structure (based on file inspection):

```
project/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages auto-deploy workflow
├── dist/                            # Build output (generated)
│   ├── index.html
│   └── assets/
│       ├── index-DYgOJX3P.css
│       └── index-hK26aOTg.js
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.tsx          # Sidebar + main layout wrapper
│   ├── data/
│   │   └── defaultData.ts          # Default sample data
│   ├── pages/
│   │   ├── Calendar.tsx            # Calendar view
│   │   ├── Dashboard.tsx           # Main dashboard with stats
│   │   ├── Diary.tsx               # Daily reflection diary
│   │   ├── Materials.tsx           # Material category management
│   │   ├── Papers.tsx              # Paper progress tracking
│   │   ├── Pomodoro.tsx            # Pomodoro timer
│   │   ├── Pressure.tsx            # Pressure interview questions
│   │   ├── Questions.tsx           # Interview question bank
│   │   ├── Schools.tsx             # Target institution management
│   │   ├── Settings.tsx            # Data backup/settings
│   │   └── Tasks.tsx               # 30-day task list
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   ├── dataValidation.ts       # Import data validation
│   │   ├── dateUtils.ts            # Date utility functions
│   │   ├── storage.ts              # localStorage CRUD + migration
│   │   ├── studyStats.ts           # Study statistics helpers
│   │   └── xlsxParser.ts           # Excel parsing utility
│   ├── App.tsx                     # Root component with routes
│   ├── index.css                   # Global styles + responsive
│   ├── main.tsx                    # Entry point + profile cleanup
│   └── vite-env.d.ts               # Vite type declarations
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Dependency lock file
├── tsconfig.json                    # TypeScript base config
├── tsconfig.app.json                # TypeScript app config
├── tsconfig.node.json               # TypeScript Node config
└── vite.config.ts                   # Vite build config
```

## Key File Descriptions

| File | Purpose |
|------|---------|
| src/App.tsx | Root React component, defines all routes with react-router-dom |
| src/main.tsx | Application entry point, renders App wrapped in HashRouter, contains localStorage profile cleanup IIFE |
| src/components/layout/Layout.tsx | Left sidebar with navigation, right main content area |
| src/types/index.ts | All TypeScript interfaces and type definitions (AppData, Task, Paper, etc.) |
| src/utils/storage.ts | localStorage save/load/export functions, data migration (V1-V5) |
| src/utils/dataValidation.ts | Import data validation and normalization |
| src/data/defaultData.ts | Default sample dataset for app initialization |
| src/index.css | Complete CSS with custom properties and responsive breakpoints |
| .github/workflows/deploy.yml | CI/CD pipeline for GitHub Pages auto-deployment |
| vite.config.ts | Vite build configuration with base path and React plugin |
