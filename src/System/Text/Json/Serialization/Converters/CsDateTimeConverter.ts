import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsDateTime } from "../../../../Types/CsDateTime";

export class CsDateTimeConverter extends JsonConverter<CsDateTime> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsDateTime;
    }

    public Read(reader: unknown, typeToConvert: Constructor, options: JsonSerializerOptions): CsDateTime {
        // We assume ISO string from JSON.parse behavior
        if (typeof reader === "string") {
            // Native Date parse via CsDateTime constructor (which accepts string) or we can use From(new Date(reader))
            // CsDateTime ctor accepts string, number, Date.
            // Using From is safer per patterns.
            return CsDateTime.From(reader);
        }
        // If JSON.parse(reviver) is not used, it stays string.
        throw new Error(`Expected string (ISO 8601) for CsDateTime, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsDateTime, options: JsonSerializerOptions): void {
        // Use "round-trip" format "O" equivalent -> ISO string
        // Use "round-trip" format "O" equivalent -> ISO string
        writer.WriteStringValue(value.ToString("O"));
    }
}
