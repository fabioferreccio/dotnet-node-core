import { IEquatable, IComparable } from "../Interfaces";

export class CsSByte implements IEquatable<CsSByte>, IComparable<CsSByte> {
    private readonly _value: number;

    public constructor(value: number) {
        // Enforce integer truncation
        const truncated = value | 0;

        // Enforce Range: -128 to 127
        if (truncated < -128 || truncated > 127) {
            throw new Error(`Value ${value} is out of range for SByte (-128 to 127).`);
        }
        this._value = truncated;
    }

    public static get MaxValue(): number {
        return 127;
    }

    public static get MinValue(): number {
        return -128;
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsSByte): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsSByte | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
