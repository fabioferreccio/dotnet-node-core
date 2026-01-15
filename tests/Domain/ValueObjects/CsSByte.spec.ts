import { CsSByte } from '../../../src/Domain/ValueObjects/CsSByte';

describe('System.SByte (CsSByte)', () => {
    test('Boundary Checks', () => {
        expect(new CsSByte(-128).Value).toBe(-128);
        expect(new CsSByte(127).Value).toBe(127);
    });

    test('Overflow Checks', () => {
        expect(() => new CsSByte(-129)).toThrow();
        expect(() => new CsSByte(128)).toThrow();
    });

    test('Truncation Checks', () => {
        expect(new CsSByte(10.5).Value).toBe(10);
        expect(new CsSByte(-10.5).Value).toBe(-10);
    });

    test('Equality Checks', () => {
        const b1 = new CsSByte(100);
        const b2 = new CsSByte(100);
        const b3 = new CsSByte(50);

        expect(b1.Equals(b2)).toBe(true);
        expect(b1.Equals(b3)).toBe(false);
    });

    test('Comparison Checks', () => {
        const b1 = new CsSByte(-50);
        const b2 = new CsSByte(50);
        expect(b1.CompareTo(b2)).toBe(-1);
        expect(b2.CompareTo(b1)).toBe(1);
    });
});
