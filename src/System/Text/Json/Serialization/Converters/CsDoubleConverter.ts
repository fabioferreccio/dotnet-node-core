import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsDouble } from "../../../../Types/CsDouble";

export class CsDoubleConverter extends JsonConverter<CsDouble> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsDouble;
    }

    public Read(reader: unknown, typeToConvert: Constructor, options: JsonSerializerOptions): CsDouble {
        if (typeof reader === "number") {
            return CsDouble.From(reader);
        }
        throw new Error(`Expected number for CsDouble, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsDouble, options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
