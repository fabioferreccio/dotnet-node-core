export interface IComparable<T> {
    CompareTo(other: T | null): number;
}

export function isComparable(obj: unknown): obj is IComparable<unknown> {
    return obj !== null && obj !== undefined && typeof (obj as IComparable<unknown>).CompareTo === "function";
}
