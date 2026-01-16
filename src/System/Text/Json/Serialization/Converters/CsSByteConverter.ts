import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsSByte } from "../../../../Types/CsSByte";

export class CsSByteConverter extends JsonConverter<CsSByte> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsSByte;
    }

    public Read(
        reader: unknown,
        typeToConvert: Constructor,
        options: JsonSerializerOptions
    ): CsSByte {
        if (typeof reader === "number") {
            return CsSByte.From(reader);
        }
        throw new Error(`Expected number for CsSByte, got ${typeof reader}.`);
    }

    public Write(
        writer: JsonWriter,
        value: CsSByte,
        options: JsonSerializerOptions
    ): void {
        writer.WriteNumberValue(value.Value);
    }
}
