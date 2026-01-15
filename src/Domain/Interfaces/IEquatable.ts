export interface IEquatable<T> {
    Equals(other: T): boolean;
}

export function isEquatable(obj: any): obj is IEquatable<any> {
    return obj !== null && obj !== undefined && typeof obj.Equals === "function";
}
