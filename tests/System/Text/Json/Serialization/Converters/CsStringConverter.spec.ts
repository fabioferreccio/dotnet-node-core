import { CsStringConverter } from "../../../../../../src/System/Text/Json/Serialization/Converters/CsStringConverter";
import { CsString } from "../../../../../../src/System/Types/CsString";
import { JsonSerializerOptions } from "../../../../../../src/System/Text/Json/JsonSerializerOptions";
import { JsonStringWriter } from "../../../../../../src/System/Text/Json/JsonStringWriter";

describe("System.Text.Json.Serialization.Converters.CsStringConverter", () => {
    test("Read: Valid string", () => {
        const converter = new CsStringConverter();
        // Implementation expects raw string
        const result = converter.Read("test-value", CsString, new JsonSerializerOptions());
        expect(result).toBeInstanceOf(CsString);
        expect(result.toString()).toBe("test-value");
    });

    test("Read: Handles null inputs", () => {
        const converter = new CsStringConverter();
        expect(() => converter.Read(null, CsString, new JsonSerializerOptions())).toThrow(
            "Cannot convert null or undefined to CsString",
        );
        expect(() => converter.Read(undefined, CsString, new JsonSerializerOptions())).toThrow(
            "Cannot convert null or undefined to CsString",
        );
    });

    test("Write: Serializes CsString to JSON string", () => {
        const converter = new CsStringConverter();
        const options = new JsonSerializerOptions();

        const writer = new JsonStringWriter();
        const value = CsString.From("hello");

        converter.Write(writer, value, options);

        expect(writer.toString()).toBe('"hello"');
    });

    test("Write: Handles special characters (escaped by Writer, but passes through converter)", () => {
        const converter = new CsStringConverter();
        const options = new JsonSerializerOptions();
        const writer = new JsonStringWriter();

        const value = CsString.From('Quote: "');
        converter.Write(writer, value, options);

        expect(writer.toString()).toBe('"Quote: \\""');
    });
});
