import { CsInt32 } from "../Types/CsInt32";
import { CsString } from "../Types/CsString";
import { IEquatable } from "../../Domain/Interfaces/IEquatable";

/**
 * Represents a color for console output.
 * @experimental This API is in preview and may change.
 */
export class Color implements IEquatable<Color> {
    private readonly _number: CsInt32;
    private readonly _name: CsString;

    private constructor(number: CsInt32, name: CsString) {
        this._number = number;
        this._name = name;
        Object.freeze(this);
    }

    public get Number(): CsInt32 {
        return this._number;
    }
    public get Name(): CsString {
        return this._name;
    }

    /**
     * Creates a color from a standard ANSI color number (0-255).
     */
    public static FromNumber(number: number): Color {
        return new Color(CsInt32.From(number), CsString.From(`Color_${number}`));
    }

    // Standard ANSI 4-bit Colors
    public static readonly Default = new Color(CsInt32.From(-1), CsString.From("Default"));
    public static readonly Black = new Color(CsInt32.From(0), CsString.From("Black"));
    public static readonly Red = new Color(CsInt32.From(1), CsString.From("Red"));
    public static readonly Green = new Color(CsInt32.From(2), CsString.From("Green"));
    public static readonly Yellow = new Color(CsInt32.From(3), CsString.From("Yellow"));
    public static readonly Blue = new Color(CsInt32.From(4), CsString.From("Blue"));
    public static readonly Magenta = new Color(CsInt32.From(5), CsString.From("Magenta"));
    public static readonly Cyan = new Color(CsInt32.From(6), CsString.From("Cyan"));
    public static readonly White = new Color(CsInt32.From(7), CsString.From("White"));

    public Equals(other: Color): boolean {
        if (other === null || other === undefined) return false;
        return this._number.Equals(other._number);
    }

    public ToString(): string {
        return this._name.ToString();
    }
}
