export class ObjectPool<T> {
    private readonly _factory: () => T;
    private readonly _reset: (item: T) => void;
    private readonly _stack: T[];
    private readonly _capacity: number;

    constructor(factory: () => T, reset: (item: T) => void, capacity: number = 100) {
        this._factory = factory;
        this._reset = reset;
        this._capacity = capacity;
        this._stack = [];
    }

    public Rent(): T {
        if (this._stack.length > 0) {
            return this._stack.pop()!;
        }
        return this._factory();
    }

    public Return(item: T): void {
        this._reset(item);
        if (this._stack.length < this._capacity) {
            this._stack.push(item);
        }
        // If over capacity, drop it (GC will collect)
    }
}
