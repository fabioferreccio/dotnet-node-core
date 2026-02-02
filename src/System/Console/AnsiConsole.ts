import { CsString } from "../Types/CsString";
import { Console } from "../Console";
import { AnsiConsoleOptions } from "./AnsiConsoleOptions";
import { MarkupParser } from "./Internal/MarkupParser";

/**
 * Provides rich console output capabilities.
 * @experimental This API is in preview and may change.
 */
export class AnsiConsole {
    private static _current: AnsiConsole | null = null;
    private readonly _width: number;

    private constructor(options: AnsiConsoleOptions = {}) {
        this._width = options.width ?? 80;
    }

    /**
     * Gets the static instance of AnsiConsole with default options.
     */
    public static get Console(): AnsiConsole {
        if (!this._current) {
            this._current = new AnsiConsole();
        }
        return this._current;
    }

    /**
     * Configures the global AnsiConsole instance.
     */
    public static Configure(options: AnsiConsoleOptions): void {
        this._current = new AnsiConsole(options);
    }

    /**
     * Gets the configured width of the console.
     */
    public get Width(): number {
        return this._width;
    }

    /**
     * Writes a string to the console.
     */
    public static Write(value: CsString | string): void {
        this.Console.Write(value);
    }

    /**
     * Writes a string to the console.
     */
    public Write(value: CsString | string): void {
        const text = typeof value === "string" ? value : value.ToString();
        Console.WriteLine(text); // For now, mapping to basic Console
    }

    /**
     * Writes a line to the console.
     */
    public static WriteLine(value: CsString | string = ""): void {
        this.Console.WriteLine(value);
    }

    /**
     * Writes a line to the console.
     */
    public WriteLine(value: CsString | string = ""): void {
        this.Write(value);
    }


    /**
     * Writes markup text to the console.
     * Example: AnsiConsole.Markup("[red]Hello[/] [blue]World[/]");
     */
    public static Markup(value: string): void {
        this.Console.WriteMarkup(value);
    }

    public WriteMarkup(value: string): void {
        const parsed = MarkupParser.Parse(value);
        this.WriteLine(parsed);
    }

}
