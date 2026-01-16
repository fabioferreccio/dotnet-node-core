import { JsonConverter, Constructor } from "../JsonConverter";
import { JsonSerializerOptions } from "../../JsonSerializerOptions";
import { JsonWriter } from "../../JsonWriter";
import { CsInt64 } from "../../../../Types/CsInt64";

export class CsInt64Converter extends JsonConverter<CsInt64> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt64;
    }

    public Read(
        reader: unknown,
        typeToConvert: Constructor,
        options: JsonSerializerOptions
    ): CsInt64 {
        // STRICT RULE: CsInt64 must come from String to avoid precision loss.
        if (typeof reader === "string") {
            return CsInt64.From(reader);
        }
        // Strict: Reject number?
        // "MUST accept ONLY the expected JSON primitive"
        // "CsInt64: MUST respect canonical representation... MUST NOT silently coerce bigint <-> number"
        // If canonical is String, we reject number.
        throw new Error(`Expected string for CsInt64, got ${typeof reader}. BigInt serialization requires string transport.`);
    }

    public Write(
        writer: JsonWriter,
        value: CsInt64,
        options: JsonSerializerOptions
    ): void {
        // Serialize as String
        writer.WriteStringValue(value.ToString());
    }
}
