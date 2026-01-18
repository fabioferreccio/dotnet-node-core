import { Constructor, JsonConverter } from "../Serialization/JsonConverter";
import { JsonPropertyMetadata } from "./JsonPropertyMetadata";
import { NullHandling } from "./NullHandling";

/**
 * Metadata for a Type, defining how it should be serialized/deserialized.
 */
export class JsonTypeMetadata {
    public readonly TargetType: Constructor<unknown>;
    private readonly _properties: Map<string, JsonPropertyMetadata>;

    private constructor(type: Constructor<unknown>) {
        this.TargetType = type;
        this._properties = new Map<string, JsonPropertyMetadata>();
    }

    public static For<T>(type: Constructor<T>): JsonTypeMetadata {
        return new JsonTypeMetadata(type as unknown as Constructor<unknown>);
    }

    /**
     * Maps a DTO property to a JSON property with optional rules.
     */
    public Map(
        propertyName: string,
        jsonName: string,
        converter: JsonConverter<unknown> | null = null,
        nullHandling: NullHandling = NullHandling.Default,
    ): this {
        const metadata = new JsonPropertyMetadata(propertyName, jsonName, converter, nullHandling);
        this._properties.set(propertyName, metadata);
        return this;
    }

    /**
     * Gets metadata for a property by its DTO name.
     */
    public GetProperty(propertyName: string): JsonPropertyMetadata | undefined {
        return this._properties.get(propertyName);
    }

    /**
     * Gets metadata for a property by its JSON name.
     * Note: This involves a scan, but is cached by the map structure effectively if we used two maps.
     * For now, we iterate as property counts are low, or we could index.
     * Optimization: We'll stick to iteration for Phase 5 unless performance dictates otherwise.
     */
    public GetPropertyByJsonName(jsonName: string): JsonPropertyMetadata | undefined {
        for (const meta of this._properties.values()) {
            if (meta.JsonName === jsonName) {
                return meta;
            }
        }
        return undefined;
    }

    public get Properties(): ReadonlyMap<string, JsonPropertyMetadata> {
        return this._properties;
    }

    public Validate(): void {
        // 1. Check for Duplicate JSON Names
        const jsonNames = new Set<string>();
        for (const meta of this._properties.values()) {
            if (jsonNames.has(meta.JsonName)) {
                throw new Error(
                    `Invalid metadata for type '${this.TargetType.name}': Duplicate JSON property name '${meta.JsonName}'.`,
                );
            }
            jsonNames.add(meta.JsonName);
        }

        // 2. Check Property Existence (if possible)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instance = new (this.TargetType as any)();
            for (const prop of this._properties.keys()) {
                if (!(prop in instance)) {
                    throw new Error(
                        `Invalid metadata for type '${this.TargetType.name}': Property '${prop}' does not exist on the type instance.`,
                    );
                }
            }
        } catch (e) {
            // If instantiation fails, we cannot validate property existence.
            // We propagate the error if it was our validation error, otherwise we might choose to warn?
            // Strict approach: If we can't instantiate, we can't validate, but maybe the Type is valid but strict constructor?
            // User requested "Behavior: MUST throw descriptive error at registration time".
            // If the user registers metadata for a type that cannot be instantiated, deserialization will fail anyway.
            // So failing here is good ("Fail Fast").
            if (e instanceof Error && e.message.startsWith("Invalid metadata")) {
                throw e;
            }
            // For other errors (e.g. constructor require args), we might wrap or rethrow.
            // Let's assume fail-fast is desired.
            throw new Error(
                `Validation failed for type '${this.TargetType.name}': Could not instantiate to verify properties. Error: ${e}`,
            );
        }
    }
}
