export interface IEquatable<T> {
    Equals(other: T): boolean;
}

export function isEquatable(obj: unknown): obj is IEquatable<unknown> {
    return obj !== null && obj !== undefined && typeof (obj as IEquatable<unknown>).Equals === "function";
}
