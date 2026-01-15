import { IEquatable, IComparable } from "../Interfaces";

export class CsByte implements IEquatable<CsByte>, IComparable<CsByte> {
    private readonly _value: number;

    public constructor(value: number) {
        // Enforce integer truncation
        const truncated = value | 0;

        // Enforce Range: 0 to 255
        if (truncated < 0 || truncated > 255) {
            throw new Error(`Value ${value} is out of range for Byte (0-255).`);
        }
        this._value = truncated;
    }

    public static get MaxValue(): number {
        return 255;
    }

    public static get MinValue(): number {
        return 0;
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsByte): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsByte | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
