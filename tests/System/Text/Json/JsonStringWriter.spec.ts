import { JsonStringWriter } from "../../../../src/System/Text/Json/JsonStringWriter";

describe("System.Text.Json.JsonStringWriter", () => {
    test("Empty Object", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartObject();
        writer.WriteEndObject();
        expect(writer.toString()).toBe("{}");
    });

    test("Empty Array", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartArray();
        writer.WriteEndArray();
        expect(writer.toString()).toBe("[]");
    });

    test("Flat Object with Primitives (Escaping & Logic)", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartObject();

        writer.WritePropertyName("str");
        writer.WriteStringValue("hello");

        writer.WritePropertyName("num");
        writer.WriteNumberValue(123);

        writer.WritePropertyName("boolTrue");
        writer.WriteBooleanValue(true);

        writer.WritePropertyName("boolFalse");
        writer.WriteBooleanValue(false);

        writer.WritePropertyName("nullVal");
        writer.WriteNullValue();

        writer.WriteEndObject();

        const json = writer.toString();
        // Order matters for manual string checks
        expect(json).toBe('{"str":"hello","num":123,"boolTrue":true,"boolFalse":false,"nullVal":null}');
    });

    test("Escaping Special Characters", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartObject();
        writer.WritePropertyName("special");
        // Quotes, backslashes, newlines, returns, tabs
        writer.WriteStringValue('Line1\nLine2\r"Quoted"\\Backslash\tTab');
        writer.WriteEndObject();

        const json = writer.toString();
        const expectedVal = '"Line1\\nLine2\\r\\"Quoted\\"\\\\Backslash\\tTab"';
        expect(json).toBe(`{"special":${expectedVal}}`);
    });

    test("Array of Values (Comma Logic)", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartArray();
        writer.WriteNumberValue(1);
        writer.WriteNumberValue(2);
        writer.WriteStringValue("3");
        writer.WriteEndArray();

        expect(writer.toString()).toBe('[1,2,"3"]');
    });

    test("Nested Structures (Object in Array, Array in Object)", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartObject();

        writer.WritePropertyName("arr");
        writer.WriteStartArray();
        writer.WriteStartObject();
        writer.WritePropertyName("id");
        writer.WriteNumberValue(1);
        writer.WriteEndObject();
        writer.WriteStartObject();
        writer.WriteEndObject();
        writer.WriteEndArray();

        writer.WriteEndObject();

        expect(writer.toString()).toBe('{"arr":[{"id":1},{}]}');
    });

    test("WriteRawValue", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartArray();
        writer.WriteRawValue('{"raw":true}');
        writer.WriteNumberValue(2);
        writer.WriteEndArray();

        expect(writer.toString()).toBe('[{"raw":true},2]');
    });

    test("Initial Comma Logic Saturation (Root Level)", () => {
        // Technically strict JSON is one root element.
        // But our writer might support multiple if used for fragments?
        // Let's stick to standard behavior.
        // _currentState is 'None' initially.
        // WriteStartObject -> doesn't write comma.

        const writer = new JsonStringWriter();
        writer.WriteStartObject();
        writer.WriteEndObject();
        expect(writer.toString()).toBe("{}");
    });

    test("Error: WritePropertyName outside Object", () => {
        const writer = new JsonStringWriter();
        // Root context
        expect(() => writer.WritePropertyName("prop")).toThrow("outside of an object");

        // Array context
        writer.WriteStartArray();
        expect(() => writer.WritePropertyName("prop")).toThrow("outside of an object");
    });

    test("Error: Invalid EndObject/EndArray nesting", () => {
        const writer = new JsonStringWriter();
        writer.WriteStartObject();
        expect(() => writer.WriteEndArray()).toThrow("Invalid JSON state");

        const writer2 = new JsonStringWriter();
        writer2.WriteStartArray();
        expect(() => writer2.WriteEndObject()).toThrow("Invalid JSON state");
    });

    test("Large Payload (Buffer Saturation)", () => {
        // _parts is an array, so "buffer" is virtual.
        // But verifies we handle many operations without state corruption.
        const writer = new JsonStringWriter();
        writer.WriteStartArray();
        const count = 1000;
        for (let i = 0; i < count; i++) {
            writer.WriteNumberValue(i);
        }
        writer.WriteEndArray();
        const json = writer.toString();
        expect(json.startsWith("[0,1,2,")).toBe(true);
        expect(json.endsWith(`${count - 1}]`)).toBe(true);
    });
});
