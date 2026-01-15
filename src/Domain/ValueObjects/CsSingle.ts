import { IEquatable, IComparable } from '../Interfaces';

export class CsSingle implements IEquatable<CsSingle>, IComparable<CsSingle> {
    private readonly _value: number;

    public constructor(value: number) {
        // In JS, validation for 'Single' precision is tricky without TypedArrays, 
        // but generally we simulate the API surface here.
        this._value = Math.fround(value); // Enforce single precision
    }

    public get Value(): number {
        return this._value;
    }

    public Equals(other: CsSingle): boolean {
        if (!other) return false;
        return this._value === other._value;
    }

    public CompareTo(other: CsSingle | null): number {
        if (!other) return 1;
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    public ToString(): string {
        return this._value.toString();
    }
}
