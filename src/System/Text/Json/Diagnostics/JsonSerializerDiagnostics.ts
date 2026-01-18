import { JsonConverter, Constructor } from "../Serialization/JsonConverter";
import { JsonSerializationContext } from "./JsonSerializationContext";

export interface JsonSerializerDiagnostics {
    OnSerializeStart?(context: JsonSerializationContext): void;
    OnSerializeEnd?(context: JsonSerializationContext): void;
    OnDeserializeStart?(context: JsonSerializationContext): void;
    OnDeserializeEnd?(context: JsonSerializationContext): void;
    OnConverterUsed?(type: Constructor<unknown>, converter: JsonConverter<unknown>): void;
    OnMetadataApplied?(type: Constructor<unknown>, propertyName: string): void;
    OnError?(error: Error, context: JsonSerializationContext): void;
}
