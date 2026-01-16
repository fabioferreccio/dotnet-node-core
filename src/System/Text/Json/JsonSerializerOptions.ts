import { List } from "../../Collections/Generic/List";
import type { JsonConverter } from "./JsonConverter";

export class JsonSerializerOptions {
    private _converters: List<JsonConverter<unknown>>;
    private _writeIndented: boolean;
    private _propertyNameCaseInsensitive: boolean;

    constructor() {
        this._converters = new List<JsonConverter<unknown>>();
        this._writeIndented = false;
        this._propertyNameCaseInsensitive = false;
    }

    public get Converters(): List<JsonConverter<unknown>> {
        return this._converters;
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
}
