import { ObjectPool } from "../../../../src/System/Runtime/Pooling/ObjectPool";

describe("System.Runtime.Pooling.ObjectPool", () => {
    // Helper to track factory/reset calls
    class Tracker {
        public created = 0;
        public reset = 0;
        public items: SimpleItem[] = [];

        public create(): SimpleItem {
            this.created++;
            const item = new SimpleItem(this.created);
            this.items.push(item);
            return item;
        }

        public resetItem(item: SimpleItem): void {
            this.reset++;
            item.clean = true;
        }
    }

    class SimpleItem {
        public id: number;
        public clean: boolean = false;
        constructor(id: number) {
            this.id = id;
        }
    }

    test("Rent: Creates new item when pool empty", () => {
        const tracker = new Tracker();
        const pool = new ObjectPool<SimpleItem>(
            () => tracker.create(),
            (i) => tracker.resetItem(i),
        );

        const item = pool.Rent();
        expect(tracker.created).toBe(1);
        expect(item.id).toBe(1);
        expect(tracker.reset).toBe(0); // Reset not called on rent
    });

    test("Return: Resets item and adds to pool", () => {
        const tracker = new Tracker();
        const pool = new ObjectPool<SimpleItem>(
            () => tracker.create(),
            (i) => tracker.resetItem(i),
        );

        const item = pool.Rent();
        pool.Return(item);

        expect(tracker.reset).toBe(1);
        expect(item.clean).toBe(true);
    });

    test("Rent: Reuses existing item from pool", () => {
        const tracker = new Tracker();
        const pool = new ObjectPool<SimpleItem>(
            () => tracker.create(),
            (i) => tracker.resetItem(i),
        );

        const item1 = pool.Rent();
        pool.Return(item1); // Stack: [item1]

        const item2 = pool.Rent(); // Should be item1
        expect(tracker.created).toBe(1); // No new creation
        expect(item2).toBe(item1);
    });

    test("Capacity: Respects max retained limit", () => {
        const capacity = 2;
        const tracker = new Tracker();
        const pool = new ObjectPool<SimpleItem>(
            () => tracker.create(),
            (i) => tracker.resetItem(i),
            capacity,
        );

        // Rent 3 items
        const i1 = pool.Rent();
        const i2 = pool.Rent();
        const i3 = pool.Rent();

        // Return 3 items
        pool.Return(i1); // Stack: [i1] (Size 1)
        pool.Return(i2); // Stack: [i1, i2] (Size 2 - FULL)
        pool.Return(i3); // Stack: [i1, i2] (Drop i3)

        // Verify drops by Renting again.
        // If i3 was dropped, next rent creates new or pops i2.
        // We expect to pop i2, then i1. Then create new.

        const r1 = pool.Rent(); // i2
        const r2 = pool.Rent(); // i1 (Pool empty now)
        const r3 = pool.Rent(); // New item (i4)

        expect(r1).toBe(i2);
        expect(r2).toBe(i1);
        expect(tracker.created).toBe(4); // 3 original + 1 new (because i3 was dropped)
    });

    test("Branch Coverage: Partial fill logic", () => {
        // Rent 2, Return 1. Pool is not empty, but not full.
        const pool = new ObjectPool<SimpleItem>(
            () => new SimpleItem(0),
            () => {},
        );
        const i1 = pool.Rent();
        const i2 = pool.Rent();
        pool.Return(i1);

        const r1 = pool.Rent();
        expect(r1).toBe(i1);
    });
});
