import { IEnumerable } from '../../Domain/Interfaces/IEnumerable';
import { IOrderedEnumerable } from '../../Domain/Interfaces/IOrderedEnumerable';
import { IGrouping } from '../../Domain/Interfaces/IGrouping';
// List import removed from static imports to break circular dependency
import { CsInt32, CsDouble, CsDecimal } from '../../Domain/ValueObjects';
import { IComparable, isComparable } from '../../Domain/Interfaces/IComparable';
import { isEquatable } from '../../Domain/Interfaces/IEquatable';

// --- Helper Types ---
type SortContext<T> = {
    keySelector: (item: T) => any;
    comparer?: (a: any, b: any) => number;
    descending: boolean;
};

// --- Enumerable Implementation ---
export class Enumerable<T> implements IEnumerable<T> {
    protected readonly _source: Iterable<T>;

    protected constructor(source: Iterable<T>) {
        this._source = source;
    }

    public static From<T>(source: Iterable<T>): Enumerable<T> {
        return new Enumerable<T>(source);
    }

    public *[Symbol.iterator](): Iterator<T> {
        for (const item of this._source) {
            yield item;
        }
    }

    // --- Deferred Execution Operators ---

    public Where(predicate: (item: T) => boolean): Enumerable<T> {
        const source = this._source;
        return new Enumerable<T>({
            *[Symbol.iterator]() {
                for (const item of source) {
                    if (predicate(item)) {
                        yield item;
                    }
                }
            }
        });
    }

    public Select<TResult>(selector: (item: T) => TResult): Enumerable<TResult> {
        const source = this._source;
        return new Enumerable<TResult>({
            *[Symbol.iterator]() {
                for (const item of source) {
                    yield selector(item);
                }
            }
        });
    }

    public Skip(count: number): Enumerable<T> {
        const source = this._source;
        return new Enumerable<T>({
            *[Symbol.iterator]() {
                let skipped = 0;
                for (const item of source) {
                    if (skipped < count) {
                        skipped++;
                        continue;
                    }
                    yield item;
                }
            }
        });
    }

    public Take(count: number): Enumerable<T> {
        const source = this._source;
        return new Enumerable<T>({
            *[Symbol.iterator]() {
                let taken = 0;
                if (count <= 0) return;
                
                for (const item of source) {
                    yield item;
                    taken++;
                    if (taken >= count) break;
                }
            }
        });
    }

    public Distinct(): Enumerable<T> {
        const source = this._source;
        return new Enumerable<T>({
            *[Symbol.iterator]() {
                const seen = new Set<T>();
                for (const item of source) {
                    if (!seen.has(item)) {
                        seen.add(item);
                        yield item;
                    }
                }
            }
        });
    }

    public OrderBy<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this._source, {
            keySelector,
            comparer,
            descending: false
        });
    }

    public OrderByDescending<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this._source, {
            keySelector,
            comparer,
            descending: true
        });
    }

    public GroupBy<TKey>(keySelector: (item: T) => TKey): Enumerable<IGrouping<TKey, T>> {
        const source = this._source;
        return new Enumerable<IGrouping<TKey, T>>({
            *[Symbol.iterator]() {
                const lookup = new Lookup<TKey, T>();
                for (const item of source) {
                    lookup.Add(keySelector(item), item);
                }
                for (const group of lookup) {
                    yield group;
                }
            }
        });
    }

    // --- Immediate Execution Operators ---

    public ToList(): any {
        // Dynamic require to avoid circular dependency with List.ts
        const { List } = require('../Collections/Generic/List');
        return new List(this); // Use 'this' (iterator) to preserve ordering chains
    }

    public ToArray(): T[] {
        return Array.from(this); // Use 'this' (iterator) to preserve ordering chains
    }

    public Count(predicate?: (item: T) => boolean): number {
        let count = 0;
        const iter = predicate ? this.Where(predicate) : this._source;
        for (const _ of iter) {
            count++;
        }
        return count;
    }

    public First(predicate?: (item: T) => boolean): T {
        const iter = predicate ? this.Where(predicate) : this._source;
        for (const item of iter) {
            return item;
        }
        throw new Error("Sequence contains no elements");
    }

    public FirstOrDefault(predicate?: (item: T) => boolean): T | null {
        const iter = predicate ? this.Where(predicate) : this._source;
        for (const item of iter) {
            return item;
        }
        return null;
    }

    public Any(predicate?: (item: T) => boolean): boolean {
        const iter = predicate ? this.Where(predicate) : this._source;
        for (const _ of iter) {
            return true;
        }
        return false;
    }

    public All(predicate: (item: T) => boolean): boolean {
        for (const item of this._source) {
            if (!predicate(item)) return false;
        }
        return true;
    }

    public Sum(selector?: (item: T) => number | CsInt32 | CsDouble | CsDecimal | any): number {
        let sum = 0; 
        for (const item of this._source) {
             const val = selector ? selector(item) : item;
             
             if (typeof val === 'number') {
                 sum += val;
             } else if (val && typeof val.Value === 'number') {
                 sum += val.Value;
             }
        }
        return sum;
    }
}

// --- OrderedEnumerable Implementation ---

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
        let item: OrderedEnumerable<T> | undefined = this;
        let rootSource: Iterable<T> | undefined;

        // Traverse up to find the root and collect contexts
        while (item) {
            contexts.unshift(item._sortContext);
            if (!item._parent) {
                rootSource = (item as any)['_source']; 
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
                         comparison = (keyB === null || keyB === undefined) ? 0 : -1;
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
        descending?: boolean
    ): IOrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this, {
            keySelector,
            comparer,
            descending: descending || false
        }, this); 
    }

    public ThenBy<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T> {
        return this.CreateOrderedEnumerable(keySelector, comparer, false);
    }

    public ThenByDescending<TKey>(keySelector: (item: T) => TKey, comparer?: (a: TKey, b: TKey) => number): IOrderedEnumerable<T> {
        return this.CreateOrderedEnumerable(keySelector, comparer, true);
    }
}

// --- Grouping Implementation ---

export class Grouping<TKey, TElement> extends Enumerable<TElement> implements IGrouping<TKey, TElement> {
    private readonly _key: TKey;
    
    constructor(key: TKey, elements: TElement[]) {
        super(elements);
        this._key = key;
    }

    public get Key(): TKey {
        return this._key;
    }
}

export class Lookup<TKey, TElement> extends Enumerable<IGrouping<TKey, TElement>> implements IEnumerable<IGrouping<TKey, TElement>> {
    private _groupings: Grouping<TKey, TElement>[] = [];

    constructor() {
        const groupings: Grouping<TKey, TElement>[] = [];
        super(groupings);
        this._groupings = groupings;
    }

    public Add(key: TKey, element: TElement): void {
        const group = this._findGroup(key);
        if (group) {
            // Grouping extends Enumerable. _source is protected.
            ((group as any)['_source'] as TElement[]).push(element);
        } else {
            this._groupings.push(new Grouping(key, [element]));
        }
    }

    private _findGroup(key: TKey): Grouping<TKey, TElement> | undefined {
        if (isEquatable(key)) {
            return this._groupings.find(g => {
                if (isEquatable(g.Key)) {
                    return g.Key.Equals(key);
                } 
                return g.Key === key;
            });
        }
        return this._groupings.find(g => g.Key === key);
    }
}
