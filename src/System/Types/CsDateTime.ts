import { IEquatable, IComparable } from "../../Domain/Interfaces";

export enum DateTimeKind {
    Unspecified = 0,
    Utc = 1,
    Local = 2,
}

export class CsDateTime implements IEquatable<CsDateTime>, IComparable<CsDateTime> {
    private readonly _date: Date;
    private readonly _kind: DateTimeKind;

    private constructor(date: Date | number | string, kind: DateTimeKind = DateTimeKind.Local) {
        this._date = new Date(date);
        this._kind = kind;
        Object.freeze(this);
    }

    public static From(date: Date | number | string, kind: DateTimeKind = DateTimeKind.Local): CsDateTime {
        return new CsDateTime(date, kind);
    }

    public static get Now(): CsDateTime {
        return CsDateTime.From(new Date(), DateTimeKind.Local);
    }

    public static get UtcNow(): CsDateTime {
        return CsDateTime.From(new Date(), DateTimeKind.Utc);
    }

    public static get Today(): CsDateTime {
        const now = new Date();
        return CsDateTime.From(new Date(now.getFullYear(), now.getMonth(), now.getDate()), DateTimeKind.Local);
    }

    public get Kind(): DateTimeKind {
        return this._kind;
    }

    public get Year(): number {
        return this._kind === DateTimeKind.Utc ? this._date.getUTCFullYear() : this._date.getFullYear();
    }

    public get Month(): number {
        return (this._kind === DateTimeKind.Utc ? this._date.getUTCMonth() : this._date.getMonth()) + 1;
    }

    public get Day(): number {
        return this._kind === DateTimeKind.Utc ? this._date.getUTCDate() : this._date.getDate();
    }

    public get Hour(): number {
        return this._kind === DateTimeKind.Utc ? this._date.getUTCHours() : this._date.getHours();
    }

    public get Minute(): number {
        return this._kind === DateTimeKind.Utc ? this._date.getUTCMinutes() : this._date.getMinutes();
    }

    public get Second(): number {
        return this._kind === DateTimeKind.Utc ? this._date.getUTCSeconds() : this._date.getSeconds();
    }

    public AddDays(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        // Add days using UTC to avoid DST shifts causing issues if we just added milliseconds?
        // Best approach for "AddDays" in C# style is "Add 24 hours * value"? No, it's adding calendar days.
        // JS setDate handles calendar days.
        if (this._kind === DateTimeKind.Utc) {
            newDate.setUTCDate(newDate.getUTCDate() + value);
        } else {
            newDate.setDate(newDate.getDate() + value);
        }
        return CsDateTime.From(newDate, this._kind);
    }

    public AddHours(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        newDate.setTime(newDate.getTime() + value * 60 * 60 * 1000);
        return CsDateTime.From(newDate, this._kind);
    }

    public AddMinutes(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        newDate.setTime(newDate.getTime() + value * 60 * 1000);
        return CsDateTime.From(newDate, this._kind);
    }

    public ToUniversalTime(): CsDateTime {
        if (this._kind === DateTimeKind.Utc) return this;
        return CsDateTime.From(this._date, DateTimeKind.Utc);
    }

    public ToLocalTime(): CsDateTime {
        if (this._kind === DateTimeKind.Local) return this;
        return CsDateTime.From(this._date, DateTimeKind.Local);
    }

    public ToString(format?: string): string {
        if (!format) {
            return this._date.toISOString(); // Default behavior
        }

        const yyyy = this.Year.toString();
        const MM = this.Month.toString().padStart(2, "0");
        const dd = this.Day.toString().padStart(2, "0");
        const HH = this.Hour.toString().padStart(2, "0");
        const mm = this.Minute.toString().padStart(2, "0");
        const ss = this.Second.toString().padStart(2, "0");

        return format
            .replace(/yyyy/g, yyyy)
            .replace(/MM/g, MM)
            .replace(/dd/g, dd)
            .replace(/HH/g, HH)
            .replace(/mm/g, mm)
            .replace(/ss/g, ss);
    }

    public Equals(other: CsDateTime): boolean {
        if (!other) return false;
        // Strict equality includes Kind? C# DateTime.Equals checks Ticks. Ticks are universal.
        // But if Kind is different, are they equal?
        // In C#: "The internal Ticks value... equality is based on Ticks, ignoring Kind."
        return this._date.getTime() === other._date.getTime();
    }

    public CompareTo(other: CsDateTime | null): number {
        if (!other) return 1;
        const thisTime = this._date.getTime();
        const otherTime = other._date.getTime();
        if (thisTime < otherTime) return -1;
        if (thisTime > otherTime) return 1;
        return 0;
    }

    public GreaterThan(other: CsDateTime): boolean {
        return this._date.getTime() > other._date.getTime();
    }

    public LessThan(other: CsDateTime): boolean {
        return this._date.getTime() < other._date.getTime();
    }

    public GreaterThanOrEqual(other: CsDateTime): boolean {
        return this._date.getTime() >= other._date.getTime();
    }

    public LessThanOrEqual(other: CsDateTime): boolean {
        return this._date.getTime() <= other._date.getTime();
    }
}
