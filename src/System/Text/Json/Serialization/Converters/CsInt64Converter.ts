import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsInt64 } from "../../../../Types/CsInt64";

export class CsInt64Converter extends JsonConverter<CsInt64> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt64;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsInt64 {
        if (typeof reader === "string") {
             return CsInt64.From(reader);
        }
        // Strict: Do not accept number for Int64 to avoid precision loss
        if (typeof reader === "number") {
            throw new Error("CsInt64 deserialization from number primitive is prohibited to prevent precision loss. Use ValueAsString.");
        }
        throw new Error(`Expected string for CsInt64, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsInt64, _options: JsonSerializerOptions): void {
        writer.WriteStringValue(value.ToString());
    }
}
