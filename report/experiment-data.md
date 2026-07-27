# Experiment Data and Evaluation Metrics

## Website Feature Statistics

| Metric | Actual Data | Data Source | Notes |
|--------|-------------|-------------|-------|
| Planned feature modules | [填写] | User requirements | Number of planned modules |
| Completed feature modules | 11 pages + 1 layout | src/pages/ directory (12 .tsx files) | Dashboard, Tasks, Papers, Materials, Questions, Pressure, Diary, Calendar, Pomodoro, Schools, Settings, Layout |
| Feature completion rate | [填写] | Feature statistics | Calculate based on planned vs completed |
| Main code commits | 4 | Git log (01ff3bd..77c4716) | All commits on 2026-07-27 |
| Build success | Yes | npm run build output | 52 modules transformed, gzip total ~90.7 KB |
| Issues found during testing | [填写] | Test records | Record number of issues found |
| Issues resolved | [填写] | Git or test records | Record number resolved |
| Desktop testing | [填写] | Test records | Pass/Not tested |
| Mobile testing | [填写] | Test records | Pass/Not tested |
| WeChat testing | [填写] | Test records | Pass/Not tested |
| Console errors (severe) | [填写] | Browser inspection | Present/Not present/Not tested |

## Git Commit Records

| Commit Hash | Date | Message | Files Changed | Lines Changed |
|-------------|------|---------|---------------|---------------|
| 77c4716 | 2026-07-27 14:27 | Fix browser cache and localStorage profile cleanup | 2 files | +23/-1 |
| 33d06c8 | 2026-07-27 14:14 | Remove personal information | 7 files | +17/-24 |
| b4ed38a | 2026-07-27 13:53 | Add GitHub Pages deployment config | 2 files | +43/0 |
| 01ff3bd | 2026-07-27 12:02 | Initial commit for web project | 33 files | +5469/0 |

## Build Output Statistics

| File | Size | Gzip Size |
|------|------|-----------|
| index.html | 0.62 KB | 0.41 KB |
| index-DYgOJX3P.css | 8.31 KB | 2.32 KB |
| index-hK26aOTg.js | 301.18 KB | 88.12 KB |
| **Total** | ~310 KB | ~90.8 KB |

## Technology Dependencies Statistics

| Category | Count | Notes |
|----------|-------|-------|
| Runtime dependencies | 3 | react, react-dom, react-router-dom |
| Dev dependencies | 5 | @types/react, @types/react-dom, @vitejs/plugin-react, typescript, vite |
| Source files (.tsx/.ts) | ~30 | Excluding node_modules and dist |
| CSS files | 1 | index.css with responsive media queries |

## Deployment Information

| Item | Value |
|------|-------|
| Deployment platform | GitHub Pages |
| Repository | dalii-png/my-web-project |
| Built with | GitHub Actions (deploy.yml) |
| Site URL | https://dalii-png.github.io/my-web-project/ |
| Custom domain | Not configured |
| Deployment trigger | Push to main branch |

## localStorage Data Structure

| Key | Type | Content | Size Impact |
|-----|------|---------|-------------|
| baoyan_dashboard_data | JSON string | All app data (tasks, papers, materials, diaries, schools, questions, pressureQuestions, dailyCheckIns, studySessions, startDate, lastUpdated) | Main data |
| baoyan_dashboard_version | Number | Current version (5) | Minimal |
| baoyan_profile_cleanup_v1 | String | Cleanup marker ("1") | Minimal |
| baoyan_backup_* | JSON string | Auto-backups (max 5) | Per backup |

## Note on Data Accuracy

Only items with confirmed sources are filled with actual values. Items marked "[填写]" need manual supplementation based on personal operation records. Do not fabricate data to make the report appear better.
