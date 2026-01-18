import { CsString } from "../../Types/CsString";
import { CsGuid } from "../../Types/CsGuid";

// ============================================================================
// DICTIONARY CONTRACT RULES (NON-NEGOTIABLE)
// ============================================================================
// 1) TKey MUST be a System Type that can be losslessly represented as string.
//    - Allowed: CsString, CsGuid
//    - Forbidden: CsInt32, CsBoolean, DTOs, Domain objects
//
// 2) TValue MAY be:
//    - A System Type (Cs*)
//    - A DTO composed exclusively of System Types
//    - A List<T> of the above
//    - Another Dictionary<TKey, TValue>
//
// 3) Dictionary MUST carry runtime type information:
//    - keyType: Constructor<TKey>
//    - valueType: Constructor<TValue>
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = NewableFunction & { prototype: T; name: string };

export class Dictionary<TKey, TValue> {
    // Optimization: Store the original key object and the value.
    // This allows iteration without re-parsing keys from strings (CPU heavy for Guids).
    private readonly _storage: Map<string, { k: TKey; v: TValue }>;
    private readonly _keyType: Constructor<TKey>;
    private readonly _valueType: Constructor<TValue>;

    constructor(keyType: Constructor<TKey>, valueType: Constructor<TValue>) {
        if (!keyType || !valueType) {
            throw new Error("Dictionary must be initialized with keyType and valueType constructors.");
        }

        // Initialize map
        this._storage = new Map<string, { k: TKey; v: TValue }>();
        this._keyType = keyType;
        this._valueType = valueType;

        Object.freeze(this);
    }

    public Add(key: TKey, value: TValue): void {
        const stringKey = this.ValidateAndStringifyKey(key);

        if (this._storage.has(stringKey)) {
            throw new Error(`An item with the same key has already been added. Key: ${stringKey}`);
        }

        // Optimization: Cache the original key instance.
        this._storage.set(stringKey, { k: key, v: value });
    }

    public Get(key: TKey): TValue | undefined {
        const stringKey = this.ValidateAndStringifyKey(key);
        // Optimization: Access .v directly
        const entry = this._storage.get(stringKey);
        return entry ? entry.v : undefined;
    }

    private ValidateAndStringifyKey(key: TKey): string {
        if (key === null || key === undefined) {
            throw new Error("Dictionary keys cannot be null or undefined.");
        }

        // Strict Type Check for Key
        if (!(key instanceof this._keyType)) {
            // Note: instanceof check requires keyType to be the actual constructor.
            // If keyType is abstract or interface, this might be tricky, but System Types are concrete.
            throw new Error(`Type mismatch: Key is not instance of ${this._keyType.name}.`);
        }

        // Allowed Key Types Check
        // We strictly allow CsString and CsGuid as per rules.
        // We can check the constructor name or instance type.

        if (key instanceof CsString) {
            return key.toString();
        }

        if (key instanceof CsGuid) {
            return key.ToString();
        }

        // Future extensibility: Check if implements "IStringKey" or similar?
        // Prompt says: "MUST be a System Type that can be losslessly represented as string."
        // "Examples: CsString, CsGuid"
        // "Non-examples: CsInt32..."

        // For strict compliance to the rule "TKey MUST be...":
        // We throw if it's not one of the allowed types.
        throw new Error(
            `Dictionary key type ${this._keyType.name} is not supported. Only System Types with lossless string representation (CsString, CsGuid) are allowed.`,
        );
    }

    // Accessors for RTTI (Potentially needed for Serialization later, but strictly speaking "Public exposure" wasn't requested in minimal step)
    // However, usually required for verifying RTTI existence in tests.
    public get KeyType(): Constructor<TKey> {
        return this._keyType;
    }

    public get ValueType(): Constructor<TValue> {
        return this._valueType;
    }

    public *[Symbol.iterator](): Iterator<[TKey, TValue]> {
        // Optimization: Iterate directly over cached entries.
        // No Guid.Parse or CsString reconstruction needed.
        for (const entry of this._storage.values()) {
            yield [entry.k, entry.v];
        }
    }
}
