import { CsByte } from '../../../src/Domain/ValueObjects/CsByte';

describe('System.Byte (CsByte)', () => {
    test('Boundary Checks', () => {
        expect(new CsByte(0).Value).toBe(0);
        expect(new CsByte(255).Value).toBe(255);
    });

    test('Overflow Checks', () => {
        expect(() => new CsByte(-1)).toThrow();
        expect(() => new CsByte(256)).toThrow();
    });

    test('Truncation Checks', () => {
        expect(new CsByte(10.5).Value).toBe(10);
        expect(new CsByte(255.99).Value).toBe(255);
        // 256.1 truncates to 256 -> throws
        expect(() => new CsByte(256.1)).toThrow(); 
    });

    test('Equality Checks', () => {
        const b1 = new CsByte(100);
        const b2 = new CsByte(100);
        const b3 = new CsByte(200);

        expect(b1.Equals(b2)).toBe(true);
        expect(b1.Equals(b3)).toBe(false);
    });

    // Comparison is standard.
    test('Comparison Checks', () => {
        const b1 = new CsByte(50);
        const b2 = new CsByte(100);
        expect(b1.CompareTo(b2)).toBe(-1);
    });
});
