import { isEquatable } from "../../../Domain/Interfaces";
import { Enumerable } from "../../Linq/Enumerable";

export class List<T> {
    private _items: T[];
    private readonly _elementType?: Function & { prototype: T };

    constructor(items?: T[], elementType?: Function & { prototype: T }) {
        this._items = items ? [...items] : [];
        this._elementType = elementType;
    }

    public get ElementType(): (Function & { prototype: T }) | undefined {
        return this._elementType;
    }

    public get Count(): number {
        return this._items.length;
    }

    public Add(item: T): void {
        this._items.push(item);
    }

    public Remove(item: T): boolean {
        const index = this._findIndex(item);
        if (index !== -1) {
            this._items.splice(index, 1);
            return true;
        }
        return false;
    }

    public Contains(item: T): boolean {
        return this._findIndex(item) !== -1;
    }

    public Clear(): void {
        this._items = [];
    }

    public ToArray(): T[] {
        return [...this._items];
    }

    public Where(predicate: (item: T) => boolean): List<T> {
        return new List<T>(this._items.filter(predicate));
    }

    public Select<U>(selector: (item: T) => U): List<U> {
        return new List<U>(this._items.map(selector));
    }

    public FirstOrDefault(predicate?: (item: T) => boolean): T | null {
        if (predicate) {
            const result = this._items.find(predicate);
            return result === undefined ? null : result;
        }
        return this._items.length > 0 ? this._items[0] : null;
    }

    public toJSON(): T[] {
        return this._items;
    }

    public *[Symbol.iterator](): Iterator<T> {
        for (const item of this._items) {
            yield item;
        }
    }

    private _findIndex(item: T): number {
        if (isEquatable(item)) {
            for (let i = 0; i < this._items.length; i++) {
                const current = this._items[i];
                if (isEquatable(current)) {
                    if (current.Equals(item)) return i;
                }
            }
        } else {
            for (let i = 0; i < this._items.length; i++) {
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
        return Enumerable.From(this._items);
    }
}
