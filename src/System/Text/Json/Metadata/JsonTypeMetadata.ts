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
}
