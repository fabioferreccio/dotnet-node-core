export class HttpHeaders implements Iterable<[string, string[]]> {
    private readonly _headers: Map<string, string[]>;

    constructor() {
        this._headers = new Map<string, string[]>();
    }

    public Add(name: string, value: string | string[]): void {
        const key = name.toLowerCase();
        let existing = this._headers.get(key);

        if (!existing) {
            existing = [];
            this._headers.set(key, existing);
        }

        if (Array.isArray(value)) {
            existing.push(...value);
        } else {
            existing.push(value);
        }
    }

    public Remove(name: string): boolean {
        return this._headers.delete(name.toLowerCase());
    }

    public TryGetValues(name: string): string[] | undefined {
        return this._headers.get(name.toLowerCase());
    }

    public Contains(name: string): boolean {
        return this._headers.has(name.toLowerCase());
    }

    public Clear(): void {
        this._headers.clear();
    }

    public *[Symbol.iterator](): Iterator<[string, string[]]> {
        for (const [key, value] of this._headers) {
            yield [key, value];
        }
    }
}
