import { IEquatable } from '../Shared/IEquatable';
import { IComparable } from '../Shared/IComparable';

export class CsDateTime implements IEquatable<CsDateTime>, IComparable<CsDateTime> {
    private readonly _date: Date;

    public constructor(date: Date | number | string) {
        this._date = new Date(date);
    }

    public static get Now(): CsDateTime {
        return new CsDateTime(new Date());
    }

    public static get UtcNow(): CsDateTime {
        return new CsDateTime(new Date().toISOString());
    }

    public static get Today(): CsDateTime {
        const now = new Date();
        return new CsDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    }

    public get Year(): number {
        return this._date.getFullYear();
    }

    public get Month(): number {
        return this._date.getMonth() + 1; // C# is 1-12
    }

    public get Day(): number {
        return this._date.getDate();
    }

    public get Hour(): number {
        return this._date.getHours();
    }

    public get Minute(): number {
        return this._date.getMinutes();
    }

    public get Second(): number {
        return this._date.getSeconds();
    }

    public AddDays(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        newDate.setDate(newDate.getDate() + value);
        return new CsDateTime(newDate);
    }

    public AddHours(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        newDate.setHours(newDate.getHours() + value);
        return new CsDateTime(newDate);
    }

    public AddMinutes(value: number): CsDateTime {
        const newDate = new Date(this._date.getTime());
        newDate.setMinutes(newDate.getMinutes() + value);
        return new CsDateTime(newDate);
    }

    public ToString(): string {
        return this._date.toISOString();
    }

    public Equals(other: CsDateTime): boolean {
        if (!other) return false;
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
}
