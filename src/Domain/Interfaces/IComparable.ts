export interface IComparable<T> {
    CompareTo(other: T | null): number;
}

export function isComparable(obj: any): obj is IComparable<any> {
    return obj && typeof obj.CompareTo === "function";
}
