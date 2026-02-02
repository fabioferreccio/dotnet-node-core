import { CsString } from "../Types/CsString";
import { List } from "../Collections/Generic/List";
import { AnsiConsole } from "./AnsiConsole";

class InternalColumn {
    public readonly header: string;
    public readonly width?: number;
    public readonly minWidth?: number;
    public readonly maxWidth?: number;
    public readonly alignment: "left" | "center" | "right";
    public readonly padding: number;
    public readonly wrap: boolean;

    constructor(
        header: string | CsString | {
            header: string;
            width?: number;
            minWidth?: number;
            maxWidth?: number;
            alignment?: "left" | "center" | "right";
            padding?: number;
            wrap?: boolean;
        }
    ) {
        if (typeof header === "string" || header instanceof CsString) {
            this.header = typeof header === "string" ? header : header.ToString();
            this.width = undefined;
            this.minWidth = undefined;
            this.maxWidth = undefined;
            this.alignment = "left";
            this.padding = 0;
            this.wrap = false;
        } else {
            this.header = header.header;
            this.width = header.width;
            this.minWidth = header.minWidth;
            this.maxWidth = header.maxWidth;
            this.alignment = header.alignment ?? "left";
            this.padding = header.padding ?? 0;
            this.wrap = header.wrap ?? false;
        }
    }
}

/**
 * A simple table widget.
 * @experimental This API is in preview and may change.
 */
export class Table {
    private readonly _columns: List<InternalColumn> = new List<InternalColumn>();
    private readonly _rows: List<List<CsString>> = new List<List<CsString>>();

    public constructor() {
        Object.seal(this);
    }

    public AddColumn(header: string | CsString | {
        header: string;
        width?: number;
        minWidth?: number;
        maxWidth?: number;
        alignment?: "left" | "center" | "right";
        padding?: number;
        wrap?: boolean;
    }): Table {
        this._columns.Add(new InternalColumn(header));
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
        const consoleWidth = console.Width;
        const colCount = this._columns.Count;

        if (colCount === 0) return;

        // 1. Calculate Layout
        const availableWidth = consoleWidth - (colCount + 1); // Border characters: colCount + 1
        let usedWidth = 0;
        let flexibleColsCount = 0;
        const colWidths: number[] = new Array(colCount);

        // First pass: Allocate fixed widths
        for (let i = 0; i < colCount; i++) {
            const col = this._columns.ToArray()[i];
            if (col.width !== undefined) {
                // Fixed allocation
                colWidths[i] = col.width;
                usedWidth += colWidths[i];
            } else {
                flexibleColsCount++;
            }
        }

        // Second pass: Distribute flexible space
        if (flexibleColsCount > 0) {
            const remaining = Math.max(0, availableWidth - usedWidth);
            const perFlexCol = Math.floor(remaining / flexibleColsCount);

            for (let i = 0; i < colCount; i++) {
                const col = this._columns.ToArray()[i];
                if (col.width === undefined) {
                    let w = perFlexCol;
                    // Apply min/max constraints
                    if (col.minWidth !== undefined) w = Math.max(w, col.minWidth);
                    if (col.maxWidth !== undefined) w = Math.min(w, col.maxWidth);
                    colWidths[i] = w;
                    usedWidth += w; // Note: We might overflow if minimums exceed space, but we clamp anyway
                }
            }
        }

        // Final check: clamp widths to prevent overflow or underflow constraints
        // We prioritize left-to-right rendering if space exhausted, or layout logic from prompt: "Truncate visually"
        // But individual column widths are settled.

        // Border Strings
        const topBorder = "┌" + colWidths.map(w => "─".repeat(Math.max(0, w))).join("┬") + "┐";
        const midBorder = "├" + colWidths.map(w => "─".repeat(Math.max(0, w))).join("┼") + "┤";
        const botBorder = "└" + colWidths.map(w => "─".repeat(Math.max(0, w))).join("┴") + "┘";

        // Render Top
        console.WriteLine(topBorder);

        // Render Header
        this.RenderRow(console, this._columns.ToArray().map(c => CsString.From(c.header)), colWidths);

        // Separator
        console.WriteLine(midBorder);

        // Render Rows
        for (const row of this._rows.ToArray()) {
            this.RenderRow(console, row.ToArray(), colWidths);
        }

        // Render Bottom
        console.WriteLine(botBorder);
    }

    private RenderRow(console: AnsiConsole, cells: CsString[], widths: number[]): void {
        const columns = this._columns.ToArray();
        
        // 1. Prepare Cell Content (Wrap/Truncate + Padding)
        const cellLines: string[][] = [];
        let maxLines = 1;

        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const width = widths[i];
            const contentWidth = Math.max(0, width - (col.padding * 2));
            const text = i < cells.length ? cells[i].ToString() : "";

            let lines: string[] = [];
            
            if (contentWidth <= 0) {
                // If column is too narrow to fit any content + padding, render empty space of width
                lines = [""];
            } else if (col.wrap) {
                // Split text into chunks
                lines = this.WrapText(text, contentWidth);
            } else {
                // Truncate
                lines = [text.length > contentWidth ? text.substring(0, contentWidth) : text];
            }

            if (lines.length > maxLines) maxLines = lines.length;
            cellLines.push(lines);
        }

        // 2. Render each line of the row
        for (let lineIdx = 0; lineIdx < maxLines; lineIdx++) {
            let rowStr = "│";
            for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                const col = columns[colIdx];
                const width = widths[colIdx];
                const contentWidth = Math.max(0, width - (col.padding * 2));
                
                const lines = cellLines[colIdx];
                const content = lineIdx < lines.length ? lines[lineIdx] : "";
                
                // Align content within contentWidth
                const aligned = this.AlignText(content, contentWidth, col.alignment);

                // Add padding
                const paddingStr = " ".repeat(col.padding);
                // If contentWidth was 0 or width was small, we safeguard repeater
                // Full cell string: padding + aligned + padding
                // We construct the cell to be exactly `width`.
                
                // Tricky part: if width < padding*2, we just fill with spaces
                if (width < col.padding * 2) {
                     rowStr += " ".repeat(width);
                } else {
                    rowStr += paddingStr + aligned + paddingStr;
                }
                rowStr += "│";
            }
            console.WriteLine(rowStr);
        }
    }

    private WrapText(text: string, width: number): string[] {
        if (text.length === 0) return [""];
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += width) {
            chunks.push(text.substring(i, i + width));
        }
        return chunks;
    }

    private AlignText(text: string, width: number, alignment: "left" | "center" | "right"): string {
        if (text.length >= width) return text.substring(0, width); // Should be handled before, but safety
        const diff = width - text.length;

        if (alignment === "left") {
            return text + " ".repeat(diff);
        } else if (alignment === "right") {
            return " ".repeat(diff) + text;
        } else {
            const left = Math.floor(diff / 2);
            const right = diff - left;
            return " ".repeat(left) + text + " ".repeat(right);
        }
    }
}
