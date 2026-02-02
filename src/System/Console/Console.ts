import { StreamReader } from "../IO/StreamReader";

/**
 * Provides basic console input/output functionality.
 */
export class Console {
    private static _stdin: StreamReader | null = null;

    /**
     * Gets a StreamReader bound to the standard input stream (stdin).
     */
    public static get In(): StreamReader {
        if (!this._stdin) {
            this._stdin = StreamReader.FromStdIn();
        }
        return this._stdin;
    }

    /**
     * Writes the text representation of the specified object to the standard output stream.
     */
    public static Write(value: unknown): void {
        const text = value === null || value === undefined ? "" : value.toString();
        process.stdout.write(text);
    }

    /**
     * Writes a line terminator to the standard output stream.
     */
    public static WriteLine(value: unknown = ""): void {
        this.Write(value);
        this.Write("\n");
    }
}
