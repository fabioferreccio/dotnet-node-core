import type { JsonSerializerOptions } from "./JsonSerializerOptions";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = any> = new (...args: any[]) => T;

export abstract class JsonConverter<T> {
    public abstract CanConvert(typeToConvert: Constructor): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract Read(value: any, typeToConvert: Constructor, options: JsonSerializerOptions): T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract Write(value: T, options: JsonSerializerOptions): any;
}
