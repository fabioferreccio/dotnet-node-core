import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsString } from "../../../../Types/CsString";

export class CsStringConverter extends JsonConverter<CsString> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsString;
    }

    public Read(
        reader: unknown,
        typeToConvert: Constructor,
        options: JsonSerializerOptions
    ): CsString {
        if (typeof reader === "string") {
            return CsString.From(reader);
        }
        if (reader === null || reader === undefined) {
             throw new Error("Cannot convert null or undefined to CsString");
        }
        throw new Error(`JsonTokenType was of type ${typeof reader}, but expected string for CsString.`);
    }

    public Write(
        writer: JsonWriter,
        value: CsString,
        options: JsonSerializerOptions
    ): void {
        writer.WriteStringValue(value.toString());
    }
}
