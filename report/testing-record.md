# Testing Records

## Build Tests

| Test Item | Test Method | Result | Pass | Notes |
|-----------|-------------|--------|------|-------|
| Production Build | npm run build | 52 modules, 3 output files | Yes | dist/index.html + JS + CSS |
| Build Time | Timing | ~1.5 seconds | Yes | Fast incremental build |
| Build Output Size | File inspection | ~310 KB (90.7 KB gzip) | Yes | Acceptable for SPA |
| JS Content Hash | File inspection | index-hK26aOTg.js | Yes | Unique hash per build |

## Functional Tests

| Test Item | Test Method | Result | Pass | Notes |
|-----------|-------------|--------|------|-------|
| Homepage Access | Browser load | [填写] | [填写] | Check console for errors |
| Navigation | Click all nav items | [填写] | [填写] | Verify route changes |
| Page Refresh | Refresh on each page | [填写] | [填写] | Check data persists |
| Desktop Layout | 1920x1080 viewport | [填写] | [填写] | Sidebar + content area |
| Mobile Layout | 375x667 viewport | [填写] | [填写] | Collapsed sidebar |
| Data Export (JSON) | Click export button | [填写] | [填写] | Download .json file |
| Data Export (CSV) | Click export CSV button | [填写] | [填写] | Download .csv file |
| Data Import | Import valid JSON | [填写] | [填写] | Data restored correctly |
| Local Backup | Create backup | [填写] | [填写] | Backup appears in list |
| Clear Data | Clear with DELETE confirm | [填写] | [填写] | Data cleared, auto-backup |

## Privacy Tests

| Test Item | Test Method | Result | Pass | Notes |
|-----------|-------------|--------|------|-------|
| Personal Info in Source | Global search | No matches found | Yes | Verified 2026-07-27 |
| Personal Info in Build | Search dist/ files | No matches found | Yes | Verified 2026-07-27 |
| localStorage Profile Cleanup | Check after migration | [填写] | [填写] | V5 migration should clear profile |
| Pre-App Cleanup IIFE | Check marker key | [填写] | [填写] | baoyan_profile_cleanup_v1 |
| No API Keys Exposed | Code search | None found | Yes | Verified 2026-07-27 |

## Cross-Platform Tests

| Test Item | Test Method | Result | Pass | Notes |
|-----------|-------------|--------|------|-------|
| Desktop Chrome | Browser test | [填写] | [填写] | |
| Desktop Edge | Browser test | [填写] | [填写] | |
| Mobile Safari | Browser test | [填写] | [填写] | |
| Mobile Chrome | Browser test | [填写] | [填写] | |
| WeChat In-App Browser | Browser test | [填写] | [填写] | |
| Incognito Mode | Browser test | [填写] | [填写] | |

## Console Error Tests

| Test Item | Test Method | Result | Pass | Notes |
|-----------|-------------|--------|------|-------|
| Console Errors (Severe) | F12 Console | [填写] | [填写] | Check for red errors |
| Console Warnings | F12 Console | [填写] | [填写] | Verify no data warnings |
| Network Errors | F12 Network tab | [填写] | [填写] | Check all resources load |

## Notes

Items marked "[填写]" require actual browser testing by the author on the deployed site.
