import { IEquatable, IComparable } from "../Interfaces";

export class CsInt64 implements IEquatable<CsInt64>, IComparable<CsInt64> {
    private readonly _value: bigint;

    public constructor(value: bigint | number | string) {
        this._value = BigInt(value);
    }

    public static get Zero(): CsInt64 {
        return new CsInt64(0);
    }

    public Add(other: CsInt64): CsInt64 {
        return new CsInt64(this._value + other._value);
    }

    public Subtract(other: CsInt64): CsInt64 {
        return new CsInt64(this._value - other._value);
    }

    public Multiply(other: CsInt64): CsInt64 {
        return new CsInt64(this._value * other._value);
    }

    public Divide(other: CsInt64): CsInt64 {
        if (other._value === 0n) throw new Error("Divide by zero error");
        return new CsInt64(this._value / other._value);
    }

    public get Value(): bigint {
        return this._value;
    }

    public Equals(other: CsInt64): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsInt64 | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
