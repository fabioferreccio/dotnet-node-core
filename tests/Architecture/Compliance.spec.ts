import * as fs from "fs";
import * as path from "path";
import { CsString } from "../../src/System/Types/CsString";
import { CsInt32 } from "../../src/System/Types/CsInt32";
import { CsBoolean } from "../../src/System/Types/CsBoolean";

describe("Architectural Compliance Check", () => {
    
    test("ARC-001: Domain Purity - src/Domain MUST NOT contain Cs* types", () => {
        const domainPath = path.resolve(__dirname, "../../src/Domain");
        
        function scanDir(dir: string) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (file.match(/^Cs[A-Z].*\.ts$/)) {
                    // Match any file starting with Cs[CapitalLetter].ts
                    // Exceptions could be listed here if valid (none currently)
                    throw new Error(`VIOLATION: Found concrete System Type in Domain: ${fullPath}`);
                }
            }
        }

        scanDir(domainPath);
    });

    test("ARC-002: System Invariants - System Types MUST be structurally immutable (Frozen)", () => {
        // Sample set of types to check
        const instances = [
            CsString.From("test"),
            CsInt32.From(42),
            CsBoolean.From(true)
        ];

        instances.forEach(instance => {
            expect(Object.isFrozen(instance)).toBe(true);
            
            // Behavioral check
            const attemptMutation = () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (instance as any)._value = "should fail";
            };
            
            // In strict mode, assignment to read-only/frozen throws. 
            // Jest runs in strict mode usually.
            try {
                attemptMutation();
            } catch (e) {
                // Expected
                expect(e).toBeTruthy();
                return;
            }
            
            // If explicit throw didn't happen, check if value actually changed (loose mode)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((instance as any)._value).not.toBe("should fail");
        });
    });

    test("ARC-003: System Invariants - CsString (Golden Reference) MUST conform to strict patterns", () => {
         const instance = CsString.From("golden");
         // 1. Prototype must handle toString correctly
         expect(instance.toString()).toBe("golden");
         // 2. Must distinguish Equals vs ===
         expect(instance.Equals(CsString.From("golden"))).toBe(true);
         expect(instance === CsString.From("golden")).toBe(false); 
    });
});
