---
description: A workflow to install dependencies and build the Next.js project.
---

Follow these steps to compile and build the Next.js project:

### 1. Install Dependencies
Install all package dependencies configured in `package.json`:
```bash
npm install
```

### 2. Run TypeScript Typechecking
Verify there are no TypeScript type errors in the codebase:
```bash
npm run typecheck
```

### 3. Compile and Build
Compile the application into a production bundle:
```bash
npm run build
```
