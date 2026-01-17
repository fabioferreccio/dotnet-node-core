/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonSerializerOptions } from "../../../../src/System/Text/Json/JsonSerializerOptions";
import { JsonConverter } from "../../../../src/System/Text/Json/Serialization/JsonConverter";
import { CsStringConverter } from "../../../../src/System/Text/Json/Serialization/Converters/CsStringConverter";

describe("System.Text.Json.JsonSerializerOptions", () => {
    test("Constructor: Initializes default converters", () => {
        const opts = new JsonSerializerOptions();
        expect(opts.Converters.Count).toBeGreaterThan(0);
        // Verify a standard converter exists
        let found = false;
        for (const c of opts.Converters) {
            if (c instanceof CsStringConverter) found = true;
        }
        expect(found).toBe(true);
    });

    test("Converters: Add and Resolve Custom Converter", () => {
        const opts = new JsonSerializerOptions();

        // Mock a custom converter
        // We create a dummy class to act as the "TypeToConvert"
        class MyCustomType {}

        class MyCustomConverter extends JsonConverter<MyCustomType> {
            public CanConvert(typeToConvert: any): boolean {
                return typeToConvert === MyCustomType;
            }
            public Read(_reader: any, _typeToConvert: any, _options: any): MyCustomType {
                throw new Error("Not implemented");
            }
            public Write(_writer: any, _value: MyCustomType, _options: any): void {
                throw new Error("Not implemented");
            }
        }

        const myConverter = new MyCustomConverter();
        opts.Converters.Add(myConverter);

        // Resolve it
        const resolved = opts.GetConverter(MyCustomType);
        expect(resolved).toBe(myConverter);
    });

    test("GetConverter: Returns null for unknown type", () => {
        const opts = new JsonSerializerOptions();
        class UnknownType {}
        const resolved = opts.GetConverter(UnknownType);
        expect(resolved).toBeNull();
    });

    test("GetConverter: Returns first match (Linear Search Coverage)", () => {
        const opts = new JsonSerializerOptions();
        // CsInt32Converter is usually early in the list.
        // We verify we can find it.
        // This exercises the 'if (converter.CanConvert)' true branch inside the loop.
        // And the loop continuation for false branches happens naturally.

        // We need the constructor for CsInt32, which is tricky in TS if not exported/referenced as value.
        // But the converters usually check strict type match or instanceof.
        // CsInt32Converter checks `typeToConvert === CsInt32`.
        // We need to import CsInt32 to test this properly, OR rely on the fact that existing converters work.

        // Let's use our own mock chain to guarantee order and hits.
        class TypeA {}
        class TypeB {}

        class ConvA extends JsonConverter<TypeA> {
            CanConvert(t: any) {
                return t === TypeA;
            }
            Read(_reader: any, _typeToConvert: any, _options: any): TypeA {
                throw 1;
            }
            Write(_writer: any, _value: TypeA, _options: any): void {
                throw 1;
            }
        }
        class ConvB extends JsonConverter<TypeB> {
            CanConvert(t: any) {
                return t === TypeB;
            }
            Read(_reader: any, _typeToConvert: any, _options: any): TypeB {
                throw 1;
            }
            Write(_writer: any, _value: TypeB, _options: any): void {
                throw 1;
            }
        }

        opts.Converters.Clear();
        const cA = new ConvA();
        const cB = new ConvB();
        opts.Converters.Add(cA);
        opts.Converters.Add(cB);

        expect(opts.GetConverter(TypeA)).toBe(cA); // Hits index 0
        expect(opts.GetConverter(TypeB)).toBe(cB); // Hits index 1 (loop continues)
    });

    test("WriteIndented: Getter and Setter", () => {
        const opts = new JsonSerializerOptions();
        // Default false
        expect(opts.WriteIndented).toBe(false);

        opts.WriteIndented = true;
        expect(opts.WriteIndented).toBe(true);

        opts.WriteIndented = false;
        expect(opts.WriteIndented).toBe(false);
    });

    test("PropertyNameCaseInsensitive: Getter and Setter", () => {
        const opts = new JsonSerializerOptions();
        // Default false
        expect(opts.PropertyNameCaseInsensitive).toBe(false);

        opts.PropertyNameCaseInsensitive = true;
        expect(opts.PropertyNameCaseInsensitive).toBe(true);

        opts.PropertyNameCaseInsensitive = false;
        expect(opts.PropertyNameCaseInsensitive).toBe(false);
    });
});
