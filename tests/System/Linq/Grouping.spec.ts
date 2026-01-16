import { Enumerable } from "../../../src/System/Linq/Enumerable";
import { List } from "../../../src/System/Collections/Generic/List";
import { CsString } from "../../../src/System/Types/CsString";
import { IGrouping } from "../../../src/Domain/Interfaces/IGrouping";

import { Lookup } from "../../../src/System/Linq/Lookup";

describe("System.Linq.Grouping", () => {
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Enumerable.registerListFactory((source) => new List(source as any));
        Enumerable.registerLookupFactory(() => new Lookup());
    });

    test("GroupBy: Primitive Key", () => {
        const list = ["apple", "banana", "apricot", "blueberry", "cherry"];
        // Group by first letter
        const groups = Enumerable.From(list)
            .GroupBy((x: string) => x[0])
            .ToList(); // Immediate

        expect(groups.Count).toBe(3); // a, b, c

        // Find group 'a'
        const gA = groups.FirstOrDefault((g: IGrouping<string, string>) => g.Key === "a");
        expect(gA).not.toBeNull();
        expect(gA!.Count(undefined)).toBe(2); // apple, apricot
    });

    test("GroupBy: ValueObject Key (Equality Check)", () => {
        // Critical Test: Grouping must use .Equals() for keys
        const k1a = CsString.From("Key1");
        const k1b = CsString.From("Key1"); // Different instance, same value
        const k2 = CsString.From("Key2");

        const list = [
            { id: 1, key: k1a },
            { id: 2, key: k2 },
            { id: 3, key: k1b },
        ];

        const groups = Enumerable.From(list)
            .GroupBy((x: { id: number; key: CsString }) => x.key)
            .ToList();

        // Should be 2 groups, not 3.
        expect(groups.Count).toBe(2);

        const g1 = groups.FirstOrDefault(
            (g: IGrouping<CsString, { id: number; key: CsString }>) => g.Key.toString() === "Key1",
        );
        expect(g1).not.toBeNull();
        expect(g1!.Count(undefined)).toBe(2); // id 1 and 3
    });
});
