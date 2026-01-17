import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsString } from "../../../../Types/CsString";

export class CsStringConverter extends JsonConverter<CsString> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsString;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsString {
        if (reader === null || reader === undefined) {
             throw new Error("Cannot convert null or undefined to CsString");
        }
        if (typeof reader === "string") {
            return CsString.From(reader);
        }
        throw new Error(`Expected string for CsString, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsString, _options: JsonSerializerOptions): void {
        writer.WriteStringValue(value.toString());
    }
}
