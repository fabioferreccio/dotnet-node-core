export interface JsonWriter {
    WriteStartObject(): void;
    WriteEndObject(): void;
    WriteStartArray(): void;
    WriteEndArray(): void;
    
    WritePropertyName(name: string): void;
    
    WriteStringValue(value: string): void;
    WriteNumberValue(value: number): void;
    WriteBooleanValue(value: boolean): void;
    WriteNullValue(): void;
    
    // For raw value writing if needed
    WriteRawValue(json: string): void;
}
