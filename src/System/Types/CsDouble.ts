import { IEquatable, IComparable } from "../../Domain/Interfaces";

export class CsDouble implements IEquatable<CsDouble>, IComparable<CsDouble> {
    private readonly _value: number;

    private constructor(value: number) {
        this._value = value;
        Object.freeze(this);
    }

    public static From(value: number): CsDouble {
        return new CsDouble(value);
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsDouble): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsDouble | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
