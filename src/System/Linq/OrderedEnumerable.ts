import { IOrderedEnumerable } from "../../Domain/Interfaces/IOrderedEnumerable";
import { isComparable } from "../../Domain/Interfaces/IComparable";
import { Enumerable } from "./Enumerable";

export type SortContext<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keySelector: (item: T) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comparer?: (a: any, b: any) => number;
    descending: boolean;
};

export class OrderedEnumerable<T> extends Enumerable<T> implements IOrderedEnumerable<T> {
    private _parent?: OrderedEnumerable<T>;
    private _sortContext: SortContext<T>;

    constructor(source: Iterable<T>, context: SortContext<T>, parent?: OrderedEnumerable<T>) {
        super(source);
        this._sortContext = context;
        this._parent = parent;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const contexts: SortContext<T>[] = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let item: OrderedEnumerable<T> | undefined = this;
        let rootSource: Iterable<T> | undefined;

        // Traverse up to find the root and collect contexts
        while (item) {
            contexts.unshift(item._sortContext);
            if (!item._parent) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rootSource = (item as any)["_source"];
            }
            item = item._parent;
        }

        if (!rootSource) return;

        const buffer = Array.from(rootSource);

        buffer.sort((a, b) => {
            for (const ctx of contexts) {
                const keyA = ctx.keySelector(a);
                const keyB = ctx.keySelector(b);

                let comparison = 0;

                if (ctx.comparer) {
                    comparison = ctx.comparer(keyA, keyB);
                } else {
                    if (keyA === keyB) {
                        comparison = 0;
                    } else if (keyA === null || keyA === undefined) {
                        comparison = keyB === null || keyB === undefined ? 0 : -1;
                    } else if (keyB === null || keyB === undefined) {
                        comparison = 1;
                    } else if (isComparable(keyA)) {
                        comparison = keyA.CompareTo(keyB);
                    } else {
                        comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
                    }
                }

                if (comparison !== 0) {
                    return ctx.descending ? -comparison : comparison;
                }
            }
            return 0;
        });

        for (const item of buffer) {
            yield item;
        }
    }

    public CreateOrderedEnumerable<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
        descending?: boolean,
    ): IOrderedEnumerable<T> {
        return new OrderedEnumerable<T>(
            this,
            {
                keySelector,
                comparer,
                descending: descending || false,
            },
            this,
        );
    }

    public ThenBy<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T> {
        return this.CreateOrderedEnumerable(keySelector, comparer, false);
    }

    public ThenByDescending<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T> {
        return this.CreateOrderedEnumerable(keySelector, comparer, true);
    }
}
