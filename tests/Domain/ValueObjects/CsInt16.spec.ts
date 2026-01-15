import { CsInt16 } from '../../../src/Domain/ValueObjects/CsInt16';

describe('System.Int16 (CsInt16)', () => {
    test('Boundary Checks', () => {
        expect(new CsInt16(-32768).Value).toBe(-32768);
        expect(new CsInt16(32767).Value).toBe(32767);
    });

    test('Overflow Checks', () => {
        expect(() => new CsInt16(-32769)).toThrow();
        expect(() => new CsInt16(32768)).toThrow();
    });

    test('Truncation Checks', () => {
        expect(new CsInt16(100.9).Value).toBe(100);
        expect(new CsInt16(-100.9).Value).toBe(-100);
    });

    test('Equality Checks', () => {
        expect(new CsInt16(1234).Equals(new CsInt16(1234))).toBe(true);
        expect(new CsInt16(1).Equals(new CsInt16(2))).toBe(false);
    });
});
