import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../../utils';

// ─── math_number_positive ────────────────────────────────────────────────────
// Used as a shadow block inside text_charAt and text_getSubstring.
// Without this definition Blockly throws "Unknown block: math_number_positive"
// and refuses to load any bot XML that contains those blocks.
window.Blockly.Blocks.math_number_positive = {
    init() {
        this.jsonInit({
            message0: '%1',
            args0: [{ type: 'field_number', name: 'NUM', value: 1, min: 1, precision: 1 }],
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('A positive integer'),
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.math_number_positive = block =>
    [String(block.getFieldValue('NUM') || 1), window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];

// ─── check_result (old name alias) ──────────────────────────────────────────
// Older bot XMLs reference "check_result" while newer code defines
// "contract_check_result". Register the old name so those bots load.
window.Blockly.Blocks.check_result = window.Blockly.Blocks.contract_check_result;
window.Blockly.JavaScript.javascriptGenerator.forBlock.check_result =
    window.Blockly.JavaScript.javascriptGenerator.forBlock.contract_check_result;

// ─── cond_diff ───────────────────────────────────────────────────────────────
// Very common in Martingale-style bots.
// "The difference between A and B is [greater than / less than / equal to] C"
window.Blockly.Blocks.cond_diff = {
    init() { this.jsonInit(this.definition()); },
    definition() {
        return {
            message0: '%1 %2 %3',
            args0: [
                { type: 'input_value', name: 'A', check: 'Number' },
                {
                    type: 'field_dropdown',
                    name: 'OP',
                    options: [
                        [localize('minus'), 'MINUS'],
                        [localize('plus'), 'PLUS'],
                    ],
                },
                { type: 'input_value', name: 'B', check: 'Number' },
            ],
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns the absolute difference between A and B, compared with C.'),
            category: window.Blockly.Categories.Miscellaneous,
        };
    },
    meta() {
        return {
            display_name: localize('Difference (A − B)'),
            description: localize('Calculates the difference between two numbers. Useful for Martingale strategies.'),
        };
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.cond_diff = block => {
    const ORDER = window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC;
    const a = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'A', ORDER) || '0';
    const b = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'B', ORDER) || '0';
    const op = block.getFieldValue('OP');
    const code = op === 'MINUS' ? `Math.abs((${a}) - (${b}))` : `Math.abs((${a}) + (${b}))`;
    return [code, ORDER];
};

// ─── pchange ─────────────────────────────────────────────────────────────────
// "Percentage change of the last N ticks" — used by many trend-following bots.
window.Blockly.Blocks.pchange = {
    init() { this.jsonInit(this.definition()); },
    definition() {
        return {
            message0: localize('Percentage change of last {{ n }} ticks', { n: '%1' }),
            args0: [{ type: 'input_value', name: 'NCANDLES', check: 'Number' }],
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns the percentage change of the last N ticks: (last - first) / first × 100'),
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: localize('Percentage change'),
            description: localize('Returns the percentage price change across the last N ticks.'),
        };
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.pchange = block => {
    const n = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 'NCANDLES', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    const code = `(async () => {
        const _tks = await Bot.getTicks();
        const _sl = _tks.slice(-Math.max(2, Number(${n})));
        const _first = _sl[0], _last = _sl[_sl.length - 1];
        return _first !== 0 ? ((_last - _first) / Math.abs(_first)) * 100 : 0;
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_AWAIT];
};

// ─── total_profit_loss (alias for total_profit) ──────────────────────────────
// Some exported bot XMLs use this name.
window.Blockly.Blocks.total_profit_loss = window.Blockly.Blocks.total_profit;
window.Blockly.JavaScript.javascriptGenerator.forBlock.total_profit_loss =
    window.Blockly.JavaScript.javascriptGenerator.forBlock.total_profit;

// ─── contract_profit ─────────────────────────────────────────────────────────
// Convenience alias: reads profit (field 4) from contract details.
window.Blockly.Blocks.contract_profit = {
    init() {
        this.jsonInit({
            message0: localize('Contract profit/loss'),
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns the profit or loss of the last contract.'),
            category: window.Blockly.Categories.After_Purchase,
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
    restricted_parents: ['after_purchase'],
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.contract_profit = () =>
    ['Bot.readDetails(4)', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];

// ─── last_tick_direction ──────────────────────────────────────────────────────
// "Was the last tick a rise or fall?" — used in many simple bots.
window.Blockly.Blocks.last_tick_direction = {
    init() {
        this.jsonInit({
            message0: localize('Last tick is {{ direction }}', { direction: '%1' }),
            args0: [{
                type: 'field_dropdown',
                name: 'DIRECTION',
                options: [
                    [localize('Rise'), 'rise'],
                    [localize('Fall'), 'fall'],
                    [localize('No change'), ''],
                ],
            }],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('True if the last tick moved in the selected direction.'),
            category: window.Blockly.Categories.Tick_Analysis,
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.last_tick_direction = block => {
    const dir = block.getFieldValue('DIRECTION');
    return [`Bot.checkDirection('${dir}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
};

// ─── tick_count ───────────────────────────────────────────────────────────────
// Some older bots use "tick_count" to mean "number of ticks in the current list".
window.Blockly.Blocks.tick_count = {
    init() {
        this.jsonInit({
            message0: localize('Number of ticks'),
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns the total number of ticks in the current tick list.'),
            category: window.Blockly.Categories.Tick_Analysis,
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.tick_count = () =>
    ['Bot.getTicks().then(t => t.length)', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];

// ─── noop (useless_block alias) ───────────────────────────────────────────────
// Some bot XMLs export a placeholder "noop" block.
window.Blockly.Blocks.noop = window.Blockly.Blocks.useless_block;
window.Blockly.JavaScript.javascriptGenerator.forBlock.noop =
    window.Blockly.JavaScript.javascriptGenerator.forBlock.useless_block;

// ─── sell_price_alias (old name: profit_for_sell) ────────────────────────────
window.Blockly.Blocks.profit_for_sell = window.Blockly.Blocks.sell_price;
window.Blockly.JavaScript.javascriptGenerator.forBlock.profit_for_sell =
    window.Blockly.JavaScript.javascriptGenerator.forBlock.sell_price;

// ─── is_sold ─────────────────────────────────────────────────────────────────
// Returns whether the current open contract has been sold (closed early).
window.Blockly.Blocks.is_sold = {
    init() {
        this.jsonInit({
            message0: localize('Contract is sold'),
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('True if the current contract has been sold / closed early.'),
            category: window.Blockly.Categories.During_Purchase,
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.is_sold = () =>
    ['Bot.isSellAvailable()', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];

// ─── epoch_now ────────────────────────────────────────────────────────────────
// Some bots use "epoch_now" instead of "epoch" for the current server time.
// epoch is loaded AFTER Misc in blocks/index.js so we defer the alias.
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.Blockly?.Blocks?.epoch) {
            window.Blockly.Blocks.epoch_now = window.Blockly.Blocks.epoch;
            window.Blockly.JavaScript.javascriptGenerator.forBlock.epoch_now =
                window.Blockly.JavaScript.javascriptGenerator.forBlock.epoch;
        }
    }, { once: true });
}
// Also register a direct generator so XML with epoch_now always works:
window.Blockly.JavaScript.javascriptGenerator.forBlock.epoch_now = () =>
    ['Bot.getTime()', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
window.Blockly.Blocks.epoch_now = {
    init() {
        this.jsonInit({
            message0: localize('Current epoch time'),
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('Returns the current server time as a Unix epoch timestamp.'),
            category: window.Blockly.Categories.Time,
        });
    },
    customContextMenu(menu) { modifyContextMenu(menu); },
};
