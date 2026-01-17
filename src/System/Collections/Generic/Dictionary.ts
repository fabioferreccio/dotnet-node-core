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
    private readonly _storage: Map<string, TValue>;
    private readonly _keyType: Constructor<TKey>;
    private readonly _valueType: Constructor<TValue>;

    constructor(keyType: Constructor<TKey>, valueType: Constructor<TValue>) {
        if (!keyType || !valueType) {
            throw new Error("Dictionary must be initialized with keyType and valueType constructors.");
        }

        this._storage = new Map<string, TValue>();
        this._keyType = keyType;
        this._valueType = valueType;

        Object.freeze(this);
    }

    public Add(key: TKey, value: TValue): void {
        const stringKey = this.ValidateAndStringifyKey(key);

        if (this._storage.has(stringKey)) {
            throw new Error(`An item with the same key has already been added. Key: ${stringKey}`);
        }

        this._storage.set(stringKey, value);
    }

    public Get(key: TKey): TValue | undefined {
        const stringKey = this.ValidateAndStringifyKey(key);
        return this._storage.get(stringKey);
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
        // We need to reconstruct TKey from string key if we stored it as string in Map
        // Map keys are strings.
        // _storage = Map<string, TValue>.
        // We need to parse valid keys back or store original keys?
        // Rules: Key MUST be convertible to string.
        // If we only store string key, we strictly lose the original Key reference if it had other state (which it shouldn't for value types like String/Guid).
        // But `Get(TKey)` stringifies.

        // If we iterate, we yield [TKey, TValue].
        // We need to re-hydrate the Key object from the string.
        // This is expensive but correct for "System Type keys".

        for (const [strKey, value] of this._storage) {
            let key: TKey;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this._keyType as any) === CsString) {
                key = CsString.From(strKey) as unknown as TKey;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            else if ((this._keyType as any) === CsGuid) {
                key = CsGuid.Parse(strKey) as unknown as TKey;
            } else {
                // Should not happen due to Add check, but safety:
                throw new Error("Unsupported key type in storage.");
            }

            yield [key, value];
        }
    }
}
