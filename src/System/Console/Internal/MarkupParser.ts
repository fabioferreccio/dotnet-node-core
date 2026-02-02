import { Color } from "../Color";
import { AnsiEncoder } from "./AnsiEncoder";

/**
 * Internal parser for [color]text[/] style markup.
 */
export class MarkupParser {
    public static Parse(markup: string): string {
        // Very basic parser for Phase 8
        // Supports [color] and [/]
        let result = "";
        let currentPos = 0;
        const colorStack: Color[] = [Color.Default];

        const tagRegex = /\[(\/?)([a-zA-Z]*)\]/g;

        let match;

        while ((match = tagRegex.exec(markup)) !== null) {
            // Text before the tag
            result += match.index > currentPos ? markup.substring(currentPos, match.index) : "";

            const isClosing = match[1] === "/";
            const tagName = match[2].toLowerCase();

            if (isClosing) {
                colorStack.pop();
                result += AnsiEncoder.RESET;
                // Re-apply current color from stack
                const currentColor = colorStack[colorStack.length - 1];
                if (!currentColor.Equals(Color.Default)) {
                    result += AnsiEncoder.GetForegroundColor(currentColor);
                }
            } else {
                const color = this.GetColorByName(tagName);
                colorStack.push(color);
                result += AnsiEncoder.GetForegroundColor(color);
            }

            currentPos = tagRegex.lastIndex;
        }

        // Remaining text
        result += markup.substring(currentPos);
        return result;
    }

    private static GetColorByName(name: string): Color {
        switch (name.toLowerCase()) {
            case "red":
                return Color.Red;
            case "green":
                return Color.Green;
            case "blue":
                return Color.Blue;
            case "yellow":
                return Color.Yellow;
            case "magenta":
                return Color.Magenta;
            case "cyan":
                return Color.Cyan;
            case "white":
                return Color.White;
            case "black":
                return Color.Black;
            default:
                return Color.Default;
        }
    }
}
