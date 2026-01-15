import { CsByte } from '../../../src/Domain/ValueObjects/CsByte';

describe('System.Byte (CsByte) - Comprehensive Quality Suite', () => {
    
    // 1. Boundary Values
    test('Boundary: MaxValue (255)', () => {
        expect(new CsByte(255).Value).toBe(255);
        expect(CsByte.MaxValue).toBe(255);
    });

    test('Boundary: MinValue (0)', () => {
        expect(new CsByte(0).Value).toBe(0);
        expect(CsByte.MinValue).toBe(0);
    });

    // 2. Strict Range Validation (Throws)
    test('Overflow: > 255 throws Error', () => {
        expect(() => new CsByte(256)).toThrow();
        expect(() => new CsByte(256.1)).toThrow(); // Truncates to 256 -> Throws
    });

    test('Underflow: < 0 throws Error', () => {
        expect(() => new CsByte(-1)).toThrow();
        // -0.1 | 0 === 0. This is valid truncation behavior for this implementation.
        expect(new CsByte(-0.1).Value).toBe(0); 
        expect(() => new CsByte(-1.1)).toThrow(); // Truncates to -1 -> Throws
    });

    // 3. Truncation Logic
    test('Truncation: Postivie Decimal', () => {
        // 10.9 -> 10
        expect(new CsByte(10.9).Value).toBe(10);
    });

    test('Truncation: Boundary Decimal', () => {
        // 255.9 -> 255 (Valid)
        expect(new CsByte(255.9).Value).toBe(255);
    });

    // 4. Equality
    test('Equality: Value-based', () => {
        const a = new CsByte(100);
        const b = new CsByte(100);
        expect(a.Equals(b)).toBe(true);
        expect(a.CompareTo(b)).toBe(0);
    });

    test('Inequality', () => {
        const a = new CsByte(100);
        const b = new CsByte(101);
        expect(a.Equals(b)).toBe(false);
        expect(a.CompareTo(b)).toBe(-1);
    });
});
