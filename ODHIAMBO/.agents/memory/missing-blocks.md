---
name: Missing Blockly blocks
description: Where to add new/compatibility blocks and which ones were added for bot XML import compatibility.
---

All custom and compatibility blocks live in:
`brian-the-trader/src/external/bot-skeleton/scratch/blocks/Binary/Tools/Misc/missing_blocks.js`

It is imported last in `Misc/index.js` so it can reference blocks defined earlier in the same category.

**Important constraint:** `epoch` block is in `Tools/Time` which loads AFTER `Tools/Misc` in `blocks/index.js`. Never alias `window.Blockly.Blocks.epoch` directly inside `missing_blocks.js` — it will be undefined. Instead, define `epoch_now` as a standalone block with its own generator (`Bot.getTime()`).

**Blocks added:**
- `math_number_positive` — shadow block used by text_charAt / text_getSubstring; without it Blockly throws "Unknown block" on import
- `check_result` — old name alias for `contract_check_result` (older bot XMLs use this)
- `cond_diff` — abs difference of two numbers; very common in Martingale bots
- `pchange` — percentage change of last N ticks
- `total_profit_loss` — alias for `total_profit`
- `contract_profit` — reads profit (index 4) from contract details; usable only inside after_purchase
- `last_tick_direction` — boolean: was last tick a rise/fall/no-change?
- `tick_count` — number of ticks in current list
- `noop` / `epoch_now` / `profit_for_sell` / `is_sold` — further compatibility aliases

**How to apply:** Any new block type seen in failing bot XMLs → add definition + JS generator to `missing_blocks.js`, then expose it in `toolbox-items.tsx` in the appropriate category.
