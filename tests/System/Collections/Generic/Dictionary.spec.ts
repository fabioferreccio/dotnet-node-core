import { Dictionary } from "../../../../src/System/Collections/Generic/Dictionary";
import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsGuid } from "../../../../src/System/Types/CsGuid";

class ClientDto {
    public Name: CsString = CsString.From("");
}

describe("Dictionary<TKey, TValue> Contract", () => {
    test("Positive: Dictionary<CsString, CsInt32> works", () => {
        const dict = new Dictionary(CsString, CsInt32);
        const key = CsString.From("Key1");
        const val = CsInt32.From(42);

        dict.Add(key, val);
        const retrieved = dict.Get(key);

        expect(retrieved).toBeInstanceOf(CsInt32);
        expect(retrieved!.Value).toBe(42);
    });

    test("Positive: Dictionary<CsGuid, ClientDto> works", () => {
        const dict = new Dictionary(CsGuid, ClientDto);
        const key = CsGuid.NewGuid();
        const dto = new ClientDto();
        dto.Name = CsString.From("Alice");

        dict.Add(key, dto);
        const retrieved = dict.Get(key);

        expect(retrieved).toBeInstanceOf(ClientDto);
        expect(retrieved!.Name.toString()).toBe("Alice");
    });

    test("Negative: Attempt to use invalid key type (CsInt32)", () => {
        const dict = new Dictionary(CsInt32, CsString);
        const key = CsInt32.From(123);
        const val = CsString.From("Value");

        // The Add validation logic should throw because CsInt32 is not supported as key
        expect(() => {
            dict.Add(key, val);
        }).toThrow(/not supported/);
    });

    test("Negative: Construct without RTTI", () => {
        expect(() => {
            // @ts-expect-error Testing runtime check
            new Dictionary(null, CsString);
        }).toThrow();
    });
});
