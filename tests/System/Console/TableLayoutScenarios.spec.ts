import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Table } from "../../../src/System/Console/Table";

describe("Table Versatility & Real Data Tests", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 120 }); // Typical terminal width
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    const getOutput = (): string => stdoutSpy.mock.calls.map(c => c[0]).join("");

    // User data from screenshot
    // ID: "eeb7f3b7-884c-47c5-a2e9-195b99a5179a" (36 chars)
    // Name: "Acme Corp 1547"
    // Slug: "ACME-1547"
    // Currency: "USD"
    // Fiscal Year: "12"
    // Active: "✓"

    test("Scenario 1: Fixed Width + Wrap (Should NOT break layout)", () => {
        const table = new Table();
        // ID: 36 chars. Fixed width 20. Wrap true.
        // Should take 2 lines.
        table.AddColumn({ header: "ID", width: 20, wrap: true });
        table.AddColumn({ header: "Name", width: 15, wrap: true });
        table.AddColumn("Slug"); // Flexible
        table.AddColumn("Currency");
        table.AddColumn("Fiscal Year");
        table.AddColumn("Active");

        table.AddRow(
            "eeb7f3b7-884c-47c5-a2e9-195b99a5179a",
            "Acme Corp 1547",
            "ACME-1547",
            "USD",
            "12",
            "✓"
        );

        table.Render(AnsiConsole.Console);
        const output = getOutput();
        const lines = output.split("\n").filter(l => l.trim().length > 0);
        
        // Verify structure
        const borderPattern = /^[┌│├└].*[┐│┤┘]$/;
        for (const line of lines) {
            expect(line).toMatch(borderPattern);
        }

        // Verify content wrapping
        // "eeb7f3b7-884c-47c5-a2e9-195b99a5179a" (36) in width 20 (padding default 0)
        // chunk 1: 20 chars: "eeb7f3b7-884c-47c5-a"
        // chunk 2: 16 chars: "2e9-195b99a5179a"
        expect(output).toContain("eeb7f3b7-884c-47c5-a");
        expect(output).toContain("2e9-195b99a5179a");
    });

    test("Scenario 2: EnableRowSeparators (New Feature)", () => {
        const table = new Table();
        table.EnableRowSeparators();
        
        table.AddColumn("ID");
        table.AddColumn("Name");
        
        table.AddRow("1", "A");
        table.AddRow("2", "B");
        table.AddRow("3", "C");

        table.Render(AnsiConsole.Console);
        const output = getOutput();
        
        // Should have 3 data rows -> 2 intermediate separators + top + mid(head) + bot
        // Total borders = 5?
        // Top, HeadSep, Data1, Sep, Data2, Sep, Data3, Bot
        // Let's count "├" occurrences.
        // Standard table (2 headers, 1 separator): 1 "├" (header separator)
        // With row separators for 3 rows: 
        // Header
        // ├
        // Row 1
        // ├
        // Row 2
        // ├
        // Row 3
        // └
        
        const midBorderCount = (output.match(/├/g) || []).length;
        expect(midBorderCount).toBe(3); // 1 (header) + 2 (between rows)
    });

    test("Scenario 3: Mixed Constraints (Min/Max/Fixed)", () => {
        const table = new Table();
        // ID: min 30, max 40, wrap true
        table.AddColumn({ header: "ID", minWidth: 30, maxWidth: 40, wrap: true });
        // Name: fixed 50
        table.AddColumn({ header: "Name", width: 50 });
        
        table.AddRow(
            "eeb7f3b7-884c-47c5-a2e9-195b99a5179a", // 36 chars. Fits in [30, 40].
            "Acme Corp"
        );

        table.Render(AnsiConsole.Console);
        const output = getOutput();
        
        // Verify width of first column
        // Should be at least 30.
        // It's flexible, so it will try to get `perFlexCol`.
        // Console 120. 2 cols. 1 fixed 50.
        // Available = 120 - 3 = 117.
        // Fixed = 50.
        // Remaining = 67.
        // Col 1 gets 67.
        // MaxWidth is 40. So it should be clamped to 40.
        
        // Measure first column in top border
        const firstColBorder = output.split("\n")[0].split("┬")[0].substring(1);
        expect(firstColBorder.length).toBe(40);
    });

    test("Scenario 4: Padding Impact", () => {
        const table = new Table();
        table.AddColumn({ header: "ID", width: 10, padding: 2 });
        table.AddRow("123456"); // 6 chars. 
        // Content width = 10 - 4 = 6.
        // Matches exactly.
        
        table.Render(AnsiConsole.Console);
        const output = getOutput();
        
        // Row content: "│  123456  │"
        expect(output).toMatch(/│  123456  │/);
    });
});
