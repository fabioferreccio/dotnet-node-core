import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Table } from "../../../src/System/Console/Table";
import { CsString } from "../../../src/System/Types/CsString";

describe("System.Console.Table (Phase 8 Public API)", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 80 }); // Enforce deterministic width
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    test("renders_basic_grid_with_deterministic_width", () => {
        const table = new Table();
        table.AddColumn("Head1").AddColumn("Head2");
        table.AddRow("R1C1", "R1C2");
        table.Render(AnsiConsole.Console);

        // 80 width. colCount 2. innerWidth for each = floor((80-3)/2) = 38.
        const separator = "├" + "─".repeat(38) + "┼" + "─".repeat(38) + "┤";
        expect(stdoutSpy).toHaveBeenCalledWith(separator);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("R1C1"));
    });

    test("auto_calculates_column_widths", () => {
        // Inherited from the uneven rows test
        const table = new Table();
        table.AddColumn("C1").AddColumn("C2");
        table.AddRow("OnlyOne"); // "OnlyOne"(7) > "C2"(2). Ratio ~3.5
        table.Render(AnsiConsole.Console);

        // Smart layout allocates space proportionally.
        // C1 should be much wider than C2.
        // We verify that both exist and widths sum up to available space roughly.
        
        // Use regex to capture widths
        // Pattern: ┌(dashes)┬(dashes)┐
        const call = stdoutSpy.mock.calls.find(c => c[0].startsWith("┌"));
        expect(call).toBeDefined();
        
        const line = call![0];
        const parts = line.substring(1, line.length - 1).split("┬");
        const w1 = parts[0].length;
        const w2 = parts[1].length;
        
        expect(w1 + w2).toBeLessThanOrEqual(77); // 80 - 3 borders
        // W1 should be > W2
        expect(w1).toBeGreaterThan(w2);
    });

    test("handles_mixed_csstring_inputs", () => {
        const table = new Table();
        table.AddColumn(CsString.From("Col1"));
        table.AddRow(CsString.From("Val1"));
        table.Render(AnsiConsole.Console);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Col1"));
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Val1"));
    });

    test("does_not_throw_on_empty_columns", () => {
        const table = new Table();
        table.Render(AnsiConsole.Console);
        expect(stdoutSpy).not.toHaveBeenCalled();
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
