import { IEquatable, IComparable } from "../../Domain/Interfaces";

export class CsDecimal implements IEquatable<CsDecimal>, IComparable<CsDecimal> {
    private readonly _value: number;

    private constructor(value: number) {
        // TODO: Implement high-precision decimal logic in future phases.
        // For MVP, checking architecture rules permit number usage here with caveat.
        this._value = value;
        Object.freeze(this);
    }

    public static From(value: number): CsDecimal {
        return new CsDecimal(value);
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsDecimal): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsDecimal | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public Add(other: CsDecimal): CsDecimal {
        return CsDecimal.From(this._value + other._value);
    }

    public Subtract(other: CsDecimal): CsDecimal {
        return CsDecimal.From(this._value - other._value);
    }

    public Multiply(other: CsDecimal): CsDecimal {
        return CsDecimal.From(this._value * other._value);
    }

    public Divide(other: CsDecimal): CsDecimal {
        if (other._value === 0) throw new Error("Divide by zero error");
        return CsDecimal.From(this._value / other._value);
    }

    public ToString(): string {
        return this._value.toString();
    }
}
