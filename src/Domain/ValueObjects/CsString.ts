import { IEquatable, IComparable } from "../Interfaces";

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

    public static IsNullOrEmpty(value: CsString | null | undefined): boolean {
        return !value || value.Length === 0;
    }

    public static IsNullOrWhiteSpace(value: CsString | null | undefined): boolean {
        return !value || value.toString().trim().length === 0;
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
