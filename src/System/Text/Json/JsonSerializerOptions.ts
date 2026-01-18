import { List } from "../../Collections/Generic/List";
import type { JsonConverter, Constructor } from "./Serialization/JsonConverter";
import { CsStringConverter } from "./Serialization/Converters/CsStringConverter";
import { CsInt32Converter } from "./Serialization/Converters/CsInt32Converter";
import { CsGuidConverter } from "./Serialization/Converters/CsGuidConverter";
import { CsDateTimeConverter } from "./Serialization/Converters/CsDateTimeConverter";
import { CsBooleanConverter } from "./Serialization/Converters/CsBooleanConverter";
import { CsByteConverter } from "./Serialization/Converters/CsByteConverter";
import { CsSByteConverter } from "./Serialization/Converters/CsSByteConverter";
import { CsInt16Converter } from "./Serialization/Converters/CsInt16Converter";
import { CsInt64Converter } from "./Serialization/Converters/CsInt64Converter";
import { CsSingleConverter } from "./Serialization/Converters/CsSingleConverter";
import { CsDoubleConverter } from "./Serialization/Converters/CsDoubleConverter";
import { CsDecimalConverter } from "./Serialization/Converters/CsDecimalConverter";
import { JsonTypeMetadata } from "./Metadata/JsonTypeMetadata";

export class JsonSerializerOptions {
    private _converters: List<JsonConverter<unknown>>;
    private _typeMetadata: Map<Constructor<unknown>, JsonTypeMetadata>;
    private _writeIndented: boolean;

    private _propertyNameCaseInsensitive: boolean;

    constructor() {
        this._converters = new List<JsonConverter<unknown>>();
        // ListJsonConverter removed: Handled by JsonSerializer explicit logic
        this._converters.Add(new CsStringConverter());
        this._converters.Add(new CsInt32Converter());
        this._converters.Add(new CsGuidConverter());
        this._converters.Add(new CsDateTimeConverter());
        this._converters.Add(new CsBooleanConverter());
        this._converters.Add(new CsByteConverter());
        this._converters.Add(new CsSByteConverter());
        this._converters.Add(new CsInt16Converter());
        this._converters.Add(new CsInt64Converter());
        this._converters.Add(new CsSingleConverter());
        this._converters.Add(new CsDoubleConverter());
        this._converters.Add(new CsDecimalConverter());

        this._writeIndented = false;
        this._propertyNameCaseInsensitive = false;
        this._typeMetadata = new Map<Constructor<unknown>, JsonTypeMetadata>();
    }

    public get Converters(): List<JsonConverter<unknown>> {
        return this._converters;
    }

    public GetConverter(typeToConvert: Constructor): JsonConverter<unknown> | null {
        for (const converter of this._converters) {
            if (converter.CanConvert(typeToConvert)) {
                return converter;
            }
        }
        return null;
    }

    public get WriteIndented(): boolean {
        return this._writeIndented;
    }

    public set WriteIndented(value: boolean) {
        this._writeIndented = value;
    }

    public get PropertyNameCaseInsensitive(): boolean {
        return this._propertyNameCaseInsensitive;
    }

    public set PropertyNameCaseInsensitive(value: boolean) {
        this._propertyNameCaseInsensitive = value;
    }

    public RegisterTypeMetadata(metadata: JsonTypeMetadata): void {
        metadata.Validate();
        this._typeMetadata.set(metadata.TargetType, metadata);
    }

    public GetTypeMetadata(type: Constructor<unknown>): JsonTypeMetadata | undefined {
        return this._typeMetadata.get(type);
    }
}
