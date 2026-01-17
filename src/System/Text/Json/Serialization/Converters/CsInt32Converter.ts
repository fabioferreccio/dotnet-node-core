import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsInt32 } from "../../../../Types/CsInt32";

export class CsInt32Converter extends JsonConverter<CsInt32> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt32;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsInt32 {
        if (typeof reader === "number") {
            return CsInt32.From(reader);
        }
        if (typeof reader === "string") {
            const parsed = parseInt(reader, 10);
            if (isNaN(parsed)) {
                throw new Error(`Cannot parse string '${reader}' to CsInt32.`);
            }
            return CsInt32.From(parsed);
        }
        throw new Error(`Expected number for CsInt32, got ${typeof reader}.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public Write(writer: JsonWriter, value: CsInt32, _options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
