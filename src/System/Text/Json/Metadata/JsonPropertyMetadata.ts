import { JsonConverter } from "../Serialization/JsonConverter";
import { NullHandling } from "./NullHandling";

/**
 * Metadata for a single property on a Type.
 */
export class JsonPropertyMetadata {
    /**
     * The name of the property on the DTO/Class.
     */
    public readonly PropertyName: string;

    /**
     * The name of the property in the JSON.
     */
    public readonly JsonName: string;

    /**
     * Optional custom converter for this property.
     */
    public readonly Converter: JsonConverter<unknown> | null;

    /**
     * Null handling strategy for this property.
     */
    public readonly NullHandling: NullHandling;

    constructor(
        propertyName: string,
        jsonName: string,
        converter: JsonConverter<unknown> | null,
        nullHandling: NullHandling,
    ) {
        this.PropertyName = propertyName;
        this.JsonName = jsonName;
        this.Converter = converter;
        this.NullHandling = nullHandling;
    }
}
