import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsDateTime } from "../../../../Types/CsDateTime";

export class CsDateTimeConverter extends JsonConverter<CsDateTime> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsDateTime;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsDateTime {
        // Simple implementation: ISO string
        if (typeof reader === "string") {
            return CsDateTime.From(reader);
        }
        // Could handle number (ticks)
        if (typeof reader === "number") {
            return CsDateTime.From(reader);
        }
        throw new Error(`Expected string or number for CsDateTime, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsDateTime, _options: JsonSerializerOptions): void {
        writer.WriteStringValue(value.ToString());
    }
}
