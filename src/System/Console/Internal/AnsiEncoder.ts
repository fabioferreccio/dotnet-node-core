import { Color } from "../Color";

/**
 * Internal helper for ANSI escape sequences.
 */
export class AnsiEncoder {
    public static readonly ESC = "\u001b";
    public static readonly RESET = `${AnsiEncoder.ESC}[0m`;

    public static GetForegroundColor(color: Color): string {
        if (color.Equals(Color.Default)) return "";

        const num = color.Number.Value;
        if (num >= 0 && num <= 7) {
            // Standard 4-bit colors (30-37)
            return `${AnsiEncoder.ESC}[${30 + num}m`;
        }

        // 8-bit color (38;5;n)
        return `${AnsiEncoder.ESC}[38;5;${num}m`;
    }

    public static GetBackgroundColor(color: Color): string {
        if (color.Equals(Color.Default)) return "";

        const num = color.Number.Value;
        if (num >= 0 && num <= 7) {
            // Standard 4-bit colors (40-47)
            return `${AnsiEncoder.ESC}[${40 + num}m`;
        }

        // 8-bit color (48;5;n)
        return `${AnsiEncoder.ESC}[48;5;${num}m`;
    }

    public static GetStyle(style: string): string {
        switch (style.toLowerCase()) {
            case "bold":
                return `${AnsiEncoder.ESC}[1m`;
            case "dim":
                return `${AnsiEncoder.ESC}[2m`;
            case "italic":
                return `${AnsiEncoder.ESC}[3m`;
            case "underline":
                return `${AnsiEncoder.ESC}[4m`;
            case "invert":
                return `${AnsiEncoder.ESC}[7m`;
            default:
                return "";
        }
    }
}
