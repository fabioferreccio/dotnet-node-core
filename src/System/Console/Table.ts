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
    private _showRowSeparators: boolean = false;

    public constructor() {
        Object.seal(this);
    }

    public EnableRowSeparators(): Table {
        this._showRowSeparators = true;
        return this;
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
        const availableWidth = consoleWidth - (colCount + 1);
        const colWidths: number[] = new Array(colCount);
        const columns = this._columns.ToArray();
        const rows = this._rows.ToArray();

        // Calculate requested widths (Max Content)
        const requestedWidths: number[] = new Array(colCount);
        let fixedTotal = 0;
        let flexTotalRequest = 0;
        let flexibleCount = 0;

        for (let i = 0; i < colCount; i++) {
            const col = columns[i];
            
            if (col.width !== undefined) {
                // Fixed width: apply max constraint if present
                let w = col.width;
                if (col.maxWidth !== undefined) w = Math.min(w, col.maxWidth);
                if (col.minWidth !== undefined) w = Math.max(w, col.minWidth);
                requestedWidths[i] = w;
                colWidths[i] = w;
                fixedTotal += w;
            } else {
                // Auto width based on content
                let maxContent = col.header.length;
                for (const row of rows) {
                    const rowArr = row.ToArray();
                    if (i < rowArr.length) {
                        const len = rowArr[i].Length;
                        if (len > maxContent) maxContent = len;
                    }
                }
                
                // Add padding
                let w = maxContent + (col.padding * 2);
                
                // Constraints
                if (col.minWidth !== undefined) w = Math.max(w, col.minWidth);
                if (col.maxWidth !== undefined) w = Math.min(w, col.maxWidth);
                
                requestedWidths[i] = w;
                flexTotalRequest += w;
                flexibleCount++;
            }
        }

        // Distribute Space
        if (flexibleCount > 0) {
            const availableForFlex = Math.max(0, availableWidth - fixedTotal);
            
            // Factor used for both expansion and shrinking (Proportional distribution)
            // If flexTotalRequest is 0 (all empty), avoid division by zero
            const ratio = flexTotalRequest > 0 ? availableForFlex / flexTotalRequest : 1;

            for (let i = 0; i < colCount; i++) {
                const col = columns[i];
                if (col.width === undefined) {
                    let w = Math.floor(requestedWidths[i] * ratio);
                    
                    // Final constraints check
                    if (col.minWidth !== undefined) w = Math.max(w, col.minWidth);
                    if (col.maxWidth !== undefined) w = Math.min(w, col.maxWidth);
                    
                    // If we expanded, ensure we didn't exceed available due to constraints clamping up
                    // But wait, if we clamp, we might underfill or overfill.
                    // A perfect algorithm requires iterative solving, but for UI, simple proportional is usually fine.
                    // We will trust the ratio but clamp to min/max.
                    
                    colWidths[i] = w;
                }
            }
        }

        // Final validation: ensure no negative widths
        for (let i = 0; i < colCount; i++) {
            colWidths[i] = Math.max(0, colWidths[i]);
        }

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
        for (let i = 0; i < rows.length; i++) {
            this.RenderRow(console, rows[i].ToArray(), colWidths);
            if (this._showRowSeparators && i < rows.length - 1) {
                console.WriteLine(midBorder);
            }
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
