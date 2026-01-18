import { List } from "../../../src/System/Collections/Generic/List";
import { Dictionary } from "../../../src/System/Collections/Generic/Dictionary";
import { CsString } from "../../../src/System/Types/CsString";
import { CsGuid } from "../../../src/System/Types/CsGuid";

describe("Performance & Correctness Verification", () => {
    describe("List<T>", () => {
        test("Add should handle growth correctly and count accurately", () => {
            const list = new List<number>();
            const count = 1000;

            for (let i = 0; i < count; i++) {
                list.Add(i);
            }

            expect(list.Count).toBe(count);

            // Check content
            const array = list.ToArray();
            expect(array.length).toBe(count);
            expect(array[0]).toBe(0);
            expect(array[count - 1]).toBe(count - 1);
        });

        test("Clear should reset Count but allow subsequent Adds", () => {
            const list = new List<number>();
            list.Add(1);
            list.Add(2);
            expect(list.Count).toBe(2);

            list.Clear();
            expect(list.Count).toBe(0);
            expect(list.ToArray()).toEqual([]);

            list.Add(3);
            expect(list.Count).toBe(1);
            expect(list.ToArray()).toEqual([3]);
        });

        test("Iteration should work correctly after Clear and reuse (Zombie Data Check)", () => {
            const list = new List<number>();
            list.Add(10);
            list.Add(20);
            list.Clear();
            list.Add(30);

            let iterations = 0;
            const values: number[] = [];
            for (const item of list) {
                values.push(item);
                iterations++;
            }

            expect(iterations).toBe(1);
            expect(values).toEqual([30]);
        });

        test("ToArray should trim correctly", () => {
            const list = new List<number>();
            list.Add(1);
            list.Clear(); // Internal buffer might still have 1
            list.Add(2);

            const arr = list.ToArray();
            expect(arr.length).toBe(1);
            expect(arr[0]).toBe(2);
        });

        test("Where/Select should work correctly", () => {
            const list = new List<number>();
            list.Add(1);
            list.Add(2);
            list.Add(3);

            const even = list.Where((x) => x % 2 === 0);
            expect(even.Count).toBe(1);
            expect(even.ToArray()[0]).toBe(2);

            const doubled = list.Select((x) => x * 2);
            expect(doubled.ToArray()).toEqual([2, 4, 6]);
        });
    });

    describe("Dictionary<TKey, TValue>", () => {
        test("Add and Get should work with CsString keys", () => {
            const dict = new Dictionary(CsString, CsString);
            const key = CsString.From("test");
            const val = CsString.From("value");

            dict.Add(key, val);
            expect(dict.Get(key)).toBe(val);
        });

        test("Add and Get should work with CsGuid keys", () => {
            const dict = new Dictionary(CsGuid, CsString);
            const key = CsGuid.NewGuid();
            const val = CsString.From("guid-val");

            dict.Add(key, val);
            expect(dict.Get(key)).toBe(val);
        });

        test("Iteration should yield correct key instances (Reference or Value Equality)", () => {
            const dict = new Dictionary(CsString, CsString);
            const keyStr = "unique-key";
            const key = CsString.From(keyStr);
            const val = CsString.From("value");

            dict.Add(key, val);

            let seen = 0;
            for (const [k, v] of dict) {
                seen++;
                // Verify we get a valid key back
                expect(k).toBeInstanceOf(CsString);
                expect(k.toString()).toBe(keyStr);
                expect(v).toBe(val);

                // If we implemented internal caching, k might strictly be 'key' if strictly equal.
                // If we reconstruct, it might be a new instance but equal value.
                // Optimizations aim to return ORIGINAL key if possible.
            }
            expect(seen).toBe(1);
        });

        test("Reusing Dict should work (if Clear existed, but it assumes fresh instance for now)", () => {
            // Dictionary doesn't have Clear in the provided interface,
            // but we ensure basic stability.
            const dict = new Dictionary(CsString, CsString);
            expect(() => dict.Add(CsString.From("a"), CsString.From("b"))).not.toThrow();
            expect(() => dict.Add(CsString.From("a"), CsString.From("c"))).toThrow(); // Duplicate
        });
    });
});
