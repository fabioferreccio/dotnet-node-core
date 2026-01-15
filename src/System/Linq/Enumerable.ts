import { IEnumerable } from "../../Domain/Interfaces/IEnumerable";
import { IOrderedEnumerable } from "../../Domain/Interfaces/IOrderedEnumerable";
import { IGrouping } from "../../Domain/Interfaces/IGrouping";
import { CsInt32, CsDouble, CsDecimal } from "../../Domain/ValueObjects";
import { isComparable } from "../../Domain/Interfaces/IComparable";
import { isEquatable } from "../../Domain/Interfaces/IEquatable";

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
            },
        });
    }

    public Select<TResult>(selector: (item: T) => TResult): Enumerable<TResult> {
        const source = this._source;
        return new Enumerable<TResult>({
            *[Symbol.iterator]() {
                for (const item of source) {
                    yield selector(item);
                }
            },
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
            },
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
            },
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
            },
        });
    }

    public OrderBy<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T> {
        if (!Enumerable._orderedEnumerableFactory) {
            throw new Error("System.Linq.Enumerable: OrderedEnumerable factory not registered.");
        }
        return Enumerable._orderedEnumerableFactory(this._source, {
            keySelector,
            comparer,
            descending: false,
        });
    }

    public OrderByDescending<TKey>(
        keySelector: (item: T) => TKey,
        comparer?: (a: TKey, b: TKey) => number,
    ): IOrderedEnumerable<T> {
        if (!Enumerable._orderedEnumerableFactory) {
            throw new Error("System.Linq.Enumerable: OrderedEnumerable factory not registered.");
        }
        return Enumerable._orderedEnumerableFactory(this._source, {
            keySelector,
            comparer,
            descending: true,
        });
    }

    public GroupBy<TKey>(keySelector: (item: T) => TKey): Enumerable<IGrouping<TKey, T>> {
        const source = this._source;
        return new Enumerable<IGrouping<TKey, T>>({
            *[Symbol.iterator]() {
                if (!Enumerable._lookupFactory) {
                    throw new Error("System.Linq.Enumerable: Lookup factory not registered.");
                }
                const lookup = Enumerable._lookupFactory();
                for (const item of source) {
                    lookup.Add(keySelector(item), item);
                }
                for (const group of lookup) {
                    yield group;
                }
            },
        });
    }

    // --- Immediate Execution Operators ---

    // --- Registry for Circular Dependencies ---
    private static _listFactory: (source: IEnumerable<any>) => any;
    private static _orderedEnumerableFactory: (
        source: Iterable<any>,
        context: SortContext<any>,
    ) => IOrderedEnumerable<any>;
    private static _lookupFactory: () => any; // Lookup<TKey, TElement>

    public static registerListFactory(factory: (source: IEnumerable<any>) => any) {
        this._listFactory = factory;
    }

    public static registerOrderedEnumerableFactory(
        factory: (source: Iterable<any>, context: SortContext<any>) => IOrderedEnumerable<any>,
    ) {
        this._orderedEnumerableFactory = factory;
    }

    public static registerLookupFactory(factory: () => any) {
        this._lookupFactory = factory;
    }

    public ToList(): any {
        if (!Enumerable._listFactory) {
            throw new Error(
                "System.Linq.Enumerable: List factory not registered. Ensure System.init() or main entry point registers the List factory.",
            );
        }
        return Enumerable._listFactory(this);
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

            if (typeof val === "number") {
                sum += val;
            } else if (val && typeof val.Value === "number") {
                sum += val.Value;
            }
        }
        return sum;
    }
}
