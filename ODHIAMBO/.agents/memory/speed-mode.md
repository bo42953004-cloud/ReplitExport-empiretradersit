---
name: Speed mode wiring
description: How fast/slow trade speed is implemented end-to-end in this codebase.
---

The SpeedToggle UI component in `trade-animation.tsx` stores `trade_speed_mode` in localStorage and fires a `trade_speed_changed` CustomEvent. That is purely cosmetic.

**To make it actually affect trades:**
- `run-panel-store.ts` `onRunButtonClick` reads `localStorage.getItem('trade_speed_mode')` and sets `window.__empireSpeedMode = 'fast' | 'normal'` before calling `dbot.runBot()`.
- `Proposal.js` `makeProposals()` checks `window.__empireSpeedMode === 'fast'` at the top and overrides `trade_option = { ...trade_option, duration: 1, duration_unit: 't' }` for all non-multiplier, non-accumulator contract types.
- The `animation--fast-mode` CSS class is applied to the animation container while the bot is running in fast mode, triggering an amber glow and a ⚡ prefix on the status text.

**Why:** Fast mode = 1-tick contracts which expire immediately on the next tick. Multiplier and Accumulator contracts do not use `duration`/`duration_unit` so they are left untouched.
