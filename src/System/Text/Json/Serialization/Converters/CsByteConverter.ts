import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsByte } from "../../../../Types/CsByte";

export class CsByteConverter extends JsonConverter<CsByte> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsByte;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsByte {
        if (typeof reader === "number") {
            return CsByte.From(reader);
        }
        throw new Error(`Expected number for CsByte, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsByte, _options: JsonSerializerOptions): void {
        writer.WriteNumberValue(value.Value);
    }
}
