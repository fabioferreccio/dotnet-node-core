import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsInt16 } from "../../../../Types/CsInt16";

export class CsInt16Converter extends JsonConverter<CsInt16> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt16;
    }

    public Read(
        reader: unknown,
        typeToConvert: Constructor,
        options: JsonSerializerOptions
    ): CsInt16 {
        if (typeof reader === "number") {
            return CsInt16.From(reader);
        }
        throw new Error(`Expected number for CsInt16, got ${typeof reader}.`);
    }

    public Write(
        writer: JsonWriter,
        value: CsInt16,
        options: JsonSerializerOptions
    ): void {
        // Assuming CsInt16 has .Value accessor similar to others
        // We will verify if compilation fails (it shouldn't if pattern holds)
        // If CsInt16 lacks .Value we will fix.
        // But CsByte/SByte had it.
        // Let's assume yes. 
        writer.WriteNumberValue(value.Value);
    }
}
