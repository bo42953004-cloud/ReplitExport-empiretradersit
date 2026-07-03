---
name: Dual-server workflow command
description: How to run both the API server and rsbuild dev server from one workflow.
---

**Working command:**
```
cd brian-the-trader && (node server.cjs &) && npm run dev
```

**Why parens matter:** Without `()`, bash runs `cd brian-the-trader && node server.cjs` in the background and then `npm run dev` in the **original** working directory (`/home/runner/workspace`), which has no `package.json` → ENOENT error. The subshell `(node server.cjs &)` inherits the changed directory and the `&&` after it keeps the foreground shell inside `brian-the-trader`.

**Ports:** API server on 3001 (dev) / 5000 (production). rsbuild dev server on 5000. `waitForPort: 5000` is the correct value for the workflow config.
