export interface IComparable<T> {
    CompareTo(other: T | null): number;
}
