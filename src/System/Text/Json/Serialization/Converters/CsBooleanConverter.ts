import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsBoolean } from "../../../../Types/CsBoolean";

export class CsBooleanConverter extends JsonConverter<CsBoolean> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsBoolean;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsBoolean {
        if (typeof reader === "boolean") {
            return CsBoolean.From(reader);
        }
        throw new Error(`Expected boolean for CsBoolean, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsBoolean, _options: JsonSerializerOptions): void {
        writer.WriteBooleanValue(value.Value);
    }
}
