import { IEnumerable } from "./IEnumerable";
import { IComparable } from "./IComparable";

export interface IOrderedEnumerable<T> extends IEnumerable<T> {
    CreateOrderedEnumerable<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
        descending?: boolean,
    ): IOrderedEnumerable<T>;

    ThenBy<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T>;

    ThenByDescending<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T>;
}
