import { IOrderedEnumerable } from "./IOrderedEnumerable";
import { IGrouping } from "./IGrouping";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEnumerable<T> extends Iterable<T> {
    Where(predicate: (item: T) => boolean): IEnumerable<T>;
    Select<TResult>(selector: (item: T) => TResult): IEnumerable<TResult>;
    Skip(count: number): IEnumerable<T>;
    Take(count: number): IEnumerable<T>;
    Distinct(): IEnumerable<T>;

    OrderBy<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T>;
    OrderByDescending<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T>;
    GroupBy<TKey>(keySelector: (item: T) => TKey): IEnumerable<IGrouping<TKey, T>>; // Returns IEnumerable of Grouping

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ToList(): any; // Returns List<T> (any to avoid circular dependency with System)
    ToArray(): T[];

    Count(predicate?: (item: T) => boolean): number;
    First(predicate?: (item: T) => boolean): T;
    FirstOrDefault(predicate?: (item: T) => boolean): T | null;
    Any(predicate?: (item: T) => boolean): boolean;
    All(predicate: (item: T) => boolean): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sum(selector?: (item: T) => number | any): number;
}
