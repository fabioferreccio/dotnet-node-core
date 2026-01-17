import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsInt32 } from "../../../../Types/CsInt32";

export class CsInt32Converter extends JsonConverter<CsInt32> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt32;
    }

    public Read(reader: unknown, typeToConvert: Constructor, options: JsonSerializerOptions): CsInt32 {
        if (typeof reader === "number") {
            return CsInt32.From(reader);
        }
        if (typeof reader === "string") {
            // Attempt strict parse if it's a number string
            const parsed = parseInt(reader, 10);
            if (!isNaN(parsed)) {
                return CsInt32.From(parsed);
            }
        }
        throw new Error(`JsonTokenType was invalid, expected number for CsInt32.`);
    }

    public Write(writer: JsonWriter, value: CsInt32, options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
