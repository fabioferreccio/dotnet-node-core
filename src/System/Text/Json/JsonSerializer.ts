import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Constructor } from "./JsonConverter";

export class JsonSerializer {
    public static Serialize<T>(value: T, options?: JsonSerializerOptions): string {
        const opts = options ?? new JsonSerializerOptions();
        const space = opts.WriteIndented ? 2 : undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const replacer = (key: string, val: any): any => {
            // Check basic value first
            if (val === null || val === undefined) return val;

            // Converter strategy
            if (opts.Converters.Count > 0) {
                // val can be anything. We need to check if we can convert it.
                // In JS, we can check constructor or prototype.
                // However, internal recursions of JSON.stringify effectively strip some type info if toJSON is involved,
                // but here we are intercepting before toJSON if we are "lucky" or after?
                // actually JSON.stringify calls .toJSON() *before* the replacer if it exists on the object.
                // So if our Domain Objects have .toJSON(), that runs first.
                // If we want Converters to take precedence, we effectively need to manually walk or ensure objects don't have toJSON,
                // OR we accept that replacer sees the result of toJSON.
                // BUT, the prompt implies Extensibility via Converters.

                // If val is an object, we can try to find a converter.
                const type = val.constructor as Constructor;
                // We naively check if any converter can convert this type.
                // Optimization: Cache?
                const converter = opts.Converters.FirstOrDefault((c) => c.CanConvert(type));
                if (converter) {
                    return converter.Write(val, opts);
                }
            }

            return val;
        };

        return JSON.stringify(value, replacer, space);
    }

    public static Deserialize<T>(
        json: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type?: Constructor<T>, // Added type argument to enable "runtime" reification
        options?: JsonSerializerOptions,
    ): T {
        const opts = options ?? new JsonSerializerOptions();
        const parsed = JSON.parse(json);

        if (type) {
            // Top level conversion
            const converter = opts.Converters.FirstOrDefault((c) => c.CanConvert(type));
            if (converter) {
                return converter.Read(parsed, type, opts);
            }
        }

        // Deep/Recursive deserialization is hard without metadata or schema.
        // For now, we assume implicit structural mapping or simple top-level conversion.
        // If the user needs deep object mapping, they'd use a specific ObjectConverter.
        // We just return parsed as T for now (which is 'any' at runtime essentially).
        return parsed as T;
    }
}
