import { CsDouble } from '../../../src/Domain/ValueObjects/CsDouble';

describe('System.Double (CsDouble)', () => {
    test('Precision Wrapper', () => {
        const d = new CsDouble(1.123456789);
        expect(d.Value).toBe(1.123456789); // Full JS number precision
    });

    test('Equality Checks', () => {
        expect(new CsDouble(3.14159).Equals(new CsDouble(3.14159))).toBe(true);
    });
});
