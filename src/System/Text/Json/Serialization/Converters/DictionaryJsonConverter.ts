import { JsonConverter, Constructor } from "../JsonConverter";
import { Dictionary } from "../../../../Collections/Generic/Dictionary";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { JsonSerializer } from "../../JsonSerializer";
import { CsString } from "../../../../Types/CsString";
import { CsGuid } from "../../../../Types/CsGuid";

export class DictionaryJsonConverter<TKey, TValue> extends JsonConverter<Dictionary<TKey, TValue>> {
    private readonly _keyType: Constructor<TKey>;
    private readonly _valueType: Constructor<TValue>;

    constructor(keyType: Constructor<TKey>, valueType: Constructor<TValue>) {
        super();
        this._keyType = keyType;
        this._valueType = valueType;
    }

    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === Dictionary;
    }

    public Read(reader: unknown, typeToConvert: Constructor, options: JsonSerializerOptions): Dictionary<TKey, TValue> {
        if (typeof reader !== "object" || reader === null || Array.isArray(reader)) {
            throw new Error("Dictionary deserialization expects a JSON object.");
        }

        const dict = new Dictionary(this._keyType, this._valueType);
        const sourceObj = reader as Record<string, unknown>;

        for (const jsonKey of Object.keys(sourceObj)) {
            // 1. Inflate Key
            const key = this.ParseKey(jsonKey);

            // 2. Inflate Value
            const jsonVal = sourceObj[jsonKey];
            const serializedVal = JSON.stringify(jsonVal);

            const value = JsonSerializer.Deserialize(serializedVal, this._valueType, options);

            dict.Add(key, value);
        }

        return dict;
    }

    public Write(writer: JsonWriter, value: Dictionary<TKey, TValue>, options: JsonSerializerOptions): void {
        writer.WriteStartObject();

        for (const [key, val] of value) {
            // Key is TKey (CsString/CsGuid). We trust ToString() matches Parse().
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const keyStr = (key as any).toString();
            writer.WritePropertyName(keyStr);

            // Value Serialization via JsonSerializer delegation
            // We use Serialize to get the string representation of the value's JSON.
            // This handles nested object graphs via JsonSerializer's logic.
            const jsonVal = JsonSerializer.Serialize(val, options);
            writer.WriteRawValue(jsonVal);
        }

        writer.WriteEndObject();
    }

    private ParseKey(keyStr: string): TKey {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((this._keyType as any) === CsString) {
            return CsString.From(keyStr) as unknown as TKey;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((this._keyType as any) === CsGuid) {
            return CsGuid.Parse(keyStr) as unknown as TKey;
        }

        throw new Error(`Dictionary key type ${this._keyType.name} is not supported for key deserialization.`);
    }
}
