import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Table } from "../../../src/System/Console/Table";

describe("Table Smart Auto-Sizing", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 100 });
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    const getOutput = (): string => stdoutSpy.mock.calls.map(c => c[0]).join("");

    test("should allocate more space to columns with longer content", () => {
        const table = new Table();
        // ID: 20 chars
        // Status: 2 chars
        table.AddColumn("ID");
        table.AddColumn("St"); 
        
        table.AddRow("12345678901234567890", "OK");

        table.Render(AnsiConsole.Console);
        const output = getOutput();
        const topBorder = output.split("\n")[0];
        
        // Remove corners and split
        const parts = topBorder.substring(1, topBorder.length - 1).split("┬");
        const idWidth = parts[0].length;
        const stWidth = parts[1].length;
        
        // Ratio of content: 20 vs 2 = 10:1.
        // ID should be significantly larger than St.
        expect(idWidth).toBeGreaterThan(stWidth * 5);
    });

    test("should respect max constraints even in auto mode", () => {
        AnsiConsole.Configure({ width: 100 });
        const table = new Table();
        // ID: 20 chars content. MaxWidth 10.
        // The algorithm calculates Req=20.
        // Then expands/shrinks.
        // Finally clamps to Min/Max.
        // So width should be <= 10.
        
        table.AddColumn({ header: "ID", maxWidth: 10 });
        table.AddRow("12345678901234567890");

        table.Render(AnsiConsole.Console);
        const output = getOutput();
        const topBorder = output.split("\n")[0];
        
        // Width excluding borders
        const width = topBorder.length - 2; 
        expect(width).toBeLessThan(12); // allowance for border chars or logic drift
    });

    test("should respect fixed width columns mixed with auto columns", () => {
        AnsiConsole.Configure({ width: 50 });
        const table = new Table();
        table.AddColumn({ header: "Fixed", width: 10 });
        table.AddColumn("Auto"); // Content "Auto" (4) + "Value" (5) = 5.
        
        table.AddRow("FixedVal", "Value");

        table.Render(AnsiConsole.Console);
        
        const output = getOutput();
        const parts = output.split("\n")[0].substring(1).split("┬");
        
        const fixedWidth = parts[0].length;
        const autoWidth = parts[1].length;
        
        expect(fixedWidth).toBe(10); // Exactly 10
        // Available for Auto: 50 - 3 (borders) - 10 = 37.
        // Auto column should expanded to fill this.
        expect(autoWidth).toBeGreaterThan(30);
    });
});
