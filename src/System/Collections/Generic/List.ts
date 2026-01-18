import { isEquatable } from "../../../Domain/Interfaces";
import { Enumerable } from "../../Linq/Enumerable";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = unknown> = NewableFunction & { prototype: T; name: string };

export class List<T> {
    private _items: T[];
    private _size: number;
    private readonly _elementType?: Constructor<T>;

    constructor(items?: T[], elementType?: Constructor<T>) {
        if (items) {
            this._items = [...items];
            this._size = this._items.length;
        } else {
            this._items = [];
            this._size = 0;
        }
        this._elementType = elementType;
    }

    public get ElementType(): Constructor<T> | undefined {
        return this._elementType;
    }

    public get Count(): number {
        return this._size;
    }

    // Optimization: Avoid resizing array on every Add if capacity exists.
    // Use _size to track logical end.
    public Add(item: T): void {
        if (this._size < this._items.length) {
            this._items[this._size] = item;
            this._size++;
        } else {
            this._items.push(item);
            this._size++;
        }
    }

    public Remove(item: T): boolean {
        const index = this._findIndex(item);
        if (index !== -1) {
            this._items.splice(index, 1);
            this._size--;
            return true;
        }
        return false;
    }

    public Contains(item: T): boolean {
        return this._findIndex(item) !== -1;
    }

    // Optimization: Fast Clear (O(1)) by just resetting _size.
    // Keeps backing array for reuse.
    public Clear(): void {
        // We do strictly need to release references to avoid memory leaks if T is an object.
        // However, standard "Fast Clear" in managed languages often just sets Count=0.
        // In JS, holding references in the array prevents GC.
        // To be safe and prevent leaks, we SHOULD null out or splice if we want to be clean,
        // BUT strict performance optimization "Fast Clear" implies not doing O(N) work.
        // User Constraints: "Reduce [...] transient allocations". "Fast Clear: Reset length without reallocating storage".
        // If I just set _size=0, the objects at index >= 0 are still referenced by _items.
        // THIS IS A MEMORY LEAK RISK for long-lived Lists.
        // However, standard Pool patterns accept this.
        // But List<T> is general purpose.
        // Compromise: We keep the array instance, but we MUST clear references.
        // Actually, `this._items.length = 0` is very fast in V8.
        // But user asked to "Preserve backing array for reuse" to avoid allocating the array *structure* again?
        // `_items.length = 0` clears the content but often keeps the backing store capacity in V8 (implementation detail).
        // Let's stick to safe reset:
        // `this._items.length = 0` is the standard way to clear an array.
        // BUT if we want to manually manage capacity:
        // `if (this._size > 0) { this._size = 0; }`
        // Do we null out?
        // Let's assume for general purpose List, we accept holding excessive capacity but we should probably clear references to objects?
        // Actually, if I don't clear references, I leak.
        // So `this._items.length = 0` is best. It works well.
        // BUT the instruction said "Reset length without reallocating storage".
        // V8 handles `length = 0` efficiently.
        // Let's try to infer intent: "Preserve backing array for reuse".
        // If I set `length = 0`, I have to push again, potentially triggering resize logic?
        // Actually `this._items.length = 0` usually resets capacity.
        // To keep capacity and clear references: fill with null/undefined? That's O(N).
        // Given this is TypeScript, we can't easily "unsafe pointers".
        // I will trust that `this._size = 0` is the REQUESTED behavior even if it risks pseudo-leaks until rewrite,
        // OR I will clear the array.
        // Let's re-read: "Clear: Set _size = 0, Preserve backing array for reuse".
        // This explicitly implies NOT setting length to 0.
        // I will follow instructions and set _size = 0.
        this._size = 0;
    }

    public ToArray(): T[] {
        // Slice creates a copy of the active range
        return this._items.slice(0, this._size);
    }

    public Where(predicate: (item: T) => boolean): List<T> {
        // Optimization: iterate only up to _size
        const result = new List<T>();
        for (let i = 0; i < this._size; i++) {
            const item = this._items[i];
            if (predicate(item)) {
                result.Add(item);
            }
        }
        return result;
    }

    public Select<U>(selector: (item: T) => U): List<U> {
        // Optimization: Pre-allocate result list?
        // We know the size will be exactly _size.
        // But List constructor takes T[], not capacity.
        // We'll just Add.
        const result = new List<U>();
        // Hinting capacity isn't public API, but internal loop is fast.
        for (let i = 0; i < this._size; i++) {
            result.Add(selector(this._items[i]));
        }
        return result;
    }

    public FirstOrDefault(predicate?: (item: T) => boolean): T | null {
        if (predicate) {
            for (let i = 0; i < this._size; i++) {
                if (predicate(this._items[i])) return this._items[i];
            }
            return null;
        }
        return this._size > 0 ? this._items[0] : null;
    }

    public toJSON(): T[] {
        return this.ToArray();
    }

    public *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this._size; i++) {
            yield this._items[i];
        }
    }

    private _findIndex(item: T): number {
        if (isEquatable(item)) {
            for (let i = 0; i < this._size; i++) {
                const current = this._items[i];
                if (isEquatable(current)) {
                    if (current.Equals(item)) return i;
                }
            }
        } else {
            for (let i = 0; i < this._size; i++) {
                const current = this._items[i];
                if (isEquatable(current)) {
                    if (current.Equals(item)) return i;
                } else {
                    if (current === item) return i;
                }
            }
        }

        return -1;
    }

    public AsEnumerable(): Enumerable<T> {
        return Enumerable.From(this.ToArray());
    }
}
