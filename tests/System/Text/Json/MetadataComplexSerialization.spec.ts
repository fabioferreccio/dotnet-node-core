import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { JsonSerializerOptions } from "../../../../src/System/Text/Json/JsonSerializerOptions";
import { JsonTypeMetadata } from "../../../../src/System/Text/Json/Metadata/JsonTypeMetadata";
import { NullHandling } from "../../../../src/System/Text/Json/Metadata/NullHandling";
import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { List } from "../../../../src/System/Collections/Generic/List";
import { JsonConverter, Constructor } from "../../../../src/System/Text/Json/Serialization/JsonConverter";
import { JsonWriter } from "../../../../src/System/Text/Json/JsonWriter";

// --- DTO Definitions ---

class ClientDto {
    public Name: CsString | null = CsString.Empty;
    public Age: CsInt32 = CsInt32.From(0);
}

class BankDto {
    public BankName: CsString = CsString.Empty;
    public Clients: List<ClientDto> = new List<ClientDto>([], ClientDto);
}

class CustomAgeConverter extends JsonConverter<CsInt32> {
    public CanConvert(typeToConvert: Constructor): boolean {
        return typeToConvert === CsInt32;
    }
    public Read(_reader: unknown, _type: Constructor, _options: JsonSerializerOptions): CsInt32 {
        return CsInt32.From(999); // Dummy value
    }
    public Write(writer: JsonWriter, value: CsInt32, _options: JsonSerializerOptions): void {
        writer.WriteStringValue(`AGE:${value.Value}`);
    }
}

describe("Metadata Complex Serialization", () => {
    // --- Scenario 1: DTO with List<DTO> ---
    test("Scenario 1: DTO with List<DTO> (Metadata on Elements)", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        // Register metadata ONLY for ClientDto
        const clientMeta = JsonTypeMetadata.For(ClientDto).Map("Name", "client_name").Map("Age", "client_age");
        options.RegisterTypeMetadata(clientMeta);

        const bank = new BankDto();
        bank.BankName = CsString.From("IronBank");
        const c1 = new ClientDto();
        c1.Name = CsString.From("Jon");
        c1.Age = CsInt32.From(20);
        bank.Clients.Add(c1);

        // Act (Serialize)
        const json = JsonSerializer.Serialize(bank, options);

        // Assert
        // BankDto properties should be default
        expect(json).toContain(`"BankName":"IronBank"`);
        // ClientDto properties should be mapped
        expect(json).toContain(`"client_name":"Jon"`);
        expect(json).toContain(`"client_age":20`);
        // Ensure List structure (array in JSON)
        expect(json).toContain(`"Clients":[`);

        // Act (Deserialize)
        const deserialized = JsonSerializer.Deserialize(json, BankDto, options);

        // Assert
        expect(deserialized.BankName.toString()).toBe("IronBank");
        expect(deserialized.Clients.Count).toBe(1);
        const dClient = deserialized.Clients.FirstOrDefault();
        expect(dClient).not.toBeNull();
        expect(dClient!.Name?.toString()).toBe("Jon");
        expect(dClient!.Age.Value).toBe(20);
    });

    // --- Scenario 2: Nested DTO + List + Partial Metadata ---
    test("Scenario 2: Nested DTO + List + Partial Metadata (Metadata on Parent)", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        // Register metadata ONLY for BankDto
        const bankMeta = JsonTypeMetadata.For(BankDto).Map("BankName", "bank_name");
        options.RegisterTypeMetadata(bankMeta);

        // NO metadata for ClientDto

        const bank = new BankDto();
        bank.BankName = CsString.From("Gringotts");
        const c1 = new ClientDto();
        c1.Name = CsString.From("Harry");
        bank.Clients.Add(c1);

        // Act
        const json = JsonSerializer.Serialize(bank, options);

        // Assert
        expect(json).toContain(`"bank_name":"Gringotts"`); // Mapped
        expect(json).toContain(`"Clients":`); // Default (unmapped in BankDto metadata)
        expect(json).toContain(`"Name":"Harry"`); // ClientDto is default

        // Deserialize
        const deserialized = JsonSerializer.Deserialize(json, BankDto, options);
        expect(deserialized.BankName.toString()).toBe("Gringotts");
        expect(deserialized.Clients.FirstOrDefault()?.Name?.toString()).toBe("Harry");
    });

    // --- Scenario 3: Null Handling in List Elements ---
    test("Scenario 3: Null Handling in List Elements", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        const clientMeta = JsonTypeMetadata.For(ClientDto).Map("Name", "client_name", null, NullHandling.Ignore);
        options.RegisterTypeMetadata(clientMeta);

        const bank = new BankDto();

        const c1Null = new ClientDto();
        c1Null.Name = null; // Should be ignored
        c1Null.Age = CsInt32.From(10);

        const c2Valid = new ClientDto();
        c2Valid.Name = CsString.From("Arya");
        c2Valid.Age = CsInt32.From(11);

        bank.Clients.Add(c1Null);
        bank.Clients.Add(c2Valid);

        // Act
        const json = JsonSerializer.Serialize(bank, options);

        // Assert
        // Element 1: No "client_name"
        // We verify contextually.
        // Simple string check: "client_name" should appear once (for c2)
        const matchCount = (json.match(/"client_name"/g) || []).length;
        expect(matchCount).toBe(1);
        expect(json).toContain(`"Arya"`);

        // Both have Age
        const ageCount = (json.match(/"Age"/g) || []).length; // Default name for Age
        expect(ageCount).toBe(2);
    });

    // --- Scenario 4: Converter Override Inside List ---
    test("Scenario 4: Converter Override Inside List", () => {
        // Arrange
        const options = new JsonSerializerOptions();
        // Override Age converter
        const clientMeta = JsonTypeMetadata.For(ClientDto).Map("Age", "age_str", new CustomAgeConverter());
        options.RegisterTypeMetadata(clientMeta);

        const bank = new BankDto();
        const c1 = new ClientDto();
        c1.Age = CsInt32.From(50);
        bank.Clients.Add(c1);

        // Act
        const json = JsonSerializer.Serialize(bank, options);

        // Assert
        expect(json).toContain(`"age_str":"AGE:50"`);

        // Deserialize (Read uses dummy 999)
        const deserialized = JsonSerializer.Deserialize(json, BankDto, options);
        expect(deserialized.Clients.FirstOrDefault()?.Age.Value).toBe(999);
    });

    // --- Scenario 5: Regression Guard (Equivalence) ---
    test("Scenario 5: Regression Guard (Equivalence)", () => {
        const bank = new BankDto();
        bank.BankName = CsString.From("Standard");
        const c1 = new ClientDto();
        c1.Name = CsString.From("Normal");
        bank.Clients.Add(c1);

        // Run 1: No Metadata
        const opts1 = new JsonSerializerOptions();
        const json1 = JsonSerializer.Serialize(bank, opts1);
        const obj1 = JsonSerializer.Deserialize(json1, BankDto, opts1);

        // Run 2: With Unrelated Metadata (should not affect BankDto)
        class UnrelatedDto {
            public Value: string = "";
        }
        const opts2 = new JsonSerializerOptions();
        opts2.RegisterTypeMetadata(JsonTypeMetadata.For(UnrelatedDto).Map("Value", "v"));
        const json2 = JsonSerializer.Serialize(bank, opts2);
        const obj2 = JsonSerializer.Deserialize(json2, BankDto, opts2);

        // Assert
        expect(json1).toBe(json2);
        expect(obj1.BankName.toString()).toBe(obj2.BankName.toString());
    });

    // --- Scenario 6: Failure Mode - Invalid Registration ---
    test("Scenario 6: Failure Mode - Invalid Registration (Should Throw)", () => {
        const options = new JsonSerializerOptions();
        const meta = JsonTypeMetadata.For(ClientDto);

        // Attempt to map non-existent property
        // Note: Using 'any' to bypass TS compile check if possible, or just string
        // Since Map takes string, compile passes.
        meta.Map("NonExistentProperty", "json_prop");

        // Ideally, RegisterTypeMetadata should validate this.
        expect(() => {
            options.RegisterTypeMetadata(meta);
        }).toThrow(); // We expect this to fail once validation is added
    });
});
