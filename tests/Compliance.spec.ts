import * as fs from "fs";
import * as path from "path";

describe("Compliance", () => {
    test("package.json should have MIT license", () => {
        const packageJsonPath = path.resolve(__dirname, "../package.json");
        const content = fs.readFileSync(packageJsonPath, "utf-8");
        const json = JSON.parse(content);
        expect(json.license).toBe("MIT");
    });
});
