import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsDecimal } from "../../../../Types/CsDecimal";

export class CsDecimalConverter extends JsonConverter<CsDecimal> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsDecimal;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsDecimal {
        // MVP: CsDecimal wraps number.
        if (typeof reader === "number") {
            return CsDecimal.From(reader);
        }
        throw new Error(`Expected number for CsDecimal, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsDecimal, _options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
