import { CsInt32 } from '../../../src/Domain/ValueObjects/CsInt32';

describe('System.Int32 (CsInt32) - Comprehensive Quality Suite', () => {
    
    // 1. Boundary Values
    test('Boundary: MaxValue (2,147,483,647)', () => {
        expect(new CsInt32(2147483647).Value).toBe(2147483647);
        expect(CsInt32.MaxValue).toBe(2147483647);
    });

    test('Boundary: MinValue (-2,147,483,648)', () => {
        // Note: In Javascript bitwise ops, -2147483648 | 0 is valid.
        expect(new CsInt32(-2147483648).Value).toBe(-2147483648);
        expect(CsInt32.MinValue).toBe(-2147483648);
    });

    // 2. Truncation Logic
    test('Truncation: Postivie Decimal', () => {
        expect(new CsInt32(5.99).Value).toBe(5);
    });

    test('Truncation: Negative Decimal', () => {
        expect(new CsInt32(-5.99).Value).toBe(-5);
    });

    // 3. Overflow Behavior (Javascript 32-bit Logic)
    test('Overflow: JavaScript Bitwise Wrap-Around', () => {
        // In this specific implementation, we use `value | 0`.
        // This causes numbers larger than 32-bit integer range to wrap around.
        // C# would typically check constants, but here we are validating the JS-based implementation behavior.
        // 2147483648 | 0 becomes -2147483648.
        const overflow = new CsInt32(2147483648);
        expect(overflow.Value).toBe(-2147483648); 
    });

    // 4. Immutability & Math
    test('Math: Add returns NEW instance', () => {
        const a = new CsInt32(5);
        const b = new CsInt32(10);
        const result = a.Add(b);

        expect(result).not.toBe(a); // Ref check
        expect(result.Value).toBe(15);
        expect(a.Value).toBe(5); // Original unchanged
    });

    test('Math: Subtract returns NEW instance', () => {
        expect(new CsInt32(10).Subtract(new CsInt32(4)).Value).toBe(6);
    });

     test('Math: Multiply returns NEW instance', () => {
        expect(new CsInt32(10).Multiply(new CsInt32(2)).Value).toBe(20);
    });

    test('Math: Divide returns NEW instance (Truncated)', () => {
        // 10 / 3 = 3.33 -> 3
        expect(new CsInt32(10).Divide(new CsInt32(3)).Value).toBe(3);
    });

    // 5. Equality
    test('Equality: Value-based', () => {
        const a = new CsInt32(12345);
        const b = new CsInt32(12345);
        expect(a.Equals(b)).toBe(true);
        expect(a.CompareTo(b)).toBe(0);
    });
});
