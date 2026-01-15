import { IEquatable, IComparable } from '../Interfaces';

export class CsInt16 implements IEquatable<CsInt16>, IComparable<CsInt16> {
    private readonly _value: number;

    public constructor(value: number) {
        if (value < -32768 || value > 32767) {
            throw new Error(`Value ${value} is out of range for Int16.`);
        }
        this._value = value | 0; // Force integer
    }

    public static get MaxValue(): number {
        return 32767;
    }

    public static get MinValue(): number {
        return -32768;
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsInt16): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsInt16 | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
