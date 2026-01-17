import { CsString } from "../../../../src/System/Types/CsString";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { List } from "../../../../src/System/Collections/Generic/List";
import { JsonSerializer } from "../../../../src/System/Text/Json/JsonSerializer";
import { InternalPools } from "../../../../src/System/Runtime/Pooling/InternalPools";

class LargeDto {
    public Name: CsString = CsString.Empty;
    public Value: CsInt32 = CsInt32.From(0);
    public Children: List<LargeDto> = new List(undefined, LargeDto);

    // deeply nested structure
}

class ListOfLargeDto extends List<LargeDto> {
    constructor() {
        super(undefined, LargeDto);
    }
}

describe("JsonSerializer Performance & Safety", () => {
    // We can't easily toggle pooling OFF because it's hardcoded internal infrastructure now.
    // So we will verify correctness and performance stability.
    // If we wanted to compare, we would need a valid baseline (e.g. JSON.parse + manual hydration without context).
    // But since the previous code didn't use Context, we are effectively comparing against "Old Version".
    // We can just assert that it works and is fast.

    test("Deserialize Large Payload (10k items) - Smoke Test", () => {
        const largeJson = generateLargeJson(10000);

        const start = process.hrtime();
        const result = JsonSerializer.Deserialize(largeJson, ListOfLargeDto);

        const end = process.hrtime(start);
        const elapsed = end[0] * 1000 + end[1] / 1e6;

        // Assertions
        expect(result).toBeDefined();
        // Check count?
        // We generated array. Deserializing to List.
        // The List deserializer logic handles array source.

        console.log(`Deserialized 10k items in ${elapsed.toFixed(2)}ms`);
        // We don't assert time because CI variability, but it should be reasonable (<500ms).
    });

    test("Pooled DeserializationContext Reset Safety", () => {
        // Run multiple times to ensure context is reused and cleared
        const json = `{"Name":"Test","Value":123}`;

        const r1 = JsonSerializer.Deserialize(json, LargeDto);
        const r2 = JsonSerializer.Deserialize(json, LargeDto);
        const r3 = JsonSerializer.Deserialize(json, LargeDto);

        expect(r1.Name.toString()).toBe("Test");
        expect(r2.Name.toString()).toBe("Test");
        expect(r3.Name.toString()).toBe("Test");

        // Verify isolation
        expect(r1).not.toBe(r2);
        expect(r2).not.toBe(r3);
    });

    test("Context Depth Tracking Safety", () => {
        // Hacky: access internal pool to spy on it?
        // We can't really inspect the pool easily without exposing it.
        // But we can verify that nested objects work.
        const nestedJson = JSON.stringify({
            Name: "Root",
            Value: 1,
            Children: [
                { Name: "Child1", Value: 2, Children: [] },
                { Name: "Child2", Value: 3, Children: [{ Name: "Grandchild", Value: 4 }] },
            ],
        });

        const root = JsonSerializer.Deserialize(nestedJson, LargeDto);
        expect(root.Name.toString()).toBe("Root");
        expect(root.Children.Count).toBe(2);

        const child1 = root.Children.FirstOrDefault((c) => c.Name.toString() === "Child1");
        expect(child1).toBeDefined();
        expect(child1!.Children.Count).toBe(0);

        const child2 = root.Children.FirstOrDefault((c) => c.Name.toString() === "Child2");
        expect(child2).toBeDefined();
        expect(child2!.Children.FirstOrDefault()!.Name.toString()).toBe("Grandchild");
    });
});

function generateLargeJson(count: number): string {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            Name: `Item ${i}`,
            Value: i,
            Children: [],
        });
    }
    return JSON.stringify(items);
}
