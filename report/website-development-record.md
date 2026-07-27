# Website Development Task Records

The following records are based on Git commits, file changes, and actual project code. Items marked "[待补充]" require additional personal operation logs.

## Task 1: Project Initialization

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Generated Vite + React + TypeScript project template; suggested project structure |
| Manual Work | Defined project requirements (graduate school preparation dashboard); selected HashRouter for routing |
| Testing Method | Verified package.json, checked src/ directory structure |
| Final Result | Project initialized successfully |
| Evidence | commit 01ff3bd; package.json with React 18, Vite 5, TypeScript |

## Task 2: Page Layout and Navigation

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Generated Layout.tsx with sidebar navigation and NavLink routing |
| Manual Work | Defined nav items (11 pages); confirmed layout design |
| Testing Method | Verified component exports and imports |
| Final Result | Fixed sidebar with 11 navigation links, right-side content area |
| Evidence | src/components/layout/Layout.tsx |

## Task 3: Feature Implementation

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Generated Dashboard, Tasks, Papers, Materials, Questions, Pressure, Diary, Calendar, Pomodoro, Schools, Settings page components |
| Manual Work | Defined data types in types/index.ts; implemented localStorage storage in utils/storage.ts; wrote default data in data/defaultData.ts |
| Testing Method | Verified component structure and data flow |
| Final Result | 11 functional pages implemented |
| Evidence | src/pages/*.tsx (12 files including test.txt) |

## Task 4: Error Debugging

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Diagnosed tsc -b failure due to locked tsbuildinfo files; suggested switching to vite build; identified duplicate code in storage.ts patch |
| Manual Work | Ran build commands; verified error messages; confirmed fixes |
| Testing Method | npm run build |
| Final Result | Build succeeded with 52 modules transformed |
| Evidence | commit history showing build fixes |

## Task 5: Privacy Information Cleanup

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Searched codebase for personal info (name, school, major, GPA, ranking, CET6); proposed deletion plan; implemented V5 migration |
| Manual Work | Confirmed deletion scope; reviewed all changes; verified no personal info remained |
| Testing Method | Global search for personal info strings; npm run build verification |
| Final Result | All personal info removed from source, build output clean |
| Evidence | commit 33d06c8 |

## Task 6: Deployment

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Generated GitHub Actions workflow; suggested Vercel initially; switched to GitHub Pages after Vercel connectivity issues |
| Manual Work | Created GitHub repository; enabled GitHub Pages; verified deployment |
| Testing Method | Visited deployed URL; tested on multiple devices |
| Final Result | Site deployed at https://dalii-png.github.io/my-web-project/ |
| Evidence | .github/workflows/deploy.yml; vite.config.ts base config |

## Task 7: Cache and Compatibility Fix

| Item | Content |
|------|---------|
| Codex/DeepSeek Assistance | Diagnosed browser cache as cause of stale data; suggested cache-control meta tags and localStorage cleanup IIFE |
| Manual Work | Reviewed and tested the fix logic |
| Testing Method | Verified HTML meta tags in build output; confirmed JS hash changed |
| Final Result | New JS bundle with different hash; anti-cache headers added |
| Evidence | commit 77c4716 |
