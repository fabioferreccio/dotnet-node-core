import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Table } from "../../../src/System/Console/Table";
import { CsString } from "../../../src/System/Types/CsString";

describe("System.Console.Table (Phase 8 Public API)", () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        AnsiConsole.Configure({ width: 80 }); // Enforce deterministic width
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    test("renders_basic_grid_with_deterministic_width", () => {
        const table = new Table();
        table.AddColumn("Head1").AddColumn("Head2");
        table.AddRow("R1C1", "R1C2");
        table.Render(AnsiConsole.Console);
        
        // 80 width. colCount 2. innerWidth for each = floor((80-3)/2) = 38.
        const separator = "├" + "─".repeat(38) + "┼" + "─".repeat(38) + "┤";
        expect(logSpy).toHaveBeenCalledWith(separator);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("R1C1"));
    });

    test("auto_calculates_column_widths", () => {
        // Inherited from the uneven rows test
        const table = new Table();
        table.AddColumn("C1").AddColumn("C2");
        table.AddRow("OnlyOne");
        table.Render(AnsiConsole.Console);
        
        // Calculate expected layout dynamically to avoid fragility
        const width = 80;
        const colCount = 2;
        const colWidth = Math.floor((width - (colCount + 1)) / colCount); // 38
        const c1 = "OnlyOne".padEnd(colWidth);
        const c2 = "".padEnd(colWidth);
        const expected = "│" + c1 + "│" + c2 + "│";

        expect(logSpy).toHaveBeenCalledWith(expected);
    });

    test("handles_mixed_csstring_inputs", () => {
        const table = new Table();
        table.AddColumn(CsString.From("Col1"));
        table.AddRow(CsString.From("Val1"));
        table.Render(AnsiConsole.Console);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Col1"));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Val1"));
    });

    test("does_not_throw_on_empty_columns", () => {
        const table = new Table();
        table.Render(AnsiConsole.Console);
        expect(logSpy).not.toHaveBeenCalled();
    });

    test("does_not_support_advanced_layout_features", () => {
        // Enforce that Table is a sealed object, preventing runtime extension
        // which could be used to inject unsupported behavior or state.
        const table = new Table();
        expect(Object.isSealed(table)).toBe(true);

        // Verify public API surface (runtime check roughly equivalent to types)
        // We ensure no "Options" object was stored or accessible that might imply advanced config
        expect((table as any)._options).toBeUndefined();
    });
});
