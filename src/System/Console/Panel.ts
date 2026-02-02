import { CsString } from "../Types/CsString";
import { AnsiConsole } from "./AnsiConsole";

/**
 * A panel widget that wraps content in a border.
 * @experimental This API is in preview and may change.
 */
export class Panel {
    private readonly _content: CsString;
    private readonly _title: CsString;
    private readonly _style: string;

    public constructor(content: string | CsString, title: string | CsString = "", style: string = "") {
        this._content = typeof content === "string" ? CsString.From(content) : content;
        this._title = typeof title === "string" ? CsString.From(title) : title;
        this._style = style;
        Object.freeze(this);
    }

    /**
     * Renders the panel to the specified console.
     */
    public Render(console: AnsiConsole): void {
        const width = console.Width;
        const innerWidth = width - 2;

        // Top border
        let topBorder = "";
        if (CsString.IsNullOrEmpty(this._title)) {
            topBorder = "┌" + "─".repeat(innerWidth) + "┐";
        } else {
            const titleText = ` ${this._title.ToString()} `;
            const left = 1; // Minimum 1 dash on left
            const right = Math.max(0, innerWidth - titleText.length - left);
            topBorder = "┌" + "─".repeat(left) + titleText + "─".repeat(right) + "┐";
        }

        if (this._style) {
            console.Markup(`[${this._style}]${topBorder}[/]`);
            console.WriteLine("");
        } else {
            console.WriteLine(topBorder);
        }

        // Content
        const lines = this._content.ToString().split("\n");
        for (const line of lines) {
            const paddedLine = line.padEnd(innerWidth).substring(0, innerWidth);
            if (this._style) {
                console.Markup(`[${this._style}]│[/]${paddedLine}[${this._style}]│[/]`);
                console.WriteLine("");
            } else {
                console.WriteLine("│" + paddedLine + "│");
            }
        }

        // Bottom border
        const bottomBorder = "└" + "─".repeat(innerWidth) + "┘";
        if (this._style) {
            console.Markup(`[${this._style}]${bottomBorder}[/]`);
            console.WriteLine("");
        } else {
            console.WriteLine(bottomBorder);
        }
    }
}
