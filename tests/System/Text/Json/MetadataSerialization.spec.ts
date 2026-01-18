import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { JsonSerializerOptions } from "../../../../src/System/Text/Json/JsonSerializerOptions";
import { JsonTypeMetadata } from "../../../../src/System/Text/Json/Metadata/JsonTypeMetadata";
import { NullHandling } from "../../../../src/System/Text/Json/Metadata/NullHandling";
import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsDateTime } from "../../../../src/System/Types/CsDateTime";
import { JsonConverter, Constructor } from "../../../../src/System/Text/Json/Serialization/JsonConverter";
import { JsonWriter } from "../../../../src/System/Text/Json/JsonWriter";

class PersonDto {
    public FirstName: CsString | null = CsString.Empty;
    public LastName: CsString | null = CsString.Empty;
    public Age: CsInt32 | null = CsInt32.From(0);
}

class InvoiceDto {
    public Amount: CsInt32 = CsInt32.From(0);
    public IssueDate: CsDateTime = CsDateTime.From(0); // MinValue replacement
    // Only mapped property
    public CustomerId: CsString | null = CsString.Empty;
    public Meta: CsString | null = CsString.Empty; // Unmapped
}

class CustomDateConverter extends JsonConverter<CsDateTime> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsDateTime;
    }
    public Read(reader: unknown, _type: Constructor, _options: JsonSerializerOptions): CsDateTime {
        // Assume format "Pre-EpochStart" for test
        if (typeof reader === "string" && reader === "CustomEpoch") {
            return CsDateTime.From(new Date(1970, 0, 1));
        }
        return CsDateTime.From(0);
    }
    public Write(writer: JsonWriter, value: CsDateTime, _options: JsonSerializerOptions): void {
        writer.WriteStringValue("CustomEpoch");
    }
}

describe("Metadata Serialization", () => {
    test("Naming Policy: Maps properties to snake_case", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(PersonDto)
            .Map("FirstName", "first_name")
            .Map("LastName", "last_name")
            .Map("Age", "age");
        options.RegisterTypeMetadata(meta);

        const person = new PersonDto();
        person.FirstName = CsString.From("John");
        person.LastName = CsString.From("Doe");
        person.Age = CsInt32.From(30);

        // Act (Serialize)
        const json = JsonSerializer.Serialize(person, options);

        // Assert
        expect(json).toContain(`"first_name":"John"`);
        expect(json).toContain(`"last_name":"Doe"`);
        expect(json).toContain(`"age":30`);

        // Act (Deserialize)
        const deserialized = JsonSerializer.Deserialize(json, PersonDto, options);

        // Assert
        expect(deserialized).toBeInstanceOf(PersonDto);
        expect(deserialized.FirstName?.toString()).toBe("John");
        expect(deserialized.LastName?.toString()).toBe("Doe");
        expect(deserialized.Age?.Value).toBe(30);
    });

    test("Partial Metadata: Maps one property, keeps others default", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(InvoiceDto).Map("CustomerId", "customer_id"); // Only map one
        options.RegisterTypeMetadata(meta);

        const invoice = new InvoiceDto();
        invoice.CustomerId = CsString.From("C123");
        invoice.Meta = CsString.From("Data");
        invoice.Amount = CsInt32.From(100);

        // Act
        const json = JsonSerializer.Serialize(invoice, options);

        // Assert
        expect(json).toContain(`"customer_id":"C123"`);
        expect(json).toContain(`"Meta":"Data"`); // Default case
        expect(json).toContain(`"Amount":100`);
    });

    test("Converter Override: Applies custom converter only to specific property", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(InvoiceDto).Map("IssueDate", "issue_date", new CustomDateConverter());
        options.RegisterTypeMetadata(meta);

        const invoice = new InvoiceDto();
        invoice.IssueDate = CsDateTime.From(new Date(2025, 0, 1)); // Should use converter on write

        // Act
        const json = JsonSerializer.Serialize(invoice, options);

        // Assert
        expect(json).toContain(`"issue_date":"CustomEpoch"`);

        // Act (Deserialize)
        const jsonInput = `{"issue_date":"CustomEpoch"}`;
        const deserialized = JsonSerializer.Deserialize(jsonInput, InvoiceDto, options);

        expect(deserialized.IssueDate).toBeInstanceOf(CsDateTime);
        expect(deserialized.IssueDate.Year).toBe(1970); // Converter fixed return
    });

    test("Null Handling: IgnoreNull omits property", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(PersonDto).Map("FirstName", "first_name", null, NullHandling.Ignore);
        options.RegisterTypeMetadata(meta);

        const person = new PersonDto();
        person.FirstName = null;
        person.LastName = CsString.From("Doe");

        // Act
        const json = JsonSerializer.Serialize(person, options);

        // Assert
        expect(json).not.toContain("first_name");
        expect(json).toContain(`"LastName":"Doe"`);
    });

    test("Null Handling: DisallowNull throws", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(PersonDto).Map("FirstName", "first_name", null, NullHandling.Disallow);
        options.RegisterTypeMetadata(meta);

        // Act & Assert (Deserialize)
        const json = `{"first_name":null}`;
        expect(() => JsonSerializer.Deserialize(json, PersonDto, options)).toThrow(/DisallowNull/);

        // Act & Assert (Serialize)
        const person = new PersonDto();
        person.FirstName = null;
        expect(() => JsonSerializer.Serialize(person, options)).toThrow(/DisallowNull/);
    });

    test("Regression Guard: Standard object without metadata acts as Phase 4", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        // No metadata registered
        const person = new PersonDto();
        person.FirstName = CsString.From("Alice");

        // Act
        const json = JsonSerializer.Serialize(person, options);

        // Assert
        // Standard JSON stringify behavior (or equivalent manual writer)
        // Should use property names as is
        expect(json).toContain(`"FirstName":"Alice"`);

        const deserialized = JsonSerializer.Deserialize(json, PersonDto, options);
        expect(deserialized.FirstName?.toString()).toBe("Alice");
    });

    test("Single Serialization Pipeline: Primitives work correctly", () => {
        // Act
        const jsonString = JsonSerializer.Serialize("hello");
        const jsonNumber = JsonSerializer.Serialize(123);
        const jsonBool = JsonSerializer.Serialize(true);
        const jsonNull = JsonSerializer.Serialize(null);

        // Assert
        expect(jsonString).toBe(`"hello"`);
        expect(jsonNumber).toBe(`123`);
        expect(jsonBool).toBe(`true`);
        expect(jsonNull).toBe("null");
        // Compare with JSON.stringify
        expect(jsonString).toBe(JSON.stringify("hello"));
    });
});
