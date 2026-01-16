import { List } from "../../../../src/System/Collections/Generic/List";
import { CsInt32 } from "../../../../src/System/Types/CsInt32";
import { CsString } from "../../../../src/System/Types/CsString";

describe("System.Collections.Generic.List<T> - Comprehensive", () => {
    test("Constructor: Empty vs Populated", () => {
        const empty = new List<string>();
        expect(empty.Count).toBe(0);

        const populated = new List<string>(["a", "b"]);
        expect(populated.Count).toBe(2);
    });

    test("Add & Count", () => {
        const list = new List<number>();
        list.Add(1);
        expect(list.Count).toBe(1);
    });

    test("Remove: Existing Item", () => {
        const list = new List<string>(["a", "b"]);
        expect(list.Remove("a")).toBe(true);
        expect(list.Count).toBe(1);
    });

    test("Remove: Non-Existing Item (Branch Coverage)", () => {
        const list = new List<string>(["a", "b"]);
        expect(list.Remove("z")).toBe(false); // Hit "return false"
        expect(list.Count).toBe(2);
    });

    test("Contains: Primitives", () => {
        const list = new List<number>([1, 2]);
        expect(list.Contains(1)).toBe(true);
        expect(list.Contains(3)).toBe(false);
    });

    test("Clear", () => {
        const list = new List<number>([1, 2]);
        list.Clear();
        expect(list.Count).toBe(0);
        expect(list.ToArray().length).toBe(0);
    });

    test("ToArray", () => {
        const start = [1, 2];
        const list = new List<number>(start);
        const arr = list.ToArray();
        expect(arr).toEqual(start);
        expect(arr).not.toBe(start); // Should be copy
    });

    test("Where & Select (LINQ)", () => {
        const list = new List<number>([1, 2, 3, 4]);
        const evens = list.Where((x) => x % 2 === 0);
        expect(evens.Count).toBe(2);

        const strings = list.Select((x) => x.toString());
        expect(strings.FirstOrDefault()).toBe("1");
    });

    test("FirstOrDefault", () => {
        const list = new List<number>([1, 2]);
        expect(list.FirstOrDefault()).toBe(1);
        expect(list.FirstOrDefault((x) => x > 5)).toBeNull();

        const empty = new List<number>();
        expect(empty.FirstOrDefault()).toBeNull(); // Empty list case
    });

    test("Iterator", () => {
        const list = new List<number>([1, 2]);
        const result = [];
        for (const item of list) {
            result.push(item);
        }
        expect(result).toEqual([1, 2]);
    });

    test("Equality Support (IEquatable)", () => {
        const v1 = CsInt32.From(10);
        const v2 = CsInt32.From(20);
        const v3 = CsInt32.From(10); // Equal to v1

        const list = new List<CsInt32>();
        list.Add(v1);
        list.Add(v2);

        // Contains using Equals
        expect(list.Contains(v3)).toBe(true);
        expect(list.Contains(CsInt32.From(99))).toBe(false);

        // Remove using Equals
        expect(list.Remove(v3)).toBe(true);
        expect(list.Count).toBe(1);
        expect(list.Contains(v2)).toBe(true);
    });

    test("Mixed Equality Coverage (Line 75 check)", () => {
        // List has an object that is "isEquatable" (CsString)
        // We cheat TS slightly to hold a wrapped object if we want, or just uses CsString.
        // But List<T> enforces T.
        // We know CsString is Equatable.
        // We want to pass a primitive string "a" to Contains/Remove.
        // "a" is NOT Equatable.
        // The list item (CsString) IS Equatable.
        // Logic: if (!isEquatable("a")) -> Loop items. Item is Equatable. -> item.Equals("a").
        // We need an Equatable that returns true when compared to a primitive.
        // CsString implementation: returns this._value === other.toString().
        // If we pass "a" (primitive string), other is "a". .toString() is "a". match!

        // However, we need a list of... something that allows both?
        // Let's use List<any> for this specific coverage test to permit mixing types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mixedList = new List<any>();
        const csStr = CsString.From("test");
        mixedList.Add(csStr);

        // Searching for primitive "test"
        // isEquatable("test") is false.
        // Loop finds csStr. isEquatable(csStr) is true.
        // csStr.Equals("test").
        // CsString.Equals takes CsString. But at runtime, JS allows "test".
        // CsString.Equals implementation: other.toString(). "test".toString() works.
        expect(mixedList.Contains("test")).toBe(true);
    });
});
