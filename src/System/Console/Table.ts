import { CsString } from "../Types/CsString";
import { List } from "../Collections/Generic/List";
import { AnsiConsole } from "./AnsiConsole";

/**
 * A simple table widget.
 * @experimental This API is in preview and may change.
 */
export class Table {
    private readonly _columns: List<CsString> = new List<CsString>();
    private readonly _rows: List<List<CsString>> = new List<List<CsString>>();

    public constructor() {
        Object.seal(this);
    }

    public AddColumn(header: string | CsString): Table {
        this._columns.Add(typeof header === "string" ? CsString.From(header) : header);
        return this;
    }

    public AddRow(...values: (string | CsString)[]): Table {
        const row = new List<CsString>();
        for (const val of values) {
            row.Add(typeof val === "string" ? CsString.From(val) : val);
        }
        this._rows.Add(row);
        return this;
    }

    /**
     * Renders the table to the specified console.
     */
    public Render(console: AnsiConsole): void {
        const width = console.Width;
        const colCount = this._columns.Count;

        if (colCount === 0) return;

        const colWidth = Math.floor((width - (colCount + 1)) / colCount);

        // Header
        let headerRow = "│";
        const cols = this._columns.ToArray();
        for (let i = 0; i < colCount; i++) {
            const text = cols[i].ToString();
            headerRow += text.padEnd(colWidth).substring(0, colWidth) + "│";
        }

        // Top border
        console.WriteLine("┌" + ("─".repeat(colWidth) + "┬").repeat(colCount - 1) + "─".repeat(colWidth) + "┐");
        console.WriteLine(headerRow);
        // Header separator
        console.WriteLine("├" + ("─".repeat(colWidth) + "┼").repeat(colCount - 1) + "─".repeat(colWidth) + "┤");

        // Rows
        const rows = this._rows.ToArray();
        for (let i = 0; i < this._rows.Count; i++) {
            const row = rows[i];
            const rowArray = row.ToArray();
            let rowText = "│";
            for (let j = 0; j < colCount; j++) {
                const text = j < row.Count ? rowArray[j].ToString() : "";
                rowText += text.padEnd(colWidth).substring(0, colWidth) + "│";
            }
            console.WriteLine(rowText);
        }

        // Bottom border
        console.WriteLine("└" + ("─".repeat(colWidth) + "┴").repeat(colCount - 1) + "─".repeat(colWidth) + "┘");
    }
}
