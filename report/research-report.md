# Generative AI Assisted Academic Writing and Website Development: A Case Study with Codex and DeepSeek

## Abstract

This study explores the auxiliary role of generative AI tools in academic writing and personal website development. Based on the Codex intelligent programming assistant and its integrated DeepSeek large language model, the author completed an academic paper writing task and developed and deployed a dashboard website for graduate school preparation. Research findings: AI tools can significantly improve the efficiency of text generation and code writing, but their output has issues such as vague concepts, unreliable citations, and lack of personal experience; through structured prompt design and manual verification mechanisms, the quality of human-machine collaboration can be effectively improved. The website was successfully deployed via GitHub Pages, supporting task management, paper tracking, material organization, interview preparation, Pomodoro timer, diary, calendar, and data backup functions, and personal information has been anonymized.

**Keywords**: Generative AI; DeepSeek; Codex; Academic Writing; Website Development; Human-Machine Collaboration; Graduate School Preparation Management

---

## Chapter 1: Introduction

### 1.1 Research Background

With the rapid development of large language models, generative AI is increasingly widely used in academic writing, code generation, and software development. Since 2023, conversational AI tools represented by ChatGPT and DeepSeek have provided new work paradigms for researchers and developers. However, how to effectively use these tools, improve work efficiency while ensuring academic integrity and code quality, remains a topic worthy of deep exploration.

### 1.2 Research Purpose

This study aims to:
1. Practice and evaluate the auxiliary effect of Codex and DeepSeek in academic writing;
2. Practice and evaluate the performance of AI tools in the full process of frontend website development;
3. Summarize effective patterns and considerations for human-machine collaboration.

### 1.3 Research Content

1. Use Codex + DeepSeek to assist in completing an academic paper;
2. Use Codex + DeepSeek to develop and deploy a dashboard website for graduate school preparation from scratch;
3. Record and analyze the performance and limitations of AI tools in various tasks.

### 1.4 Research Methods

This study adopts the practice recording method. After completing each specific task with AI tools, record: prompts, AI output summaries, manual modifications, final results, and problems discovered. The complete project development history is also preserved through the Git version control system.

---

## Chapter 2: Tools, Environment, and Research Methods

### 2.1 Tool Introduction

**Codex**: An intelligent programming assistant developed by OpenAI, running in the local desktop environment. Codex assumes the core roles of task parsing, file operations, code generation, debugging assistance, and project management. It can understand natural language requirements, translate them into specific code operations, and read/write project file systems.

**DeepSeek**: A large language model developed by DeepSeek. In this practice, DeepSeek serves as the backend language model for Codex, responsible for text understanding, code generation, question answering, and content expansion. Codex interacts with DeepSeek through an API interface, integrating DeepSeek's language capabilities with the local programming environment.

Role distinction:

| Component | Role | Main Function |
|-----------|------|---------------|
| Codex | Frontend Intelligent Programming Assistant | Task parsing, file operations, project organization, code debugging, user interaction |
| DeepSeek | Backend Large Language Model | Text generation, code generation, question answering, knowledge query |

### 2.2 Experimental Environment

| Item | Actual Configuration |
|------|---------------------|
| Operating System | [填写] |
| Programming Tool | Codex |
| Integrated Model | DeepSeek |
| Editor | [填写] |
| Frontend Tech Stack | React 18 + TypeScript + Vite 5 |
| Routing Solution | react-router-dom v6 (HashRouter) |
| Build Tool | Vite |
| Version Management | Git (local repository) |
| Code Hosting | GitHub (dalii-png/my-web-project) |
| Deployment Platform | GitHub Pages |
| Browser | [填写] |
| Test Device | [填写] |

Items marked "[填写]" need to be supplemented based on the actual operating environment. Tech stack, build tool, version management, and deployment platform information are extracted from project package.json, vite.config.ts, Git remote configuration, and GitHub Actions workflow files.

### 2.3 Codex Integration with DeepSeek Process

```
User raises requirement
    v
Codex parses task (understands user intent, breaks down into subtasks)
    v
Codex calls DeepSeek API (submits prompts and context)
    v
DeepSeek generates text or code
    v
Codex displays output to user / executes file operations
    v
User checks, modifies and verifies
    v
Forms final academic article or website result
```

Step explanations:

1. User raises requirement: User describes the task in natural language, which can be a writing task or a development task.
2. Codex parses task: Codex analyzes natural language instructions, decomposes them into executable subtasks, and determines which DeepSeek capabilities to invoke.
3. DeepSeek generates output: DeepSeek generates text, code, or other content based on prompts and context.
4. Codex executes operations: For writing tasks, Codex presents generated content to the user; for development tasks, Codex can directly create or modify files, run build commands, and check errors.
5. User checks and modifies: User reviews AI-generated content, performs fact verification, code testing, structural adjustments, and language polishing.
6. Forms final result: After multiple iterations, a final result meeting requirements is formed.

### 2.4 Prompt Design

Prompts used in this practice follow these design principles:

- Structured: Clearly specify task type, output format, and constraints;
- Sufficient context: Provide necessary background information (e.g., project tech stack, existing code structure);
- Iterative optimization: Adjust prompts based on initial AI output effects, adding more specific instructions.

Specific prompt records see [prompt-records.md](./prompt-records.md).

---

## Chapter 3: Academic Writing Practice

### 3.1 Writing Task Description

[填写: Describe the paper topic, writing purpose, and target audience]

### 3.2 AI-Assisted Writing Process

The AI-assisted writing process in this practice includes:

1. Outline design: Use DeepSeek to generate preliminary paper outline, manually review and adjust structure.
2. Content generation: Submit prompts to DeepSeek chapter by chapter to generate draft text.
3. Fact checking: Verify AI-generated statistics, literature citations, and concept definitions item by item.
4. Editing and polishing: Perform language polishing, structural adjustments, and personal viewpoint supplementation on AI-generated text.
5. Final review: Read through the entire text to ensure logical coherence, reliable citations, and clear viewpoints.

Note: Since complete academic paper files are not preserved in this report's appendices, the above process is a general description based on practice logic. Specific prompts and modification details need to reference records from the actual writing process.

### 3.3 Analysis of AI-Generated Text Issues

| AI Output Issue | Specific Manifestation | Manual Processing | Final Result |
|-----------------|----------------------|-------------------|-------------|
| Vague concept expression | Using ambiguous expressions like "perhaps" or "usually", lacking concrete data support | Consult references and supplement specific values and cases | [待补充] |
| Unreliable citations | Fabricating non-existent papers, authors, or DOIs | Delete fabricated citations, replace with real sources | [待补充] |
| Content repetition | Similar expressions appearing in different paragraphs | Merge repeated content, supplement new analytical perspectives | [待补充] |
| Lack of personal experience | AI cannot write based on actual personal experience | Add real operational processes, personal reflections, and decision reasons | [待补充] |
| Overly absolute conclusions | Using absolute expressions like "inevitably" or "completely" | Change to cautious, conditional academic expressions | [待补充] |
| Code cannot run directly | AI-generated code has syntax errors or dependency issues | Debug and modify based on error messages | [待补充] |

### 3.4 Academic Integrity and Author Responsibility

This practice fully recognizes that AI tools only serve as auxiliary means and do not replace the author's academic responsibility. All AI-generated content is manually reviewed, verified, and modified before inclusion in formal text. The author bears full responsibility for the final output. AI tool usage should be clearly declared in papers to ensure academic transparency.

---

## Chapter 4: Personal Graduate School Preparation Website Development Practice

### 4.1 Website Construction Goals

The goal is to create a centralized management platform for the graduate school preparation sprint process, with functions covering:

- 30-day task planning and tracking
- Paper progress management
- Application material organization
- Interview question preparation
- Daily reflection diary
- Pomodoro timer
- Calendar planning
- Target institution information management
- Data backup and export

### 4.2 Website Feature Design

The website adopts a Single Page Application architecture, using HashRouter for client-side routing. The left side has a fixed sidebar navigation, and the right side is the content area.

Feature module table:

| Module | Actual Function | Completed | Evidence |
|--------|----------------|-----------|----------|
| Dashboard | 30-day task statistics, 7 module progress, today's tasks, paper status | Yes | src/pages/Dashboard.tsx |
| 30-Day Task List | Filter tasks by day/phase/category, support completion toggling | Yes | src/pages/Tasks.tsx |
| Paper Tracking | Paper status tracking, issue list management | Yes | src/pages/Papers.tsx |
| Material Library | Application material category management (identity, grades, documents, research, competitions, etc.) | Yes | src/pages/Materials.tsx |
| Interview Question Bank | Interview question category management, random simulation, proficiency rating | Yes | src/pages/Questions.tsx |
| Pressure Interview Bank | 25 pressure interview questions, standard frameworks, personal answer editing | Yes | src/pages/Pressure.tsx |
| Daily Reflection Diary | Diary writing, completion recording, mood scoring | Yes | src/pages/Diary.tsx |
| Calendar | Calendar view for planning | Yes | src/pages/Calendar.tsx |
| Pomodoro Timer | 25/5, 50/10, custom timing modes | Yes | src/pages/Pomodoro.tsx |
| Institution Management | Target institution information management, application status tracking | Yes | src/pages/Schools.tsx |
| Settings & Backup | JSON/CSV export, JSON import, local backup, clear data, restore defaults | Yes | src/pages/Settings.tsx |
| Responsive Layout | Desktop, tablet, mobile adaptive | Yes | src/index.css (media queries) |
| Data Persistence | All data stored in localStorage | Yes | src/utils/storage.ts |
| Privacy Cleanup | Personal profile module removed, code and data anonymized | Yes | commit 33d06c8 |
| Public Deployment | Deployed via GitHub Pages | Yes | GitHub Actions workflow |

### 4.3 AI-Assisted Development Process

Based on Git commit records (4 commits, during 2026-07-27), the development process can be divided into the following stages:

**Stage 1: Project Initialization and Initial Version (Initial commit, 01ff3bd)**

In this stage, the initial project setup was completed, including:
- Initializing project using Vite + React + TypeScript template
- Creating all 11 page components and sidebar layout
- Implementing localStorage data persistence
- Writing default sample data

**Stage 2: Deployment Configuration (b4ed38a)**

- Added GitHub Actions workflow for automatic deployment to GitHub Pages
- Modified vite.config.ts to add base path configuration

**Stage 3: Privacy Anonymization (33d06c8)**

- Removed personal profile module (name, school, major, grades, etc.)
- Changed profile field to optional type
- Added localStorage V5 data migration logic
- Cleaned personal data from interview preparation questions

**Stage 4: Cache and Compatibility Fix (77c4716)**

- Added HTML anti-cache meta tags
- Added localStorage cleanup IIFE before App loading in main.tsx
- Resolved issue of old browser cache causing old data display

### 4.4 Website Public Deployment Plan

| Item | Configuration |
|------|--------------|
| Deployment Platform | GitHub Pages |
| Code Repository | https://github.com/dalii-png/my-web-project |
| Build Command | npm run build (vite build) |
| Output Directory | dist |
| Deployment Branch | main (auto-deployed via GitHub Actions) |
| Access URL | https://dalii-png.github.io/my-web-project/ |
| Custom Domain | Not configured |
| Desktop Testing | [填写] |
| Mobile Testing | [填写] |
| WeChat Testing | [填写] |

Deployment flow: After each push to the main branch, GitHub Actions automatically executes the build (npm ci + npm run build) and deploys the build output to GitHub Pages.

### 4.5 Website Privacy and Security Handling

1. Personal information removal: The project originally contained a personal profile module (name, school, major, GPA, ranking, CET-6 score, etc.), all of which were removed and anonymized in the third commit.
2. localStorage compatibility cleanup: Implemented V5 data migration logic to automatically clear stored personal profile fields on application startup; also added an independent pre-cleanup IIFE in main.tsx.
3. No API Key exposure: After inspection, the frontend code does not contain any API Keys or Tokens.
4. No Service Worker caching issues: The project does not use Service Worker or PWA configuration.

### 4.6 Website Testing and Operation Results

Build result: `npm run build` succeeded, 52 modules transformed, generating index.html + CSS + JS three files, total gzip size approximately 90.7 KB.

Functional testing: See [testing-record.md](./testing-record.md)

---

## Chapter 5: Comprehensive Effects and Problem Analysis

### 5.1 AI Impact on Academic Writing Efficiency

[填写: Based on actual writing experience]

### 5.2 AI Impact on Website Development Efficiency

Based on actual project development experience:

- Code generation speed: AI can quickly generate large amounts of boilerplate code (such as page component structures, type definitions), significantly reducing manual writing time.
- Debugging efficiency: For common TypeScript type errors, build failures, etc., AI can quickly locate causes and provide fixes.
- Learning cost: Although AI can generate code, developers still need to understand code logic to effectively modify and debug.

### 5.3 AI Limitations

Main limitations encountered in this project:

1. Environmental differences: AI is unaware of actual sandbox environment and file system constraints, requiring multiple attempts to find feasible operation methods.
2. Context loss: In long conversations, AI may forget previous operation details, requiring re-provision of context.
3. One-shot accuracy: For complex multi-file modifications, AI's patch operations sometimes produce syntax errors, requiring manual checking and fixing.
4. Cannot access external networks: In sandbox environment, AI cannot verify online resource availability or test deployed websites.

### 5.4 Human-Machine Collaboration Division

| Work Content | AI Completed | Human Completed |
|--------------|-------------|----------------|
| Project Initialization | Generated Vite project template | Provided project requirements, confirmed technology selection |
| Page Component Development | Generated code framework | Defined feature requirements, reviewed code logic |
| Data Model Design | Generated type definitions | Confirmed data structure reasonableness |
| Style Development | Generated CSS code | Adjusted visual effects, responsive adaptation |
| Deployment Configuration | Generated Actions workflow | Enabled Pages on GitHub, triggered deployment |
| Privacy Handling | Searched and located, proposed modification plans | Confirmed deletion scope, verified build |
| Git Operations | Executed git commands | Manually operated when authentication needed |
| Test Verification | Ran build commands | Multi-device actual testing |

### 5.5 Problems and Improvements in Practice

| Problem | Solution |
|---------|----------|
| Sandbox permission restrictions causing file operation failures | Used elevated permission commands (require_escalated) |
| .tsbuildinfo file locked causing tsc -b failure | Switched to direct vite build |
| Incorrect resource paths in build output HTML references | Set base path in vite.config.ts |
| Old browser cache still displaying personal information | Added anti-cache meta tags and localStorage cleanup |
| GitHub Pages domain unreachable in some regions | Initially attempted Vercel but failed, then switched to GitHub Pages |

---

## Chapter 6: Standardized Usage Recommendations

### 6.1 Clear Task Boundaries

Break down complex tasks into specific subtasks, focusing each conversation round on one achievable goal, avoiding asking AI to complete too many operations at once.

### 6.2 Use Structured Prompts

Use clear task descriptions including: goal, input format, output format, constraints, and examples. For development tasks, provide existing code context.

### 6.3 Fact-Verify AI Output

- Writing: Verify citation sources, data accuracy, and correctness of concept definitions.
- Code: Check syntax, test execution, review logic.
- Configuration: Confirm actual deployment platform settings, do not blindly follow AI suggestions.

### 6.4 Preserve Complete Usage Process

Preserve complete AI usage records through Git commits, prompt records, and operation logs for review and analysis.

### 6.5 Make Transparent AI Usage Declarations

Clearly declare the usage method, scope, and extent of AI tools in academic outputs. See [ai-use-statement.md](./ai-use-statement.md).

---

## Conclusions

This practice verified the feasibility and effectiveness of the Codex + DeepSeek combination in human-machine collaboration scenarios through actual academic writing and website development tasks. AI tools can significantly improve the efficiency of code generation and content creation, but their output still requires human review, modification, and verification. The future can further explore more complex project scenarios and more refined prompt strategies.

---

## References

(See [reference-verification.md](./reference-verification.md) for details)

---

## Appendix Notes

(See [appendices/](./appendices/) for details)
