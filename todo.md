# AuraQA — Audit Fix & Remediation Plan

Generated: 2026-05-24
Trigger: `npm audit fix --force` analysis

## Context

Running `npm audit fix --force` on the original package.json (which had correct versions)
caused npm to **downgrade** `next-auth` from v5-beta to v4.24.14. This broke auth entirely
because the codebase uses Auth.js v5 APIs (`handlers`, `auth`, `signIn`, `signOut` exports).
The package.json was restored from git. This plan addresses the **actual** underlying issues.

---

## P0 — Blocking: Tests & Build Broken

### 1. Upgrade Node.js from v20.12.2 to >=20.19.0 (or 22.x LTS)

**Problem**: Multiple packages require `^20.19.0 || >=22.12.0`:
- `rolldown@1.0.2` (vitest's bundler) — causes `Cannot find module '@rolldown/binding-win32-x64-msvc'`
- `vite@8.0.14`, `@vitejs/plugin-react@6.0.2`
- `jsdom@29.1.1` (test environment)
- Various CSS tooling (`@csstools/*`, `@asamuzakjp/*`)

**Impact**: `npm run test` is completely broken — 0 tests can run.

**Fix**:
- [ ] Install Node.js 22.x LTS (recommended) or update 20.x to >=20.19.0
- [ ] After upgrading: `Remove-Item -Recurse -Force node_modules; npm install`
- [ ] Verify: `npm run test` passes
- [ ] Update `package.json` with `engines` field: `{ "node": ">=20.19.0 || >=22.12.0" }`
- [ ] Update Dockerfile base image to match
- [ ] Update README prerequisites to specify minimum Node.js version

### 2. Fix build failure: Search page Suspense boundary

**Problem**: `npm run build` fails with:
```
useSearchParams() should be wrapped in a suspense boundary at page "/search"
```
Next.js 16 requires components calling `useSearchParams()` to be inside a `<Suspense>` boundary.

**Impact**: Production builds cannot be created.

**Fix** (`src/app/search/page.tsx`):
- [ ] Extract the search page body into a separate client component (e.g., `SearchContent`)
- [ ] Create a wrapper default export that renders `<Suspense fallback={...}><SearchContent /></Suspense>`
- [ ] Verify: `npm run build` completes successfully

---

## P1 — Should Fix: Lint Errors & Code Quality

### 3. Fix ESLint error: `require()` in search API route

**File**: `src/app/api/search/route.ts:141`
**Rule**: `@typescript-eslint/no-require-imports`

**Fix**:
- [ ] Replace `const { and } = require("drizzle-orm");` with a top-level ES import
- [ ] Move `import { and } from "drizzle-orm"` to the top of the file

### 4. Fix ESLint error: setState called in useEffect

**File**: `src/app/search/page.tsx:48`
**Rule**: `react-hooks/set-state-in-effect`

The `doSearch()` function calls `setLoading()` and `setResults()`, and is invoked
directly inside a `useEffect`. React 19's stricter lint rules flag this.

**Fix**:
- [ ] Refactor to avoid calling the search function directly in the effect body
- [ ] Option A: Use a ref to track initial load and trigger search outside the effect
- [ ] Option B: Restructure as a server component with initial data fetched server-side
- [ ] This will likely be addressed as part of the Suspense boundary fix (item #2)

### 5. Fix ESLint warning: unused `categorySlug` in ThreadForm

**File**: `src/components/forum/thread-form.tsx:14`
**Rule**: `@typescript-eslint/no-unused-vars`

**Fix**:
- [ ] Either use `categorySlug` in the component (e.g., for redirect after submit)
- [ ] Or remove it from the destructured props and the type definition

---

## P2 — Moderate: Remaining Audit Vulnerabilities (7 moderate)

### 6. postcss < 8.5.10 — XSS via unescaped `</style>` (GHSA-qx2v-qp2m-jg93)

**Source**: Transitive dependency of `next@16.2.6`
**Status**: No fix available — Next.js bundles its own postcss internally
**Risk**: Moderate — requires attacker-controlled CSS input being server-rendered

**Action**:
- [ ] Monitor Next.js releases for a patched version (likely 16.3.x or 16.4.x)
- [ ] When available: `npm install next@latest`
- [ ] **Mitigation**: Ensure no user-supplied CSS is server-rendered without sanitization

### 7. esbuild <= 0.24.2 — dev server request reading (GHSA-67mh-4wv8-2f99)

**Source**: `drizzle-kit` → `@esbuild-kit/esm-loader` → `@esbuild-kit/core-utils` → `esbuild`
**Status**: `@esbuild-kit/*` packages are deprecated (merged into `tsx`)
**Risk**: Low — only exploitable when running a dev server, and drizzle-kit is a CLI tool

**Action**:
- [ ] Monitor drizzle-kit releases for updated internal tooling
- [ ] The `@esbuild-kit/*` deprecation suggests drizzle-kit will eventually migrate to `tsx`
- [ ] **No code changes needed** — this is dev-only tooling, not shipped to production

---

## P3 — Housekeeping

### 8. Add `engines` field to package.json

Prevent future Node.js version mismatches from silently breaking the project.

- [ ] Add to `package.json`:
  ```json
  "engines": {
    "node": ">=20.19.0",
    "npm": ">=10.0.0"
  }
  ```
- [ ] Consider adding a `.nvmrc` or `.node-version` file with `22` (or `20.19.0`)

### 9. Pin `next-auth` version precisely

The current `"next-auth": "^5.0.0-beta.31"` uses a caret range on a beta version.
This is what caused `npm audit fix --force` to consider it downgradable to v4.

- [ ] Pin to exact version: `"next-auth": "5.0.0-beta.31"` (no caret)
- [ ] Or upgrade to the latest v5 beta and pin that

### 10. Regenerate package-lock.json

The lockfile was deleted during troubleshooting and regenerated. Verify it's correct.

- [ ] Run `npm install` on the target Node.js version
- [ ] Run `npm audit` — confirm 7 or fewer moderate vulnerabilities
- [ ] Run `npm run type-check && npm run lint && npm run test && npm run build`
- [ ] Commit the new lockfile

---

## Summary

| # | Issue | Severity | Effort | Status |
|---|-------|----------|--------|--------|
| 1 | Node.js version too old (v20.12.2) | P0 | Low (install) | **ACTION REQUIRED** — user must upgrade Node.js |
| 2 | Build fails: missing Suspense boundary | P0 | Low (code) | **DONE** |
| 3 | ESLint: require() in search route | P1 | Trivial | **DONE** |
| 4 | ESLint: setState in useEffect | P1 | Low | **DONE** |
| 5 | ESLint: unused categorySlug | P1 | Trivial | **DONE** |
| 6 | Vuln: postcss XSS (in next) | P2 | Wait | BLOCKED |
| 7 | Vuln: esbuild dev server (in drizzle-kit) | P2 | Wait | BLOCKED |
| 8 | Add engines field | P3 | Trivial | **DONE** |
| 9 | Pin next-auth version | P3 | Trivial | **DONE** |
| 10 | Regenerate lockfile | P3 | Low | **ACTION REQUIRED** — after Node.js upgrade |

**Remaining**: Upgrade Node.js to >=20.19.0, then `npm install` + `npm run test` to verify tests work.
