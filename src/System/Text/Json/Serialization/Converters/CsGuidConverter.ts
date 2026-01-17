import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsGuid } from "../../../../Types/CsGuid";

export class CsGuidConverter extends JsonConverter<CsGuid> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsGuid;
    }

    public Read(reader: unknown, _typeToConvert: Constructor, _options: JsonSerializerOptions): CsGuid {
        if (typeof reader === "string") {
            return CsGuid.Parse(reader);
        }
        throw new Error(`Expected string for CsGuid, got ${typeof reader}.`);
    }

    public Write(writer: JsonWriter, value: CsGuid, _options: JsonSerializerOptions): void {
        writer.WriteStringValue(value.ToString());
    }
}
