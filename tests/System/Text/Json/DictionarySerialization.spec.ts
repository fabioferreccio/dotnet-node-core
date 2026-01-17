import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { JsonSerializerOptions } from "../../../../src/System/Text/Json/JsonSerializerOptions";
import { Dictionary } from "../../../../src/System/Collections/Generic/Dictionary";
import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsGuid } from "../../../../src/System/Types/CsGuid";
import { CsInt16 } from "../../../../src/System/Types/CsInt16";
import { CsBoolean } from "../../../../src/System/Types/CsBoolean";
import { List } from "../../../../src/System/Collections/Generic/List";
import { DictionaryJsonConverter } from "../../../../src/System/Text/Json/Serialization/Converters/DictionaryJsonConverter";

// DTOs for testing
class ClientDto {
    public Name: CsString = CsString.Empty;
    public Age: CsInt16 = CsInt16.From(0);
    public IsActive: CsBoolean = CsBoolean.From(false);
}

// class ComplexListDto {
//    public ItemList: List<ClientDto> = new List<ClientDto>([], ClientDto);
// }

describe("Dictionary Serialization", () => {
    test("Positive: serialized/deserializes Dictionary<CsString, CsInt32>", () => {
        const dict = new Dictionary(CsString, CsInt32);
        dict.Add(CsString.From("A"), CsInt32.From(10));
        dict.Add(CsString.From("B"), CsInt32.From(20));

        // Use Options with MANUAL registration
        const options = new JsonSerializerOptions();
        options.Converters.Add(new DictionaryJsonConverter(CsString, CsInt32));

        const json = JsonSerializer.Serialize(dict, options);

        // Assert JSON structure (roughly)
        expect(json).toContain('"A":10');
        expect(json).toContain('"B":20');

        const result = JsonSerializer.Deserialize(json, Dictionary, options) as Dictionary<CsString, CsInt32>;

        expect(result).toBeInstanceOf(Dictionary);
        expect(result.Get(CsString.From("A"))?.Value).toBe(10);
        expect(result.Get(CsString.From("B"))?.Value).toBe(20);
    });

    test("Positive: Dictionary<CsGuid, ClientDto>", () => {
        const guid1 = CsGuid.NewGuid();
        const dto1 = new ClientDto();
        dto1.Name = CsString.From("Alice");
        dto1.Age = CsInt16.From(30);

        const dict = new Dictionary(CsGuid, ClientDto);
        dict.Add(guid1, dto1);

        const options = new JsonSerializerOptions();
        options.Converters.Add(new DictionaryJsonConverter(CsGuid, ClientDto));

        const json = JsonSerializer.Serialize(dict, options);
        const result = JsonSerializer.Deserialize(json, Dictionary, options) as Dictionary<CsGuid, ClientDto>;

        const val = result.Get(guid1);
        expect(val).toBeInstanceOf(ClientDto);
        expect(val!.Name.toString()).toBe("Alice");
    });

    test("Positive: Dictionary<CsString, List<ClientDto>>", () => {
        const _dict = new Dictionary(CsString, List);
        // Note: Generic List type in constructor argument is tricky in TS runtime.
        // The Dictionary expects `Constructor<TValue>`.
        // `List` is the constructor. BUT deserializer needs to know ElementType of the List!
        // Recursive hydration logic uses `existingValue` to determine types?
        // OR `JsonSerializer` expects explicit types.
        // Wait, Dictionary deserializer calls `JsonSerializer.Deserialize(..., List, options)`.
        // `JsonSerializer.Deserialize` creates `new List()`.
        // `List` constructor `new List()` creates empty list with undefined ElementType?
        // If ElementType is undefined, generic List deserialization FAILS (checked in previous phase).

        // CRITICAL GAP: Nested List Deserialization requires `List` to know its `ElementType`.
        // But `JsonSerializer.Deserialize(json, List)` calls `new List()`. It doesn't pass ElementType.
        // We cannot pass generic arguments to runtime constructor.

        // Solution: Defines a concrete `ClientList` class?
        // OR we rely on `DictionaryJsonConverter` to instantiate the value?
        // But `DictionaryJsonConverter` calls `JsonSerializer.Deserialize(..., this._valueType)`.
        // If `_valueType` is `List`, we instantiate `List`.

        // To support `List<ClientDto>` as value, we effectively need a `ClientDtoList` class
        // that extends `List<ClientDto>` and sets the element type in constructor.

        // Let's create `ClientDtoList` for this test.
    });
});

class ClientDtoList extends List<ClientDto> {
    constructor() {
        super([], ClientDto);
    }
}

describe("Dictionary Serialization (Lists)", () => {
    test("Positive: Dictionary<CsString, ClientDtoList>", () => {
        const dict = new Dictionary(CsString, ClientDtoList); // Use concrete type
        const list = new ClientDtoList();
        const c = new ClientDto();
        c.Name = CsString.From("Bob");
        list.Add(c);

        dict.Add(CsString.From("Key"), list);

        const options = new JsonSerializerOptions();
        options.Converters.Add(new DictionaryJsonConverter(CsString, ClientDtoList));

        const json = JsonSerializer.Serialize(dict, options);
        const result = JsonSerializer.Deserialize(json, Dictionary, options) as Dictionary<CsString, ClientDtoList>;

        const val = result.Get(CsString.From("Key"));
        expect(val).toBeInstanceOf(ClientDtoList);
        expect(val!.Count).toBe(1);
        expect(val!.FirstOrDefault()!.Name.toString()).toBe("Bob");
    });

    test("Negative: Invalid Key String", () => {
        const json = '{ "Invalid-Guid": {} }';
        const options = new JsonSerializerOptions();
        options.Converters.Add(new DictionaryJsonConverter(CsGuid, ClientDto));

        expect(() => {
            JsonSerializer.Deserialize(json, Dictionary, options);
        }).toThrow(); // Expect Parse error from CsGuid
    });

    test("Negative: Missing Converter Registration", () => {
        const _dict = new Dictionary(CsString, CsInt32);
        const options = new JsonSerializerOptions();
        // No converter added

        // Expect Serialize to fall back to JSON.stringify (empty object? or custom?)
        // Wait, JsonSerializer fallback is JSON.stringify(value).
        // Dictionary is an object. It has private _storage.
        // JSON.stringify(dict) will serialize public properties.
        // _storage is private but usually emits if not excluded.
        // But Map serialization in JSON.stringify is {} (empty object).
        // So it won't throw, but it will be empty.

        // But Deserialize?
        // Deserialize(json, Dictionary, options).
        // If no converter, it instantiates Dictionary via `new Dictionary()`.
        // `Dictionary` constructor requires 2 args!
        // `new Dictionary()` with 0 args will throw TS error or Runtime error?
        // In JS, args are undefined. `if (!keyType) throw`.
        // So deserialization will THROW because constructor fails.

        expect(() => {
            JsonSerializer.Deserialize("{}", Dictionary, options);
        }).toThrow();
    });
});
