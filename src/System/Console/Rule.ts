import { CsString } from "../Types/CsString";
import { AnsiConsole } from "./AnsiConsole";
import { MarkupParser } from "./Internal/MarkupParser";

/**
 * A horizontal rule widget.
 * @experimental This API is in preview and may change.
 */
export class Rule {
    private readonly _title: CsString;
    private readonly _style: string;

    public constructor(title: string | CsString = "", style: string = "") {
        this._title = typeof title === "string" ? CsString.From(title) : title;
        this._style = style;
        Object.freeze(this);
    }

    /**
     * Renders the rule to the specified console.
     */
    public Render(console: AnsiConsole): void {
        const width = console.Width;
        let line = "";

        if (CsString.IsNullOrEmpty(this._title)) {
            line = "─".repeat(width);
        } else {
            const titleText = ` ${this._title.ToString()} `;
            const remaining = width - titleText.length;
            const left = Math.floor(remaining / 2);
            const right = remaining - left;
            
            line = "─".repeat(left) + titleText + "─".repeat(right);
        }

        if (this._style) {
            console.WriteMarkup(`[${this._style}]${line}[/]`);
        } else {
            console.WriteLine(line);
        }
    }
}
