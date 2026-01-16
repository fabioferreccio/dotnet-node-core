import { IEquatable, IComparable } from "../../Domain/Interfaces";

export class CsInt32 implements IEquatable<CsInt32>, IComparable<CsInt32> {
    private readonly _value: number;

    private constructor(value: number) {
        this._value = value | 0; // Force integer
        Object.freeze(this);
    }

    public static From(value: number): CsInt32 {
        return new CsInt32(value);
    }

    public static get MaxValue(): number {
        return 2147483647;
    }

    public static get MinValue(): number {
        return -2147483648;
    }

    public static Parse(s: string): CsInt32 {
        const val = parseInt(s, 10);
        if (isNaN(val)) throw new Error("Input string was not in a correct format.");
        return CsInt32.From(val);
    }

    public static TryParse(s: string): CsInt32 | null {
        const val = parseInt(s, 10);
        return isNaN(val) ? null : CsInt32.From(val);
    }

    public Add(other: CsInt32): CsInt32 {
        return CsInt32.From(this._value + other.Value);
    }

    public Subtract(other: CsInt32): CsInt32 {
        return CsInt32.From(this._value - other.Value);
    }

    public Multiply(other: CsInt32): CsInt32 {
        return CsInt32.From(this._value * other.Value);
    }

    public Divide(other: CsInt32): CsInt32 {
        if (other.Value === 0) throw new Error("Divide by zero error");
        return CsInt32.From(this._value / other.Value);
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsInt32): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsInt32 | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
