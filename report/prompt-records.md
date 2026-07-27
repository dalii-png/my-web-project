# Prompt Records

This document records prompt templates used in the practice. Since complete raw conversation history is not preserved, the following prompts are reconstructed based on actual development tasks.

## Disclaimer

Items explicitly marked "template" are reconstructed prompt templates based on actual development tasks and do not represent verbatim original conversation records.

---

## 1. Academic Paper Outline Prompt (Template)

**Purpose**: Design a paper outline

**Prompt**:
```
Please help me design a paper outline on the topic of "[填写]".
Target audience: [填写]
Required sections: abstract, keywords, introduction, literature review, methodology, analysis, conclusions, references.
Please provide a detailed outline with 2-3 key points for each section.
```

**AI Output Summary**: [待补充]

**Manual Modifications**: [待补充]

**Final Adoption**: [填写: Yes/No/Modified]

**Issues**: [待补充]

---

## 2. Academic Content Generation Prompt (Template)

**Purpose**: Generate content for a specific section

**Prompt**:
```
Please write the "[填写]" section for my academic paper.
Context: [填写]
Requirements: Academic style, cite relevant literature, 500-800 words.
```

**AI Output Summary**: [待补充]

**Manual Modifications**: [待补充]

**Final Adoption**: [填写]

**Issues**: [待补充]

---

## 3. Fact-Checking Prompt (Template)

**Purpose**: Verify AI-generated content

**Prompt**:
```
Please verify the following claims in the text and indicate the original sources for each:
[Paste text here]
For each claim, indicate whether it can be verified, partially verified, or cannot be verified.
```

**AI Output Summary**: [待补充]

**Manual Modifications**: [待补充]

**Final Adoption**: [填写]

**Issues**: [待补充]

---

## 4. Website Requirements Analysis Prompt (Template)

**Purpose**: Analyze requirements for the website project

**Prompt**:
```
I need to build a graduate school preparation dashboard website. The features needed are:
[List features]
Please suggest: tech stack, project structure, component design.
Constraints: Must support localStorage persistence, responsive layout, and easy deployment.
```

**AI Output Summary**: Suggested React + TypeScript + Vite + HashRouter tech stack.

**Manual Modifications**: Confirmed tech stack selection approved.

**Final Adoption**: Yes (modified)

**Issues**: Initially suggested BrowserRouter, later changed to HashRouter for easier GitHub Pages deployment.

---

## 5. Page Design Prompt (Template)

**Purpose**: Design specific page layouts

**Prompt**:
```
Please design a dashboard page for a graduate school preparation website with:
- Left sidebar navigation
- Main content area with stat cards showing task progress
- Module progress bars
- Today's task list grouped by morning/afternoon/evening
Tech stack: React + TypeScript, uses HashRouter.
```

**AI Output Summary**: Generated Dashboard.tsx with stats cards, module progress bars, and task list sections.

**Manual Modifications**: Adjusted layout, colors, and card styles.

**Final Adoption**: Yes

**Issues**: [待补充]

---

## 6. Responsive Layout Prompt (Template)

**Purpose**: Implement responsive design

**Prompt**:
```
Please add responsive CSS to this React dashboard project.
Breakpoints: mobile 768px, tablet 900px.
Requirements: sidebar collapses on mobile, grid columns adjust, font sizes scale down.
Current CSS: [attach file content]
```

**AI Output Summary**: Added media queries at 900px and 768px breakpoints.

**Manual Modifications**: Tested on different viewport sizes and adjusted breakpoint values.

**Final Adoption**: Yes

**Issues**: [待补充]

---

## 7. Error Debugging Prompt (Template)

**Purpose**: Debug build errors

**Prompt**:
```
I'm getting the following build error:
[Error message]
The project is a Vite + React + TypeScript project.
Please help identify the cause and provide a fix.
```

**AI Output Summary**: [待补充 - based on actual errors encountered]

**Manual Modifications**: [待补充]

**Final Adoption**: [填写]

**Issues**: [待补充]

---

## 8. localStorage Data Cleanup Prompt (Template)

**Purpose**: Clean personal data from localStorage

**Prompt**:
```
My project stores data in localStorage. The data structure includes:
{
  profile: { name, school, major, gpa, rank, cet6 },
  tasks: [...],
  diaries: [...],
  ...
}

I need to remove the profile object without affecting other data.
Please create a migration that:
1. Only executes once (use a marker flag)
2. Wrapped in try/catch
3. Does NOT use localStorage.clear()
```

**AI Output Summary**: Created IIFE in main.tsx with marker flag `baoyan_profile_cleanup_v1` and V5 migration in storage.ts.

**Manual Modifications**: Verified migration logic, tested with existing localStorage data.

**Final Adoption**: Yes

**Issues**: Initial patch caused file duplication in storage.ts, required manual fix.

---

## 9. Cache/Service Worker Troubleshooting Prompt (Template)

**Purpose**: Diagnose browser cache issues

**Prompt**:
```
My deployed website shows old content on computer browsers but new content on mobile.
The project is deployed on GitHub Pages, using Vite with content-hashed filenames.
Please check: Service Worker, cache headers, localStorage data.
```

**AI Output Summary**: Confirmed no Service Worker exists; added cache-control meta tags to index.html and pre-app localStorage cleanup IIFE.

**Manual Modifications**: Verified HTML meta tags in build output, confirmed JS filename hash changed.

**Final Adoption**: Yes

**Issues**: [待补充]

---

## 10. Deployment Problem Troubleshooting Prompt (Template)

**Purpose**: Debug deployment failures

**Prompt**:
```
My Vercel deployment shows "BUILD FAILED" with error:
[Error details]
The project uses Vite + React + TypeScript.
Please help diagnose and fix the issue.
```

**AI Output Summary**: Identified nested directory structure issue in GitHub repo; suggested repushing from correct directory or switching to GitHub Pages.

**Manual Modifications**: Switched deployment platform from Vercel to GitHub Pages due to Vercel domain accessibility issues in certain regions.

**Final Adoption**: Yes (modified strategy)

**Issues**: Vercel `ERR_CONNECTION_TIMED_OUT` in some regions, resolved by switching to GitHub Pages.
