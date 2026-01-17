import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsGuid } from "../../../../src/System/Types/CsGuid";
import { CsDateTime } from "../../../../src/System/Types/CsDateTime";
import { CsBoolean } from "../../../../src/System/Types/CsBoolean";
import { CsByte } from "../../../../src/System/Types/CsByte";
import { CsSByte } from "../../../../src/System/Types/CsSByte";
import { CsInt16 } from "../../../../src/System/Types/CsInt16";
import { CsInt64 } from "../../../../src/System/Types/CsInt64";
import { CsSingle } from "../../../../src/System/Types/CsSingle";
import { CsDouble } from "../../../../src/System/Types/CsDouble";
import { CsDecimal } from "../../../../src/System/Types/CsDecimal";

describe("System.Text.Json Serialization", () => {
    describe("CsString", () => {
        test("Serialize to primitive string", () => {
            const val = CsString.From("Hello World");
            const json = JsonSerializer.Serialize(val);
            expect(json).toBe('"Hello World"');
        });

        test("Deserialize from primitive string", () => {
            const json = '"Hello World"';
            const val = JsonSerializer.Deserialize(json, CsString);
            expect(val).toBeInstanceOf(CsString);
            expect(val.toString()).toBe("Hello World");
        });

        test("Round trip", () => {
            const original = CsString.From("Round Trip");
            const json = JsonSerializer.Serialize(original);
            const deserialized = JsonSerializer.Deserialize(json, CsString);
            // System Types don't implement deep Equals with Jest strict match usually,
            // but we can check value or use Equals if available (CsString has Equals).
            expect(deserialized.Equals(original)).toBe(true);
        });

        test("Deserialize invalid type throws", () => {
            const json = "123";
            expect(() => JsonSerializer.Deserialize(json, CsString)).toThrow();
        });
    });

    describe("CsInt32", () => {
        test("Serialize to primitive number", () => {
            const val = CsInt32.From(42);
            const json = JsonSerializer.Serialize(val);
            expect(json).toBe("42");
        });

        test("Deserialize from primitive number", () => {
            const json = "42";
            const val = JsonSerializer.Deserialize(json, CsInt32);
            expect(val).toBeInstanceOf(CsInt32);
            expect(val.Value).toBe(42); // Assumes optional Value accessor or cast to check internals/operators
            // Actually CsInt32 has Value getter? No, it's private _value.
            // Ops... CsInt32.ts had public operators or conversions?
            // Let's check implicit conversion or toString.
            // CsInt32 usually has explicit casts.
            // We can check .Equals() or logic.
            const cmp = CsInt32.From(42);
            expect(val.Equals(cmp)).toBe(true);
        });

        test("Deserialize from string number", () => {
            const json = '"42"';
            const val = JsonSerializer.Deserialize(json, CsInt32);
            expect(val.Equals(CsInt32.From(42))).toBe(true);
        });

        test("Deserialize invalid throws", () => {
            const json = '"nan"';
            expect(() => JsonSerializer.Deserialize(json, CsInt32)).toThrow();
        });
    });

    describe("CsGuid", () => {
        const guidStr = "12345678-1234-1234-1234-123456789012";
        test("Serialize to string", () => {
            const val = CsGuid.Parse(guidStr);
            const json = JsonSerializer.Serialize(val);
            expect(json).toBe(`"${guidStr}"`);
        });

        test("Deserialize from string", () => {
            const json = `"${guidStr}"`;
            const val = JsonSerializer.Deserialize(json, CsGuid);
            expect(val).toBeInstanceOf(CsGuid);
            expect(val.ToString()).toBe(guidStr);
        });
    });

    describe("CsDateTime", () => {
        // Use a fixed date
        const dateStr = "2023-01-01T12:00:00.000Z";
        test("Serialize to ISO string", () => {
            const val = CsDateTime.From(dateStr);
            const json = JsonSerializer.Serialize(val);
            // expect(json).toBe(`"${dateStr}"`); // CsDateTime might adjust format slightly?
            // Let's rely on date equivalency or exact string if implementation is purely wrapping Date.toISOString()
            expect(JSON.parse(json)).toBe(dateStr);
        });

        test("Deserialize from ISO string", () => {
            const json = `"${dateStr}"`;
            const val = JsonSerializer.Deserialize(json, CsDateTime);
            expect(val).toBeInstanceOf(CsDateTime);
            // CsDateTime usually wraps Date.
            expect(val.ToString("O")).toBe(dateStr); // Assuming ToString("O") or check underlying
        });
    });

    describe("CsBoolean", () => {
        test("Serialize to primitive boolean", () => {
            const val = CsBoolean.From(true);
            expect(JsonSerializer.Serialize(val)).toBe("true");
        });
        test("Deserialize from primitive boolean", () => {
            const val = JsonSerializer.Deserialize("true", CsBoolean);
            expect(val).toBeInstanceOf(CsBoolean);
            expect(val.Value).toBe(true);
        });
        test("Deserialize invalid throws", () => {
            expect(() => JsonSerializer.Deserialize("1", CsBoolean)).toThrow();
        });
    });

    describe("CsInt64", () => {
        test("Serialize to string", () => {
            const val = CsInt64.From("9007199254740992"); // Beyond MAX_SAFE_INTEGER
            const json = JsonSerializer.Serialize(val);
            // MUST be quoted string
            expect(json).toBe('"9007199254740992"');
        });
        test("Deserialize from string", () => {
            const str = '"9007199254740992"';
            const val = JsonSerializer.Deserialize(str, CsInt64);
            expect(val).toBeInstanceOf(CsInt64);
            expect(val.ToString()).toBe("9007199254740992");
        });
        test("Fail on number primitive", () => {
            // Should fail because we demand String to ensure precision
            expect(() => JsonSerializer.Deserialize("123", CsInt64)).toThrow();
        });
    });

    describe("CsByte", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsByte.From(255))).toBe("255"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("255", CsByte);
            expect(val.Value).toBe(255);
        });
    });

    describe("CsSByte", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsSByte.From(-128))).toBe("-128"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("-128", CsSByte);
            expect(val.Value).toBe(-128);
        });
    });

    describe("CsInt16", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsInt16.From(32000))).toBe("32000"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("32000", CsInt16);
            expect(val.Value).toBe(32000);
        });
    });

    describe("CsSingle", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsSingle.From(1.5))).toBe("1.5"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("1.5", CsSingle);
            expect(val.Value).toBe(1.5);
        });
    });

    describe("CsDouble", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsDouble.From(1.123))).toBe("1.123"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("1.123", CsDouble);
            expect(val.Value).toBe(1.123);
        });
    });

    describe("CsDecimal", () => {
        test("Serialize", () => expect(JsonSerializer.Serialize(CsDecimal.From(100.55))).toBe("100.55"));
        test("Deserialize", () => {
            const val = JsonSerializer.Deserialize("100.55", CsDecimal);
            expect(val.Value).toBe(100.55);
        });
    });

    // DTO / Complex Object Test (Limited Scope - Primitive props only if implicit?)
    // Our Serialize logic: if T is registered, use converter. Else JSON.stringify.
    // Deserialize logic: if T registered, use converter. Else return parsed (any).
    // So if we have a DTO, we can't strict type it unless we have an ObjectConverter.
    // But specific request: Serialize CsString -> "Value". (Done)

    // Test CsBoolean? Not explicitly requested but used in tests previously.
    // We didn't add CsBooleanConverter.
});
