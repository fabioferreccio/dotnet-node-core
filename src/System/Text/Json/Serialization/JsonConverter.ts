import { JsonSerializerOptions } from "../JsonSerializerOptions";
import { JsonWriter } from "../JsonWriter";

// Safe constructor type for instantiation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = Function & { prototype: T };

export abstract class JsonConverter<T> {
    /**
     * Determines whether this converter can convert the specified type.
     */
    public abstract CanConvert(typeToConvert: Constructor): boolean;

    /**
     * Reads and converts the JSON to type T.
     * @param reader The reader (currently unknown, can be raw JSON object/primitive for this phase).
     * @param typeToConvert The type to convert.
     * @param options The validation options.
     */
    public abstract Read(
        reader: unknown,
        typeToConvert: Constructor,
        options: JsonSerializerOptions,
        existingValue?: T,
    ): T;

    /**
     * Writes a specified value as JSON.
     * @param writer The writer to write to.
     * @param value The value to convert to JSON.
     * @param options The serialization options.
     */
    public abstract Write(writer: JsonWriter, value: T, options: JsonSerializerOptions): void;
}
