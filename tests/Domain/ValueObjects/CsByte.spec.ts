import { CsByte } from '../../../src/Domain/ValueObjects/CsByte';

describe('System.Byte (CsByte) - Comprehensive', () => {
    
    // Bounds & Construction
    test('Boundary: 0 to 255', () => {
        expect(new CsByte(0).Value).toBe(0);
        expect(new CsByte(255).Value).toBe(255);
        expect(CsByte.MinValue).toBe(0);
        expect(CsByte.MaxValue).toBe(255);
    });

    test('Overflow/Underflow Throws', () => {
        expect(() => new CsByte(256)).toThrow();
        expect(() => new CsByte(-1)).toThrow();
        expect(() => new CsByte(256.1)).toThrow(); 
    });

    test('Truncation', () => {
        expect(new CsByte(10.9).Value).toBe(10);
        // Valid negative decimal truncation: -0.1 | 0 === 0
        expect(new CsByte(-0.1).Value).toBe(0);
    });

    // Equality
    test('Equals', () => {
        const a = new CsByte(100);
        expect(a.Equals(new CsByte(100))).toBe(true);
        expect(a.Equals(new CsByte(50))).toBe(false);
        // Cover "if (!other) return false"
        expect(a.Equals(null as any)).toBe(false);
    });

    // Comparison
    test('CompareTo', () => {
        const a = new CsByte(10);
        expect(a.CompareTo(new CsByte(20))).toBe(-1);
        expect(a.CompareTo(new CsByte(5))).toBe(1);
        expect(a.CompareTo(new CsByte(10))).toBe(0);
        // Cover "if (!other) return 1"
        expect(a.CompareTo(null)).toBe(1);
    });

    // ToString
    test('ToString', () => {
        expect(new CsByte(128).ToString()).toBe("128");
    });
});
