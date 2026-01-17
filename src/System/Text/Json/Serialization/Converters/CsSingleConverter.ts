import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsSingle } from "../../../../Types/CsSingle";

export class CsSingleConverter extends JsonConverter<CsSingle> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsSingle;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsSingle {
        if (typeof reader === "number") {
            return CsSingle.From(reader);
        }
        throw new Error(`Expected number for CsSingle, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsSingle, _options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
