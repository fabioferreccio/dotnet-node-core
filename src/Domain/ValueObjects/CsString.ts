import { IEquatable } from '../Shared/IEquatable';
import { IComparable } from '../Shared/IComparable';

export class CsString implements IEquatable<CsString>, IComparable<CsString> {
    private readonly _value: string;

    constructor(value: string) {
        if (value === null || value === undefined) {
            throw new Error("Value cannot be null or undefined for CsString");
        }
        this._value = value;
    }

    public get Length(): number {
        return this._value.length;
    }

    public Trim(): CsString {
        return new CsString(this._value.trim());
    }

    public ToUpper(): CsString {
        return new CsString(this._value.toUpperCase());
    }

    public Substring(startIndex: number, length?: number): CsString {
        if (length !== undefined) {
             return new CsString(this._value.substring(startIndex, startIndex + length));
        }
        return new CsString(this._value.substring(startIndex));
    }

    public Equals(other: CsString): boolean {
        if (!other) return false;
        return this._value === other.toString();
    }

    public CompareTo(other: CsString | null): number {
        if (!other) return 1;
        if (this._value < other.toString()) return -1;
        if (this._value > other.toString()) return 1;
        return 0;
    }

    public toString(): string {
        return this._value;
    }
}
