import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { CsString } from "../../../../src/System/Types/CsString";
import { List } from "../../../../src/System/Collections/Generic/List";
import { CsInt16 } from "../../../../src/System/Types/CsInt16";
import { CsBoolean } from "../../../../src/System/Types/CsBoolean";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsInt64 } from "../../../../src/System/Types/CsInt64";
import { CsDateTime } from "../../../../src/System/Types/CsDateTime";

// --- EXISTING DTOs ---

class SimpleDto {
    public Name: CsString = CsString.From(""); // Initialized
}

class ListDto {
    public Items: List<CsString> = new List<CsString>([], CsString); // Initialized with Type
}

class UninitializedDto {
    public Name?: CsString; // Uninitialized
}

class NestedDto {
    public Child: SimpleDto = new SimpleDto(); // Initialized
}

// --- NEW POSITIVE TEST DTOs ---

class ClientDto {
    public Name: CsString = CsString.Empty;
    public Age: CsInt16 = CsInt16.From(0);
    public IsWoman: CsBoolean = CsBoolean.From(false);
}

class BankClientListDto {
    public AgencyName: CsString = CsString.Empty;
    public Supervisor: ClientDto = new ClientDto();
    public ListClient: List<ClientDto> = new List<ClientDto>([], ClientDto);
}

class AllTypesDto {
    public Str: CsString = CsString.Empty;
    public Int: CsInt32 = CsInt32.From(0);
    public Big: CsInt64 = CsInt64.From(0n);
    public Date: CsDateTime = CsDateTime.From(new Date(0));
    public Bool: CsBoolean = CsBoolean.From(false);
}

// --- NEW NEGATIVE TEST DTOs ---

class InvalidListDto {
    // Intentionally missing element type for negative test
    public Items: List<ClientDto> = new List<ClientDto>();
}

describe("Recursive Serialization", () => {
    // --- EXISTING TESTS ---

    test("Hydrates Simple DTO", () => {
        const json = '{"Name": "Alice"}';
        const result = JsonSerializer.Deserialize(json, SimpleDto);

        expect(result).toBeInstanceOf(SimpleDto);
        expect(result.Name).toBeInstanceOf(CsString);
        expect(result.Name.toString()).toBe("Alice");
    });

    test("Hydrates List<CsString>", () => {
        const json = '{"Items": ["A", "B"]}';
        const result = JsonSerializer.Deserialize(json, ListDto);

        expect(result).toBeInstanceOf(ListDto);
        expect(result.Items).toBeInstanceOf(List);
        expect(result.Items.Count).toBe(2);
        expect(result.Items.FirstOrDefault()!.toString()).toBe("A");
    });

    test("Ignores Uninitialized Property", () => {
        const json = '{"Name": "Bob"}';
        const result = JsonSerializer.Deserialize(json, UninitializedDto);

        expect(result.Name).toBeUndefined(); // Should NOT be hydrated
    });

    test("Hydrates Nested DTO", () => {
        const json = '{"Child": {"Name": "Charlie"}}';
        const result = JsonSerializer.Deserialize(json, NestedDto);

        expect(result.Child).toBeInstanceOf(SimpleDto);
        expect(result.Child.Name.toString()).toBe("Charlie");
    });

    // --- NEW COMPLEX POSITIVE TESTS ---

    test("Hydrates Complex Object with Nested DTO and List", () => {
        const json = JSON.stringify({
            AgencyName: "Downtown",
            Supervisor: { Name: "Boss", Age: 50, IsWoman: true },
            ListClient: [
                { Name: "Alice", Age: 25, IsWoman: true },
                { Name: "Bob", Age: 30, IsWoman: false },
            ],
        });

        const result = JsonSerializer.Deserialize(json, BankClientListDto);

        expect(result).toBeInstanceOf(BankClientListDto);

        // Assert System Type: AgencyName
        expect(result.AgencyName).toBeInstanceOf(CsString);
        expect(result.AgencyName.toString()).toBe("Downtown");

        // Assert Nested Object: Supervisor
        expect(result.Supervisor).toBeInstanceOf(ClientDto);
        expect(result.Supervisor.Name).toBeInstanceOf(CsString);
        expect(result.Supervisor.Name.toString()).toBe("Boss");
        expect(result.Supervisor.Age).toBeInstanceOf(CsInt16);
        expect(result.Supervisor.Age.Value).toBe(50);
        expect(result.Supervisor.IsWoman).toBeInstanceOf(CsBoolean);
        expect(result.Supervisor.IsWoman.Value).toBe(true);

        // Assert List: ListClient
        expect(result.ListClient).toBeInstanceOf(List);
        expect(result.ListClient.Count).toBe(2);

        // Check Element 1
        const person1 = result.ListClient.ToArray()[0];
        expect(person1).toBeInstanceOf(ClientDto);
        expect(person1.Name.toString()).toBe("Alice");
        expect(person1.Age.Value).toBe(25);
        expect(person1.IsWoman.Value).toBe(true);

        // Check Element 2
        const person2 = result.ListClient.ToArray()[1];
        expect(person2).toBeInstanceOf(ClientDto);
        expect(person2.Name.toString()).toBe("Bob");
        expect(person2.Age.Value).toBe(30);
        expect(person2.IsWoman.Value).toBe(false);
    });

    test("Hydrates DTO with Multiple System Types", () => {
        const dateString = "2024-05-20T10:00:00.000Z";
        const json = JSON.stringify({
            Str: "SystemString",
            Int: 2147483647, // Max Int32
            Big: "9007199254740992", // Max Safe Integer + 1 (as string for safety)
            Date: dateString,
            Bool: true,
        });

        const result = JsonSerializer.Deserialize(json, AllTypesDto);

        expect(result).toBeInstanceOf(AllTypesDto);

        // CsString
        expect(result.Str).toBeInstanceOf(CsString);
        expect(result.Str.toString()).toBe("SystemString");

        // CsInt32
        expect(result.Int).toBeInstanceOf(CsInt32);
        expect(result.Int.Value).toBe(2147483647);

        // CsInt64
        expect(result.Big).toBeInstanceOf(CsInt64);
        expect(result.Big.ToString()).toBe("9007199254740992");

        // CsDateTime
        expect(result.Date).toBeInstanceOf(CsDateTime);
        expect(result.Date.ToString("O")).toBe(dateString);

        // CsBoolean
        expect(result.Bool).toBeInstanceOf(CsBoolean);
        expect(result.Bool.Value).toBe(true);
    });

    // --- NEW NEGATIVE TESTS ---

    test("Throws on Invalid Primitive Type Mismatch", () => {
        // Attempt to pass a string "NotANumber" into CsInt16 field "Age"
        const json = JSON.stringify({
            Name: "BadData",
            Age: "NotANumber",
            IsWoman: true,
        });

        expect(() => {
            JsonSerializer.Deserialize(json, ClientDto);
        }).toThrow(); // Expect generic or specific validation error from CsInt16Converter/Factory
    });

    test("Throws when List ElementType is missing", () => {
        // Attempt to deserialize into InvalidListDto where List is initialized without type
        const json = JSON.stringify({
            Items: [{ Name: "Ghost", Age: 0, IsWoman: false }],
        });

        expect(() => {
            JsonSerializer.Deserialize(json, InvalidListDto);
        }).toThrow(/ElementType/); // Matches "ElementType is undefined" or similar validation error
    });
});
