import { IEquatable, IComparable } from "../Domain/Interfaces";
import { CsInt32, CsString } from "../Domain/ValueObjects";

export class Version implements IEquatable<Version>, IComparable<Version> {
    private readonly _major: CsInt32;
    private readonly _minor: CsInt32;
    private readonly _build: CsInt32;
    private readonly _revision: CsInt32;

    public get Major(): CsInt32 {
        return this._major;
    }

    public get Minor(): CsInt32 {
        return this._minor;
    }

    public get Build(): CsInt32 {
        return this._build;
    }

    public get Revision(): CsInt32 {
        return this._revision;
    }

    constructor(major: number, minor: number, build: number = -1, revision: number = -1) {
        if (major < 0) throw new Error("major must be >= 0");
        if (minor < 0) throw new Error("minor must be >= 0");
        if (build < -1) throw new Error("build must be >= -1");
        if (revision < -1) throw new Error("revision must be >= -1");

        this._major = new CsInt32(major);
        this._minor = new CsInt32(minor);
        this._build = new CsInt32(build);
        this._revision = new CsInt32(revision);
    }

    public Equals(other: Version | null): boolean {
        if (other == null) return false;

        return (
            this._major.Equals(other.Major) &&
            this._minor.Equals(other.Minor) &&
            this._build.Equals(other.Build) &&
            this._revision.Equals(other.Revision)
        );
    }

    public CompareTo(other: Version | null): number {
        if (other == null) return 1;

        let res = this._major.CompareTo(other.Major);
        if (res !== 0) return res;

        res = this._minor.CompareTo(other.Minor);
        if (res !== 0) return res;

        res = this._build.CompareTo(other.Build);
        if (res !== 0) return res;

        return this._revision.CompareTo(other.Revision);
    }

    public ToString(): CsString {
        let s = `${this._major.ToString()}.${this._minor.ToString()}`;
        if (this._build.Value !== -1) {
            s += `.${this._build.ToString()}`;
            if (this._revision.Value !== -1) {
                s += `.${this._revision.ToString()}`;
            }
        }
        return new CsString(s);
    }

    public static Parse(input: string): Version {
        const parts = input.split(".");
        if (parts.length < 2 || parts.length > 4) {
            throw new Error("Invalid version string");
        }
        const major = parseInt(parts[0]);
        const minor = parseInt(parts[1]);
        const build = parts.length > 2 ? parseInt(parts[2]) : -1;
        const revision = parts.length > 3 ? parseInt(parts[3]) : -1;

        return new Version(major, minor, build, revision);
    }
}
