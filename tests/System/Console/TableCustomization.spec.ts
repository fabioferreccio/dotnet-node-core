import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Table } from "../../../src/System/Console/Table";

describe("Table Customization", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 80 });
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    const getOutput = (): string => stdoutSpy.mock.calls.map(c => c[0]).join("");

    test("should maintain backward compatibility with string headers", () => {
        const table = new Table();
        table.AddColumn("Col 1");
        table.AddColumn("Col 2");
        table.AddRow("Row 1", "Row 2");
        
        table.Render(AnsiConsole.Console);

        const output = getOutput();
        expect(output).toContain("Col 1");
        expect(output).toContain("Col 2");
        expect(output).toContain("Row 1");
        expect(output).toContain("Row 2");
    });

    test("should respect fixed width columns", () => {
        const table = new Table();
        // Width 10 with padding 1 means: 1 padding + 8 content + 1 padding
        table.AddColumn({ header: "Fixed", width: 10, padding: 1 }); 
        table.AddRow("12345678");

        table.Render(AnsiConsole.Console);

        const output = getOutput();
        // Check top border for this column: ─ repeated 10 times
        expect(output).toContain("┌──────────┐");
        // Check row content: " 12345678 │"
        expect(output).toMatch(/│ 12345678 │/);
    });

    test("should wrap text when wrap is true", () => {
        const table = new Table();
        // width 10, padding 1 -> content 8.
        // Text "1234567890" -> should split "12345678", "90"
        table.AddColumn({ header: "Wrap", width: 10, wrap: true, padding: 1 });
        table.AddRow("1234567890");

        table.Render(AnsiConsole.Console);

        const output = getOutput();
        // Should have two lines for the row
        expect(output).toMatch(/│ 12345678 │/);
        expect(output).toMatch(/│ 90 {7}│/);
    });

    test("should truncate text when wrap is false", () => {
        const table = new Table();
        // width 10, padding 1 -> content 8.
        table.AddColumn({ header: "Trunc", width: 10, wrap: false, padding: 1 });
        table.AddRow("1234567890");

        table.Render(AnsiConsole.Console);

        const output = getOutput();
        // Should show "12345678"
        expect(output).toMatch(/│ 12345678 │/);
        // Should NOT show "90"
        expect(output).not.toContain("90");
    });

    test("should respect alignment", () => {
        const table = new Table();
        // width 10, padding 1 -> content 8.
        table.AddColumn({ header: "Left", width: 10, alignment: "left", padding: 1 });
        table.AddColumn({ header: "Right", width: 10, alignment: "right", padding: 1 });
        table.AddColumn({ header: "Center", width: 10, alignment: "center", padding: 1 });
        
        table.AddRow("A", "B", "C");

        table.Render(AnsiConsole.Console);
        const output = getOutput();

        // Left: "A       " with padding
        expect(output).toMatch(/│ A {8}│/);
        // Right: "       B" with padding
        expect(output).toMatch(/│ {8}B │/);
        // Center: "   C    " with padding
        expect(output).toMatch(/│ {4}C {5}│/);
    });

    test("should respect minWidth and maxWidth", () => {
         // Console width 80.
         // Flexible space distribution is content-aware.
         const table = new Table();
         // Col 1: min 50.
         // Col 2: max 5.
         
         table.AddColumn({ header: "Min", minWidth: 50 });
         // Ensure content is large enough so that Smart Alg allocates > 5, forcing cap.
         table.AddColumn({ header: "Maxim", maxWidth: 5 }); // 5 chars -> * ratio > 5
         table.AddRow("A", "B");
         
         table.Render(AnsiConsole.Console);
         const output = getOutput();
         
         // Verify Col 1 width approx > 50 chars
         // Verify Col 2 is capped at 5
         const separatorLine = output.split("\n")[0];
         expect(separatorLine).toContain("─".repeat(50));
         expect(separatorLine).toContain("─────┐"); // 5 chars
    });
});
